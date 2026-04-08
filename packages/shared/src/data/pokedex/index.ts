import type { PokemonTemplate } from '../../types/pokemon.js';
import { GEN1 } from './gen1.js';
import { GEN2 } from './gen2.js';
import { GEN3 } from './gen3.js';
import { GEN4 } from './gen4.js';
import { GEN5 } from './gen5.js';
import { GEN6 } from './gen6.js';
import { GEN7 } from './gen7.js';
import { GEN8 } from './gen8.js';
import { GEN9 } from './gen9.js';
import { FORMS } from './forms.js';
import { initLeaderSkills } from '../leader-skills.js';

export const POKEDEX: PokemonTemplate[] = [
  ...GEN1,
  ...GEN2,
  ...GEN3,
  ...GEN4,
  ...GEN5,
  ...GEN6,
  ...GEN7,
  ...GEN8,
  ...GEN9,
  ...FORMS,
];

// Patch all 3★+ templates with deterministic leader skills
initLeaderSkills();

export const POKEDEX_MAP = new Map<number, PokemonTemplate>(
  POKEDEX.map(p => [p.id, p])
);

export function getTemplate(id: number): PokemonTemplate | undefined {
  return POKEDEX_MAP.get(id);
}
