import { v4 as uuidv4 } from 'uuid';
import { getTemplate as getTemplateShared, computeStats, computeStatsWithItems, getActiveSetEffects, xpToNextLevel, MAX_LEVEL_BY_STARS } from '@gatchamon/shared';
import { getSkillsForPokemon, SKILLS } from '@gatchamon/shared';
import { REGIONS, TOTAL_REGIONS, getFloorCount, getGymLeaderTeam, getLeagueChampion, isLeagueRegion, getArcForRegion, getNextRegionInArc, STORY_ARCS } from '@gatchamon/shared';
import { STORY_ENERGY_COST, BEGINNER_BONUS, isBeginnerBonusActive } from '@gatchamon/shared';
import { getDungeon, getItemDungeon, getTowerFloor, getTowerEnemyPool, getMysteryDungeonDef, getMysteryDungeonDateKey, PIECE_COST, shouldResetTower, getCurrentTowerResetDate } from '@gatchamon/shared';
import {
  applyPassives,
  advanceToNextActor,
  autoResolveEnemyTurns,
  processStartOfTurn,
  processPassiveTrigger,
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
  TrainerSkills,
  ActiveSetEffect,
} from '@gatchamon/shared';
import type { PokemonTemplate, SkillDefinition, StoryProgress, BaseStats } from '@gatchamon/shared';
import { getDb } from '../db/schema.js';
import { spendEnergy, grantTrainerXp, earnPokedollars } from './player.service.js';
import { generateItem, rollItemDrop, getItemsForPokemon } from './held-item.service.js';
import { defaultTrainerSkills } from '@gatchamon/shared';
import { resolveArenaRewards, getArenaBattle, setArenaBattle, deleteArenaBattle } from './arena.service.js';
import { incrementMission, trackTrophyStat, isFirstClear, markFirstClear } from './daily.service.js';

// ---------------------------------------------------------------------------
// In-memory battle store
// ---------------------------------------------------------------------------
const activeBattles = new Map<string, BattleState>();

// Map instanceId → active set effects for proc handling in battle
const battleSetEffects = new Map<string, ActiveSetEffect[]>();

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

  // League regions (Pokemon League): every floor is a champion battle
  if (isLeagueRegion(regionId)) {
    const champion = getLeagueChampion(regionId, floor);
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

  // Tutorial first battle: only 2 enemies with 1 grass type (easier intro)
  if (regionId === 1 && floor === 1 && difficulty === 'normal') {
    return {
      enemies: [
        { templateId: 43, level: enemyLevel, stars }, // Oddish (Grass)
        { templateId: 19, level: enemyLevel, stars }, // Rattata (Normal)
      ],
      isBoss: false,
    };
  }

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
  skillLevels?: [number, number, number],
  isShiny?: boolean,
  selectedPassive?: 0 | 1,
  playerId?: string,
): BattleMon {
  const template = getTemplate(templateId);

  let stats: BaseStats;
  if (isPlayerOwned && playerId) {
    // Apply held item bonuses
    const equippedItems = getItemsForPokemon(playerId, instanceId);
    stats = computeStatsWithItems(template, level, stars, equippedItems);
    // Store set effects for proc handling during battle
    const setEffects = getActiveSetEffects(equippedItems);
    battleSetEffects.set(instanceId, setEffects);
    // Apply trainer global stat bonuses
    const trainerSkills = getPlayerSkills(playerId);
    stats = {
      ...stats,
      atk: Math.floor(stats.atk * (1 + trainerSkills.globalAtkBonus * 0.02)),
      def: Math.floor(stats.def * (1 + trainerSkills.globalDefBonus * 0.02)),
      hp: Math.floor(stats.hp * (1 + trainerSkills.globalHpBonus * 0.02)),
      spd: Math.floor(stats.spd * (1 + trainerSkills.globalSpdBonus * 0.02)),
    };
  } else {
    stats = computeStats(template, level, stars);
  }

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
    skillLevels,
    isShiny,
    selectedPassive,
  };
}

/** Read status bypassing TS narrowing (status is mutated by checkBattleEnd). */
function getStatus(state: BattleState): BattleState['status'] {
  return state.status;
}

function resolveTargets(skill: SkillDefinition, actor: BattleMon, targetInstanceId: string, state: BattleState): BattleMon[] {
  if (skill.target === 'self') {
    return [actor];
  } else if (skill.target === 'all_enemies') {
    return state.enemyTeam.filter(m => m.isAlive);
  } else if (skill.target === 'single_ally') {
    const ally = state.playerTeam.find(m => m.instanceId === targetInstanceId && m.isAlive);
    return ally ? [ally] : [actor];
  } else if (skill.target === 'all_allies') {
    return state.playerTeam.filter(m => m.isAlive);
  } else {
    // single_enemy
    const target = state.enemyTeam.find(m => m.instanceId === targetInstanceId && m.isAlive);
    if (!target) throw new Error('Target not found or dead');
    return [target];
  }
}

// ---------------------------------------------------------------------------
// Reward calculation and application
// ---------------------------------------------------------------------------

function getPlayerSkills(playerId: string): TrainerSkills {
  const row = getDb().prepare('SELECT trainer_skills FROM players WHERE id = ?').get(playerId) as any;
  return row?.trainer_skills ? JSON.parse(row.trainer_skills) : defaultTrainerSkills();
}

