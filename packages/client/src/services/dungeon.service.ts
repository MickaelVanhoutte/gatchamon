import { getTemplate as getTemplateShared, computeStats, getDungeon, xpToNextLevel, MAX_LEVEL_BY_STARS, isMaxLevel, getTowerFloor, DITTO_TEMPLATE_ID, getCurrentTowerResetDate } from '@gatchamon/shared';
import { getSkillsForPokemon } from '@gatchamon/shared';
import type { BattleState, BattleMon, BattleAction, BattleResult, BattleRewards } from '@gatchamon/shared';
import type { DungeonRewards, DungeonDef } from '@gatchamon/shared';
import type { PokemonTemplate, PokemonInstance } from '@gatchamon/shared';
import { loadPlayer, savePlayer, loadCollection, updateInstance, addToCollection } from './storage';
import { trackStat, incrementMission, checkAndUpdateTrophies } from './reward.service';
import { grantTrainerXp } from './player.service';

const activeBattles = new Map<string, BattleState>();

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
  for (const sk of skills) cooldowns[sk.id] = 0;

  return {
    instanceId, templateId, isPlayerOwned,
    currentHp: stats.hp, maxHp: stats.hp, stats,
    skillCooldowns: cooldowns,
    buffs: [], debuffs: [],
    isAlive: true, actionGauge: 0,
  };
}

function generateDungeonEnemies(dungeonDef: DungeonDef, floorIndex: number): BattleMon[] {
  const floor = dungeonDef.floors[floorIndex];
  if (!floor) throw new Error(`Invalid floor ${floorIndex}`);

  const isLastFloor = floorIndex === dungeonDef.floors.length - 1;
  const bossIndex = Math.floor(floor.enemies.length / 2);

  const enemies: BattleMon[] = [];
  for (let i = 0; i < floor.enemies.length; i++) {
    const templateId = floor.enemies[i];
    const template = getTemplate(templateId);
    const id = `dungeon_enemy_${crypto.randomUUID()}`;
    const stars = template.naturalStars;
    const mon = makeBattleMon(id, templateId, floor.enemyLevel, stars, false);
    if (isLastFloor && i === bossIndex) mon.isBoss = true;
    enemies.push(mon);
  }
  return enemies;
}

function rollDungeonDrops(dungeonDef: DungeonDef, floorIndex: number): Record<string, number> {
  const floor = dungeonDef.floors[floorIndex];
  const drops: Record<string, number> = {};

  for (const drop of floor.drops) {
    if (Math.random() > drop.chance) continue;
    const [min, max] = drop.quantity;
    const qty = min + Math.floor(Math.random() * (max - min + 1));
    if (qty > 0) {
      drops[drop.essenceId] = (drops[drop.essenceId] ?? 0) + qty;
    }
  }

  return drops;
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

  // Check energy
  if (player.energy < dungeonDef.energyCost) {
    throw new Error('Not enough energy');
  }

  // Deduct energy
  savePlayer({ ...player, energy: player.energy - dungeonDef.energyCost });

  const collection = loadCollection();
  const playerTeam: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const inst = collection.find(p => p.instanceId === instId && p.ownerId === player.id);
    if (!inst) throw new Error(`Pokemon instance ${instId} not found`);
    playerTeam.push(makeBattleMon(inst.instanceId, inst.templateId, inst.level, inst.stars, true));
  }

  if (playerTeam.length === 0) throw new Error('Team cannot be empty');

  const enemyTeam = generateDungeonEnemies(dungeonDef, floorIndex);

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

  // Use the same battle engine - import the resolution functions
  // For dungeons, we store the battle and let the existing battle flow handle it
  activeBattles.set(battleId, state);

  return { state };
}

export function calculateDungeonRewards(state: BattleState): DungeonRewards & BattleRewards {
  const dungeonDef = getDungeon(state.dungeonId!);
  if (!dungeonDef) throw new Error('Dungeon not found');

  const floorIndex = (state.floor.floor - 1);
  const essences = rollDungeonDrops(dungeonDef, floorIndex);

  // XP based on floor enemy level
  const floor = dungeonDef.floors[floorIndex];
  const xpPerMon = Math.floor(floor.enemyLevel * 8);

  // Apply XP
  const levelUps: Array<{ instanceId: string; newLevel: number }> = [];
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

  // Add essences to player inventory
  const player = loadPlayer()!;
  const materials = { ...(player.materials ?? {}) };
  for (const [essId, qty] of Object.entries(essences)) {
    materials[essId] = (materials[essId] ?? 0) + qty;
  }
  savePlayer({ ...player, materials });

  return { essences, xpPerMon, regularPokeballs: 0, premiumPokeballs: 0, levelUps };
}

export function getDungeonBattle(battleId: string): BattleState | null {
  return activeBattles.get(battleId) ?? null;
}

