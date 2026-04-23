import type { MissionReward } from './rewards.js';

export type WorldBossTier = 'top1' | 'top10' | 'top25' | 'top50' | 'participant';

export interface WorldBossState {
  bossId: string;
  templateId: number;
  weekStart: string;
  weekEnd: string;
  maxHp: number;
  currentHp: number;
  defeated: boolean;
  defeatedAt: string | null;
  settled: boolean;
  participants: number;
}

export interface WorldBossAttackRecord {
  playerId: string;
  playerName: string;
  totalDamage: number;
  attacks: number;
  lastAttackDate: string | null;
}

export interface WorldBossLadderEntry extends WorldBossAttackRecord {
  rank: number;
  percentile: number;
  tier: WorldBossTier;
}

export interface WorldBossPerMonDamage {
  instanceId: string;
  templateId: number;
  damage: number;
}

export interface WorldBossAttackResult {
  damageDealt: number;
  perMon: WorldBossPerMonDamage[];
  hpBefore: number;
  hpAfter: number;
  killedBoss: boolean;
  instantReward: MissionReward;
  rank: number;
  totalDamage: number;
}

export interface WorldBossStatusResponse {
  boss: WorldBossState;
  player: {
    canAttackToday: boolean;
    totalDamage: number;
    attacks: number;
    rank: number | null;
    tier: WorldBossTier | null;
  };
  topEntries: WorldBossLadderEntry[];
  totalParticipants: number;
}

export interface WorldBossLadderResponse {
  bossId: string;
  entries: WorldBossLadderEntry[];
  myEntry: WorldBossLadderEntry | null;
  totalParticipants: number;
}
