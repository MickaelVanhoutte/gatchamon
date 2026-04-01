import type { MissionReward } from '../types/rewards.js';

export interface TowerFloorDef {
  floor: number;
  enemyLevel: number;
  enemyStars: 1 | 2 | 3 | 4 | 5 | 6;
  enemyCount: number;
  enemyPool: number[];
  reward: MissionReward;
  energyCost: number;
  statBoost?: number;
}

// Enemy pools — Gen 1 only, difficulty through team composition & type coverage
const TOWER_POOLS: Record<string, number[]> = {
  // Floors 1-10: weak unevolved basics
  early: [16, 19, 21],
  // Floors 11-20: 2-star basics with diverse types
  earlyMid: [25, 37, 41, 66],
  // Floors 21-30: evolved 2-star forms
  mid: [26, 34, 38, 42],
  // Floors 31-40: strong 3-star final evolutions
  midLate: [6, 9, 65, 94, 130],
  // Floors 41-50: best 3-star finals + 4-star
  late: [59, 94, 131, 143, 142],
  // Floors 51-60: 4-star powerhouses
  lateTough: [142, 143, 149, 130, 131],
  // Floors 61-70: best of Gen 1 mix
  elite: [149, 143, 65, 94, 130],
  // Floors 71-80: legendary birds + Dragonite
  champion: [144, 145, 146, 149, 143],
  // Floors 81-90: Mewtwo + birds + Gyarados
  legendary: [150, 144, 145, 146, 130],
  // Floors 91-100: Mewtwo, Mew + top Gen 1
  ultimate: [150, 151, 149, 143, 130],
};

function getEnemyPool(floor: number): number[] {
  if (floor <= 10) return TOWER_POOLS.early;
  if (floor <= 20) return TOWER_POOLS.earlyMid;
  if (floor <= 30) return TOWER_POOLS.mid;
  if (floor <= 40) return TOWER_POOLS.midLate;
  if (floor <= 50) return TOWER_POOLS.late;
  if (floor <= 60) return TOWER_POOLS.lateTough;
  if (floor <= 70) return TOWER_POOLS.elite;
  if (floor <= 80) return TOWER_POOLS.champion;
  if (floor <= 90) return TOWER_POOLS.legendary;
  return TOWER_POOLS.ultimate;
}

function getEnemyLevel(floor: number): number {
  // Smooth linear ramp: floor 1 → level 6, floor 100 → level 130
  return Math.floor(5 + floor * 1.25);
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
    floors.push({
      floor,
      enemyLevel: getEnemyLevel(floor),
      enemyStars: getEnemyStars(floor),
      enemyCount: getEnemyCount(floor),
      enemyPool: getEnemyPool(floor),
      reward: getFloorReward(floor),
      energyCost: floor <= 50 ? 3 : 4,
      ...(statBoost != null ? { statBoost } : {}),
    });
  }
  return floors;
}

export const BATTLE_TOWER: TowerFloorDef[] = buildTowerFloors();

export function getTowerFloor(floor: number): TowerFloorDef | undefined {
  return BATTLE_TOWER.find(f => f.floor === floor);
}
