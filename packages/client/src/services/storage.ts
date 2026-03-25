import type { Player, PokemonInstance, HeldItemInstance } from '@gatchamon/shared';
import { defaultTrainerSkills } from '@gatchamon/shared';

const PLAYER_KEY = 'gatchamon_player';
const COLLECTION_KEY = 'gatchamon_collection';
const HELD_ITEMS_KEY = 'gatchamon_held_items';

export function loadPlayer(): Player | null {
  const raw = localStorage.getItem(PLAYER_KEY);
  if (!raw) return null;
  const player = JSON.parse(raw) as Player;
  // Migration: add stardust for existing players
  if (player.stardust === undefined) {
    player.stardust = 0;
  }
  // Migration: add energy regen timestamp
  if (player.lastEnergyUpdate === undefined) {
    player.lastEnergyUpdate = new Date().toISOString();
  }
  // Migration: add trainer level fields
  if ((player as any).trainerLevel === undefined) {
    player.trainerLevel = 1;
    player.trainerExp = 0;
    player.trainerSkillPoints = 0;
    player.trainerSkills = defaultTrainerSkills();
  }
  // Migration: trim regions to 10 (League renumbered from 11 → 10)
  if (player.storyProgress) {
    for (const diff of ['normal', 'hard', 'hell'] as const) {
      const prog = player.storyProgress[diff];
      if (!prog) continue;
      // Migrate old League (11) → new League (10)
      if (prog[11] !== undefined && prog[10] === undefined) {
        prog[10] = prog[11];
      }
      // Remove all regions > 10
      for (const key of Object.keys(prog)) {
        if (Number(key) > 10) delete prog[Number(key)];
      }
    }
  }
  return player;
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

// ── Held Items ──────────────────────────────────────────────────────────

export function loadHeldItems(): HeldItemInstance[] {
  const raw = localStorage.getItem(HELD_ITEMS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as HeldItemInstance[];
}

export function saveHeldItems(items: HeldItemInstance[]): void {
  localStorage.setItem(HELD_ITEMS_KEY, JSON.stringify(items));
}

export function addHeldItem(item: HeldItemInstance): void {
  const items = loadHeldItems();
  items.push(item);
  saveHeldItems(items);
}

export function updateHeldItem(itemId: string, updates: Partial<HeldItemInstance>): void {
  const items = loadHeldItems();
  const idx = items.findIndex(i => i.itemId === itemId);
  if (idx === -1) return;
  items[idx] = { ...items[idx], ...updates };
  saveHeldItems(items);
}

export function getItemsForPokemon(instanceId: string): HeldItemInstance[] {
  return loadHeldItems().filter(i => i.equippedTo === instanceId);
}

// ── Team ────────────────────────────────────────────────────────────────

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
  localStorage.removeItem(HELD_ITEMS_KEY);
}
