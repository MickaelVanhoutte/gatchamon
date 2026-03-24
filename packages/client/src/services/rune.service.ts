import type { HeldItemInstance, HeldItemGrade, HeldItemMainStatType, HeldItemSlot, ItemDungeonDrop } from '@gatchamon/shared';
import {
  SLOT_MAIN_STAT_POOL,
  ALL_SUB_STAT_TYPES,
  SUB_STAT_RANGES,
  GRADE_INITIAL_SUBSTATS,
  ITEM_REMOVAL_COST,
  computeMainStatValue,
  getUpgradeCost,
  getUpgradeSuccessRate,
} from '@gatchamon/shared';
import { loadHeldItems, saveHeldItems, getItemsForPokemon } from './storage';
import { spendStardust } from './player.service';

// ── Random helpers ──────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedRandom<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, w]) => sum + (w as number), 0);
  let roll = Math.random() * total;
  for (const [key, weight] of entries) {
    roll -= weight as number;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

// ── Sub stat generation ─────────────────────────────────────────────────

function rollSubStatValue(type: HeldItemMainStatType, stars: number): number {
  const range = SUB_STAT_RANGES[type]?.[stars];
  if (!range) return 1;
  return randInt(range[0], range[1]);
}

function pickRandomSubStat(exclude: HeldItemMainStatType[]): HeldItemMainStatType {
  const available = ALL_SUB_STAT_TYPES.filter(t => !exclude.includes(t));
  if (available.length === 0) return 'hp_flat'; // fallback
  return available[Math.floor(Math.random() * available.length)];
}

// ── Generate a held item ────────────────────────────────────────────────

export function generateItem(
  setId: string,
  slot: HeldItemSlot,
  stars: number,
  grade: HeldItemGrade,
  ownerId: string,
): HeldItemInstance {
  // Pick main stat
  const pool = SLOT_MAIN_STAT_POOL[slot];
  const mainStat = pool[Math.floor(Math.random() * pool.length)];
  const mainStatValue = computeMainStatValue(mainStat, stars, 0);

  // Generate initial sub stats based on grade
  const numSubs = GRADE_INITIAL_SUBSTATS[grade];
  const subStats: { type: HeldItemMainStatType; value: number }[] = [];
  const excluded: HeldItemMainStatType[] = [mainStat];

  for (let i = 0; i < numSubs; i++) {
    const subType = pickRandomSubStat(excluded);
    excluded.push(subType);
    subStats.push({ type: subType, value: rollSubStatValue(subType, stars) });
  }

  return {
    itemId: crypto.randomUUID(),
    setId,
    slot: slot as HeldItemSlot,
    stars: stars as 1 | 2 | 3 | 4 | 5 | 6,
    grade,
    level: 0,
    mainStat,
    mainStatValue,
    subStats,
    equippedTo: null,
    ownerId,
  };
}

// ── Equip / Unequip ─────────────────────────────────────────────────────

export function equipItem(itemId: string, pokemonInstanceId: string): void {
  const items = loadHeldItems();
  const item = items.find(i => i.itemId === itemId);
  if (!item) throw new Error('Item not found');

  // Remove any item currently in that slot on the target pokemon
  for (const other of items) {
    if (other.equippedTo === pokemonInstanceId && other.slot === item.slot && other.itemId !== itemId) {
      other.equippedTo = null;
    }
  }

  // If item was equipped elsewhere, just move it (no cost for swapping)
  item.equippedTo = pokemonInstanceId;
  saveHeldItems(items);
}

export function unequipItem(itemId: string): void {
  // Costs stardust
  spendStardust(ITEM_REMOVAL_COST);

  const items = loadHeldItems();
  const item = items.find(i => i.itemId === itemId);
  if (!item) throw new Error('Item not found');
  item.equippedTo = null;
  saveHeldItems(items);
}

// ── Upgrade ─────────────────────────────────────────────────────────────

export interface UpgradeResult {
  success: boolean;
  cost: number;
  item: HeldItemInstance;
  newSubStat?: { type: HeldItemMainStatType; value: number; isNew: boolean };
}

export function upgradeItem(itemId: string): UpgradeResult {
  const items = loadHeldItems();
  const item = items.find(i => i.itemId === itemId);
  if (!item) throw new Error('Item not found');
  if (item.level >= 15) throw new Error('Item is already max level');

  const cost = getUpgradeCost(item.level, item.stars);
  spendStardust(cost);

  const targetLevel = item.level + 1;
  const successRate = getUpgradeSuccessRate(targetLevel);
  const success = Math.random() < successRate;

  if (!success) {
    saveHeldItems(items);
    return { success: false, cost, item };
  }

  // Upgrade main stat
  item.level = targetLevel;
  item.mainStatValue = computeMainStatValue(item.mainStat, item.stars, item.level);

  // Sub stat upgrade at +3, +6, +9, +12
  let newSubStat: UpgradeResult['newSubStat'] = undefined;
  if (targetLevel % 3 === 0 && targetLevel <= 12) {
    if (item.subStats.length < 4) {
      // Add new sub stat
      const excluded: HeldItemMainStatType[] = [item.mainStat, ...item.subStats.map(s => s.type)];
      const newType = pickRandomSubStat(excluded);
      const newValue = rollSubStatValue(newType, item.stars);
      item.subStats.push({ type: newType, value: newValue });
      newSubStat = { type: newType, value: newValue, isNew: true };
    } else {
      // Upgrade random existing sub stat
      const idx = Math.floor(Math.random() * item.subStats.length);
      const sub = item.subStats[idx];
      const bonus = rollSubStatValue(sub.type, item.stars);
      sub.value += bonus;
      newSubStat = { type: sub.type, value: bonus, isNew: false };
    }
  }

  saveHeldItems(items);
  return { success: true, cost, item, newSubStat };
}

// ── Dungeon drop rolling ────────────────────────────────────────────────

export function rollItemDrop(drop: ItemDungeonDrop, ownerId: string): HeldItemInstance {
  const stars = randInt(drop.minStars, drop.maxStars) as 1 | 2 | 3 | 4 | 5 | 6;
  const grade = weightedRandom(drop.gradeWeights);
  const slot = randInt(1, 6) as HeldItemSlot;
  return generateItem(drop.setId, slot, stars, grade, ownerId);
}

// ── Helpers ─────────────────────────────────────────────────────────────

export function getUnequippedItems(): HeldItemInstance[] {
  return loadHeldItems().filter(i => i.equippedTo === null);
}

export function getItemsForSlot(slot: HeldItemSlot): HeldItemInstance[] {
  return loadHeldItems().filter(i => i.slot === slot);
}

export { getItemsForPokemon };
