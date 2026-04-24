import type {
  HomunculusType,
  HomunculusTreeDef,
  HomunculusNode,
  HomunculusInstanceState,
} from '../types/homunculus.js';

// ══════════════════════════════════════════════════════════════════════════
// Silvally skill tree (internal codename "homunculus")
//
// Layout — 3 columns, 13 nodes per element:
//
//   Col 1 (Skill 1, basic)         Col 2 (Skill 2, active)       Col 3 (Skill 3, passives)
//   ─────────────────────          ─────────────────────         ─────────────────────
//   basic (always on, free)
//                                  [p1] ── 1a
//          base_a  ◇ mutex              └── 1b              p_1a   ·   p_1b  (pair 1)
//          base_b  ◇ mutex
//                                  [p2] ── 2a              p_2a   ·   p_2b  (pair 2)
//                                       └── 2b
//
// Mutex rules:
//   · Col 1 upgrades (base_a, base_b) are in group "col1"   → pick one
//   · Col 2 leaves across both branches share group "col2_leaf" → pick one
//   · Col 3 passives are fully independent (no mutex) — all four stack
//
// Col-2 parents (s2_p1, s2_p2) are gate-only nodes: they cost essence, unlock
// their child leaves, but never surface as a skill themselves.
// ══════════════════════════════════════════════════════════════════════════

const BASE_UPGRADE_COST = (type: HomunculusType): Record<string, number> => ({
  [`${type}_high`]: 2,
  magic_high: 1,
});

const S2_PARENT_COST = (type: HomunculusType): Record<string, number> => ({
  [`${type}_high`]: 3,
  magic_high: 1,
});

const S2_LEAF_COST = (type: HomunculusType): Record<string, number> => ({
  [`${type}_high`]: 4,
  magic_high: 2,
});

const PASSIVE_COST = (type: HomunculusType): Record<string, number> => ({
  [`${type}_high`]: 5,
  magic_high: 3,
});

function buildTree(type: HomunculusType): HomunculusTreeDef {
  const prefix = `homunculus_${type}`;
  const nodes: HomunculusNode[] = [
    // ── Column 1 · Slot 0 (basic) ──────────────────────────────────────
    {
      id: `${type}_basic`,
      parent: null,
      cost: {},
      slot: 0,
      kind: 'replace',
      replaceSkillId: `${prefix}_basic`,
      alwaysUnlocked: true,
      label: 'Base Strike',
      description: 'The default basic attack. Always unlocked.',
      tier: 1, row: 1, col: 0,
    },
    {
      id: `${type}_base_a`,
      parent: `${type}_basic`,
      cost: BASE_UPGRADE_COST(type),
      slot: 0,
      kind: 'replace',
      replaceSkillId: `${prefix}_base_a`,
      mutexGroup: 'col1',
      label: 'Focused Upgrade',
      description: 'Single-target upgrade to the basic attack.',
      tier: 2, row: 0, col: 0,
    },
    {
      id: `${type}_base_b`,
      parent: `${type}_basic`,
      cost: BASE_UPGRADE_COST(type),
      slot: 0,
      kind: 'replace',
      replaceSkillId: `${prefix}_base_b`,
      mutexGroup: 'col1',
      label: 'Spread Upgrade',
      description: 'AoE variant of the basic attack.',
      tier: 2, row: 2, col: 0,
    },

    // ── Column 2 · Slot 1 (active) — branch 1 (focus) ──────────────────
    {
      id: `${type}_s2_p1`,
      parent: null,
      cost: S2_PARENT_COST(type),
      slot: 1,
      kind: 'gate',
      label: 'Focus Branch',
      description: 'Unlocks the focused (single-target) active-skill leaves.',
      tier: 1, row: 0, col: 1,
    },
    {
      id: `${type}_s2_1a`,
      parent: `${type}_s2_p1`,
      cost: S2_LEAF_COST(type),
      slot: 1,
      kind: 'replace',
      replaceSkillId: `${prefix}_s2_1a`,
      mutexGroup: 'col2_leaf',
      label: 'Path A',
      description: 'Maximum single-target damage.',
      tier: 2, row: 0, col: 2,
    },
    {
      id: `${type}_s2_1b`,
      parent: `${type}_s2_p1`,
      cost: S2_LEAF_COST(type),
      slot: 1,
      kind: 'replace',
      replaceSkillId: `${prefix}_s2_1b`,
      mutexGroup: 'col2_leaf',
      label: 'Path B',
      description: 'Single-target with a utility twist.',
      tier: 2, row: 1, col: 2,
    },

    // ── Column 2 · Slot 1 (active) — branch 2 (area) ───────────────────
    {
      id: `${type}_s2_p2`,
      parent: null,
      cost: S2_PARENT_COST(type),
      slot: 1,
      kind: 'gate',
      label: 'Area Branch',
      description: 'Unlocks the area (all-enemy) active-skill leaves.',
      tier: 1, row: 2, col: 1,
    },
    {
      id: `${type}_s2_2a`,
      parent: `${type}_s2_p2`,
      cost: S2_LEAF_COST(type),
      slot: 1,
      kind: 'replace',
      replaceSkillId: `${prefix}_s2_2a`,
      mutexGroup: 'col2_leaf',
      label: 'Path A',
      description: 'AoE with strong offensive pressure.',
      tier: 2, row: 2, col: 2,
    },
    {
      id: `${type}_s2_2b`,
      parent: `${type}_s2_p2`,
      cost: S2_LEAF_COST(type),
      slot: 1,
      kind: 'replace',
      replaceSkillId: `${prefix}_s2_2b`,
      mutexGroup: 'col2_leaf',
      label: 'Path B',
      description: 'AoE with debuff utility.',
      tier: 2, row: 3, col: 2,
    },

    // ── Column 3 · Slot 2 (passives) — all independent ─────────────────
    {
      id: `${type}_p_1a`,
      parent: null,
      cost: PASSIVE_COST(type),
      slot: 2,
      kind: 'replace',
      replaceSkillId: `${prefix}_p_1a`,
      label: 'Passive 1A',
      description: 'Trigger-style passive (pair 1).',
      tier: 3, row: 0, col: 3,
    },
    {
      id: `${type}_p_1b`,
      parent: null,
      cost: PASSIVE_COST(type),
      slot: 2,
      kind: 'replace',
      replaceSkillId: `${prefix}_p_1b`,
      label: 'Passive 1B',
      description: 'Trigger-style passive (pair 1).',
      tier: 3, row: 1, col: 3,
    },
    {
      id: `${type}_p_2a`,
      parent: null,
      cost: PASSIVE_COST(type),
      slot: 2,
      kind: 'replace',
      replaceSkillId: `${prefix}_p_2a`,
      label: 'Passive 2A',
      description: 'Aura-style passive (pair 2).',
      tier: 3, row: 2, col: 3,
    },
    {
      id: `${type}_p_2b`,
      parent: null,
      cost: PASSIVE_COST(type),
      slot: 2,
      kind: 'replace',
      replaceSkillId: `${prefix}_p_2b`,
      label: 'Passive 2B',
      description: 'Aura-style passive (pair 2).',
      tier: 3, row: 3, col: 3,
    },
  ];

  const baseSkillIds: [string, string, string] = [
    `${prefix}_basic`,
    `${prefix}_s2_1a`,
    `${prefix}_p_1a`,
  ];

  return { type, baseSkillIds, nodes };
}

