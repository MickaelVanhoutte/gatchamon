import type { PokemonInstance, Player } from '@gatchamon/shared';
import { getTemplate, getTypeChangeDef, getAvailableTypeChanges } from '@gatchamon/shared';

export interface TypeChangeValidation {
  valid: boolean;
  reason?: string;
}

export function canChangeType(
  instance: PokemonInstance,
  player: Player,
  targetTemplateId: number,
): TypeChangeValidation {
  const def = getTypeChangeDef(instance.templateId);
  if (!def) {
    return { valid: false, reason: 'This monster does not support type change' };
  }

  const available = getAvailableTypeChanges(def, instance.templateId);
  const target = available.find(t => t.targetTemplateId === targetTemplateId);
  if (!target) {
    return { valid: false, reason: 'Invalid target type' };
  }

  const targetTemplate = getTemplate(targetTemplateId);
  if (!targetTemplate) {
    return { valid: false, reason: 'Target form not found' };
  }

  const materials = player.materials ?? {};
  for (const [essenceId, needed] of Object.entries(target.cost.essences)) {
    const owned = materials[essenceId] ?? 0;
    if (owned < needed) {
      return { valid: false, reason: 'Not enough materials' };
    }
  }

  return { valid: true };
}
