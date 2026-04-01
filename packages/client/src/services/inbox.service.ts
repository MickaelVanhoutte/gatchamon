import type { InboxItem, MissionReward } from '@gatchamon/shared';
import { isBeginnerBonusActive } from '@gatchamon/shared';
import { loadInbox, updateInboxItem, addInboxItem, removeReadInboxItems, loadPlayer, hasGrantedFlag, setGrantedFlag } from './storage';
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

