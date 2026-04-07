import { describe, it, expect } from 'vitest';
import {
  isMaxLevel,
  computeStats,
  xpToNextLevel,
  xpPerEnemy,
  MAX_LEVEL_BY_STARS,
  STAR_MULTIPLIERS,
  getMaxEnergy,
  BASE_MAX_ENERGY,
  getEnergyRegenInterval,
  BASE_ENERGY_REGEN_INTERVAL_MS,
  trainerXpToNextLevel,
  calculateFodderXp,
  getSkillMultiplierBonus,
  getSkillCooldownReduction,
  getSkillChanceBonus,
  getRequiredFodderCount,
  canStarEvolve,
  defaultTrainerSkills,
  getCurrentTowerResetDate,
  shouldResetTower,
} from './formulas.js';
import type { PokemonTemplate } from '../types/pokemon.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_TEMPLATE = {
  baseStats: { hp: 100, atk: 50, def: 50, spd: 100, critRate: 15, critDmg: 150, acc: 50, res: 50 },
} as PokemonTemplate;

// ---------------------------------------------------------------------------
// isMaxLevel
// ---------------------------------------------------------------------------

describe('isMaxLevel', () => {
  it('returns true at max level for each star tier', () => {
    for (const [stars, maxLvl] of Object.entries(MAX_LEVEL_BY_STARS)) {
      expect(isMaxLevel(maxLvl, Number(stars))).toBe(true);
    }
  });

  it('returns false below max level', () => {
    expect(isMaxLevel(19, 1)).toBe(false);
    expect(isMaxLevel(49, 5)).toBe(false);
  });

  it('returns true above max level', () => {
    expect(isMaxLevel(21, 1)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// computeStats
// ---------------------------------------------------------------------------

describe('computeStats', () => {
  it('returns base stats at level 1, star 1', () => {
    const stats = computeStats(MOCK_TEMPLATE, 1, 1);
    // At level 1: levelMult = 1, starMult = 1.0
    expect(stats.hp).toBe(100);
    expect(stats.atk).toBe(50);
    expect(stats.def).toBe(50);
  });

  it('scales with star multiplier', () => {
    const stats1 = computeStats(MOCK_TEMPLATE, 1, 1);
    const stats3 = computeStats(MOCK_TEMPLATE, 1, 3);
    expect(stats3.hp).toBeGreaterThan(stats1.hp);
    expect(stats3.hp).toBe(Math.floor(100 * STAR_MULTIPLIERS[3]));
  });

  it('scales with level', () => {
    const stats1 = computeStats(MOCK_TEMPLATE, 1, 1);
    const stats10 = computeStats(MOCK_TEMPLATE, 10, 1);
    expect(stats10.hp).toBeGreaterThan(stats1.hp);
  });

  it('preserves spd, critRate, critDmg, acc, res unchanged', () => {
    const stats = computeStats(MOCK_TEMPLATE, 30, 5);
    expect(stats.spd).toBe(100);
    expect(stats.critRate).toBe(15);
    expect(stats.critDmg).toBe(150);
    expect(stats.acc).toBe(50);
    expect(stats.res).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// XP formulas
// ---------------------------------------------------------------------------

describe('xpToNextLevel', () => {
  it('scales linearly with level', () => {
    expect(xpToNextLevel(1)).toBe(100);
    expect(xpToNextLevel(10)).toBe(1000);
    expect(xpToNextLevel(50)).toBe(5000);
  });
});

describe('xpPerEnemy', () => {
  it('returns 10x enemy level', () => {
    expect(xpPerEnemy(5)).toBe(50);
    expect(xpPerEnemy(20)).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Energy
// ---------------------------------------------------------------------------

describe('getMaxEnergy', () => {
  it('returns base energy at skill level 0', () => {
    const skills = defaultTrainerSkills();
    expect(getMaxEnergy(skills)).toBe(BASE_MAX_ENERGY);
  });

  it('adds 10 per skill level', () => {
    const skills = { ...defaultTrainerSkills(), maxEnergyPool: 5 };
    expect(getMaxEnergy(skills)).toBe(BASE_MAX_ENERGY + 50);
  });
});

describe('getEnergyRegenInterval', () => {
  it('returns base interval at skill level 0', () => {
    const skills = defaultTrainerSkills();
    expect(getEnergyRegenInterval(skills)).toBe(BASE_ENERGY_REGEN_INTERVAL_MS);
  });

  it('decreases with higher skill level', () => {
    const skills0 = defaultTrainerSkills();
    const skills5 = { ...defaultTrainerSkills(), energyRegenSpeed: 5 };
    expect(getEnergyRegenInterval(skills5)).toBeLessThan(getEnergyRegenInterval(skills0));
  });
});

// ---------------------------------------------------------------------------
// Trainer XP
// ---------------------------------------------------------------------------

describe('trainerXpToNextLevel', () => {
  it('returns 150 at level 1', () => {
    expect(trainerXpToNextLevel(1)).toBe(150);
  });

  it('increases with level', () => {
    expect(trainerXpToNextLevel(10)).toBeGreaterThan(trainerXpToNextLevel(5));
  });
});

// ---------------------------------------------------------------------------
// Altar / Fodder
// ---------------------------------------------------------------------------

describe('calculateFodderXp', () => {
  it('returns level * 150 for 1-star fodder', () => {
    expect(calculateFodderXp(10, 1)).toBe(1500);
  });

  it('multiplies by star factor', () => {
    expect(calculateFodderXp(10, 3)).toBe(10 * 150 * 4);
  });
});

describe('getSkillMultiplierBonus', () => {
  it('returns 1.0 at skill level 1', () => {
    expect(getSkillMultiplierBonus(1)).toBe(1);
  });

  it('increases by 0.15 per level', () => {
    expect(getSkillMultiplierBonus(3)).toBeCloseTo(1.3, 5);
  });
});

describe('getSkillCooldownReduction', () => {
  it('returns 1 for active skills at max level', () => {
    expect(getSkillCooldownReduction(5, 'active')).toBe(1);
  });

  it('returns 0 for passive skills', () => {
    expect(getSkillCooldownReduction(5, 'passive')).toBe(0);
  });

  it('returns 0 below max level', () => {
    expect(getSkillCooldownReduction(4, 'active')).toBe(0);
  });
});

describe('getSkillChanceBonus', () => {
  it('returns 0 at skill level 1', () => {
    expect(getSkillChanceBonus(1)).toBe(0);
  });

  it('returns 5 per level above 1', () => {
    expect(getSkillChanceBonus(3)).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Star evolution
// ---------------------------------------------------------------------------

describe('canStarEvolve', () => {
  it('returns false if already at 6 stars', () => {
    expect(canStarEvolve(60, 6, [6, 6, 6, 6, 6, 6])).toBe(false);
  });

  it('returns false if base is not at max level', () => {
    expect(canStarEvolve(10, 3, [3, 3, 3])).toBe(false);
  });

  it('returns true with correct fodder', () => {
    // 3-star at max level (30), needs 3 fodder of same stars
    expect(canStarEvolve(30, 3, [3, 3, 3])).toBe(true);
  });

  it('returns false with insufficient fodder', () => {
    expect(canStarEvolve(30, 3, [3, 3])).toBe(false);
  });

  it('returns false with wrong star fodder', () => {
    expect(canStarEvolve(30, 3, [2, 2, 2])).toBe(false);
  });
});

describe('getRequiredFodderCount', () => {
  it('returns stars as count', () => {
    expect(getRequiredFodderCount(3)).toBe(3);
    expect(getRequiredFodderCount(5)).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Tower reset
// ---------------------------------------------------------------------------

describe('getCurrentTowerResetDate', () => {
  it('returns 1st when before 15th', () => {
    const d = new Date(Date.UTC(2026, 3, 7));
    expect(getCurrentTowerResetDate(d)).toBe(new Date(Date.UTC(2026, 3, 1)).toISOString());
  });

  it('returns 15th when on or after 15th', () => {
    const d = new Date(Date.UTC(2026, 3, 15));
    expect(getCurrentTowerResetDate(d)).toBe(new Date(Date.UTC(2026, 3, 15)).toISOString());
  });
});

describe('shouldResetTower', () => {
  it('returns true if no reset date set', () => {
    expect(shouldResetTower(undefined)).toBe(true);
  });

  it('returns false if reset date matches current boundary', () => {
    const now = new Date(Date.UTC(2026, 3, 7));
    const boundary = getCurrentTowerResetDate(now);
    expect(shouldResetTower(boundary, now)).toBe(false);
  });

  it('returns true if reset date is before current boundary', () => {
    const now = new Date(Date.UTC(2026, 3, 16));
    const oldBoundary = new Date(Date.UTC(2026, 3, 1)).toISOString();
    expect(shouldResetTower(oldBoundary, now)).toBe(true);
  });
});
