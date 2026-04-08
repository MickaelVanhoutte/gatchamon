import { v4 as uuidv4 } from 'uuid';
import {
  getTemplate as getTemplateShared,
  computeStats,
  getSkillsForPokemon,
  getArenaRival,
  getArenaRivalTeam,
  ARENA_RIVALS,
  applyPassives,
  advanceToNextActor,
  autoResolveEnemyTurns,
} from '@gatchamon/shared';
import type {
  BattleState,
  BattleMon,
  BattleRewards,
  BattleResult,
  ArenaOpponent,
  ArenaDefensePreview,
  ArenaHistoryEntry,
  ArenaRival,
} from '@gatchamon/shared';
import { getDb } from '../db/schema.js';
import { spendArenaTicket } from './player.service.js';

// ---------------------------------------------------------------------------
// In-memory battle store (shared with battle.service.ts via module import)
// We maintain our own map for arena battles
// ---------------------------------------------------------------------------
const arenaActiveBattles = new Map<string, BattleState>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTemplate(templateId: number) {
  const t = getTemplateShared(templateId);
  if (!t) throw new Error(`Unknown templateId ${templateId}`);
  return t;
}

function makeBattleMon(
  instanceId: string,
  templateId: number,
  level: number,
  stars: number,
  isPlayerOwned: boolean,
  skillLevels?: [number, number, number],
): BattleMon {
  const template = getTemplate(templateId);
  const stats = computeStats(template, level, stars);
  const skills = getSkillsForPokemon(template.skillIds);

  const cooldowns: Record<string, number> = {};
  for (const sk of skills) {
    if (sk.category === 'passive') continue;
    cooldowns[sk.id] = 0;
  }

  return {
    instanceId,
    templateId,
    isPlayerOwned,
    currentHp: stats.hp,
    maxHp: stats.hp,
    stats,
    skillCooldowns: cooldowns,
    buffs: [],
    debuffs: [],
    isAlive: true,
    actionGauge: 0,
    skillLevels,
  };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// ---------------------------------------------------------------------------
// ELO calculation
// ---------------------------------------------------------------------------

const ELO_K = 32;
const ELO_FLOOR = 800;

export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  playerWon: boolean,
): number {
  const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const score = playerWon ? 1 : 0;
  return Math.round(ELO_K * (score - expected));
}

function clampElo(elo: number): number {
  return Math.max(ELO_FLOOR, elo);
}

// ---------------------------------------------------------------------------
// Defense team
// ---------------------------------------------------------------------------

export function setDefense(playerId: string, teamInstanceIds: string[]): void {
  if (teamInstanceIds.length === 0) throw new Error('Defense team cannot be empty');
  if (teamInstanceIds.length > 4) throw new Error('Maximum 4 monsters per defense team');

  const db = getDb();
  // Validate ownership
  for (const instId of teamInstanceIds) {
    const row = db.prepare(
      'SELECT 1 FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
    ).get(instId, playerId);
    if (!row) throw new Error(`Pokemon ${instId} not found or not owned`);
  }

  db.prepare(`
    INSERT INTO arena_defense (player_id, team_instance_ids, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(player_id) DO UPDATE SET team_instance_ids = excluded.team_instance_ids, updated_at = excluded.updated_at
  `).run(playerId, JSON.stringify(teamInstanceIds));
}

export function getDefense(playerId: string): {
  teamInstanceIds: string[];
  team: ArenaDefensePreview[];
} | null {
  const db = getDb();
  const row = db.prepare('SELECT team_instance_ids FROM arena_defense WHERE player_id = ?').get(playerId) as any;
  if (!row) return null;

  const instanceIds: string[] = JSON.parse(row.team_instance_ids);
  const team: ArenaDefensePreview[] = [];

  for (const instId of instanceIds) {
    const mon = db.prepare(
      'SELECT template_id, level, stars, is_shiny FROM pokemon_instances WHERE instance_id = ?'
    ).get(instId) as any;
    if (mon) {
      team.push({
        templateId: mon.template_id,
        level: mon.level,
        stars: mon.stars,
        isShiny: !!mon.is_shiny,
      });
    }
  }

  return { teamInstanceIds: instanceIds, team };
}

// ---------------------------------------------------------------------------
// Matchmaking
// ---------------------------------------------------------------------------

