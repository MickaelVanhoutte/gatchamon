import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema.js';
import type { Player, TrainerSkills } from '@gatchamon/shared';
import { defaultTrainerSkills } from '@gatchamon/shared';
import { computeAndUpdateEnergy, allocateTrainerSkill } from '../services/player.service.js';

export const playerRouter = Router();

/** Convert a raw DB row to the Player shape the client expects. */
export function rowToPlayer(row: any): Player {
  return {
    id: row.id,
    name: row.name,
    regularPokeballs: row.regular_pokeballs,
    premiumPokeballs: row.premium_pokeballs,
    legendaryPokeballs: row.legendary_pokeballs ?? 0,
    glowingPokeballs: row.glowing_pokeballs ?? 0,
    energy: row.energy,
    stardust: row.stardust ?? 0,
    pokedollars: row.pokedollars ?? 0,
    storyProgress: JSON.parse(row.story_progress),
    materials: row.materials ? JSON.parse(row.materials) : {},
    mysteryPieces: row.mystery_pieces ? JSON.parse(row.mystery_pieces) : {},
    towerProgress: row.tower_progress ?? 0,
    towerResetDate: row.tower_reset_date ?? undefined,
    createdAt: row.created_at,
    lastEnergyUpdate: row.last_energy_update ?? undefined,
    trainerLevel: row.trainer_level ?? 1,
    trainerExp: row.trainer_exp ?? 0,
    trainerSkillPoints: row.trainer_skill_points ?? 0,
    trainerSkills: row.trainer_skills ? JSON.parse(row.trainer_skills) : defaultTrainerSkills(),
    premiumPityCounter: row.premium_pity_counter ?? 0,
    arenaElo: row.arena_elo ?? 1000,
    arenaCoins: row.arena_coins ?? 0,
    googleId: row.google_id ?? undefined,
    googleEmail: row.google_email ?? undefined,
  };
}

// Check if a trainer name is already taken
playerRouter.get('/check-name', (req, res) => {
  const name = (req.query.name as string ?? '').trim();
  if (!name) { res.json({ available: false, reason: 'Name is required' }); return; }
  const db = getDb();
  const existing = db.prepare('SELECT 1 FROM players WHERE LOWER(name) = LOWER(?)').get(name);
  res.json({ available: !existing });
});

playerRouter.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const db = getDb();
  const trimmed = name.trim();

  // Check uniqueness (case-insensitive)
  const existing = db.prepare('SELECT 1 FROM players WHERE LOWER(name) = LOWER(?)').get(trimmed);
  if (existing) {
    res.status(409).json({ error: 'This trainer name is already taken' });
    return;
  }

  const id = uuidv4();
  const storyProgress = JSON.stringify({ normal: { '1': 1 }, hard: {}, hell: {} });
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO players (id, name, pokeballs, regular_pokeballs, premium_pokeballs, energy, story_progress, pokedollars, created_at, last_energy_update)
     VALUES (?, ?, 50, 50, 10, 100, ?, 10000, ?, ?)`
  ).run(id, trimmed, storyProgress, now, now);

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id) as any;
  res.status(201).json(rowToPlayer(player));
});

playerRouter.get('/:id', (req, res) => {
  const db = getDb();

  // Compute energy regen before returning player data
  try {
    computeAndUpdateEnergy(req.params.id);
  } catch {
    // Player may not exist yet, handled below
  }

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id) as any;

  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  res.json(rowToPlayer(player));
});

// ── Reset ─────────────────────────────────────────────────────────────

playerRouter.post('/:id/reset', (req, res) => {
  const db = getDb();
  const playerId = req.params.id;
  const player = db.prepare('SELECT id FROM players WHERE id = ?').get(playerId) as any;
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  // Delete all related data
  db.prepare('DELETE FROM pokemon_instances WHERE owner_id = ?').run(playerId);
  db.prepare('DELETE FROM held_items WHERE owner_id = ?').run(playerId);
  db.prepare('DELETE FROM reward_state WHERE player_id = ?').run(playerId);
  db.prepare('DELETE FROM inbox WHERE player_id = ?').run(playerId);
  db.prepare('DELETE FROM login_calendar WHERE player_id = ?').run(playerId);
  db.prepare('DELETE FROM daily_roulette WHERE player_id = ?').run(playerId);
  db.prepare('DELETE FROM granted_flags WHERE player_id = ?').run(playerId);
  db.prepare('DELETE FROM dungeon_records WHERE player_id = ?').run(playerId);
  db.prepare('DELETE FROM foraging_state WHERE player_id = ?').run(playerId);

  // Reset player to defaults
  const storyProgress = JSON.stringify({ normal: { '1': 1 }, hard: {}, hell: {} });
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE players SET
      regular_pokeballs = 50, premium_pokeballs = 10, legendary_pokeballs = 0, glowing_pokeballs = 0,
      energy = 100, stardust = 0, pokedollars = 10000,
      materials = '{}', mystery_pieces = '{}',
      story_progress = ?, trainer_level = 1, trainer_exp = 0,
      trainer_skill_points = 0, trainer_skills = ?,
      premium_pity_counter = 0, tower_progress = 0, tower_reset_date = NULL,
      last_energy_update = ?, pc_auto_send = 0
    WHERE id = ?
  `).run(storyProgress, JSON.stringify({
    energyRegenSpeed: 0, maxEnergyPool: 0,
    globalAtkBonus: 0, globalDefBonus: 0, globalHpBonus: 0, globalSpdBonus: 0,
    pokedollarBonus: 0, xpBonus: 0, pokeballBonus: 0, essenceBonus: 0,
  }), now, playerId);

  res.json({ ok: true });
});

// ── Energy ─────────────────────────────────────────────────────────────

playerRouter.get('/:id/energy', (req, res) => {
  try {
    const result = computeAndUpdateEnergy(req.params.id);
    res.json(result);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

// ── Trainer Skill Allocation ───────────────────────────────────────────

playerRouter.post('/:id/trainer-skill', (req, res) => {
  const { skill } = req.body as { skill: keyof TrainerSkills };
  if (!skill) {
    res.status(400).json({ error: 'skill name required' });
    return;
  }
  try {
    const updatedSkills = allocateTrainerSkill(req.params.id, skill);
    res.json({ trainerSkills: updatedSkills });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
