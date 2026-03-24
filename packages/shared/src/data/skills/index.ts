import type { SkillDefinition } from '../../types/pokemon.js';
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
};

export function getSkillsForPokemon(skillIds: [string, string, string]): SkillDefinition[] {
  return skillIds.map(id => SKILLS[id]).filter(Boolean);
}
