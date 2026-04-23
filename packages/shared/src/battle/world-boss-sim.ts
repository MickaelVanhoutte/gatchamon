import type { BattleMon } from '../types/battle.js';
import type { SkillDefinition } from '../types/pokemon.js';
import { calculateDamage } from '../constants/formulas.js';
import type { WorldBossPerMonDamage } from '../types/world-boss.js';
import { getTemplate } from '../data/pokedex/index.js';
import { SKILLS } from '../data/skills/index.js';

export interface SimulateWorldBossAttackArgs {
  attackers: BattleMon[];
  bossSkills: SkillDefinition[];
  boss: BattleMon;
  turns: number;
}

export interface SimulateWorldBossAttackResult {
  totalDamage: number;
  perMon: WorldBossPerMonDamage[];
}

/**
 * Simulate N turns of damage dealt by a team of attackers against the world boss.
 *
 * Simplifications vs. the real engine:
 * - No status effects, passives, buffs, or debuffs.
 * - Boss HP is NOT depleted inside the sim — we only sum damage.
 * - Each attacker cycles through its non-passive skills using baseline cooldowns.
 *
 * Variance still comes from `calculateDamage` (crit rolls + 0.95..1.05 random);
 * over 20 attackers × N turns it averages out.
 */
export function simulateWorldBossAttack(args: SimulateWorldBossAttackArgs): SimulateWorldBossAttackResult {
  const { attackers, boss, turns } = args;
  const perMon = new Map<string, WorldBossPerMonDamage>();
  const bossTemplate = getTemplate(boss.templateId);
  const bossTypes = bossTemplate?.types ?? [];

  // Per-attacker offensive skills (highest multiplier first) + cooldown trackers
  const skillsByAttacker = new Map<string, { skills: SkillDefinition[]; cooldowns: Record<string, number> }>();
  for (const a of attackers) {
    const tpl = getTemplate(a.templateId);
    if (!tpl) continue;
    const offensive = getOffensiveSkillsForTemplate(tpl.skillIds).sort((s1, s2) => s2.multiplier - s1.multiplier);
    if (offensive.length === 0) continue;
    const cds: Record<string, number> = {};
    for (const s of offensive) cds[s.id] = 0;
    skillsByAttacker.set(a.instanceId, { skills: offensive, cooldowns: cds });
  }

  let totalDamage = 0;

  for (let turn = 0; turn < turns; turn++) {
    for (const attacker of attackers) {
      const entry = skillsByAttacker.get(attacker.instanceId);
      if (!entry) continue;
      // Pick the highest-multiplier skill that's off cooldown
      const skill = entry.skills.find(s => entry.cooldowns[s.id] <= 0) ?? entry.skills[entry.skills.length - 1];
      if (!skill) continue;

      const attackerTpl = getTemplate(attacker.templateId);
      if (!attackerTpl) continue;

      const { damage } = calculateDamage(
        attacker.stats,
        boss.stats,
        skill,
        attackerTpl.types,
        bossTypes,
      );

      totalDamage += damage;
      const prev = perMon.get(attacker.instanceId);
      if (prev) {
        prev.damage += damage;
      } else {
        perMon.set(attacker.instanceId, {
          instanceId: attacker.instanceId,
          templateId: attacker.templateId,
          damage,
        });
      }

      // Tick cooldowns & apply the one we just used
      for (const id of Object.keys(entry.cooldowns)) {
        if (entry.cooldowns[id] > 0) entry.cooldowns[id] -= 1;
      }
      entry.cooldowns[skill.id] = skill.cooldown;
    }
  }

  return {
    totalDamage,
    perMon: Array.from(perMon.values()).sort((a, b) => b.damage - a.damage),
  };
}

function getOffensiveSkillsForTemplate(skillIds: readonly string[]): SkillDefinition[] {
  const out: SkillDefinition[] = [];
  for (const id of skillIds) {
    const s = SKILLS[id];
    if (!s) continue;
    if (s.category === 'passive') continue;
    if (s.multiplier <= 0) continue;
    out.push(s);
  }
  return out;
}
