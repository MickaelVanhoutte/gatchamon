import { getTemplate as getTemplateShared, computeStats, computeStatsWithItems, getActiveSetEffects, xpToNextLevel, MAX_LEVEL_BY_STARS, isMaxLevel, BEGINNER_BONUS, isBeginnerBonusActive, getTowerFloor, STORY_ENERGY_COST } from '@gatchamon/shared';
import { getSkillsForPokemon, SKILLS } from '@gatchamon/shared';
import { TOTAL_REGIONS, getFloorCount } from '@gatchamon/shared';
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
  hasBuff,
  hasDebuff,
} from '@gatchamon/shared';
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
  refreshRegionStats,
} from './reward.service';
import { grantTrainerXp } from './player.service';
import { rollItemDrop, generateItem } from './held-item.service';
import { addHeldItem } from './storage';
import { useTutorialStore } from '../stores/tutorialStore';
import { calculateTowerRewards as calculateTowerRewardsImported } from './dungeon.service';

// Map instanceId → active set effects for proc handling in battle
const battleSetEffects = new Map<string, ActiveSetEffect[]>();

// ---------------------------------------------------------------------------
// In-memory battle store
// ---------------------------------------------------------------------------
const activeBattles = new Map<string, BattleState>();
const precomputedRewards = new Map<string, BattleRewards>();

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
): BattleMon {
  const template = getTemplate(templateId);

  // For player pokemon, apply held item bonuses + trainer skill bonuses
  let stats: BaseStats;
  if (isPlayerOwned) {
    const equippedItems = getItemsForPokemon(instanceId);
    stats = computeStatsWithItems(template, level, stars, equippedItems);
    // Store set effects for proc handling during battle
    const setEffects = getActiveSetEffects(equippedItems);
    battleSetEffects.set(instanceId, setEffects);
    // Apply trainer global stat bonuses
    const player = loadPlayer();
    if (player?.trainerSkills) {
      const sk = player.trainerSkills;
      stats = {
        ...stats,
        atk: Math.floor(stats.atk * (1 + sk.globalAtkBonus * 0.02)),
        def: Math.floor(stats.def * (1 + sk.globalDefBonus * 0.02)),
        hp: Math.floor(stats.hp * (1 + sk.globalHpBonus * 0.02)),
        spd: Math.floor(stats.spd * (1 + sk.globalSpdBonus * 0.02)),
      };
    }
  } else {
    stats = computeStats(template, level, stars);
  }

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

// ---------------------------------------------------------------------------
// Reward calculation and application
// ---------------------------------------------------------------------------

function calculateDungeonRewards(state: BattleState): BattleRewards {
  const dungeonDef = getDungeon(state.dungeonId!);
  if (!dungeonDef) throw new Error('Dungeon not found');

  const floorIndex = state.floor.floor - 1;
  const floor = dungeonDef.floors[floorIndex];

  // Trainer skill bonuses
  const trainerPlayer = loadPlayer();
  const tSkills = trainerPlayer?.trainerSkills;
  const beginner = trainerPlayer ? isBeginnerBonusActive(trainerPlayer.createdAt) : false;
  const pokedollarMult = (tSkills ? 1 + tSkills.pokedollarBonus * 0.1 : 1) * (beginner ? BEGINNER_BONUS.pokedollarMult : 1);
  const xpMult = (tSkills ? 1 + tSkills.xpBonus * 0.1 : 1) * (beginner ? BEGINNER_BONUS.xpMult : 1);
  const essenceMult = (tSkills ? 1 + tSkills.essenceBonus * 0.1 : 1) * (beginner ? BEGINNER_BONUS.essenceMult : 1);

  // Roll material drops
  const essences: Record<string, number> = {};
  for (const drop of floor.drops) {
    if (Math.random() > drop.chance) continue;
    const [min, max] = drop.quantity;
    const qty = Math.floor((min + Math.floor(Math.random() * (max - min + 1))) * essenceMult);
    if (qty > 0) {
      essences[drop.essenceId] = (essences[drop.essenceId] ?? 0) + qty;
    }
  }

  const xpPerMon = Math.floor(floor.enemyLevel * 8 * xpMult);
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

  // Pokedollar reward for dungeon
  const pokedollarReward = Math.floor((20 + floor.enemyLevel * 2) * pokedollarMult);

  // Add essences and pokedollars to player inventory
  const player = loadPlayer()!;
  const materials = { ...(player.materials ?? {}) };
  for (const [essId, qty] of Object.entries(essences)) {
    materials[essId] = (materials[essId] ?? 0) + qty;
  }
  savePlayer({ ...player, materials, pokedollars: (player.pokedollars ?? 0) + pokedollarReward });

  // Track stats & missions
  trackStat('totalBattlesDungeon', 1);
  incrementMission('battle_dungeon', 1);
  checkAndUpdateTrophies();

  // Trainer XP
  const trainerXpBase = (floorIndex + 1) * 8 + 10;
  const trainerResult = grantTrainerXp(trainerXpBase);

  return {
    regularPokeballs: 0, premiumPokeballs: 0, xpPerMon, levelUps, essences, pokedollars: pokedollarReward,
    trainerXpGained: trainerXpBase,
    trainerLeveledUp: trainerResult.leveledUp,
    trainerNewLevel: trainerResult.newLevel,
  };
}

function calculateItemDungeonRewards(state: BattleState): BattleRewards {
  const dungeonDef = getItemDungeonImport(state.dungeonId!);
  if (!dungeonDef) throw new Error('Item dungeon not found');

  const floorIndex = state.floor.floor - 1;
  const floor = dungeonDef.floors[floorIndex];

  // Trainer skill bonuses
  const trainerPlayer = loadPlayer();
  const tSkills = trainerPlayer?.trainerSkills;
  const beginnerItem = trainerPlayer ? isBeginnerBonusActive(trainerPlayer.createdAt) : false;
  const pokedollarMult = (tSkills ? 1 + tSkills.pokedollarBonus * 0.1 : 1) * (beginnerItem ? BEGINNER_BONUS.pokedollarMult : 1);
  const xpMult = (tSkills ? 1 + tSkills.xpBonus * 0.1 : 1) * (beginnerItem ? BEGINNER_BONUS.xpMult : 1);

  const xpPerMon = Math.floor(floor.enemyLevel * 8 * xpMult);
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

  // Roll item drops (1-2 items per clear, beginner bonus increases chance of extra drop)
  const player = loadPlayer()!;
  const itemDrops: Array<{ itemId: string; setId: string; stars: number; grade: string }> = [];
  const extraDropChance = beginnerItem ? 0.3 + BEGINNER_BONUS.itemDropBonusChance : 0.3;
  const numDrops = Math.random() < extraDropChance ? 2 : 1;
  for (let i = 0; i < numDrops; i++) {
    const dropDef = floor.drops[Math.floor(Math.random() * floor.drops.length)];
    const item = rollItemDrop(dropDef, player.id);
    addHeldItem(item);
    itemDrops.push({ itemId: item.itemId, setId: item.setId, stars: item.stars, grade: item.grade });
  }

  // Pokedollars
  const [minPd, maxPd] = floor.pokedollarReward;
  const pokedollarReward = Math.floor((minPd + Math.floor(Math.random() * (maxPd - minPd + 1))) * pokedollarMult);
  let stardustReward = 0;
  // Rare stardust drop on high-level floors
  if (floor.stardustDrop && Math.random() < floor.stardustDrop.chance) {
    const { min, max } = floor.stardustDrop;
    stardustReward = min + Math.floor(Math.random() * (max - min + 1));
  }
  savePlayer({
    ...player,
    pokedollars: (player.pokedollars ?? 0) + pokedollarReward,
    stardust: (player.stardust ?? 0) + stardustReward,
  });

  // Track stats
  trackStat('totalBattlesDungeon', 1);
  incrementMission('battle_dungeon', 1);
  checkAndUpdateTrophies();

  // Trainer XP
  const trainerXpBase = (floorIndex + 1) * 8 + 10;
  const trainerResult = grantTrainerXp(trainerXpBase);

  return {
    regularPokeballs: 0, premiumPokeballs: 0, xpPerMon, levelUps, pokedollars: pokedollarReward, stardust: stardustReward || undefined, itemDrops,
    trainerXpGained: trainerXpBase,
    trainerLeveledUp: trainerResult.leveledUp,
    trainerNewLevel: trainerResult.newLevel,
  };
}

function calculateRewards(state: BattleState): BattleRewards {
  if (state.mode === 'item-dungeon') {
    return calculateItemDungeonRewards(state);
  }
  if (state.mode === 'dungeon') {
    return calculateDungeonRewards(state);
  }
  if (state.mode === 'tower') {
    return calculateTowerRewardsImported(state);
  }

  const { region: regionId, floor: floorNum, difficulty } = state.floor;
  const isBoss = regionId === 10 || floorNum === getFloorCount(regionId);
  const diffMult = DIFFICULTY_REWARD_MULT[difficulty];
  const bossMult = isBoss ? 3 : 1;

  // Load player for trainer skill bonuses
  const trainerPlayer = loadPlayer();
  const tSkills = trainerPlayer?.trainerSkills;
  const beginnerStory = trainerPlayer ? isBeginnerBonusActive(trainerPlayer.createdAt) : false;
  const pokeballMult = tSkills ? 1 + tSkills.pokeballBonus * 0.1 : 1;
  const pokedollarMult = (tSkills ? 1 + tSkills.pokedollarBonus * 0.1 : 1) * (beginnerStory ? BEGINNER_BONUS.pokedollarMult : 1);
  const xpMult = (tSkills ? 1 + tSkills.xpBonus * 0.1 : 1) * (beginnerStory ? BEGINNER_BONUS.xpMult : 1);

  const pokeballBase = 1 + Math.floor(regionId / 2) + Math.floor(floorNum / 4);
  const pokeballs = Math.floor(pokeballBase * diffMult * bossMult * pokeballMult);

  const xpBase = regionId * 10 + floorNum * 5;
  const xpBossMult = isBoss ? 2 : 1;
  const xpPerMon = Math.floor(xpBase * diffMult * xpBossMult * xpMult);

  const levelUps: Array<{ instanceId: string; newLevel: number }> = [];

  const collection = loadCollection();
  for (const mon of state.playerTeam) {
    const inst = collection.find(p => p.instanceId === mon.instanceId);
    if (!inst) continue;

    const maxLevel = MAX_LEVEL_BY_STARS[inst.stars] ?? 99;
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

    if (currentLevel >= maxLevel) {
      currentLevel = maxLevel;
      currentExp = 0;
    }

    updateInstance(mon.instanceId, { level: currentLevel, exp: currentExp });
  }

  const firstClear = isFirstClear(regionId, floorNum, difficulty);
  const firstClearPokeballs = firstClear ? Math.floor(pokeballs * 0.5) : 0;

  const randomRegularDrop = Math.random() < 0.2 ? Math.floor(1 + regionId / 4) : 0;
  const totalRegularPokeballs = firstClearPokeballs + randomRegularDrop;

  const premiumPokeballs = (isBoss && firstClear) ? 1 : 0;

  const pokedollarBase = 10 + regionId * 5 + floorNum * 2;
  const pokedollarReward = firstClear
    ? Math.floor(pokedollarBase * diffMult * bossMult * 3 * pokedollarMult)
    : Math.floor(pokedollarBase * diffMult * pokedollarMult);

  {
    const player = loadPlayer()!;
    const updates: Partial<typeof player> = { pokedollars: (player.pokedollars ?? 0) + pokedollarReward };
    if (totalRegularPokeballs > 0) {
      updates.regularPokeballs = player.regularPokeballs + totalRegularPokeballs;
    }
    if (premiumPokeballs > 0) {
      updates.premiumPokeballs = player.premiumPokeballs + premiumPokeballs;
    }
    savePlayer({ ...player, ...updates });
  }

  let legendaryReward = 0;
  if (firstClear && regionId === 10 && floorNum === getFloorCount(10)) {
    legendaryReward = 1;
    const lp = loadPlayer()!;
    savePlayer({ ...lp, legendaryPokeballs: (lp.legendaryPokeballs ?? 0) + 1 });
  }

  if (firstClear) {
    markFirstClear(regionId, floorNum, difficulty);
  }

  const updatedPlayer = loadPlayer()!;
  const storyProgress = updatedPlayer.storyProgress;
  advanceStoryProgress(storyProgress, regionId, floorNum, difficulty);
  savePlayer({ ...updatedPlayer, storyProgress });
  refreshRegionStats();

  const floorDef = buildFloorEnemies(regionId, floorNum, difficulty);
  const monsterLoot = rollMonsterLoot(floorDef.enemies, difficulty);

  trackStat('totalBattlesStory', 1);
  incrementMission('battle_story', 1);
  if (isBoss) {
    trackStat('totalBossesDefeated', 1);
    incrementMission('clear_boss', 1);
  }
  checkAndUpdateTrophies();

  // Tutorial: guarantee a held item drop on the first story battle
  const tutorialStep = useTutorialStore.getState().step;
  const itemDrops: Array<{ itemId: string; setId: string; stars: number; grade: string }> = [];
  let tutorialPokedollarBonus = 0;
  if (tutorialStep === 11 && regionId === 1 && floorNum === 1) {
    const tutorialPlayer = loadPlayer()!;
    const item = generateItem('power_band', 1, 1, 'common', tutorialPlayer.id);
    addHeldItem(item);
    itemDrops.push({ itemId: item.itemId, setId: item.setId, stars: item.stars, grade: item.grade });
    // Grant bonus pokedollars so the player can afford the tutorial upgrade (500 cost)
    tutorialPokedollarBonus = 1000;
    savePlayer({ ...loadPlayer()!, pokedollars: (loadPlayer()!.pokedollars ?? 0) + tutorialPokedollarBonus });
  }

  const trainerXpBase = regionId * 5 + floorNum * 2;
  const trainerResult = grantTrainerXp(trainerXpBase);

  return {
    regularPokeballs: totalRegularPokeballs,
    premiumPokeballs,
    legendaryPokeballs: legendaryReward || undefined,
    xpPerMon,
    levelUps,
    isFirstClear: firstClear,
    monsterLoot: monsterLoot ?? undefined,
    pokedollars: pokedollarReward + tutorialPokedollarBonus,
    itemDrops: itemDrops.length > 0 ? itemDrops : undefined,
    trainerXpGained: trainerXpBase,
    trainerLeveledUp: trainerResult.leveledUp,
    trainerNewLevel: trainerResult.newLevel,
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

  const floorCount = getFloorCount(regionId);
  if (floor < floorCount) {
    progress[regionId] = floor + 1;
  } else {
    progress[regionId] = floorCount + 1;
    if (regionId < TOTAL_REGIONS && !progress[regionId + 1]) {
      progress[regionId + 1] = 1;
    }
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
// Battle initialization helpers (shared between start functions)
// ---------------------------------------------------------------------------

function initBattle(
  playerTeam: BattleMon[],
  enemyTeam: BattleMon[],
  floor: BattleState['floor'],
  mode: BattleState['mode'],
  playerId: string,
  dungeonId?: number,
): BattleResult {
  const battleId = crypto.randomUUID();
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
    dungeonId,
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
  if (state.status === 'victory') {
    result.rewards = calculateRewards(state);
    precomputedRewards.set(battleId, result.rewards);
  }

  return result;
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

  if (player.energy < STORY_ENERGY_COST) {
    throw new Error('Not enough energy');
  }

  savePlayer({ ...player, energy: player.energy - STORY_ENERGY_COST });
  trackStat('totalEnergySpent', STORY_ENERGY_COST);
  incrementMission('spend_energy', STORY_ENERGY_COST);

  const collection = loadCollection();

  const playerTeam: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const inst = collection.find(p => p.instanceId === instId && p.ownerId === player.id);
    if (!inst) throw new Error(`Pokemon instance ${instId} not found or not owned by player`);
    playerTeam.push(makeBattleMon(inst.instanceId, inst.templateId, inst.level, inst.stars, true, inst.skillLevels));
  }

  if (playerTeam.length === 0) throw new Error('Team cannot be empty');

  const floorDef = buildFloorEnemies(floor.region, floor.floor, floor.difficulty);

  // Speed bonus scales with region and difficulty to simulate held item speed
  const diffSpeedBase = floor.difficulty === 'hell' ? 40 : floor.difficulty === 'hard' ? 20 : 0;
  const diffSpeedPerRegion = floor.difficulty === 'hell' ? 4.5 : floor.difficulty === 'hard' ? 3.5 : 2.5;
  const storySpeedBonus = Math.floor(diffSpeedBase + (floor.region - 1) * diffSpeedPerRegion);

  const enemyTeam: BattleMon[] = floorDef.enemies.map(e => {
    const id = `enemy_${crypto.randomUUID()}`;
    const mon = makeBattleMon(id, e.templateId, e.level, e.stars, false);
    if (storySpeedBonus > 0) {
      mon.stats.spd += storySpeedBonus;
    }
    if (e.isBoss) mon.isBoss = true;
    return mon;
  });

  return initBattle(playerTeam, enemyTeam, floor, 'story', player.id);
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

  savePlayer({ ...player, energy: player.energy - dungeonDef.energyCost });
  trackStat('totalEnergySpent', dungeonDef.energyCost);
  incrementMission('spend_energy', dungeonDef.energyCost);

  const collection = loadCollection();
  const playerTeam: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const inst = collection.find(p => p.instanceId === instId && p.ownerId === player.id);
    if (!inst) throw new Error(`Pokemon instance ${instId} not found`);
    playerTeam.push(makeBattleMon(inst.instanceId, inst.templateId, inst.level, inst.stars, true, inst.skillLevels));
  }

  if (playerTeam.length === 0) throw new Error('Team cannot be empty');

  const floor = dungeonDef.floors[floorIndex];
  if (!floor) throw new Error(`Invalid dungeon floor ${floorIndex}`);

  const isLastFloor = floorIndex === dungeonDef.floors.length - 1;
  const bossIndex = Math.floor(floor.enemies.length / 2);

  const enemyTeam: BattleMon[] = [];
  for (let i = 0; i < floor.enemies.length; i++) {
    const templateId = floor.enemies[i];
    const template = getTemplate(templateId);
    const id = `dungeon_enemy_${crypto.randomUUID()}`;
    const stars = floor.enemyStars ?? template.naturalStars;
    const mon = makeBattleMon(id, templateId, floor.enemyLevel, stars, false);
    if (floor.statBoost) {
      mon.stats.hp = Math.floor(mon.stats.hp * floor.statBoost);
      mon.stats.atk = Math.floor(mon.stats.atk * floor.statBoost);
      mon.stats.def = Math.floor(mon.stats.def * floor.statBoost);
      mon.maxHp = mon.stats.hp;
      mon.currentHp = mon.stats.hp;
    }
    // Speed bonus scales with floor depth — essence dungeons cap at 60
    const dungeonSpeedBonus = floor.speedBonus ?? (floorIndex <= 1 ? 0 : Math.floor((floorIndex - 1) * (60 / 8)));
    if (dungeonSpeedBonus > 0) {
      mon.stats.spd += dungeonSpeedBonus;
    }
    if (isLastFloor && i === bossIndex) mon.isBoss = true;
    enemyTeam.push(mon);
  }

  return initBattle(playerTeam, enemyTeam, { region: 0, floor: floorIndex + 1, difficulty: 'normal' }, 'dungeon', player.id, dungeonId);
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

  savePlayer({ ...player, energy: player.energy - dungeonDef.energyCost });
  trackStat('totalEnergySpent', dungeonDef.energyCost);
  incrementMission('spend_energy', dungeonDef.energyCost);

  const collection = loadCollection();
  const playerTeam: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const inst = collection.find(p => p.instanceId === instId && p.ownerId === player.id);
    if (!inst) throw new Error(`Pokemon instance ${instId} not found`);
    playerTeam.push(makeBattleMon(inst.instanceId, inst.templateId, inst.level, inst.stars, true, inst.skillLevels));
  }

  if (playerTeam.length === 0) throw new Error('Team cannot be empty');

  const floor = dungeonDef.floors[floorIndex];
  if (!floor) throw new Error(`Invalid dungeon floor ${floorIndex}`);

  const isLastFloor = floorIndex === dungeonDef.floors.length - 1;
  const bossIndex = Math.floor(floor.enemies.length / 2);

  const enemyTeam: BattleMon[] = [];
  for (let i = 0; i < floor.enemies.length; i++) {
    const templateId = floor.enemies[i];
    const template = getTemplate(templateId);
    const id = `item_dungeon_enemy_${crypto.randomUUID()}`;
    const stars = floor.enemyStars ?? template.naturalStars;
    const mon = makeBattleMon(id, templateId, floor.enemyLevel, stars, false);
    if (floor.statBoost) {
      mon.stats.hp = Math.floor(mon.stats.hp * floor.statBoost);
      mon.stats.atk = Math.floor(mon.stats.atk * floor.statBoost);
      mon.stats.def = Math.floor(mon.stats.def * floor.statBoost);
      mon.maxHp = mon.stats.hp;
      mon.currentHp = mon.stats.hp;
    }
    // Speed bonus scales with floor depth (0→0, 9→100)
    const itemDungeonSpeedBonus = floor.speedBonus ?? (floorIndex <= 1 ? 0 : Math.floor((floorIndex - 1) * (100 / 8)));
    if (itemDungeonSpeedBonus > 0) {
      mon.stats.spd += itemDungeonSpeedBonus;
    }
    if (isLastFloor && i === bossIndex) mon.isBoss = true;
    enemyTeam.push(mon);
  }

  return initBattle(playerTeam, enemyTeam, { region: 0, floor: floorIndex + 1, difficulty: 'normal' }, 'item-dungeon', player.id, dungeonId);
}

export function startTowerBattle(
  teamInstanceIds: string[],
  towerFloor: number,
): BattleResult {
  const player = loadPlayer();
  if (!player) throw new Error('Player not found');

  const currentProgress = player.towerProgress ?? 0;
  if (towerFloor !== currentProgress + 1) {
    throw new Error('Must clear floors in order');
  }

  const floorDef = getTowerFloor(towerFloor);
  if (!floorDef) throw new Error('Invalid tower floor');

  if (player.energy < floorDef.energyCost) {
    throw new Error('Not enough energy');
  }

  savePlayer({ ...player, energy: player.energy - floorDef.energyCost });
  trackStat('totalEnergySpent', floorDef.energyCost);
  incrementMission('spend_energy', floorDef.energyCost);

  const collection = loadCollection();
  const playerTeam: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const inst = collection.find(p => p.instanceId === instId && p.ownerId === player.id);
    if (!inst) throw new Error(`Pokemon instance ${instId} not found`);
    playerTeam.push(makeBattleMon(inst.instanceId, inst.templateId, inst.level, inst.stars, true, inst.skillLevels));
  }

  if (playerTeam.length === 0) throw new Error('Team cannot be empty');

  // Build enemy team from tower floor def
  const enemyTeam: BattleMon[] = [];
  for (let i = 0; i < floorDef.enemyCount; i++) {
    const templateId = floorDef.enemyPool[i % floorDef.enemyPool.length];
    const id = `tower_enemy_${crypto.randomUUID()}`;
    const mon = makeBattleMon(id, templateId, floorDef.enemyLevel, floorDef.enemyStars, false);
    if (floorDef.statBoost) {
      mon.stats.hp = Math.floor(mon.stats.hp * floorDef.statBoost);
      mon.stats.atk = Math.floor(mon.stats.atk * floorDef.statBoost);
      mon.stats.def = Math.floor(mon.stats.def * floorDef.statBoost);
      mon.maxHp = mon.stats.hp;
      mon.currentHp = mon.stats.hp;
    }
    if (floorDef.speedBonus) {
      mon.stats.spd += floorDef.speedBonus;
    }
    if (towerFloor % 10 === 0 && i === Math.floor(floorDef.enemyCount / 2)) {
      mon.isBoss = true;
    }
    enemyTeam.push(mon);
  }

  return initBattle(playerTeam, enemyTeam, { region: 0, floor: towerFloor, difficulty: 'normal' }, 'tower', player.id);
}

