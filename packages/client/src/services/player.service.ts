import type { Player, StoryProgress } from '@gatchamon/shared';
import { loadPlayer, savePlayer } from './storage';

const DEFAULT_STORY_PROGRESS: StoryProgress = { normal: { 1: 1 }, hard: {}, hell: {} };
const STARTING_POKEBALLS = 50;
const STARTING_ENERGY = 100;
const STARTING_STARDUST = 0;

export function createPlayer(name: string): Player {
  const player: Player = {
    id: crypto.randomUUID(),
    name,
    pokeballs: STARTING_POKEBALLS,
    energy: STARTING_ENERGY,
    stardust: STARTING_STARDUST,
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

export function earnStardust(amount: number): Player {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');
  player.stardust = (player.stardust ?? 0) + amount;
  savePlayer(player);
  return player;
}

export function spendStardust(amount: number): Player {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');
  if ((player.stardust ?? 0) < amount) throw new Error('Not enough stardust');
  player.stardust = (player.stardust ?? 0) - amount;
  savePlayer(player);
  return player;
}
