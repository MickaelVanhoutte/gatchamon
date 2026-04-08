import type { PokemonType, LeaderSkillDefinition, LeaderSkillStat } from '../types/pokemon.js';
import { POKEDEX } from './pokedex/index.js';

// ---------------------------------------------------------------------------
// Percentage tiers (Summoners War inspired)
// ---------------------------------------------------------------------------
// Stats are split into 3 groups with different % ranges:
//   - bulk/damage: hp, atk, def
//   - speed/crit:  spd, critRate
//   - utility:     acc, res

interface Tier { universal: number; restricted: number }

const TIERS: Record<3 | 4 | 5, { bulk: Tier; speed: Tier; utility: Tier }> = {
  3: { bulk: { universal: 15, restricted: 22 }, speed: { universal: 13, restricted: 19 }, utility: { universal: 25, restricted: 33 } },
  4: { bulk: { universal: 25, restricted: 33 }, speed: { universal: 19, restricted: 24 }, utility: { universal: 40, restricted: 50 } },
  5: { bulk: { universal: 33, restricted: 44 }, speed: { universal: 24, restricted: 33 }, utility: { universal: 55, restricted: 60 } },
};

function getTierGroup(stat: LeaderSkillStat): 'bulk' | 'speed' | 'utility' {
  if (stat === 'hp' || stat === 'atk' || stat === 'def') return 'bulk';
  if (stat === 'spd' || stat === 'critRate') return 'speed';
  return 'utility';
}

// Deterministic seeded selection
function seededPick<T>(seed: number, arr: readonly T[]): T {
  return arr[((seed % arr.length) + arr.length) % arr.length];
}

// All possible leader skill stats
const LEADER_STATS: readonly LeaderSkillStat[] = ['hp', 'atk', 'def', 'spd', 'critRate', 'acc', 'res'];

const STAT_LABELS: Record<LeaderSkillStat, string> = {
  hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD',
  critRate: 'Crit Rate', acc: 'Accuracy', res: 'Resistance',
};

const TYPE_LABELS: Record<PokemonType, string> = {
  normal: 'Normal', fire: 'Fire', water: 'Water', grass: 'Grass',
  electric: 'Electric', ice: 'Ice', fighting: 'Fighting', poison: 'Poison',
  ground: 'Ground', flying: 'Flying', psychic: 'Psychic', bug: 'Bug',
  rock: 'Rock', ghost: 'Ghost', dragon: 'Dragon', fairy: 'Fairy',
  dark: 'Dark', steel: 'Steel',
};

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

export function generateLeaderSkill(
  templateId: number,
  naturalStars: number,
  types: PokemonType[],
): LeaderSkillDefinition | undefined {
  if (naturalStars < 3 || naturalStars > 5) return undefined;
  const stars = naturalStars as 3 | 4 | 5;

  // Seed-based deterministic picks
  const seed1 = templateId * 31;
  const seed2 = templateId * 17 + 7;
  const seed3 = templateId * 13 + 3;

  // Pick which stat this leader skill boosts
  const stat = seededPick(seed1, LEADER_STATS);

  // Decide universal vs element-restricted
  // Higher star mons lean toward universal; lower toward restricted
  // Use a deterministic ratio: 3★ → 40% universal, 4★ → 55% universal, 5★ → 70% universal
  const universalChance = stars === 3 ? 40 : stars === 4 ? 55 : 70;
  const isUniversal = (seed2 % 100) < universalChance;

  const tierGroup = getTierGroup(stat);
  const tier = TIERS[stars][tierGroup];
  const percent = isUniversal ? tier.universal : tier.restricted;

  let elementRestriction: PokemonType | undefined;
  if (!isUniversal) {
    // Pick from the mon's own types
    elementRestriction = seededPick(seed3, types);
  }

  return { stat, percent, elementRestriction };
}

// ---------------------------------------------------------------------------
// Description helper
// ---------------------------------------------------------------------------

export function describeLeaderSkill(ls: LeaderSkillDefinition): string {
  const statLabel = STAT_LABELS[ls.stat];
  if (ls.elementRestriction) {
    const typeLabel = TYPE_LABELS[ls.elementRestriction];
    return `Increases ${statLabel} of ${typeLabel} allies by ${ls.percent}%`;
  }
  return `Increases the ${statLabel} of all allies by ${ls.percent}%`;
}

// ---------------------------------------------------------------------------
// Init — patches POKEDEX templates with generated leader skills
// ---------------------------------------------------------------------------

export function initLeaderSkills(): void {
  for (const template of POKEDEX) {
    // Respect hand-written overrides
    if (template.leaderSkill) continue;
    const ls = generateLeaderSkill(template.id, template.naturalStars, template.types);
    if (ls) {
      (template as any).leaderSkill = ls;
    }
  }
}
