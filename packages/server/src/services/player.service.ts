import { getDb } from '../db/schema.js';
import type { Player, TrainerSkills } from '@gatchamon/shared';
import {
  defaultTrainerSkills,
  trainerXpToNextLevel,
  getMaxEnergy,
  getEnergyRegenInterval,
  MAX_TRAINER_LEVEL,
  TRAINER_SKILL_MAX,
  BEGINNER_BONUS,
  isBeginnerBonusActive,
  MAX_ARENA_TICKETS,
  ARENA_TICKET_REGEN_INTERVAL_MS,
} from '@gatchamon/shared';

function getPlayerRow(playerId: string): any {
  const row = getDb().prepare('SELECT * FROM players WHERE id = ?').get(playerId) as any;
  if (!row) throw new Error('Player not found');
  return row;
}

function parseTrainerSkills(row: any): TrainerSkills {
  return row.trainer_skills ? JSON.parse(row.trainer_skills) : defaultTrainerSkills();
}

// ── Energy Regeneration ────────────────────────────────────────────────

/**
 * Compute current energy based on elapsed time since last update.
 * Updates the DB and returns the new energy value.
 */
export function computeAndUpdateEnergy(playerId: string): { energy: number; maxEnergy: number } {
  const db = getDb();
  const row = getPlayerRow(playerId);
  const skills = parseTrainerSkills(row);
  const maxEnergy = getMaxEnergy(skills);
  const regenIntervalMs = getEnergyRegenInterval(skills);

  let energy = row.energy;
  const now = Date.now();
  const lastUpdate = row.last_energy_update
    ? new Date(row.last_energy_update).getTime()
    : now;

  if (energy < maxEnergy) {
    const elapsed = now - lastUpdate;
    const ticks = Math.floor(elapsed / regenIntervalMs);
    if (ticks > 0) {
      energy = Math.min(maxEnergy, energy + ticks);
      const advancedMs = lastUpdate + ticks * regenIntervalMs;
      db.prepare('UPDATE players SET energy = ?, last_energy_update = ? WHERE id = ?')
        .run(energy, new Date(advancedMs).toISOString(), playerId);
    }
  }

  return { energy, maxEnergy };
}

// ── Arena Ticket Regeneration ─────────────────────────────────────────

export function computeAndUpdateArenaTickets(playerId: string): { arenaTickets: number } {
  const db = getDb();
  const row = getPlayerRow(playerId);

  let tickets = row.arena_tickets ?? 10;
  const now = Date.now();

  // Self-heal: if the column is missing a value (pre-backfill row, or old migration
  // that silently failed to add the column), seed the clock so regen starts now.
  if (!row.last_arena_ticket_update) {
    db.prepare('UPDATE players SET last_arena_ticket_update = ? WHERE id = ?')
      .run(new Date(now).toISOString(), playerId);
    return { arenaTickets: tickets };
  }

  const lastUpdate = new Date(row.last_arena_ticket_update).getTime();

  if (tickets < MAX_ARENA_TICKETS) {
    const elapsed = now - lastUpdate;
    const ticks = Math.floor(elapsed / ARENA_TICKET_REGEN_INTERVAL_MS);
    if (ticks > 0) {
      tickets = Math.min(MAX_ARENA_TICKETS, tickets + ticks);
      const advancedMs = lastUpdate + ticks * ARENA_TICKET_REGEN_INTERVAL_MS;
      db.prepare('UPDATE players SET arena_tickets = ?, last_arena_ticket_update = ? WHERE id = ?')
        .run(tickets, new Date(advancedMs).toISOString(), playerId);
    }
  }

  return { arenaTickets: tickets };
}

export function spendArenaTicket(playerId: string): void {
  const { arenaTickets } = computeAndUpdateArenaTickets(playerId);
  if (arenaTickets < 1) throw new Error('Not enough arena tickets');
  getDb().prepare('UPDATE players SET arena_tickets = arena_tickets - 1 WHERE id = ?').run(playerId);
}

// ── Trainer Skill Allocation ───────────────────────────────────────────

