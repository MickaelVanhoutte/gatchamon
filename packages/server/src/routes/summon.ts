import { Router } from 'express';
import {
  summonSingleRegular, summonMultiRegular,
  summonSinglePremium, summonMultiPremium,
  summonSingleLegendary,
  summonSingleGlowing, summonMultiGlowing,
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

summonRouter.get('/costs', (_req, res) => {
  res.json(SUMMON_COSTS);
});
