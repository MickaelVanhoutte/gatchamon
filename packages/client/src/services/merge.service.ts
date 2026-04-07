import type { PokemonInstance } from '@gatchamon/shared';
import { isMaxLevel } from '@gatchamon/shared';
import { loadCollection, saveCollection } from './storage';
import { trackStat, incrementMission, checkAndUpdateTrophies } from './reward.service';

export interface MergeValidation {
  valid: boolean;
  reason?: string;
}

export function canMerge(base: PokemonInstance, fodder: PokemonInstance): MergeValidation {
  if (base.instanceId === fodder.instanceId) {
    return { valid: false, reason: 'Cannot merge a monster with itself' };
  }
  if (base.templateId !== fodder.templateId) {
    return { valid: false, reason: 'Both monsters must be the same species' };
  }
  if (base.stars >= 6) {
    return { valid: false, reason: 'Already at maximum stars (6)' };
  }
  if (!isMaxLevel(base.level, base.stars)) {
    return { valid: false, reason: 'Base monster must be at max level' };
  }
  return { valid: true };
}

export function performMerge(baseInstanceId: string, fodderInstanceId: string): PokemonInstance {
  const collection = loadCollection();
  const baseIdx = collection.findIndex(p => p.instanceId === baseInstanceId);
  const fodderIdx = collection.findIndex(p => p.instanceId === fodderInstanceId);

  if (baseIdx === -1) throw new Error('Base monster not found');
  if (fodderIdx === -1) throw new Error('Fodder monster not found');

  const base = collection[baseIdx];
  const fodder = collection[fodderIdx];

  const validation = canMerge(base, fodder);
  if (!validation.valid) throw new Error(validation.reason);

  // Upgrade the base monster (shiny transfers from fodder to base)
  const newStars = (base.stars + 1) as PokemonInstance['stars'];
  collection[baseIdx] = {
    ...base,
    stars: newStars,
    isShiny: base.isShiny || fodder.isShiny,
  };

  // Remove the fodder
  collection.splice(fodderIdx, 1);

  saveCollection(collection);

  // Track rewards
  trackStat('totalMerges', 1);
  incrementMission('merge_monster', 1);
  checkAndUpdateTrophies();

  return collection.find(p => p.instanceId === baseInstanceId)!;
}
