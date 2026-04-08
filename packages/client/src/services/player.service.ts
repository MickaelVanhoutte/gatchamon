import type { Player, StoryProgress, TrainerSkills } from '@gatchamon/shared';
import {
  defaultTrainerSkills,
  trainerXpToNextLevel,
  getMaxEnergy,
  MAX_TRAINER_LEVEL,
  TRAINER_SKILL_MAX,
  BEGINNER_BONUS,
  isBeginnerBonusActive,
} from '@gatchamon/shared';
import { loadPlayer, savePlayer } from './storage';

const DEFAULT_STORY_PROGRESS: StoryProgress = { normal: { 1: 1 }, hard: {}, hell: {} };
const STARTING_REGULAR_POKEBALLS = 50;
const STARTING_PREMIUM_POKEBALLS = 10;
const STARTING_ENERGY = 100;
const STARTING_STARDUST = 0;
const STARTING_POKEDOLLARS = 10000;

export function createPlayer(name: string): Player {
  const player: Player = {
    id: crypto.randomUUID(),
    name,
    regularPokeballs: STARTING_REGULAR_POKEBALLS,
    premiumPokeballs: STARTING_PREMIUM_POKEBALLS,
    energy: STARTING_ENERGY,
    stardust: STARTING_STARDUST,
    pokedollars: STARTING_POKEDOLLARS,
    storyProgress: structuredClone(DEFAULT_STORY_PROGRESS),
    materials: {},
    createdAt: new Date().toISOString(),
    lastEnergyUpdate: new Date().toISOString(),
    trainerLevel: 1,
    trainerExp: 0,
    trainerSkillPoints: 0,
    trainerSkills: defaultTrainerSkills(),
    legendaryPokeballs: 0,
    glowingPokeballs: 0,
    towerProgress: 0,
    premiumPityCounter: 0,
    mysteryPieces: {},
    arenaElo: 1000,
    arenaCoins: 0,
  };
  savePlayer(player);
  return player;
}

export function getPlayer(): Player | null {
  return loadPlayer();
}

export function updatePlayer(updates: Partial<Player>): Player {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');
  const updated = { ...player, ...updates };
  savePlayer(updated);
  return updated;
}

export function earnStardust(amount: number): Player {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');
  player.stardust = (player.stardust ?? 0) + amount;
  savePlayer(player);
  return player;
}

export function spendStardust(amount: number): Player {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');
  if ((player.stardust ?? 0) < amount) throw new Error('Not enough stardust');
  player.stardust = (player.stardust ?? 0) - amount;
  savePlayer(player);
  return player;
}

export function earnPokedollars(amount: number): Player {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');
  player.pokedollars = (player.pokedollars ?? 0) + amount;
  savePlayer(player);
  return player;
}

export function spendPokedollars(amount: number): Player {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');
  if ((player.pokedollars ?? 0) < amount) throw new Error('Not enough pokedollars');
  player.pokedollars = (player.pokedollars ?? 0) - amount;
  savePlayer(player);
  return player;
}

// ── Trainer Level ───────────────────────────────────────────────────────

export interface TrainerXpResult {
  leveledUp: boolean;
  newLevel: number;
  levelsGained: number;
}

export function grantTrainerXp(amount: number): TrainerXpResult {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');

  // Apply XP bonus from trainer skills + beginner bonus
  const beginnerMult = isBeginnerBonusActive(player.createdAt) ? BEGINNER_BONUS.xpMult : 1;
  const bonusMult = (1 + player.trainerSkills.xpBonus * 0.1) * beginnerMult;
  let xpToAdd = Math.floor(amount * bonusMult);

  const startLevel = player.trainerLevel;
  player.trainerExp += xpToAdd;

  while (
    player.trainerLevel < MAX_TRAINER_LEVEL &&
    player.trainerExp >= trainerXpToNextLevel(player.trainerLevel)
  ) {
    player.trainerExp -= trainerXpToNextLevel(player.trainerLevel);
    player.trainerLevel++;
    player.trainerSkillPoints++;
    // Restore energy on level up
    player.energy = getMaxEnergy(player.trainerSkills);
  }

  // Cap XP at max level
  if (player.trainerLevel >= MAX_TRAINER_LEVEL) {
    player.trainerExp = 0;
  }

  savePlayer(player);
  return {
    leveledUp: player.trainerLevel > startLevel,
    newLevel: player.trainerLevel,
    levelsGained: player.trainerLevel - startLevel,
  };
}

export function allocateTrainerSkill(skill: keyof TrainerSkills): void {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');
  if (player.trainerSkillPoints <= 0) throw new Error('No skill points available');
  const max = TRAINER_SKILL_MAX[skill];
  if (player.trainerSkills[skill] >= max) throw new Error('Skill already at max level');

  player.trainerSkillPoints--;
  player.trainerSkills[skill]++;
  savePlayer(player);
}
