import type { SkillDefinition, PokemonTemplate } from '../../types/pokemon.js';
import type { HomunculusInstanceState } from '../../types/homunculus.js';
import { getHomunculusType } from '../type-changes.js';
import { resolveHomunculusSkills } from '../homunculus-tree.js';
import { GEN1_SKILLS } from './gen1.js';
import { GEN2_SKILLS } from './gen2.js';
import { GEN3_SKILLS } from './gen3.js';
import { GEN4_SKILLS } from './gen4.js';
import { GEN5_SKILLS } from './gen5.js';
import { GEN6_SKILLS } from './gen6.js';
import { GEN7_SKILLS } from './gen7.js';
import { GEN8_SKILLS } from './gen8.js';
import { GEN9_SKILLS } from './gen9.js';
import { FORMS_SKILLS } from './forms.js';
import { GEN1_SHINY_SKILLS } from './gen1-shiny.js';
import { GEN2_SHINY_SKILLS } from './gen2-shiny.js';
import { GEN3_SHINY_SKILLS } from './gen3-shiny.js';
import { GEN4_SHINY_SKILLS } from './gen4-shiny.js';
import { GEN5_SHINY_SKILLS } from './gen5-shiny.js';
import { GEN6_SHINY_SKILLS } from './gen6-shiny.js';
import { GEN7_SHINY_SKILLS } from './gen7-shiny.js';
import { GEN8_SHINY_SKILLS } from './gen8-shiny.js';
import { GEN9_SHINY_SKILLS } from './gen9-shiny.js';
import { FORMS_SHINY_SKILLS } from './forms-shiny.js';
import { HOMUNCULUS_SKILLS } from './homunculus.js';

export const SKILLS: Record<string, SkillDefinition> = {
  ...GEN1_SKILLS,
  ...GEN2_SKILLS,
  ...GEN3_SKILLS,
  ...GEN4_SKILLS,
  ...GEN5_SKILLS,
  ...GEN6_SKILLS,
  ...GEN7_SKILLS,
  ...GEN8_SKILLS,
  ...GEN9_SKILLS,
  ...FORMS_SKILLS,
  ...GEN1_SHINY_SKILLS,
  ...GEN2_SHINY_SKILLS,
  ...GEN3_SHINY_SKILLS,
  ...GEN4_SHINY_SKILLS,
  ...GEN5_SHINY_SKILLS,
  ...GEN6_SHINY_SKILLS,
  ...GEN7_SHINY_SKILLS,
  ...GEN8_SHINY_SKILLS,
  ...GEN9_SHINY_SKILLS,
  ...FORMS_SHINY_SKILLS,
  ...HOMUNCULUS_SKILLS,
};

export function getSkillsForPokemon(skillIds: readonly string[]): SkillDefinition[] {
  return skillIds.map(id => SKILLS[id]).filter(Boolean);
}

export function getShinyAlternatePassive(template: PokemonTemplate): SkillDefinition | null {
  const altId = template.skillIds[2] + 'b';
  return SKILLS[altId] ?? null;
}

export function getEffectiveSkillIds(
  template: PokemonTemplate,
  selectedPassive?: 0 | 1,
): [string, string, string] {
  if (selectedPassive === 1) {
    const altId = template.skillIds[2] + 'b';
    if (SKILLS[altId]) {
      return [template.skillIds[0], template.skillIds[1], altId];
    }
  }
  return template.skillIds;
}

/**
 * Resolve the effective skill ids for a specific instance. Extends
 * `getEffectiveSkillIds` with Homunculus skill-tree overlays: when the template
 * is a Homunculus form and the instance has a tree, the tree's deepest-unlocked
 * replacement per slot wins. Otherwise falls back to the template defaults +
 * the shiny alternate-passive selection.
 */
export function resolveInstanceSkills(
  template: PokemonTemplate,
  selectedPassive?: 0 | 1,
  homunculusTree?: HomunculusInstanceState,
): string[] {
  const hType = getHomunculusType(template.id);
  if (hType) {
    // Silvally always resolves via its tree — even with no nodes unlocked the
    // basic-attack root yields the default [basic, active, passive] fallback.
    return resolveHomunculusSkills(hType, homunculusTree?.unlocked ?? []);
  }
  return [...getEffectiveSkillIds(template, selectedPassive)];
}