export function findOpponents(playerId: string): ArenaOpponent[] {
  const db = getDb();
  const player = db.prepare('SELECT arena_elo FROM players WHERE id = ?').get(playerId) as any;
  if (!player) throw new Error('Player not found');
  const myElo = player.arena_elo ?? 1000;

  // Progressively widen range until we get enough opponents
  const ranges = [200, 400, 600, 1000];
  let opponents: ArenaOpponent[] = [];

  for (const range of ranges) {
    const rows = db.prepare(`
      SELECT p.id, p.name, p.trainer_level, p.arena_elo, ad.team_instance_ids
      FROM players p
      JOIN arena_defense ad ON ad.player_id = p.id
      WHERE p.id != ? AND p.arena_elo BETWEEN ? AND ?
      ORDER BY RANDOM()
      LIMIT 5
    `).all(playerId, myElo - range, myElo + range) as any[];

    opponents = rows.map(row => {
      const instanceIds: string[] = JSON.parse(row.team_instance_ids);
      const defenseTeam: ArenaDefensePreview[] = [];
      for (const instId of instanceIds) {
        const mon = db.prepare(
          'SELECT template_id, level, stars, is_shiny FROM pokemon_instances WHERE instance_id = ?'
        ).get(instId) as any;
        if (mon) {
          defenseTeam.push({
            templateId: mon.template_id,
            level: mon.level,
            stars: mon.stars,
            isShiny: !!mon.is_shiny,
          });
        }
      }
      return {
        playerId: row.id,
        playerName: row.name,
        trainerLevel: row.trainer_level ?? 1,
        arenaElo: row.arena_elo ?? 1000,
        defenseTeam,
      };
    });

    if (opponents.length >= 3) break;
  }

  return opponents;
}

// ---------------------------------------------------------------------------
// Arena PvP battle
// ---------------------------------------------------------------------------

export function startArenaBattle(
  playerId: string,
  teamInstanceIds: string[],
  defenderId: string,
): BattleResult {
  if (teamInstanceIds.length > 4) throw new Error('Maximum 4 monsters per team');

  // Spend arena ticket
  spendArenaTicket(playerId);

  const db = getDb();

  // Load attacker team
  const playerTeam = loadPlayerTeam(playerId, teamInstanceIds);

  // Load defender's defense
  const defRow = db.prepare('SELECT team_instance_ids FROM arena_defense WHERE player_id = ?').get(defenderId) as any;
  if (!defRow) throw new Error('Opponent has no defense team set');

  const defInstanceIds: string[] = JSON.parse(defRow.team_instance_ids);
  const enemyTeam: BattleMon[] = [];
  for (const instId of defInstanceIds) {
    const row = db.prepare(
      'SELECT instance_id, template_id, level, stars, skill_levels FROM pokemon_instances WHERE instance_id = ?'
    ).get(instId) as any;
    if (!row) continue; // Skip deleted monsters
    const skillLevels = row.skill_levels ? JSON.parse(row.skill_levels) : [1, 1, 1];
    enemyTeam.push(makeBattleMon(
      `arena_def_${uuidv4()}`,
      row.template_id,
      row.level,
      row.stars,
      false,
      skillLevels,
    ));
  }

  if (enemyTeam.length === 0) throw new Error('Opponent defense team is empty');

  const battleId = uuidv4();
  const state: BattleState = {
    battleId,
    playerId,
    playerTeam,
    enemyTeam,
    currentActorId: null,
    turnNumber: 0,
    status: 'active',
    log: [],
    floor: { region: 0, floor: 0, difficulty: 'normal' },
    mode: 'arena',
    arenaDefenderId: defenderId,
    recap: {},
  };

  applyPassives(state);
  const firstActorId = advanceToNextActor(state);
  const allMons = [...state.playerTeam, ...state.enemyTeam];
  const firstActor = allMons.find(m => m.instanceId === firstActorId);

  if (firstActor && !firstActor.isPlayerOwned) {
    state.currentActorId = firstActorId;
    const enemyLogs = autoResolveEnemyTurns(state);
    state.log.push(...enemyLogs);
  } else {
    state.currentActorId = firstActorId;
  }

  arenaActiveBattles.set(battleId, state);
  return { state };
}

// ---------------------------------------------------------------------------
// Rival battle
// ---------------------------------------------------------------------------

