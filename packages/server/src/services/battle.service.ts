import { v4 as uuidv4 } from 'uuid';
import { getTemplate as getTemplateShared, computeStats, calculateDamage, xpToNextLevel } from '@gatchamon/shared';
import { SKILLS, getSkillsForPokemon } from '@gatchamon/shared';
import { REGIONS, TOTAL_REGIONS } from '@gatchamon/shared';
import type {
  BattleState,
  BattleMon,
  BattleLogEntry,
  BattleAction,
  BattleRewards,
  BattleResult,
  Difficulty,
} from '@gatchamon/shared';
import type { PokemonInstance, PokemonTemplate, SkillDefinition, BaseStats, StoryProgress } from '@gatchamon/shared';
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
  hard: 10,
  hell: 25,
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

  if (floor === 10) {
    // Boss floor — strong boss flanked by companions
    const bossLevel = regionBase + floorBonus + difficultyBonus + 5;
    const baseStars = getBaseStars(regionId, true);
    const starBoost = difficulty === 'hell' ? 1 : difficulty === 'hard' ? 1 : 0;
    const bossStars = clampStars(baseStars + starBoost);

    const companionLevel = regionBase + floorBonus + difficultyBonus;
    const companionStars = getBaseStars(regionId, false);

    const enemies: FloorEnemy[] = [];

    // Left companion
    if (region.bossCompanions.length > 0) {
      enemies.push({
        templateId: region.bossCompanions[0],
        level: companionLevel,
        stars: companionStars,
      });
    }

    // Boss (center)
    enemies.push({
      templateId: pickSeeded(region.bossPool, regionId, floor, 0),
      level: bossLevel,
      stars: bossStars,
      isBoss: true,
    });

    // Right companion
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

/** Apply passive skills for all mons at battle start. */
function applyPassives(state: BattleState): void {
  const allMons = [...state.playerTeam, ...state.enemyTeam];
  for (const mon of allMons) {
    const template = getTemplate(mon.templateId);
    const skills = getSkillsForPokemon(template.skillIds);
    for (const skill of skills) {
      if (skill.category !== 'passive') continue;
      for (const effect of skill.effects) {
        const roll = Math.random() * 100;
        if (roll >= effect.chance) continue;

        // Determine targets for the passive
        let targets: BattleMon[];
        if (skill.target === 'self') {
          targets = [mon];
        } else if (skill.target === 'all_allies') {
          targets = mon.isPlayerOwned
            ? state.playerTeam.filter(m => m.isAlive)
            : state.enemyTeam.filter(m => m.isAlive);
        } else if (skill.target === 'all_enemies') {
          targets = mon.isPlayerOwned
            ? state.enemyTeam.filter(m => m.isAlive)
            : state.playerTeam.filter(m => m.isAlive);
        } else {
          targets = [mon];
        }

        for (const target of targets) {
          const activeEffect = {
            type: effect.type as 'buff' | 'debuff' | 'dot' | 'heal' | 'stun',
            stat: effect.stat,
            value: effect.value,
            remainingTurns: 999, // Passives last the entire battle
          };
          if (effect.type === 'buff' || effect.type === 'heal') {
            target.buffs.push(activeEffect);
          } else {
            target.debuffs.push(activeEffect);
          }
        }
      }
    }
  }
}

function allDead(team: BattleMon[]): boolean {
  return team.every(m => !m.isAlive);
}

function getEffectiveStats(mon: BattleMon): BaseStats {
  const stats = { ...mon.stats };

  for (const buff of mon.buffs) {
    if (buff.stat && buff.stat in stats) {
      (stats as any)[buff.stat] += buff.value;
    }
  }
  for (const debuff of mon.debuffs) {
    if (debuff.stat && debuff.stat in stats) {
      (stats as any)[debuff.stat] += debuff.value; // value is negative for debuffs
    }
  }

  // Floor stats at 1 (except critRate/critDmg/acc/res which can be 0)
  stats.hp = Math.max(1, stats.hp);
  stats.atk = Math.max(1, stats.atk);
  stats.def = Math.max(1, stats.def);
  stats.spd = Math.max(1, stats.spd);

  return stats;
}

function isStunned(mon: BattleMon): boolean {
  return mon.debuffs.some(d => d.type === 'stun' && d.remainingTurns > 0);
}

// ---------------------------------------------------------------------------
// Turn order — action gauge simulation
// ---------------------------------------------------------------------------

/** Advance gauges tick by tick until one monster hits 1000. Return its instanceId. */
function advanceToNextActor(state: BattleState): string {
  const allMons = [...state.playerTeam, ...state.enemyTeam].filter(m => m.isAlive);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    for (const mon of allMons) {
      const effectiveStats = getEffectiveStats(mon);
      mon.actionGauge += effectiveStats.spd;
    }
    // Check who reached 1000 (could be multiple — pick highest gauge)
    const ready = allMons
      .filter(m => m.actionGauge >= 1000)
      .sort((a, b) => b.actionGauge - a.actionGauge);

    if (ready.length > 0) {
      const actor = ready[0];
      actor.actionGauge = 0;
      return actor.instanceId;
    }
  }
}