function getPlayerCreatedAt(playerId: string): string {
  const row = getDb().prepare('SELECT created_at FROM players WHERE id = ?').get(playerId) as any;
  return row?.created_at ?? new Date().toISOString();
}

function applyXpToTeam(
  state: BattleState,
  xpPerMon: number,
): Array<{ instanceId: string; newLevel: number }> {
  const db = getDb();
  const levelUps: Array<{ instanceId: string; newLevel: number }> = [];

  for (const mon of state.playerTeam) {
    const row = db.prepare(
      'SELECT instance_id, level, exp, stars FROM pokemon_instances WHERE instance_id = ?'
    ).get(mon.instanceId) as any;
    if (!row) continue;

    let currentLevel = row.level;
    let currentExp = row.exp + xpPerMon;
    let needed = xpToNextLevel(currentLevel);
    const maxLevel = MAX_LEVEL_BY_STARS[row.stars] ?? 99;
    while (currentExp >= needed && currentLevel < maxLevel) {
      currentExp -= needed;
      currentLevel++;
      needed = xpToNextLevel(currentLevel);
      levelUps.push({ instanceId: mon.instanceId, newLevel: currentLevel });
    }
    if (currentLevel >= maxLevel) {
      currentLevel = maxLevel;
      currentExp = 0;
    }

    db.prepare(
      'UPDATE pokemon_instances SET level = ?, exp = ? WHERE instance_id = ?'
    ).run(currentLevel, currentExp, mon.instanceId);
  }

  return levelUps;
}

function trackBattleVictory(state: BattleState): void {
  const pid = state.playerId;
  if (state.mode === 'story') {
    incrementMission(pid, 'battle_story');
    trackTrophyStat(pid, 'totalBattlesStory');
    const isBoss = isLeagueRegion(state.floor.region) || state.floor.floor === getFloorCount(state.floor.region);
    if (isBoss) {
      incrementMission(pid, 'clear_boss');
      trackTrophyStat(pid, 'totalBossesDefeated');
    }
  } else if (state.mode === 'dungeon' || state.mode === 'item-dungeon' || state.mode === 'mystery-dungeon') {
    incrementMission(pid, 'battle_dungeon');
    trackTrophyStat(pid, 'totalBattlesDungeon');
  }
  incrementMission(pid, 'spend_energy', STORY_ENERGY_COST);
}

function calcRewardsForMode(state: BattleState): BattleRewards {
  if (state.mode === 'arena' || state.mode === 'arena-rival') {
    return resolveArenaRewards(state);
  }
  trackBattleVictory(state);
  return state.mode === 'story' ? calculateRewards(state) : calculateDungeonRewards(state);
}

function calculateRewards(state: BattleState): BattleRewards {
  const { region: regionId, floor: floorNum, difficulty } = state.floor;
  const isBoss = isLeagueRegion(regionId) || floorNum === getFloorCount(regionId);
  const diffMult = DIFFICULTY_REWARD_MULT[difficulty];
  const bossMult = isBoss ? 3 : 1;

  const skills = getPlayerSkills(state.playerId);
  const createdAt = getPlayerCreatedAt(state.playerId);
  const isBeginner = isBeginnerBonusActive(createdAt);

  const xpMult = (1 + skills.xpBonus * 0.1) * (isBeginner ? BEGINNER_BONUS.xpMult : 1);
  const pokeballMult = 1 + skills.pokeballBonus * 0.1;
  const pokedollarMult = (1 + skills.pokedollarBonus * 0.1) * (isBeginner ? BEGINNER_BONUS.pokedollarMult : 1);

  const firstClear = isFirstClear(state.playerId, regionId, floorNum, difficulty);

  // Pokeballs (first clear only)
  let pokeballs = 0;
  let premiumPokeballs = 0;

  // XP with trainer skill and beginner multipliers
  const xpBase = regionId * 7 + floorNum * 3;
  const xpBossMult = isBoss ? 2 : 1;
  const xpPerMon = Math.floor(xpBase * diffMult * xpBossMult * xpMult);

  // Pokedollars
  const pdBase = 10 + regionId * 5 + floorNum * 2;
  const pokedollars = Math.floor(pdBase * diffMult * pokedollarMult);

  const db = getDb();
  const levelUps = applyXpToTeam(state, xpPerMon);

  if (firstClear) {
    const pokeballBase = 1 + Math.floor(regionId / 2) + Math.floor(floorNum / 4);
    pokeballs = Math.floor(pokeballBase * diffMult * bossMult * pokeballMult);

    db.prepare(
      'UPDATE players SET regular_pokeballs = regular_pokeballs + ? WHERE id = ?'
    ).run(pokeballs, state.playerId);

    if (isBoss) {
      premiumPokeballs = 1;
      db.prepare(
        'UPDATE players SET premium_pokeballs = premium_pokeballs + 1 WHERE id = ?'
      ).run(state.playerId);
    }

    markFirstClear(state.playerId, regionId, floorNum, difficulty);
  }

  // Award pokedollars
  if (pokedollars > 0) {
    db.prepare(
      'UPDATE players SET pokedollars = pokedollars + ? WHERE id = ?'
    ).run(pokedollars, state.playerId);
  }

  // Advance story progress
  const player = db.prepare('SELECT story_progress FROM players WHERE id = ?').get(state.playerId) as any;
  if (player) {
    const storyProgress: StoryProgress = JSON.parse(player.story_progress);
    advanceStoryProgress(storyProgress, regionId, floorNum, difficulty);
    db.prepare('UPDATE players SET story_progress = ? WHERE id = ?')
      .run(JSON.stringify(storyProgress), state.playerId);
  }

  // Trainer XP
  const trainerXpAmount = regionId * 5 + floorNum * 2;
  grantTrainerXp(state.playerId, trainerXpAmount);

  // Tutorial: guarantee a held item drop on the very first story battle
  const itemDrops: { itemId: string; setId: string; stars: number; grade: string }[] = [];
  if (regionId === 1 && floorNum === 1 && difficulty === 'normal') {
    // Check if this is the player's first clear (no items yet)
    const itemCount = (db.prepare('SELECT COUNT(*) as c FROM held_items WHERE owner_id = ?').get(state.playerId) as any).c;
    if (itemCount === 0) {
      const item = generateItem('power_band', 1, 1, 'common', state.playerId);
      itemDrops.push({ itemId: item.itemId, setId: item.setId, stars: item.stars, grade: item.grade });
      // Grant bonus pokedollars so the player can afford the tutorial upgrade
      db.prepare('UPDATE players SET pokedollars = pokedollars + 1000 WHERE id = ?').run(state.playerId);
    }
  }

  return {
    regularPokeballs: pokeballs, premiumPokeballs, xpPerMon, levelUps,
    pokedollars: pokedollars + (itemDrops.length > 0 ? 1000 : 0),
    itemDrops: itemDrops.length > 0 ? itemDrops : undefined,
    isFirstClear: firstClear,
  };
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
    // Unlock next region in arc if not already
    const nextRegion = getNextRegionInArc(regionId);
    if (nextRegion !== undefined && !progress[nextRegion]) {
      progress[nextRegion] = 1;
    }
    // Check if all regions in arc complete → unlock next difficulty
    checkDifficultyUnlock(storyProgress, difficulty, regionId);
  }
}

