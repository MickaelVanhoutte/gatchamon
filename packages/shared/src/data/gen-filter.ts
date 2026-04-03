import { GEN1 } from './pokedex/gen1.js';
import { GEN2 } from './pokedex/gen2.js';
import { POKEDEX } from './pokedex/index.js';
import { EVOLUTION_CHAINS } from './evolutions.js';
import type { PokemonTemplate } from '../types/pokemon.js';
import type { EvolutionChain } from '../types/evolution.js';

// ── Generation restriction ──────────────────────────────────────────────────
// Flip to false to restore all generations.
export const GEN_RESTRICTION_ENABLED = true;

const GEN1_IDS = new Set(GEN1.map(p => p.id));
const GEN2_IDS = new Set(GEN2.map(p => p.id));
const ACTIVE_GEN_IDS = new Set([...GEN1_IDS, ...GEN2_IDS]);

/** Check whether a template ID is a Gen 1 Pokemon or a Mega form of one. */
export function isGen1Pokemon(id: number): boolean {
  if (id < 10000) return GEN1_IDS.has(id);
  const prefix = Math.floor(id / 1000);
  if (prefix !== 10) return false;
  return GEN1_IDS.has(id % 1000);
}

/** Check whether a template ID is a Gen 2 Pokemon or a Mega form of one. */
export function isGen2Pokemon(id: number): boolean {
  if (id < 10000) return GEN2_IDS.has(id);
  const prefix = Math.floor(id / 1000);
  if (prefix !== 10) return false;
  return GEN2_IDS.has(id % 1000);
}

/** Check whether a template ID is currently available for gameplay. */
export function isActivePokemon(id: number): boolean {
  if (!GEN_RESTRICTION_ENABLED) return true;
  if (id < 10000) return ACTIVE_GEN_IDS.has(id);
  // Forms use encoding: variantPrefix * 1000 + baseId
  // Only allow Mega forms (10xxx), not regional forms (11xxx Alola, 12xxx Galar, 13xxx Hisui)
  const prefix = Math.floor(id / 1000);
  if (prefix !== 10) return false;
  return ACTIVE_GEN_IDS.has(id % 1000);
}

// ── Filtered Pokedex ────────────────────────────────────────────────────────

export const ACTIVE_POKEDEX: PokemonTemplate[] = POKEDEX.filter(p => isActivePokemon(p.id));

export const ACTIVE_POKEDEX_MAP = new Map<number, PokemonTemplate>(
  ACTIVE_POKEDEX.map(p => [p.id, p]),
);

// ── Evolution filtering ─────────────────────────────────────────────────────

export function getActiveEvolutionsFrom(templateId: number): EvolutionChain[] {
  const chains = EVOLUTION_CHAINS.filter(c => c.from === templateId);
  if (!GEN_RESTRICTION_ENABLED) return chains;
  return chains.filter(c => isActivePokemon(c.to));
}

export function canActiveEvolve(templateId: number): boolean {
  return getActiveEvolutionsFrom(templateId).length > 0;
}

// ── Dungeon enemy substitution ──────────────────────────────────────────────
// Maps non-Gen1 dungeon enemy IDs to Gen1 equivalents.

const DUNGEON_SUBSTITUTES: Record<number, number> = {
  // Gen 2 IDs (212, 209, 210, 198, 215) are now active — removed
  546: 43,    // Cottonee     -> Oddish
  684: 35,    // Swirlix      -> Clefairy
  282: 65,    // Gardevoir    -> Alakazam
  261: 19,    // Poochyena    -> Rattata
  302: 94,    // Sableye      -> Gengar
  359: 97,    // Absol        -> Hypno
  304: 74,    // Aron         -> Geodude
  436: 81,    // Bronzor      -> Magnemite
  374: 137,   // Beldum       -> Porygon
  376: 82,    // Metagross    -> Magneton
  306: 76,    // Aggron       -> Golem
  437: 82,    // Bronzong     -> Magneton
};

/** Resolve a template ID to a Gen1 substitute (dungeon enemies only). */
export function resolveActiveId(id: number): number {
  if (!GEN_RESTRICTION_ENABLED) return id;
  if (isActivePokemon(id)) return id;
  return DUNGEON_SUBSTITUTES[id] ?? id;
}