// ---------------------------------------------------------------------------
// Effect processing — start of turn
// ---------------------------------------------------------------------------

function processStartOfTurn(mon: BattleMon, state: BattleState): string[] {
  const effects: string[] = [];
  const template = getTemplate(mon.templateId);

  // Process DoTs
  for (const debuff of mon.debuffs) {
    if (debuff.type === 'dot' && debuff.remainingTurns > 0) {
      const dotDmg = Math.floor(mon.maxHp * (debuff.value / 100));
      mon.currentHp = Math.max(0, mon.currentHp - dotDmg);
      effects.push(`${template.name} takes ${dotDmg} DoT damage`);
      if (mon.currentHp <= 0) {
        mon.isAlive = false;
        effects.push(`${template.name} fainted from DoT!`);
      }
    }
  }

  // Tick buff/debuff durations
  for (const buff of mon.buffs) {
    buff.remainingTurns--;
  }
  for (const debuff of mon.debuffs) {
    debuff.remainingTurns--;
  }

  // Remove expired effects
  mon.buffs = mon.buffs.filter(b => b.remainingTurns > 0);
  mon.debuffs = mon.debuffs.filter(d => d.remainingTurns > 0);

  return effects;
}

// ---------------------------------------------------------------------------
// Skill resolution
// ---------------------------------------------------------------------------

