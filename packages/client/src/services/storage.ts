import type { Player, PokemonInstance } from '@gatchamon/shared';

const PLAYER_KEY = 'gatchamon_player';
const COLLECTION_KEY = 'gatchamon_collection';

export function loadPlayer(): Player | null {
  const raw = localStorage.getItem(PLAYER_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as Player;
}

export function savePlayer(player: Player): void {
  localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
}

export function loadCollection(): PokemonInstance[] {
  const raw = localStorage.getItem(COLLECTION_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as PokemonInstance[];
}

export function saveCollection(collection: PokemonInstance[]): void {
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
}

export function addToCollection(instances: PokemonInstance[]): void {
  const current = loadCollection();
  saveCollection([...current, ...instances]);
}

export function updateInstance(instanceId: string, updates: Partial<PokemonInstance>): void {
  const collection = loadCollection();
  const idx = collection.findIndex(inst => inst.instanceId === instanceId);
  if (idx === -1) return;
  collection[idx] = { ...collection[idx], ...updates };
  saveCollection(collection);
}

const LAST_TEAM_KEY = 'gatchamon_last_team';

export function loadLastTeam(): string[] {
  const raw = localStorage.getItem(LAST_TEAM_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as string[];
}

export function saveLastTeam(instanceIds: string[]): void {
  localStorage.setItem(LAST_TEAM_KEY, JSON.stringify(instanceIds));
}

const REWARDS_KEY = 'gatchamon_rewards';

export function loadRewardState(): import('@gatchamon/shared').RewardState | null {
  const raw = localStorage.getItem(REWARDS_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

export function saveRewardState(state: import('@gatchamon/shared').RewardState): void {
  localStorage.setItem(REWARDS_KEY, JSON.stringify(state));
}

export function clearAll(): void {
  localStorage.removeItem(PLAYER_KEY);
  localStorage.removeItem(COLLECTION_KEY);
  localStorage.removeItem(REWARDS_KEY);
}
