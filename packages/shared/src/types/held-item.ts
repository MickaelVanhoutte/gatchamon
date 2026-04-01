import type { BaseStats } from './pokemon.js';

export type HeldItemMainStatType =
  | 'hp_flat' | 'hp_pct'
  | 'atk_flat' | 'atk_pct'
  | 'def_flat' | 'def_pct'
  | 'spd_flat'
  | 'critRate' | 'critDmg'
  | 'acc' | 'res';

export type HeldItemGrade = 'common' | 'rare' | 'hero' | 'legend';

export type HeldItemSlot = 1 | 2 | 3 | 4 | 5 | 6;

export type ItemSetEffectType = 'stat' | 'proc';
export type ItemProcEffect = 'extra_turn' | 'stun_on_hit' | 'heal_per_turn';

export interface HeldItemSubStat {
  type: HeldItemMainStatType;
  value: number;
}

export interface HeldItemInstance {
  itemId: string;
  setId: string;
  slot: HeldItemSlot;
  stars: 1 | 2 | 3 | 4 | 5 | 6;
  grade: HeldItemGrade;
  level: number; // 0-15
  mainStat: HeldItemMainStatType;
  mainStatValue: number;
  subStats: HeldItemSubStat[];
  equippedTo: string | null; // PokemonInstance.instanceId
  ownerId: string;
}

export interface ItemSetDef {
  id: string;
  name: string;
  icon: string;
  pieces: 2 | 4;
  effectType: ItemSetEffectType;
  // For stat sets
  bonusStat?: keyof BaseStats;
  bonusValue?: number;
  bonusType?: 'percent' | 'flat';
  // For proc sets
  procDescription?: string;
  procChance?: number;
  procEffect?: ItemProcEffect;
  procValue?: number;
  color: string;
}

export interface ActiveSetEffect {
  setId: string;
  setName: string;
  effectType: ItemSetEffectType;
  // Stat effect
  bonusStat?: keyof BaseStats;
  bonusValue?: number;
  bonusType?: 'percent' | 'flat';
  // Proc effect
  procEffect?: ItemProcEffect;
  procChance?: number;
  procValue?: number;
  activations: number;
}

export interface MainStatScaling {
  base: Record<number, number>;
  perLevel: Record<number, number>;
}

export interface ItemDungeonDrop {
  setId: string;
  minStars: number;
  maxStars: number;
  gradeWeights: Record<HeldItemGrade, number>;
}

export interface ItemDungeonFloor {
  enemyLevel: number;
  enemies: number[];
  drops: ItemDungeonDrop[];
  pokedollarReward: [number, number];
  /** Rare stardust drop (high-level floors only) */
  stardustDrop?: { chance: number; min: number; max: number };
  /** Override naturalStars for enemies on this floor */
  enemyStars?: number;
  /** Multiplier applied to enemy stats after normal computation (e.g. 1.3 = +30%) */
  statBoost?: number;
  /** Flat speed bonus added to enemy speed (simulates held item speed) */
  speedBonus?: number;
}

export interface ItemDungeonDef {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
  energyCost: number;
  floors: ItemDungeonFloor[];
}