function resolveSkill(
  actor: BattleMon,
  skill: SkillDefinition,
  targets: BattleMon[],
  state: BattleState,
): BattleLogEntry[] {
  const logs: BattleLogEntry[] = [];
  const actorTemplate = getTemplate(actor.templateId);
  const attackerStats = getEffectiveStats(actor);

  for (const target of targets) {
    const targetTemplate = getTemplate(target.templateId);
    let damage = 0;
    let isCrit = false;
    let effectiveness = 1;
    const appliedEffects: string[] = [];

    // Handle heal skills (target is self or ally)
    if (skill.target === 'self' || skill.target === 'single_ally' || skill.target === 'all_allies') {
      // For heal-type skills with multiplier 0, no damage is dealt
      if (skill.multiplier > 0) {
        // Some skills on self/ally still deal damage (unusual but handle it)
        const result = calculateDamage(
          attackerStats,
          getEffectiveStats(target),
          skill,
          actorTemplate.types,
          targetTemplate.types,
        );
        damage = result.damage;
        isCrit = result.isCrit;
        effectiveness = result.effectiveness;

        target.currentHp = Math.max(0, target.currentHp - damage);
        if (target.currentHp <= 0) {
          target.isAlive = false;
          appliedEffects.push(`${targetTemplate.name} fainted!`);
        }
      }
    } else {
      // Offensive skill
      const result = calculateDamage(
        attackerStats,
        getEffectiveStats(target),
        skill,
        actorTemplate.types,
        targetTemplate.types,
      );
      damage = result.damage;
      isCrit = result.isCrit;
      effectiveness = result.effectiveness;

      target.currentHp = Math.max(0, target.currentHp - damage);
      if (target.currentHp <= 0) {
        target.isAlive = false;
        appliedEffects.push(`${targetTemplate.name} fainted!`);
      }
    }

    // Apply skill effects
    for (const effect of skill.effects) {
      const roll = Math.random() * 100;
      if (roll >= effect.chance) continue;

      switch (effect.type) {
        case 'buff': {
          const buffTarget = (skill.target === 'self' || skill.target === 'single_ally' || skill.target === 'all_allies')
            ? actor
            : actor; // buffs from offensive skills still go on the caster
          buffTarget.buffs.push({
            type: 'buff',
            stat: effect.stat,
            value: effect.value,
            remainingTurns: effect.duration,
          });
          appliedEffects.push(`${actorTemplate.name} gained ${effect.stat} buff`);
          break;
        }
        case 'debuff': {
          if (target.isAlive) {
            target.debuffs.push({
              type: 'debuff',
              stat: effect.stat,
              value: effect.value,
              remainingTurns: effect.duration,
            });
            appliedEffects.push(`${targetTemplate.name} got ${effect.stat} debuff`);
          }
          break;
        }
        case 'dot': {
          if (target.isAlive) {
            target.debuffs.push({
              type: 'dot',
              stat: effect.stat,
              value: effect.value,
              remainingTurns: effect.duration,
            });
            appliedEffects.push(`${targetTemplate.name} is burning!`);
          }
          break;
        }
        case 'stun': {
          if (target.isAlive) {
            target.debuffs.push({
              type: 'stun',
              value: 0,
              remainingTurns: effect.duration,
            });
            appliedEffects.push(`${targetTemplate.name} is stunned!`);
          }
          break;
        }
        case 'heal': {
          const healTarget = (skill.target === 'self' || skill.target === 'single_ally' || skill.target === 'all_allies')
            ? target
            : actor;
          const healAmount = Math.floor(healTarget.maxHp * (effect.value / 100));
          healTarget.currentHp = Math.min(healTarget.maxHp, healTarget.currentHp + healAmount);
          appliedEffects.push(`${getTemplate(healTarget.templateId).name} healed ${healAmount} HP`);
          break;
        }
      }
    }

    logs.push({
      turn: state.turnNumber,
      actorId: actor.instanceId,
      actorName: actorTemplate.name,
      skillUsed: skill.id,
      skillName: skill.name,
      targetId: target.instanceId,
      targetName: targetTemplate.name,
      damage,
      isCrit,
      effectiveness,
      effects: appliedEffects,
    });
  }

  // Set cooldown for the skill
  if (skill.cooldown > 0) {
    actor.skillCooldowns[skill.id] = skill.cooldown;
  }

  // Tick all cooldowns for this actor (each turn the actor takes, decrement by 1)
  for (const skId of Object.keys(actor.skillCooldowns)) {
    if (skId !== skill.id && actor.skillCooldowns[skId] > 0) {
      actor.skillCooldowns[skId]--;
    }
  }

  return logs;
}

// ---------------------------------------------------------------------------
// AI Logic
// ---------------------------------------------------------------------------

function pickEnemyAction(actor: BattleMon, state: BattleState): { skill: SkillDefinition; targets: BattleMon[] } {
  const template = getTemplate(actor.templateId);
  const skills = getSkillsForPokemon(template.skillIds).filter(s => s.category !== 'passive');

  // Pick highest-numbered available skill (prefer skill2 > skill1)
  let chosenSkill: SkillDefinition | null = null;
  for (let i = skills.length - 1; i >= 0; i--) {
    const sk = skills[i];
    if ((actor.skillCooldowns[sk.id] ?? 0) <= 0) {
      chosenSkill = sk;
      break;
    }
  }
  // Fallback: if all on cooldown (shouldn't happen since skill1 has cd 0), use skill1
  if (!chosenSkill) {
    chosenSkill = skills[0];
  }

  // Pick targets
  let targets: BattleMon[];
  if (chosenSkill.target === 'self') {
    targets = [actor];
  } else if (chosenSkill.target === 'single_ally' || chosenSkill.target === 'all_allies') {
    // For enemies, allies are the other enemies
    targets = chosenSkill.target === 'all_allies'
      ? state.enemyTeam.filter(m => m.isAlive)
      : [actor]; // Simple AI: target self for single ally skills
  } else if (chosenSkill.target === 'all_enemies') {
    // Enemy's "enemies" are the player team
    targets = state.playerTeam.filter(m => m.isAlive);
  } else {
    // single_enemy — target player mon with lowest HP%
    const alive = state.playerTeam.filter(m => m.isAlive);
    alive.sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp));
    targets = [alive[0]];
  }

  return { skill: chosenSkill, targets };
}

// ---------------------------------------------------------------------------
// Check battle end
// ---------------------------------------------------------------------------

