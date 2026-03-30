import type { InboxItem, MissionReward, HeldItemInstance, HeldItemSlot, HeldItemMainStatType } from '@gatchamon/shared';
import { isBeginnerBonusActive, computeMainStatValue } from '@gatchamon/shared';
import { loadInbox, updateInboxItem, addInboxItem, removeReadInboxItems, loadPlayer, addHeldItem, hasGrantedFlag, setGrantedFlag } from './storage';
import { applyReward } from './reward.service';

export function getInboxItems(): InboxItem[] {
  const items = loadInbox();
  const now = new Date().toISOString();
  return items.filter(item => !item.expiresAt || item.expiresAt > now);
}

export function getUnreadInboxCount(): number {
  return getInboxItems().filter(item => !item.claimed).length;
}

export function markAsRead(id: string): void {
  updateInboxItem(id, { read: true });
}

export function clearReadMessages(): number {
  const before = getInboxItems().length;
  removeReadInboxItems();
  const after = getInboxItems().length;
  return before - after;
}

export function claimInboxReward(id: string): { reward?: MissionReward; specialItem?: string } | null {
  const items = loadInbox();
  const item = items.find(i => i.id === id);
  if (!item || item.claimed) return null;

  if (item.expiresAt && item.expiresAt < new Date().toISOString()) return null;

  updateInboxItem(id, { claimed: true, read: true });

  if (item.reward) {
    applyReward(item.reward);
  }

  // Beginner item set: create and add all 6 crafted items
  if (item.specialItem === 'beginner-item-set') {
    const player = loadPlayer();
    if (player) {
      const craftedItems = createBeginnerItemSet(player.id);
      for (const ci of craftedItems) addHeldItem(ci);
    }
  }

  return { reward: item.reward, specialItem: item.specialItem };
}

export function sendInboxItem(
  item: Omit<InboxItem, 'id' | 'read' | 'claimed' | 'createdAt'>,
): void {
  const fullItem: InboxItem = {
    ...item,
    id: crypto.randomUUID(),
    read: false,
    claimed: false,
    createdAt: new Date().toISOString(),
  };
  addInboxItem(fullItem);
}

export function sendRetrySummonGift(): void {
  if (hasGrantedFlag('retry-summon-welcome')) return;

  sendInboxItem({
    title: 'Welcome Gift: 100x Retry Summon!',
    message:
      'Congratulations on completing the tutorial! Use this special ticket to perform a x10 premium summon up to 100 times. Save a backup and keep the best result!',
    specialItem: 'retry-summon-100',
  });
  setGrantedFlag('retry-summon-welcome');
}

// ── Beginner Item Set ──────────────────────────────────────────────────

function craftItem(
  ownerId: string,
  setId: string,
  slot: HeldItemSlot,
  mainStat: HeldItemMainStatType,
  subStats: { type: HeldItemMainStatType; value: number }[],
): HeldItemInstance {
  return {
    itemId: crypto.randomUUID(),
    setId,
    slot,
    stars: 6,
    grade: 'legend',
    level: 15,
    mainStat,
    mainStatValue: computeMainStatValue(mainStat, 6, 15),
    subStats,
    equippedTo: null,
    ownerId,
  };
}

/**
 * Create 6 crafted items: 4x King's Rock (slots 1-4) + 2x Quick Claw (slots 5-6).
 * All 6-star legend grade, level 15, with optimized substats (SPD, CRI Dmg, ATK).
 */
function createBeginnerItemSet(ownerId: string): HeldItemInstance[] {
  return [
    // King's Rock slot 1 — main: ATK (fixed)
    craftItem(ownerId, 'kings_rock', 1, 'atk_flat', [
      { type: 'spd_flat', value: 13 },
      { type: 'critDmg',  value: 13 },
      { type: 'atk_pct',  value: 15 },
      { type: 'hp_pct',   value: 7  },
    ]),
    // King's Rock slot 2 — main: SPD
    craftItem(ownerId, 'kings_rock', 2, 'spd_flat', [
      { type: 'critDmg',  value: 13 },
      { type: 'atk_pct',  value: 15 },
      { type: 'atk_flat', value: 38 },
      { type: 'hp_pct',   value: 7  },
    ]),
    // King's Rock slot 3 — main: DEF (fixed)
    craftItem(ownerId, 'kings_rock', 3, 'def_flat', [
      { type: 'spd_flat', value: 13 },
      { type: 'critDmg',  value: 13 },
      { type: 'atk_pct',  value: 15 },
      { type: 'atk_flat', value: 20 },
    ]),
    // King's Rock slot 4 — main: CRI Dmg
    craftItem(ownerId, 'kings_rock', 4, 'critDmg', [
      { type: 'spd_flat', value: 13 },
      { type: 'atk_pct',  value: 15 },
      { type: 'atk_flat', value: 38 },
      { type: 'critRate',  value: 5  },
    ]),
    // Quick Claw slot 5 — main: HP (fixed)
    craftItem(ownerId, 'quick_claw', 5, 'hp_flat', [
      { type: 'spd_flat', value: 13 },
      { type: 'critDmg',  value: 13 },
      { type: 'atk_pct',  value: 15 },
      { type: 'atk_flat', value: 20 },
    ]),
    // Quick Claw slot 6 — main: ATK%
    craftItem(ownerId, 'quick_claw', 6, 'atk_pct', [
      { type: 'spd_flat', value: 13 },
      { type: 'critDmg',  value: 13 },
      { type: 'critRate',  value: 10 },
      { type: 'atk_flat', value: 20 },
    ]),
  ];
}

/**
 * Grant 100 energy to new players (account < 3 months old).
 * Safe to call on every app load — skips if already granted or not eligible.
 */
export function grantNewPlayerEnergyBonus(): void {
  if (hasGrantedFlag('new-player-energy-bonus')) return;

  const player = loadPlayer();
  if (!player) return;

  // Only for accounts less than 3 months old
  if (!player.createdAt) return;
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  if (new Date(player.createdAt) < threeMonthsAgo) return;

  sendInboxItem({
    title: 'New Player Bonus: 100 Energy',
    message: 'Welcome, new trainer! Here\'s some energy to help you on your journey.',
    reward: { energy: 100 },
  });
  setGrantedFlag('new-player-energy-bonus');
}

/**
 * Grant beginner item set (4x King's Rock + 2x Quick Claw).
 * Safe to call on every app load — skips if already granted or not eligible.
 * Grants to any player within 30 days, or any player missing createdAt (legacy accounts
 * that were created before the field existed — they still deserve the starter set).
 */
export function grantBeginnerItemSet(): void {
  if (hasGrantedFlag('beginner-item-set')) return;

  const player = loadPlayer();
  if (!player) return;

  // Grant if beginner bonus is active, OR if createdAt is missing (legacy account)
  const eligible = !player.createdAt || isBeginnerBonusActive(player.createdAt);
  if (!eligible) return;

  sendInboxItem({
    title: 'Beginner Bonus: Starter Item Set!',
    message:
      "Here's a full set of max-level held items to get you started! 4x King's Rock (22% extra turn) + 2x Quick Claw (+12% SPD) — all optimized for speed, crit damage, and attack.",
    specialItem: 'beginner-item-set',
  });
  setGrantedFlag('beginner-item-set');
}
