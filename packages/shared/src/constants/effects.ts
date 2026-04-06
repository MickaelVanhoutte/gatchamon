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
    percentHp?: number;   // % of max HP per turn
    percentAtk?: number;  // % of source ATK per turn (snapshotted)
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
    category: 'buff', name: 'ATK Up', description: 'Attack increased by 35%',
    unique: true, statMod: { stat: 'atk', percent: 35 },
    icon: 'atk-up', color: '#ef4444',
  },
  def_buff: {
    category: 'buff', name: 'DEF Up', description: 'Defense increased by 50%',
    unique: true, statMod: { stat: 'def', percent: 50 },
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
    category: 'buff', name: 'Recovery', description: 'Recovers 10% of max HP each turn',
    unique: true, hot: { percentHp: 10 }, icon: 'recovery', color: '#4ade80',
  },
  vampire: {
    category: 'buff', name: 'Vampire', description: 'Recovers 20% of damage dealt as HP',
    unique: true, icon: 'vampire', color: '#b91c1c',
  },
  soul_protect: {
    category: 'buff', name: 'Soul Protect', description: 'Revives with 30% HP on lethal hit (consumed)',
    unique: true, icon: 'soul-protect', color: '#e879f9',
  },
  acc_buff: {
    category: 'buff', name: 'ACC Up', description: 'Accuracy increased by 50%',
    unique: true, statMod: { stat: 'acc', percent: 50 },
    icon: 'acc-up', color: '#22d3ee',
  },
  res_buff: {
    category: 'buff', name: 'RES Up', description: 'Resistance increased by 50%',
    unique: true, statMod: { stat: 'res', percent: 50 },
    icon: 'res-up', color: '#a3e635',
  },
  crit_dmg_buff: {
    category: 'buff', name: 'Crit DMG Up', description: 'Critical damage increased by 30%',
    unique: true, statMod: { stat: 'critDmg', percent: 30 },
    icon: 'cdmg-up', color: '#f43f5e',
  },
  threat: {
    category: 'buff', name: 'Threat', description: 'Enemies prioritize targeting this monster',
    unique: true, icon: 'threat', color: '#ef4444',
  },
  evasion: {
    category: 'buff', name: 'Evasion', description: '30% chance to completely dodge attacks',
    unique: true, icon: 'evasion', color: '#c4b5fd',
  },
  amplify: {
    category: 'buff', name: 'Amplify', description: 'Next attack deals +50% damage (consumed)',
    unique: true, icon: 'amplify', color: '#fb923c',
  },
  nullify: {
    category: 'buff', name: 'Nullify', description: 'Blocks next debuff applied (consumed)',
    unique: true, icon: 'nullify', color: '#fde047',
  },
  skill_refresh: {
    category: 'buff', name: 'Skill Refresh', description: 'Next skill used has no cooldown (consumed)',
    unique: true, icon: 'skill-refresh', color: '#2dd4bf',
  },

  // ── SW Debuffs ───────────────────────────────────────────────────────
  atk_break: {
    category: 'debuff', name: 'ATK Break', description: 'Attack decreased by 50%',
    unique: true, statMod: { stat: 'atk', percent: -50 },
    icon: 'atk-down', color: '#ef4444',
  },
  def_break: {
    category: 'debuff', name: 'DEF Break', description: 'Defense decreased by 50%',
    unique: true, statMod: { stat: 'def', percent: -50 },
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
  bomb: {
    category: 'debuff', name: 'Bomb', description: 'Detonates for 25% max HP damage when timer expires',
    unique: false, maxStacks: 3, icon: 'bomb', color: '#f97316',
  },
  acc_break: {
    category: 'debuff', name: 'ACC Break', description: 'Accuracy decreased by 50%',
    unique: true, statMod: { stat: 'acc', percent: -50 },
    icon: 'acc-down', color: '#06b6d4',
  },
  res_break: {
    category: 'debuff', name: 'RES Break', description: 'Resistance decreased by 50%',
    unique: true, statMod: { stat: 'res', percent: -50 },
    icon: 'res-down', color: '#84cc16',
  },
  seal: {
    category: 'debuff', name: 'Seal', description: 'Basic attack cannot apply additional effects',
    unique: true, icon: 'seal', color: '#6b7280',
  },
  bleed: {
    category: 'debuff', name: 'Bleed', description: 'Takes 4% max HP damage each turn (stackable)',
    unique: false, maxStacks: 10, dot: { percentHp: 4 },
    icon: 'bleed', color: '#dc2626',
  },
  expose: {
    category: 'debuff', name: 'Expose', description: 'Attackers have +15% crit rate against this target',
    unique: true, icon: 'expose', color: '#fbbf24',
  },
  anti_heal: {
    category: 'debuff', name: 'Anti-Heal', description: 'Healing received reduced by 50%',
    unique: true, icon: 'anti-heal', color: '#a855f7',
  },
  mark: {
    category: 'debuff', name: 'Mark', description: 'Takes 15% more damage from all sources',
    unique: true, icon: 'mark', color: '#f43f5e',
  },
  petrify: {
    category: 'debuff', name: 'Petrify', description: 'Cannot act (turned to stone) but defense doubled',
    unique: true, cc: 'stun', statMod: { stat: 'def', percent: 100 },
    icon: 'petrify', color: '#78716c',
  },

  // ── Pokemon Status Effects ───────────────────────────────────────────
  poison: {
    category: 'status', name: 'Poison', description: 'Takes 5% max HP damage each turn (stackable)',
    unique: false, maxStacks: 10, dot: { percentHp: 5 },
    icon: 'poison', color: '#a855f7',
  },
  burn: {
    category: 'status', name: 'Burn', description: 'Takes 5% of applier ATK as damage each turn and ATK reduced by 3% per stack (stackable)',
    unique: false, maxStacks: 10,
    dot: { percentAtk: 5 },
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
  revive: {
    category: 'instant', name: 'Revive', description: 'Revives a fallen ally',
    unique: true, icon: 'revive', color: '#16a34a',
  },
  steal_buff: {
    category: 'instant', name: 'Steal Buff', description: 'Steals a buff from the target',
    unique: true, icon: 'steal-buff', color: '#c084fc',
  },
  absorb_atb: {
    category: 'instant', name: 'Absorb ATB', description: 'Steals action gauge from target',
    unique: true, icon: 'absorb-atb', color: '#7c3aed',
  },
  detonate: {
    category: 'instant', name: 'Detonate', description: 'Triggers all DoT damage instantly',
    unique: true, icon: 'detonate', color: '#dc2626',
  },
  transfer_debuff: {
    category: 'instant', name: 'Transfer Debuff', description: 'Transfers own debuffs to target',
    unique: true, icon: 'transfer-debuff', color: '#fb7185',
  },
  extend_buffs: {
    category: 'instant', name: 'Extend Buffs', description: 'Extends buff durations by 1 turn',
    unique: true, icon: 'extend-buffs', color: '#34d399',
  },
  shorten_debuffs: {
    category: 'instant', name: 'Shorten Debuffs', description: 'Reduces debuff durations by 1 turn',
    unique: true, icon: 'shorten-debuffs', color: '#38bdf8',
  },
  balance_hp: {
    category: 'instant', name: 'Balance HP', description: 'Equalizes HP% across all allies',
    unique: true, icon: 'balance-hp', color: '#4ade80',
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

const BENEFICIAL_INSTANTS: ReadonlySet<EffectId> = new Set([
  'heal', 'cleanse', 'atb_boost', 'cd_reset', 'cd_reduce',
  'revive', 'extend_buffs', 'shorten_debuffs', 'balance_hp',
] as EffectId[]);

const HARMFUL_INSTANTS: ReadonlySet<EffectId> = new Set([
  'strip', 'atb_reduce', 'cd_increase',
  'steal_buff', 'absorb_atb', 'detonate', 'transfer_debuff',
] as EffectId[]);

export function isBeneficialEffect(id: EffectId): boolean {
  return isBuffEffect(id) || BENEFICIAL_INSTANTS.has(id);
}

export function isHarmfulEffect(id: EffectId): boolean {
  return isDebuffEffect(id) || HARMFUL_INSTANTS.has(id);
}

export function isStackable(id: EffectId): boolean {
  return !EFFECT_REGISTRY[id].unique;
}

export const MAX_DEBUFFS = 10;
