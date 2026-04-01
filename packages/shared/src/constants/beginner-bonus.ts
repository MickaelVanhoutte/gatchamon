/**
 * Beginner Bonus — first 30 days after account creation.
 *
 * 1.5x Pokémon XP & pokédollars, +2% to 4★ summon rate.
 */

const BEGINNER_BONUS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const BEGINNER_BONUS = {
  xpMult: 1.5,
  pokedollarMult: 1.5,
  essenceMult: 1,             // no bonus
  itemDropBonusChance: 0,     // no bonus
  summon5StarBonus: 0,        // no bonus
  summon4StarBonus: 2,        // +2% absolute
} as const;

export function isBeginnerBonusActive(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  if (isNaN(created)) return false;
  return Date.now() - created < BEGINNER_BONUS_DURATION_MS;
}
