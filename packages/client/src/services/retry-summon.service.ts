import type { PokemonInstance, PokemonTemplate } from '@gatchamon/shared';
import { rollPremiumStarRating, pickFromPool } from './gacha.service';
import { loadPlayer } from './storage';

const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';
const SHINY_RATE = DEBUG_MODE ? 0.5 : 0.001;

export interface RetrySummonResult {
  pokemon: PokemonInstance;
  template: PokemonTemplate;
}

export function performRetrySummonRoll(): RetrySummonResult[] {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');

  const results: RetrySummonResult[] = [];
  for (let i = 0; i < 10; i++) {
    const stars = rollPremiumStarRating();
    const template = pickFromPool(stars);
    const pokemon: PokemonInstance = {
      instanceId: crypto.randomUUID(),
      templateId: template.id,
      ownerId: player.id,
      level: 1,
      stars: template.naturalStars,
      exp: 0,
      isShiny: Math.random() < SHINY_RATE,
      skillLevels: [1, 1, 1],
    };
    results.push({ pokemon, template });
  }
  return results;
}