function checkBattleEnd(state: BattleState): void {
  if (allDead(state.enemyTeam)) {
    (state as any).status = 'victory';
  } else if (allDead(state.playerTeam)) {
    (state as any).status = 'defeat';
  }
}

/** Read status bypassing TS narrowing (status is mutated by checkBattleEnd). */
function getStatus(state: BattleState): BattleState['status'] {
  return state.status;
}

// ---------------------------------------------------------------------------
// Auto-resolve enemy turns
// ---------------------------------------------------------------------------

function autoResolveEnemyTurns(state: BattleState): BattleLogEntry[] {
  const logs: BattleLogEntry[] = [];

  while (state.status === 'active') {
    const nextActorId = advanceToNextActor(state);
    const allMons = [...state.playerTeam, ...state.enemyTeam];
    const actor = allMons.find(m => m.instanceId === nextActorId);
    if (!actor) break;

    // If next actor is a player mon, set it as current and stop
    if (actor.isPlayerOwned) {
      state.currentActorId = actor.instanceId;
      break;
    }

    // Enemy turn
    state.turnNumber++;

    // Process start-of-turn effects
    const turnEffects = processStartOfTurn(actor, state);
    if (!actor.isAlive) {
      checkBattleEnd(state);
      continue;
    }

    // Check stun
    if (isStunned(actor)) {
      const template = getTemplate(actor.templateId);
      logs.push({
        turn: state.turnNumber,
        actorId: actor.instanceId,
        actorName: template.name,
        skillUsed: '',
        skillName: 'Stunned',
        targetId: actor.instanceId,
        targetName: template.name,
        damage: 0,
        isCrit: false,
        effectiveness: 1,
        effects: [`${template.name} is stunned and cannot act!`, ...turnEffects],
      });
      // Tick cooldowns even when stunned
      for (const skId of Object.keys(actor.skillCooldowns)) {
        if (actor.skillCooldowns[skId] > 0) {
          actor.skillCooldowns[skId]--;
        }
      }
      checkBattleEnd(state);
      continue;
    }

    // Pick and resolve action
    const { skill, targets } = pickEnemyAction(actor, state);
    const actionLogs = resolveSkill(actor, skill, targets, state);
    // Prepend turn effects to the first log entry
    if (actionLogs.length > 0 && turnEffects.length > 0) {
      actionLogs[0].effects = [...turnEffects, ...actionLogs[0].effects];
    }
    logs.push(...actionLogs);

    checkBattleEnd(state);
  }

  return logs;
}

// ---------------------------------------------------------------------------
// Reward calculation and application
// ---------------------------------------------------------------------------

function calculateRewards(state: BattleState): BattleRewards {
  const { region: regionId, floor: floorNum, difficulty } = state.floor;
  const isBoss = floorNum === 10;
  const diffMult = DIFFICULTY_REWARD_MULT[difficulty];
  const bossMult = isBoss ? 3 : 1;

  // Pokeballs: base scales with region and floor
  const pokeballBase = 2 + regionId + Math.floor(floorNum / 3);
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

  // Award pokeballs
  db.prepare(
    'UPDATE players SET pokeballs = pokeballs + ? WHERE id = ?'
  ).run(pokeballs, state.playerId);

  // Advance story progress
  const player = db.prepare('SELECT story_progress FROM players WHERE id = ?').get(state.playerId) as any;
  if (player) {
    const storyProgress: StoryProgress = JSON.parse(player.story_progress);
    advanceStoryProgress(storyProgress, regionId, floorNum, difficulty);
    db.prepare('UPDATE players SET story_progress = ? WHERE id = ?')
      .run(JSON.stringify(storyProgress), state.playerId);
  }

  return { pokeballs, xpPerMon, levelUps };
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

  if (floor < 10) {
    progress[regionId] = floor + 1;
  } else {
    // Beat the boss — mark region complete
    progress[regionId] = 11;
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
    .every(rId => progress[rId] === 11);

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

  // Check stun
  if (isStunned(actor)) {
    logs.push({
      turn: state.turnNumber,
      actorId: actor.instanceId,
      actorName: template.name,
      skillUsed: '',
      skillName: 'Stunned',
      targetId: actor.instanceId,
      targetName: template.name,
      damage: 0,
      isCrit: false,
      effectiveness: 1,
      effects: [`${template.name} is stunned and cannot act!`, ...turnEffects],
    });
    // Tick cooldowns even when stunned
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
