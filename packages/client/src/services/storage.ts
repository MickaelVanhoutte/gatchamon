import type { Player, PokemonInstance, HeldItemInstance, InboxItem } from '@gatchamon/shared';
import { defaultTrainerSkills, shouldResetTower, getCurrentTowerResetDate } from '@gatchamon/shared';

const PLAYER_KEY = 'gatchamon_player';
const COLLECTION_KEY = 'gatchamon_collection';
const HELD_ITEMS_KEY = 'gatchamon_held_items';
const TUTORIAL_KEY = 'gatchamon_tutorial';
const INBOX_KEY = 'gatchamon_inbox';
const RETRY_SUMMON_KEY = 'gatchamon_retry_summon';
const LOGIN_CALENDAR_KEY = 'gatchamon_login_calendar';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.error('[storage] Failed to parse JSON, returning fallback');
    return fallback;
  }
}

export function loadPlayer(): Player | null {
  const raw = localStorage.getItem(PLAYER_KEY);
  if (!raw) return null;
  const player = safeParse<Player | null>(raw, null);
  if (!player) return null;
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
  const collection = safeParse<PokemonInstance[]>(raw, []);
  if (collection.length === 0 && raw.length > 2) return []; // corrupted data
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
  return safeParse<HeldItemInstance[]>(raw, []);
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
  return safeParse<string[]>(raw, []);
}

export function saveLastTeam(instanceIds: string[]): void {
  localStorage.setItem(LAST_TEAM_KEY, JSON.stringify(instanceIds));
}

const REWARDS_KEY = 'gatchamon_rewards';

export function loadRewardState(): import('@gatchamon/shared').RewardState | null {
  const raw = localStorage.getItem(REWARDS_KEY);
  if (!raw) return null;
  return safeParse<import('@gatchamon/shared').RewardState | null>(raw, null);
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
  return safeParse<number>(raw, 0);
}

export function saveTutorialStep(step: number): void {
  localStorage.setItem(TUTORIAL_KEY, JSON.stringify(step));
}

// ── Inbox ──────────────────────────────────────────────────────────────

export function loadInbox(): InboxItem[] {
  const raw = localStorage.getItem(INBOX_KEY);
  if (!raw) return [];
  return safeParse<InboxItem[]>(raw, []);
}

export function saveInbox(items: InboxItem[]): void {
  localStorage.setItem(INBOX_KEY, JSON.stringify(items));
}

export function addInboxItem(item: InboxItem): void {
  const items = loadInbox();
  items.push(item);
  saveInbox(items);
}

export function updateInboxItem(id: string, updates: Partial<InboxItem>): void {
  const items = loadInbox();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], ...updates };
  saveInbox(items);
}

// ── Retry Summon State ─────────────────────────────────────────────────

export function loadRetrySummonState(): string | null {
  return localStorage.getItem(RETRY_SUMMON_KEY);
}

export function saveRetrySummonState(state: string): void {
  localStorage.setItem(RETRY_SUMMON_KEY, state);
}

export function clearRetrySummonState(): void {
  localStorage.removeItem(RETRY_SUMMON_KEY);
}

// ── Login Calendar ────────────────────────────────────────────────────

export interface LoginCalendarData {
  month: string;          // "YYYY-MM"
  claimedDays: number[];  // days that have been claimed (1-28)
  lastClaimDate: string;  // "YYYY-MM-DD"
}

export function loadLoginCalendar(): LoginCalendarData | null {
  const raw = localStorage.getItem(LOGIN_CALENDAR_KEY);
  if (!raw) return null;
  return safeParse<LoginCalendarData | null>(raw, null);
}

export function saveLoginCalendar(state: LoginCalendarData): void {
  localStorage.setItem(LOGIN_CALENDAR_KEY, JSON.stringify(state));
}

// ── Reset ──────────────────────────────────────────────────────────────

export function clearAll(): void {
  localStorage.removeItem(PLAYER_KEY);
  localStorage.removeItem(COLLECTION_KEY);
  localStorage.removeItem(REWARDS_KEY);
  localStorage.removeItem(HELD_ITEMS_KEY);
  localStorage.removeItem(TUTORIAL_KEY);
  localStorage.removeItem(INBOX_KEY);
  localStorage.removeItem(RETRY_SUMMON_KEY);
  localStorage.removeItem(LOGIN_CALENDAR_KEY);
}
