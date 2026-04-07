import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema.js';
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
  getItemSellValue,
} from '@gatchamon/shared';
import { spendPokedollars, earnPokedollars } from './player.service.js';

// ── Helpers ────────────────────────────────────────────────────────────

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

function rollSubStatValue(type: HeldItemMainStatType, stars: number): number {
  const range = SUB_STAT_RANGES[type]?.[stars];
  if (!range) return 1;
  return randInt(range[0], range[1]);
}

function pickRandomSubStat(exclude: HeldItemMainStatType[]): HeldItemMainStatType {
  const available = ALL_SUB_STAT_TYPES.filter(t => !exclude.includes(t));
  if (available.length === 0) return 'hp_flat';
  return available[Math.floor(Math.random() * available.length)];
}

function rowToItem(row: any): HeldItemInstance {
  return {
    itemId: row.item_id,
    setId: row.set_id,
    slot: row.slot,
    stars: row.stars,
    grade: row.grade,
    level: row.level,
    mainStat: row.main_stat,
    mainStatValue: row.main_stat_value,
    subStats: JSON.parse(row.sub_stats),
    equippedTo: row.equipped_to,
    ownerId: row.owner_id,
  };
}

function saveItemToDb(item: HeldItemInstance): void {
  getDb().prepare(`
    INSERT INTO held_items (item_id, owner_id, set_id, slot, stars, grade, level, main_stat, main_stat_value, sub_stats, equipped_to)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    item.itemId, item.ownerId, item.setId, item.slot, item.stars, item.grade,
    item.level, item.mainStat, item.mainStatValue, JSON.stringify(item.subStats),
    item.equippedTo,
  );
}

function updateItemInDb(item: HeldItemInstance): void {
  getDb().prepare(`
    UPDATE held_items SET level = ?, main_stat_value = ?, sub_stats = ?, equipped_to = ? WHERE item_id = ?
  `).run(item.level, item.mainStatValue, JSON.stringify(item.subStats), item.equippedTo, item.itemId);
}

// ── Generate ───────────────────────────────────────────────────────────

export function generateItem(
  setId: string,
  slot: HeldItemSlot,
  stars: number,
  grade: HeldItemGrade,
  ownerId: string,
): HeldItemInstance {
  const pool = SLOT_MAIN_STAT_POOL[slot];
  const mainStat = pool[Math.floor(Math.random() * pool.length)];
  const mainStatValue = computeMainStatValue(mainStat, stars, 0);

  const numSubs = GRADE_INITIAL_SUBSTATS[grade];
  const subStats: { type: HeldItemMainStatType; value: number }[] = [];
  const excluded: HeldItemMainStatType[] = [mainStat];

  for (let i = 0; i < numSubs; i++) {
    const subType = pickRandomSubStat(excluded);
    excluded.push(subType);
    subStats.push({ type: subType, value: rollSubStatValue(subType, stars) });
  }

  const item: HeldItemInstance = {
    itemId: uuidv4(),
    setId,
    slot,
    stars: stars as HeldItemInstance['stars'],
    grade,
    level: 0,
    mainStat,
    mainStatValue,
    subStats,
    equippedTo: null,
    ownerId,
  };

  saveItemToDb(item);
  return item;
}

export function rollItemDrop(drop: ItemDungeonDrop, ownerId: string): HeldItemInstance {
  const stars = randInt(drop.minStars, drop.maxStars) as 1 | 2 | 3 | 4 | 5 | 6;
  const grade = weightedRandom(drop.gradeWeights);
  const slot = randInt(1, 6) as HeldItemSlot;
  return generateItem(drop.setId, slot, stars, grade, ownerId);
}

// ── List ───────────────────────────────────────────────────────────────

export function getPlayerItems(playerId: string): HeldItemInstance[] {
  const rows = getDb().prepare('SELECT * FROM held_items WHERE owner_id = ?').all(playerId) as any[];
  return rows.map(rowToItem);
}

export function getItemsForPokemon(playerId: string, instanceId: string): HeldItemInstance[] {
  const rows = getDb().prepare(
    'SELECT * FROM held_items WHERE owner_id = ? AND equipped_to = ?'
  ).all(playerId, instanceId) as any[];
  return rows.map(rowToItem);
}

// ── Equip / Unequip ───────────────────────────────────────────────────

export function equipItem(playerId: string, itemId: string, pokemonInstanceId: string): void {
  const db = getDb();
  const row = db.prepare('SELECT * FROM held_items WHERE item_id = ? AND owner_id = ?').get(itemId, playerId) as any;
  if (!row) throw new Error('Item not found');
  const item = rowToItem(row);

  // Unequip any item in the same slot on the target pokemon
  db.prepare(
    'UPDATE held_items SET equipped_to = NULL WHERE owner_id = ? AND equipped_to = ? AND slot = ? AND item_id != ?'
  ).run(playerId, pokemonInstanceId, item.slot, itemId);

  // Equip
  db.prepare('UPDATE held_items SET equipped_to = ? WHERE item_id = ?').run(pokemonInstanceId, itemId);
}

export function unequipItem(playerId: string, itemId: string): void {
  spendPokedollars(playerId, ITEM_REMOVAL_COST);
  const db = getDb();
  const row = db.prepare('SELECT * FROM held_items WHERE item_id = ? AND owner_id = ?').get(itemId, playerId) as any;
  if (!row) throw new Error('Item not found');
  db.prepare('UPDATE held_items SET equipped_to = NULL WHERE item_id = ?').run(itemId);
}

// ── Upgrade ───────────────────────────────────────────────────────────

export interface UpgradeResult {
  success: boolean;
  cost: number;
  item: HeldItemInstance;
  newSubStat?: { type: HeldItemMainStatType; value: number; isNew: boolean };
}

export function upgradeItem(playerId: string, itemId: string): UpgradeResult {
  const db = getDb();
  const row = db.prepare('SELECT * FROM held_items WHERE item_id = ? AND owner_id = ?').get(itemId, playerId) as any;
  if (!row) throw new Error('Item not found');
  const item = rowToItem(row);
  if (item.level >= 15) throw new Error('Item is already max level');

  const cost = getUpgradeCost(item.level, item.stars);
  spendPokedollars(playerId, cost);

  const targetLevel = item.level + 1;
  const successRate = getUpgradeSuccessRate(targetLevel);
  const success = Math.random() < successRate;

  if (!success) {
    return { success: false, cost, item };
  }

  item.level = targetLevel;
  item.mainStatValue = computeMainStatValue(item.mainStat, item.stars, item.level);

  let newSubStat: UpgradeResult['newSubStat'] = undefined;
  if (targetLevel % 3 === 0 && targetLevel <= 12) {
    if (item.subStats.length < 4) {
      const excluded: HeldItemMainStatType[] = [item.mainStat, ...item.subStats.map(s => s.type)];
      const newType = pickRandomSubStat(excluded);
      const newValue = rollSubStatValue(newType, item.stars);
      item.subStats.push({ type: newType, value: newValue });
      newSubStat = { type: newType, value: newValue, isNew: true };
    } else {
      const idx = Math.floor(Math.random() * item.subStats.length);
      const sub = item.subStats[idx];
      const bonus = rollSubStatValue(sub.type, item.stars);
      sub.value += bonus;
      newSubStat = { type: sub.type, value: bonus, isNew: false };
    }
  }

  updateItemInDb(item);
  return { success: true, cost, item, newSubStat };
}

// ── Sell ───────────────────────────────────────────────────────────────

export function sellItems(playerId: string, itemIds: string[]): number {
  const db = getDb();
  let totalValue = 0;

  const txn = db.transaction(() => {
    for (const itemId of itemIds) {
      const row = db.prepare('SELECT * FROM held_items WHERE item_id = ? AND owner_id = ?').get(itemId, playerId) as any;
      if (!row) continue;
      const item = rowToItem(row);
      if (item.equippedTo !== null) continue; // skip equipped
      totalValue += getItemSellValue(item);
      db.prepare('DELETE FROM held_items WHERE item_id = ?').run(itemId);
    }
    if (totalValue > 0) {
      earnPokedollars(playerId, totalValue);
    }
  });
  txn();

  return totalValue;
}
