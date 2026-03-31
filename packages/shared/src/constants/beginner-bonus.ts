/**
 * Beginner Bonus — first 30 days after account creation.
 *
 * Doubles XP & stardust, boosts 5★ rate by +2% and 4★ by +4%,
 * increases essence drops and held-item drop count.
 */

const BEGINNER_BONUS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const BEGINNER_BONUS = {
  xpMult: 2,
  pokedollarMult: 2,
  essenceMult: 1.5,
  itemDropBonusChance: 0.5, // +50% chance of extra item drop
  summon5StarBonus: 2,      // +2% absolute
  summon4StarBonus: 4,      // +4% absolute
} as const;

export function isBeginnerBonusActive(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  if (isNaN(created)) return false;
  return Date.now() - created < BEGINNER_BONUS_DURATION_MS;
}
