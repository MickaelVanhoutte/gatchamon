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

    it.each(HOMUNCULUS_TYPES as HomunculusType[])(
      '%s tree has exactly 13 nodes (1 basic + 2 upgrades + 2 parents + 4 leaves + 4 passives)',
      (type) => {
        expect(getHomunculusTree(type).nodes).toHaveLength(13);
      },
    );
  });

  describe('resolveHomunculusSkills', () => {
    it('returns the base skill ids when nothing is unlocked (basic auto-on)', () => {
      const result = resolveHomunculusSkills('fire', []);
      expect(result[0]).toBe(HOMUNCULUS_TREES.fire.baseSkillIds[0]);
      expect(result[1]).toBe(HOMUNCULUS_TREES.fire.baseSkillIds[1]);
      expect(result[2]).toBe(HOMUNCULUS_TREES.fire.baseSkillIds[2]);
    });

    it('replaces slot 0 when a base upgrade is unlocked', () => {
      const result = resolveHomunculusSkills('fire', ['fire_base_a']);
      expect(result[0]).toBe('homunculus_fire_base_a');
    });

    it('replaces the active slot when a col-2 leaf is unlocked', () => {
      const result = resolveHomunculusSkills('fire', ['fire_s2_p2', 'fire_s2_2a']);
      expect(result[1]).toBe('homunculus_fire_s2_2a');
    });

    it('stacks every unlocked passive into the resolved skill list', () => {
      const result = resolveHomunculusSkills('fire', ['fire_p_1a', 'fire_p_1b', 'fire_p_2b']);
      // [basic, active, ...passives]
      expect(result.slice(2).sort()).toEqual([
        'homunculus_fire_p_1a',
        'homunculus_fire_p_1b',
        'homunculus_fire_p_2b',
      ].sort());
    });

    it('resolves each column independently', () => {
      const result = resolveHomunculusSkills('water', [
        'water_base_a', 'water_s2_p1', 'water_s2_1b', 'water_p_2a',
      ]);
      expect(result[0]).toBe('homunculus_water_base_a');
      expect(result[1]).toBe('homunculus_water_s2_1b');
      expect(result.slice(2)).toContain('homunculus_water_p_2a');
    });

    it('returns basics if only an unknown node id is in unlocked', () => {
      const result = resolveHomunculusSkills('grass', ['nonexistent_node']);
      expect(result[0]).toBe(HOMUNCULUS_TREES.grass.baseSkillIds[0]);
      expect(result[1]).toBe(HOMUNCULUS_TREES.grass.baseSkillIds[1]);
      expect(result[2]).toBe(HOMUNCULUS_TREES.grass.baseSkillIds[2]);
    });
  });

  describe('validateNodeUnlock', () => {
    it('rejects an unknown node id', () => {
      expect(validateNodeUnlock('fire', { unlocked: [] }, 'bogus')).toBeTruthy();
    });

    it('rejects a col-2 leaf whose branch parent is locked', () => {
      expect(validateNodeUnlock('fire', { unlocked: [] }, 'fire_s2_1a')).toBeTruthy();
    });

    it('allows a col-2 branch parent (no prereq)', () => {
      expect(validateNodeUnlock('fire', { unlocked: [] }, 'fire_s2_p1')).toBeUndefined();
    });

    it('allows a leaf once its branch parent is unlocked', () => {
      expect(validateNodeUnlock('fire', { unlocked: ['fire_s2_p1'] }, 'fire_s2_1a')).toBeUndefined();
    });

    it('rejects re-unlocking an already-unlocked node', () => {
      expect(validateNodeUnlock('fire', { unlocked: ['fire_s2_p1'] }, 'fire_s2_p1')).toBeTruthy();
    });

    it('refuses the always-unlocked basic node (cannot be re-unlocked)', () => {
      expect(validateNodeUnlock('fire', { unlocked: [] }, 'fire_basic')).toBeTruthy();
    });

    it('rejects a col-1 upgrade when its mutex sibling is already unlocked', () => {
      const err = validateNodeUnlock('fire', { unlocked: ['fire_base_a'] }, 'fire_base_b');
      expect(err).toMatch(/conflict/i);
    });

    it('rejects a col-2 leaf in a different branch when another branch leaf is already unlocked', () => {
      const err = validateNodeUnlock(
        'fire',
        { unlocked: ['fire_s2_p1', 'fire_s2_1a', 'fire_s2_p2'] },
        'fire_s2_2a',
      );
      expect(err).toMatch(/conflict/i);
    });

    it('allows all four col-3 passives together (no mutex)', () => {
      const state = { unlocked: ['fire_p_1a', 'fire_p_1b', 'fire_p_2a'] };
      expect(validateNodeUnlock('fire', state, 'fire_p_2b')).toBeUndefined();
    });
  });

  describe('sumTreeCost', () => {
    it('sums cost across unlocked nodes', () => {
      const refund = sumTreeCost('fire', ['fire_base_a', 'fire_s2_p1']);
      // base_a = {fire_high:2, magic_high:1}, s2_p1 = {fire_high:3, magic_high:1}
      expect(refund.fire_high).toBe(5);
      expect(refund.magic_high).toBe(2);
    });

    it('returns an empty object for an empty set', () => {
      expect(sumTreeCost('fire', [])).toEqual({});
    });

    it('ignores unknown node ids silently', () => {
      const refund = sumTreeCost('fire', ['fire_base_a', 'unknown_node']);
      expect(refund.fire_high).toBe(2);
    });
  });

  describe('getHomunculusNode', () => {
    it('returns a node by id', () => {
      const node = getHomunculusNode('fire', 'fire_base_a');
      expect(node?.id).toBe('fire_base_a');
    });

    it('returns undefined for unknown ids', () => {
      expect(getHomunculusNode('fire', 'nope')).toBeUndefined();
    });
  });
});
