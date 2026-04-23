import { Router } from 'express';
import {
  attackBoss,
  getStatus,
  getLadder,
  getHistory,
} from '../services/world-boss.service.js';

export const worldBossRouter = Router();

worldBossRouter.get('/status', (req, res) => {
  try {
    const playerId = req.playerId!;
    res.json(getStatus(playerId));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

worldBossRouter.post('/attack', (req, res) => {
  try {
    const playerId = req.playerId!;
    const { instanceIds } = req.body ?? {};
    if (!Array.isArray(instanceIds)) {
      res.status(400).json({ error: 'instanceIds array required' });
      return;
    }
    const result = attackBoss(playerId, instanceIds);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

worldBossRouter.get('/ladder', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
    res.json(getLadder(limit));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

worldBossRouter.get('/history', (req, res) => {
  try {
    const weeks = req.query.weeks ? parseInt(String(req.query.weeks), 10) : 4;
    res.json({ past: getHistory(weeks) });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
