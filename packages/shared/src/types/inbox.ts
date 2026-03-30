import type { MissionReward } from './rewards.js';

export interface InboxItem {
  id: string;
  title: string;
  message: string;
  reward?: MissionReward;
  /** Special item type for non-standard rewards (e.g. retry summon ticket) */
  specialItem?: 'retry-summon-100' | 'beginner-item-set';
  read: boolean;
  claimed: boolean;
  createdAt: string;
  expiresAt?: string;
}
