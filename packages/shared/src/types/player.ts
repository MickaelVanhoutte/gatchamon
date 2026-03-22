export interface Player {
  id: string;
  name: string;
  pokeballs: number;
  energy: number;
  storyProgress: StoryProgress;
  createdAt: string;
}

export interface StoryProgress {
  difficulty: 'normal' | 'hard' | 'hell';
  level: number;
  floor: number;
}
