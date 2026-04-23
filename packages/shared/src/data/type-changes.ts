import type { TypeChangeDefinition, TypeChangeCost } from '../types/type-change.js';
import type { PokemonType } from '../types/pokemon.js';
import type { HomunculusType, HomunculusFusionCost } from '../types/homunculus.js';

const TYPED_FORMS_ORDER: PokemonType[] = [
  'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
  'fire', 'flying', 'ghost', 'grass', 'ground', 'ice',
  'poison', 'psychic', 'rock', 'steel', 'water',
];

function buildFormMap(firstFormId: number): Partial<Record<PokemonType, number>> {
  const map: Partial<Record<PokemonType, number>> = {};
  TYPED_FORMS_ORDER.forEach((type, i) => {
    map[type] = firstFormId + i;
  });
  return map;
}

export const TYPE_CHANGE_DEFS: TypeChangeDefinition[] = [
  { baseTemplateId: 493, forms: buildFormMap(15493) },
  { baseTemplateId: 773, forms: buildFormMap(15773) },
];

export function getTypeChangeCost(targetType: PokemonType): TypeChangeCost {
  if (targetType === 'normal') {
    return { essences: {} };
  }
  return {
    essences: {
      [`${targetType}_high`]: 5,
      magic_high: 3,
    },
  };
}

export function getTypeChangeDef(templateId: number): TypeChangeDefinition | undefined {
  return TYPE_CHANGE_DEFS.find(def => {
    if (def.baseTemplateId === templateId) return true;
    return Object.values(def.forms).includes(templateId);
  });
}

export function getCurrentFormType(def: TypeChangeDefinition, templateId: number): PokemonType {
  if (templateId === def.baseTemplateId) return 'normal';
  for (const [type, id] of Object.entries(def.forms)) {
    if (id === templateId) return type as PokemonType;
  }
  return 'normal';
}

export function getAvailableTypeChanges(
  def: TypeChangeDefinition,
  currentTemplateId: number,
): { targetType: PokemonType; targetTemplateId: number; cost: TypeChangeCost }[] {
  const currentType = getCurrentFormType(def, currentTemplateId);
  const results: { targetType: PokemonType; targetTemplateId: number; cost: TypeChangeCost }[] = [];

  if (currentType !== 'normal') {
    results.push({
      targetType: 'normal',
      targetTemplateId: def.baseTemplateId,
      cost: getTypeChangeCost('normal'),
    });
  }

  for (const [type, templateId] of Object.entries(def.forms)) {
    if (type !== currentType && templateId !== undefined) {
      results.push({
        targetType: type as PokemonType,
        targetTemplateId: templateId,
        cost: getTypeChangeCost(type as PokemonType),
      });
    }
  }

  return results;
}

// ── Homunculus fusion (Typenull → typed Homunculus) ───────────────────

export const TYPENULL_TEMPLATE_ID = 772;

export const HOMUNCULUS_FORMS: Record<HomunculusType, number> = {
  fire: 15990,
  water: 15991,
  grass: 15992,
};

export const HOMUNCULUS_TYPES: HomunculusType[] = ['fire', 'water', 'grass'];

export function getHomunculusType(templateId: number): HomunculusType | null {
  for (const type of HOMUNCULUS_TYPES) {
    if (HOMUNCULUS_FORMS[type] === templateId) return type;
  }
  return null;
}

export function isHomunculusForm(templateId: number): boolean {
  return getHomunculusType(templateId) !== null;
}

export function getFusionCost(targetType: HomunculusType): HomunculusFusionCost {
  return {
    essences: {
      [`${targetType}_high`]: 15,
      magic_high: 10,
    },
  };
}

export function getHomunculusSwitchCost(targetType: HomunculusType): HomunculusFusionCost {
  return {
    essences: {
      [`${targetType}_high`]: 10,
      magic_high: 5,
    },
  };
}