function checkDifficultyUnlock(storyProgress: StoryProgress, difficulty: Difficulty, regionId: number): void {
  const arc = getArcForRegion(regionId);
  if (!arc) return;
  const progress = storyProgress[difficulty];
  const allComplete = arc.regionIds.every(rId => progress[rId] === getFloorCount(rId) + 1);
  if (!allComplete) return;

  // Unlock next difficulty for this arc
  if (difficulty === 'normal' && !storyProgress.hard[arc.regionIds[0]]) {
    storyProgress.hard[arc.regionIds[0]] = 1;
  } else if (difficulty === 'hard' && !storyProgress.hell[arc.regionIds[0]]) {
    storyProgress.hell[arc.regionIds[0]] = 1;
  }

  // Unlock next arc's normal if this arc's normal is complete
  if (difficulty === 'normal') {
    for (const nextArc of STORY_ARCS) {
      if (nextArc.prerequisite?.arcId === arc.id && !storyProgress.normal[nextArc.regionIds[0]]) {
        storyProgress.normal[nextArc.regionIds[0]] = 1;
      }
    }
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

  // Deduct energy
  spendEnergy(playerId, STORY_ENERGY_COST);

  // Load player team from DB
  const playerTeam: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const row = db.prepare(
      'SELECT instance_id, template_id, level, stars, skill_levels, is_shiny, selected_passive FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
    ).get(instId, playerId) as { instance_id: string; template_id: number; level: number; stars: number; skill_levels?: string; is_shiny?: number; selected_passive?: number } | undefined;

    if (!row) throw new Error(`Pokemon instance ${instId} not found or not owned by player`);

    const skillLevels = row.skill_levels ? JSON.parse(row.skill_levels) : [1, 1, 1];
    playerTeam.push(makeBattleMon(row.instance_id, row.template_id, row.level, row.stars, true, skillLevels, !!row.is_shiny, (row.selected_passive ?? 0) as 0 | 1, playerId));
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
    result.rewards = calcRewardsForMode(state);
  }

  return result;
}

