import { v4 as uuidv4 } from 'uuid';
import { POKEDEX } from '@gatchamon/shared';
import type { PokemonTemplate, PokemonInstance, PokeballType } from '@gatchamon/shared';
import { getDb } from '../db/schema.js';
import { DEBUG_MODE } from '../config.js';

const REGULAR_SINGLE_COST = 5;
const REGULAR_MULTI_COST = 45;
const PREMIUM_SINGLE_COST = 1;
const PREMIUM_MULTI_COST = 10;
const MULTI_COUNT = 10;
const SHINY_RATE = DEBUG_MODE ? 0.5 : 0.001;

function rollRegularStarRating(guaranteeMinTwo = false): 1 | 2 | 3 {
  if (guaranteeMinTwo) return 2;
  const roll = Math.random() * 100;
  if (roll < 5) return 3;
  return roll < 62 ? 1 : 2;
}

function rollPremiumStarRating(): 3 | 4 | 5 {
  const roll = Math.random() * 100;
  if (roll < 75) return 3;
  if (roll < 95) return 4;
  return 5;
}

function rollShiny(): boolean {
  return Math.random() < SHINY_RATE;
}

function pickFromPool(stars: 1 | 2 | 3 | 4 | 5): PokemonTemplate {
  const pool = POKEDEX.filter(p => p.naturalStars === stars && p.summonable !== false);
  return pool[Math.floor(Math.random() * pool.length)];
}

function createInstance(template: PokemonTemplate, ownerId: string): PokemonInstance {
  const isShiny = rollShiny();
  const instance: PokemonInstance = {
    instanceId: uuidv4(),
    templateId: template.id,
    ownerId,
    level: 1,
    stars: template.naturalStars,
    exp: 0,
    isShiny,
  };

  const db = getDb();
  db.prepare(
    'INSERT INTO pokemon_instances (instance_id, template_id, owner_id, level, stars, exp, is_shiny) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(instance.instanceId, instance.templateId, instance.ownerId, instance.level, instance.stars, instance.exp, isShiny ? 1 : 0);

  return instance;
}

export interface SummonResult {
  pokemon: PokemonInstance;
  template: PokemonTemplate;
}

export const SUMMON_COSTS = {
  regular: { single: REGULAR_SINGLE_COST, multi: REGULAR_MULTI_COST },
  premium: { single: PREMIUM_SINGLE_COST, multi: PREMIUM_MULTI_COST },
};

// ── Regular Pokeball (1-2★) ──

export function summonSingleRegular(playerId: string): SummonResult {
  const db = getDb();
  const player = db.prepare('SELECT regular_pokeballs FROM players WHERE id = ?').get(playerId) as any;

  if (!player) throw new Error('Player not found');
  if (player.regular_pokeballs < REGULAR_SINGLE_COST) throw new Error('Not enough pokeballs');

  db.prepare('UPDATE players SET regular_pokeballs = regular_pokeballs - ? WHERE id = ?').run(REGULAR_SINGLE_COST, playerId);

  const stars = rollRegularStarRating();
  const template = pickFromPool(stars);
  const pokemon = createInstance(template, playerId);

  return { pokemon, template };
}

export function summonMultiRegular(playerId: string): SummonResult[] {
  const db = getDb();
  const player = db.prepare('SELECT regular_pokeballs FROM players WHERE id = ?').get(playerId) as any;

  if (!player) throw new Error('Player not found');
  if (player.regular_pokeballs < REGULAR_MULTI_COST) throw new Error('Not enough pokeballs');

  db.prepare('UPDATE players SET regular_pokeballs = regular_pokeballs - ? WHERE id = ?').run(REGULAR_MULTI_COST, playerId);

  const results: SummonResult[] = [];
  for (let i = 0; i < MULTI_COUNT; i++) {
    const isLastPull = i === MULTI_COUNT - 1;
    const stars = rollRegularStarRating(isLastPull);
    const template = pickFromPool(stars);
    const pokemon = createInstance(template, playerId);
    results.push({ pokemon, template });
  }

  return results;
}

// ── Premium Pokeball (3-5★) ──

export function summonSinglePremium(playerId: string): SummonResult {
  const db = getDb();
  const player = db.prepare('SELECT premium_pokeballs FROM players WHERE id = ?').get(playerId) as any;

  if (!player) throw new Error('Player not found');
  if (player.premium_pokeballs < PREMIUM_SINGLE_COST) throw new Error('Not enough premium pokeballs');

  db.prepare('UPDATE players SET premium_pokeballs = premium_pokeballs - ? WHERE id = ?').run(PREMIUM_SINGLE_COST, playerId);

  const stars = rollPremiumStarRating();
  const template = pickFromPool(stars);
  const pokemon = createInstance(template, playerId);

  return { pokemon, template };
}

export function summonMultiPremium(playerId: string): SummonResult[] {
  const db = getDb();
  const player = db.prepare('SELECT premium_pokeballs FROM players WHERE id = ?').get(playerId) as any;

  if (!player) throw new Error('Player not found');
  if (player.premium_pokeballs < PREMIUM_MULTI_COST) throw new Error('Not enough premium pokeballs');

  db.prepare('UPDATE players SET premium_pokeballs = premium_pokeballs - ? WHERE id = ?').run(PREMIUM_MULTI_COST, playerId);

  const results: SummonResult[] = [];
  for (let i = 0; i < MULTI_COUNT; i++) {
    const stars = rollPremiumStarRating();
    const template = pickFromPool(stars);
    const pokemon = createInstance(template, playerId);
    results.push({ pokemon, template });
  }

  return results;
}
