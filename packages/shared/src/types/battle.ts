import type { BaseStats, EffectId } from './pokemon.js';
import type { Difficulty } from './player.js';

export interface ActiveEffect {
  id: EffectId;               // e.g., 'atk_buff', 'poison', 'shield'
  type: 'buff' | 'debuff';   // For cleanse/strip targeting
  value: number;              // Magnitude (shield HP remaining, 1 for unique effects)
  remainingTurns: number;     // Countdown, 999 = permanent (legacy passives)
  sourceId?: string;          // Who applied it (for provoke targeting)
}

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
  hpThresholdTriggered?: boolean;
  isBoss?: boolean;
  skillLevels?: [number, number, number];
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
  mode: 'story' | 'dungeon' | 'item-dungeon' | 'tower' | 'mystery-dungeon';
  dungeonId?: number;
  mysteryDateKey?: string;  // "YYYY-MM-DD" for mystery dungeon reward lookup
  recap?: Record<string, { hpHealed: number }>;
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
  isGlancing?: boolean;
  shieldAbsorbed?: number;
  reflected?: number;
  endured?: boolean;
  resisted?: boolean;
}

export interface BattleAction {
  actorInstanceId: string;
  skillId: string;
  targetInstanceId: string;
}

export interface BattleRewards {
  regularPokeballs: number;
  premiumPokeballs: number;
  legendaryPokeballs?: number;
  xpPerMon: number;
  levelUps: Array<{ instanceId: string; newLevel: number }>;
  essences?: Record<string, number>;
  isFirstClear?: boolean;
  monsterLoot?: { templateId: number; stars: 1 | 2 | 3; instanceId: string };
  stardust?: number;
  pokedollars?: number;
  itemDrops?: Array<{ itemId: string; setId: string; stars: number; grade: string }>;
  trainerXpGained?: number;
  trainerLeveledUp?: boolean;
  trainerNewLevel?: number;
  mysteryPieces?: { templateId: number; count: number };
}

export interface BattleResult {
  state: BattleState;
  rewards?: BattleRewards;
}

// Re-export for convenience — set effects from held items
export type { ActiveSetEffect } from './held-item.js';
