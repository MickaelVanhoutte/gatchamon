import { getTemplate as getTemplateShared, computeStats, getDungeon, xpToNextLevel, MAX_LEVEL_BY_STARS, isMaxLevel } from '@gatchamon/shared';
import { getSkillsForPokemon } from '@gatchamon/shared';
import type { BattleState, BattleMon, BattleAction, BattleResult, BattleRewards } from '@gatchamon/shared';
import type { DungeonRewards, DungeonDef } from '@gatchamon/shared';
import type { PokemonTemplate } from '@gatchamon/shared';
import { loadPlayer, savePlayer, loadCollection, updateInstance } from './storage';

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

  const enemies: BattleMon[] = [];
  for (const templateId of floor.enemies) {
    const template = getTemplate(templateId);
    const id = `dungeon_enemy_${crypto.randomUUID()}`;
    const stars = template.naturalStars;
    enemies.push(makeBattleMon(id, templateId, floor.enemyLevel, stars, false));
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

  return { essences, xpPerMon, pokeballs: 0, levelUps };
}

export function getDungeonBattle(battleId: string): BattleState | null {
  return activeBattles.get(battleId) ?? null;
}

export function removeDungeonBattle(battleId: string): void {
  activeBattles.delete(battleId);
}
