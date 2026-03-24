import type { MissionDefinition, MissionReward } from '../types/rewards.js';

export const MISSION_POOL: MissionDefinition[] = [
  {
    id: 'summon_1',
    type: 'summon_any',
    description: 'Summon 1 monster',
    icon: '\u25C9',
    target: 1,
    reward: { pokeballs: 5 },
  },
  {
    id: 'summon_3',
    type: 'summon_any',
    description: 'Summon 3 monsters',
    icon: '\u25C9',
    target: 3,
    reward: { pokeballs: 10 },
  },
  {
    id: 'story_1',
    type: 'battle_story',
    description: 'Win 1 story battle',
    icon: '\u2694',
    target: 1,
    reward: { pokeballs: 5, energy: 5 },
  },
  {
    id: 'story_3',
    type: 'battle_story',
    description: 'Win 3 story battles',
    icon: '\u2694',
    target: 3,
    reward: { pokeballs: 15 },
  },
  {
    id: 'dungeon_1',
    type: 'battle_dungeon',
    description: 'Win 1 dungeon battle',
    icon: '\u{1F3DB}',
    target: 1,
    reward: { energy: 5 },
  },
  {
    id: 'boss_1',
    type: 'clear_boss',
    description: 'Defeat a boss floor',
    icon: '\u{1F451}',
    target: 1,
    reward: { pokeballs: 20 },
  },
  {
    id: 'energy_10',
    type: 'spend_energy',
    description: 'Spend 10 energy',
    icon: '\u26A1',
    target: 10,
    reward: { pokeballs: 10 },
  },
  {
    id: 'merge_1',
    type: 'merge_monster',
    description: 'Merge a monster',
    icon: '\u2B06',
    target: 1,
    reward: { pokeballs: 10 },
  },
  {
    id: 'evolve_1',
    type: 'evolve_monster',
    description: 'Evolve a monster',
    icon: '\u{1F300}',
    target: 1,
    reward: { pokeballs: 20 },
  },
  {
    id: 'collect_5',
    type: 'collect_monster',
    description: 'Collect 5 monsters',
    icon: '\u25A4',
    target: 5,
    reward: { pokeballs: 15 },
  },
];

export const ALL_DAILIES_BONUS: MissionReward = {
  pokeballs: 25,
  energy: 10,
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
