import type { PokemonInstance, Player } from '@gatchamon/shared';
import { getTemplate, getActiveEvolutionsFrom, isActivePokemon } from '@gatchamon/shared';
import type { EvolutionChain } from '@gatchamon/shared';

export interface EvolutionValidation {
  valid: boolean;
  reason?: string;
}

export function getEvolutionOptions(templateId: number): EvolutionChain[] {
  return getActiveEvolutionsFrom(templateId);
}

export function canEvolveInstance(
  instance: PokemonInstance,
  player: Player,
  targetTemplateId: number,
): EvolutionValidation {
  const chains = getActiveEvolutionsFrom(instance.templateId);
  const chain = chains.find(c => c.to === targetTemplateId);

  if (!chain) {
    return { valid: false, reason: 'This evolution path does not exist' };
  }

  if (!isActivePokemon(targetTemplateId)) {
    return { valid: false, reason: 'This evolution is not currently available' };
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
  const targetTemplate = getTemplate(targetTemplateId);
  if (!targetTemplate) {
    return { valid: false, reason: 'Target evolution form not found' };
  }

  return { valid: true };
}