export function startRivalBattle(
  playerId: string,
  teamInstanceIds: string[],
  rivalId: string,
): BattleResult {
  if (teamInstanceIds.length > 4) throw new Error('Maximum 4 monsters per team');

  // Spend arena ticket
  spendArenaTicket(playerId);

  const db = getDb();

  // Check cooldown
  const cooldown = db.prepare(
    'SELECT last_battle_date FROM arena_rival_cooldowns WHERE player_id = ? AND rival_id = ?'
  ).get(playerId, rivalId) as any;
  if (cooldown && cooldown.last_battle_date === todayStr()) {
    throw new Error('You already battled this rival today');
  }

  // Load attacker
  const playerTeam = loadPlayerTeam(playerId, teamInstanceIds);

  // Build rival team
  const playerRow = db.prepare('SELECT arena_elo FROM players WHERE id = ?').get(playerId) as any;
  const attackerElo = playerRow?.arena_elo ?? 1000;
  const rivalTeam = getArenaRivalTeam(rivalId, attackerElo);
  if (!rivalTeam) throw new Error(`Unknown rival ${rivalId}`);

  const enemyTeam: BattleMon[] = rivalTeam.templateIds.map(tid => {
    const id = `rival_${uuidv4()}`;
    return makeBattleMon(id, tid, rivalTeam.level, rivalTeam.stars, false);
  });

  const battleId = uuidv4();
  const state: BattleState = {
    battleId,
    playerId,
    playerTeam,
    enemyTeam,
    currentActorId: null,
    turnNumber: 0,
    status: 'active',
    log: [],
    floor: { region: 0, floor: 0, difficulty: 'normal' },
    mode: 'arena-rival',
    arenaRivalId: rivalId,
    recap: {},
  };

  applyPassives(state);
  const firstActorId = advanceToNextActor(state);
  const allMons = [...state.playerTeam, ...state.enemyTeam];
  const firstActor = allMons.find(m => m.instanceId === firstActorId);

  if (firstActor && !firstActor.isPlayerOwned) {
    state.currentActorId = firstActorId;
    const enemyLogs = autoResolveEnemyTurns(state);
    state.log.push(...enemyLogs);
  } else {
    state.currentActorId = firstActorId;
  }

  arenaActiveBattles.set(battleId, state);
  return { state };
}

// ---------------------------------------------------------------------------
// Reward calculation (called on battle end)
// ---------------------------------------------------------------------------

export function resolveArenaRewards(state: BattleState): BattleRewards {
  const db = getDb();
  const won = state.status === 'victory';

  if (state.mode === 'arena' && state.arenaDefenderId) {
    return resolveArenaPvpRewards(state, won);
  } else if (state.mode === 'arena-rival' && state.arenaRivalId) {
    return resolveRivalRewards(state, won);
  }

  // Fallback (shouldn't happen)
  return { regularPokeballs: 0, premiumPokeballs: 0, xpPerMon: 0, levelUps: [] };
}

function resolveArenaPvpRewards(state: BattleState, won: boolean): BattleRewards {
  const db = getDb();
  const attackerId = state.playerId;
  const defenderId = state.arenaDefenderId!;

  // Get both players' ELO
  const attackerRow = db.prepare('SELECT arena_elo FROM players WHERE id = ?').get(attackerId) as any;
  const defenderRow = db.prepare('SELECT arena_elo FROM players WHERE id = ?').get(defenderId) as any;
  const attackerElo = attackerRow?.arena_elo ?? 1000;
  const defenderElo = defenderRow?.arena_elo ?? 1000;

  // Calculate ELO changes
  const attackerChange = calculateEloChange(attackerElo, defenderElo, won);
  const defenderChange = -attackerChange; // Zero-sum

  // Update ELOs (clamped)
  const newAttackerElo = clampElo(attackerElo + attackerChange);
  const newDefenderElo = clampElo(defenderElo + defenderChange);
  db.prepare('UPDATE players SET arena_elo = ? WHERE id = ?').run(newAttackerElo, attackerId);
  db.prepare('UPDATE players SET arena_elo = ? WHERE id = ?').run(newDefenderElo, defenderId);

  // Calculate rewards
  let stardust: number;
  let arenaCoins: number;

  if (won) {
    stardust = 10;
    arenaCoins = 10;
  } else {
    stardust = 0;
    arenaCoins = 3;
  }

  // Apply rewards to attacker
  db.prepare('UPDATE players SET stardust = stardust + ?, arena_coins = arena_coins + ? WHERE id = ?')
    .run(stardust, arenaCoins, attackerId);

  // Build team previews for history
  const attackerTeamPreview = buildTeamPreview(state.playerTeam);
  const defenderTeamPreview = buildTeamPreview(state.enemyTeam);

  // Insert history record
  const historyId = uuidv4();
  db.prepare(`
    INSERT INTO arena_history (id, attacker_id, defender_id, attacker_won, attacker_team, defender_team, attacker_elo_change, defender_elo_change, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    historyId,
    attackerId,
    defenderId,
    won ? 1 : 0,
    JSON.stringify(attackerTeamPreview),
    JSON.stringify(defenderTeamPreview),
    attackerChange,
    defenderChange,
  );

  return {
    regularPokeballs: 0,
    premiumPokeballs: 0,
    xpPerMon: 0,
    levelUps: [],
    stardust,
    arenaCoins,
    arenaEloChange: attackerChange,
  };
}

function resolveRivalRewards(state: BattleState, won: boolean): BattleRewards {
  const db = getDb();
  const rivalId = state.arenaRivalId!;

  // Set cooldown regardless of outcome
  db.prepare(`
    INSERT INTO arena_rival_cooldowns (player_id, rival_id, last_battle_date)
    VALUES (?, ?, ?)
    ON CONFLICT(player_id, rival_id) DO UPDATE SET last_battle_date = excluded.last_battle_date
  `).run(state.playerId, rivalId, todayStr());

  if (!won) {
    return { regularPokeballs: 0, premiumPokeballs: 0, xpPerMon: 0, levelUps: [] };
  }

  const stardust = 30;
  const arenaCoins = 5;

  db.prepare('UPDATE players SET stardust = stardust + ?, arena_coins = arena_coins + ? WHERE id = ?')
    .run(stardust, arenaCoins, state.playerId);

  return {
    regularPokeballs: 0,
    premiumPokeballs: 0,
    xpPerMon: 0,
    levelUps: [],
    stardust,
    arenaCoins,
  };
}

function buildTeamPreview(team: BattleMon[]): ArenaDefensePreview[] {
  return team.map(mon => ({
    templateId: mon.templateId,
    level: 0, // Level not stored on BattleMon stats directly
    stars: 0,
    isShiny: false,
  }));
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export function getAttackHistory(playerId: string): ArenaHistoryEntry[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT h.*, pa.name as attacker_name, pd.name as defender_name
    FROM arena_history h
    JOIN players pa ON pa.id = h.attacker_id
    JOIN players pd ON pd.id = h.defender_id
    WHERE h.defender_id = ? OR h.attacker_id = ?
    ORDER BY h.created_at DESC
    LIMIT 20
  `).all(playerId, playerId) as any[];

  return rows.map(row => ({
    id: row.id,
    attackerId: row.attacker_id,
    attackerName: row.attacker_name,
    defenderId: row.defender_id,
    defenderName: row.defender_name,
    attackerWon: !!row.attacker_won,
    attackerTeam: JSON.parse(row.attacker_team),
    defenderTeam: JSON.parse(row.defender_team),
    attackerEloChange: row.attacker_elo_change,
    defenderEloChange: row.defender_elo_change,
    createdAt: row.created_at,
  }));
}

