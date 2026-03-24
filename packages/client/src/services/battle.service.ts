import { POKEDEX, computeStats, computeStatsWithItems, getActiveSetEffects, calculateDamage, xpToNextLevel, MAX_LEVEL_BY_STARS, isMaxLevel } from '@gatchamon/shared';
import { SKILLS, getSkillsForPokemon } from '@gatchamon/shared';
import { TOTAL_REGIONS } from '@gatchamon/shared';
import type {
  BattleState,
  BattleMon,
  BattleLogEntry,
  BattleAction,
  BattleRewards,
  BattleResult,
  Difficulty,
  ActiveSetEffect,
} from '@gatchamon/shared';
import type { PokemonTemplate, SkillDefinition, BaseStats, StoryProgress } from '@gatchamon/shared';
import { loadPlayer, savePlayer, loadCollection, updateInstance, getItemsForPokemon } from './storage';
import { buildFloorEnemies, DIFFICULTY_REWARD_MULT } from './floor.service';
import { getDungeon, getItemDungeon as getItemDungeonImport } from '@gatchamon/shared';
import {
  isFirstClear,
  markFirstClear,
  rollMonsterLoot,
  trackStat,
  incrementMission,
  checkAndUpdateTrophies,
} from './reward.service';
import { rollItemDrop } from './rune.service';
import { addHeldItem } from './storage';

// Map instanceId → active set effects for proc handling in battle
const battleSetEffects = new Map<string, ActiveSetEffect[]>();

// ---------------------------------------------------------------------------
// In-memory battle store
// ---------------------------------------------------------------------------
const activeBattles = new Map<string, BattleState>();

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

  // For player pokemon, apply held item bonuses
  let stats: BaseStats;
  if (isPlayerOwned) {
    const equippedItems = getItemsForPokemon(instanceId);
    stats = computeStatsWithItems(template, level, stars, equippedItems);
    // Store set effects for proc handling during battle
    const setEffects = getActiveSetEffects(equippedItems);
    battleSetEffects.set(instanceId, setEffects);
  } else {
    stats = computeStats(template, level, stars);
  }

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