export function resolvePlayerAction(battleId: string, action: BattleAction): BattleResult {
  const state = activeBattles.get(battleId) ?? getArenaBattle(battleId);
  if (!state) throw new Error('Battle not found');
  if (state.status !== 'active') throw new Error('Battle is already over');

  const isArenaMode = state.mode === 'arena' || state.mode === 'arena-rival';
  const saveBattle = () => { if (isArenaMode) setArenaBattle(battleId, state); else activeBattles.set(battleId, state); };
  const removeBattle = () => { if (isArenaMode) deleteArenaBattle(battleId); else activeBattles.delete(battleId); };

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

  // Trigger turn_start passives
  const turnStartEffects = processPassiveTrigger('turn_start', actor, state);
  // Process start-of-turn effects for the player actor
  const turnResult = processStartOfTurn(actor, state);
  const allTurnEffects = [...turnStartEffects, ...turnResult.texts];
  const logs: BattleLogEntry[] = [];

  // Create heal log entries for turn-start heals
  for (const heal of turnResult.heals) {
    logs.push({
      turn: state.turnNumber,
      actorId: actor.instanceId,
      actorName: template.name,
      skillUsed: '__turn_heal',
      skillName: heal.source,
      targetId: heal.instanceId,
      targetName: heal.name,
      damage: 0, isCrit: false, effectiveness: 1,
      effects: [],
      healAmount: heal.amount,
    });
  }

  // Proc heal_per_turn (Leftovers) at turn start
  const actorTurnEffects = battleSetEffects.get(actor.instanceId);
  if (actorTurnEffects && actor.isAlive) {
    for (const eff of actorTurnEffects) {
      if (eff.procEffect === 'heal_per_turn' && actor.currentHp < actor.maxHp) {
        const oldHp = actor.currentHp;
        const healAmt = Math.floor(actor.maxHp * (eff.procValue ?? 15) / 100);
        actor.currentHp = Math.min(actor.maxHp, actor.currentHp + healAmt);
        const healed = actor.currentHp - oldHp;
        allTurnEffects.push(`${template.name} recovered ${healAmt} HP from Leftovers!`);
        if (healed > 0) {
          logs.push({
            turn: state.turnNumber,
            actorId: actor.instanceId,
            actorName: template.name,
            skillUsed: '__turn_heal',
            skillName: 'Leftovers',
            targetId: actor.instanceId,
            targetName: template.name,
            damage: 0, isCrit: false, effectiveness: 1,
            effects: [],
            healAmount: healed,
          });
        }
      }
    }
  }

  if (!actor.isAlive) {
    // Actor died from DoT
    checkBattleEnd(state);
    if (getStatus(state) === 'active') {
      const enemyLogs = autoResolveEnemyTurns(state);
      logs.push(...enemyLogs);
    }
    state.log.push(...logs);
    saveBattle();
    const result: BattleResult = { state };
    const dotStatus = getStatus(state);
    if (dotStatus === 'victory') { result.rewards = calcRewardsForMode(state); removeBattle(); }
    else if (dotStatus === 'defeat' && isArenaMode) { result.rewards = calcRewardsForMode(state); removeBattle(); }
    else if (dotStatus === 'defeat') { removeBattle(); }
    return result;
  }

  // Helper to tick cooldowns
  const tickCooldowns = () => {
    for (const skId of Object.keys(actor.skillCooldowns)) {
      if (actor.skillCooldowns[skId] > 0) {
        actor.skillCooldowns[skId]--;
      }
    }
  };

  // Check CC (stun, sleep, skip)
  const cc = getCCState(actor);

  if (cc.type === 'stun') {
    logs.push({
      turn: state.turnNumber,
      actorId: actor.instanceId,
      actorName: template.name,
      skillUsed: '',
      skillName: cc.reason === 'freeze' ? 'Frozen' : 'Asleep',
      targetId: actor.instanceId,
      targetName: template.name,
      damage: 0, isCrit: false, effectiveness: 1,
      effects: [`${template.name} is ${cc.reason === 'freeze' ? 'frozen' : 'asleep'} and cannot act!`, ...allTurnEffects],
    });
    tickCooldowns();
    checkBattleEnd(state);
    if (getStatus(state) === 'active') {
      const enemyLogs = autoResolveEnemyTurns(state);
      logs.push(...enemyLogs);
    }
    state.log.push(...logs);
    saveBattle();
    const result: BattleResult = { state };
    const ccStatus = getStatus(state);
    if (ccStatus === 'victory') { result.rewards = calcRewardsForMode(state); removeBattle(); }
    else if (ccStatus === 'defeat' && isArenaMode) { result.rewards = calcRewardsForMode(state); removeBattle(); }
    else if (ccStatus === 'defeat') { removeBattle(); }
    return result;
  }

  if (cc.type === 'skip') {
    logs.push({
      turn: state.turnNumber,
      actorId: actor.instanceId,
      actorName: template.name,
      skillUsed: '',
      skillName: 'Paralyzed',
      targetId: actor.instanceId,
      targetName: template.name,
      damage: 0, isCrit: false, effectiveness: 1,
      effects: [`${template.name} is paralyzed and cannot move!`, ...allTurnEffects],
    });
    tickCooldowns();
    checkBattleEnd(state);
    if (getStatus(state) === 'active') {
      const enemyLogs = autoResolveEnemyTurns(state);
      logs.push(...enemyLogs);
    }
    state.log.push(...logs);
    saveBattle();
    const result: BattleResult = { state };
    const ccStatus = getStatus(state);
    if (ccStatus === 'victory') { result.rewards = calcRewardsForMode(state); removeBattle(); }
    else if (ccStatus === 'defeat' && isArenaMode) { result.rewards = calcRewardsForMode(state); removeBattle(); }
    else if (ccStatus === 'defeat') { removeBattle(); }
    return result;
  }

  // Paralysis CD increase: increase cooldowns but still skip the turn
  if (cc.type === 'cd_increase') {
    for (const skId of Object.keys(actor.skillCooldowns)) {
      const skillDef = SKILLS[skId];
      if (skillDef && skillDef.cooldown === 0) continue;
      actor.skillCooldowns[skId]++;
    }
    logs.push({
      turn: state.turnNumber,
      actorId: actor.instanceId,
      actorName: template.name,
      skillUsed: '',
      skillName: 'Paralyzed',
      targetId: actor.instanceId,
      targetName: template.name,
      damage: 0, isCrit: false, effectiveness: 1,
      effects: [`${template.name} is paralyzed! Cooldowns increased!`, ...allTurnEffects],
    });
    tickCooldowns();
    checkBattleEnd(state);
    if (getStatus(state) === 'active') {
      const enemyLogs = autoResolveEnemyTurns(state);
      logs.push(...enemyLogs);
    }
    state.log.push(...logs);
    saveBattle();
    const result: BattleResult = { state };
    const ccStatus = getStatus(state);
    if (ccStatus === 'victory') { result.rewards = calcRewardsForMode(state); removeBattle(); }
    else if (ccStatus === 'defeat' && isArenaMode) { result.rewards = calcRewardsForMode(state); removeBattle(); }
    else if (ccStatus === 'defeat') { removeBattle(); }
    return result;
  }

  // Determine actual skill (handle silence, provoke)
  let actualSkill = skill;
  if (cc.type === 'silence' || cc.type === 'provoke') {
    const basicSkill = skills.find(s => s.category === 'basic');
    if (basicSkill) actualSkill = basicSkill;
  }

  // Resolve targets with CC redirects
  let targets: BattleMon[];
  if (cc.type === 'confusion') {
    if (actualSkill.target === 'all_enemies') {
      targets = state.playerTeam.filter(m => m.isAlive && m.instanceId !== actor.instanceId);
    } else if (actualSkill.target === 'single_enemy') {
      const allies = state.playerTeam.filter(m => m.isAlive && m.instanceId !== actor.instanceId);
      if (allies.length > 0) {
        targets = [allies[Math.floor(Math.random() * allies.length)]];
      } else {
        targets = state.enemyTeam.filter(m => m.isAlive).slice(0, 1);
      }
    } else {
      targets = resolveTargets(actualSkill, actor, action.targetInstanceId, state);
    }
  } else if (cc.type === 'provoke') {
    const allMons = [...state.playerTeam, ...state.enemyTeam];
    const provoker = allMons.find(m => m.instanceId === cc.targetId && m.isAlive);
    targets = provoker ? [provoker] : resolveTargets(actualSkill, actor, action.targetInstanceId, state);
  } else {
    targets = resolveTargets(actualSkill, actor, action.targetInstanceId, state);
  }

  const actionLogs = resolveSkill(actor, actualSkill, targets, state);
  if (actionLogs.length > 0 && allTurnEffects.length > 0) {
    actionLogs[0].effects = [...allTurnEffects, ...actionLogs[0].effects];
  }
  logs.push(...actionLogs);

  // Proc set effects: stun_on_hit and extra_turn
  const actorSetEffects = battleSetEffects.get(actor.instanceId);
  if (actorSetEffects && actor.isAlive && actualSkill.target !== 'self' && actualSkill.target !== 'single_ally' && actualSkill.target !== 'all_allies') {
    for (const eff of actorSetEffects) {
      if (eff.procEffect === 'stun_on_hit' && eff.procChance != null) {
        for (const target of targets) {
          if (target.isAlive && Math.random() < eff.procChance) {
            target.debuffs.push({ id: 'freeze', type: 'debuff', value: 0, remainingTurns: eff.procValue ?? 1 });
            const lastLog = logs[logs.length - 1];
            if (lastLog) lastLog.effects.push(`${getTemplate(target.templateId).name} was stunned by Razor Fang!`);
          }
        }
      }
      if (eff.procEffect === 'extra_turn' && eff.procChance != null) {
        if (Math.random() < eff.procChance) {
          actor.actionGauge = 1000;
          const lastLog = logs[logs.length - 1];
          if (lastLog) lastLog.effects.push(`${template.name} gains an extra turn from King's Rock!`);
        }
      }
    }
  }

  checkBattleEnd(state);

  // Auto-resolve enemy turns until next player turn or battle end
  if (getStatus(state) === 'active') {
    const enemyLogs = autoResolveEnemyTurns(state);
    logs.push(...enemyLogs);
  }

  state.log.push(...logs);
  saveBattle();

  const result: BattleResult = { state };
  const finalStatus = getStatus(state);
  if (finalStatus === 'victory') {
    result.rewards = calcRewardsForMode(state);
    removeBattle();
  } else if (finalStatus === 'defeat') {
    if (isArenaMode) {
      result.rewards = calcRewardsForMode(state);
    }
    removeBattle();
  }

  return result;
}

