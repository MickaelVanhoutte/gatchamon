import type { SkillEffect } from './pokemon.js';

export type HomunculusType = 'fire' | 'water' | 'grass';

export interface HomunculusNode {
  id: string;
  parent: string | null;
  cost: Record<string, number>;
  slot: 0 | 1 | 2;
  kind: 'replace' | 'overlay';
  replaceSkillId?: string;
  overlay?: {
    addEffect?: SkillEffect;
    multiplierDelta?: number;
    chanceDelta?: number;
  };
  label: string;
  description: string;
  tier: 1 | 2 | 3;
  row: number;
  col: number;
}

export interface HomunculusTreeDef {
  type: HomunculusType;
  baseSkillIds: [string, string, string];
  nodes: HomunculusNode[];
}

export interface HomunculusInstanceState {
  unlocked: string[];
}

export interface HomunculusFusionCost {
  essences: Record<string, number>;
}
