import type { BaseStats } from './pokemon.js';
import type { Difficulty } from './player.js';

export interface BattleMon {
  instanceId: string;
  templateId: number;
  isPlayerOwned: boolean;
  currentHp: number;
  maxHp: number;
  stats: BaseStats;
  skillCooldowns: Record<string, number>;
  buffs: ActiveEffect[];
  debuffs: ActiveEffect[];
  isAlive: boolean;
  actionGauge: number;
}

export interface ActiveEffect {
  type: string;
  stat?: keyof BaseStats;
  value: number;
  remainingTurns: number;
}

export interface BattleState {
  battleId: string;
  playerId: string;
  playerTeam: BattleMon[];
  enemyTeam: BattleMon[];
  currentActorId: string | null;
  turnNumber: number;
  status: 'active' | 'victory' | 'defeat';
  log: BattleLogEntry[];
  floor: { region: number; floor: number; difficulty: Difficulty };
  mode: 'story' | 'dungeon' | 'item-dungeon';
  dungeonId?: number;
}

export interface BattleLogEntry {
  turn: number;
  actorId: string;
  actorName: string;
  skillUsed: string;
  skillName: string;
  targetId: string;
  targetName: string;
  damage: number;
  isCrit: boolean;
  effectiveness: number;
  effects: string[];
}

export interface BattleAction {
  actorInstanceId: string;
  skillId: string;
  targetInstanceId: string;
}

export interface BattleRewards {
  pokeballs: number;
  xpPerMon: number;
  levelUps: Array<{ instanceId: string; newLevel: number }>;
  essences?: Record<string, number>;
  isFirstClear?: boolean;
  monsterLoot?: { templateId: number; stars: 1 | 2 | 3; instanceId: string };
  stardust?: number;
  itemDrops?: Array<{ itemId: string; setId: string; stars: number; grade: string }>;
  trainerXpGained?: number;
  trainerLeveledUp?: boolean;
  trainerNewLevel?: number;
}

export interface BattleResult {
  state: BattleState;
  rewards?: BattleRewards;
}
