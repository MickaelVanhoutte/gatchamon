import type { MissionReward } from '../types/rewards.js';
import { ACTIVE_POKEDEX } from './gen-filter.js';

export interface TowerFloorDef {
  floor: number;
  enemyLevel: number;
  enemyStars: 1 | 2 | 3 | 4 | 5 | 6;
  enemyCount: number;
  reward: MissionReward;
  energyCost: number;
  statBoost?: number;
  speedBonus?: number;
}

// ---------------------------------------------------------------------------
// Star-based pool config per floor range
// ---------------------------------------------------------------------------

interface FloorStarConfig {
  starRange: [number, number]; // inclusive [min, max] naturalStars
  bossStars?: number;          // forced minimum star for boss slot
}

function getFloorStarConfig(floor: number): FloorStarConfig {
  if (floor <= 10)  return { starRange: [1, 2] };
  if (floor <= 20)  return { starRange: [1, 2] };
  if (floor <= 30)  return { starRange: [2, 3] };
  if (floor <= 40)  return { starRange: [2, 3], bossStars: 3 };
  if (floor <= 50)  return { starRange: [3, 4], bossStars: 4 };
  if (floor <= 60)  return { starRange: [3, 4], bossStars: 4 };
  if (floor <= 70)  return { starRange: [3, 5], bossStars: 5 };
  if (floor <= 80)  return { starRange: [4, 5], bossStars: 5 };
  return { starRange: [4, 5], bossStars: 5 }; // floors 81-100
}

// ---------------------------------------------------------------------------
// Seeded PRNG (DJB2 hash + mulberry32)
// ---------------------------------------------------------------------------

function hashSeed(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash) >>> 0;
}

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Generate enemy team for a tower floor
// ---------------------------------------------------------------------------

// Pre-sorted for deterministic iteration
const SORTED_POKEDEX = [...ACTIVE_POKEDEX].sort((a, b) => a.id - b.id);

export function getTowerEnemyPool(floor: number, resetDate: string): number[] {
  const config = getFloorStarConfig(floor);
  const enemyCount = getEnemyCount(floor);
  const isBossFloor = floor % 10 === 0;

  const candidates = SORTED_POKEDEX.filter(
    p => p.naturalStars >= config.starRange[0] && p.naturalStars <= config.starRange[1],
  );
  if (candidates.length === 0) return [];

  const rng = mulberry32(hashSeed(`${resetDate}:tower:${floor}`));

  const picked: number[] = [];
  const usedTypes = new Map<string, number>();

  // Boss floors: first slot from highest eligible stars
  if (isBossFloor && config.bossStars) {
    const bossPool = candidates.filter(p => p.naturalStars >= config.bossStars!);
    if (bossPool.length > 0) {
      const boss = bossPool[Math.floor(rng() * bossPool.length)];
      picked.push(boss.id);
      boss.types.forEach(t => usedTypes.set(t, (usedTypes.get(t) ?? 0) + 1));
    }
  }

  // Fill remaining slots with type diversity (max 2 of same primary type)
  let attempts = 0;
  while (picked.length < enemyCount && attempts < 200) {
    const candidate = candidates[Math.floor(rng() * candidates.length)];
    attempts++;

    if (picked.includes(candidate.id)) continue;

    const primaryType = candidate.types[0];
    if ((usedTypes.get(primaryType) ?? 0) >= 2) continue;

    picked.push(candidate.id);
    candidate.types.forEach(t => usedTypes.set(t, (usedTypes.get(t) ?? 0) + 1));
  }

  // Fallback if constraints too tight
  while (picked.length < enemyCount) {
    const candidate = candidates[Math.floor(rng() * candidates.length)];
    if (!picked.includes(candidate.id)) {
      picked.push(candidate.id);
    }
  }

  return picked;
}

function getEnemyLevel(floor: number): number {
  // Smooth linear ramp: floor 1 → level 6, floor 100 → level 115
  return Math.floor(5 + floor * 1.1);
}

function getEnemyStars(floor: number): 1 | 2 | 3 | 4 | 5 | 6 {
  if (floor <= 10) return 1;
  if (floor <= 20) return 2;
  if (floor <= 35) return 3;
  if (floor <= 50) return 4;
  if (floor <= 70) return 5;
  return 6;
}

function getStatBoost(floor: number): number | undefined {
  if (floor <= 40) return undefined;
  if (floor <= 60) return 1.15;
  if (floor <= 80) return 1.25;
  if (floor <= 99) return 1.4;
  return 1.6; // Floor 100 boss
}

