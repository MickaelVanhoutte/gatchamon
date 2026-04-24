import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema.js';
import { rowToInstance } from '../routes/collection.js';
import {
  TYPENULL_TEMPLATE_ID,
  HOMUNCULUS_FORMS,
  getFusionCost,
  getHomunculusSwitchCost,
  isHomunculusForm,
  getHomunculusType,
  getHomunculusTree,
  getHomunculusNode,
  validateNodeUnlock,
  sumTreeCost,
  resolveHomunculusSkills,
  getTemplate,
} from '@gatchamon/shared';
import type { HomunculusType, HomunculusInstanceState, PokemonInstance } from '@gatchamon/shared';
import { hasGrantedFlag, setGrantedFlag } from './daily.service.js';

const TYPENULL_GRANTED_FLAG = 'typenull_granted';
const TYPENULL_CRAFTED_FLAG = 'typenull_crafted';
const HOMUNCULUS_FUSED_FLAG = 'homunculus_fused';

const TYPENULL_CRAFT_COST: Record<string, number> = { magic_high: 30 };

function loadInstance(instanceId: string, ownerId: string): any {
  return getDb().prepare(
    'SELECT * FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
  ).get(instanceId, ownerId);
}

function loadPlayerRow(playerId: string): any {
  return getDb().prepare('SELECT * FROM players WHERE id = ?').get(playerId);
}

function parseMaterials(row: any): Record<string, number> {
  return row.materials ? JSON.parse(row.materials) : {};
}

export function getTypenullCraftCost(): Record<string, number> {
  return { ...TYPENULL_CRAFT_COST };
}

/**
 * Craft a Typenull by spending essences. One-time per player — tracked via
 * `typenull_crafted` flag. Also blocked if the player already owns a Typenull
 * (legacy `typenull_granted` accounts) or has already fused a Homunculus.
 */
export function performCraftTypenull(playerId: string): PokemonInstance {
  const db = getDb();

  if (hasGrantedFlag(playerId, HOMUNCULUS_FUSED_FLAG)) {
    throw new Error('You already have a Homunculus');
  }
  if (hasGrantedFlag(playerId, TYPENULL_CRAFTED_FLAG) || hasGrantedFlag(playerId, TYPENULL_GRANTED_FLAG)) {
    throw new Error('You already crafted a Typenull');
  }

  const existing = db.prepare(
    'SELECT 1 FROM pokemon_instances WHERE owner_id = ? AND template_id = ?'
  ).get(playerId, TYPENULL_TEMPLATE_ID);
  if (existing) {
    throw new Error('You already own a Typenull');
  }

  const playerRow = loadPlayerRow(playerId);
  if (!playerRow) throw new Error('Player not found');
  const materials = parseMaterials(playerRow);

  for (const [essId, needed] of Object.entries(TYPENULL_CRAFT_COST)) {
    if ((materials[essId] ?? 0) < needed) {
      throw new Error(`Not enough ${essId}`);
    }
  }

  const instanceId = uuidv4();
  let created: PokemonInstance | null = null;

  const txn = db.transaction(() => {
    for (const [essId, needed] of Object.entries(TYPENULL_CRAFT_COST)) {
      materials[essId] = (materials[essId] ?? 0) - needed;
      if (materials[essId] <= 0) delete materials[essId];
    }
    db.prepare('UPDATE players SET materials = ? WHERE id = ?')
      .run(JSON.stringify(materials), playerId);

    db.prepare(
      `INSERT INTO pokemon_instances
        (instance_id, template_id, owner_id, level, stars, exp, is_shiny, skill_levels, selected_passive, is_locked, show_on_home, location)
       VALUES (?, ?, ?, 1, 5, 0, 0, '[1,1,1]', 0, 0, 0, 'collection')`
    ).run(instanceId, TYPENULL_TEMPLATE_ID, playerId);

    setGrantedFlag(playerId, TYPENULL_CRAFTED_FLAG);

    created = {
      instanceId,
      templateId: TYPENULL_TEMPLATE_ID,
      ownerId: playerId,
      level: 1,
      stars: 5,
      exp: 0,
      isShiny: false,
      skillLevels: [1, 1, 1],
      selectedPassive: 0,
      isLocked: false,
      showOnHome: false,
    };
  });
  txn();

  return created!;
}

