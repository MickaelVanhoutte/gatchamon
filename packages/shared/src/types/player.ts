export type Difficulty = 'normal' | 'hard' | 'hell';

export interface Player {
  id: string;
  name: string;
  pokeballs: number;
  energy: number;
  storyProgress: StoryProgress;
  createdAt: string;
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
