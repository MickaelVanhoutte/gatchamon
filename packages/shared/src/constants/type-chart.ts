import type { PokemonType } from '../types/pokemon.js';

/**
 * Gen 1 type effectiveness chart.
 * Only non-1.0 matchups are stored:
 *   2.0 = super effective
 *   0.5 = not very effective
 *   0   = immune (no effect)
 */
export const TYPE_EFFECTIVENESS: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: {
    rock: 0.5,
    ghost: 0,
  },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2.0,
    ice: 2.0,
    bug: 2.0,
    rock: 0.5,
    dragon: 0.5,
  },
  water: {
    fire: 2.0,
    water: 0.5,
    grass: 0.5,
    ground: 2.0,
    rock: 2.0,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2.0,
    grass: 0.5,
    poison: 0.5,
    ground: 2.0,
    flying: 0.5,
    bug: 0.5,
    rock: 2.0,
    dragon: 0.5,
  },
  electric: {
    water: 2.0,
    grass: 0.5,
    electric: 0.5,
    ground: 0,
    flying: 2.0,
    dragon: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2.0,
    ice: 0.5,
    ground: 2.0,
    flying: 2.0,
    dragon: 2.0,
  },
  fighting: {
    normal: 2.0,
    ice: 2.0,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2.0,
    ghost: 0,
  },
  poison: {
    grass: 2.0,
    poison: 0.5,
    ground: 0.5,
    bug: 2.0,
    rock: 0.5,
    ghost: 0.5,
  },
  ground: {
    fire: 2.0,
    electric: 2.0,
    grass: 0.5,
    poison: 2.0,
    flying: 0,
    bug: 0.5,
    rock: 2.0,
  },
  flying: {
    electric: 0.5,
    grass: 2.0,
    fighting: 2.0,
    bug: 2.0,
    rock: 0.5,
  },
  psychic: {
    fighting: 2.0,
    poison: 2.0,
    psychic: 0.5,
  },
  bug: {
    fire: 0.5,
    grass: 2.0,
    fighting: 0.5,
    poison: 2.0,
    flying: 0.5,
    psychic: 2.0,
    ghost: 0.5,
  },
  rock: {
    fire: 2.0,
    ice: 2.0,
    fighting: 0.5,
    ground: 0.5,
    flying: 2.0,
    bug: 2.0,
  },
  ghost: {
    normal: 0,
    ghost: 2.0,
    psychic: 0,
  },
  dragon: {
    dragon: 2.0,
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