export function performFusion(
  playerId: string,
  instanceId: string,
  targetType: HomunculusType,
): PokemonInstance {
  const db = getDb();

  if (hasGrantedFlag(playerId, HOMUNCULUS_FUSED_FLAG)) {
    throw new Error('You already have a Homunculus');
  }

  const row = loadInstance(instanceId, playerId);
  if (!row) throw new Error('Monster not found');
  const instance = rowToInstance(row);

  if (instance.templateId !== TYPENULL_TEMPLATE_ID) {
    throw new Error('Only Typenull can be fused into a Homunculus');
  }

  const targetTemplateId = HOMUNCULUS_FORMS[targetType];
  if (!targetTemplateId || !getTemplate(targetTemplateId)) {
    throw new Error('Invalid Homunculus form');
  }

  const playerRow = loadPlayerRow(playerId);
  if (!playerRow) throw new Error('Player not found');
  const materials = parseMaterials(playerRow);

  const cost = getFusionCost(targetType);
  for (const [essenceId, needed] of Object.entries(cost.essences)) {
    if ((materials[essenceId] ?? 0) < needed) {
      throw new Error(`Not enough ${essenceId}`);
    }
  }

  const emptyTree = JSON.stringify({ unlocked: [] });

  const txn = db.transaction(() => {
    for (const [essenceId, needed] of Object.entries(cost.essences)) {
      materials[essenceId] = (materials[essenceId] ?? 0) - needed;
      if (materials[essenceId] <= 0) delete materials[essenceId];
    }
    db.prepare('UPDATE players SET materials = ? WHERE id = ?')
      .run(JSON.stringify(materials), playerId);

    db.prepare(
      'UPDATE pokemon_instances SET template_id = ?, selected_passive = 0, homunculus_tree = ? WHERE instance_id = ?'
    ).run(targetTemplateId, emptyTree, instanceId);

    setGrantedFlag(playerId, HOMUNCULUS_FUSED_FLAG);
  });
  txn();

  return {
    ...instance,
    templateId: targetTemplateId,
    selectedPassive: 0,
    homunculusTree: { unlocked: [] },
  };
}

function requireHomunculus(playerId: string, instanceId: string): {
  instance: PokemonInstance;
  type: HomunculusType;
  tree: HomunculusInstanceState;
} {
  const row = loadInstance(instanceId, playerId);
  if (!row) throw new Error('Monster not found');
  const instance = rowToInstance(row);

  const type = getHomunculusType(instance.templateId);
  if (!type) throw new Error('This monster is not a Homunculus');

  const tree: HomunculusInstanceState = instance.homunculusTree ?? { unlocked: [] };
  return { instance, type, tree };
}

function deductMaterials(
  playerId: string,
  materials: Record<string, number>,
  cost: Record<string, number>,
): void {
  for (const [essId, needed] of Object.entries(cost)) {
    if ((materials[essId] ?? 0) < needed) {
      throw new Error(`Not enough ${essId}`);
    }
  }
  for (const [essId, needed] of Object.entries(cost)) {
    materials[essId] = (materials[essId] ?? 0) - needed;
    if (materials[essId] <= 0) delete materials[essId];
  }
}

function addMaterials(materials: Record<string, number>, add: Record<string, number>): void {
  for (const [essId, amount] of Object.entries(add)) {
    materials[essId] = (materials[essId] ?? 0) + amount;
  }
}

export function performUnlockNode(
  playerId: string,
  instanceId: string,
  nodeId: string,
): PokemonInstance {
  const db = getDb();
  const { instance, type, tree } = requireHomunculus(playerId, instanceId);

  const err = validateNodeUnlock(type, tree, nodeId);
  if (err) throw new Error(err);

  const node = getHomunculusNode(type, nodeId);
  if (!node) throw new Error('Node not found');

  const playerRow = loadPlayerRow(playerId);
  if (!playerRow) throw new Error('Player not found');
  const materials = parseMaterials(playerRow);

  const nextTree: HomunculusInstanceState = { unlocked: [...tree.unlocked, nodeId] };

  const txn = db.transaction(() => {
    deductMaterials(playerId, materials, node.cost);
    db.prepare('UPDATE players SET materials = ? WHERE id = ?')
      .run(JSON.stringify(materials), playerId);
    db.prepare('UPDATE pokemon_instances SET homunculus_tree = ? WHERE instance_id = ?')
      .run(JSON.stringify(nextTree), instanceId);
  });
  txn();

  return { ...instance, homunculusTree: nextTree };
}

