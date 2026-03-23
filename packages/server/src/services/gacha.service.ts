import { v4 as uuidv4 } from 'uuid';
import { POKEDEX } from '@gatchamon/shared';
import type { PokemonTemplate, PokemonInstance } from '@gatchamon/shared';
import { getDb } from '../db/schema.js';
import { DEBUG_MODE } from '../config.js';

const SINGLE_COST = 5;
const MULTI_COST = 45;
const MULTI_COUNT = 10;
const SHINY_RATE = DEBUG_MODE ? 0.5 : 0.001; // Debug: 50%, Prod: 0.1% (1 in 1000)

function rollStarRating(guaranteeMinTwo = false): 1 | 2 | 3 {
  const roll = Math.random() * 100;
  if (guaranteeMinTwo) {
    return roll < 80 ? 2 : 3;
  }
  if (roll < 55) return 1;
  if (roll < 85) return 2;
  return 3;
}

function rollShiny(): boolean {
  return Math.random() < SHINY_RATE;
}

function pickFromPool(stars: 1 | 2 | 3): PokemonTemplate {
  const pool = POKEDEX.filter(p => p.naturalStars === stars);
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

export function summonSingle(playerId: string): SummonResult {
  const db = getDb();
  const player = db.prepare('SELECT pokeballs FROM players WHERE id = ?').get(playerId) as any;

  if (!player) throw new Error('Player not found');
  if (player.pokeballs < SINGLE_COST) throw new Error('Not enough pokeballs');

  db.prepare('UPDATE players SET pokeballs = pokeballs - ? WHERE id = ?').run(SINGLE_COST, playerId);

  const stars = rollStarRating();
  const template = pickFromPool(stars);
  const pokemon = createInstance(template, playerId);

  return { pokemon, template };
}

export function summonMulti(playerId: string): SummonResult[] {
  const db = getDb();
  const player = db.prepare('SELECT pokeballs FROM players WHERE id = ?').get(playerId) as any;

  if (!player) throw new Error('Player not found');
  if (player.pokeballs < MULTI_COST) throw new Error('Not enough pokeballs');

  db.prepare('UPDATE players SET pokeballs = pokeballs - ? WHERE id = ?').run(MULTI_COST, playerId);

  const results: SummonResult[] = [];
  for (let i = 0; i < MULTI_COUNT; i++) {
    const isLastPull = i === MULTI_COUNT - 1;
    const stars = rollStarRating(isLastPull);
    const template = pickFromPool(stars);
    const pokemon = createInstance(template, playerId);
    results.push({ pokemon, template });
  }

  return results;
}

export const SUMMON_COSTS = { single: SINGLE_COST, multi: MULTI_COST };
