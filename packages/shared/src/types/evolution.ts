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
  enemies: number[];
  drops: DungeonDrop[];
  /** Override naturalStars for enemies on this floor */
  enemyStars?: number;
  /** Multiplier applied to enemy stats after normal computation (e.g. 1.3 = +30%) */
  statBoost?: number;
  /** Flat speed bonus added to enemy speed (simulates held item speed) */
  speedBonus?: number;
  /** Rare stardust drop (chance-based, scaling with floor level) */
  stardustDrop?: { chance: number; min: number; max: number };
}

export interface DungeonDef {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
  energyCost: number;
  floors: DungeonFloor[];
}

export interface DungeonRewards {
  essences: Record<string, number>;
  xpPerMon: number;
  stardust?: number;
}

// ---------------------------------------------------------------------------
// Mystery Dungeon — daily rotating dungeon with piece rewards
// ---------------------------------------------------------------------------

export interface MysteryDungeonFloor {
  enemyLevel: number;
  enemies: number[];       // templateIds
  enemyStars: number;
  statBoost?: number;
  speedBonus?: number;
  pieceReward: number;     // 1-5 pieces per clear
}

export interface MysteryDungeonDef {
  featuredTemplateId: number;
  dateKey: string;         // "YYYY-MM-DD" UTC
  name: string;
  description: string;
  energyCosts: number[];   // per-floor energy cost (2-6)
  floors: MysteryDungeonFloor[];
}
