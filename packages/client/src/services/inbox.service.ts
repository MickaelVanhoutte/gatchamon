import type { InboxItem, MissionReward } from '@gatchamon/shared';
import { isBeginnerBonusActive } from '@gatchamon/shared';
import { loadInbox, updateInboxItem, addInboxItem } from './storage';
import { loadPlayer } from './storage';
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
  const items = loadInbox();
  if (items.some(i => i.specialItem === 'retry-summon-100')) return;

  sendInboxItem({
    title: 'Welcome Gift: 100x Retry Summon!',
    message:
      'Congratulations on completing the tutorial! Use this special ticket to perform a x10 premium summon up to 100 times. Save a backup and keep the best result!',
    specialItem: 'retry-summon-100',
  });

  // Beginner bonus: 2 extra retry summon tickets for new players
  const player = loadPlayer();
  if (player && isBeginnerBonusActive(player.createdAt)) {
    for (let i = 0; i < 2; i++) {
      sendInboxItem({
        title: `Beginner Bonus: 100x Retry Summon (${i + 1}/2)`,
        message:
          'As a new trainer, enjoy this bonus 100x Retry Summon! Perform a x10 premium summon up to 100 times and keep the best result.',
        specialItem: 'retry-summon-100',
      });
    }
  }
}
