import { getTemplate as getTemplateShared, getDungeon, xpToNextLevel, MAX_LEVEL_BY_STARS, isMaxLevel, getTowerFloor, DITTO_TEMPLATE_ID, getCurrentTowerResetDate, BEGINNER_BONUS, isBeginnerBonusActive } from '@gatchamon/shared';
import type { BattleState, BattleRewards } from '@gatchamon/shared';
import type { DungeonRewards, DungeonDef } from '@gatchamon/shared';
import type { PokemonInstance } from '@gatchamon/shared';
import { loadPlayer, savePlayer, loadCollection, updateInstance, addToCollection } from './storage';
import { trackStat, incrementMission, checkAndUpdateTrophies } from './reward.service';
import { grantTrainerXp } from './player.service';

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

export function calculateDungeonRewards(state: BattleState): DungeonRewards & BattleRewards {
  const dungeonDef = getDungeon(state.dungeonId!);
  if (!dungeonDef) throw new Error('Dungeon not found');

  const floorIndex = (state.floor.floor - 1);
  const player = loadPlayer();
  const beginner = player ? isBeginnerBonusActive(player.createdAt) : false;
  const essencesRaw = rollDungeonDrops(dungeonDef, floorIndex);
  // Apply beginner bonus to essence quantities
  const essences: Record<string, number> = {};
  for (const [essId, qty] of Object.entries(essencesRaw)) {
    essences[essId] = beginner ? Math.floor(qty * BEGINNER_BONUS.essenceMult) : qty;
  }

  // XP based on floor enemy level
  const floor = dungeonDef.floors[floorIndex];
  const xpMult = beginner ? BEGINNER_BONUS.xpMult : 1;
  const xpPerMon = Math.floor(floor.enemyLevel * 8 * xpMult);

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
  const dungeonPlayer = loadPlayer()!;
  const materials = { ...(dungeonPlayer.materials ?? {}) };
  for (const [essId, qty] of Object.entries(essences)) {
    materials[essId] = (materials[essId] ?? 0) + qty;
  }
  savePlayer({ ...dungeonPlayer, materials });

  return { essences, xpPerMon, regularPokeballs: 0, premiumPokeballs: 0, levelUps };
}

// ---------------------------------------------------------------------------
// Battle Tower Rewards
// ---------------------------------------------------------------------------

export function calculateTowerRewards(state: BattleState): BattleRewards {
  const towerFloor = state.floor.floor;
  const floorDef = getTowerFloor(towerFloor);
  if (!floorDef) throw new Error('Invalid tower floor');

  const towerPlayer = loadPlayer();
  const beginnerTower = towerPlayer ? isBeginnerBonusActive(towerPlayer.createdAt) : false;
  const xpPerMon = Math.floor(floorDef.enemyLevel * 8 * (beginnerTower ? BEGINNER_BONUS.xpMult : 1));
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

  // Apply reward to player (beginner bonus on stardust & essences)
  const towerRewardPlayer = loadPlayer()!;
  const updates: Partial<typeof towerRewardPlayer> = {};
  if (reward.regularPokeballs) updates.regularPokeballs = towerRewardPlayer.regularPokeballs + reward.regularPokeballs;
  if (reward.premiumPokeballs) updates.premiumPokeballs = towerRewardPlayer.premiumPokeballs + reward.premiumPokeballs;
  if (reward.legendaryPokeballs) updates.legendaryPokeballs = (towerRewardPlayer.legendaryPokeballs ?? 0) + reward.legendaryPokeballs;
  const towerStardustMult = beginnerTower ? BEGINNER_BONUS.stardustMult : 1;
  if (reward.stardust) updates.stardust = (towerRewardPlayer.stardust ?? 0) + Math.floor(reward.stardust * towerStardustMult);
  if (reward.essences) {
    const materials = { ...(towerRewardPlayer.materials ?? {}) };
    const towerEssenceMult = beginnerTower ? BEGINNER_BONUS.essenceMult : 1;
    for (const [essId, qty] of Object.entries(reward.essences)) {
      materials[essId] = (materials[essId] ?? 0) + Math.floor(qty * towerEssenceMult);
    }
    updates.materials = materials;
  }

  // Advance tower progress
  if ((towerRewardPlayer.towerProgress ?? 0) < towerFloor) {
    updates.towerProgress = towerFloor;
    // Set reset date if not set yet
    if (!towerRewardPlayer.towerResetDate) {
      updates.towerResetDate = getCurrentTowerResetDate();
    }
  }

  savePlayer({ ...towerRewardPlayer, ...updates });

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
