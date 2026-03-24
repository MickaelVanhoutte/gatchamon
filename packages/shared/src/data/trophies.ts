import type { TrophyDefinition, PlayerLifetimeStats } from '../types/rewards.js';

export const TROPHIES: TrophyDefinition[] = [
  // ─── Summon ───
  {
    id: 'summoner',
    category: 'summon',
    name: 'Summoner',
    description: 'Summon {threshold} monsters',
    icon: '\u25C9',
    tiers: [
      { threshold: 10, reward: { pokeballs: 10 } },
      { threshold: 50, reward: { pokeballs: 25 } },
      { threshold: 100, reward: { pokeballs: 50 } },
      { threshold: 250, reward: { pokeballs: 100 } },
      { threshold: 500, reward: { pokeballs: 200 } },
    ],
  },

  // ─── Collection ───
  {
    id: 'collector',
    category: 'collection',
    name: 'Collector',
    description: 'Own {threshold} unique monsters',
    icon: '\u25A4',
    tiers: [
      { threshold: 10, reward: { pokeballs: 15 } },
      { threshold: 30, reward: { pokeballs: 30 } },
      { threshold: 50, reward: { pokeballs: 60 } },
      { threshold: 100, reward: { pokeballs: 150 } },
    ],
  },

  // ─── Battle ───
  {
    id: 'story_warrior',
    category: 'battle',
    name: 'Story Warrior',
    description: 'Win {threshold} story battles',
    icon: '\u2694',
    tiers: [
      { threshold: 10, reward: { pokeballs: 10 } },
      { threshold: 50, reward: { pokeballs: 25 } },
      { threshold: 100, reward: { pokeballs: 50 } },
      { threshold: 200, reward: { pokeballs: 100 } },
    ],
  },
  {
    id: 'dungeon_crawler',
    category: 'battle',
    name: 'Dungeon Crawler',
    description: 'Complete {threshold} dungeon battles',
    icon: '\u{1F3DB}',
    tiers: [
      { threshold: 10, reward: { pokeballs: 10 } },
      { threshold: 50, reward: { pokeballs: 25 } },
      { threshold: 100, reward: { pokeballs: 50 } },
    ],
  },
  {
    id: 'boss_slayer',
    category: 'battle',
    name: 'Boss Slayer',
    description: 'Defeat {threshold} bosses',
    icon: '\u{1F451}',
    tiers: [
      { threshold: 5, reward: { pokeballs: 15 } },
      { threshold: 15, reward: { pokeballs: 30 } },
      { threshold: 30, reward: { pokeballs: 60 } },
      { threshold: 50, reward: { pokeballs: 100 } },
    ],
  },

  // ─── Misc ───
  {
    id: 'evolver',
    category: 'misc',
    name: 'Evolver',
    description: 'Evolve {threshold} monsters',
    icon: '\u{1F300}',
    tiers: [
      { threshold: 5, reward: { pokeballs: 10 } },
      { threshold: 15, reward: { pokeballs: 25 } },
      { threshold: 30, reward: { pokeballs: 50 } },
    ],
  },
  {
    id: 'merger',
    category: 'misc',
    name: 'Merger',
    description: 'Merge {threshold} monsters',
    icon: '\u2B06',
    tiers: [
      { threshold: 10, reward: { pokeballs: 10 } },
      { threshold: 30, reward: { pokeballs: 20 } },
      { threshold: 50, reward: { pokeballs: 40 } },
    ],
  },
  {
    id: 'lucky_hunter',
    category: 'misc',
    name: 'Lucky Hunter',
    description: 'Loot {threshold} monsters from battles',
    icon: '\u{1F340}',
    tiers: [
      { threshold: 1, reward: { pokeballs: 20 } },
      { threshold: 5, reward: { pokeballs: 50 } },
      { threshold: 10, reward: { pokeballs: 100 } },
    ],
  },

  // ─── Progression ───
  {
    id: 'region_master_normal',
    category: 'progression',
    name: 'Region Master',
    description: 'Clear {threshold} regions on Normal',
    icon: '\u2B50',
    tiers: [
      { threshold: 3, reward: { pokeballs: 20 } },
      { threshold: 6, reward: { pokeballs: 40 } },
      { threshold: 9, reward: { pokeballs: 60 } },
      { threshold: 11, reward: { pokeballs: 100 } },
    ],
  },
  {
    id: 'region_master_hard',
    category: 'progression',
    name: 'Region Conqueror',
    description: 'Clear {threshold} regions on Hard',
    icon: '\u{1F525}',
    tiers: [
      { threshold: 3, reward: { pokeballs: 30 } },
      { threshold: 6, reward: { pokeballs: 60 } },
      { threshold: 9, reward: { pokeballs: 90 } },
      { threshold: 11, reward: { pokeballs: 150 } },
    ],
  },
  {
    id: 'region_master_hell',
    category: 'progression',
    name: 'Region Overlord',
    description: 'Clear {threshold} regions on Hell',
    icon: '\u{1F480}',
    tiers: [
      { threshold: 3, reward: { pokeballs: 50 } },
      { threshold: 6, reward: { pokeballs: 100 } },
      { threshold: 9, reward: { pokeballs: 150 } },
      { threshold: 11, reward: { pokeballs: 250 } },
    ],
  },
];

/** Map trophy ID to the lifetime stat it tracks */
export function getTrophyStat(trophyId: string): keyof PlayerLifetimeStats | null {
  const map: Record<string, keyof PlayerLifetimeStats> = {
    summoner: 'totalSummons',
    collector: 'uniqueMonstersOwned',
    story_warrior: 'totalBattlesStory',
    dungeon_crawler: 'totalBattlesDungeon',
    boss_slayer: 'totalBossesDefeated',
    evolver: 'totalEvolutions',
    merger: 'totalMerges',
    lucky_hunter: 'totalMonsterLoots',
    region_master_normal: 'highestRegionNormal',
    region_master_hard: 'highestRegionHard',
    region_master_hell: 'highestRegionHell',
  };
  return map[trophyId] ?? null;
}