function advanceToNextActor(state: BattleState): string {
  const allMons = [...state.playerTeam, ...state.enemyTeam].filter(m => m.isAlive);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    for (const mon of allMons) {
      const effectiveStats = getEffectiveStats(mon);
      mon.actionGauge += effectiveStats.spd;
    }
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

  // Leftovers: heal_per_turn proc
  const setEffects = battleSetEffects.get(mon.instanceId);
  if (setEffects) {
    for (const eff of setEffects) {
      if (eff.procEffect === 'heal_per_turn' && eff.procChance != null && eff.procValue != null) {
        if (Math.random() < eff.procChance) {
          const healAmt = Math.floor(mon.maxHp * eff.procValue / 100);
          const oldHp = mon.currentHp;
          mon.currentHp = Math.min(mon.maxHp, mon.currentHp + healAmt);
          const healed = mon.currentHp - oldHp;
          if (healed > 0) {
            effects.push(`${template.name} recovered ${healed} HP from Leftovers`);
          }
        }
      }
    }
  }

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
      if (skill.multiplier > 0) {
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
          const buffTarget = actor; // buffs always go on the caster
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

  // Tick all cooldowns for this actor
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

  let chosenSkill: SkillDefinition | null = null;
  for (let i = skills.length - 1; i >= 0; i--) {
    const sk = skills[i];
    if ((actor.skillCooldowns[sk.id] ?? 0) <= 0) {
      chosenSkill = sk;
      break;
    }
  }
  if (!chosenSkill) {
    chosenSkill = skills[0];
  }

  let targets: BattleMon[];
  if (chosenSkill.target === 'self') {
    targets = [actor];
  } else if (chosenSkill.target === 'single_ally' || chosenSkill.target === 'all_allies') {
    targets = chosenSkill.target === 'all_allies'
      ? state.enemyTeam.filter(m => m.isAlive)
      : [actor];
  } else if (chosenSkill.target === 'all_enemies') {
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

    const turnEffects = processStartOfTurn(actor, state);
    if (!actor.isAlive) {
      checkBattleEnd(state);
      continue;
    }

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
      for (const skId of Object.keys(actor.skillCooldowns)) {
        if (actor.skillCooldowns[skId] > 0) {
          actor.skillCooldowns[skId]--;
        }
      }
      checkBattleEnd(state);
      continue;
    }

    const { skill, targets } = pickEnemyAction(actor, state);
    const actionLogs = resolveSkill(actor, skill, targets, state);
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

function calculateDungeonRewards(state: BattleState): BattleRewards {
  const dungeonDef = getDungeon(state.dungeonId!);
  if (!dungeonDef) throw new Error('Dungeon not found');

  const floorIndex = state.floor.floor - 1;
  const floor = dungeonDef.floors[floorIndex];

  // Roll material drops
  const essences: Record<string, number> = {};
  for (const drop of floor.drops) {
    if (Math.random() > drop.chance) continue;
    const [min, max] = drop.quantity;
    const qty = min + Math.floor(Math.random() * (max - min + 1));
    if (qty > 0) {
      essences[drop.essenceId] = (essences[drop.essenceId] ?? 0) + qty;
    }
  }

  const xpPerMon = Math.floor(floor.enemyLevel * 8);
  const levelUps: Array<{ instanceId: string; newLevel: number }> = [];

  // Apply XP
  const collection = loadCollection();
  for (const mon of state.playerTeam) {
    const inst = collection.find(p => p.instanceId === mon.instanceId);
    if (!inst) continue;

    if (isMaxLevel(inst.level, inst.stars)) continue;
    const maxLevel = MAX_LEVEL_BY_STARS[inst.stars] ?? 99;
    let currentLevel = inst.level;
    let currentExp = inst.exp + xpPerMon;
    let needed = xpToNextLevel(currentLevel);

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

    updateInstance(mon.instanceId, { level: currentLevel, exp: currentExp });
  }

  // Stardust reward for dungeon
  const stardustReward = 20 + floor.enemyLevel * 2;

  // Add essences and stardust to player inventory
  const player = loadPlayer()!;
  const materials = { ...(player.materials ?? {}) };
  for (const [essId, qty] of Object.entries(essences)) {
    materials[essId] = (materials[essId] ?? 0) + qty;
  }
  savePlayer({ ...player, materials, stardust: (player.stardust ?? 0) + stardustReward });

  // Track stats & missions
  trackStat('totalBattlesDungeon', 1);
  incrementMission('battle_dungeon', 1);
  checkAndUpdateTrophies();

  return { pokeballs: 0, xpPerMon, levelUps, essences, stardust: stardustReward };
}

function calculateItemDungeonRewards(state: BattleState): BattleRewards {
  const dungeonDef = getItemDungeonImport(state.dungeonId!);
  if (!dungeonDef) throw new Error('Item dungeon not found');

  const floorIndex = state.floor.floor - 1;
  const floor = dungeonDef.floors[floorIndex];

  const xpPerMon = Math.floor(floor.enemyLevel * 8);
  const levelUps: Array<{ instanceId: string; newLevel: number }> = [];

  // Apply XP
  const collection = loadCollection();
  for (const mon of state.playerTeam) {
    const inst = collection.find(p => p.instanceId === mon.instanceId);
    if (!inst) continue;
    if (isMaxLevel(inst.level, inst.stars)) continue;
    const maxLevel = MAX_LEVEL_BY_STARS[inst.stars] ?? 99;
    let currentLevel = inst.level;
    let currentExp = inst.exp + xpPerMon;
    let needed = xpToNextLevel(currentLevel);
    while (currentExp >= needed && currentLevel < maxLevel) {
      currentExp -= needed;
      currentLevel++;
      needed = xpToNextLevel(currentLevel);
      levelUps.push({ instanceId: mon.instanceId, newLevel: currentLevel });
    }
    if (currentLevel >= maxLevel) { currentLevel = maxLevel; currentExp = 0; }
    updateInstance(mon.instanceId, { level: currentLevel, exp: currentExp });
  }

  // Roll item drops (1-2 items per clear)
  const player = loadPlayer()!;
  const itemDrops: Array<{ itemId: string; setId: string; stars: number; grade: string }> = [];
  const numDrops = Math.random() < 0.3 ? 2 : 1;
  for (let i = 0; i < numDrops; i++) {
    const dropDef = floor.drops[Math.floor(Math.random() * floor.drops.length)];
    const item = rollItemDrop(dropDef, player.id);
    addHeldItem(item);
    itemDrops.push({ itemId: item.itemId, setId: item.setId, stars: item.stars, grade: item.grade });
  }

  // Stardust
  const [minSd, maxSd] = floor.stardustReward;
  const stardustReward = minSd + Math.floor(Math.random() * (maxSd - minSd + 1));
  savePlayer({ ...player, stardust: (player.stardust ?? 0) + stardustReward });

  // Track stats
  trackStat('totalBattlesDungeon', 1);
  incrementMission('battle_dungeon', 1);
  checkAndUpdateTrophies();

  return { pokeballs: 0, xpPerMon, levelUps, stardust: stardustReward, itemDrops };
}

function calculateRewards(state: BattleState): BattleRewards {
  if (state.mode === 'item-dungeon') {
    return calculateItemDungeonRewards(state);
  }
  if (state.mode === 'dungeon') {
    return calculateDungeonRewards(state);
  }

  const { region: regionId, floor: floorNum, difficulty } = state.floor;
  const isBoss = floorNum === 10;
  const diffMult = DIFFICULTY_REWARD_MULT[difficulty];
  const bossMult = isBoss ? 3 : 1;

  // Pokeballs
  const pokeballBase = 2 + regionId + Math.floor(floorNum / 3);
  const pokeballs = Math.floor(pokeballBase * diffMult * bossMult);

  // XP
  const xpBase = regionId * 10 + floorNum * 5;
  const xpBossMult = isBoss ? 2 : 1;
  const xpPerMon = Math.floor(xpBase * diffMult * xpBossMult);

  const levelUps: Array<{ instanceId: string; newLevel: number }> = [];

  // Apply XP to each alive player mon via localStorage
  const collection = loadCollection();
  for (const mon of state.playerTeam) {
    const inst = collection.find(p => p.instanceId === mon.instanceId);
    if (!inst) continue;

    const maxLevel = MAX_LEVEL_BY_STARS[inst.stars] ?? 99;

    // Skip XP if already at max level
    if (isMaxLevel(inst.level, inst.stars)) continue;

    let currentLevel = inst.level;
    let currentExp = inst.exp + xpPerMon;

    let needed = xpToNextLevel(currentLevel);
    while (currentExp >= needed && currentLevel < maxLevel) {
      currentExp -= needed;
      currentLevel++;
      needed = xpToNextLevel(currentLevel);
      levelUps.push({ instanceId: mon.instanceId, newLevel: currentLevel });
    }

    // Cap at max level
    if (currentLevel >= maxLevel) {
      currentLevel = maxLevel;
      currentExp = 0;
    }

    updateInstance(mon.instanceId, { level: currentLevel, exp: currentExp });
  }

  // First-clear: only award pokeballs on first completion
  const firstClear = isFirstClear(regionId, floorNum, difficulty);
  const actualPokeballs = firstClear ? pokeballs : 0;

  // Stardust reward
  const stardustBase = 10 + regionId * 5 + floorNum * 2;
  const stardustReward = firstClear
    ? Math.floor(stardustBase * diffMult * bossMult * 3)
    : Math.floor(stardustBase * diffMult);

  {
    const player = loadPlayer()!;
    const updates: Partial<typeof player> = { stardust: (player.stardust ?? 0) + stardustReward };
    if (actualPokeballs > 0) {
      updates.pokeballs = player.pokeballs + actualPokeballs;
    }
    savePlayer({ ...player, ...updates });
  }

  if (firstClear) {
    markFirstClear(regionId, floorNum, difficulty);
  }

  // Advance story progress
  const updatedPlayer = loadPlayer()!;
  const storyProgress = updatedPlayer.storyProgress;
  advanceStoryProgress(storyProgress, regionId, floorNum, difficulty);
  savePlayer({ ...updatedPlayer, storyProgress });

  // Monster loot roll
  const floorDef = buildFloorEnemies(regionId, floorNum, difficulty);
  const monsterLoot = rollMonsterLoot(floorDef.enemies, difficulty);

  // Track stats & missions
  trackStat('totalBattlesStory', 1);
  incrementMission('battle_story', 1);
  if (isBoss) {
    trackStat('totalBossesDefeated', 1);
    incrementMission('clear_boss', 1);
  }
  checkAndUpdateTrophies();

  return {
    pokeballs: actualPokeballs,
    xpPerMon,
    levelUps,
    isFirstClear: firstClear,
    monsterLoot: monsterLoot ?? undefined,
    stardust: stardustReward,
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

  if (floor !== currentFloor) return;

  if (floor < 10) {
    progress[regionId] = floor + 1;
  } else {
    progress[regionId] = 11;
    if (regionId < TOTAL_REGIONS && !progress[regionId + 1]) {
      progress[regionId + 1] = 1;
    }
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
  teamInstanceIds: string[],
  floor: { region: number; floor: number; difficulty: Difficulty },
): BattleResult {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');

  const collection = loadCollection();

  // Load player team from localStorage
  const playerTeam: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const inst = collection.find(p => p.instanceId === instId && p.ownerId === player.id);
    if (!inst) throw new Error(`Pokemon instance ${instId} not found or not owned by player`);
    playerTeam.push(makeBattleMon(inst.instanceId, inst.templateId, inst.level, inst.stars, true));
  }

  if (playerTeam.length === 0) throw new Error('Team cannot be empty');

  // Build enemy team from region floor definition
  const floorDef = buildFloorEnemies(floor.region, floor.floor, floor.difficulty);

  const enemyTeam: BattleMon[] = floorDef.enemies.map(e => {
    const id = `enemy_${crypto.randomUUID()}`;
    return makeBattleMon(id, e.templateId, e.level, e.stars, false);
  });

  const battleId = crypto.randomUUID();
  const state: BattleState = {
    battleId,
    playerId: player.id,
    playerTeam,
    enemyTeam,
    currentActorId: null,
    turnNumber: 0,
    status: 'active',
    log: [],
    floor,
    mode: 'story',
  };

  // Determine first actor
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
    result.rewards = calculateRewards(state);
  }

  return result;
}

export function startDungeonBattle(
  teamInstanceIds: string[],
  dungeonId: number,
  floorIndex: number,
): BattleResult {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');

  const dungeonDef = getDungeon(dungeonId);
  if (!dungeonDef) throw new Error('Dungeon not found');

  if (player.energy < dungeonDef.energyCost) {
    throw new Error('Not enough energy');
  }

  // Deduct energy
  savePlayer({ ...player, energy: player.energy - dungeonDef.energyCost });
  trackStat('totalEnergySpent', dungeonDef.energyCost);
  incrementMission('spend_energy', dungeonDef.energyCost);

  const collection = loadCollection();
  const playerTeam: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const inst = collection.find(p => p.instanceId === instId && p.ownerId === player.id);
    if (!inst) throw new Error(`Pokemon instance ${instId} not found`);
    playerTeam.push(makeBattleMon(inst.instanceId, inst.templateId, inst.level, inst.stars, true));
  }

  if (playerTeam.length === 0) throw new Error('Team cannot be empty');

  // Build enemy team from dungeon definition
  const floor = dungeonDef.floors[floorIndex];
  if (!floor) throw new Error(`Invalid dungeon floor ${floorIndex}`);

  const enemyTeam: BattleMon[] = [];
  for (const templateId of floor.enemies) {
    const template = getTemplate(templateId);
    const id = `dungeon_enemy_${crypto.randomUUID()}`;
    enemyTeam.push(makeBattleMon(id, templateId, floor.enemyLevel, template.naturalStars, false));
  }

  const battleId = crypto.randomUUID();
  const state: BattleState = {
    battleId,
    playerId: player.id,
    playerTeam,
    enemyTeam,
    currentActorId: null,
    turnNumber: 0,
    status: 'active',
    log: [],
    floor: { region: 0, floor: floorIndex + 1, difficulty: 'normal' },
    mode: 'dungeon',
    dungeonId,
  };

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
    result.rewards = calculateRewards(state);
  }

  return result;
}

