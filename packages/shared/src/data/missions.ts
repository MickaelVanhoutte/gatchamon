import type { MissionDefinition, MissionReward } from '../types/rewards.js';

export const MISSION_POOL: MissionDefinition[] = [
  {
    id: 'summon_1',
    type: 'summon_any',
    description: 'Summon 1 monster',
    icon: 'summon',
    target: 1,
    reward: { regularPokeballs: 5, trainerXp: 10 },
  },
  {
    id: 'summon_3',
    type: 'summon_any',
    description: 'Summon 3 monsters',
    icon: 'summon',
    target: 3,
    reward: { regularPokeballs: 8, premiumPokeballs: 1, trainerXp: 20 },
  },
  {
    id: 'story_1',
    type: 'battle_story',
    description: 'Win 1 story battle',
    icon: 'swords',
    target: 1,
    reward: { regularPokeballs: 5, energy: 5, trainerXp: 15 },
  },
  {
    id: 'story_3',
    type: 'battle_story',
    description: 'Win 3 story battles',
    icon: 'swords',
    target: 3,
    reward: { regularPokeballs: 10, premiumPokeballs: 2, trainerXp: 30 },
  },
  {
    id: 'dungeon_1',
    type: 'battle_dungeon',
    description: 'Win 1 dungeon battle',
    icon: 'dungeon',
    target: 1,
    reward: { energy: 5, trainerXp: 20 },
  },
  {
    id: 'boss_1',
    type: 'clear_boss',
    description: 'Defeat a boss floor',
    icon: 'crown',
    target: 1,
    reward: { premiumPokeballs: 5, trainerXp: 40, heldItem: { setId: 'choice_band', stars: 1, grade: 'common' } },
  },
  {
    id: 'energy_10',
    type: 'spend_energy',
    description: 'Spend 10 energy',
    icon: 'energy',
    target: 10,
    reward: { regularPokeballs: 10, trainerXp: 15 },
  },
  {
    id: 'merge_1',
    type: 'merge_monster',
    description: 'Merge a monster',
    icon: 'merge',
    target: 1,
    reward: { regularPokeballs: 5, premiumPokeballs: 2, trainerXp: 25 },
  },
  {
    id: 'evolve_1',
    type: 'evolve_monster',
    description: 'Evolve a monster',
    icon: 'evolve',
    target: 1,
    reward: { premiumPokeballs: 5, trainerXp: 35, heldItem: { setId: 'focus_sash', stars: 1, grade: 'common' } },
  },
  {
    id: 'collect_5',
    type: 'collect_monster',
    description: 'Collect 5 monsters',
    icon: 'collection',
    target: 5,
    reward: { regularPokeballs: 10, premiumPokeballs: 2, trainerXp: 20 },
  },
];

export const ALL_DAILIES_BONUS: MissionReward = {
  regularPokeballs: 15,
  premiumPokeballs: 5,
  energy: 10,
  trainerXp: 50,
};

export const DAILY_MISSION_COUNT = 5;

/** Deterministic hash for date string */
function hashDate(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash) + date.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Pick N missions from pool using date-seeded shuffle */
export function selectDailyMissions(date: string): MissionDefinition[] {
  const seed = hashDate(date);
  const shuffled = [...MISSION_POOL];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, DAILY_MISSION_COUNT);
}
