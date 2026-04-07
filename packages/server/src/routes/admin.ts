import { Router } from 'express';
import { getDb } from '../db/schema.js';
import { sendInboxItem } from '../services/daily.service.js';

export const adminRouter = Router();

// ── Dashboard stats ───────────────────────────────────────────────────

adminRouter.get('/stats', (_req, res) => {
  try {
    const db = getDb();
    const totalPlayers = (db.prepare('SELECT COUNT(*) as count FROM players').get() as any).count;
    const totalPokemon = (db.prepare('SELECT COUNT(*) as count FROM pokemon_instances').get() as any).count;
    const recentPlayers = db.prepare(
      "SELECT id, trainer_name, trainer_level, created_at FROM players ORDER BY created_at DESC LIMIT 10"
    ).all();
    res.json({ totalPlayers, totalPokemon, recentPlayers });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Search players ────────────────────────────────────────────────────

adminRouter.get('/players/search', (req, res) => {
  try {
    const q = (req.query.q as string ?? '').trim();
    if (!q) { res.json({ players: [] }); return; }
    const db = getDb();
    const players = db.prepare(
      `SELECT id, trainer_name, trainer_level, energy, stardust, pokedollars,
              regular_pokeballs, premium_pokeballs, legendary_pokeballs, glowing_pokeballs,
              created_at
       FROM players
       WHERE id LIKE ? OR trainer_name LIKE ?
       LIMIT 20`
    ).all(`%${q}%`, `%${q}%`);
    res.json({ players });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Get player detail ─────────────────────────────────────────────────

adminRouter.get('/players/:id', (req, res) => {
  try {
    const db = getDb();
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id) as any;
    if (!player) { res.status(404).json({ error: 'Player not found' }); return; }

    const pokemonCount = (db.prepare(
      'SELECT COUNT(*) as count FROM pokemon_instances WHERE owner_id = ?'
    ).get(req.params.id) as any).count;

    const inboxCount = (db.prepare(
      'SELECT COUNT(*) as count FROM inbox WHERE player_id = ?'
    ).get(req.params.id) as any).count;

    res.json({
      player: {
        id: player.id,
        trainerName: player.trainer_name,
        trainerLevel: player.trainer_level,
        trainerExp: player.trainer_exp,
        energy: player.energy,
        stardust: player.stardust,
        pokedollars: player.pokedollars,
        regularPokeballs: player.regular_pokeballs,
        premiumPokeballs: player.premium_pokeballs,
        legendaryPokeballs: player.legendary_pokeballs,
        glowingPokeballs: player.glowing_pokeballs,
        createdAt: player.created_at,
      },
      pokemonCount,
      inboxCount,
    });
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
    // Validate player exists
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
