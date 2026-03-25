import type { PokemonType } from './pokemon.js';

export interface TypeChangeDefinition {
  baseTemplateId: number;
  forms: Partial<Record<PokemonType, number>>;
}

export interface TypeChangeCost {
  essences: Record<string, number>;
}
