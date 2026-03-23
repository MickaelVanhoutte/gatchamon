import type { PokemonType } from './pokemon.js';

export type EssenceTier = 'low' | 'mid' | 'high';

export interface EssenceDefinition {
  id: string;
  element: PokemonType | 'magic';
  tier: EssenceTier;
  name: string;
  icon: string;
}

export interface EvolutionRequirement {
  essences: Record<string, number>;
  levelRequired: number;
}

export interface EvolutionChain {
  from: number;
  to: number;
  requirements: EvolutionRequirement;
}

export interface MaterialInventory {
  [essenceId: string]: number;
}

export interface DungeonDrop {
  essenceId: string;
  quantity: [number, number];
  chance: number;
}

export interface DungeonFloor {
  enemyLevel: number;
  drops: DungeonDrop[];
}

export interface DungeonDef {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
  enemyPool: number[];
  energyCost: number;
  floors: DungeonFloor[];
}

export interface DungeonRewards {
  essences: Record<string, number>;
  xpPerMon: number;
}
