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
  getActiveEvolutionsFrom,
  getTypeChangeDef,
  getAvailableTypeChanges,
} from '@gatchamon/shared';

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
