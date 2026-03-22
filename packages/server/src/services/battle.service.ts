import { v4 as uuidv4 } from 'uuid';
import { POKEDEX, computeStats, calculateDamage, xpToNextLevel } from '@gatchamon/shared';
import { SKILLS, getSkillsForPokemon } from '@gatchamon/shared';
import type {
  BattleState,
  BattleMon,
  BattleLogEntry,
  BattleAction,
  BattleRewards,
  BattleResult,
} from '@gatchamon/shared';
import type { PokemonInstance, PokemonTemplate, SkillDefinition, BaseStats } from '@gatchamon/shared';
import { getDb } from '../db/schema.js';

// ---------------------------------------------------------------------------
// In-memory battle store
// ---------------------------------------------------------------------------
const activeBattles = new Map<string, BattleState>();

// ---------------------------------------------------------------------------
// Floor definitions — Level 1, 10 floors
// ---------------------------------------------------------------------------
interface FloorEnemy {
  templateId: number;
  level: number;
  stars: 1 | 2 | 3;
}

interface FloorDef {
  enemies: FloorEnemy[];
  isBoss: boolean;
}

// Pick a few common 1-star templateIds for floor enemies
const COMMON_IDS = [16, 19, 21, 41, 74, 129, 13, 10, 69, 43];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildFloorEnemies(floor: number): FloorDef {
  if (floor === 10) {
    // Boss floor — single strong enemy
    return {
      enemies: [{ templateId: pickRandom(COMMON_IDS), level: 5, stars: 3 as const }],
      isBoss: true,
    };
  }
  // Normal floors: 3 enemies, levels scale slightly with floor
  const level = Math.min(3, 1 + Math.floor((floor - 1) / 3));
  return {
    enemies: [
      { templateId: pickRandom(COMMON_IDS), level, stars: 1 as const },
      { templateId: pickRandom(COMMON_IDS), level, stars: 1 as const },
      { templateId: pickRandom(COMMON_IDS), level, stars: 1 as const },
    ],
    isBoss: false,
  };
}

export const FLOOR_DEFINITIONS: Record<number, FloorDef> = {};
for (let f = 1; f <= 10; f++) {
  FLOOR_DEFINITIONS[f] = buildFloorEnemies(f);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTemplate(templateId: number): PokemonTemplate {
  const t = POKEDEX.find(p => p.id === templateId);
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
          // Actually, buffs in skill effects on offensive skills buff the attacker
          // But if the effect is in the skill definition, apply buff to actor
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
  const skills = getSkillsForPokemon(template.skillIds);

  // Pick highest-numbered available skill (prefer skill3 > skill2 > skill1)
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
  const isBoss = state.floor.floor === 10;
  const pokeballs = isBoss ? 10 : 3;
  const xpPerMon = state.floor.floor * 10;

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
    const progress = JSON.parse(player.story_progress);
    if (state.floor.floor >= progress.floor && state.floor.floor < 10) {
      progress.floor = state.floor.floor + 1;
      db.prepare('UPDATE players SET story_progress = ? WHERE id = ?')
        .run(JSON.stringify(progress), state.playerId);
    }
  }

  return { pokeballs, xpPerMon, levelUps };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function startBattle(
  playerId: string,
  teamInstanceIds: string[],
  floor: { level: number; floor: number },
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

  // Build enemy team from floor definition
  const floorDef = FLOOR_DEFINITIONS[floor.floor];
  if (!floorDef) throw new Error(`Floor ${floor.floor} not found`);

  const enemyTeam: BattleMon[] = floorDef.enemies.map(e => {
    const id = `enemy_${uuidv4()}`;
    return makeBattleMon(id, e.templateId, e.level, e.stars, false);
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
  };

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
