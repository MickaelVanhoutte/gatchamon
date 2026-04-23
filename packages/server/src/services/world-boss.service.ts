import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema.js';
import { applyReward, sendInboxItem } from './daily.service.js';
import { getItemsForPokemon } from './held-item.service.js';
import type {
  BaseStats,
  BattleMon,
  MissionReward,
  TrainerSkills,
  WorldBossState,
  WorldBossAttackResult,
  WorldBossLadderEntry,
  WorldBossStatusResponse,
  WorldBossTier,
} from '@gatchamon/shared';
import {
  WORLD_BOSS_CONFIG,
  WORLD_BOSS_ATTACK_DROP,
  WORLD_BOSS_TIER_REWARDS,
  WORLD_BOSS_TIER_LABELS,
  computeStats,
  computeStatsWithItems,
  defaultTrainerSkills,
  getTemplate,
  getWeekStartUtc,
  getWeekEndUtc,
  simulateWorldBossAttack,
  SKILLS,
  tierForRank,
} from '@gatchamon/shared';

// ── Helpers ─────────────────────────────────────────────────────────────

function rowToBossState(row: any): WorldBossState | null {
  if (!row) return null;
  const participants = (getDb()
    .prepare('SELECT COUNT(*) AS n FROM world_boss_attacks WHERE boss_id = ?')
    .get(row.boss_id) as any)?.n ?? 0;
  return {
    bossId: row.boss_id,
    templateId: row.template_id,
    weekStart: row.week_start,
    weekEnd: row.week_end,
    maxHp: row.max_hp,
    currentHp: row.current_hp,
    defeated: !!row.defeated,
    defeatedAt: row.defeated_at,
    settled: !!row.settled,
    participants,
  };
}

