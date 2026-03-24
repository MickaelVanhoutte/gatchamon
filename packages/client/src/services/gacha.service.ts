import { POKEDEX } from '@gatchamon/shared';
import type { PokemonTemplate, PokemonInstance } from '@gatchamon/shared';
import { loadPlayer, savePlayer, addToCollection, loadCollection } from './storage';
import { trackStat, incrementMission, checkAndUpdateTrophies } from './reward.service';
import { loadRewardState, saveRewardState } from './storage';

const SINGLE_COST = 5;
const MULTI_COST = 45;
const MULTI_COUNT = 10;
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';
const SHINY_RATE = DEBUG_MODE ? 0.5 : 0.001;

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
  const pool = POKEDEX.filter(p => p.naturalStars === stars && p.summonable !== false);
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
  };
}

export interface SummonResult {
  pokemon: PokemonInstance;
  template: PokemonTemplate;
}

export const SUMMON_COSTS = { single: SINGLE_COST, multi: MULTI_COST };

export function summonSingle(): SummonResult {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');
  if (player.pokeballs < SINGLE_COST) throw new Error('Not enough pokeballs');

  savePlayer({ ...player, pokeballs: player.pokeballs - SINGLE_COST });

  const stars = rollStarRating();
  const template = pickFromPool(stars);
  const pokemon = createInstance(template, player.id);
  addToCollection([pokemon]);

  // Track rewards
  trackStat('totalSummons', 1);
  trackStat('totalMonstersCollected', 1);
  incrementMission('summon_any', 1);
  incrementMission('collect_monster', 1);
  updateUniqueCount();
  checkAndUpdateTrophies();

  return { pokemon, template };
}

export function summonMulti(): SummonResult[] {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');
  if (player.pokeballs < MULTI_COST) throw new Error('Not enough pokeballs');

  savePlayer({ ...player, pokeballs: player.pokeballs - MULTI_COST });

  const results: SummonResult[] = [];
  const instances: PokemonInstance[] = [];

  for (let i = 0; i < MULTI_COUNT; i++) {
    const isLastPull = i === MULTI_COUNT - 1;
    const stars = rollStarRating(isLastPull);
    const template = pickFromPool(stars);
    const pokemon = createInstance(template, player.id);
    instances.push(pokemon);
    results.push({ pokemon, template });
  }

  addToCollection(instances);

  // Track rewards
  trackStat('totalSummons', MULTI_COUNT);
  trackStat('totalMonstersCollected', MULTI_COUNT);
  incrementMission('summon_any', MULTI_COUNT);
  incrementMission('collect_monster', MULTI_COUNT);
  updateUniqueCount();
  checkAndUpdateTrophies();

  return results;
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