// ---------------------------------------------------------------------------
// Rivals with cooldowns
// ---------------------------------------------------------------------------

export function getRivalsWithCooldowns(playerId: string): ArenaRival[] {
  const db = getDb();
  const today = todayStr();
  const playerRow = db.prepare('SELECT arena_elo FROM players WHERE id = ?').get(playerId) as any;
  const attackerElo = playerRow?.arena_elo ?? 1000;

  // Get all cooldowns for this player
  const cooldowns = db.prepare(
    'SELECT rival_id, last_battle_date FROM arena_rival_cooldowns WHERE player_id = ?'
  ).all(playerId) as any[];
  const cooldownMap = new Map<string, string>();
  for (const c of cooldowns) {
    cooldownMap.set(c.rival_id, c.last_battle_date);
  }

  return ARENA_RIVALS.map(rival => {
    const rivalTeam = getArenaRivalTeam(rival.rivalId, attackerElo);
    const lastBattle = cooldownMap.get(rival.rivalId);
    return {
      rivalId: rival.rivalId,
      name: rival.name,
      icon: rival.icon,
      team: rivalTeam?.previews ?? [],
      cooldownExpired: !lastBattle || lastBattle !== today,
    };
  });
}

// ---------------------------------------------------------------------------
// Battle state access (arena battles share resolvePlayerAction from battle.service)
// ---------------------------------------------------------------------------

export function getArenaBattle(battleId: string): BattleState | undefined {
  return arenaActiveBattles.get(battleId);
}

export function setArenaBattle(battleId: string, state: BattleState): void {
  arenaActiveBattles.set(battleId, state);
}

export function deleteArenaBattle(battleId: string): void {
  arenaActiveBattles.delete(battleId);
}

// ---------------------------------------------------------------------------
// Team loading helper (same pattern as battle.service)
// ---------------------------------------------------------------------------

function loadPlayerTeam(playerId: string, teamInstanceIds: string[]): BattleMon[] {
  const db = getDb();
  const team: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const row = db.prepare(
      'SELECT instance_id, template_id, level, stars, skill_levels FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
    ).get(instId, playerId) as any;
    if (!row) throw new Error(`Pokemon ${instId} not found or not owned`);
    const skillLevels = row.skill_levels ? JSON.parse(row.skill_levels) : [1, 1, 1];
    team.push(makeBattleMon(row.instance_id, row.template_id, row.level, row.stars, true, skillLevels));
  }
  if (team.length === 0) throw new Error('Team cannot be empty');
  return team;
}
