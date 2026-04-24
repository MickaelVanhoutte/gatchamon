import type { SkillEffect } from './pokemon.js';

export type HomunculusType = 'fire' | 'water' | 'grass' | 'psychic' | 'dark';

export interface HomunculusNode {
  id: string;
  parent: string | null;
  cost: Record<string, number>;
  slot: 0 | 1 | 2;
  kind: 'replace' | 'overlay' | 'gate';
  replaceSkillId?: string;
  overlay?: {
    addEffect?: SkillEffect;
    multiplierDelta?: number;
    chanceDelta?: number;
  };
  /**
   * Nodes sharing the same non-null mutex group are mutually exclusive —
   * unlocking one locks out its siblings until the tree is reset.
   */
  mutexGroup?: string;
  /**
   * Always-unlocked starter node (costs nothing, cannot be locked/refunded).
   * Only ever true for the column-1 base attack.
   */
  alwaysUnlocked?: boolean;
  label: string;
  description: string;
  tier: 1 | 2 | 3;
  row: number;
  col: number;
}

export interface HomunculusTreeDef {
  type: HomunculusType;
  /** Fallback ids when no tree nodes are unlocked: [basic, active, passive]. */
  baseSkillIds: [string, string, string];
  nodes: HomunculusNode[];
}

export interface HomunculusInstanceState {
  unlocked: string[];
}

export interface HomunculusFusionCost {
  essences: Record<string, number>;
}
