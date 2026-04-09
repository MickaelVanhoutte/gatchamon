/**
 * Client-side localStorage for preferences and UI state.
 * Game data (player, collection, items, etc.) is server-owned.
 */

const TUTORIAL_KEY = 'gatchamon_tutorial';
const PLAYER_KEY = 'gatchamon_player';
const GRANTED_FLAGS_KEY = 'gatchamon_granted_flags';
const PC_AUTO_SEND_KEY = 'gatchamon_pc_auto';
const RETRY_SUMMON_KEY = 'gatchamon_retry_summon';
const BATTLE_SETTINGS_KEY = 'gatchamon_battle_settings';
const STORY_DIFFICULTY_KEY = 'gatchamon_story_difficulty';
const TEAM_KEY_PREFIX = 'gatchamon_team_';
const LEGACY_TEAM_KEY = 'gatchamon_last_team';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.error('[storage] Failed to parse JSON, returning fallback');
    return fallback;
  }
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

// ── Battle Settings ──────────────────────────────────────────────────

export interface BattleSettings {
  speed: 1 | 2 | 3;
  auto: boolean;
}

const DEFAULT_BATTLE_SETTINGS: BattleSettings = { speed: 1, auto: false };

export function loadBattleSettings(): BattleSettings {
  const raw = localStorage.getItem(BATTLE_SETTINGS_KEY);
  return safeParse<BattleSettings>(raw, DEFAULT_BATTLE_SETTINGS);
}

export function saveBattleSettings(settings: Partial<BattleSettings>): void {
  const current = loadBattleSettings();
  localStorage.setItem(BATTLE_SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
}

// ── Team ────────────────────────────────────────────────────────────────

export function getTeamKey(mode: string, dungeonId?: number): string {
  switch (mode) {
    case 'dungeon':
      return `${TEAM_KEY_PREFIX}dungeon_${dungeonId}`;
    case 'item-dungeon':
      return `${TEAM_KEY_PREFIX}item_dungeon_${dungeonId}`;
    case 'tower':
      return `${TEAM_KEY_PREFIX}tower`;
    default:
      return `${TEAM_KEY_PREFIX}story`;
  }
}

export function loadLastTeam(teamKey: string): string[] {
  const raw = localStorage.getItem(teamKey);
  if (!raw) {
    const legacy = localStorage.getItem(LEGACY_TEAM_KEY);
    if (!legacy) return [];
    return safeParse<string[]>(legacy, []);
  }
  return safeParse<string[]>(raw, []);
}

export function saveLastTeam(instanceIds: string[], teamKey: string): void {
  localStorage.setItem(teamKey, JSON.stringify(instanceIds));
}

// ── PC Auto-Send ──────────────────────────────────────────────────────

export function loadPcAutoSend(): boolean {
  const raw = localStorage.getItem(PC_AUTO_SEND_KEY);
  return raw === 'true';
}

export function savePcAutoSend(enabled: boolean): void {
  localStorage.setItem(PC_AUTO_SEND_KEY, String(enabled));
}

// ── Story Difficulty ──────────────────────────────────────────────────

export function loadStoryDifficulty(): string {
  return localStorage.getItem(STORY_DIFFICULTY_KEY) ?? 'normal';
}

export function saveStoryDifficulty(diff: string): void {
  localStorage.setItem(STORY_DIFFICULTY_KEY, diff);
}

// ── Granted Flags ────────────────────────────────────────────────────

function loadGrantedFlags(): Record<string, boolean> {
  const raw = localStorage.getItem(GRANTED_FLAGS_KEY);
  return safeParse<Record<string, boolean>>(raw, {});
}

export function hasGrantedFlag(flag: string): boolean {
  return !!loadGrantedFlags()[flag];
}

export function setGrantedFlag(flag: string): void {
  const flags = loadGrantedFlags();
  flags[flag] = true;
  localStorage.setItem(GRANTED_FLAGS_KEY, JSON.stringify(flags));
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

// ── Reset ────────────────────────────────────────────────────────────────

export function clearAll(): void {
  localStorage.removeItem(TUTORIAL_KEY);
  localStorage.removeItem(BATTLE_SETTINGS_KEY);
  localStorage.removeItem(GRANTED_FLAGS_KEY);
  localStorage.removeItem(STORY_DIFFICULTY_KEY);
  localStorage.removeItem(PC_AUTO_SEND_KEY);
  localStorage.removeItem(RETRY_SUMMON_KEY);
  localStorage.removeItem(LEGACY_TEAM_KEY);
  // Clear all per-dungeon team keys
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith(TEAM_KEY_PREFIX)) localStorage.removeItem(key);
  }
}
