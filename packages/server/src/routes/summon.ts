import { Router } from 'express';
import {
  summonSingleRegular, summonMultiRegular,
  summonSinglePremium, summonMultiPremium,
  summonSingleLegendary,
  summonSingleGlowing, summonMultiGlowing,
  shopSummonMultiPremium, shopSummonSingleLegendary,
  SUMMON_COSTS,
} from '../services/gacha.service.js';
import { incrementMission, trackTrophyStat } from '../services/daily.service.js';

export const summonRouter = Router();

summonRouter.post('/', (req, res) => {
  const { playerId, count, type = 'regular', forcedTemplateId } = req.body;

  if (!playerId) {
    res.status(400).json({ error: 'playerId is required' });
    return;
  }

  try {
    let results: any[];
    if (type === 'legendary') {
      results = [summonSingleLegendary(playerId)];
    } else if (type === 'glowing') {
      results = count === 10 ? summonMultiGlowing(playerId) : [summonSingleGlowing(playerId)];
    } else if (type === 'premium') {
      results = count === 10 ? summonMultiPremium(playerId) : [summonSinglePremium(playerId, forcedTemplateId)];
    } else {
      results = count === 10 ? summonMultiRegular(playerId) : [summonSingleRegular(playerId, forcedTemplateId)];
    }
    const summonCount = results.length;
    incrementMission(playerId, 'summon_any', summonCount);
    trackTrophyStat(playerId, 'totalSummons', summonCount);
    res.json({ results });
  } catch (err: any) {
    const status = err.message === 'Player not found' ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

// Shop summons (bypass pokeball costs, used after stardust purchase)
summonRouter.post('/shop', (req, res) => {
  const { playerId, type } = req.body;
  if (!playerId || !type) {
    res.status(400).json({ error: 'playerId and type required' });
    return;
  }

  try {
    if (type === 'premium_multi') {
      const results = shopSummonMultiPremium(playerId);
      res.json({ results });
    } else if (type === 'legendary_single') {
      const result = shopSummonSingleLegendary(playerId);
      res.json({ results: [result] });
    } else {
      res.status(400).json({ error: 'Unknown shop summon type' });
    }
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

summonRouter.get('/costs', (_req, res) => {
  res.json(SUMMON_COSTS);
});
