import { Router } from 'express';
import { getDb } from '../db/schema.js';
import { getTemplate } from '@gatchamon/shared';
import type { PokemonInstance } from '@gatchamon/shared';

export const collectionRouter = Router();

function getTemplateById(id: number) {
  return getTemplate(id);
}

/** Convert a DB row to a PokemonInstance. */
export function rowToInstance(row: any): PokemonInstance {
  return {
    instanceId: row.instance_id,
    templateId: row.template_id,
    ownerId: row.owner_id,
    level: row.level,
    stars: row.stars,
    exp: row.exp,
    isShiny: !!row.is_shiny,
    skillLevels: row.skill_levels ? JSON.parse(row.skill_levels) : [1, 1, 1],
    selectedPassive: (row.selected_passive ?? 0) as 0 | 1,
    isLocked: !!row.is_locked,
    showOnHome: !!row.show_on_home,
    homunculusTree: row.homunculus_tree ? JSON.parse(row.homunculus_tree) : undefined,
  };
}

collectionRouter.get('/:playerId', (req, res) => {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM pokemon_instances WHERE owner_id = ? AND location = 'collection' ORDER BY stars DESC, level DESC"
  ).all(req.params.playerId) as any[];

  const collection = rows.map(row => ({
    instance: rowToInstance(row),
    template: getTemplateById(row.template_id),
  })).filter(item => item.template != null);

  res.json({ collection });
});

// PC box
collectionRouter.get('/:playerId/pc', (req, res) => {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM pokemon_instances WHERE owner_id = ? AND location = 'pc' ORDER BY stars DESC, level DESC"
  ).all(req.params.playerId) as any[];

  const pcBox = rows.map(row => ({
    instance: rowToInstance(row),
    template: getTemplateById(row.template_id),
  })).filter(item => item.template != null);

  res.json({ pcBox });
});

// Transfer between collection and PC
collectionRouter.post('/:playerId/transfer', (req, res) => {
  const { instanceIds, to } = req.body as { instanceIds: string[]; to: 'collection' | 'pc' };
  if (!instanceIds?.length || !['collection', 'pc'].includes(to)) {
    res.status(400).json({ error: 'instanceIds[] and to ("collection"|"pc") required' });
    return;
  }

  const db = getDb();
  const placeholders = instanceIds.map(() => '?').join(',');
  db.prepare(
    `UPDATE pokemon_instances SET location = ? WHERE instance_id IN (${placeholders}) AND owner_id = ?`
  ).run(to, ...instanceIds, req.params.playerId);

  res.json({ ok: true });
});

// PC auto-send setting
collectionRouter.put('/:playerId/pc-auto-send', (req, res) => {
  const { enabled } = req.body as { enabled: boolean };
  const db = getDb();
  db.prepare('UPDATE players SET pc_auto_send = ? WHERE id = ?')
    .run(enabled ? 1 : 0, req.params.playerId);
  res.json({ ok: true });
});

// Update instance toggles (isLocked, showOnHome)
collectionRouter.patch('/:playerId/:instanceId', (req, res) => {
  const { isLocked, showOnHome } = req.body as { isLocked?: boolean; showOnHome?: boolean };
  const db = getDb();
  const row = db.prepare(
    'SELECT instance_id FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
  ).get(req.params.instanceId, req.params.playerId) as any;
  if (!row) { res.status(404).json({ error: 'Pokemon not found' }); return; }

  if (isLocked !== undefined) {
    db.prepare('UPDATE pokemon_instances SET is_locked = ? WHERE instance_id = ?')
      .run(isLocked ? 1 : 0, req.params.instanceId);
  }
  if (showOnHome !== undefined) {
    db.prepare('UPDATE pokemon_instances SET show_on_home = ? WHERE instance_id = ?')
      .run(showOnHome ? 1 : 0, req.params.instanceId);
  }
  res.json({ ok: true });
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

  res.json({ instance: rowToInstance(row), template: getTemplateById(row.template_id) });
});
