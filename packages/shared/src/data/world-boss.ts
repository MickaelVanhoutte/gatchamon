import type { MissionReward } from '../types/rewards.js';
import type { WorldBossTier } from '../types/world-boss.js';

export const WORLD_BOSS_CONFIG = {
  templateId: 890,
  maxHp: 200_000_000,
  attacksPerDay: 1,
  teamSize: 20,
  simulationTurns: 3,
  // Eternatus template stat level used as the defender "wall" in the simulation.
  bossSimLevel: 60,
  bossSimStars: 6,
} as const;

export const WORLD_BOSS_TIER_THRESHOLDS: { tier: WorldBossTier; maxPercentile: number }[] = [
  { tier: 'top1', maxPercentile: 0.01 },
  { tier: 'top10', maxPercentile: 0.10 },
  { tier: 'top25', maxPercentile: 0.25 },
  { tier: 'top50', maxPercentile: 0.50 },
  { tier: 'participant', maxPercentile: 1.00 },
];

export const WORLD_BOSS_TIER_LABELS: Record<WorldBossTier, string> = {
  top1: 'Top 1%',
  top10: 'Top 10%',
  top25: 'Top 25%',
  top50: 'Top 50%',
  participant: 'Participant',
};

export const WORLD_BOSS_TIER_REWARDS: Record<WorldBossTier, MissionReward> = {
  top1: {
    legendaryPokeballs: 3,
    premiumPokeballs: 20,
    glowingPokeballs: 2,
    stardust: 5000,
    pokedollars: 50000,
    essences: { dragon_high: 10, poison_high: 10 },
  },
  top10: {
    legendaryPokeballs: 1,
    premiumPokeballs: 10,
    glowingPokeballs: 1,
    stardust: 2500,
    pokedollars: 25000,
    essences: { dragon_mid: 10, poison_mid: 10 },
  },
  top25: {
    premiumPokeballs: 8,
    stardust: 1500,
    pokedollars: 15000,
    essences: { dragon_mid: 5, poison_mid: 5 },
  },
  top50: {
    premiumPokeballs: 5,
    stardust: 1000,
    pokedollars: 10000,
    essences: { dragon_low: 10 },
  },
  participant: {
    regularPokeballs: 10,
    stardust: 500,
    pokedollars: 5000,
  },
};

export const WORLD_BOSS_ATTACK_DROP: MissionReward = {
  regularPokeballs: 2,
  pokedollars: 2000,
  stardust: 100,
};

/**
 * Return Monday 00:00 UTC of the week containing `now`.
 */
export function getWeekStartUtc(now: Date = new Date()): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + offsetToMonday);
  return d;
}

export function getWeekEndUtc(weekStart: Date): Date {
  const end = new Date(weekStart.getTime());
  end.setUTCDate(end.getUTCDate() + 7);
  return end;
}

/**
 * Assign tier by rank (1-based) and participant count.
 * Uses Math.max(1, Math.ceil(N * pct)) so sparse servers still award top tiers.
 */
export function tierForRank(rank: number, totalParticipants: number): WorldBossTier {
  if (totalParticipants <= 0) return 'participant';
  for (const { tier, maxPercentile } of WORLD_BOSS_TIER_THRESHOLDS) {
    const cutoff = Math.max(1, Math.ceil(totalParticipants * maxPercentile));
    if (rank <= cutoff) return tier;
  }
  return 'participant';
}
