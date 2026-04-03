import type { MysteryDungeonDef, MysteryDungeonFloor } from '../types/evolution.js';
import { ACTIVE_POKEDEX } from './gen-filter.js';
import { EVOLUTION_CHAINS } from './evolutions.js';
import { getEvolutionLineage } from './evolutions.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Pieces needed to summon a Pokemon by its naturalStars */
export const PIECE_COST: Record<number, number> = { 2: 20, 3: 30, 4: 40 };

/** Energy cost per floor index (0-9) */
const FLOOR_ENERGY_COSTS = [2, 2, 3, 3, 4, 4, 5, 5, 6, 6];

/** Set of templateIds that are evolution targets (not base forms) */
const EVOLUTION_TARGETS = new Set(EVOLUTION_CHAINS.map(c => c.to));

// ---------------------------------------------------------------------------
// Candidate pool — base forms, 2-4 stars, summonable, active gen
// ---------------------------------------------------------------------------

const CANDIDATE_POOL = ACTIVE_POKEDEX
  .filter(p =>
    p.naturalStars >= 2 &&
    p.naturalStars <= 4 &&
    p.summonable !== false &&
    !EVOLUTION_TARGETS.has(p.id),
  )
  .sort((a, b) => a.id - b.id);   // deterministic order

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Returns "YYYY-MM-DD" in UTC for the given date */
export function getMysteryDungeonDateKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Returns midnight UTC of the next day */
export function getMysteryDungeonResetTime(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setUTCHours(24, 0, 0, 0);
  return d;
}

// ---------------------------------------------------------------------------
// Deterministic hash
// ---------------------------------------------------------------------------

function hashDate(dateStr: string): number {
  let hash = 5381;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) + hash) + dateStr.charCodeAt(i);
  }
  return Math.abs(hash);
}

/** Shift a date key by N days */
function shiftDateKey(dateKey: string, days: number): string {
  const d = new Date(dateKey + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Pick the featured templateId for a date, avoiding previous 3 days */
function pickFeatured(dateKey: string): number {
  const pool = CANDIDATE_POOL;
  if (pool.length === 0) throw new Error('No candidate Pokemon for Mystery Dungeon');

  // Compute previous 3 days' picks (without anti-repeat, to break recursion)
  const recentIds = new Set<number>();
  for (let d = 1; d <= 3; d++) {
    const prevKey = shiftDateKey(dateKey, -d);
    const prevHash = hashDate(prevKey);
    recentIds.add(pool[prevHash % pool.length].id);
  }

  const seed = hashDate(dateKey);
  let idx = seed % pool.length;

  // Advance until we find one not in the recent set
  let attempts = 0;
  while (recentIds.has(pool[idx].id) && attempts < pool.length) {
    idx = (idx + 1) % pool.length;
    attempts++;
  }

  return pool[idx].id;
}

// ---------------------------------------------------------------------------
// Floor generation
// ---------------------------------------------------------------------------

function buildFloors(baseId: number, naturalStars: number): MysteryDungeonFloor[] {
  const lineage = getEvolutionLineage(baseId);
  const base = lineage[0];
  const evo1 = lineage[1] ?? base;
  const evo2 = lineage[2] ?? evo1;
  const finalEvo = lineage[lineage.length - 1];

  const cap = (s: number) => Math.min(s, 6) as number;

  return [
    { enemyLevel: 10, enemies: [base, base, base],  enemyStars: cap(naturalStars),   pieceReward: 1 },
    { enemyLevel: 18, enemies: [base, base, base],  enemyStars: cap(naturalStars),   pieceReward: 1 },
    { enemyLevel: 25, enemies: [base, base, base],  enemyStars: cap(naturalStars + 1), statBoost: 1.1, pieceReward: 2 },
    { enemyLevel: 32, enemies: [base, base, evo1],  enemyStars: cap(naturalStars + 1), statBoost: 1.2, speedBonus: 10, pieceReward: 2 },
    { enemyLevel: 38, enemies: [base, evo1, evo1],  enemyStars: cap(naturalStars + 2), statBoost: 1.3, speedBonus: 20, pieceReward: 3 },
    { enemyLevel: 42, enemies: [evo1, evo1, evo1],  enemyStars: cap(naturalStars + 2), statBoost: 1.5, speedBonus: 30, pieceReward: 3 },
    { enemyLevel: 48, enemies: [evo1, evo1, evo2],  enemyStars: 5,                    statBoost: 1.7, speedBonus: 40, pieceReward: 4 },
    { enemyLevel: 52, enemies: [evo1, evo2, evo2],  enemyStars: 5,                    statBoost: 2.0, speedBonus: 50, pieceReward: 4 },
    { enemyLevel: 56, enemies: [evo2, evo2, evo2],  enemyStars: 6,                    statBoost: 2.3, speedBonus: 60, pieceReward: 5 },
    { enemyLevel: 60, enemies: [finalEvo, finalEvo, finalEvo], enemyStars: 6,          statBoost: 2.8, speedBonus: 80, pieceReward: 5 },
  ];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const defCache = new Map<string, MysteryDungeonDef>();

export function getMysteryDungeonDef(dateKey?: string): MysteryDungeonDef {
  const key = dateKey ?? getMysteryDungeonDateKey();

  const cached = defCache.get(key);
  if (cached) return cached;

  const templateId = pickFeatured(key);
  const template = ACTIVE_POKEDEX.find(p => p.id === templateId)!;
  const floors = buildFloors(templateId, template.naturalStars);

  const def: MysteryDungeonDef = {
    featuredTemplateId: templateId,
    dateKey: key,
    name: 'Mystery Dungeon',
    description: `Today's featured Pokemon: ${template.name}. Defeat enemies to earn pieces!`,
    energyCosts: FLOOR_ENERGY_COSTS,
    floors,
  };

  defCache.set(key, def);
  return def;
}
