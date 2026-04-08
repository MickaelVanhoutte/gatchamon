import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema.js';
import { sendInboxItem } from '../services/daily.service.js';
import { POKEDEX_MAP } from '@gatchamon/shared';

export const adminRouter = Router();

// ── Dashboard stats ───────────────────────────────────────────────────

adminRouter.get('/stats', (_req, res) => {
  try {
    const db = getDb();
    const totalPlayers = (db.prepare('SELECT COUNT(*) as count FROM players').get() as any).count;
    const totalPokemon = (db.prepare('SELECT COUNT(*) as count FROM pokemon_instances').get() as any).count;
    const recentPlayers = db.prepare(
      "SELECT id, name, trainer_level, created_at FROM players ORDER BY created_at DESC LIMIT 10"
    ).all();
    res.json({ totalPlayers, totalPokemon, recentPlayers });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Paginated player list ─────────────────────────────────────────────

adminRouter.get('/players', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
    const search = ((req.query.search as string) ?? '').trim();
    const offset = (page - 1) * limit;
    const db = getDb();

    let whereClause = '';
    const params: any[] = [];
    if (search) {
      whereClause = 'WHERE name LIKE ? OR id LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    const total = (db.prepare(`SELECT COUNT(*) as count FROM players ${whereClause}`).get(...params) as any).count;
    const players = db.prepare(
      `SELECT id, name, trainer_level, energy, stardust, pokedollars,
              regular_pokeballs, premium_pokeballs, legendary_pokeballs, glowing_pokeballs,
              created_at
       FROM players ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);

    res.json({ players, total, page, limit });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Search players (legacy) ──────────────────────────────────────────

adminRouter.get('/players/search', (req, res) => {
  try {
    const q = (req.query.q as string ?? '').trim();
    if (!q) { res.json({ players: [] }); return; }
    const db = getDb();
    const players = db.prepare(
      `SELECT id, name, trainer_level, energy, stardust, pokedollars,
              regular_pokeballs, premium_pokeballs, legendary_pokeballs, glowing_pokeballs,
              created_at
       FROM players
       WHERE id LIKE ? OR name LIKE ?
       LIMIT 20`
    ).all(`%${q}%`, `%${q}%`);
    res.json({ players });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Get player detail (full) ──────────────────────────────────────────

adminRouter.get('/players/:id', (req, res) => {
  try {
    const db = getDb();
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id) as any;
    if (!player) { res.status(404).json({ error: 'Player not found' }); return; }

    // Parse JSON fields
    const materials = player.materials ? JSON.parse(player.materials) : {};
    const trainerSkills = player.trainer_skills ? JSON.parse(player.trainer_skills) : {};
    const storyProgress = player.story_progress ? JSON.parse(player.story_progress) : {};
    const mysteryPieces = player.mystery_pieces ? JSON.parse(player.mystery_pieces) : {};

    // Fetch all pokemon
    const pokemonRows = db.prepare(
      'SELECT * FROM pokemon_instances WHERE owner_id = ? ORDER BY level DESC, stars DESC'
    ).all(req.params.id) as any[];

    const pokemon = pokemonRows.map((p: any) => {
      const tmpl = POKEDEX_MAP.get(Number(p.template_id));
      return {
        instanceId: p.instance_id,
        templateId: p.template_id,
        name: tmpl?.name ?? `#${p.template_id}`,
        spriteUrl: tmpl?.spriteUrl ?? '',
        types: tmpl?.types ?? [],
        naturalStars: tmpl?.naturalStars ?? 1,
        level: p.level,
        stars: p.stars,
        exp: p.exp,
        isShiny: !!p.is_shiny,
        skillLevels: p.skill_levels ? JSON.parse(p.skill_levels) : [1, 1, 1],
        location: p.location ?? 'collection',
        isLocked: !!p.is_locked,
      };
    });

    // Fetch held items
    const heldItems = db.prepare(
      'SELECT * FROM held_items WHERE owner_id = ?'
    ).all(req.params.id) as any[];

    const items = heldItems.map((h: any) => ({
      itemId: h.item_id,
      setId: h.set_id,
      slot: h.slot,
      stars: h.stars,
      grade: h.grade,
      level: h.level,
      mainStat: h.main_stat,
      mainStatValue: h.main_stat_value,
      subStats: h.sub_stats ? JSON.parse(h.sub_stats) : [],
      equippedTo: h.equipped_to,
    }));

    const pokemonCount = pokemonRows.length;
    const inboxCount = (db.prepare(
      'SELECT COUNT(*) as count FROM inbox WHERE player_id = ?'
    ).get(req.params.id) as any).count;

    res.json({
      player: {
        id: player.id,
        trainerName: player.name,
        trainerLevel: player.trainer_level,
        trainerExp: player.trainer_exp,
        trainerSkillPoints: player.trainer_skill_points,
        trainerSkills,
        energy: player.energy,
        stardust: player.stardust,
        pokedollars: player.pokedollars,
        regularPokeballs: player.regular_pokeballs,
        premiumPokeballs: player.premium_pokeballs,
        legendaryPokeballs: player.legendary_pokeballs,
        glowingPokeballs: player.glowing_pokeballs,
        materials,
        mysteryPieces,
        storyProgress,
        towerProgress: player.tower_progress ?? 0,
        premiumPityCounter: player.premium_pity_counter ?? 0,
        createdAt: player.created_at,
      },
      pokemon,
      heldItems: items,
      pokemonCount,
      inboxCount,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Edit player ───────────────────────────────────────────────────────

const EDITABLE_FIELDS: Record<string, string> = {
  energy: 'energy',
  stardust: 'stardust',
  pokedollars: 'pokedollars',
  regularPokeballs: 'regular_pokeballs',
  premiumPokeballs: 'premium_pokeballs',
  legendaryPokeballs: 'legendary_pokeballs',
  glowingPokeballs: 'glowing_pokeballs',
  trainerLevel: 'trainer_level',
  trainerExp: 'trainer_exp',
  trainerSkillPoints: 'trainer_skill_points',
};

adminRouter.patch('/players/:id', (req, res) => {
  try {
    const db = getDb();
    const player = db.prepare('SELECT id FROM players WHERE id = ?').get(req.params.id);
    if (!player) { res.status(404).json({ error: 'Player not found' }); return; }

    const sets: string[] = [];
    const values: any[] = [];
    for (const [camel, column] of Object.entries(EDITABLE_FIELDS)) {
      if (req.body[camel] !== undefined) {
        const num = Number(req.body[camel]);
        if (isNaN(num)) continue;
        sets.push(`${column} = ?`);
        values.push(num);
      }
    }

    if (sets.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    values.push(req.params.id);
    db.prepare(`UPDATE players SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Add pokemon to player ─────────────────────────────────────────────

adminRouter.post('/players/:id/pokemon', (req, res) => {
  try {
    const db = getDb();
    const player = db.prepare('SELECT id FROM players WHERE id = ?').get(req.params.id);
    if (!player) { res.status(404).json({ error: 'Player not found' }); return; }

    const { templateId, stars, level, isShiny } = req.body;
    const tmpl = POKEDEX_MAP.get(Number(templateId));
    if (!tmpl) { res.status(400).json({ error: 'Invalid templateId' }); return; }

    const instanceId = uuidv4();
    const finalStars = stars ?? tmpl.naturalStars;
    const finalLevel = level ?? 1;
    const finalShiny = isShiny ?? false;
    const skillLevels = JSON.stringify([1, 1, 1]);

    db.prepare(
      'INSERT INTO pokemon_instances (instance_id, template_id, owner_id, level, stars, exp, is_shiny, skill_levels) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(instanceId, tmpl.id, req.params.id, finalLevel, finalStars, 0, finalShiny ? 1 : 0, skillLevels);

    res.json({
      instanceId,
      templateId: tmpl.id,
      name: tmpl.name,
      spriteUrl: tmpl.spriteUrl,
      level: finalLevel,
      stars: finalStars,
      isShiny: finalShiny,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Delete pokemon from player ────────────────────────────────────────

adminRouter.delete('/players/:id/pokemon/:instanceId', (req, res) => {
  try {
    const db = getDb();
    // Unequip any held items
    db.prepare('UPDATE held_items SET equipped_to = NULL WHERE equipped_to = ?').run(req.params.instanceId);
    // Delete the pokemon
    const result = db.prepare(
      'DELETE FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
    ).run(req.params.instanceId, req.params.id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Pokemon not found' });
      return;
    }
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Send inbox item to player ─────────────────────────────────────────

adminRouter.post('/inbox/send', (req, res) => {
  try {
    const { playerId, title, message, reward } = req.body;
    if (!playerId || !title || !message) {
      res.status(400).json({ error: 'playerId, title, and message required' }); return;
    }
    const db = getDb();
    const player = db.prepare('SELECT id FROM players WHERE id = ?').get(playerId);
    if (!player) { res.status(404).json({ error: 'Player not found' }); return; }

    sendInboxItem(playerId, { title, message, reward: reward || undefined });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Broadcast inbox to all players ────────────────────────────────────

adminRouter.post('/inbox/broadcast', (req, res) => {
  try {
    const { title, message, reward } = req.body;
    if (!title || !message) {
      res.status(400).json({ error: 'title and message required' }); return;
    }
    const db = getDb();
    const players = db.prepare('SELECT id FROM players').all() as any[];
    let sent = 0;
    for (const p of players) {
      sendInboxItem(p.id, { title, message, reward: reward || undefined });
      sent++;
    }
    res.json({ ok: true, sent });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
