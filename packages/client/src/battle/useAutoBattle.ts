import { useState, useEffect, useRef, useCallback } from 'react';
import { POKEDEX, SKILLS, getTypeEffectiveness } from '@gatchamon/shared';
import type { BattleState, BattleMon, PokemonType, BaseStats } from '@gatchamon/shared';

type Phase = 'player_turn' | 'animating' | 'victory' | 'defeat';

interface AutoAction {
  skillId: string;
  targetId: string;
}

function getEffectiveStats(mon: BattleMon): BaseStats {
  const stats = { ...mon.stats };
  for (const buff of mon.buffs) {
    if (buff.stat && buff.stat in stats) {
      (stats as any)[buff.stat] += buff.value;
    }
  }
  for (const debuff of mon.debuffs) {
    if (debuff.stat && debuff.stat in stats) {
      (stats as any)[debuff.stat] += debuff.value;
    }
  }
  stats.hp = Math.max(1, stats.hp);
  stats.atk = Math.max(1, stats.atk);
  stats.def = Math.max(1, stats.def);
  stats.spd = Math.max(1, stats.spd);
  return stats;
}

function estimateDamage(
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

function scoreEffects(
  effects: { type: string; stat?: string; value: number; duration: number; chance: number }[],
  actor: BattleMon,
  target: BattleMon,
): number {
  let score = 0;
  for (const eff of effects) {
    const proc = eff.chance / 100;
    switch (eff.type) {
      case 'stun':
        score += 300 * proc;
        break;
      case 'debuff':
        score += Math.abs(eff.value) * eff.duration * proc;
        break;
      case 'buff':
        score += eff.value * eff.duration * proc;
        break;
      case 'dot':
        score += target.maxHp * (eff.value / 100) * eff.duration * proc;
        break;
      case 'heal': {
        const missingRatio = 1 - actor.currentHp / actor.maxHp;
        const healAmt = actor.maxHp * (eff.value / 100);
        score += missingRatio * healAmt * 2 * proc;
        break;
      }
    }
  }
  return score;
}

function pickBestAction(actor: BattleMon, state: BattleState): AutoAction | null {
  const template = POKEDEX.find(p => p.id === actor.templateId);
  if (!template) return null;

  const attackerTypes = template.types as PokemonType[];
  const attackerStats = getEffectiveStats(actor);

  const availableSkills = template.skillIds
    .map(id => SKILLS[id])
    .filter(s => s && (actor.skillCooldowns[s.id] ?? 0) === 0);

  if (availableSkills.length === 0) return null;

  let bestScore = -Infinity;
  let bestAction: AutoAction | null = null;

  for (const skill of availableSkills) {
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
        const enemyTemplate = POKEDEX.find(p => p.id === enemy.templateId);
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
        const enemyTemplate = POKEDEX.find(p => p.id === enemy.templateId);
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

export function useAutoBattle(
  state: BattleState | null,
  phase: Phase,
  handleAction: (skillId: string, targetId: string) => Promise<void>,
): { isAutoOn: boolean; toggleAuto: () => void } {
  const [isAutoOn, setIsAutoOn] = useState(false);
  const handleActionRef = useRef(handleAction);
  handleActionRef.current = handleAction;

  const toggleAuto = useCallback(() => setIsAutoOn(prev => !prev), []);

  useEffect(() => {
    if (!isAutoOn || phase !== 'player_turn' || !state) return;

    const actor = state.playerTeam.find(m => m.instanceId === state.currentActorId);
    if (!actor || !actor.isAlive || !actor.isPlayerOwned) return;

    const best = pickBestAction(actor, state);
    if (!best) return;

    const timer = setTimeout(() => {
      handleActionRef.current(best.skillId, best.targetId);
    }, 300);

    return () => clearTimeout(timer);
  }, [isAutoOn, phase, state]);

  return { isAutoOn, toggleAuto };
}
