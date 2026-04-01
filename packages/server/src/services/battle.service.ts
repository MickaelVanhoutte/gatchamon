import { v4 as uuidv4 } from 'uuid';
import { getTemplate as getTemplateShared, computeStats, xpToNextLevel } from '@gatchamon/shared';
import { getSkillsForPokemon, SKILLS } from '@gatchamon/shared';
import { REGIONS, TOTAL_REGIONS, getFloorCount, getGymLeaderTeam, getLeagueChampion } from '@gatchamon/shared';
import {
  applyPassives,
  advanceToNextActor,
  autoResolveEnemyTurns,
  processStartOfTurn,
  resolveSkill,
  getCCState,
  checkBattleEnd,
  getEffectiveStats,
  allDead,
} from '@gatchamon/shared';
import type {
  BattleState,
  BattleMon,
  BattleLogEntry,
  BattleAction,
  BattleRewards,
  BattleResult,
  Difficulty,
} from '@gatchamon/shared';
import type { PokemonTemplate, SkillDefinition, StoryProgress } from '@gatchamon/shared';
import { getDb } from '../db/schema.js';

// ---------------------------------------------------------------------------
// In-memory battle store
// ---------------------------------------------------------------------------
const activeBattles = new Map<string, BattleState>();

// ---------------------------------------------------------------------------
// Floor definitions — Region-based with difficulty scaling
// ---------------------------------------------------------------------------
interface FloorEnemy {
  templateId: number;
  level: number;
  stars: 1 | 2 | 3;
  isBoss?: boolean;
}

export interface FloorDef {
  enemies: FloorEnemy[];
  isBoss: boolean;
}

const DIFFICULTY_LEVEL_BONUS: Record<Difficulty, number> = {
  normal: 0,
  hard: 52,
  hell: 107,
};

const DIFFICULTY_REWARD_MULT: Record<Difficulty, number> = {
  normal: 1,
  hard: 1.5,
  hell: 2.5,
};

function pickSeeded(arr: number[], regionId: number, floor: number, slot: number): number {
  const idx = ((regionId * 31) + (floor * 7) + (slot * 13)) % arr.length;
  return arr[idx];
}

function getBaseStars(regionId: number, isBoss: boolean): 1 | 2 | 3 {
  if (isBoss) {
    return regionId >= 7 ? 3 : 2;
  }
  return regionId >= 7 ? 2 : 1;
}

function clampStars(stars: number): 1 | 2 | 3 {
  return Math.min(3, Math.max(1, stars)) as 1 | 2 | 3;
}

export function buildFloorEnemies(regionId: number, floor: number, difficulty: Difficulty): FloorDef {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) throw new Error(`Unknown region ${regionId}`);

  const regionBase = (regionId - 1) * 5 + 1;
  const floorBonus = Math.ceil(floor / 2);
  const difficultyBonus = DIFFICULTY_LEVEL_BONUS[difficulty];
  const floorCount = getFloorCount(regionId);

  // Region 10 (Pokemon League): every floor is a champion battle
  if (regionId === 10) {
    const champion = getLeagueChampion(floor);
    if (champion) {
      const bossLevel = regionBase + floorBonus + difficultyBonus + 5;
      const baseStars = getBaseStars(regionId, true);
      const starBoost = difficulty === 'hell' ? 1 : difficulty === 'hard' ? 1 : 0;
      const bossStars = clampStars(baseStars + starBoost);
      const companionStars = getBaseStars(regionId, false);
      const companionLevel = regionBase + floorBonus + difficultyBonus;

      const enemies: FloorEnemy[] = champion.team.map((tid, i) => ({
        templateId: tid,
        level: i === champion.bossIndex ? bossLevel : companionLevel,
        stars: i === champion.bossIndex ? bossStars : companionStars,
        isBoss: i === champion.bossIndex ? true : undefined,
      }));
      return { enemies, isBoss: true };
    }
  }

  // Boss floor for regions 1-9
  if (floor === floorCount) {
    const bossLevel = regionBase + floorBonus + difficultyBonus + 5;
    const baseStars = getBaseStars(regionId, true);
    const starBoost = difficulty === 'hell' ? 1 : difficulty === 'hard' ? 1 : 0;
    const bossStars = clampStars(baseStars + starBoost);
    const companionLevel = regionBase + floorBonus + difficultyBonus;
    const companionStars = getBaseStars(regionId, false);

    // Use gym leader team if available
    const gymTeam = getGymLeaderTeam(regionId, difficulty);
    if (gymTeam) {
      const bossIdx = gymTeam.length - 1;
      const enemies: FloorEnemy[] = gymTeam.map((tid, i) => ({
        templateId: tid,
        level: i === bossIdx ? bossLevel : companionLevel,
        stars: i === bossIdx ? bossStars : companionStars,
        isBoss: i === bossIdx ? true : undefined,
      }));
      return { enemies, isBoss: true };
    }

    // Fallback to original boss system
    const enemies: FloorEnemy[] = [];
    if (region.bossCompanions.length > 0) {
      enemies.push({
        templateId: region.bossCompanions[0],
        level: companionLevel,
        stars: companionStars,
      });
    }
    enemies.push({
      templateId: pickSeeded(region.bossPool, regionId, floor, 0),
      level: bossLevel,
      stars: bossStars,
      isBoss: true,
    });
    if (region.bossCompanions.length > 1) {
      enemies.push({
        templateId: region.bossCompanions[1],
        level: companionLevel,
        stars: companionStars,
      });
    }
    return { enemies, isBoss: true };
  }

  // Normal floors
  const enemyLevel = regionBase + floorBonus + difficultyBonus;
  const baseStars = getBaseStars(regionId, false);
  const starBoost = difficulty === 'hell' ? 1 : 0;
  const stars = clampStars(baseStars + starBoost);
  const enemyCount = difficulty === 'hell' ? 4 : 3;

  const enemies: FloorEnemy[] = [];
  for (let slot = 0; slot < enemyCount; slot++) {
    enemies.push({
      templateId: pickSeeded(region.commonPool, regionId, floor, slot),
      level: enemyLevel,
      stars,
    });
  }

  return { enemies, isBoss: false };
}

