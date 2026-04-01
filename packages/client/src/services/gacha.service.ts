import { POKEDEX, ACTIVE_POKEDEX } from '@gatchamon/shared';
import type { PokemonTemplate, PokemonInstance, PokeballType } from '@gatchamon/shared';
import { loadPlayer, savePlayer, addToCollection, loadCollection } from './storage';
import { trackStat, incrementMission, checkAndUpdateTrophies } from './reward.service';
import { loadRewardState, saveRewardState } from './storage';

const REGULAR_SINGLE_COST = 5;
const REGULAR_MULTI_COST = 45;
const PREMIUM_SINGLE_COST = 1;
const PREMIUM_MULTI_COST = 10;
const MULTI_COUNT = 10;
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';
const SHINY_RATE = DEBUG_MODE ? 0.5 : 0.001;
const PREMIUM_PITY_THRESHOLD = 200;

function rollRegularStarRating(guaranteeMinTwo = false): 1 | 2 | 3 {
  if (guaranteeMinTwo) return 2;
  const roll = Math.random() * 100;
  if (roll < 5) return 3;
  return roll < 62 ? 1 : 2;
}

export function rollPremiumStarRating(): 3 | 4 | 5 {
  const roll = Math.random() * 100;
  if (roll < 75) return 3;
  if (roll < 95) return 4;
  return 5;
}

function rollShiny(): boolean {
  return Math.random() < SHINY_RATE;
}

export function pickFromPool(stars: 1 | 2 | 3 | 4 | 5): PokemonTemplate {
  const pool = ACTIVE_POKEDEX.filter(p => p.naturalStars === stars && p.summonable !== false);
  return pool[Math.floor(Math.random() * pool.length)];
}

function createInstance(template: PokemonTemplate, ownerId: string): PokemonInstance {
  const isShiny = rollShiny();
  return {
    instanceId: crypto.randomUUID(),
    templateId: template.id,
    ownerId,
    level: 1,
    stars: template.naturalStars,
    exp: 0,
    isShiny,
    skillLevels: [1, 1, 1],
  };
}

export interface SummonResult {
  pokemon: PokemonInstance;
  template: PokemonTemplate;
}

const LEGENDARY_SINGLE_COST = 1;

export const SUMMON_COSTS = {
  regular: { single: REGULAR_SINGLE_COST, multi: REGULAR_MULTI_COST },
  premium: { single: PREMIUM_SINGLE_COST, multi: PREMIUM_MULTI_COST },
  legendary: { single: LEGENDARY_SINGLE_COST },
};

function trackSummons(count: number): void {
  trackStat('totalSummons', count);
  trackStat('totalMonstersCollected', count);
  incrementMission('summon_any', count);
  incrementMission('collect_monster', count);
  updateUniqueCount();
  checkAndUpdateTrophies();
}

// ── Regular Pokeball (1-2★) ──

export function summonSingleRegular(forcedTemplateId?: number): SummonResult {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');
  if (player.regularPokeballs < REGULAR_SINGLE_COST) throw new Error('Not enough pokeballs');

  savePlayer({ ...player, regularPokeballs: player.regularPokeballs - REGULAR_SINGLE_COST });

  const template = forcedTemplateId != null
    ? POKEDEX.find(p => p.id === forcedTemplateId)!
    : pickFromPool(rollRegularStarRating());
  const pokemon = createInstance(template, player.id);
  addToCollection([pokemon]);
  trackSummons(1);

  return { pokemon, template };
}

export function summonMultiRegular(): SummonResult[] {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');
  if (player.regularPokeballs < REGULAR_MULTI_COST) throw new Error('Not enough pokeballs');

  savePlayer({ ...player, regularPokeballs: player.regularPokeballs - REGULAR_MULTI_COST });

  const results: SummonResult[] = [];
  const instances: PokemonInstance[] = [];

  for (let i = 0; i < MULTI_COUNT; i++) {
    const isLastPull = i === MULTI_COUNT - 1;
    const stars = rollRegularStarRating(isLastPull);
    const template = pickFromPool(stars);
    const pokemon = createInstance(template, player.id);
    instances.push(pokemon);
    results.push({ pokemon, template });
  }

  addToCollection(instances);
  trackSummons(MULTI_COUNT);

  return results;
}