function getTrainerSkills(playerId: string): TrainerSkills {
  const row = getDb().prepare('SELECT trainer_skills FROM players WHERE id = ?').get(playerId) as any;
  return row?.trainer_skills ? JSON.parse(row.trainer_skills) : defaultTrainerSkills();
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function applyTrainerBonuses(stats: BaseStats, skills: TrainerSkills): BaseStats {
  return {
    ...stats,
    atk: Math.floor(stats.atk * (1 + skills.globalAtkBonus * 0.02)),
    def: Math.floor(stats.def * (1 + skills.globalDefBonus * 0.02)),
    hp: Math.floor(stats.hp * (1 + skills.globalHpBonus * 0.02)),
    spd: Math.floor(stats.spd * (1 + skills.globalSpdBonus * 0.02)),
  };
}

function loadAttackerTeam(playerId: string, instanceIds: string[]): BattleMon[] {
  const db = getDb();
  const trainerSkills = getTrainerSkills(playerId);
  const team: BattleMon[] = [];
  for (const id of instanceIds) {
    const row = db.prepare(
      'SELECT instance_id, template_id, level, stars, skill_levels, is_shiny, selected_passive FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?',
    ).get(id, playerId) as any;
    if (!row) throw new Error(`Pokemon ${id} not found in your collection`);
    const template = getTemplate(row.template_id);
    if (!template) throw new Error(`Unknown template ${row.template_id}`);
    const items = getItemsForPokemon(playerId, row.instance_id);
    let stats = computeStatsWithItems(template, row.level, row.stars, items);
    stats = applyTrainerBonuses(stats, trainerSkills);
    const skillLevels = row.skill_levels ? JSON.parse(row.skill_levels) : [1, 1, 1];
    team.push({
      instanceId: row.instance_id,
      templateId: row.template_id,
      isPlayerOwned: true,
      currentHp: stats.hp,
      maxHp: stats.hp,
      stats,
      skillCooldowns: {},
      buffs: [],
      debuffs: [],
      isAlive: true,
      actionGauge: 0,
      isShiny: !!row.is_shiny,
      selectedPassive: (row.selected_passive ?? 0) as 0 | 1,
      skillLevels,
    });
  }
  return team;
}

function buildBossBattleMon(): BattleMon {
  const template = getTemplate(WORLD_BOSS_CONFIG.templateId);
  if (!template) throw new Error('Eternatus template missing');
  const stats = computeStats(template, WORLD_BOSS_CONFIG.bossSimLevel, WORLD_BOSS_CONFIG.bossSimStars);
  return {
    instanceId: 'world_boss_defender',
    templateId: template.id,
    isPlayerOwned: false,
    currentHp: stats.hp,
    maxHp: stats.hp,
    stats,
    skillCooldowns: {},
    buffs: [],
    debuffs: [],
    isAlive: true,
    actionGauge: 0,
    isBoss: true,
  };
}

// ── Weekly rollover / spawn ─────────────────────────────────────────────

function spawnBossForWeek(weekStart: Date): WorldBossState {
  const db = getDb();
  const weekEnd = getWeekEndUtc(weekStart);
  const bossId = `wb_${weekStart.toISOString().slice(0, 10)}`;
  try {
    db.prepare(
      'INSERT INTO world_boss (boss_id, template_id, week_start, week_end, max_hp, current_hp) VALUES (?, ?, ?, ?, ?, ?)',
    ).run(
      bossId,
      WORLD_BOSS_CONFIG.templateId,
      weekStart.toISOString(),
      weekEnd.toISOString(),
      WORLD_BOSS_CONFIG.maxHp,
      WORLD_BOSS_CONFIG.maxHp,
    );
  } catch {
    // Already exists (race or repeated call); fall through to read.
  }
  const row = db.prepare('SELECT * FROM world_boss WHERE boss_id = ?').get(bossId);
  const state = rowToBossState(row);
  if (!state) throw new Error('Failed to spawn world boss');
  return state;
}

/**
 * Idempotent. If the current week has no boss row, spawn one. If the current
 * boss is past its weekEnd or defeated & unsettled, settle it and spawn next.
 */
export function ensureCurrentBoss(): WorldBossState {
  const db = getDb();
  const now = new Date();
  const weekStart = getWeekStartUtc(now);

  // Find the latest boss (most recent weekStart).
  const latestRow = db.prepare('SELECT * FROM world_boss ORDER BY week_start DESC LIMIT 1').get();
  const latest = rowToBossState(latestRow);

  // No bosses ever → create one for this week.
  if (!latest) {
    return spawnBossForWeek(weekStart);
  }

  const latestWeekStart = new Date(latest.weekStart).getTime();
  const currentWeekStart = weekStart.getTime();
  const weekEnded = now >= new Date(latest.weekEnd);

  // Latest boss is for the current week and still alive within the week → use it.
  if (latestWeekStart === currentWeekStart && !latest.defeated && !weekEnded) {
    return latest;
  }

  // Latest boss needs to be settled (either week ended, or defeated and still unsettled).
  if ((weekEnded || latest.defeated) && !latest.settled) {
    settleBoss(latest.bossId);
  }

  // Latest boss was for a previous week or already settled → spawn current week's boss.
  if (latestWeekStart < currentWeekStart) {
    return spawnBossForWeek(weekStart);
  }

  // Latest boss is this week but defeated & settled → also spawn the current week again?
  // Keep the "one boss per week" rule: once this week's boss is dead, wait for next Monday.
  return rowToBossState(latestRow) ?? spawnBossForWeek(weekStart);
}

// ── Reads ───────────────────────────────────────────────────────────────

function getAttackRecord(bossId: string, playerId: string) {
  return getDb()
    .prepare('SELECT * FROM world_boss_attacks WHERE boss_id = ? AND player_id = ?')
    .get(bossId, playerId) as any;
}

function buildLadder(bossId: string, limit?: number): WorldBossLadderEntry[] {
  const db = getDb();
  const sql = `
    SELECT wba.player_id, wba.total_damage, wba.attacks, wba.last_attack_date, p.name AS player_name
    FROM world_boss_attacks wba
    JOIN players p ON p.id = wba.player_id
    WHERE wba.boss_id = ?
    ORDER BY wba.total_damage DESC
    ${limit ? 'LIMIT ?' : ''}
  `.trim();
  const rows = (limit ? db.prepare(sql).all(bossId, limit) : db.prepare(sql).all(bossId)) as any[];
  const total = (db.prepare('SELECT COUNT(*) AS n FROM world_boss_attacks WHERE boss_id = ?').get(bossId) as any)?.n ?? rows.length;
  return rows.map((r, i) => {
    const rank = i + 1;
    return {
      playerId: r.player_id,
      playerName: r.player_name ?? 'Trainer',
      totalDamage: r.total_damage,
      attacks: r.attacks,
      lastAttackDate: r.last_attack_date,
      rank,
      percentile: total > 0 ? rank / total : 1,
      tier: tierForRank(rank, total),
    };
  });
}

export function getStatus(playerId: string): WorldBossStatusResponse {
  const boss = ensureCurrentBoss();
  const record = getAttackRecord(boss.bossId, playerId);
  const top = buildLadder(boss.bossId, 10);
  const total: number = Number((getDb()
    .prepare('SELECT COUNT(*) AS n FROM world_boss_attacks WHERE boss_id = ?')
    .get(boss.bossId) as any)?.n ?? 0);

  let rank: number | null = null;
  let tier: WorldBossTier | null = null;
  if (record && record.total_damage > 0) {
    const higher = Number((getDb()
      .prepare('SELECT COUNT(*) AS n FROM world_boss_attacks WHERE boss_id = ? AND total_damage > ?')
      .get(boss.bossId, record.total_damage) as any)?.n ?? 0);
    const r = higher + 1;
    rank = r;
    tier = tierForRank(r, total);
  }

  return {
    boss,
    player: {
      canAttackToday: !boss.defeated && (!record || record.last_attack_date !== todayUtc()),
      totalDamage: record?.total_damage ?? 0,
      attacks: record?.attacks ?? 0,
      rank,
      tier,
    },
    topEntries: top,
    totalParticipants: total,
  };
}

export function getLadder(limit = 100): { bossId: string; entries: WorldBossLadderEntry[]; totalParticipants: number } {
  const boss = ensureCurrentBoss();
  const entries = buildLadder(boss.bossId, limit);
  const total = (getDb()
    .prepare('SELECT COUNT(*) AS n FROM world_boss_attacks WHERE boss_id = ?')
    .get(boss.bossId) as any)?.n ?? 0;
  return { bossId: boss.bossId, entries, totalParticipants: total };
}

export function getHistory(weeks = 4): WorldBossState[] {
  const rows = getDb()
    .prepare('SELECT * FROM world_boss ORDER BY week_start DESC LIMIT ?')
    .all(weeks) as any[];
  return rows.map(r => rowToBossState(r)!).filter(Boolean);
}

// ── Attack ──────────────────────────────────────────────────────────────

export function attackBoss(playerId: string, instanceIds: string[]): WorldBossAttackResult {
  if (!Array.isArray(instanceIds) || instanceIds.length !== WORLD_BOSS_CONFIG.teamSize) {
    throw new Error(`You must send exactly ${WORLD_BOSS_CONFIG.teamSize} monsters`);
  }
  const uniqueIds = new Set(instanceIds);
  if (uniqueIds.size !== instanceIds.length) {
    throw new Error('Cannot send the same Pokémon twice');
  }

  const boss = ensureCurrentBoss();
  if (boss.defeated) throw new Error('This week\'s boss has already been defeated');

  const today = todayUtc();
  const existing = getAttackRecord(boss.bossId, playerId);
  if (existing && existing.last_attack_date === today) {
    throw new Error('You already attacked the boss today. Come back tomorrow.');
  }

  const attackers = loadAttackerTeam(playerId, instanceIds);
  const bossMon = buildBossBattleMon();
  const bossSkills = boss.templateId
    ? (getTemplate(boss.templateId)?.skillIds ?? []).map(id => SKILLS[id]).filter(Boolean)
    : [];

  const sim = simulateWorldBossAttack({
    attackers,
    boss: bossMon,
    bossSkills,
    turns: WORLD_BOSS_CONFIG.simulationTurns,
  });

  const db = getDb();
  const hpBefore = boss.currentHp;

  // Atomically decrement HP, never going below 0, only if not defeated.
  db.prepare(
    'UPDATE world_boss SET current_hp = MAX(0, current_hp - ?) WHERE boss_id = ? AND defeated = 0',
  ).run(sim.totalDamage, boss.bossId);

  const updated = db.prepare('SELECT current_hp FROM world_boss WHERE boss_id = ?').get(boss.bossId) as any;
  const hpAfter = updated?.current_hp ?? Math.max(0, hpBefore - sim.totalDamage);
  const killedBoss = hpAfter <= 0;
  if (killedBoss) {
    db.prepare('UPDATE world_boss SET defeated = 1, defeated_at = ? WHERE boss_id = ? AND defeated = 0')
      .run(new Date().toISOString(), boss.bossId);
  }

  // Upsert attack record.
  if (existing) {
    db.prepare(
      'UPDATE world_boss_attacks SET total_damage = total_damage + ?, attacks = attacks + 1, last_attack_date = ?, last_attack_at = ? WHERE boss_id = ? AND player_id = ?',
    ).run(sim.totalDamage, today, new Date().toISOString(), boss.bossId, playerId);
  } else {
    db.prepare(
      'INSERT INTO world_boss_attacks (boss_id, player_id, total_damage, attacks, last_attack_date, last_attack_at) VALUES (?, ?, ?, 1, ?, ?)',
    ).run(boss.bossId, playerId, sim.totalDamage, today, new Date().toISOString());
  }

  // Instant drop.
  applyReward(playerId, WORLD_BOSS_ATTACK_DROP);

  // Settle now if killed — boss ladder/tier rewards go out immediately.
  if (killedBoss) {
    settleBoss(boss.bossId);
  }

  // Recompute rank for response.
  const myRecord = getAttackRecord(boss.bossId, playerId);
  const totalParticipants = (db
    .prepare('SELECT COUNT(*) AS n FROM world_boss_attacks WHERE boss_id = ?')
    .get(boss.bossId) as any)?.n ?? 0;
  const higher = (db
    .prepare('SELECT COUNT(*) AS n FROM world_boss_attacks WHERE boss_id = ? AND total_damage > ?')
    .get(boss.bossId, myRecord.total_damage) as any)?.n ?? 0;

  return {
    damageDealt: sim.totalDamage,
    perMon: sim.perMon,
    hpBefore,
    hpAfter,
    killedBoss,
    instantReward: WORLD_BOSS_ATTACK_DROP,
    rank: higher + 1,
    totalDamage: myRecord.total_damage,
  };
}

// ── Settle (distribute final rewards) ───────────────────────────────────

export function settleBoss(bossId: string): { distributed: number } {
  const db = getDb();
  const row = db.prepare('SELECT * FROM world_boss WHERE boss_id = ?').get(bossId) as any;
  if (!row) throw new Error('Unknown boss');
  if (row.settled) return { distributed: 0 };

  const participants = db
    .prepare('SELECT player_id, total_damage FROM world_boss_attacks WHERE boss_id = ? ORDER BY total_damage DESC')
    .all(bossId) as Array<{ player_id: string; total_damage: number }>;

  const total = participants.length;
  let distributed = 0;
  const bossDefeated = !!row.defeated;
  const fellAt = row.defeated_at ?? row.week_end;

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    const rank = i + 1;
    const tier = tierForRank(rank, total);
    const reward = WORLD_BOSS_TIER_REWARDS[tier];
    const title = bossDefeated ? 'Eternatus fell!' : 'Weekly World Boss Results';
    const message = bossDefeated
      ? `Your squad ranked #${rank}/${total} (${WORLD_BOSS_TIER_LABELS[tier]}). Dealt ${p.total_damage.toLocaleString()} damage. Boss fell at ${new Date(fellAt).toUTCString()}.`
      : `The week ended with Eternatus still standing. Your squad ranked #${rank}/${total} (${WORLD_BOSS_TIER_LABELS[tier]}) with ${p.total_damage.toLocaleString()} damage.`;
    sendInboxItem(p.player_id, { title, message, reward });
    distributed++;
  }

  db.prepare('UPDATE world_boss SET settled = 1 WHERE boss_id = ?').run(bossId);
  return { distributed };
}

// ── Admin ───────────────────────────────────────────────────────────────

export function adminForceSpawn(): WorldBossState {
  const now = new Date();
  const weekStart = getWeekStartUtc(now);
  // Settle latest if exists and not yet settled.
  const db = getDb();
  const latestRow = db.prepare('SELECT * FROM world_boss ORDER BY week_start DESC LIMIT 1').get() as any;
  if (latestRow && !latestRow.settled) {
    settleBoss(latestRow.boss_id);
  }
  return spawnBossForWeek(weekStart);
}

export function adminForceSettle(): { distributed: number; bossId: string } {
  const boss = ensureCurrentBoss();
  const res = settleBoss(boss.bossId);
  return { distributed: res.distributed, bossId: boss.bossId };
}

export function adminDebug(): { boss: WorldBossState; ladder: WorldBossLadderEntry[] } {
  const boss = ensureCurrentBoss();
  return { boss, ladder: buildLadder(boss.bossId) };
}

// Re-exported for routes
export type { WorldBossAttackResult, WorldBossState, WorldBossLadderEntry, WorldBossStatusResponse, MissionReward };