/** Get all 10 floor definitions for a region + difficulty. */
export function getFloorDefsForRegion(regionId: number, difficulty: Difficulty): Record<number, FloorDef> {
  const defs: Record<number, FloorDef> = {};
  for (let f = 1; f <= 10; f++) {
    defs[f] = buildFloorEnemies(regionId, f, difficulty);
  }
  return defs;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTemplate(templateId: number): PokemonTemplate {
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
): BattleMon {
  const template = getTemplate(templateId);
  const stats = computeStats(template, level, stars);
  const skills = getSkillsForPokemon(template.skillIds);

  const cooldowns: Record<string, number> = {};
  for (const sk of skills) {
    // Passives are auto-applied, not selectable — skip them from cooldowns
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
  };
}

/** Read status bypassing TS narrowing (status is mutated by checkBattleEnd). */
function getStatus(state: BattleState): BattleState['status'] {
  return state.status;
}

// ---------------------------------------------------------------------------
// Reward calculation and application
// ---------------------------------------------------------------------------

function calculateRewards(state: BattleState): BattleRewards {
  const { region: regionId, floor: floorNum, difficulty } = state.floor;
  const isBoss = regionId === 10 || floorNum === getFloorCount(regionId);
  const diffMult = DIFFICULTY_REWARD_MULT[difficulty];
  const bossMult = isBoss ? 3 : 1;

  // Pokeballs: base scales with region and floor
  const pokeballBase = 1 + Math.floor(regionId / 2) + Math.floor(floorNum / 4);
  const pokeballs = Math.floor(pokeballBase * diffMult * bossMult);

  // XP: scales with region and floor
  const xpBase = regionId * 10 + floorNum * 5;
  const xpBossMult = isBoss ? 2 : 1;
  const xpPerMon = Math.floor(xpBase * diffMult * xpBossMult);

  const db = getDb();
  const levelUps: Array<{ instanceId: string; newLevel: number }> = [];

  // Apply XP to each alive player mon
  for (const mon of state.playerTeam) {
    const row = db.prepare(
      'SELECT instance_id, level, exp FROM pokemon_instances WHERE instance_id = ?'
    ).get(mon.instanceId) as { instance_id: string; level: number; exp: number } | undefined;

    if (!row) continue;

    let currentLevel = row.level;
    let currentExp = row.exp + xpPerMon;

    // Handle level-ups
    let needed = xpToNextLevel(currentLevel);
    while (currentExp >= needed) {
      currentExp -= needed;
      currentLevel++;
      needed = xpToNextLevel(currentLevel);
      levelUps.push({ instanceId: mon.instanceId, newLevel: currentLevel });
    }

    db.prepare(
      'UPDATE pokemon_instances SET level = ?, exp = ? WHERE instance_id = ?'
    ).run(currentLevel, currentExp, mon.instanceId);
  }

  // Award regular pokeballs
  db.prepare(
    'UPDATE players SET regular_pokeballs = regular_pokeballs + ? WHERE id = ?'
  ).run(pokeballs, state.playerId);

  // Advance story progress
  const player = db.prepare('SELECT story_progress FROM players WHERE id = ?').get(state.playerId) as any;
  if (player) {
    const storyProgress: StoryProgress = JSON.parse(player.story_progress);
    advanceStoryProgress(storyProgress, regionId, floorNum, difficulty);
    db.prepare('UPDATE players SET story_progress = ? WHERE id = ?')
      .run(JSON.stringify(storyProgress), state.playerId);
  }

  return { regularPokeballs: pokeballs, premiumPokeballs: 0, xpPerMon, levelUps };
}

function advanceStoryProgress(
  storyProgress: StoryProgress,
  regionId: number,
  floor: number,
  difficulty: Difficulty,
): void {
  const progress = storyProgress[difficulty];
  const currentFloor = progress[regionId] ?? 0;

  // Only advance if this is the floor the player needs to beat
  if (floor !== currentFloor) return;

  const floorCount = getFloorCount(regionId);
  if (floor < floorCount) {
    progress[regionId] = floor + 1;
  } else {
    // Beat the boss — mark region complete
    progress[regionId] = floorCount + 1;
    // Unlock next region if not already
    if (regionId < TOTAL_REGIONS && !progress[regionId + 1]) {
      progress[regionId + 1] = 1;
    }
    // Check if all regions complete → unlock next difficulty
    checkDifficultyUnlock(storyProgress, difficulty);
  }
}

function checkDifficultyUnlock(storyProgress: StoryProgress, difficulty: Difficulty): void {
  const progress = storyProgress[difficulty];
  const allComplete = Array.from({ length: TOTAL_REGIONS }, (_, i) => i + 1)
    .every(rId => progress[rId] === getFloorCount(rId) + 1);

  if (!allComplete) return;

  if (difficulty === 'normal' && Object.keys(storyProgress.hard).length === 0) {
    storyProgress.hard[1] = 1;
  } else if (difficulty === 'hard' && Object.keys(storyProgress.hell).length === 0) {
    storyProgress.hell[1] = 1;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function startBattle(
  playerId: string,
  teamInstanceIds: string[],
  floor: { region: number; floor: number; difficulty: Difficulty },
): BattleResult {
  const db = getDb();

  // Load player team from DB
  const playerTeam: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const row = db.prepare(
      'SELECT instance_id, template_id, level, stars FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
    ).get(instId, playerId) as { instance_id: string; template_id: number; level: number; stars: number } | undefined;

    if (!row) throw new Error(`Pokemon instance ${instId} not found or not owned by player`);

    playerTeam.push(makeBattleMon(row.instance_id, row.template_id, row.level, row.stars, true));
  }

  if (playerTeam.length === 0) throw new Error('Team cannot be empty');

  // Build enemy team from region floor definition
  const floorDef = buildFloorEnemies(floor.region, floor.floor, floor.difficulty);

  const enemyTeam: BattleMon[] = floorDef.enemies.map(e => {
    const id = `enemy_${uuidv4()}`;
    const mon = makeBattleMon(id, e.templateId, e.level, e.stars, false);
    if (e.isBoss) mon.isBoss = true;
    return mon;
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
    floor,
    mode: 'story',
    recap: {},
  };

  // Apply passive abilities at battle start
  applyPassives(state);

  // Determine first actor by simulating gauge fills
  const firstActorId = advanceToNextActor(state);
  const allMons = [...state.playerTeam, ...state.enemyTeam];
  const firstActor = allMons.find(m => m.instanceId === firstActorId);

  if (firstActor && !firstActor.isPlayerOwned) {
    // First actor is an enemy — auto-resolve until a player mon gets a turn
    state.currentActorId = firstActorId;
    const enemyLogs = autoResolveEnemyTurns(state);
    state.log.push(...enemyLogs);
  } else {
    state.currentActorId = firstActorId;
  }

  activeBattles.set(battleId, state);

  const result: BattleResult = { state };
  if (getStatus(state) === 'victory') {
    result.rewards = calculateRewards(state);
  }

  return result;
}

export function resolvePlayerAction(battleId: string, action: BattleAction): BattleResult {
  const state = activeBattles.get(battleId);
  if (!state) throw new Error('Battle not found');
  if (state.status !== 'active') throw new Error('Battle is already over');

  // Validate it's the correct actor's turn
  if (state.currentActorId !== action.actorInstanceId) {
    throw new Error('Not this monster\'s turn');
  }

  const actor = state.playerTeam.find(m => m.instanceId === action.actorInstanceId);
  if (!actor || !actor.isAlive) throw new Error('Actor is dead or not found');

  // Validate skill
  const template = getTemplate(actor.templateId);
  const skills = getSkillsForPokemon(template.skillIds);
  const skill = skills.find(s => s.id === action.skillId);
  if (!skill) throw new Error('Skill not found for this pokemon');

  // Check cooldown
  if ((actor.skillCooldowns[skill.id] ?? 0) > 0) {
    throw new Error(`Skill ${skill.name} is on cooldown (${actor.skillCooldowns[skill.id]} turns remaining)`);
  }

  state.turnNumber++;

  // Process start-of-turn effects for the player actor
  const turnEffects = processStartOfTurn(actor, state);
  const logs: BattleLogEntry[] = [];

  if (!actor.isAlive) {
    // Actor died from DoT
    checkBattleEnd(state);
    if (getStatus(state) === 'active') {
      const enemyLogs = autoResolveEnemyTurns(state);
      logs.push(...enemyLogs);
    }
    state.log.push(...logs);
    activeBattles.set(battleId, state);
    const result: BattleResult = { state };
    if (getStatus(state) === 'victory') result.rewards = calculateRewards(state);
    return result;
  }

  // Check CC (stun, paralysis, etc.)
  const cc = getCCState(actor);
  if (cc.type === 'stun' || cc.type === 'skip') {
    const ccLabel = cc.type === 'stun'
      ? (cc.reason === 'freeze' ? 'Frozen' : 'Asleep')
      : 'Paralyzed';
    const ccMsg = cc.type === 'stun'
      ? `${template.name} is ${cc.reason === 'freeze' ? 'frozen' : 'asleep'} and cannot act!`
      : `${template.name} is paralyzed and cannot move!`;
    logs.push({
      turn: state.turnNumber,
      actorId: actor.instanceId,
      actorName: template.name,
      skillUsed: '',
      skillName: ccLabel,
      targetId: actor.instanceId,
      targetName: template.name,
      damage: 0,
      isCrit: false,
      effectiveness: 1,
      effects: [ccMsg, ...turnEffects],
    });
    // Tick cooldowns even when stunned/skipped
    for (const skId of Object.keys(actor.skillCooldowns)) {
      if (actor.skillCooldowns[skId] > 0) {
        actor.skillCooldowns[skId]--;
      }
    }
    checkBattleEnd(state);
    if (getStatus(state) === 'active') {
      const enemyLogs = autoResolveEnemyTurns(state);
      logs.push(...enemyLogs);
    }
    state.log.push(...logs);
    activeBattles.set(battleId, state);
    const result: BattleResult = { state };
    if (getStatus(state) === 'victory') result.rewards = calculateRewards(state);
    return result;
  }

  // Paralysis CD increase: increase all cooldowns by 1 but still act
  if (cc.type === 'cd_increase') {
    for (const skId of Object.keys(actor.skillCooldowns)) {
      const skillDef = SKILLS[skId];
      if (skillDef && skillDef.cooldown === 0) continue; // Never put basic attacks on cooldown
      actor.skillCooldowns[skId]++;
    }
    turnEffects.push(`${template.name} is paralyzed! Cooldowns increased!`);
  }

  // Resolve the player's chosen skill
  let targets: BattleMon[];
  if (skill.target === 'self') {
    targets = [actor];
  } else if (skill.target === 'all_enemies') {
    targets = state.enemyTeam.filter(m => m.isAlive);
  } else if (skill.target === 'single_ally') {
    // For player: target a player mon
    const ally = state.playerTeam.find(m => m.instanceId === action.targetInstanceId && m.isAlive);
    targets = ally ? [ally] : [actor];
  } else if (skill.target === 'all_allies') {
    targets = state.playerTeam.filter(m => m.isAlive);
  } else {
    // single_enemy
    const target = state.enemyTeam.find(m => m.instanceId === action.targetInstanceId && m.isAlive);
    if (!target) throw new Error('Target not found or dead');
    targets = [target];
  }

  const actionLogs = resolveSkill(actor, skill, targets, state);
  if (actionLogs.length > 0 && turnEffects.length > 0) {
    actionLogs[0].effects = [...turnEffects, ...actionLogs[0].effects];
  }
  logs.push(...actionLogs);

  checkBattleEnd(state);

  // Auto-resolve enemy turns until next player turn or battle end
  if (getStatus(state) === 'active') {
    const enemyLogs = autoResolveEnemyTurns(state);
    logs.push(...enemyLogs);
  }

  state.log.push(...logs);
  activeBattles.set(battleId, state);

  const result: BattleResult = { state };
  const finalStatus = getStatus(state);
  if (finalStatus === 'victory') {
    result.rewards = calculateRewards(state);
    activeBattles.delete(battleId);
  } else if (finalStatus === 'defeat') {
    activeBattles.delete(battleId);
  }

  return result;
}

export function getBattleState(battleId: string): BattleState | null {
  return activeBattles.get(battleId) ?? null;
}
