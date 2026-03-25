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
      { threshold: 10, reward: { pokeballs: 10, trainerXp: 50 } },
      { threshold: 50, reward: { pokeballs: 25, trainerXp: 100 } },
      { threshold: 100, reward: { pokeballs: 50, trainerXp: 200, essences: { magic_low: 5 } } },
      { threshold: 250, reward: { pokeballs: 100, trainerXp: 300, essences: { magic_mid: 3 } } },
      { threshold: 500, reward: { pokeballs: 200, trainerXp: 500, essences: { magic_mid: 5, magic_high: 2 } } },
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
      { threshold: 10, reward: { pokeballs: 15, trainerXp: 50 } },
      { threshold: 30, reward: { pokeballs: 30, trainerXp: 100, essences: { grass_low: 3, fire_low: 3, water_low: 3 } } },
      { threshold: 50, reward: { pokeballs: 60, trainerXp: 200, essences: { grass_mid: 2, fire_mid: 2, water_mid: 2 } } },
      { threshold: 100, reward: { pokeballs: 150, trainerXp: 400, essences: { magic_high: 2 } } },
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
      { threshold: 10, reward: { pokeballs: 10, trainerXp: 50 } },
      { threshold: 50, reward: { pokeballs: 25, trainerXp: 150, essences: { magic_low: 3 } } },
      { threshold: 100, reward: { pokeballs: 50, trainerXp: 250, heldItem: { setId: 'choice_band', stars: 2, grade: 'rare' } } },
      { threshold: 200, reward: { pokeballs: 100, trainerXp: 400, essences: { magic_mid: 5 } } },
    ],
  },
  {
    id: 'dungeon_crawler',
    category: 'battle',
    name: 'Dungeon Crawler',
    description: 'Complete {threshold} dungeon battles',
    icon: '\u{1F3DB}',
    tiers: [
      { threshold: 10, reward: { pokeballs: 10, trainerXp: 50 } },
      { threshold: 50, reward: { pokeballs: 25, trainerXp: 150, heldItem: { setId: 'leftovers', stars: 2, grade: 'rare' } } },
      { threshold: 100, reward: { pokeballs: 50, trainerXp: 300, essences: { magic_mid: 3 } } },
    ],
  },
  {
    id: 'boss_slayer',
    category: 'battle',
    name: 'Boss Slayer',
    description: 'Defeat {threshold} bosses',
    icon: '\u{1F451}',
    tiers: [
      { threshold: 5, reward: { pokeballs: 15, trainerXp: 75 } },
      { threshold: 15, reward: { pokeballs: 30, trainerXp: 150, essences: { magic_mid: 3 } } },
      { threshold: 30, reward: { pokeballs: 60, trainerXp: 250, heldItem: { setId: 'scope_lens', stars: 2, grade: 'rare' } } },
      { threshold: 50, reward: { pokeballs: 100, trainerXp: 400, essences: { magic_high: 2 } } },
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
      { threshold: 5, reward: { pokeballs: 10, trainerXp: 75 } },
      { threshold: 15, reward: { pokeballs: 25, trainerXp: 150, essences: { magic_low: 5 } } },
      { threshold: 30, reward: { pokeballs: 50, trainerXp: 300, essences: { magic_mid: 3 } } },
    ],
  },
  {
    id: 'merger',
    category: 'misc',
    name: 'Merger',
    description: 'Merge {threshold} monsters',
    icon: '\u2B06',
    tiers: [
      { threshold: 10, reward: { pokeballs: 10, trainerXp: 75 } },
      { threshold: 30, reward: { pokeballs: 20, trainerXp: 150, heldItem: { setId: 'focus_sash', stars: 1, grade: 'common' } } },
      { threshold: 50, reward: { pokeballs: 40, trainerXp: 250, essences: { magic_mid: 2 } } },
    ],
  },
  {
    id: 'lucky_hunter',
    category: 'misc',
    name: 'Lucky Hunter',
    description: 'Loot {threshold} monsters from battles',
    icon: '\u{1F340}',
    tiers: [
      { threshold: 1, reward: { pokeballs: 20, trainerXp: 50 } },
      { threshold: 5, reward: { pokeballs: 50, trainerXp: 150, essences: { magic_low: 5 } } },
      { threshold: 10, reward: { pokeballs: 100, trainerXp: 300 } },
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
      { threshold: 3, reward: { pokeballs: 20, trainerXp: 100 } },
      { threshold: 6, reward: { pokeballs: 40, trainerXp: 200, essences: { fire_mid: 3, water_mid: 3, grass_mid: 3 } } },
      { threshold: 8, reward: { pokeballs: 60, trainerXp: 300, heldItem: { setId: 'quick_claw', stars: 2, grade: 'rare' } } },
      { threshold: 10, reward: { pokeballs: 100, trainerXp: 500, essences: { magic_high: 2 }, heldItem: { setId: 'kings_rock', stars: 3, grade: 'hero' } } },
    ],
  },
  {
    id: 'region_master_hard',
    category: 'progression',
    name: 'Region Conqueror',
    description: 'Clear {threshold} regions on Hard',
    icon: '\u{1F525}',
    tiers: [
      { threshold: 3, reward: { pokeballs: 30, trainerXp: 150 } },
      { threshold: 6, reward: { pokeballs: 60, trainerXp: 300, essences: { fire_mid: 5, water_mid: 5, grass_mid: 5 } } },
      { threshold: 8, reward: { pokeballs: 90, trainerXp: 400, heldItem: { setId: 'swift_wing', stars: 3, grade: 'hero' } } },
      { threshold: 10, reward: { pokeballs: 150, trainerXp: 500, essences: { magic_high: 3 } } },
    ],
  },
  {
    id: 'region_master_hell',
    category: 'progression',
    name: 'Region Overlord',
    description: 'Clear {threshold} regions on Hell',
    icon: '\u{1F480}',
    tiers: [
      { threshold: 3, reward: { pokeballs: 50, trainerXp: 200 } },
      { threshold: 6, reward: { pokeballs: 100, trainerXp: 400, essences: { magic_high: 3 } } },
      { threshold: 8, reward: { pokeballs: 150, trainerXp: 500, heldItem: { setId: 'power_band', stars: 3, grade: 'hero' } } },
      { threshold: 10, reward: { pokeballs: 250, trainerXp: 500, essences: { magic_high: 5 }, heldItem: { setId: 'kings_rock', stars: 4, grade: 'legend' } } },
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
