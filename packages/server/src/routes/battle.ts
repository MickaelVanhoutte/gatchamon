import { Router } from 'express';
import { startBattle, resolvePlayerAction, getBattleState, getFloorDefsForRegion } from '../services/battle.service.js';
import type { Difficulty } from '@gatchamon/shared';

export const battleRouter = Router();

battleRouter.post('/start', (req, res) => {
  const { playerId, teamInstanceIds, floor } = req.body;

  if (!playerId || !teamInstanceIds?.length || !floor) {
    res.status(400).json({ error: 'playerId, teamInstanceIds, and floor are required' });
    return;
  }

  if (teamInstanceIds.length > 4) {
    res.status(400).json({ error: 'Maximum 4 monsters per team' });
    return;
  }

  if (!floor.region || !floor.floor || !floor.difficulty) {
    res.status(400).json({ error: 'floor must include region, floor, and difficulty' });
    return;
  }

  try {
    const result = startBattle(playerId, teamInstanceIds, floor);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Must be above /:battleId to avoid being caught by the param route
battleRouter.get('/floors/list', (req, res) => {
  const region = Number(req.query.region ?? 1);
  const difficulty = (req.query.difficulty as Difficulty) ?? 'normal';

  if (region < 1 || region > 11) {
    res.status(400).json({ error: 'region must be between 1 and 11' });
    return;
  }

  if (!['normal', 'hard', 'hell'].includes(difficulty)) {
    res.status(400).json({ error: 'difficulty must be normal, hard, or hell' });
    return;
  }

  const defs = getFloorDefsForRegion(region, difficulty);
  const floors = Object.entries(defs).map(([floorNum, floor]) => ({
    region,
    floor: Number(floorNum),
    difficulty,
    enemyCount: floor.enemies.length,
    isBoss: floor.isBoss,
    enemies: floor.enemies.map(e => ({ templateId: e.templateId, level: e.level, stars: e.stars })),
  }));
  res.json({ floors });
});

battleRouter.post('/:battleId/action', (req, res) => {
  const { actorInstanceId, skillId, targetInstanceId } = req.body;

  if (!actorInstanceId || !skillId || !targetInstanceId) {
    res.status(400).json({ error: 'actorInstanceId, skillId, and targetInstanceId are required' });
    return;
  }

  try {
    const result = resolvePlayerAction(req.params.battleId, {
      actorInstanceId,
      skillId,
      targetInstanceId,
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

battleRouter.get('/:battleId', (req, res) => {
  const state = getBattleState(req.params.battleId);
  if (!state) {
    res.status(404).json({ error: 'Battle not found' });
    return;
  }
  res.json({ state });
});
