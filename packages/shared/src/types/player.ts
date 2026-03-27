export type Difficulty = 'normal' | 'hard' | 'hell';
export type PokeballType = 'regular' | 'premium' | 'legendary';

export interface TrainerSkills {
  energyRegenSpeed: number;    // 0-10, -10% regen interval per level
  maxEnergyPool: number;       // 0-10, +10 max energy per level
  globalAtkBonus: number;      // 0-10, +2% ATK per level
  globalDefBonus: number;      // 0-10, +2% DEF per level
  globalHpBonus: number;       // 0-10, +2% HP per level
  globalSpdBonus: number;      // 0-10, +1% SPD per level
  stardustBonus: number;       // 0-5, +10% stardust per level
  xpBonus: number;             // 0-5, +10% battle XP per level
  pokeballBonus: number;       // 0-5, +10% pokeball rewards per level
  essenceBonus: number;        // 0-5, +10% essence drops per level
}

export interface Player {
  id: string;
  name: string;
  regularPokeballs: number;
  premiumPokeballs: number;
  legendaryPokeballs: number;
  energy: number;
  stardust: number;
  storyProgress: StoryProgress;
  materials: Record<string, number>;
  towerProgress: number;
  towerResetDate?: string;  // ISO date of last reset boundary (1st or 15th)
  createdAt: string;
  lastEnergyUpdate?: string;
  trainerLevel: number;
  trainerExp: number;
  trainerSkillPoints: number;
  trainerSkills: TrainerSkills;
}

/**
 * Maps regionId → next floor to beat (1-10).
 * Key absent = region locked. Value 11 = region completed.
 */
export interface RegionProgress {
  [regionId: number]: number;
}

export interface StoryProgress {
  normal: RegionProgress;
  hard: RegionProgress;
  hell: RegionProgress;
}
