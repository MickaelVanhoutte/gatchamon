import { Router } from 'express';
import {
  getDailyMissions,
  claimMissionReward,
  getTrophyProgress,
  claimTrophyTier,
  getInbox,
  claimInboxReward,
  getLoginCalendar,
  claimLoginCalendarDay,
  getRoulette,
  spinRoulette,
  getForagingState,
  claimForagingFinds,
  purchaseShopItem,
  summonFromPieces,
  getDungeonRecords,
  saveDungeonRecord,
} from '../services/daily.service.js';

export const dailyRouter = Router();

// ── Daily Missions ────────────────────────────────────────────────────

dailyRouter.get('/missions/:playerId', (req, res) => {
  try {
    const missions = getDailyMissions(req.params.playerId);
    res.json(missions);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

dailyRouter.post('/missions/:playerId/claim', (req, res) => {
  try {
    const { missionId } = req.body;
    if (!missionId) { res.status(400).json({ error: 'missionId required' }); return; }
    const reward = claimMissionReward(req.params.playerId, missionId);
    if (!reward) { res.status(400).json({ error: 'Cannot claim this mission' }); return; }
    res.json({ reward });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Trophies ──────────────────────────────────────────────────────────

dailyRouter.get('/trophies/:playerId', (req, res) => {
  try {
    const progress = getTrophyProgress(req.params.playerId);
    res.json({ progress });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

dailyRouter.post('/trophies/:playerId/claim', (req, res) => {
  try {
    const { trophyId, tierIndex } = req.body;
    if (!trophyId || tierIndex === undefined) {
      res.status(400).json({ error: 'trophyId and tierIndex required' }); return;
    }
    const reward = claimTrophyTier(req.params.playerId, trophyId, tierIndex);
    if (!reward) { res.status(400).json({ error: 'Cannot claim this trophy tier' }); return; }
    res.json({ reward });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Inbox ─────────────────────────────────────────────────────────────

dailyRouter.get('/inbox/:playerId', (req, res) => {
  try {
    const items = getInbox(req.params.playerId);
    res.json({ items });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

dailyRouter.post('/inbox/:playerId/claim', (req, res) => {
  try {
    const { inboxId } = req.body;
    if (!inboxId) { res.status(400).json({ error: 'inboxId required' }); return; }
    const result = claimInboxReward(req.params.playerId, inboxId);
    if (result === false) { res.status(400).json({ error: 'Cannot claim this inbox item' }); return; }
    res.json({ reward: result || undefined });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Login Calendar ────────────────────────────────────────────────────

dailyRouter.get('/calendar/:playerId', (req, res) => {
  try {
    const state = getLoginCalendar(req.params.playerId);
    res.json(state);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

dailyRouter.post('/calendar/:playerId/claim', (req, res) => {
  try {
    const reward = claimLoginCalendarDay(req.params.playerId);
    if (!reward) { res.status(400).json({ error: 'Cannot claim today' }); return; }
    res.json({ reward });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Daily Roulette ────────────────────────────────────────────────────

dailyRouter.get('/roulette/:playerId', (req, res) => {
  try {
    const state = getRoulette(req.params.playerId);
    res.json(state);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

dailyRouter.post('/roulette/:playerId/spin', (req, res) => {
  try {
    const result = spinRoulette(req.params.playerId);
    if (!result) { res.status(400).json({ error: 'No spins remaining' }); return; }
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Foraging ──────────────────────────────────────────────────────────

dailyRouter.get('/foraging/:playerId', (req, res) => {
  try {
    const state = getForagingState(req.params.playerId);
    res.json(state);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

dailyRouter.post('/foraging/:playerId/claim', (req, res) => {
  try {
    const count = claimForagingFinds(req.params.playerId);
    res.json({ claimed: count });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Shop ──────────────────────────────────────────────────────────────

dailyRouter.post('/shop/purchase', (req, res) => {
  try {
    const { playerId, itemId } = req.body;
    if (!playerId || !itemId) { res.status(400).json({ error: 'playerId and itemId required' }); return; }
    const result = purchaseShopItem(playerId, itemId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Mystery Summon ────────────────────────────────────────────────────

dailyRouter.post('/mystery-summon', (req, res) => {
  try {
    const { playerId, templateId } = req.body;
    if (!playerId || !templateId) { res.status(400).json({ error: 'playerId and templateId required' }); return; }
    const instance = summonFromPieces(playerId, templateId);
    res.json({ instance });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Dungeon Records ───────────────────────────────────────────────────

dailyRouter.get('/dungeon-records/:playerId', (req, res) => {
  try {
    const records = getDungeonRecords(req.params.playerId);
    res.json({ records });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

dailyRouter.post('/dungeon-records/:playerId', (req, res) => {
  try {
    const { key, floor, timeSec } = req.body;
    if (!key || floor === undefined || timeSec === undefined) {
      res.status(400).json({ error: 'key, floor, and timeSec required' }); return;
    }
    saveDungeonRecord(req.params.playerId, key, floor, timeSec);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
