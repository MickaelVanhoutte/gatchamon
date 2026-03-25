import type { EssenceDefinition, EssenceTier } from '../types/evolution.js';
import type { PokemonType } from '../types/pokemon.js';

const ELEMENT_ICONS: Record<string, string> = {
  normal: 'normal', fire: 'fire', water: 'water', grass: 'grass',
  electric: 'electric', ice: 'ice', fighting: 'fighting', poison: 'poison',
  ground: 'ground', flying: 'flying', psychic: 'psychic', bug: 'bug',
  rock: 'rock', ghost: 'ghost', dragon: 'dragon',
  fairy: 'fairy', dark: 'dark', steel: 'steel',
  magic: 'magic',
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
