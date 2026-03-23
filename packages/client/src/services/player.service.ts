import type { Player, StoryProgress } from '@gatchamon/shared';
import { loadPlayer, savePlayer } from './storage';

const DEFAULT_STORY_PROGRESS: StoryProgress = { normal: { 1: 1 }, hard: {}, hell: {} };
const STARTING_POKEBALLS = 50;
const STARTING_ENERGY = 100;

export function createPlayer(name: string): Player {
  const player: Player = {
    id: crypto.randomUUID(),
    name,
    pokeballs: STARTING_POKEBALLS,
    energy: STARTING_ENERGY,
    storyProgress: structuredClone(DEFAULT_STORY_PROGRESS),
    materials: {},
    createdAt: new Date().toISOString(),
  };
  savePlayer(player);
  return player;
}

export function getPlayer(): Player | null {
  return loadPlayer();
}

export function updatePlayer(updates: Partial<Player>): Player {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');
  const updated = { ...player, ...updates };
  savePlayer(updated);
  return updated;
}
