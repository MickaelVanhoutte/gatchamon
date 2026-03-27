import type { MissionReward } from '../types/rewards.js';

export interface TowerFloorDef {
  floor: number;
  enemyLevel: number;
  enemyStars: 1 | 2 | 3;
  enemyCount: number;
  enemyPool: number[];
  reward: MissionReward;
  energyCost: number;
}

// Enemy pools sourced from region data, scaling with tower floor range
const TOWER_POOLS: Record<string, number[]> = {
  // Floors 1-10: early-game Pokemon
  early: [10, 13, 69, 43, 16, 19, 21, 39],
  // Floors 11-20: mix of early-mid
  earlyMid: [41, 43, 92, 19, 66, 74, 16, 13],
  // Floors 21-30: mid-game
  mid: [74, 41, 19, 66, 129, 60, 7, 25],
  // Floors 31-40: mid-late
  midLate: [25, 66, 74, 4, 58, 60, 63, 92],
  // Floors 41-50: late-game common
  late: [4, 58, 74, 92, 63, 41, 39, 133],
  // Floors 51-60: late-game tough
  lateTough: [92, 63, 60, 133, 147, 1, 7, 25],
  // Floors 61-70: elite tier
  elite: [133, 147, 1, 4, 7, 25, 127, 128],
  // Floors 71-80: champion tier
  champion: [147, 133, 127, 128, 131, 142, 106, 107],
  // Floors 81-90: legendary tier
  legendary: [142, 131, 115, 106, 107, 147, 133, 1],
  // Floors 91-100: ultimate tier
  ultimate: [142, 131, 115, 106, 107, 127, 128, 147],
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
  if (floor <= 20) return 5 + floor;
  if (floor <= 50) return 15 + floor;
  if (floor <= 80) return 25 + floor;
  if (floor <= 99) return 30 + floor;
  return 60; // Floor 100
}

function getEnemyStars(floor: number): 1 | 2 | 3 {
  if (floor <= 20) return 1;
  if (floor <= 50) return 2;
  if (floor <= 80) return 2;
  return 3;
}

function getEnemyCount(floor: number): number {
  if (floor === 100) return 4;
  if (floor % 10 === 0) return 4; // Boss floors get 4 enemies
  return 3;
}

function getFloorReward(floor: number): MissionReward {
  // Floor 100: legendary pokeball
  if (floor === 100) {
    return { legendaryPokeballs: 1, premiumPokeballs: 5, stardust: 1000 };
  }

  // Milestone floors with held items + Ditto (checked before generic 10th-floor)
  if (floor === 25) {
    return {
      regularPokeballs: 5,
      stardust: 200,
      heldItem: { setId: 'choice_band', stars: 2 as 1 | 2 | 3 | 4 | 5 | 6, grade: 'rare' },
    };
  }
  if (floor === 50) {
    return {
      premiumPokeballs: 4,
      stardust: 400,
      dittos: 1,
      heldItem: { setId: 'swift_wing', stars: 3 as 1 | 2 | 3 | 4 | 5 | 6, grade: 'hero' },
    };
  }
  if (floor === 75) {
    return {
      regularPokeballs: 10,
      stardust: 600,
      heldItem: { setId: 'kings_rock', stars: 4 as 1 | 2 | 3 | 4 | 5 | 6, grade: 'hero' },
    };
  }

  // Floor 90: premium pokeballs + Ditto
  if (floor === 90) {
    return { premiumPokeballs: 6, stardust: 550, dittos: 1 };
  }

  // Every 10th floor: premium pokeballs (premium scroll)
  if (floor % 10 === 0) {
    const premiumCount = 3 + Math.floor(floor / 30);
    return { premiumPokeballs: premiumCount, stardust: 100 + floor * 5 };
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
      regularPokeballs: 3 + Math.floor(floor / 10),
      stardust: 50 + floor * 5,
      essences,
    };
  }

  // Normal floors: pokeballs + stardust
  return {
    regularPokeballs: 3 + Math.floor(floor / 10),
    stardust: 50 + floor * 5,
  };
}

function buildTowerFloors(): TowerFloorDef[] {
  const floors: TowerFloorDef[] = [];
  for (let floor = 1; floor <= 100; floor++) {
    floors.push({
      floor,
      enemyLevel: getEnemyLevel(floor),
      enemyStars: getEnemyStars(floor),
      enemyCount: getEnemyCount(floor),
      enemyPool: getEnemyPool(floor),
      reward: getFloorReward(floor),
      energyCost: floor <= 50 ? 3 : 4,
    });
  }
  return floors;
}

export const BATTLE_TOWER: TowerFloorDef[] = buildTowerFloors();

export function getTowerFloor(floor: number): TowerFloorDef | undefined {
  return BATTLE_TOWER.find(f => f.floor === floor);
}