export function resolvePlayerAction(battleId: string, action: BattleAction): BattleResult {
  const state = getBattleState(battleId);
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

  // Prevent infinite loops
  if (state.turnNumber > 500) {
    (state as any).status = 'defeat';
    activeBattles.set(battleId, state);
    return { state };
  }

  // Trigger turn_start passives
  const turnStartEffects = processPassiveTrigger('turn_start', actor, state);
  const turnEffects = processStartOfTurn(actor, state);
  const allTurnEffects = [...turnStartEffects, ...turnEffects];
  const logs: BattleLogEntry[] = [];

  // Proc heal_per_turn (Leftovers) at turn start
  const actorTurnEffects = battleSetEffects.get(actor.instanceId);
  if (actorTurnEffects && actor.isAlive) {
    for (const eff of actorTurnEffects) {
      if (eff.procEffect === 'heal_per_turn' && actor.currentHp < actor.maxHp) {
        const healAmt = Math.floor(actor.maxHp * (eff.procValue ?? 15) / 100);
        actor.currentHp = Math.min(actor.maxHp, actor.currentHp + healAmt);
        allTurnEffects.push(`${template.name} recovered ${healAmt} HP from Leftovers!`);
      }
    }
  }

  if (!actor.isAlive) {
    checkBattleEnd(state);
    if (state.status === 'active') {
      const enemyLogs = autoResolveEnemyTurns(state);
      logs.push(...enemyLogs);
    }
    state.log.push(...logs);
    activeBattles.set(battleId, state);
    const result: BattleResult = { state };
    if (getStatus(state) === 'victory') result.rewards = calculateRewards(state);
    return result;
  }

  // Check CC
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
    tickCooldowns(actor);
    checkBattleEnd(state);
    if (state.status === 'active') {
      const enemyLogs = autoResolveEnemyTurns(state);
      logs.push(...enemyLogs);
    }
    state.log.push(...logs);
    activeBattles.set(battleId, state);
    const result: BattleResult = { state };
    if (getStatus(state) === 'victory') result.rewards = calculateRewards(state);
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
    tickCooldowns(actor);
    checkBattleEnd(state);
    if (state.status === 'active') {
      const enemyLogs = autoResolveEnemyTurns(state);
      logs.push(...enemyLogs);
    }
    state.log.push(...logs);
    activeBattles.set(battleId, state);
    const result: BattleResult = { state };
    if (getStatus(state) === 'victory') result.rewards = calculateRewards(state);
    return result;
  }

  if (cc.type === 'cd_increase') {
    for (const skId of Object.keys(actor.skillCooldowns)) {
      const skillDef = SKILLS[skId];
      if (skillDef && skillDef.cooldown === 0) continue; // Never put basic attacks on cooldown
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
    tickCooldowns(actor);
    checkBattleEnd(state);
    if (state.status === 'active') {
      const enemyLogs = autoResolveEnemyTurns(state);
      logs.push(...enemyLogs);
    }
    state.log.push(...logs);
    activeBattles.set(battleId, state);
    const result: BattleResult = { state };
    if (getStatus(state) === 'victory') result.rewards = calculateRewards(state);
    return result;
  }

  // Determine actual skill (handle silence, provoke)
  let actualSkill = skill;
  if (cc.type === 'silence') {
    const basicSkill = skills.find(s => s.category === 'basic');
    if (basicSkill) actualSkill = basicSkill;
  }
  if (cc.type === 'provoke') {
    const basicSkill = skills.find(s => s.category === 'basic');
    if (basicSkill) actualSkill = basicSkill;
  }

  // Resolve the player's chosen skill
  let targets: BattleMon[];

  // Handle confusion redirect
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
      // Self/ally skills are unaffected by confusion
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

  if (state.status === 'active') {
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

function tickCooldowns(actor: BattleMon): void {
  for (const skId of Object.keys(actor.skillCooldowns)) {
    if (actor.skillCooldowns[skId] > 0) {
      actor.skillCooldowns[skId]--;
    }
  }
}

/** Read status dynamically (checkBattleEnd mutates via cast, TS narrowing doesn't track it) */
function getStatus(state: BattleState): BattleState['status'] {
  return state.status;
}

export function getBattleState(battleId: string): BattleState | null {
  return activeBattles.get(battleId) ?? null;
}

export function getStoredRewards(battleId: string): BattleRewards | undefined {
  return precomputedRewards.get(battleId);
}

export function deleteBattle(battleId: string): void {
  activeBattles.delete(battleId);
  precomputedRewards.delete(battleId);
}

// Re-export shared engine functions that the UI needs
export { getEffectiveStats, hasBuff, hasDebuff, getCCState } from '@gatchamon/shared';
