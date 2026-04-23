import type {
  HomunculusType,
  HomunculusTreeDef,
  HomunculusNode,
  HomunculusInstanceState,
} from '../types/homunculus.js';

/**
 * Tree shape (per type): 6 nodes, 2 tiers, 2 branches off each of 2 roots.
 * Columns (col) are 0..3 for visual layout; rows correspond to tiers.
 *
 *           A (T1, slot 1)              B (T1, slot 2)
 *           /       \                    /       \
 *      A-2a         A-2b            B-2a         B-2b
 *     (slot1)       (slot1)        (slot2)      (slot2)
 *
 * Unlock rule: a node can be unlocked only if its parent is unlocked (or parent === null).
 * Resolver picks the deepest unlocked node per slot as the effective skill; ties (multiple
 * unlocked at the same tier on the same slot) resolve by order in the `nodes` array.
 */

const TIER1_COST = (type: HomunculusType): Record<string, number> => ({
  [`${type}_high`]: 1,
});

const TIER2_COST = (type: HomunculusType): Record<string, number> => ({
  [`${type}_high`]: 2,
  magic_high: 1,
});

function buildTree(type: HomunculusType): HomunculusTreeDef {
  const nodes: HomunculusNode[] = [
    // Slot 1 track (active)
    {
      id: `${type}_a1`,
      parent: null,
      cost: TIER1_COST(type),
      slot: 1,
      kind: 'replace',
      replaceSkillId: `homunculus_${type}_a1`,
      label: 'Surge',
      description: 'Empowered active skill. Prerequisite for the slot-1 branches.',
      tier: 1,
      row: 0,
      col: 0,
    },
    {
      id: `${type}_a2a`,
      parent: `${type}_a1`,
      cost: TIER2_COST(type),
      slot: 1,
      kind: 'replace',
      replaceSkillId: `homunculus_${type}_a2a`,
      label: 'Focused Strike',
      description: 'Heavy single-target variant of the active skill.',
      tier: 2,
      row: 1,
      col: 0,
    },
    {
      id: `${type}_a2b`,
      parent: `${type}_a1`,
      cost: TIER2_COST(type),
      slot: 1,
      kind: 'replace',
      replaceSkillId: `homunculus_${type}_a2b`,
      label: 'Wide Sweep',
      description: 'AoE variant of the active skill.',
      tier: 2,
      row: 1,
      col: 1,
    },
    // Slot 2 track (passive)
    {
      id: `${type}_b1`,
      parent: null,
      cost: TIER1_COST(type),
      slot: 2,
      kind: 'replace',
      replaceSkillId: `homunculus_${type}_b1`,
      label: 'Aura',
      description: 'Empowered passive. Prerequisite for the slot-2 branches.',
      tier: 1,
      row: 0,
      col: 3,
    },
    {
      id: `${type}_b2a`,
      parent: `${type}_b1`,
      cost: TIER2_COST(type),
      slot: 2,
      kind: 'replace',
      replaceSkillId: `homunculus_${type}_b2a`,
      label: 'Offense Focus',
      description: 'Passive that scales with offense (on-attack effects).',
      tier: 2,
      row: 1,
      col: 3,
    },
    {
      id: `${type}_b2b`,
      parent: `${type}_b1`,
      cost: TIER2_COST(type),
      slot: 2,
      kind: 'replace',
      replaceSkillId: `homunculus_${type}_b2b`,
      label: 'Defense Focus',
      description: 'Passive that scales with survivability (on-hit / on-crit effects).',
      tier: 2,
      row: 1,
      col: 4,
    },
  ];

  const baseSkillIds: [string, string, string] = [
    `homunculus_${type}_basic_1`,
    `homunculus_${type}_basic_2`,
    `homunculus_${type}_basic_3`,
  ];

  return { type, baseSkillIds, nodes };
}

export const HOMUNCULUS_TREES: Record<HomunculusType, HomunculusTreeDef> = {
  fire: buildTree('fire'),
  water: buildTree('water'),
  grass: buildTree('grass'),
};

export function getHomunculusTree(type: HomunculusType): HomunculusTreeDef {
  return HOMUNCULUS_TREES[type];
}

export function getHomunculusNode(type: HomunculusType, nodeId: string): HomunculusNode | undefined {
  return HOMUNCULUS_TREES[type].nodes.find(n => n.id === nodeId);
}

/**
 * Returns the effective [slot0, slot1, slot2] skill ids given the unlocked nodes.
 * Falls back to `baseSkillIds` when no tree node targets a given slot.
 */
export function resolveHomunculusSkills(
  type: HomunculusType,
  unlocked: readonly string[],
): [string, string, string] {
  const def = HOMUNCULUS_TREES[type];
  const result: [string, string, string] = [...def.baseSkillIds];
  const unlockedSet = new Set(unlocked);

  for (const slot of [0, 1, 2] as const) {
    const candidates = def.nodes
      .filter(n => n.slot === slot && n.kind === 'replace' && unlockedSet.has(n.id))
      .sort((a, b) => b.tier - a.tier);
    const deepest = candidates[0];
    if (deepest?.replaceSkillId) {
      result[slot] = deepest.replaceSkillId;
    }
  }

  return result;
}

/**
 * Validates that a node can be unlocked: it exists, isn't already unlocked, and its
 * parent (if any) is unlocked. Returns an error message if invalid, undefined if OK.
 */
export function validateNodeUnlock(
  type: HomunculusType,
  state: HomunculusInstanceState,
  nodeId: string,
): string | undefined {
  const node = getHomunculusNode(type, nodeId);
  if (!node) return 'Node not found';
  if (state.unlocked.includes(nodeId)) return 'Node already unlocked';
  if (node.parent && !state.unlocked.includes(node.parent)) {
    return 'Prerequisite node is locked';
  }
  return undefined;
}

/**
 * Sums up the essence costs for a set of unlocked nodes (for reset refund).
 */
export function sumTreeCost(
  type: HomunculusType,
  unlocked: readonly string[],
): Record<string, number> {
  const def = HOMUNCULUS_TREES[type];
  const total: Record<string, number> = {};
  for (const nodeId of unlocked) {
    const node = def.nodes.find(n => n.id === nodeId);
    if (!node) continue;
    for (const [essId, amount] of Object.entries(node.cost)) {
      total[essId] = (total[essId] ?? 0) + amount;
    }
  }
  return total;
}