export const HOMUNCULUS_TREES: Record<HomunculusType, HomunculusTreeDef> = {
  fire: buildTree('fire'),
  water: buildTree('water'),
  grass: buildTree('grass'),
  psychic: buildTree('psychic'),
  dark: buildTree('dark'),
};

export function getHomunculusTree(type: HomunculusType): HomunculusTreeDef {
  return HOMUNCULUS_TREES[type];
}

export function getHomunculusNode(type: HomunculusType, nodeId: string): HomunculusNode | undefined {
  return HOMUNCULUS_TREES[type].nodes.find(n => n.id === nodeId);
}

/**
 * Returns the effective skill ids the battle engine should load. Always starts
 * with [basic, active, ...passives]. The basic slot collapses col-1 mutex
 * upgrades onto a single id; the active slot picks the one col-2 leaf that's
 * unlocked (mutex across branches); col-3 passives are independent so every
 * unlocked passive is appended.
 */
export function resolveHomunculusSkills(
  type: HomunculusType,
  unlocked: readonly string[],
): string[] {
  const def = HOMUNCULUS_TREES[type];
  const unlockedSet = new Set<string>(unlocked);
  // col-1 base is always unlocked, even if the client didn't persist it.
  const basicNode = def.nodes.find(n => n.slot === 0 && n.alwaysUnlocked);
  if (basicNode) unlockedSet.add(basicNode.id);

  // Slot 0: deepest unlocked wins (base_a/base_b override basic).
  const slot0Node =
    def.nodes
      .filter(n => n.slot === 0 && n.kind === 'replace' && unlockedSet.has(n.id))
      .sort((a, b) => b.tier - a.tier)[0];
  const slot0Id = slot0Node?.replaceSkillId ?? def.baseSkillIds[0];

  // Slot 1: pick the single unlocked leaf (mutex across col-2 leaves).
  const slot1Node = def.nodes.find(
    n => n.slot === 1 && n.kind === 'replace' && unlockedSet.has(n.id),
  );
  const slot1Id = slot1Node?.replaceSkillId ?? def.baseSkillIds[1];

  // Slot 2+: every unlocked passive is active simultaneously.
  const passiveIds = def.nodes
    .filter(n => n.slot === 2 && n.kind === 'replace' && unlockedSet.has(n.id))
    .map(n => n.replaceSkillId!)
    .filter(Boolean);
  const slot2Ids = passiveIds.length > 0 ? passiveIds : [def.baseSkillIds[2]];

  return [slot0Id, slot1Id, ...slot2Ids];
}

/**
 * Validates that a node can be unlocked: it exists, isn't already unlocked,
 * its parent (if any) is unlocked, and no sibling in its mutex group has been
 * claimed already.
 */
export function validateNodeUnlock(
  type: HomunculusType,
  state: HomunculusInstanceState,
  nodeId: string,
): string | undefined {
  const node = getHomunculusNode(type, nodeId);
  if (!node) return 'Node not found';
  if (node.alwaysUnlocked) return 'Node is always unlocked';
  if (state.unlocked.includes(nodeId)) return 'Node already unlocked';
  if (node.parent) {
    const parent = getHomunculusNode(type, node.parent);
    const parentUnlocked = parent?.alwaysUnlocked || state.unlocked.includes(node.parent);
    if (!parentUnlocked) return 'Prerequisite node is locked';
  }
  if (node.mutexGroup) {
    const tree = HOMUNCULUS_TREES[type];
    const rival = tree.nodes.find(
      n => n.id !== nodeId
        && n.mutexGroup === node.mutexGroup
        && state.unlocked.includes(n.id),
    );
    if (rival) return `Conflicts with "${rival.label}" — reset the tree to switch paths`;
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
