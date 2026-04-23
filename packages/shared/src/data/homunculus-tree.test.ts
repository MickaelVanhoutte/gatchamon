import { describe, it, expect } from 'vitest';
import {
  HOMUNCULUS_TREES,
  getHomunculusTree,
  getHomunculusNode,
  resolveHomunculusSkills,
  validateNodeUnlock,
  sumTreeCost,
} from './homunculus-tree.js';
import { HOMUNCULUS_TYPES } from './type-changes.js';
import { SKILLS } from './skills/index.js';
import type { HomunculusType } from '../types/homunculus.js';

describe('homunculus-tree', () => {
  describe('well-formedness', () => {
    it.each(HOMUNCULUS_TYPES as HomunculusType[])(
      'every %s tree node references an existing skill',
      (type) => {
        const tree = getHomunculusTree(type);
        for (const node of tree.nodes) {
          if (node.replaceSkillId) {
            expect(SKILLS[node.replaceSkillId], `${node.id} → ${node.replaceSkillId}`).toBeDefined();
          }
        }
        for (const id of tree.baseSkillIds) {
          expect(SKILLS[id], `${type} base ${id}`).toBeDefined();
        }
      },
    );

    it.each(HOMUNCULUS_TYPES as HomunculusType[])(
      'every %s non-root node has a reachable parent inside the tree',
      (type) => {
        const tree = getHomunculusTree(type);
        const ids = new Set(tree.nodes.map(n => n.id));
        for (const node of tree.nodes) {
          if (node.parent) expect(ids.has(node.parent), `${node.id} → ${node.parent}`).toBe(true);
        }
      },
    );

    it.each(HOMUNCULUS_TYPES as HomunculusType[])(
      '%s tree has slot values in [0,1,2] only',
      (type) => {
        for (const node of getHomunculusTree(type).nodes) {
          expect([0, 1, 2]).toContain(node.slot);
        }
      },
    );

    it.each(HOMUNCULUS_TYPES as HomunculusType[])(
      '%s tree has no cycles (acyclic)',
      (type) => {
        const tree = getHomunculusTree(type);
        for (const node of tree.nodes) {
          const visited = new Set<string>([node.id]);
          let cur = node.parent;
          while (cur) {
            expect(visited.has(cur)).toBe(false);
            visited.add(cur);
            const parentNode = tree.nodes.find(n => n.id === cur);
            cur = parentNode?.parent ?? null;
          }
        }
      },
    );
  });

  describe('resolveHomunculusSkills', () => {
    it('returns the base skill ids when nothing is unlocked', () => {
      const result = resolveHomunculusSkills('fire', []);
      expect(result).toEqual(HOMUNCULUS_TREES.fire.baseSkillIds);
    });

    it('replaces the slot-1 skill when only the T1 root is unlocked', () => {
      const result = resolveHomunculusSkills('fire', ['fire_a1']);
      expect(result[1]).toBe('homunculus_fire_a1');
      // slot 0 and 2 untouched
      expect(result[0]).toBe(HOMUNCULUS_TREES.fire.baseSkillIds[0]);
      expect(result[2]).toBe(HOMUNCULUS_TREES.fire.baseSkillIds[2]);
    });

    it('prefers the deepest-tier node when multiple on the same slot are unlocked', () => {
      const result = resolveHomunculusSkills('fire', ['fire_a1', 'fire_a2a']);
      expect(result[1]).toBe('homunculus_fire_a2a');
    });

    it('when two siblings at the same tier are unlocked, the first in nodes array wins (deterministic)', () => {
      // a2a precedes a2b in the nodes array
      const result = resolveHomunculusSkills('fire', ['fire_a1', 'fire_a2a', 'fire_a2b']);
      expect(result[1]).toBe('homunculus_fire_a2a');
    });

    it('resolves both slot tracks independently', () => {
      const result = resolveHomunculusSkills('water', ['water_a1', 'water_b1']);
      expect(result[1]).toBe('homunculus_water_a1');
      expect(result[2]).toBe('homunculus_water_b1');
    });

    it('returns basics if only an unknown node id is in unlocked', () => {
      const result = resolveHomunculusSkills('grass', ['nonexistent_node']);
      expect(result).toEqual(HOMUNCULUS_TREES.grass.baseSkillIds);
    });
  });

  describe('validateNodeUnlock', () => {
    it('rejects an unknown node id', () => {
      expect(validateNodeUnlock('fire', { unlocked: [] }, 'bogus')).toBeTruthy();
    });

    it('rejects a node whose parent is locked', () => {
      const err = validateNodeUnlock('fire', { unlocked: [] }, 'fire_a2a');
      expect(err).toBeTruthy();
    });

    it('allows a root node (parent=null)', () => {
      expect(validateNodeUnlock('fire', { unlocked: [] }, 'fire_a1')).toBeUndefined();
    });

    it('allows a child when the parent is unlocked', () => {
      expect(validateNodeUnlock('fire', { unlocked: ['fire_a1'] }, 'fire_a2a')).toBeUndefined();
    });

    it('rejects re-unlocking an already-unlocked node', () => {
      expect(validateNodeUnlock('fire', { unlocked: ['fire_a1'] }, 'fire_a1')).toBeTruthy();
    });
  });

  describe('sumTreeCost', () => {
    it('sums cost across unlocked nodes', () => {
      const refund = sumTreeCost('fire', ['fire_a1', 'fire_a2a']);
      // a1 = {fire_high:1}, a2a = {fire_high:2, magic_high:1}
      expect(refund.fire_high).toBe(3);
      expect(refund.magic_high).toBe(1);
    });

    it('returns an empty object for an empty set', () => {
      expect(sumTreeCost('fire', [])).toEqual({});
    });

    it('ignores unknown node ids silently', () => {
      const refund = sumTreeCost('fire', ['fire_a1', 'unknown_node']);
      expect(refund.fire_high).toBe(1);
    });
  });

  describe('getHomunculusNode', () => {
    it('returns a node by id', () => {
      const node = getHomunculusNode('fire', 'fire_a1');
      expect(node?.id).toBe('fire_a1');
    });

    it('returns undefined for unknown ids', () => {
      expect(getHomunculusNode('fire', 'nope')).toBeUndefined();
    });
  });
});
