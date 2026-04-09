import { v4 as uuidv4 } from 'uuid';
import { POKEDEX, ACTIVE_POKEDEX, BEGINNER_BONUS, isBeginnerBonusActive } from '@gatchamon/shared';
import type { PokemonTemplate, PokemonInstance, PokeballType } from '@gatchamon/shared';
import { getDb } from '../db/schema.js';
import { DEBUG_MODE } from '../config.js';

const REGULAR_SINGLE_COST = 5;
const REGULAR_MULTI_COST = 45;
const PREMIUM_SINGLE_COST = 1;
const PREMIUM_MULTI_COST = 10;
const MULTI_COUNT = 10;
const SHINY_RATE = DEBUG_MODE ? 0.5 : 0.001;
const PREMIUM_PITY_THRESHOLD = 200;
const GLOWING_SINGLE_COST = 1;
const GLOWING_MULTI_COST = 10;
const LEGENDARY_SINGLE_COST = 1;

function getPlayerRow(playerId: string): any {
  const db = getDb();
  const row = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId) as any;
  if (!row) throw new Error('Player not found');
  return row;
}

function rollRegularStarRating(guaranteeMinTwo = false): 1 | 2 | 3 {
  if (guaranteeMinTwo) return 2;
  const roll = Math.random() * 100;
  if (roll < 5) return 3;
  return roll < 62 ? 1 : 2;
}

function rollPremiumStarRating(beginner = false): 3 | 4 | 5 {
  const roll = Math.random() * 100;
  const fiveStarThreshold = beginner ? 100 - (5 + BEGINNER_BONUS.summon5StarBonus) : 95;
  const fourStarThreshold = beginner ? fiveStarThreshold - (20 + BEGINNER_BONUS.summon4StarBonus) : 75;
  if (roll >= fiveStarThreshold) return 5;
  if (roll >= fourStarThreshold) return 4;
  return 3;
}

function rollShiny(): boolean {
  return Math.random() < SHINY_RATE;
}

function pickFromPool(stars: 1 | 2 | 3 | 4 | 5): PokemonTemplate {
  const pool = ACTIVE_POKEDEX.filter(p => p.naturalStars === stars && p.summonable !== false);
  if (pool.length === 0) throw new Error(`No summonable Pokemon with ${stars} stars in ACTIVE_POKEDEX`);
  return pool[Math.floor(Math.random() * pool.length)];
}

