import { Router } from 'express';
import { getDb } from '../db/schema.js';
import { POKEDEX } from '@gatchamon/shared';
import type { PokemonInstance } from '@gatchamon/shared';

export const collectionRouter = Router();

function getTemplateById(id: number) {
  return POKEDEX.find(p => p.id === id);
}

collectionRouter.get('/:playerId', (req, res) => {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM pokemon_instances WHERE owner_id = ? ORDER BY stars DESC, level DESC'
  ).all(req.params.playerId) as any[];

  const collection = rows.map(row => {
    const instance: PokemonInstance = {
      instanceId: row.instance_id,
      templateId: row.template_id,
      ownerId: row.owner_id,
      level: row.level,
      stars: row.stars,
      exp: row.exp,
    };
    return {
      instance,
      template: getTemplateById(row.template_id),
    };
  }).filter(item => item.template != null);

  res.json({ collection });
});

collectionRouter.get('/:playerId/:instanceId', (req, res) => {
  const db = getDb();
  const row = db.prepare(
    'SELECT * FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
  ).get(req.params.instanceId, req.params.playerId) as any;

  if (!row) {
    res.status(404).json({ error: 'Pokemon not found' });
    return;
  }

  const instance: PokemonInstance = {
    instanceId: row.instance_id,
    templateId: row.template_id,
    ownerId: row.owner_id,
    level: row.level,
    stars: row.stars,
    exp: row.exp,
  };

  res.json({ instance, template: getTemplateById(row.template_id) });
});