export function startItemDungeonBattle(
  teamInstanceIds: string[],
  dungeonId: number,
  floorIndex: number,
): BattleResult {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');

  const dungeonDef = getItemDungeonImport(dungeonId);
  if (!dungeonDef) throw new Error('Item dungeon not found');

  if (player.energy < dungeonDef.energyCost) {
    throw new Error('Not enough energy');
  }

  // Deduct energy
  savePlayer({ ...player, energy: player.energy - dungeonDef.energyCost });
  trackStat('totalEnergySpent', dungeonDef.energyCost);
  incrementMission('spend_energy', dungeonDef.energyCost);

  const collection = loadCollection();
  const playerTeam: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const inst = collection.find(p => p.instanceId === instId && p.ownerId === player.id);
    if (!inst) throw new Error(`Pokemon instance ${instId} not found`);
    playerTeam.push(makeBattleMon(inst.instanceId, inst.templateId, inst.level, inst.stars, true));
  }

  if (playerTeam.length === 0) throw new Error('Team cannot be empty');

  const floor = dungeonDef.floors[floorIndex];
  if (!floor) throw new Error(`Invalid dungeon floor ${floorIndex}`);

  const enemyTeam: BattleMon[] = [];
  for (const templateId of floor.enemies) {
    const template = getTemplate(templateId);
    const id = `item_dungeon_enemy_${crypto.randomUUID()}`;
    enemyTeam.push(makeBattleMon(id, templateId, floor.enemyLevel, template.naturalStars, false));
  }

  const battleId = crypto.randomUUID();
  const state: BattleState = {
    battleId,
    playerId: player.id,
    playerTeam,
    enemyTeam,
    currentActorId: null,
    turnNumber: 0,
    status: 'active',
    log: [],
    floor: { region: 0, floor: floorIndex + 1, difficulty: 'normal' },
    mode: 'item-dungeon',
    dungeonId,
  };

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
    result.rewards = calculateRewards(state);
  }

  return result;
}