function createInstance(template: PokemonTemplate, ownerId: string, forceShiny = false): PokemonInstance {
  const isShiny = forceShiny || rollShiny();
  const instance: PokemonInstance = {
    instanceId: uuidv4(),
    templateId: template.id,
    ownerId,
    level: 1,
    stars: template.naturalStars,
    exp: 0,
    isShiny,
    skillLevels: [1, 1, 1],
  };

  const db = getDb();
  db.prepare(
    'INSERT INTO pokemon_instances (instance_id, template_id, owner_id, level, stars, exp, is_shiny, skill_levels) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(instance.instanceId, instance.templateId, instance.ownerId, instance.level, instance.stars, instance.exp, isShiny ? 1 : 0, JSON.stringify(instance.skillLevels));

  return instance;
}

/** Create a PokemonInstance without persisting to DB — for preview/retry flows. */
export function createTemporaryInstance(template: PokemonTemplate, ownerId: string): PokemonInstance {
  return {
    instanceId: uuidv4(),
    templateId: template.id,
    ownerId,
    level: 1,
    stars: template.naturalStars,
    exp: 0,
    isShiny: rollShiny(),
    skillLevels: [1, 1, 1],
  };
}

/** Persist a previously-created temporary instance to the DB. */
export function persistInstance(instance: PokemonInstance): void {
  const db = getDb();
  db.prepare(
    'INSERT INTO pokemon_instances (instance_id, template_id, owner_id, level, stars, exp, is_shiny, skill_levels) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(instance.instanceId, instance.templateId, instance.ownerId, instance.level, instance.stars, instance.exp, instance.isShiny ? 1 : 0, JSON.stringify(instance.skillLevels));
}

export { rollPremiumStarRating, pickFromPool };

export interface SummonResult {
  pokemon: PokemonInstance;
  template: PokemonTemplate;
}

export const SUMMON_COSTS = {
  regular: { single: REGULAR_SINGLE_COST, multi: REGULAR_MULTI_COST },
  premium: { single: PREMIUM_SINGLE_COST, multi: PREMIUM_MULTI_COST },
  legendary: { single: LEGENDARY_SINGLE_COST },
  glowing: { single: GLOWING_SINGLE_COST, multi: GLOWING_MULTI_COST },
};

// ── Regular Pokeball (1-2★) ──

export function summonSingleRegular(playerId: string, forcedTemplateId?: number): SummonResult {
  const db = getDb();
  const player = getPlayerRow(playerId);
  if (player.regular_pokeballs < REGULAR_SINGLE_COST) throw new Error('Not enough pokeballs');

  db.prepare('UPDATE players SET regular_pokeballs = regular_pokeballs - ? WHERE id = ?').run(REGULAR_SINGLE_COST, playerId);

  const template = forcedTemplateId != null
    ? POKEDEX.find(p => p.id === forcedTemplateId)!
    : pickFromPool(rollRegularStarRating());
  const pokemon = createInstance(template, playerId);

  return { pokemon, template };
}

export function summonMultiRegular(playerId: string): SummonResult[] {
  const db = getDb();
  const player = getPlayerRow(playerId);
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

// ── Premium Pokeball (3-5★) with Pity ──

export function summonSinglePremium(playerId: string, forcedTemplateId?: number): SummonResult {
  const db = getDb();
  const player = getPlayerRow(playerId);
  if (player.premium_pokeballs < PREMIUM_SINGLE_COST) throw new Error('Not enough premium pokeballs');

  const pity = (player.premium_pity_counter ?? 0) + 1;
  const isPityGuarantee = pity >= PREMIUM_PITY_THRESHOLD;

  let template;
  if (forcedTemplateId != null) {
    template = POKEDEX.find(p => p.id === forcedTemplateId)!;
  } else {
    const createdAt = player.created_at;
    const beginner = createdAt ? isBeginnerBonusActive(createdAt) : false;
    const stars = isPityGuarantee ? 5 : rollPremiumStarRating(beginner);
    template = pickFromPool(stars);
  }
  const isFiveStar = template.naturalStars === 5;

  db.prepare(
    'UPDATE players SET premium_pokeballs = premium_pokeballs - ?, premium_pity_counter = ? WHERE id = ?'
  ).run(PREMIUM_SINGLE_COST, isFiveStar ? 0 : pity, playerId);

  const pokemon = createInstance(template, playerId);
  return { pokemon, template };
}

export function summonMultiPremium(playerId: string): SummonResult[] {
  const db = getDb();
  const player = getPlayerRow(playerId);
  if (player.premium_pokeballs < PREMIUM_MULTI_COST) throw new Error('Not enough premium pokeballs');

  const createdAt = player.created_at;
  const beginner = createdAt ? isBeginnerBonusActive(createdAt) : false;
  let pity = player.premium_pity_counter ?? 0;

  const results: SummonResult[] = [];
  for (let i = 0; i < MULTI_COUNT; i++) {
    pity++;
    const isPityGuarantee = pity >= PREMIUM_PITY_THRESHOLD;
    const stars = isPityGuarantee ? 5 : rollPremiumStarRating(beginner);
    const template = pickFromPool(stars);
    if (template.naturalStars === 5) pity = 0;
    const pokemon = createInstance(template, playerId);
    results.push({ pokemon, template });
  }

  db.prepare(
    'UPDATE players SET premium_pokeballs = premium_pokeballs - ?, premium_pity_counter = ? WHERE id = ?'
  ).run(PREMIUM_MULTI_COST, pity, playerId);

  return results;
}

// ── Legendary Pokeball (guaranteed 5★) ──

export function summonSingleLegendary(playerId: string): SummonResult {
  const db = getDb();
  const player = getPlayerRow(playerId);
  if ((player.legendary_pokeballs ?? 0) < LEGENDARY_SINGLE_COST) throw new Error('Not enough legendary pokeballs');

  db.prepare('UPDATE players SET legendary_pokeballs = legendary_pokeballs - ? WHERE id = ?').run(LEGENDARY_SINGLE_COST, playerId);

  const template = pickFromPool(5);
  const pokemon = createInstance(template, playerId);
  return { pokemon, template };
}

// ── Glowing Pokeball (3-5★, guaranteed shiny) ──

export function summonSingleGlowing(playerId: string): SummonResult {
  const db = getDb();
  const player = getPlayerRow(playerId);
  if ((player.glowing_pokeballs ?? 0) < GLOWING_SINGLE_COST) throw new Error('Not enough glowing pokeballs');

  db.prepare('UPDATE players SET glowing_pokeballs = glowing_pokeballs - ? WHERE id = ?').run(GLOWING_SINGLE_COST, playerId);

  const stars = rollPremiumStarRating();
  const template = pickFromPool(stars);
  const pokemon = createInstance(template, playerId, true); // force shiny

  return { pokemon, template };
}

export function summonMultiGlowing(playerId: string): SummonResult[] {
  const db = getDb();
  const player = getPlayerRow(playerId);
  if ((player.glowing_pokeballs ?? 0) < GLOWING_MULTI_COST) throw new Error('Not enough glowing pokeballs');

  db.prepare('UPDATE players SET glowing_pokeballs = glowing_pokeballs - ? WHERE id = ?').run(GLOWING_MULTI_COST, playerId);

  const results: SummonResult[] = [];
  for (let i = 0; i < MULTI_COUNT; i++) {
    const stars = rollPremiumStarRating();
    const template = pickFromPool(stars);
    const pokemon = createInstance(template, playerId, true); // force shiny
    results.push({ pokemon, template });
  }

  return results;
}

// ── Shop Summons (bypass pokeball costs) ──

export function shopSummonMultiPremium(playerId: string): SummonResult[] {
  const db = getDb();
  const player = getPlayerRow(playerId);
  const createdAt = player.created_at;
  const beginner = createdAt ? isBeginnerBonusActive(createdAt) : false;
  let pity = player.premium_pity_counter ?? 0;

  const results: SummonResult[] = [];
  for (let i = 0; i < MULTI_COUNT; i++) {
    pity++;
    const isPityGuarantee = pity >= PREMIUM_PITY_THRESHOLD;
    const stars = isPityGuarantee ? 5 : rollPremiumStarRating(beginner);
    const template = pickFromPool(stars);
    if (template.naturalStars === 5) pity = 0;
    const pokemon = createInstance(template, playerId);
    results.push({ pokemon, template });
  }

  db.prepare('UPDATE players SET premium_pity_counter = ? WHERE id = ?').run(pity, playerId);
  return results;
}

export function shopSummonSingleLegendary(playerId: string): SummonResult {
  const player = getPlayerRow(playerId);
  const template = pickFromPool(5);
  const pokemon = createInstance(template, playerId);
  return { pokemon, template };
}
