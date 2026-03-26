import { Router } from 'express';
import {
  summonSingleRegular, summonMultiRegular,
  summonSinglePremium, summonMultiPremium,
  SUMMON_COSTS,
} from '../services/gacha.service.js';

export const summonRouter = Router();

summonRouter.post('/', (req, res) => {
  const { playerId, count, type = 'regular' } = req.body;

  if (!playerId) {
    res.status(400).json({ error: 'playerId is required' });
    return;
  }

  try {
    if (type === 'premium') {
      if (count === 10) {
        const results = summonMultiPremium(playerId);
        res.json({ results });
      } else {
        const result = summonSinglePremium(playerId);
        res.json({ results: [result] });
      }
    } else {
      if (count === 10) {
        const results = summonMultiRegular(playerId);
        res.json({ results });
      } else {
        const result = summonSingleRegular(playerId);
        res.json({ results: [result] });
      }
    }
  } catch (err: any) {
    const status = err.message === 'Player not found' ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

summonRouter.get('/costs', (_req, res) => {
  res.json(SUMMON_COSTS);
});
