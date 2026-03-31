import type { BaseStats, PokemonTemplate, SkillDefinition } from '../types/pokemon.js';
import type { TrainerSkills } from '../types/player.js';
import { getTypeEffectiveness } from './type-chart.js';

export const STAR_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.2,
  3: 1.45,
  4: 1.75,
  5: 2.1,
  6: 2.5,
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
  const levelMult = 1 + (level - 1) * 0.04 + Math.pow((level - 1) / 50, 2.5) * 3;

  return {
    hp: Math.floor(template.baseStats.hp * levelMult * starMult),
    atk: Math.floor(template.baseStats.atk * levelMult * starMult),
    def: Math.floor(template.baseStats.def * levelMult * starMult),
    spd: template.baseStats.spd,
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

// ── Energy ──────────────────────────────────────────────────────────────

export const BASE_MAX_ENERGY = 100;
export const BASE_ENERGY_REGEN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes per 1 energy

export function getMaxEnergy(skills: TrainerSkills): number {
  return BASE_MAX_ENERGY + skills.maxEnergyPool * 10;
}

export function getEnergyRegenInterval(skills: TrainerSkills): number {
  return Math.floor(BASE_ENERGY_REGEN_INTERVAL_MS * Math.pow(0.9, skills.energyRegenSpeed));
}

// ── Trainer Level ───────────────────────────────────────────────────────

export const MAX_TRAINER_LEVEL = 100;

export function trainerXpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export const TRAINER_SKILL_MAX: Record<keyof TrainerSkills, number> = {
  energyRegenSpeed: 10,
  maxEnergyPool: 10,
  globalAtkBonus: 10,
  globalDefBonus: 10,
  globalHpBonus: 10,
  globalSpdBonus: 10,
  pokedollarBonus: 5,
  xpBonus: 5,
  pokeballBonus: 5,
  essenceBonus: 5,
};

export function defaultTrainerSkills(): TrainerSkills {
  return {
    energyRegenSpeed: 0,
    maxEnergyPool: 0,
    globalAtkBonus: 0,
    globalDefBonus: 0,
    globalHpBonus: 0,
    globalSpdBonus: 0,
    pokedollarBonus: 0,
    xpBonus: 0,
    pokeballBonus: 0,
    essenceBonus: 0,
  };
}

// ── Altar / Power-Up Circle ───────────────────────────────────────────

export const FODDER_XP_STAR_MULTIPLIERS: Record<number, number> = {
  1: 1, 2: 1.5, 3: 2, 4: 3, 5: 5, 6: 8,
};

export const MAX_SKILL_LEVEL = 5;
export const SKILL_LEVEL_MULTIPLIER_BONUS = 0.15;
export const DITTO_TEMPLATE_ID = 132;

export function calculateFodderXp(fodderLevel: number, fodderStars: number): number {
  return Math.floor(fodderLevel * 50 * (FODDER_XP_STAR_MULTIPLIERS[fodderStars] ?? 1));
}

export function getSkillMultiplierBonus(skillLevel: number): number {
  return 1 + (Math.max(1, skillLevel) - 1) * SKILL_LEVEL_MULTIPLIER_BONUS;
}

export function getRequiredFodderCount(baseStars: number): number {
  return baseStars;
}

export function canStarEvolve(
  baseLevel: number,
  baseStars: number,
  fodderStars: number[],
): boolean {
  if (baseStars >= 6) return false;
  if (!isMaxLevel(baseLevel, baseStars)) return false;
  const needed = baseStars;
  if (fodderStars.length < needed) return false;
  const qualifying = fodderStars.filter(s => s === baseStars);
  return qualifying.length >= needed;
}

/**
 * Get the current tower reset boundary date (1st or 15th of the month).
 * Resets happen at 00:00 UTC on the 1st and 15th.
 */
export function getCurrentTowerResetDate(now: Date = new Date()): string {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  // If we're on or after the 15th, the current boundary is the 15th
  // Otherwise, the current boundary is the 1st
  const boundaryDay = day >= 15 ? 15 : 1;
  return new Date(Date.UTC(year, month, boundaryDay)).toISOString();
}

/**
 * Check if the tower should be reset based on the player's last reset date.
 * Returns true if the player's towerResetDate is before the current reset boundary.
 */
export function shouldResetTower(towerResetDate: string | undefined, now: Date = new Date()): boolean {
  const currentBoundary = getCurrentTowerResetDate(now);
  if (!towerResetDate) return true; // Never set = first time, reset
  return new Date(towerResetDate) < new Date(currentBoundary);
}
