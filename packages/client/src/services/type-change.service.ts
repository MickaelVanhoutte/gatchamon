import type { PokemonInstance, Player } from '@gatchamon/shared';
import { getTemplate, getTypeChangeDef, getAvailableTypeChanges } from '@gatchamon/shared';
import { loadPlayer, savePlayer, loadCollection, saveCollection } from './storage';
import { checkAndUpdateTrophies } from './reward.service';

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

export function performTypeChange(instanceId: string, targetTemplateId: number): PokemonInstance {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');

  const collection = loadCollection();
  const idx = collection.findIndex(p => p.instanceId === instanceId);
  if (idx === -1) throw new Error('Monster not found');

  const instance = collection[idx];
  const validation = canChangeType(instance, player, targetTemplateId);
  if (!validation.valid) throw new Error(validation.reason);

  const def = getTypeChangeDef(instance.templateId)!;
  const available = getAvailableTypeChanges(def, instance.templateId);
  const target = available.find(t => t.targetTemplateId === targetTemplateId)!;

  const materials = { ...(player.materials ?? {}) };
  for (const [essenceId, needed] of Object.entries(target.cost.essences)) {
    materials[essenceId] = (materials[essenceId] ?? 0) - needed;
  }
  savePlayer({ ...player, materials });

  collection[idx] = {
    ...instance,
    templateId: targetTemplateId,
  };
  saveCollection(collection);

  checkAndUpdateTrophies();

  return collection[idx];
}
