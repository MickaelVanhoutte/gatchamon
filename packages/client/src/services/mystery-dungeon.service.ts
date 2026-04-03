import { getTemplate, PIECE_COST } from '@gatchamon/shared';
import type { PokemonInstance } from '@gatchamon/shared';
import { loadPlayer, savePlayer, addToCollection } from './storage';

const SHINY_RATE = 0.001;

export function summonFromPieces(templateId: number): PokemonInstance {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');

  const template = getTemplate(templateId);
  if (!template) throw new Error('Template not found');

  const cost = PIECE_COST[template.naturalStars];
  if (!cost) throw new Error(`No piece cost for ${template.naturalStars}-star pokemon`);

  const currentPieces = player.mysteryPieces?.[templateId] ?? 0;
  if (currentPieces < cost) throw new Error('Not enough pieces');

  // Deduct pieces
  const mysteryPieces = { ...(player.mysteryPieces ?? {}) };
  mysteryPieces[templateId] = currentPieces - cost;
  if (mysteryPieces[templateId] <= 0) delete mysteryPieces[templateId];
  savePlayer({ ...player, mysteryPieces });

  // Create pokemon instance
  const instance: PokemonInstance = {
    instanceId: crypto.randomUUID(),
    templateId,
    ownerId: player.id,
    level: 1,
    stars: template.naturalStars as 1 | 2 | 3 | 4 | 5 | 6,
    exp: 0,
    isShiny: Math.random() < SHINY_RATE,
    skillLevels: [1, 1, 1],
  };

  addToCollection([instance]);
  return instance;
}
