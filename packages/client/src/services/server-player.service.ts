/**
 * Server-backed player operations.
 */
import type { Player } from '@gatchamon/shared';
import { api } from './api';
import { getPlayerId, setPlayerId } from '../config';

/** Check if a trainer name is available (case-insensitive). */
export async function checkNameAvailable(name: string): Promise<boolean> {
  const res = await api.get<{ available: boolean }>(`/player/check-name?name=${encodeURIComponent(name)}`);
  return res.available;
}

/** Create a new player on the server and store the ID locally. */
export async function createPlayerOnServer(name: string): Promise<Player> {
  const player = await api.post<Player>('/player', { name });
  setPlayerId(player.id);
  return player;
}

/** Load the current player from the server. Returns null if no player ID stored. */
export async function loadPlayerFromServer(): Promise<Player | null> {
  const id = getPlayerId();
  if (!id) return null;
  try {
    return await api.get<Player>(`/player/${id}`);
  } catch {
    return null;
  }
}
