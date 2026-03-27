import type { Player, PokemonInstance, HeldItemInstance } from '@gatchamon/shared';
import { defaultTrainerSkills, shouldResetTower, getCurrentTowerResetDate } from '@gatchamon/shared';

const PLAYER_KEY = 'gatchamon_player';
const COLLECTION_KEY = 'gatchamon_collection';
const HELD_ITEMS_KEY = 'gatchamon_held_items';
const TUTORIAL_KEY = 'gatchamon_tutorial';

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
  // Migration: split pokeballs into regular/premium
  if ((player as any).pokeballs !== undefined && player.regularPokeballs === undefined) {
    player.regularPokeballs = (player as any).pokeballs;
    player.premiumPokeballs = 0;
    delete (player as any).pokeballs;
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
  // Migration: add legendaryPokeballs for existing players
  if ((player as any).legendaryPokeballs === undefined) {
    player.legendaryPokeballs = 0;
  }
  // Migration: add towerProgress for existing players
  if ((player as any).towerProgress === undefined) {
    player.towerProgress = 0;
  }
  // Tower reset: resets on the 1st and 15th of each month
  if (shouldResetTower(player.towerResetDate)) {
    player.towerProgress = 0;
    player.towerResetDate = getCurrentTowerResetDate();
    savePlayer(player);
  }
  return player;
}

export function savePlayer(player: Player): void {
  localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
}

export function loadCollection(): PokemonInstance[] {
  const raw = localStorage.getItem(COLLECTION_KEY);
  if (!raw) return [];
  const collection = JSON.parse(raw) as PokemonInstance[];
  // Migration: add skillLevels for existing monsters
  let needsSave = false;
  for (const inst of collection) {
    if (!inst.skillLevels) {
      inst.skillLevels = [1, 1, 1];
      needsSave = true;
    }
  }
  if (needsSave) saveCollection(collection);
  return collection;
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

// ── Tutorial ─────────────────────────────────────────────────────────

export function loadTutorialStep(): number {
  const raw = localStorage.getItem(TUTORIAL_KEY);
  if (!raw) {
    // Existing players (have save but no tutorial key) skip tutorial
    const hasPlayer = localStorage.getItem(PLAYER_KEY) !== null;
    return hasPlayer ? 99 : 0;
  }
  return JSON.parse(raw) as number;
}

export function saveTutorialStep(step: number): void {
  localStorage.setItem(TUTORIAL_KEY, JSON.stringify(step));
}

export function clearAll(): void {
  localStorage.removeItem(PLAYER_KEY);
  localStorage.removeItem(COLLECTION_KEY);
  localStorage.removeItem(REWARDS_KEY);
  localStorage.removeItem(HELD_ITEMS_KEY);
  localStorage.removeItem(TUTORIAL_KEY);
}
