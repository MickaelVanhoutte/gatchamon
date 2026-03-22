import { Router } from 'express';
import { startBattle, resolvePlayerAction, getBattleState, FLOOR_DEFINITIONS } from '../services/battle.service.js';

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

  try {
    const result = startBattle(playerId, teamInstanceIds, floor);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
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

battleRouter.get('/floors/list', (_req, res) => {
  const floors = Object.entries(FLOOR_DEFINITIONS).map(([floorNum, floor]) => ({
    level: 1,
    floor: Number(floorNum),
    enemyCount: floor.enemies.length,
    isBoss: floor.isBoss,
  }));
  res.json({ floors });
});
