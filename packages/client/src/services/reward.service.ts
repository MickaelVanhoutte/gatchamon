import type { Difficulty } from '@gatchamon/shared';
import { getFloorCount, isLeagueRegion } from '@gatchamon/shared';
import type { FloorEnemy } from './floor.service';
import { DIFFICULTY_REWARD_MULT } from './floor.service';

const STAR_LOOT_RATES: Record<number, number> = { 1: 0.15, 2: 0.08, 3: 0.03 };
const DIFF_LOOT_BONUS: Record<string, number> = { normal: 0, hard: 0.02, hell: 0.05 };

export { DIFFICULTY_REWARD_MULT };

export interface FloorRewardPreview {
  regularPokeballs: number;
  premiumPokeballs: number;
  isFirstClear: boolean;
  possibleMonsters: Array<{ templateId: number; stars: number; dropRate: number }>;
}

export function getFloorRewardPreview(
  regionId: number,
  floor: number,
  difficulty: Difficulty,
  enemies: FloorEnemy[],
  firstClears?: Record<string, boolean>,
): FloorRewardPreview {
  const isBoss = isLeagueRegion(regionId) || floor === getFloorCount(regionId);
  const diffMult = DIFFICULTY_REWARD_MULT[difficulty];
  const bossMult = isBoss ? 3 : 1;
  const pokeballBase = 2 + regionId + Math.floor(floor / 3);
  const pokeballs = Math.floor(pokeballBase * diffMult * bossMult);

  const key = `${difficulty}_${regionId}_${floor}`;
  const first = firstClears ? !firstClears[key] : false;
  const diffBonus = DIFF_LOOT_BONUS[difficulty] ?? 0;

  const possibleMonsters = enemies.map(e => ({
    templateId: e.templateId,
    stars: e.stars,
    dropRate: (STAR_LOOT_RATES[e.stars] ?? 0.10) + diffBonus,
  }));

  return {
    regularPokeballs: first ? pokeballs : 0,
    premiumPokeballs: (isBoss && first) ? 1 : 0,
    isFirstClear: first,
    possibleMonsters,
  };
}
