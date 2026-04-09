import type { PokemonType } from '../types/pokemon.js';

/**
 * Full 18-type effectiveness chart.
 * Only non-1.0 matchups are stored:
 *   2.0  = super effective
 *   0.65 = not very effective
 *   0.25 = near-immune (formerly full immunity)
 */
export const TYPE_EFFECTIVENESS: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: {
    rock: 0.65,
    ghost: 0.25,
    steel: 0.65,
  },
  fire: {
    fire: 0.65,
    water: 0.65,
    grass: 2.0,
    ice: 2.0,
    bug: 2.0,
    rock: 0.65,
    dragon: 0.65,
    steel: 2.0,
  },
  water: {
    fire: 2.0,
    water: 0.65,
    grass: 0.65,
    ground: 2.0,
    rock: 2.0,
    dragon: 0.65,
  },
  grass: {
    fire: 0.65,
    water: 2.0,
    grass: 0.65,
    poison: 0.65,
    ground: 2.0,
    flying: 0.65,
    bug: 0.65,
    rock: 2.0,
    dragon: 0.65,
    steel: 0.65,
  },
  electric: {
    water: 2.0,
    grass: 0.65,
    electric: 0.65,
    ground: 0.25,
    flying: 2.0,
    dragon: 0.65,
  },
  ice: {
    fire: 0.65,
    water: 0.65,
    grass: 2.0,
    ice: 0.65,
    ground: 2.0,
    flying: 2.0,
    dragon: 2.0,
    steel: 0.65,
  },
  fighting: {
    normal: 2.0,
    ice: 2.0,
    poison: 0.65,
    flying: 0.65,
    psychic: 0.65,
    bug: 0.65,
    rock: 2.0,
    ghost: 0.25,
    dark: 2.0,
    steel: 2.0,
    fairy: 0.65,
  },
  poison: {
    grass: 2.0,
    poison: 0.65,
    ground: 0.65,
    rock: 0.65,
    ghost: 0.65,
    steel: 0.25,
    fairy: 2.0,
  },
  ground: {
    fire: 2.0,
    electric: 2.0,
    grass: 0.65,
    poison: 2.0,
    flying: 0.25,
    bug: 0.65,
    rock: 2.0,
    steel: 2.0,
  },
  flying: {
    electric: 0.65,
    grass: 2.0,
    fighting: 2.0,
    bug: 2.0,
    rock: 0.65,
    steel: 0.65,
  },
  psychic: {
    fighting: 2.0,
    poison: 2.0,
    psychic: 0.65,
    dark: 0.25,
    steel: 0.65,
  },
  bug: {
    fire: 0.65,
    grass: 2.0,
    fighting: 0.65,
    poison: 0.65,
    flying: 0.65,
    psychic: 2.0,
    ghost: 0.65,
    dark: 2.0,
    steel: 0.65,
    fairy: 0.65,
  },
  rock: {
    fire: 2.0,
    ice: 2.0,
    fighting: 0.65,
    ground: 0.65,
    flying: 2.0,
    bug: 2.0,
    steel: 0.65,
  },
  ghost: {
    normal: 0.25,
    ghost: 2.0,
    psychic: 2.0,
    dark: 0.65,
  },
  dragon: {
    dragon: 2.0,
    steel: 0.65,
    fairy: 0.25,
  },
  fairy: {
    fire: 0.65,
    fighting: 2.0,
    poison: 0.65,
    dragon: 2.0,
    dark: 2.0,
    steel: 0.65,
  },
  dark: {
    fighting: 0.65,
    psychic: 2.0,
    ghost: 2.0,
    dark: 0.65,
    fairy: 0.65,
  },
  steel: {
    fire: 0.65,
    water: 0.65,
    electric: 0.65,
    ice: 2.0,
    rock: 2.0,
    steel: 0.65,
    fairy: 2.0,
  },
};

/**
 * Calculate the combined type effectiveness of an attack against a defender
 * with one or more types. Multiplies effectiveness across all defender types.
 *
 * @example
 * // Water vs Rock/Ground = 2.0 * 2.0 = 4.0
 * getTypeEffectiveness('water', ['rock', 'ground']);
 */
export function getTypeEffectiveness(attackType: PokemonType, defenderTypes: PokemonType[]): number {
  return defenderTypes.reduce((multiplier, defType) => {
    const effectiveness = TYPE_EFFECTIVENESS[attackType][defType] ?? 1.0;
    return multiplier * effectiveness;
  }, 1.0);
}