export function performResetTree(
  playerId: string,
  instanceId: string,
): { instance: PokemonInstance; refunded: Record<string, number> } {
  const db = getDb();
  const { instance, type, tree } = requireHomunculus(playerId, instanceId);

  const refund = sumTreeCost(type, tree.unlocked);

  const playerRow = loadPlayerRow(playerId);
  if (!playerRow) throw new Error('Player not found');
  const materials = parseMaterials(playerRow);

  const emptyTree: HomunculusInstanceState = { unlocked: [] };

  const txn = db.transaction(() => {
    addMaterials(materials, refund);
    db.prepare('UPDATE players SET materials = ? WHERE id = ?')
      .run(JSON.stringify(materials), playerId);
    db.prepare('UPDATE pokemon_instances SET homunculus_tree = ? WHERE instance_id = ?')
      .run(JSON.stringify(emptyTree), instanceId);
  });
  txn();

  return { instance: { ...instance, homunculusTree: emptyTree }, refunded: refund };
}

export function performSwitchType(
  playerId: string,
  instanceId: string,
  targetType: HomunculusType,
): { instance: PokemonInstance; refunded: Record<string, number> } {
  const db = getDb();
  const { instance, type: currentType, tree } = requireHomunculus(playerId, instanceId);

  if (currentType === targetType) {
    throw new Error('Already this type');
  }

  const targetTemplateId = HOMUNCULUS_FORMS[targetType];
  if (!targetTemplateId || !getTemplate(targetTemplateId)) {
    throw new Error('Invalid target type');
  }

  const refund = sumTreeCost(currentType, tree.unlocked);
  const switchCost = getHomunculusSwitchCost(targetType).essences;

  const playerRow = loadPlayerRow(playerId);
  if (!playerRow) throw new Error('Player not found');
  const materials = parseMaterials(playerRow);

  // Net: refund first, then deduct. Prevents the rare case where the player
  // has exactly the refund-plus-switch cost on hand.
  const preview = { ...materials };
  addMaterials(preview, refund);
  for (const [essId, needed] of Object.entries(switchCost)) {
    if ((preview[essId] ?? 0) < needed) {
      throw new Error(`Not enough ${essId} (even after refund)`);
    }
  }

  const emptyTree: HomunculusInstanceState = { unlocked: [] };

  const txn = db.transaction(() => {
    addMaterials(materials, refund);
    deductMaterials(playerId, materials, switchCost);
    db.prepare('UPDATE players SET materials = ? WHERE id = ?')
      .run(JSON.stringify(materials), playerId);
    db.prepare(
      'UPDATE pokemon_instances SET template_id = ?, selected_passive = 0, homunculus_tree = ? WHERE instance_id = ?'
    ).run(targetTemplateId, JSON.stringify(emptyTree), instanceId);
  });
  txn();

  return {
    instance: { ...instance, templateId: targetTemplateId, selectedPassive: 0, homunculusTree: emptyTree },
    refunded: refund,
  };
}

export function getHomunculusState(
  playerId: string,
  instanceId: string,
): {
  type: HomunculusType;
  unlocked: string[];
  effectiveSkills: string[];
  tree: import('@gatchamon/shared').HomunculusTreeDef;
} {
  const { type, tree } = requireHomunculus(playerId, instanceId);
  return {
    type,
    unlocked: tree.unlocked,
    effectiveSkills: resolveHomunculusSkills(type, tree.unlocked),
    tree: getHomunculusTree(type),
  };
}

export { isHomunculusForm, HOMUNCULUS_FUSED_FLAG, TYPENULL_GRANTED_FLAG, TYPENULL_CRAFTED_FLAG };