export function resolvePlayerAction(battleId: string, action: BattleAction): BattleResult {
  const state = activeBattles.get(battleId);
  if (!state) throw new Error('Battle not found');
  if (state.status !== 'active') throw new Error('Battle is already over');

  if (state.currentActorId !== action.actorInstanceId) {
    throw new Error('Not this monster\'s turn');
  }

  const actor = state.playerTeam.find(m => m.instanceId === action.actorInstanceId);
  if (!actor || !actor.isAlive) throw new Error('Actor is dead or not found');

  const template = getTemplate(actor.templateId);
  const skills = getSkillsForPokemon(template.skillIds);
  const skill = skills.find(s => s.id === action.skillId);
  if (!skill) throw new Error('Skill not found for this pokemon');

  if ((actor.skillCooldowns[skill.id] ?? 0) > 0) {
    throw new Error(`Skill ${skill.name} is on cooldown (${actor.skillCooldowns[skill.id]} turns remaining)`);
  }

  state.turnNumber++;

  const turnEffects = processStartOfTurn(actor, state);
  const logs: BattleLogEntry[] = [];

  if (!actor.isAlive) {
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

  // Proc set effects: stun_on_hit and extra_turn
  const actorSetEffects = battleSetEffects.get(actor.instanceId);
  if (actorSetEffects && actor.isAlive && skill.target !== 'self' && skill.target !== 'single_ally' && skill.target !== 'all_allies') {
    for (const eff of actorSetEffects) {
      // Razor Fang: stun on hit
      if (eff.procEffect === 'stun_on_hit' && eff.procChance != null) {
        for (const target of targets) {
          if (target.isAlive && Math.random() < eff.procChance) {
            target.debuffs.push({ type: 'stun', value: 0, remainingTurns: eff.procValue ?? 1 });
            const lastLog = logs[logs.length - 1];
            if (lastLog) lastLog.effects.push(`${getTemplate(target.templateId).name} was stunned by Razor Fang!`);
          }
        }
      }
      // King's Rock: extra turn
      if (eff.procEffect === 'extra_turn' && eff.procChance != null) {
        if (Math.random() < eff.procChance) {
          actor.actionGauge = 1000; // Grant immediate extra turn
          const lastLog = logs[logs.length - 1];
          if (lastLog) lastLog.effects.push(`${template.name} gains an extra turn from King's Rock!`);
        }
      }
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
