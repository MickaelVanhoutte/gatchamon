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

export function clearAll(): void {
  localStorage.removeItem(PLAYER_KEY);
  localStorage.removeItem(COLLECTION_KEY);
}