// ── Premium Pokeball (3-5★) ──

export function summonSinglePremium(forcedTemplateId?: number): SummonResult {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');
  if (player.premiumPokeballs < PREMIUM_SINGLE_COST) throw new Error('Not enough premium pokeballs');

  const pity = (player.premiumPityCounter ?? 0) + 1;
  const isPityGuarantee = pity >= PREMIUM_PITY_THRESHOLD;

  let template: PokemonTemplate;
  if (forcedTemplateId != null) {
    template = POKEDEX.find(p => p.id === forcedTemplateId)!;
  } else if (isPityGuarantee) {
    template = pickFromPool(5);
  } else {
    template = pickFromPool(rollPremiumStarRating());
  }

  const isFiveStar = template.naturalStars === 5;
  savePlayer({
    ...player,
    premiumPokeballs: player.premiumPokeballs - PREMIUM_SINGLE_COST,
    premiumPityCounter: isFiveStar ? 0 : pity,
  });

  const pokemon = createInstance(template, player.id);
  addToCollection([pokemon]);
  trackSummons(1);

  return { pokemon, template };
}

export function summonMultiPremium(): SummonResult[] {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');
  if (player.premiumPokeballs < PREMIUM_MULTI_COST) throw new Error('Not enough premium pokeballs');

  let pity = player.premiumPityCounter ?? 0;

  const results: SummonResult[] = [];
  const instances: PokemonInstance[] = [];

  for (let i = 0; i < MULTI_COUNT; i++) {
    pity++;
    const isPityGuarantee = pity >= PREMIUM_PITY_THRESHOLD;
    const stars = isPityGuarantee ? 5 : rollPremiumStarRating();
    const template = pickFromPool(stars);
    if (template.naturalStars === 5) pity = 0;
    const pokemon = createInstance(template, player.id);
    instances.push(pokemon);
    results.push({ pokemon, template });
  }

  savePlayer({
    ...player,
    premiumPokeballs: player.premiumPokeballs - PREMIUM_MULTI_COST,
    premiumPityCounter: pity,
  });

  addToCollection(instances);
  trackSummons(MULTI_COUNT);

  return results;
}

// ── Legendary Pokeball (guaranteed 5★) ──

export function summonSingleLegendary(): SummonResult {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');
  if ((player.legendaryPokeballs ?? 0) < LEGENDARY_SINGLE_COST) {
    throw new Error('Not enough legendary pokeballs');
  }

  savePlayer({
    ...player,
    legendaryPokeballs: (player.legendaryPokeballs ?? 0) - LEGENDARY_SINGLE_COST,
  });

  const template = pickFromPool(5);
  const pokemon = createInstance(template, player.id);
  addToCollection([pokemon]);
  trackSummons(1);

  return { pokemon, template };
}

// ── Shop Summons (bypass pokeball costs) ──

export function shopSummonMultiPremium(): SummonResult[] {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');

  let pity = player.premiumPityCounter ?? 0;

  const results: SummonResult[] = [];
  const instances: PokemonInstance[] = [];

  for (let i = 0; i < MULTI_COUNT; i++) {
    pity++;
    const isPityGuarantee = pity >= PREMIUM_PITY_THRESHOLD;
    const stars = isPityGuarantee ? 5 : rollPremiumStarRating();
    const template = pickFromPool(stars);
    if (template.naturalStars === 5) pity = 0;
    const pokemon = createInstance(template, player.id);
    instances.push(pokemon);
    results.push({ pokemon, template });
  }

  savePlayer({
    ...player,
    premiumPityCounter: pity,
  });

  addToCollection(instances);
  trackSummons(MULTI_COUNT);

  return results;
}

export function shopSummonSingleLegendary(): SummonResult {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');

  const template = pickFromPool(5);
  const pokemon = createInstance(template, player.id);
  addToCollection([pokemon]);
  trackSummons(1);

  return { pokemon, template };
}

function updateUniqueCount(): void {
  const collection = loadCollection();
  const uniqueIds = new Set(collection.map(c => c.templateId));
  const state = loadRewardState();
  if (state) {
    state.stats.uniqueMonstersOwned = uniqueIds.size;
    saveRewardState(state);
  }
}
