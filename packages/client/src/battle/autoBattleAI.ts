import { getTemplate, SKILLS, getTypeEffectiveness, getSkillMultiplierBonus, getEffectiveStats, EFFECT_REGISTRY } from '@gatchamon/shared';
import type { BattleState, BattleMon, PokemonType, BaseStats, SkillEffect, EffectId } from '@gatchamon/shared';

export interface AutoAction {
  skillId: string;
  targetId: string;
}

export function estimateDamage(
  attackerStats: BaseStats,
  defenderStats: BaseStats,
  skill: { multiplier: number; type: PokemonType },
  attackerTypes: PokemonType[],
  defenderTypes: PokemonType[],
): number {
  if (skill.multiplier === 0) return 0;

  const baseDmg = attackerStats.atk * skill.multiplier * (100 / (100 + defenderStats.def));
  const stabBonus = attackerTypes.includes(skill.type) ? 1.5 : 1.0;
  const typeEff = getTypeEffectiveness(skill.type, defenderTypes);
  const expectedCrit = 1 + (attackerStats.critRate / 100) * (attackerStats.critDmg / 100 - 1);

  return Math.max(1, baseDmg * stabBonus * typeEff * expectedCrit);
}

export function resolveEffectId(eff: SkillEffect): EffectId {
  if (eff.id) return eff.id;
  // Legacy mapping
  switch (eff.type) {
    case 'buff': return 'atk_buff';
    case 'debuff': return 'atk_break';
    case 'dot': return 'poison';
    case 'stun': return 'freeze';
    case 'heal': return 'heal';
    default: return 'atk_buff';
  }
}

export function scoreEffects(
  effects: SkillEffect[],
  actor: BattleMon,
  target: BattleMon,
): number {
  let score = 0;
  for (const eff of effects) {
    const proc = eff.chance / 100;
    const effectId = resolveEffectId(eff);
    const meta = EFFECT_REGISTRY[effectId];
    if (!meta) continue;

    switch (meta.category) {
      case 'status':
        // CC effects are very valuable
        if (meta.cc === 'stun') score += 300 * proc;
        else if (meta.cc === 'conditional') score += 200 * proc;
        // DoTs
        if (meta.dot) score += target.maxHp * (meta.dot.percentHp / 100) * eff.duration * proc;
        break;
      case 'debuff':
        // Stat debuffs
        if (meta.statMod) score += Math.abs(meta.statMod.percent) * eff.duration * proc;
        // Special debuffs
        if (effectId === 'def_break') score += 400 * proc;
        else if (effectId === 'silence') score += 250 * proc;
        else if (effectId === 'provoke') score += 200 * proc;
        else if (effectId === 'brand') score += 150 * proc;
        else if (effectId === 'strip') score += 300 * proc;
        else score += 100 * eff.duration * proc;
        break;
      case 'buff':
        if (effectId === 'immunity') score += 350 * proc;
        else if (effectId === 'invincibility') score += 400 * proc;
        else if (effectId === 'shield') score += eff.value * proc;
        else if (meta.statMod) score += meta.statMod.percent * eff.duration * proc;
        else score += 100 * eff.duration * proc;
        break;
      case 'instant':
        if (effectId === 'heal') {
          const missingRatio = 1 - actor.currentHp / actor.maxHp;
          const healAmt = actor.maxHp * (eff.value / 100);
          score += missingRatio * healAmt * 2 * proc;
        } else if (effectId === 'atb_boost') score += 150 * proc;
        else if (effectId === 'atb_reduce') score += 150 * proc;
        else if (effectId === 'cleanse') score += 200 * proc;
        else if (effectId === 'cd_reset') score += 300 * proc;
        else if (effectId === 'cd_reduce') score += 200 * proc;
        break;
    }
  }
  return score;
}

export function pickBestAction(actor: BattleMon, state: BattleState): AutoAction | null {
  const template = getTemplate(actor.templateId);
  if (!template) return null;

  const attackerTypes = template.types as PokemonType[];
  const attackerStats = getEffectiveStats(actor);

  const availableSkills = template.skillIds
    .map(id => SKILLS[id])
    .filter(s => s && s.category !== 'passive' && (actor.skillCooldowns[s.id] ?? 0) === 0);

  if (availableSkills.length === 0) {
    // All skills on cooldown — fallback to first non-passive skill
    const fallbackSkill = template.skillIds
      .map(id => SKILLS[id])
      .find(s => s && s.category !== 'passive');
    const firstEnemy = state.enemyTeam.find(e => e.isAlive);
    if (fallbackSkill && firstEnemy) {
      return { skillId: fallbackSkill.id, targetId: firstEnemy.instanceId };
    }
    return null;
  }

  let bestScore = -Infinity;
  let bestAction: AutoAction | null = null;

  for (const rawSkill of availableSkills) {
    // Apply skill level bonus to multiplier
    const skillIndex = template.skillIds.indexOf(rawSkill.id);
    const skillLevel = actor.skillLevels?.[skillIndex] ?? 1;
    const levelBonus = getSkillMultiplierBonus(skillLevel);
    const skill = rawSkill.multiplier > 0
      ? { ...rawSkill, multiplier: rawSkill.multiplier * levelBonus }
      : rawSkill;

    // Prefer active skills over basic attacks — basic is a last resort
    const categoryBonus = skill.category === 'basic' ? 0 : 50;

    if (skill.target === 'self' || skill.target === 'single_ally' || skill.target === 'all_allies') {
      const score = scoreEffects(skill.effects, actor, actor) + categoryBonus;
      if (score > bestScore) {
        bestScore = score;
        bestAction = { skillId: skill.id, targetId: actor.instanceId };
      }
    } else if (skill.target === 'single_enemy') {
      for (const enemy of state.enemyTeam.filter(e => e.isAlive)) {
        const enemyTemplate = getTemplate(enemy.templateId);
        if (!enemyTemplate) continue;
        const defenderTypes = enemyTemplate.types as PokemonType[];
        const defenderStats = getEffectiveStats(enemy);

        const dmg = estimateDamage(attackerStats, defenderStats, skill, attackerTypes, defenderTypes);
        const killBonus = dmg >= enemy.currentHp ? 200 : 0;
        const effectBonus = scoreEffects(skill.effects, actor, enemy);
        const score = dmg + killBonus + effectBonus + categoryBonus;

        if (score > bestScore) {
          bestScore = score;
          bestAction = { skillId: skill.id, targetId: enemy.instanceId };
        }
      }
    } else if (skill.target === 'all_enemies') {
      const aliveEnemies = state.enemyTeam.filter(e => e.isAlive);
      let totalScore = 0;
      for (const enemy of aliveEnemies) {
        const enemyTemplate = getTemplate(enemy.templateId);
        if (!enemyTemplate) continue;
        const defenderTypes = enemyTemplate.types as PokemonType[];
        const defenderStats = getEffectiveStats(enemy);

        const dmg = estimateDamage(attackerStats, defenderStats, skill, attackerTypes, defenderTypes);
        const killBonus = dmg >= enemy.currentHp ? 200 : 0;
        const effectBonus = scoreEffects(skill.effects, actor, enemy);
        totalScore += dmg + killBonus + effectBonus;
      }
      if (totalScore + categoryBonus > bestScore && aliveEnemies.length > 0) {
        bestScore = totalScore + categoryBonus;
        bestAction = { skillId: skill.id, targetId: aliveEnemies[0].instanceId };
      }
    }
  }

  return bestAction;
}
