import { Router } from 'express';
import { summonSingle, summonMulti, SUMMON_COSTS } from '../services/gacha.service.js';

export const summonRouter = Router();

summonRouter.post('/', (req, res) => {
  const { playerId, count } = req.body;

  if (!playerId) {
    res.status(400).json({ error: 'playerId is required' });
    return;
  }

  try {
    if (count === 10) {
      const results = summonMulti(playerId);
      res.json({ results });
    } else {
      const result = summonSingle(playerId);
      res.json({ results: [result] });
    }
  } catch (err: any) {
    const status = err.message === 'Player not found' ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

summonRouter.get('/costs', (_req, res) => {
  res.json(SUMMON_COSTS);
});
