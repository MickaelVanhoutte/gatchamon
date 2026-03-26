export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'grass' | 'electric'
  | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon'
  | 'fairy' | 'dark' | 'steel';

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  critDmg: number;
  acc: number;
  res: number;
}

export interface PokemonTemplate {
  id: number;
  name: string;
  types: PokemonType[];
  baseStats: BaseStats;
  naturalStars: 1 | 2 | 3 | 4 | 5;
  spriteUrl: string;
  skillIds: [string, string, string];
  height: number; // meters, from official Pokedex
  summonable?: boolean;
}

export interface PokemonInstance {
  instanceId: string;
  templateId: number;
  ownerId: string;
  level: number;
  stars: 1 | 2 | 3 | 4 | 5 | 6;
  exp: number;
  isShiny: boolean;
}

export type SkillTarget =
  | 'single_enemy' | 'all_enemies'
  | 'self' | 'single_ally' | 'all_allies';

export type SkillCategory = 'basic' | 'active' | 'passive';

export type EffectType = 'buff' | 'debuff' | 'dot' | 'heal' | 'stun';

export interface SkillEffect {
  type: EffectType;
  stat?: keyof BaseStats;
  value: number;
  duration: number;
  chance: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  type: PokemonType;
  category: SkillCategory;
  cooldown: number;
  multiplier: number;
  effects: SkillEffect[];
  target: SkillTarget;
}
