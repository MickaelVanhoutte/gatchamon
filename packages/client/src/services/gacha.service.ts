import type { PokemonTemplate, PokemonInstance } from '@gatchamon/shared';

export interface SummonResult {
  pokemon: PokemonInstance;
  template: PokemonTemplate;
}

export const SUMMON_COSTS = {
  regular: { single: 5, multi: 45 },
  premium: { single: 1, multi: 10 },
  legendary: { single: 1 },
  glowing: { single: 1, multi: 10 },
};
