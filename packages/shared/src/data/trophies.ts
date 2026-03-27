import type { TrophyDefinition, PlayerLifetimeStats } from '../types/rewards.js';

export const TROPHIES: TrophyDefinition[] = [
  // ─── Summon ───
  {
    id: 'summoner',
    category: 'summon',
    name: 'Summoner',
    description: 'Summon {threshold} monsters',
    icon: 'summon',
    tiers: [
      { threshold: 10, reward: { regularPokeballs: 10, trainerXp: 50 } },
      { threshold: 50, reward: { regularPokeballs: 20, premiumPokeballs: 2, trainerXp: 100 } },
      { threshold: 100, reward: { regularPokeballs: 30, premiumPokeballs: 5, trainerXp: 200, essences: { magic_low: 5 } } },
      { threshold: 250, reward: { premiumPokeballs: 10, trainerXp: 300, essences: { magic_mid: 3 } } },
      { threshold: 500, reward: { premiumPokeballs: 20, trainerXp: 500, essences: { magic_mid: 5, magic_high: 2 } } },
    ],
  },

  // ─── Collection ───
  {
    id: 'collector',
    category: 'collection',
    name: 'Collector',
    description: 'Own {threshold} unique monsters',
    icon: 'collection',
    tiers: [
      { threshold: 10, reward: { regularPokeballs: 15, trainerXp: 50 } },
      { threshold: 30, reward: { regularPokeballs: 20, premiumPokeballs: 3, trainerXp: 100, essences: { grass_low: 3, fire_low: 3, water_low: 3 } } },
      { threshold: 50, reward: { premiumPokeballs: 8, trainerXp: 200, essences: { grass_mid: 2, fire_mid: 2, water_mid: 2 }, dittos: 1 } },
      { threshold: 100, reward: { premiumPokeballs: 15, trainerXp: 400, essences: { magic_high: 2 }, dittos: 2 } },
    ],
  },

  // ─── Battle ───
  {
    id: 'story_warrior',
    category: 'battle',
    name: 'Story Warrior',
    description: 'Win {threshold} story battles',
    icon: 'swords',
    tiers: [
      { threshold: 10, reward: { regularPokeballs: 10, trainerXp: 50 } },
      { threshold: 50, reward: { regularPokeballs: 15, premiumPokeballs: 3, trainerXp: 150, essences: { magic_low: 3 } } },
      { threshold: 100, reward: { premiumPokeballs: 5, trainerXp: 250, heldItem: { setId: 'choice_band', stars: 2, grade: 'rare' } } },
      { threshold: 200, reward: { premiumPokeballs: 10, trainerXp: 400, essences: { magic_mid: 5 } } },
    ],
  },
  {
    id: 'dungeon_crawler',
    category: 'battle',
    name: 'Dungeon Crawler',
    description: 'Complete {threshold} dungeon battles',
    icon: 'dungeon',
    tiers: [
      { threshold: 10, reward: { regularPokeballs: 10, trainerXp: 50 } },
      { threshold: 50, reward: { premiumPokeballs: 3, trainerXp: 150, heldItem: { setId: 'leftovers', stars: 2, grade: 'rare' } } },
      { threshold: 100, reward: { premiumPokeballs: 5, trainerXp: 300, essences: { magic_mid: 3 } } },
    ],
  },
  {
    id: 'boss_slayer',
    category: 'battle',
    name: 'Boss Slayer',
    description: 'Defeat {threshold} bosses',
    icon: 'crown',
    tiers: [
      { threshold: 5, reward: { regularPokeballs: 10, premiumPokeballs: 2, trainerXp: 75 } },
      { threshold: 15, reward: { premiumPokeballs: 5, trainerXp: 150, essences: { magic_mid: 3 } } },
      { threshold: 30, reward: { premiumPokeballs: 8, trainerXp: 250, heldItem: { setId: 'scope_lens', stars: 2, grade: 'rare' } } },
      { threshold: 50, reward: { premiumPokeballs: 15, trainerXp: 400, essences: { magic_high: 2 }, dittos: 1 } },
    ],
  },

  // ─── Misc ───
  {
    id: 'evolver',
    category: 'misc',
    name: 'Evolver',
    description: 'Evolve {threshold} monsters',
    icon: 'evolve',
    tiers: [
      { threshold: 5, reward: { regularPokeballs: 10, trainerXp: 75 } },
      { threshold: 15, reward: { premiumPokeballs: 3, trainerXp: 150, essences: { magic_low: 5 } } },
      { threshold: 30, reward: { premiumPokeballs: 5, trainerXp: 300, essences: { magic_mid: 3 } } },
    ],
  },
  {
    id: 'merger',
    category: 'misc',
    name: 'Merger',
    description: 'Merge {threshold} monsters',
    icon: 'merge',
    tiers: [
      { threshold: 10, reward: { regularPokeballs: 10, trainerXp: 75 } },
      { threshold: 30, reward: { premiumPokeballs: 3, trainerXp: 150, heldItem: { setId: 'focus_sash', stars: 1, grade: 'common' } } },
      { threshold: 50, reward: { premiumPokeballs: 5, trainerXp: 250, essences: { magic_mid: 2 } } },
    ],
  },
  {
    id: 'lucky_hunter',
    category: 'misc',
    name: 'Lucky Hunter',
    description: 'Loot {threshold} monsters from battles',
    icon: 'clover',
    tiers: [
      { threshold: 1, reward: { regularPokeballs: 20, trainerXp: 50 } },
      { threshold: 5, reward: { premiumPokeballs: 5, trainerXp: 150, essences: { magic_low: 5 } } },
      { threshold: 10, reward: { premiumPokeballs: 10, trainerXp: 300 } },
    ],
  },

  // ─── Progression ───
  {
    id: 'region_master_normal',
    category: 'progression',
    name: 'Region Master',
    description: 'Clear {threshold} regions on Normal',
    icon: 'star',
    tiers: [
      { threshold: 3, reward: { regularPokeballs: 20, trainerXp: 100 } },
      { threshold: 6, reward: { regularPokeballs: 20, premiumPokeballs: 5, trainerXp: 200, essences: { fire_mid: 3, water_mid: 3, grass_mid: 3 } } },
      { threshold: 8, reward: { premiumPokeballs: 8, trainerXp: 300, heldItem: { setId: 'quick_claw', stars: 2, grade: 'rare' } } },
      { threshold: 10, reward: { premiumPokeballs: 15, trainerXp: 500, essences: { magic_high: 2 }, heldItem: { setId: 'kings_rock', stars: 3, grade: 'hero' }, dittos: 1 } },
    ],
  },
  {
    id: 'region_master_hard',
    category: 'progression',
    name: 'Region Conqueror',
    description: 'Clear {threshold} regions on Hard',
    icon: 'fire',
    tiers: [
      { threshold: 3, reward: { premiumPokeballs: 5, trainerXp: 150 } },
      { threshold: 6, reward: { premiumPokeballs: 8, trainerXp: 300, essences: { fire_mid: 5, water_mid: 5, grass_mid: 5 } } },
      { threshold: 8, reward: { premiumPokeballs: 12, trainerXp: 400, heldItem: { setId: 'swift_wing', stars: 3, grade: 'hero' } } },
      { threshold: 10, reward: { premiumPokeballs: 20, trainerXp: 500, essences: { magic_high: 3 }, dittos: 2 } },
    ],
  },
  {
    id: 'region_master_hell',
    category: 'progression',
    name: 'Region Overlord',
    description: 'Clear {threshold} regions on Hell',
    icon: 'skull',
    tiers: [
      { threshold: 3, reward: { premiumPokeballs: 8, trainerXp: 200 } },
      { threshold: 6, reward: { premiumPokeballs: 15, trainerXp: 400, essences: { magic_high: 3 } } },
      { threshold: 8, reward: { premiumPokeballs: 20, trainerXp: 500, heldItem: { setId: 'power_band', stars: 3, grade: 'hero' } } },
      { threshold: 10, reward: { premiumPokeballs: 30, trainerXp: 500, essences: { magic_high: 5 }, heldItem: { setId: 'kings_rock', stars: 4, grade: 'legend' }, dittos: 3 } },
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
