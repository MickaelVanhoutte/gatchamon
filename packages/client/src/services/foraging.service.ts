import type { Player } from '@gatchamon/shared';
import { ELEMENTS } from '@gatchamon/shared';
import { loadPlayer, savePlayer } from './storage';

// ── Types ──────────────────────────────────────────────────────────────

export interface ForagingFind {
  type: 'pokedollars' | 'stardust' | 'regular_ball' | 'premium_ball' | 'legendary_ball' | 'glowing_ball' | 'essence';
  label: string;
  quantity: number;
  color: string;
  icon: string; // emoji or short icon id
}

export interface ForagingState {
  /** Accumulated playtime in ms since last find trigger */
  accumulatedMs: number;
  /** Map of pokemonInstanceId → pending find (null if none) */
  pendingFinds: Record<string, ForagingFind>;
  /** Timestamp of last state save */
  lastSaveTs: number;
}

// ── Constants ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'gatchamon_foraging';
const FIND_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

// ── Loot Table ─────────────────────────────────────────────────────────

interface LootEntry {
  weight: number;
  roll: () => ForagingFind;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(): string {
  const elems = ELEMENTS.filter(e => e !== 'magic');
  return elems[Math.floor(Math.random() * elems.length)];
}

const LOOT_TABLE: LootEntry[] = [
  // Pokedollars — common
  { weight: 30, roll: () => {
    const qty = randInt(500, 3000);
    return { type: 'pokedollars', label: 'Pokédollars', quantity: qty, color: '#fbbf24', icon: '💰' };
  }},
  // Stardust — uncommon
  { weight: 15, roll: () => {
    const qty = randInt(10, 50);
    return { type: 'stardust', label: 'Stardust', quantity: qty, color: '#c084fc', icon: '✨' };
  }},
  // Regular balls — common
  { weight: 25, roll: () => {
    const qty = randInt(2, 8);
    return { type: 'regular_ball', label: 'Pokéballs', quantity: qty, color: '#ef4444', icon: '🔴' };
  }},
  // Premium balls — uncommon
  { weight: 12, roll: () => {
    const qty = randInt(1, 3);
    return { type: 'premium_ball', label: 'Premium Balls', quantity: qty, color: '#60a5fa', icon: '🔵' };
  }},
  // Legendary balls — rare
  { weight: 2, roll: () => ({
    type: 'legendary_ball', label: 'Legendary Ball', quantity: 1, color: '#fbbf24', icon: '🟡',
  })},
  // Glowing balls — very rare
  { weight: 1, roll: () => ({
    type: 'glowing_ball', label: 'Glowing Ball', quantity: 1, color: '#a855f7', icon: '🟣',
  })},
  // Essences (low) — common
  { weight: 15, roll: () => {
    const elem = randomElement();
    const qty = randInt(3, 10);
    const name = elem.charAt(0).toUpperCase() + elem.slice(1);
    return { type: 'essence', label: `${name} Essence (Low)`, quantity: qty, color: '#4ade80', icon: '🧪' };
  }},
];

const TOTAL_WEIGHT = LOOT_TABLE.reduce((s, e) => s + e.weight, 0);

export function rollForagingLoot(): ForagingFind {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const entry of LOOT_TABLE) {
    roll -= entry.weight;
    if (roll <= 0) return entry.roll();
  }
  return LOOT_TABLE[0].roll();
}

// ── Grant the find to the player ───────────────────────────────────────

export function grantForagingFind(find: ForagingFind): void {
  const player = loadPlayer();
  if (!player) return;

  switch (find.type) {
    case 'pokedollars':
      player.pokedollars = (player.pokedollars ?? 0) + find.quantity;
      break;
    case 'stardust':
      player.stardust = (player.stardust ?? 0) + find.quantity;
      break;
    case 'regular_ball':
      player.regularPokeballs = (player.regularPokeballs ?? 0) + find.quantity;
      break;
    case 'premium_ball':
      player.premiumPokeballs = (player.premiumPokeballs ?? 0) + find.quantity;
      break;
    case 'legendary_ball':
      player.legendaryPokeballs = (player.legendaryPokeballs ?? 0) + find.quantity;
      break;
    case 'glowing_ball':
      player.glowingPokeballs = (player.glowingPokeballs ?? 0) + find.quantity;
      break;
    case 'essence': {
      // Extract element from label e.g. "Fire Essence (Low)" → "fire_low"
      const match = find.label.match(/^(\w+) Essence \((\w+)\)$/);
      if (match) {
        const essenceId = `${match[1].toLowerCase()}_${match[2].toLowerCase()}`;
        const materials = { ...(player.materials ?? {}) };
        materials[essenceId] = (materials[essenceId] ?? 0) + find.quantity;
        player.materials = materials;
      }
      break;
    }
  }

  savePlayer(player);
}

// ── State persistence ──────────────────────────────────────────────────

export function loadForagingState(): ForagingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { accumulatedMs: 0, pendingFinds: {}, lastSaveTs: Date.now() };
}

export function saveForagingState(state: ForagingState): void {
  state.lastSaveTs = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export { FIND_INTERVAL_MS };
