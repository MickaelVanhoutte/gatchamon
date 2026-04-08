import { Router } from 'express';
import {
  setDefense,
  getDefense,
  findOpponents,
  startArenaBattle,
  startRivalBattle,
  getAttackHistory,
  getRivalsWithCooldowns,
} from '../services/arena.service.js';

export const arenaRouter = Router();

// ── Defense team ──────────────────────────────────────────────────────────

arenaRouter.get('/defense/:playerId', (req, res) => {
  try {
    const defense = getDefense(req.params.playerId);
    res.json({ defense });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

arenaRouter.post('/defense', (req, res) => {
  const { playerId, teamInstanceIds } = req.body;
  if (!playerId || !teamInstanceIds?.length) {
    res.status(400).json({ error: 'playerId and teamInstanceIds required' });
    return;
  }
  try {
    setDefense(playerId, teamInstanceIds);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── Matchmaking ───────────────────────────────────────────────────────────

arenaRouter.get('/opponents/:playerId', (req, res) => {
  try {
    const opponents = findOpponents(req.params.playerId);
    res.json({ opponents });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── PvP battle ────────────────────────────────────────────────────────────

arenaRouter.post('/battle/start', (req, res) => {
  const { playerId, teamInstanceIds, defenderId } = req.body;
  if (!playerId || !teamInstanceIds?.length || !defenderId) {
    res.status(400).json({ error: 'playerId, teamInstanceIds, and defenderId required' });
    return;
  }
  if (teamInstanceIds.length > 4) {
    res.status(400).json({ error: 'Maximum 4 monsters per team' });
    return;
  }
  try {
    const result = startArenaBattle(playerId, teamInstanceIds, defenderId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── Rival battle ──────────────────────────────────────────────────────────

arenaRouter.post('/rival/start', (req, res) => {
  const { playerId, teamInstanceIds, rivalId } = req.body;
  if (!playerId || !teamInstanceIds?.length || !rivalId) {
    res.status(400).json({ error: 'playerId, teamInstanceIds, and rivalId required' });
    return;
  }
  if (teamInstanceIds.length > 4) {
    res.status(400).json({ error: 'Maximum 4 monsters per team' });
    return;
  }
  try {
    const result = startRivalBattle(playerId, teamInstanceIds, rivalId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── History ───────────────────────────────────────────────────────────────

arenaRouter.get('/history/:playerId', (req, res) => {
  try {
    const history = getAttackHistory(req.params.playerId);
    res.json({ history });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── Rivals with cooldowns ─────────────────────────────────────────────────

arenaRouter.get('/rivals/:playerId', (req, res) => {
  try {
    const rivals = getRivalsWithCooldowns(req.params.playerId);
    res.json({ rivals });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
