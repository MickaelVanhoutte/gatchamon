import type { Difficulty } from './player.js';
import type { HeldItemGrade, HeldItemSlot } from './held-item.js';

// ─── Daily Missions ───

export type MissionType =
  | 'summon_any'
  | 'battle_story'
  | 'battle_dungeon'
  | 'clear_boss'
  | 'evolve_monster'
  | 'merge_monster'
  | 'spend_energy'
  | 'collect_monster';

export interface HeldItemReward {
  setId: string;
  stars: 1 | 2 | 3 | 4 | 5 | 6;
  grade: HeldItemGrade;
  slot?: HeldItemSlot;
}

export interface MissionReward {
  regularPokeballs?: number;
  premiumPokeballs?: number;
  energy?: number;
  essences?: Record<string, number>;
  trainerXp?: number;
  heldItem?: HeldItemReward;
  dittos?: number;
  legendaryPokeballs?: number;
  glowingPokeballs?: number;
  stardust?: number;
  pokedollars?: number;
}

export interface MissionDefinition {
  id: string;
  type: MissionType;
  description: string;
  icon: string;
  target: number;
  reward: MissionReward;
}

export interface DailyMissionProgress {
  missionId: string;
  current: number;
  claimed: boolean;
}

export interface DailyMissionState {
  date: string; // "YYYY-MM-DD"
  missions: DailyMissionProgress[];
  allClaimedBonus: boolean;
}

// ─── Trophies ───

export type TrophyCategory = 'collection' | 'battle' | 'summon' | 'progression' | 'misc';

export interface TrophyTier {
  threshold: number;
  reward: MissionReward;
}

export interface TrophyDefinition {
  id: string;
  category: TrophyCategory;
  name: string;
  description: string;
  icon: string;
  tiers: TrophyTier[];
}

export interface TrophyProgress {
  trophyId: string;
  current: number;
  claimedTiers: number[]; // indices of claimed tiers
}

// ─── First-Clear Tracking ───

/** Key = "regionId-floor-difficulty" */
export type FirstClearMap = Record<string, boolean>;

// ─── Lifetime Stats ───

export interface PlayerLifetimeStats {
  totalSummons: number;
  totalBattlesStory: number;
  totalBattlesDungeon: number;
  totalBossesDefeated: number;
  totalMonstersCollected: number;
  totalEvolutions: number;
  totalMerges: number;
  totalEnergySpent: number;
  totalMonsterLoots: number;
  uniqueMonstersOwned: number;
  highestRegionNormal: number;
  highestRegionHard: number;
  highestRegionHell: number;
}

// ─── Aggregate State ───

export interface RewardState {
  dailyMissions: DailyMissionState;
  trophyProgress: TrophyProgress[];
  firstClears: FirstClearMap;
  stats: PlayerLifetimeStats;
}

export function firstClearKey(regionId: number, floor: number, difficulty: Difficulty): string {
  return `${regionId}-${floor}-${difficulty}`;
}

export function defaultLifetimeStats(): PlayerLifetimeStats {
  return {
    totalSummons: 0,
    totalBattlesStory: 0,
    totalBattlesDungeon: 0,
    totalBossesDefeated: 0,
    totalMonstersCollected: 0,
    totalEvolutions: 0,
    totalMerges: 0,
    totalEnergySpent: 0,
    totalMonsterLoots: 0,
    uniqueMonstersOwned: 0,
    highestRegionNormal: 0,
    highestRegionHard: 0,
    highestRegionHell: 0,
  };
}
