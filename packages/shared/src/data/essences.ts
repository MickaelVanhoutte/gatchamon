import type { EssenceDefinition, EssenceTier } from '../types/evolution.js';
import type { PokemonType } from '../types/pokemon.js';

const ELEMENT_ICONS: Record<string, string> = {
  normal: '\u26AA', fire: '\u{1F525}', water: '\u{1F4A7}', grass: '\u{1F33F}',
  electric: '\u26A1', ice: '\u2744\uFE0F', fighting: '\u{1F94A}', poison: '\u2620\uFE0F',
  ground: '\u{1F30D}', flying: '\u{1F4A8}', psychic: '\u{1F52E}', bug: '\u{1F41B}',
  rock: '\u{1FAA8}', ghost: '\u{1F47B}', dragon: '\u{1F432}',
  fairy: '\u{1F9DA}', dark: '\u{1F311}', steel: '\u2699\uFE0F',
  magic: '\u2728',
};

const TIER_LABELS: Record<EssenceTier, string> = {
  low: 'Low', mid: 'Mid', high: 'High',
};

function makeEssence(element: PokemonType | 'magic', tier: EssenceTier): EssenceDefinition {
  const id = `${element}_${tier}`;
  const icon = ELEMENT_ICONS[element] ?? '\u2728';
  const name = `${element.charAt(0).toUpperCase() + element.slice(1)} Essence (${TIER_LABELS[tier]})`;
  return { id, element, tier, name, icon };
}

const ELEMENTS: (PokemonType | 'magic')[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon',
  'fairy', 'dark', 'steel',
  'magic',
];

const TIERS: EssenceTier[] = ['low', 'mid', 'high'];

export const ESSENCES: Record<string, EssenceDefinition> = {};
for (const element of ELEMENTS) {
  for (const tier of TIERS) {
    const essence = makeEssence(element, tier);
    ESSENCES[essence.id] = essence;
  }
}

export function getEssence(id: string): EssenceDefinition | undefined {
  return ESSENCES[id];
}