function getSpeedBonus(floor: number): number {
  if (floor <= 5) return 0;
  // Ramp from 0 at floor 5 to 100 at floor 100
  return Math.floor((floor - 5) * (100 / 95));
}

function getEnemyCount(floor: number): number {
  // Floors 51+: 4 enemies base, 5 on boss floors
  if (floor > 50) {
    return floor % 10 === 0 ? 5 : 4;
  }
  // Floors 1-50: 3 enemies base, 4 on boss floors
  return floor % 10 === 0 ? 4 : 3;
}

function getFloorReward(floor: number): MissionReward {
  // Floor 100: legendary pokeball + stardust milestone
  if (floor === 100) {
    return { legendaryPokeballs: 1, premiumPokeballs: 5, pokedollars: 1000, stardust: 300 };
  }

  // Milestone floors with held items + Ditto (checked before generic 10th-floor)
  if (floor === 25) {
    return {
      regularPokeballs: 5,
      pokedollars: 200,
      heldItem: { setId: 'choice_band', stars: 2 as 1 | 2 | 3 | 4 | 5 | 6, grade: 'rare' },
    };
  }
  if (floor === 50) {
    return {
      premiumPokeballs: 4,
      pokedollars: 400,
      dittos: 1,
      stardust: 100,
      heldItem: { setId: 'swift_wing', stars: 3 as 1 | 2 | 3 | 4 | 5 | 6, grade: 'hero' },
    };
  }
  if (floor === 75) {
    return {
      regularPokeballs: 10,
      pokedollars: 600,
      heldItem: { setId: 'kings_rock', stars: 4 as 1 | 2 | 3 | 4 | 5 | 6, grade: 'hero' },
    };
  }

  // Floor 80: stardust milestone
  if (floor === 80) {
    const premiumCount = 3 + Math.floor(floor / 30);
    return { premiumPokeballs: premiumCount, pokedollars: 100 + floor * 5, stardust: 200 };
  }

  // Floor 90: premium pokeballs + Ditto
  if (floor === 90) {
    return { premiumPokeballs: 6, pokedollars: 550, dittos: 1 };
  }

  // Floor 30: stardust milestone (checked before generic 10th-floor)
  if (floor === 30) {
    const premiumCount = 3 + Math.floor(floor / 30);
    return { premiumPokeballs: premiumCount, pokedollars: 100 + floor * 5, stardust: 50 };
  }

  // Every 10th floor: premium pokeballs (premium scroll)
  if (floor % 10 === 0) {
    const premiumCount = 3 + Math.floor(floor / 30);
    return { premiumPokeballs: premiumCount, pokedollars: 100 + floor * 5 };
  }

  // Every 5th floor (not 10th): essences
  if (floor % 5 === 0) {
    const essences: Record<string, number> = {};
    if (floor <= 30) {
      essences['magic_low'] = 3 + Math.floor(floor / 10);
    } else if (floor <= 60) {
      essences['magic_mid'] = 2 + Math.floor(floor / 20);
    } else {
      essences['magic_high'] = 1 + Math.floor(floor / 40);
    }
    return {
      regularPokeballs: 2 + Math.floor(floor / 15),
      pokedollars: 50 + floor * 5,
      essences,
    };
  }

  // Normal floors: pokeballs + pokedollars
  return {
    regularPokeballs: 2 + Math.floor(floor / 15),
    pokedollars: 50 + floor * 5,
  };
}

function buildTowerFloors(): TowerFloorDef[] {
  const floors: TowerFloorDef[] = [];
  for (let floor = 1; floor <= 100; floor++) {
    const statBoost = getStatBoost(floor);
    const speedBonus = getSpeedBonus(floor);
    floors.push({
      floor,
      enemyLevel: getEnemyLevel(floor),
      enemyStars: getEnemyStars(floor),
      enemyCount: getEnemyCount(floor),
      reward: getFloorReward(floor),
      energyCost: floor <= 50 ? 3 : 4,
      ...(statBoost != null ? { statBoost } : {}),
      ...(speedBonus > 0 ? { speedBonus } : {}),
    });
  }
  return floors;
}

export const BATTLE_TOWER: TowerFloorDef[] = buildTowerFloors();

export function getTowerFloor(floor: number): TowerFloorDef | undefined {
  return BATTLE_TOWER.find(f => f.floor === floor);
}