export function getBattleState(battleId: string): BattleState | null {
  return activeBattles.get(battleId) ?? getArenaBattle(battleId) ?? null;
}

// ---------------------------------------------------------------------------
// Dungeon battles
// ---------------------------------------------------------------------------

function initBattleFromTeams(
  playerId: string,
  playerTeam: BattleMon[],
  enemyTeam: BattleMon[],
  floor: { region: number; floor: number; difficulty: Difficulty },
  mode: BattleState['mode'],
): BattleResult {
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
    mode,
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

  activeBattles.set(battleId, state);

  const result: BattleResult = { state };
  if (getStatus(state) === 'victory') {
    result.rewards = calculateDungeonRewards(state);
  }
  return result;
}

function loadPlayerTeam(playerId: string, teamInstanceIds: string[]): BattleMon[] {
  const db = getDb();
  const team: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const row = db.prepare(
      'SELECT instance_id, template_id, level, stars, skill_levels, is_shiny, selected_passive FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
    ).get(instId, playerId) as any;
    if (!row) throw new Error(`Pokemon ${instId} not found`);
    const skillLevels = row.skill_levels ? JSON.parse(row.skill_levels) : [1, 1, 1];
    team.push(makeBattleMon(row.instance_id, row.template_id, row.level, row.stars, true, skillLevels, !!row.is_shiny, (row.selected_passive ?? 0) as 0 | 1, playerId));
  }
  if (team.length === 0) throw new Error('Team cannot be empty');
  return team;
}

