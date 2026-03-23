import type { BaseStats, PokemonTemplate, SkillDefinition } from '../types/pokemon.js';
import { getTypeEffectiveness } from './type-chart.js';

const STAR_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.15,
  3: 1.3,
  4: 1.5,
  5: 1.75,
  6: 2.0,
};

export const MAX_LEVEL_BY_STARS: Record<number, number> = {
  1: 20,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
  6: 60,
};

export function isMaxLevel(level: number, stars: number): boolean {
  return level >= (MAX_LEVEL_BY_STARS[stars] ?? 99);
}

export function computeStats(template: PokemonTemplate, level: number, stars: number): BaseStats {
  const starMult = STAR_MULTIPLIERS[stars] ?? 1.0;
  const levelMult = 1 + (level - 1) * 0.05;

  return {
    hp: Math.floor(template.baseStats.hp * levelMult * starMult),
    atk: Math.floor(template.baseStats.atk * levelMult * starMult),
    def: Math.floor(template.baseStats.def * levelMult * starMult),
    spd: Math.floor(template.baseStats.spd * levelMult * starMult),
    critRate: template.baseStats.critRate,
    critDmg: template.baseStats.critDmg,
    acc: template.baseStats.acc,
    res: template.baseStats.res,
  };
}

export function xpToNextLevel(level: number): number {
  return level * 100;
}

export function xpPerEnemy(enemyLevel: number): number {
  return enemyLevel * 10;
}

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  effectiveness: number;
}

export function calculateDamage(
  attackerStats: BaseStats,
  defenderStats: BaseStats,
  skill: SkillDefinition,
  attackerTypes: string[],
  defenderTypes: string[],
): DamageResult {
  const baseDamage = attackerStats.atk * skill.multiplier * (100 / (100 + defenderStats.def));

  const isCrit = Math.random() * 100 < attackerStats.critRate;
  const critBonus = isCrit ? attackerStats.critDmg / 100 : 1.0;

  // STAB: Same-Type Attack Bonus
  const hasStab = attackerTypes.includes(skill.type);
  const stabBonus = hasStab ? 1.5 : 1.0;

  const effectiveness = getTypeEffectiveness(
    skill.type as any,
    defenderTypes as any[],
  );

  const variance = 0.95 + Math.random() * 0.1;
  const damage = Math.max(1, Math.floor(baseDamage * critBonus * stabBonus * effectiveness * variance));

  return { damage, isCrit, effectiveness };
}