export function allocateTrainerSkill(
  playerId: string,
  skill: keyof TrainerSkills,
): TrainerSkills {
  const db = getDb();
  const row = getPlayerRow(playerId);
  const skills = parseTrainerSkills(row);
  const skillPoints = row.trainer_skill_points ?? 0;

  if (skillPoints <= 0) throw new Error('No skill points available');
  const max = TRAINER_SKILL_MAX[skill];
  if (max === undefined) throw new Error('Invalid skill name');
  if (skills[skill] >= max) throw new Error('Skill already at max level');

  skills[skill]++;
  db.prepare(
    'UPDATE players SET trainer_skill_points = trainer_skill_points - 1, trainer_skills = ? WHERE id = ?'
  ).run(JSON.stringify(skills), playerId);

  return skills;
}

// ── Trainer XP ─────────────────────────────────────────────────────────

export interface TrainerXpResult {
  leveledUp: boolean;
  newLevel: number;
  levelsGained: number;
}

export function grantTrainerXp(playerId: string, amount: number): TrainerXpResult {
  const db = getDb();
  const row = getPlayerRow(playerId);
  const skills = parseTrainerSkills(row);

  const createdAt = row.created_at;
  const beginnerMult = isBeginnerBonusActive(createdAt) ? BEGINNER_BONUS.xpMult : 1;
  const bonusMult = (1 + skills.xpBonus * 0.1) * beginnerMult;
  const xpToAdd = Math.floor(amount * bonusMult);

  let trainerLevel = row.trainer_level ?? 1;
  let trainerExp = (row.trainer_exp ?? 0) + xpToAdd;
  let skillPoints = row.trainer_skill_points ?? 0;
  const startLevel = trainerLevel;

  while (
    trainerLevel < MAX_TRAINER_LEVEL &&
    trainerExp >= trainerXpToNextLevel(trainerLevel)
  ) {
    trainerExp -= trainerXpToNextLevel(trainerLevel);
    trainerLevel++;
    skillPoints++;
  }

  if (trainerLevel >= MAX_TRAINER_LEVEL) {
    trainerExp = 0;
  }

  // Restore energy on level-up (never reduce if already above max)
  let energy = row.energy;
  if (trainerLevel > startLevel) {
    const max = getMaxEnergy(skills);
    energy = Math.max(energy, max);
  }

  db.prepare(
    'UPDATE players SET trainer_level = ?, trainer_exp = ?, trainer_skill_points = ?, energy = ? WHERE id = ?'
  ).run(trainerLevel, trainerExp, skillPoints, energy, playerId);

  return {
    leveledUp: trainerLevel > startLevel,
    newLevel: trainerLevel,
    levelsGained: trainerLevel - startLevel,
  };
}

// ── Currency helpers ───────────────────────────────────────────────────

export function spendStardust(playerId: string, amount: number): void {
  const db = getDb();
  const row = getPlayerRow(playerId);
  if ((row.stardust ?? 0) < amount) throw new Error('Not enough stardust');
  db.prepare('UPDATE players SET stardust = stardust - ? WHERE id = ?').run(amount, playerId);
}

export function earnStardust(playerId: string, amount: number): void {
  getDb().prepare('UPDATE players SET stardust = stardust + ? WHERE id = ?').run(amount, playerId);
}

export function spendPokedollars(playerId: string, amount: number): void {
  const db = getDb();
  const row = getPlayerRow(playerId);
  if ((row.pokedollars ?? 0) < amount) throw new Error('Not enough pokedollars');
  db.prepare('UPDATE players SET pokedollars = pokedollars - ? WHERE id = ?').run(amount, playerId);
}

export function earnPokedollars(playerId: string, amount: number): void {
  getDb().prepare('UPDATE players SET pokedollars = pokedollars + ? WHERE id = ?').run(amount, playerId);
}

export function spendEnergy(playerId: string, amount: number): void {
  // First compute current energy with regen
  const { energy } = computeAndUpdateEnergy(playerId);
  if (energy < amount) throw new Error('Not enough energy');
  getDb().prepare('UPDATE players SET energy = energy - ? WHERE id = ?').run(amount, playerId);
}
