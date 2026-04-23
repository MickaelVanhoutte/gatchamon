import { Router } from 'express';
import { getDb } from '../db/schema.js';
import {
  performAltarFeed,
  performMerge,
  performEvolution,
  performTypeChange,
  performEssenceMerge,
} from '../services/monster-management.service.js';
import {
  performFusion,
  performUnlockNode,
  performResetTree,
  performSwitchType,
  getHomunculusState,
} from '../services/homunculus.service.js';
import { HOMUNCULUS_TYPES } from '@gatchamon/shared';
import type { HomunculusType } from '@gatchamon/shared';
import {
  getActiveEvolutionsFrom,
  getTypeChangeDef,
  getAvailableTypeChanges,
  getTemplate,
  getShinyAlternatePassive,
} from '@gatchamon/shared';
import { incrementMission, trackTrophyStat } from '../services/daily.service.js';

export const monsterManagementRouter = Router();

// ── Altar Feed ─────────────────────────────────────────────────────────

monsterManagementRouter.post('/altar/feed', (req, res) => {
  try {
    const { playerId, baseInstanceId, fodderInstanceIds } = req.body;
    if (!playerId || !baseInstanceId || !fodderInstanceIds?.length) {
      res.status(400).json({ error: 'playerId, baseInstanceId, and fodderInstanceIds[] required' });
      return;
    }
    const result = performAltarFeed(playerId, baseInstanceId, fodderInstanceIds);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Merge ──────────────────────────────────────────────────────────────

monsterManagementRouter.post('/merge', (req, res) => {
  try {
    const { playerId, baseInstanceId, fodderInstanceId } = req.body;
    if (!playerId || !baseInstanceId || !fodderInstanceId) {
      res.status(400).json({ error: 'playerId, baseInstanceId, and fodderInstanceId required' });
      return;
    }
    const result = performMerge(playerId, baseInstanceId, fodderInstanceId);
    incrementMission(playerId, 'merge_monster');
    trackTrophyStat(playerId, 'totalMerges');
    res.json({ instance: result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Evolution ──────────────────────────────────────────────────────────

monsterManagementRouter.get('/evolution/options/:instanceId', (req, res) => {
  try {
    const { playerId } = req.query as { playerId: string };
    if (!playerId) {
      res.status(400).json({ error: 'playerId query param required' });
      return;
    }
    const db = getDb();
    const row = db.prepare(
      'SELECT * FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
    ).get(req.params.instanceId, playerId) as any;
    if (!row) {
      res.status(404).json({ error: 'Monster not found' });
      return;
    }
    const chains = getActiveEvolutionsFrom(row.template_id);
    res.json({ options: chains });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

monsterManagementRouter.post('/evolution/perform', (req, res) => {
  try {
    const { playerId, instanceId, targetTemplateId } = req.body;
    if (!playerId || !instanceId || targetTemplateId == null) {
      res.status(400).json({ error: 'playerId, instanceId, and targetTemplateId required' });
      return;
    }
    const result = performEvolution(playerId, instanceId, targetTemplateId);
    incrementMission(playerId, 'evolve_monster');
    trackTrophyStat(playerId, 'totalEvolutions');
    res.json({ instance: result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Type Change ────────────────────────────────────────────────────────

monsterManagementRouter.get('/type-change/options/:instanceId', (req, res) => {
  try {
    const { playerId } = req.query as { playerId: string };
    if (!playerId) {
      res.status(400).json({ error: 'playerId query param required' });
      return;
    }
    const db = getDb();
    const row = db.prepare(
      'SELECT * FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
    ).get(req.params.instanceId, playerId) as any;
    if (!row) {
      res.status(404).json({ error: 'Monster not found' });
      return;
    }
    const def = getTypeChangeDef(row.template_id);
    if (!def) {
      res.json({ options: [] });
      return;
    }
    const options = getAvailableTypeChanges(def, row.template_id);
    res.json({ options });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

monsterManagementRouter.post('/type-change/perform', (req, res) => {
  try {
    const { playerId, instanceId, targetTemplateId } = req.body;
    if (!playerId || !instanceId || targetTemplateId == null) {
      res.status(400).json({ error: 'playerId, instanceId, and targetTemplateId required' });
      return;
    }
    const result = performTypeChange(playerId, instanceId, targetTemplateId);
    res.json({ instance: result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Switch Passive (Shiny only) ───────────────────────────────────────

monsterManagementRouter.post('/switch-passive', (req, res) => {
  try {
    const { playerId, instanceId, selectedPassive } = req.body;
    if (!playerId || !instanceId || (selectedPassive !== 0 && selectedPassive !== 1)) {
      res.status(400).json({ error: 'playerId, instanceId, and selectedPassive (0|1) required' });
      return;
    }
    const db = getDb();
    const row = db.prepare(
      'SELECT * FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
    ).get(instanceId, playerId) as any;
    if (!row) {
      res.status(404).json({ error: 'Monster not found' });
      return;
    }
    if (!row.is_shiny) {
      res.status(400).json({ error: 'Only shiny monsters can switch passives' });
      return;
    }
    const template = getTemplate(row.template_id);
    if (!template || !getShinyAlternatePassive(template)) {
      res.status(400).json({ error: 'No alternate passive available for this monster' });
      return;
    }
    db.prepare(
      'UPDATE pokemon_instances SET selected_passive = ? WHERE instance_id = ? AND owner_id = ?'
    ).run(selectedPassive, instanceId, playerId);
    res.json({ ok: true, selectedPassive });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Homunculus Fusion ──────────────────────────────────────────────────

monsterManagementRouter.post('/homunculus/fuse', (req, res) => {
  try {
    const { playerId, instanceId, targetType } = req.body as {
      playerId: string; instanceId: string; targetType: HomunculusType;
    };
    if (!playerId || !instanceId || !targetType) {
      res.status(400).json({ error: 'playerId, instanceId, and targetType required' });
      return;
    }
    if (!HOMUNCULUS_TYPES.includes(targetType)) {
      res.status(400).json({ error: 'Invalid targetType' });
      return;
    }
    const result = performFusion(playerId, instanceId, targetType);
    res.json({ instance: result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

monsterManagementRouter.post('/homunculus/unlock-node', (req, res) => {
  try {
    const { playerId, instanceId, nodeId } = req.body as {
      playerId: string; instanceId: string; nodeId: string;
    };
    if (!playerId || !instanceId || !nodeId) {
      res.status(400).json({ error: 'playerId, instanceId, and nodeId required' });
      return;
    }
    const result = performUnlockNode(playerId, instanceId, nodeId);
    res.json({ instance: result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

monsterManagementRouter.post('/homunculus/reset-tree', (req, res) => {
  try {
    const { playerId, instanceId } = req.body as {
      playerId: string; instanceId: string;
    };
    if (!playerId || !instanceId) {
      res.status(400).json({ error: 'playerId and instanceId required' });
      return;
    }
    const result = performResetTree(playerId, instanceId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

monsterManagementRouter.post('/homunculus/switch-type', (req, res) => {
  try {
    const { playerId, instanceId, targetType } = req.body as {
      playerId: string; instanceId: string; targetType: HomunculusType;
    };
    if (!playerId || !instanceId || !targetType) {
      res.status(400).json({ error: 'playerId, instanceId, and targetType required' });
      return;
    }
    if (!HOMUNCULUS_TYPES.includes(targetType)) {
      res.status(400).json({ error: 'Invalid targetType' });
      return;
    }
    const result = performSwitchType(playerId, instanceId, targetType);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

monsterManagementRouter.get('/homunculus/state/:instanceId', (req, res) => {
  try {
    const { playerId } = req.query as { playerId: string };
    if (!playerId) {
      res.status(400).json({ error: 'playerId query param required' });
      return;
    }
    const result = getHomunculusState(playerId, req.params.instanceId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Essence Merge ──────────────────────────────────────────────────────

monsterManagementRouter.post('/essence-merge', (req, res) => {
  try {
    const { playerId, element, targetTier, targetCount } = req.body;
    if (!playerId || !element || !targetTier || !targetCount) {
      res.status(400).json({ error: 'playerId, element, targetTier, and targetCount required' });
      return;
    }
    const materials = performEssenceMerge(playerId, element, targetTier, targetCount);
    res.json({ materials });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
