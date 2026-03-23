import { REGIONS } from '@gatchamon/shared';
import type { Difficulty } from '@gatchamon/shared';

export interface FloorEnemy {
  templateId: number;
  level: number;
  stars: 1 | 2 | 3;
}

export interface FloorDef {
  enemies: FloorEnemy[];
  isBoss: boolean;
}

export const DIFFICULTY_LEVEL_BONUS: Record<Difficulty, number> = {
  normal: 0,
  hard: 10,
  hell: 25,
};

export const DIFFICULTY_REWARD_MULT: Record<Difficulty, number> = {
  normal: 1,
  hard: 1.5,
  hell: 2.5,
};

function pickSeeded(arr: number[], regionId: number, floor: number, slot: number): number {
  const idx = ((regionId * 31) + (floor * 7) + (slot * 13)) % arr.length;
  return arr[idx];
}

function getBaseStars(regionId: number, isBoss: boolean): 1 | 2 | 3 {
  if (isBoss) {
    return regionId >= 7 ? 3 : 2;
  }
  return regionId >= 7 ? 2 : 1;
}

function clampStars(stars: number): 1 | 2 | 3 {
  return Math.min(3, Math.max(1, stars)) as 1 | 2 | 3;
}

export function buildFloorEnemies(regionId: number, floor: number, difficulty: Difficulty): FloorDef {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) throw new Error(`Unknown region ${regionId}`);

  const regionBase = (regionId - 1) * 5 + 1;
  const floorBonus = Math.ceil(floor / 2);
  const difficultyBonus = DIFFICULTY_LEVEL_BONUS[difficulty];

  if (floor === 10) {
    // Boss floor — single strong enemy
    const bossLevel = regionBase + floorBonus + difficultyBonus + 5;
    const baseStars = getBaseStars(regionId, true);
    const starBoost = difficulty === 'hell' ? 1 : difficulty === 'hard' ? 1 : 0;
    const bossStars = clampStars(baseStars + starBoost);

    return {
      enemies: [{
        templateId: pickSeeded(region.bossPool, regionId, floor, 0),
        level: bossLevel,
        stars: bossStars,
      }],
      isBoss: true,
    };
  }

  // Normal floors
  const enemyLevel = regionBase + floorBonus + difficultyBonus;
  const baseStars = getBaseStars(regionId, false);
  const starBoost = difficulty === 'hell' ? 1 : 0;
  const stars = clampStars(baseStars + starBoost);
  const enemyCount = difficulty === 'hell' ? 4 : 3;

  const enemies: FloorEnemy[] = [];
  for (let slot = 0; slot < enemyCount; slot++) {
    enemies.push({
      templateId: pickSeeded(region.commonPool, regionId, floor, slot),
      level: enemyLevel,
      stars,
    });
  }

  return { enemies, isBoss: false };
}

/** Get all 10 floor definitions for a region + difficulty. */
export function getFloorDefsForRegion(regionId: number, difficulty: Difficulty): Record<number, FloorDef> {
  const defs: Record<number, FloorDef> = {};
  for (let f = 1; f <= 10; f++) {
    defs[f] = buildFloorEnemies(regionId, f, difficulty);
  }
  return defs;
}
