import { Router } from 'express';
import {
  getPlayerItems,
  getItemsForPokemon,
  equipItem,
  unequipItem,
  upgradeItem,
  sellItems,
} from '../services/held-item.service.js';

export const heldItemsRouter = Router();

heldItemsRouter.get('/:playerId', (req, res) => {
  try {
    const items = getPlayerItems(req.params.playerId);
    res.json({ items });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

heldItemsRouter.get('/:playerId/pokemon/:instanceId', (req, res) => {
  try {
    const items = getItemsForPokemon(req.params.playerId, req.params.instanceId);
    res.json({ items });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

heldItemsRouter.post('/equip', (req, res) => {
  try {
    const { playerId, itemId, pokemonInstanceId } = req.body;
    if (!playerId || !itemId || !pokemonInstanceId) {
      res.status(400).json({ error: 'playerId, itemId, and pokemonInstanceId required' });
      return;
    }
    equipItem(playerId, itemId, pokemonInstanceId);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

heldItemsRouter.post('/unequip', (req, res) => {
  try {
    const { playerId, itemId } = req.body;
    if (!playerId || !itemId) {
      res.status(400).json({ error: 'playerId and itemId required' });
      return;
    }
    unequipItem(playerId, itemId);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

heldItemsRouter.post('/upgrade', (req, res) => {
  try {
    const { playerId, itemId } = req.body;
    if (!playerId || !itemId) {
      res.status(400).json({ error: 'playerId and itemId required' });
      return;
    }
    const result = upgradeItem(playerId, itemId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

heldItemsRouter.post('/sell', (req, res) => {
  try {
    const { playerId, itemIds } = req.body;
    if (!playerId || !itemIds?.length) {
      res.status(400).json({ error: 'playerId and itemIds[] required' });
      return;
    }
    const totalValue = sellItems(playerId, itemIds);
    res.json({ totalValue });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
