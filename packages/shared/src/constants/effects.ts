import type { EffectId, BaseStats } from '../types/pokemon.js';

// ---------------------------------------------------------------------------
// Effect metadata registry
// ---------------------------------------------------------------------------

export interface EffectMeta {
  category: 'buff' | 'debuff' | 'status' | 'instant';
  name: string;
  description: string;
  unique: boolean;        // If true, only one instance can exist (refreshes duration)
  maxStacks?: number;     // For stackable effects (poison, burn)
  statMod?: {             // Percentage-based stat modification
    stat: keyof BaseStats;
    percent: number;      // e.g., 50 for +50%, -70 for -70%
    perStack?: boolean;   // If true, percent is multiplied by stack count
  };
  dot?: {                 // Damage over time
    percentHp: number;    // % of max HP per turn
  };
  hot?: {                 // Heal over time
    percentHp: number;    // % of max HP per turn
  };
  cc?: 'stun' | 'conditional';  // Crowd control type
  icon: string;           // CSS class or emoji for UI
  color: string;          // Hex color for UI
}

export const EFFECT_REGISTRY: Record<EffectId, EffectMeta> = {
  // ── SW Buffs ─────────────────────────────────────────────────────────
  atk_buff: {
    category: 'buff', name: 'ATK Up', description: 'Attack increased by 50%',
    unique: true, statMod: { stat: 'atk', percent: 50 },
    icon: 'atk-up', color: '#ef4444',
  },
  def_buff: {
    category: 'buff', name: 'DEF Up', description: 'Defense increased by 70%',
    unique: true, statMod: { stat: 'def', percent: 70 },
    icon: 'def-up', color: '#3b82f6',
  },
  spd_buff: {
    category: 'buff', name: 'SPD Up', description: 'Speed increased by 30%',
    unique: true, statMod: { stat: 'spd', percent: 30 },
    icon: 'spd-up', color: '#f59e0b',
  },
  crit_rate_buff: {
    category: 'buff', name: 'Crit Rate Up', description: 'Critical rate increased by 30%',
    unique: true, statMod: { stat: 'critRate', percent: 30 },
    icon: 'crit-up', color: '#dc2626',
  },
  immunity: {
    category: 'buff', name: 'Immunity', description: 'Immune to all debuffs and status effects',
    unique: true, icon: 'immunity', color: '#fbbf24',
  },
  invincibility: {
    category: 'buff', name: 'Invincibility', description: 'Cannot take any damage',
    unique: true, icon: 'invincible', color: '#f9fafb',
  },
  endure: {
    category: 'buff', name: 'Endure', description: 'HP cannot drop below 1',
    unique: true, icon: 'endure', color: '#d97706',
  },
  shield: {
    category: 'buff', name: 'Shield', description: 'Absorbs incoming damage',
    unique: false, maxStacks: 5, icon: 'shield', color: '#60a5fa',
  },
  reflect: {
    category: 'buff', name: 'Reflect DMG', description: 'Returns 30% of damage taken to attacker',
    unique: true, icon: 'reflect', color: '#a78bfa',
  },
  counter: {
    category: 'buff', name: 'Counter', description: 'Counterattacks with basic attack when hit',
    unique: true, icon: 'counter', color: '#fb923c',
  },
  recovery: {
    category: 'buff', name: 'Recovery', description: 'Recovers 15% of max HP each turn',
    unique: true, hot: { percentHp: 15 }, icon: 'recovery', color: '#4ade80',
  },
  vampire: {
    category: 'buff', name: 'Vampire', description: 'Recovers 20% of damage dealt as HP',
    unique: true, icon: 'vampire', color: '#b91c1c',
  },

  // ── SW Debuffs ───────────────────────────────────────────────────────
  atk_break: {
    category: 'debuff', name: 'ATK Break', description: 'Attack decreased by 50%',
    unique: true, statMod: { stat: 'atk', percent: -50 },
    icon: 'atk-down', color: '#ef4444',
  },
  def_break: {
    category: 'debuff', name: 'DEF Break', description: 'Defense decreased by 70%',
    unique: true, statMod: { stat: 'def', percent: -70 },
    icon: 'def-down', color: '#3b82f6',
  },
  spd_slow: {
    category: 'debuff', name: 'SPD Slow', description: 'Speed decreased by 30%',
    unique: true, statMod: { stat: 'spd', percent: -30 },
    icon: 'spd-down', color: '#6366f1',
  },
  glancing: {
    category: 'debuff', name: 'Glancing Hit', description: '50% chance attacks deal 30% less damage, cannot crit, cannot apply debuffs',
    unique: true, icon: 'glancing', color: '#94a3b8',
  },
  brand: {
    category: 'debuff', name: 'Brand', description: 'Takes 25% more damage from all sources',
    unique: true, icon: 'brand', color: '#f43f5e',
  },
  unrecoverable: {
    category: 'debuff', name: 'Unrecoverable', description: 'Cannot be healed',
    unique: true, icon: 'unrecoverable', color: '#7c3aed',
  },
  silence: {
    category: 'debuff', name: 'Silence', description: 'Active skills are locked, can only use basic attack',
    unique: true, icon: 'silence', color: '#475569',
  },
  oblivion: {
    category: 'debuff', name: 'Oblivion', description: 'Passive skills are disabled',
    unique: true, icon: 'oblivion', color: '#1e293b',
  },
  buff_block: {
    category: 'debuff', name: 'Buff Block', description: 'Cannot receive beneficial effects',
    unique: true, icon: 'buff-block', color: '#334155',
  },
  provoke: {
    category: 'debuff', name: 'Provoke', description: 'Forced to attack the provoker with basic attack',
    unique: true, cc: 'conditional', icon: 'provoke', color: '#dc2626',
  },

  // ── Pokemon Status Effects ───────────────────────────────────────────
  poison: {
    category: 'status', name: 'Poison', description: 'Takes 5% max HP damage each turn (stackable)',
    unique: false, maxStacks: 10, dot: { percentHp: 5 },
    icon: 'poison', color: '#a855f7',
  },
  burn: {
    category: 'status', name: 'Burn', description: 'Takes 3% max HP damage each turn and ATK reduced by 3% per stack (stackable)',
    unique: false, maxStacks: 10,
    dot: { percentHp: 3 },
    statMod: { stat: 'atk', percent: -3, perStack: true },
    icon: 'burn', color: '#f97316',
  },
  freeze: {
    category: 'status', name: 'Freeze', description: 'Cannot act (frozen solid)',
    unique: true, cc: 'stun', icon: 'freeze', color: '#67e8f9',
  },
  paralysis: {
    category: 'status', name: 'Paralysis', description: '50% chance to skip turn, 50% chance to increase all cooldowns by 1',
    unique: true, cc: 'conditional', icon: 'paralysis', color: '#facc15',
  },
  confusion: {
    category: 'status', name: 'Confusion', description: '50% chance to attack a random ally instead',
    unique: true, cc: 'conditional', icon: 'confusion', color: '#f472b6',
  },
  sleep: {
    category: 'status', name: 'Sleep', description: 'Cannot act but recovers 10% max HP per turn',
    unique: true, cc: 'stun', hot: { percentHp: 10 },
    icon: 'sleep', color: '#818cf8',
  },

  // ── Instant Effects ──────────────────────────────────────────────────
  heal: {
    category: 'instant', name: 'Heal', description: 'Restores HP',
    unique: true, icon: 'heal', color: '#22c55e',
  },
  atb_boost: {
    category: 'instant', name: 'ATB Boost', description: 'Increases action gauge',
    unique: true, icon: 'atb-up', color: '#06b6d4',
  },
  atb_reduce: {
    category: 'instant', name: 'ATB Reduce', description: 'Decreases action gauge',
    unique: true, icon: 'atb-down', color: '#8b5cf6',
  },
  cd_reset: {
    category: 'instant', name: 'CD Reset', description: 'Resets all skill cooldowns',
    unique: true, icon: 'cd-reset', color: '#14b8a6',
  },
  cd_reduce: {
    category: 'instant', name: 'CD Reduce', description: 'Reduces skill cooldowns',
    unique: true, icon: 'cd-reduce', color: '#2dd4bf',
  },
  cd_increase: {
    category: 'instant', name: 'CD Increase', description: 'Increases skill cooldowns',
    unique: true, icon: 'cd-increase', color: '#9333ea',
  },
  strip: {
    category: 'instant', name: 'Strip', description: 'Removes buffs from target',
    unique: true, icon: 'strip', color: '#e11d48',
  },
  cleanse: {
    category: 'instant', name: 'Cleanse', description: 'Removes debuffs from ally',
    unique: true, icon: 'cleanse', color: '#10b981',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getEffectMeta(id: EffectId): EffectMeta {
  return EFFECT_REGISTRY[id];
}

export function isBuffEffect(id: EffectId): boolean {
  const meta = EFFECT_REGISTRY[id];
  return meta.category === 'buff';
}

export function isDebuffEffect(id: EffectId): boolean {
  const meta = EFFECT_REGISTRY[id];
  return meta.category === 'debuff' || meta.category === 'status';
}

export function isInstantEffect(id: EffectId): boolean {
  return EFFECT_REGISTRY[id].category === 'instant';
}

export function isStackable(id: EffectId): boolean {
  return !EFFECT_REGISTRY[id].unique;
}

export const MAX_DEBUFFS = 10;