/** Start a material dungeon battle. */
export function startDungeonBattle(
  playerId: string,
  teamInstanceIds: string[],
  dungeonId: number,
  floorIndex: number,
): BattleResult {
  const dungeon = getDungeon(dungeonId);
  if (!dungeon) throw new Error('Unknown dungeon');
  const floor = dungeon.floors[floorIndex];
  if (!floor) throw new Error('Invalid floor');

  spendEnergy(playerId, dungeon.energyCost);
  const playerTeam = loadPlayerTeam(playerId, teamInstanceIds);

  const enemyTeam: BattleMon[] = floor.enemies.map((tid: number) => {
    const id = `enemy_${uuidv4()}`;
    return makeBattleMon(id, tid, floor.enemyLevel, floor.enemyStars ?? 1, false);
  });

  return initBattleFromTeams(
    playerId, playerTeam, enemyTeam,
    { region: dungeonId, floor: floorIndex + 1, difficulty: 'normal' },
    'dungeon' as any,
  );
}

/** Start an item dungeon battle. */
export function startItemDungeonBattle(
  playerId: string,
  teamInstanceIds: string[],
  dungeonId: number,
  floorIndex: number,
): BattleResult {
  const dungeon = getItemDungeon(dungeonId);
  if (!dungeon) throw new Error('Unknown item dungeon');
  const floor = dungeon.floors[floorIndex];
  if (!floor) throw new Error('Invalid floor');

  spendEnergy(playerId, dungeon.energyCost);
  const playerTeam = loadPlayerTeam(playerId, teamInstanceIds);

  const enemyTeam: BattleMon[] = floor.enemies.map((tid: number) => {
    const id = `enemy_${uuidv4()}`;
    return makeBattleMon(id, tid, floor.enemyLevel, floor.enemyStars ?? 1, false);
  });

  return initBattleFromTeams(
    playerId, playerTeam, enemyTeam,
    { region: dungeonId, floor: floorIndex + 1, difficulty: 'normal' },
    'item-dungeon' as any,
  );
}

/** Start a tower battle. */
export function startTowerBattle(
  playerId: string,
  teamInstanceIds: string[],
  towerFloor: number,
): BattleResult {
  const db = getDb();

  // Check/reset tower
  const playerRow = db.prepare('SELECT tower_progress, tower_reset_date FROM players WHERE id = ?').get(playerId) as any;
  if (!playerRow) throw new Error('Player not found');
  if (shouldResetTower(playerRow.tower_reset_date)) {
    db.prepare('UPDATE players SET tower_progress = 0, tower_reset_date = ? WHERE id = ?')
      .run(getCurrentTowerResetDate(), playerId);
  }

  const floorDef = getTowerFloor(towerFloor);
  if (!floorDef) throw new Error('Invalid tower floor');

  spendEnergy(playerId, floorDef.energyCost);
  const playerTeam = loadPlayerTeam(playerId, teamInstanceIds);

  // Get enemy template IDs from seeded pool
  const resetDate = playerRow.tower_reset_date ?? getCurrentTowerResetDate();
  const enemyTemplateIds = getTowerEnemyPool(towerFloor, resetDate);
  const isBossFloor = towerFloor % 10 === 0;

  const enemyTeam: BattleMon[] = enemyTemplateIds.map((tid, i) => {
    const id = `enemy_${uuidv4()}`;
    const mon = makeBattleMon(id, tid, floorDef.enemyLevel, floorDef.enemyStars, false);
    if (floorDef.speedBonus) mon.stats.spd += floorDef.speedBonus;
    if (isBossFloor && i === 0) mon.isBoss = true;
    return mon;
  });

  return initBattleFromTeams(
    playerId, playerTeam, enemyTeam,
    { region: 0, floor: towerFloor, difficulty: 'normal' },
    'tower' as any,
  );
}

