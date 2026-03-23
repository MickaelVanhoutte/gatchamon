import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema.js';
import type { Player } from '@gatchamon/shared';

export const playerRouter = Router();

playerRouter.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const db = getDb();
  const id = uuidv4();
  const storyProgress = JSON.stringify({ normal: { '1': 1 }, hard: {}, hell: {} });

  db.prepare(
    'INSERT INTO players (id, name, pokeballs, energy, story_progress) VALUES (?, ?, 50, 100, ?)'
  ).run(id, name.trim(), storyProgress);

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id) as any;

  const result: Player = {
    id: player.id,
    name: player.name,
    pokeballs: player.pokeballs,
    energy: player.energy,
    storyProgress: JSON.parse(player.story_progress),
    materials: {},
    createdAt: player.created_at,
  };

  res.status(201).json(result);
});

playerRouter.get('/:id', (req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id) as any;

  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  const result: Player = {
    id: player.id,
    name: player.name,
    pokeballs: player.pokeballs,
    energy: player.energy,
    storyProgress: JSON.parse(player.story_progress),
    materials: {},
    createdAt: player.created_at,
  };

  res.json(result);
});