export function removeDungeonBattle(battleId: string): void {
  activeBattles.delete(battleId);
}

// ---------------------------------------------------------------------------
// Battle Tower
// ---------------------------------------------------------------------------

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

  const collection = loadCollection();
  const playerTeam: BattleMon[] = [];
  for (const instId of teamInstanceIds) {
    const inst = collection.find(p => p.instanceId === instId && p.ownerId === player.id);
    if (!inst) throw new Error(`Pokemon instance ${instId} not found`);
    playerTeam.push(makeBattleMon(inst.instanceId, inst.templateId, inst.level, inst.stars, true));
  }

  if (playerTeam.length === 0) throw new Error('Team cannot be empty');

  // Build enemy team from tower floor def
  const enemyTeam: BattleMon[] = [];
  for (let i = 0; i < floorDef.enemyCount; i++) {
    const templateId = floorDef.enemyPool[i % floorDef.enemyPool.length];
    const id = `tower_enemy_${crypto.randomUUID()}`;
    const mon = makeBattleMon(id, templateId, floorDef.enemyLevel, floorDef.enemyStars, false);
    if (towerFloor % 10 === 0 && i === Math.floor(floorDef.enemyCount / 2)) {
      mon.isBoss = true;
    }
    enemyTeam.push(mon);
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
    floor: { region: 0, floor: towerFloor, difficulty: 'normal' },
    mode: 'tower',
  };

  activeBattles.set(battleId, state);

  return { state };
}

export function calculateTowerRewards(state: BattleState): BattleRewards {
  const towerFloor = state.floor.floor;
  const floorDef = getTowerFloor(towerFloor);
  if (!floorDef) throw new Error('Invalid tower floor');

  const xpPerMon = Math.floor(floorDef.enemyLevel * 8);
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

  const reward = floorDef.reward;

  // Apply reward to player
  const player = loadPlayer()!;
  const updates: Partial<typeof player> = {};
  if (reward.regularPokeballs) updates.regularPokeballs = player.regularPokeballs + reward.regularPokeballs;
  if (reward.premiumPokeballs) updates.premiumPokeballs = player.premiumPokeballs + reward.premiumPokeballs;
  if (reward.legendaryPokeballs) updates.legendaryPokeballs = (player.legendaryPokeballs ?? 0) + reward.legendaryPokeballs;
  if (reward.stardust) updates.stardust = (player.stardust ?? 0) + reward.stardust;
  if (reward.essences) {
    const materials = { ...(player.materials ?? {}) };
    for (const [essId, qty] of Object.entries(reward.essences)) {
      materials[essId] = (materials[essId] ?? 0) + qty;
    }
    updates.materials = materials;
  }

  // Advance tower progress
  if ((player.towerProgress ?? 0) < towerFloor) {
    updates.towerProgress = towerFloor;
    // Set reset date if not set yet
    if (!player.towerResetDate) {
      updates.towerResetDate = getCurrentTowerResetDate();
    }
  }

  savePlayer({ ...player, ...updates });

  // Ditto reward — create Ditto instances
  if (reward.dittos && reward.dittos > 0) {
    const p = loadPlayer()!;
    const dittoTemplate = getTemplateShared(DITTO_TEMPLATE_ID);
    if (dittoTemplate) {
      const instances: PokemonInstance[] = [];
      for (let i = 0; i < reward.dittos; i++) {
        instances.push({
          instanceId: crypto.randomUUID(),
          templateId: DITTO_TEMPLATE_ID,
          ownerId: p.id,
          level: 1,
          stars: dittoTemplate.naturalStars,
          exp: 0,
          isShiny: false,
          skillLevels: [1, 1, 1],
        });
      }
      addToCollection(instances);
      trackStat('totalMonstersCollected', reward.dittos);
    }
  }

  // Track stats
  trackStat('totalBattlesDungeon', 1);
  incrementMission('battle_dungeon', 1);
  if (towerFloor % 10 === 0) {
    trackStat('totalBossesDefeated', 1);
    incrementMission('clear_boss', 1);
  }
  checkAndUpdateTrophies();

  // Trainer XP
  const trainerXpBase = towerFloor * 3 + 10;
  const trainerResult = grantTrainerXp(trainerXpBase);

  return {
    regularPokeballs: reward.regularPokeballs ?? 0,
    premiumPokeballs: reward.premiumPokeballs ?? 0,
    legendaryPokeballs: reward.legendaryPokeballs ?? 0,
    xpPerMon,
    levelUps,
    essences: reward.essences,
    stardust: reward.stardust ?? 0,
    trainerXpGained: trainerXpBase,
    trainerLeveledUp: trainerResult.leveledUp,
    trainerNewLevel: trainerResult.newLevel,
  };
}