/** Start a mystery dungeon battle. */
export function startMysteryDungeonBattle(
  playerId: string,
  teamInstanceIds: string[],
  floorIndex: number,
): BattleResult {
  const dateKey = getMysteryDungeonDateKey();
  const def = getMysteryDungeonDef(dateKey);
  if (!def) throw new Error('No mystery dungeon available');
  const floor = def.floors[floorIndex];
  if (!floor) throw new Error('Invalid floor');

  spendEnergy(playerId, def.energyCosts[floorIndex]);
  const playerTeam = loadPlayerTeam(playerId, teamInstanceIds);

  const enemyTeam: BattleMon[] = floor.enemies.map((tid: number) => {
    const id = `enemy_${uuidv4()}`;
    return makeBattleMon(id, tid, floor.enemyLevel, floor.enemyStars ?? 1, false);
  });

  return initBattleFromTeams(
    playerId, playerTeam, enemyTeam,
    { region: 0, floor: floorIndex + 1, difficulty: 'normal' },
    'mystery' as any,
  );
}

// ---------------------------------------------------------------------------
// Dungeon / Tower reward calculation
// ---------------------------------------------------------------------------

function calculateDungeonRewards(state: BattleState): BattleRewards {
  const skills = getPlayerSkills(state.playerId);
  const createdAt = getPlayerCreatedAt(state.playerId);
  const isBeginner = isBeginnerBonusActive(createdAt);
  const xpMult = (1 + skills.xpBonus * 0.1) * (isBeginner ? BEGINNER_BONUS.xpMult : 1);
  const pokedollarMult = (1 + skills.pokedollarBonus * 0.1) * (isBeginner ? BEGINNER_BONUS.pokedollarMult : 1);
  const essenceMult = 1 + skills.essenceBonus * 0.1;

  const db = getDb();
  const mode = state.mode;
  const floorIdx = state.floor.floor - 1;
  const dungeonId = state.floor.region;

  let xpPerMon = 0;
  let pokedollars = 0;
  let essences: Record<string, number> = {};
  let trainerXpAmount = 0;
  let regularPokeballs = 0;
  let premiumPokeballs = 0;
  let legendaryPokeballs = 0;
  let stardust = 0;
  let itemDrops: { itemId: string; setId: string; stars: number; grade: string }[] | undefined;
  let mysteryPieces: { templateId: number; count: number } | undefined;

  if (mode === 'tower' as any) {
    const towerFloor = state.floor.floor;
    const floorDef = getTowerFloor(towerFloor);
    if (floorDef?.reward) {
      const r = floorDef.reward as any;
      if (r.regularPokeballs) {
        regularPokeballs = r.regularPokeballs;
        db.prepare('UPDATE players SET regular_pokeballs = regular_pokeballs + ? WHERE id = ?')
          .run(regularPokeballs, state.playerId);
      }
      if (r.premiumPokeballs) {
        premiumPokeballs = r.premiumPokeballs;
        db.prepare('UPDATE players SET premium_pokeballs = premium_pokeballs + ? WHERE id = ?')
          .run(premiumPokeballs, state.playerId);
      }
      if (r.legendaryPokeballs) {
        legendaryPokeballs = r.legendaryPokeballs;
        db.prepare('UPDATE players SET legendary_pokeballs = legendary_pokeballs + ? WHERE id = ?')
          .run(legendaryPokeballs, state.playerId);
      }
      if (r.pokedollars) {
        pokedollars = Math.floor(r.pokedollars * pokedollarMult);
        db.prepare('UPDATE players SET pokedollars = pokedollars + ? WHERE id = ?')
          .run(pokedollars, state.playerId);
      }
      if (r.stardust) {
        stardust = r.stardust;
        db.prepare('UPDATE players SET stardust = stardust + ? WHERE id = ?')
          .run(stardust, state.playerId);
      }
      if (r.essences) {
        for (const [key, qty] of Object.entries(r.essences as Record<string, number>)) {
          essences[key] = (essences[key] ?? 0) + qty;
        }
        if (Object.keys(essences).length > 0) {
          const playerRow = db.prepare('SELECT materials FROM players WHERE id = ?').get(state.playerId) as any;
          const materials = playerRow?.materials ? JSON.parse(playerRow.materials) : {};
          for (const [key, qty] of Object.entries(essences)) {
            materials[key] = (materials[key] ?? 0) + qty;
          }
          db.prepare('UPDATE players SET materials = ? WHERE id = ?')
            .run(JSON.stringify(materials), state.playerId);
        }
      }
      if (r.heldItem) {
        const item = generateItem(r.heldItem.setId, Math.ceil(Math.random() * 6) as any, r.heldItem.stars, r.heldItem.grade, state.playerId);
        itemDrops = [{ itemId: item.itemId, setId: item.setId, stars: item.stars, grade: item.grade }];
      }
      if (r.dittos) {
        db.prepare('UPDATE players SET dittos = dittos + ? WHERE id = ?')
          .run(r.dittos, state.playerId);
      }
    }
    // Advance tower progress
    const current = db.prepare('SELECT tower_progress FROM players WHERE id = ?').get(state.playerId) as any;
    if (current && towerFloor > (current.tower_progress ?? 0)) {
      db.prepare('UPDATE players SET tower_progress = ? WHERE id = ?')
        .run(towerFloor, state.playerId);
    }
    trainerXpAmount = towerFloor * 3 + 10;
    xpPerMon = Math.floor(towerFloor * 10 * xpMult);
  } else if (mode === 'dungeon' as any) {
    const dungeon = getDungeon(dungeonId);
    if (dungeon) {
      const floor = dungeon.floors[floorIdx];
      if (floor) {
        xpPerMon = Math.floor(floor.enemyLevel * 5 * xpMult);
        // Roll essence drops
        for (const drop of floor.drops) {
          if (Math.random() < drop.chance) {
            const qty = Math.floor(
              (drop.quantity[0] + Math.random() * (drop.quantity[1] - drop.quantity[0] + 1)) * essenceMult
            );
            if (qty > 0) essences[drop.essenceId] = (essences[drop.essenceId] ?? 0) + qty;
          }
        }
        // Award essences
        if (Object.keys(essences).length > 0) {
          const playerRow = db.prepare('SELECT materials FROM players WHERE id = ?').get(state.playerId) as any;
          const materials = playerRow?.materials ? JSON.parse(playerRow.materials) : {};
          for (const [key, qty] of Object.entries(essences)) {
            materials[key] = (materials[key] ?? 0) + qty;
          }
          db.prepare('UPDATE players SET materials = ? WHERE id = ?')
            .run(JSON.stringify(materials), state.playerId);
        }
        pokedollars = Math.floor((20 + floor.enemyLevel * 2) * pokedollarMult);
        if (pokedollars > 0) {
          db.prepare('UPDATE players SET pokedollars = pokedollars + ? WHERE id = ?')
            .run(pokedollars, state.playerId);
        }
      }
    }
    trainerXpAmount = (floorIdx + 1) * 8 + 10;
  } else if (mode === 'item-dungeon' as any) {
    const dungeon = getItemDungeon(dungeonId);
    if (dungeon) {
      const floor = dungeon.floors[floorIdx];
      if (floor) {
        xpPerMon = Math.floor(floor.enemyLevel * 5 * xpMult);
        const pdRange = floor.pokedollarReward ?? [20, 50];
        pokedollars = Math.floor((pdRange[0] + Math.random() * (pdRange[1] - pdRange[0] + 1)) * pokedollarMult);
        if (pokedollars > 0) {
          db.prepare('UPDATE players SET pokedollars = pokedollars + ? WHERE id = ?')
            .run(pokedollars, state.playerId);
        }
        // Roll held item drop from one random drop entry
        if (floor.drops && floor.drops.length > 0) {
          const drop = floor.drops[Math.floor(Math.random() * floor.drops.length)];
          const item = rollItemDrop(drop, state.playerId);
          itemDrops = [{ itemId: item.itemId, setId: item.setId, stars: item.stars, grade: item.grade }];
        }
        // Roll stardust
        if (floor.stardustDrop) {
          const sd = floor.stardustDrop;
          if (Math.random() < sd.chance) {
            const qty = sd.min + Math.floor(Math.random() * (sd.max - sd.min + 1));
            if (qty > 0) {
              stardust = qty;
              db.prepare('UPDATE players SET stardust = stardust + ? WHERE id = ?')
                .run(stardust, state.playerId);
            }
          }
        }
      }
    }
    trainerXpAmount = (floorIdx + 1) * 8 + 10;
  } else if (mode === 'mystery' as any) {
    const def = getMysteryDungeonDef();
    if (def) {
      const floor = def.floors[floorIdx];
      if (floor) {
        xpPerMon = Math.floor(floor.enemyLevel * 5 * xpMult);
        pokedollars = Math.floor((20 + floor.enemyLevel * 2) * pokedollarMult);
        if (pokedollars > 0) {
          db.prepare('UPDATE players SET pokedollars = pokedollars + ? WHERE id = ?')
            .run(pokedollars, state.playerId);
        }
        // Mystery pieces
        if (floor.pieceReward && def.featuredTemplateId) {
          const playerRow = db.prepare('SELECT mystery_pieces FROM players WHERE id = ?').get(state.playerId) as any;
          const pieces = playerRow?.mystery_pieces ? JSON.parse(playerRow.mystery_pieces) : {};
          pieces[def.featuredTemplateId] = (pieces[def.featuredTemplateId] ?? 0) + floor.pieceReward;
          db.prepare('UPDATE players SET mystery_pieces = ? WHERE id = ?')
            .run(JSON.stringify(pieces), state.playerId);
          mysteryPieces = { templateId: def.featuredTemplateId, count: floor.pieceReward };
        }
      }
    }
    trainerXpAmount = (floorIdx + 1) * 8 + 10;
  }

  const levelUps = xpPerMon > 0 ? applyXpToTeam(state, xpPerMon) : [];

  // Grant trainer XP
  let trainerResult;
  if (trainerXpAmount > 0) {
    trainerResult = grantTrainerXp(state.playerId, trainerXpAmount);
  }

  return {
    regularPokeballs,
    premiumPokeballs,
    legendaryPokeballs: legendaryPokeballs > 0 ? legendaryPokeballs : undefined,
    xpPerMon,
    levelUps,
    essences: Object.keys(essences).length > 0 ? essences : undefined,
    pokedollars: pokedollars > 0 ? pokedollars : undefined,
    stardust: stardust > 0 ? stardust : undefined,
    itemDrops,
    mysteryPieces,
    trainerXpGained: trainerXpAmount,
    trainerLeveledUp: trainerResult?.leveledUp,
    trainerNewLevel: trainerResult?.newLevel,
  };
}
