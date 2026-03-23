import type { PokemonInstance, Player } from '@gatchamon/shared';
import { POKEDEX, getEvolutionsFrom } from '@gatchamon/shared';
import type { EvolutionChain } from '@gatchamon/shared';
import { loadPlayer, savePlayer, loadCollection, saveCollection } from './storage';

export interface EvolutionValidation {
  valid: boolean;
  reason?: string;
}

export function getEvolutionOptions(templateId: number): EvolutionChain[] {
  return getEvolutionsFrom(templateId);
}

export function canEvolveInstance(
  instance: PokemonInstance,
  player: Player,
  targetTemplateId: number,
): EvolutionValidation {
  const chains = getEvolutionsFrom(instance.templateId);
  const chain = chains.find(c => c.to === targetTemplateId);

  if (!chain) {
    return { valid: false, reason: 'This evolution path does not exist' };
  }

  // Check level requirement
  if (instance.level < chain.requirements.levelRequired) {
    return {
      valid: false,
      reason: `Must be at least level ${chain.requirements.levelRequired} (currently ${instance.level})`,
    };
  }

  // Check material requirements
  const materials = player.materials ?? {};
  for (const [essenceId, needed] of Object.entries(chain.requirements.essences)) {
    const owned = materials[essenceId] ?? 0;
    if (owned < needed) {
      return {
        valid: false,
        reason: `Not enough materials`,
      };
    }
  }

  // Check target template exists
  const targetTemplate = POKEDEX.find(p => p.id === targetTemplateId);
  if (!targetTemplate) {
    return { valid: false, reason: 'Target evolution form not found' };
  }

  return { valid: true };
}

export function performEvolution(instanceId: string, targetTemplateId: number): PokemonInstance {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');

  const collection = loadCollection();
  const idx = collection.findIndex(p => p.instanceId === instanceId);
  if (idx === -1) throw new Error('Monster not found');

  const instance = collection[idx];
  const validation = canEvolveInstance(instance, player, targetTemplateId);
  if (!validation.valid) throw new Error(validation.reason);

  const chain = getEvolutionsFrom(instance.templateId).find(c => c.to === targetTemplateId)!;

  // Deduct materials
  const materials = { ...(player.materials ?? {}) };
  for (const [essenceId, needed] of Object.entries(chain.requirements.essences)) {
    materials[essenceId] = (materials[essenceId] ?? 0) - needed;
  }
  savePlayer({ ...player, materials });

  // Evolve the instance (keep level, stars, exp, shiny)
  collection[idx] = {
    ...instance,
    templateId: targetTemplateId,
  };
  saveCollection(collection);

  return collection[idx];
}
