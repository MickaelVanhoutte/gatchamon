import type { ItemSetDef, HeldItemMainStatType, HeldItemGrade, MainStatScaling } from '../types/held-item.js';

export const ITEM_SETS: ItemSetDef[] = [
  // 4-piece stat sets
  {
    id: 'swift_wing',
    name: 'Swift Wing',
    icon: 'wind',
    pieces: 4,
    effectType: 'stat',
    bonusStat: 'spd',
    bonusValue: 25,
    bonusType: 'percent',
    color: '#60d5f5',
  },
  {
    id: 'power_band',
    name: 'Power Band',
    icon: 'muscle',
    pieces: 4,
    effectType: 'stat',
    bonusStat: 'atk',
    bonusValue: 35,
    bonusType: 'percent',
    color: '#ff6b6b',
  },
  {
    id: 'scope_lens',
    name: 'Scope Lens',
    icon: 'target',
    pieces: 4,
    effectType: 'stat',
    bonusStat: 'critRate',
    bonusValue: 12,
    bonusType: 'flat',
    color: '#f97316',
  },
  // 4-piece proc sets
  {
    id: 'kings_rock',
    name: "King's Rock",
    icon: 'crown',
    pieces: 4,
    effectType: 'proc',
    procDescription: '22% chance to gain an extra turn after attacking',
    procChance: 0.22,
    procEffect: 'extra_turn',
    color: '#fbbf24',
  },
  {
    id: 'razor_fang',
    name: 'Razor Fang',
    icon: 'blade',
    pieces: 4,
    effectType: 'proc',
    procDescription: '25% chance to stun enemy for 1 turn on attack',
    procChance: 0.25,
    procEffect: 'stun_on_hit',
    procValue: 1,
    color: '#a855f7',
  },
  // 2-piece stat sets
  {
    id: 'choice_band',
    name: 'Choice Band',
    icon: 'music',
    pieces: 2,
    effectType: 'stat',
    bonusStat: 'atk',
    bonusValue: 15,
    bonusType: 'percent',
    color: '#ef4444',
  },
  {
    id: 'focus_sash',
    name: 'Focus Sash',
    icon: 'martial_arts',
    pieces: 2,
    effectType: 'stat',
    bonusStat: 'def',
    bonusValue: 15,
    bonusType: 'percent',
    color: '#f0c030',
  },
  {
    id: 'wise_glasses',
    name: 'Wise Glasses',
    icon: 'glasses',
    pieces: 2,
    effectType: 'stat',
    bonusStat: 'critDmg',
    bonusValue: 20,
    bonusType: 'flat',
    color: '#818cf8',
  },
  {
    id: 'quick_claw',
    name: 'Quick Claw',
    icon: 'paw',
    pieces: 2,
    effectType: 'stat',
    bonusStat: 'spd',
    bonusValue: 12,
    bonusType: 'percent',
    color: '#34d399',
  },
  // 2-piece proc set
  {
    id: 'leftovers',
    name: 'Leftovers',
    icon: 'sandwich',
    pieces: 2,
    effectType: 'proc',
    procDescription: 'Recover 15% of max HP at the start of each turn',
    procChance: 1.0,
    procEffect: 'heal_per_turn',
    procValue: 15,
    color: '#4ade80',
  },
];

export function getItemSet(id: string): ItemSetDef | undefined {
  return ITEM_SETS.find(s => s.id === id);
}

export const SLOT_MAIN_STAT_POOL: Record<number, HeldItemMainStatType[]> = {
  1: ['atk_flat'],
  2: ['atk_pct', 'def_pct', 'hp_pct', 'spd_flat'],
  3: ['def_flat'],
  4: ['atk_pct', 'def_pct', 'hp_pct', 'critRate', 'critDmg'],
  5: ['hp_flat'],
  6: ['atk_pct', 'def_pct', 'hp_pct', 'acc', 'res'],
};

export const ALL_SUB_STAT_TYPES: HeldItemMainStatType[] = [
  'hp_flat', 'hp_pct', 'atk_flat', 'atk_pct', 'def_flat', 'def_pct',
  'spd_flat', 'critRate', 'critDmg', 'acc', 'res',
];

export const MAIN_STAT_SCALING: Record<HeldItemMainStatType, MainStatScaling> = {
  atk_flat:  { base: { 1: 3, 2: 5, 3: 7, 4: 10, 5: 15, 6: 22 },   perLevel: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 } },
  hp_flat:   { base: { 1: 40, 2: 70, 3: 110, 4: 160, 5: 220, 6: 300 }, perLevel: { 1: 12, 2: 22, 3: 35, 4: 50, 5: 75, 6: 105 } },
  def_flat:  { base: { 1: 3, 2: 5, 3: 7, 4: 10, 5: 15, 6: 22 },   perLevel: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 } },
  hp_pct:    { base: { 1: 2, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11 },     perLevel: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3 } },
  atk_pct:   { base: { 1: 2, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11 },     perLevel: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3 } },
  def_pct:   { base: { 1: 2, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11 },     perLevel: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3 } },
  spd_flat:  { base: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 7, 6: 10 },     perLevel: { 1: 1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 3 } },
  critRate:  { base: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 7 },      perLevel: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2 } },
  critDmg:   { base: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 7, 6: 10 },     perLevel: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3 } },
  acc:       { base: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 7 },      perLevel: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2 } },
  res:       { base: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 7 },      perLevel: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2 } },
};

/** Sub stat value ranges: [min, max] per star rating */
export const SUB_STAT_RANGES: Record<HeldItemMainStatType, Record<number, [number, number]>> = {
  hp_flat:  { 1: [15, 60], 2: [30, 120], 3: [60, 225], 4: [90, 375], 5: [135, 550], 6: [200, 800] },
  hp_pct:   { 1: [1, 2], 2: [1, 3], 3: [2, 4], 4: [2, 5], 5: [3, 7], 6: [4, 8] },
  atk_flat: { 1: [1, 4], 2: [2, 6], 3: [3, 10], 4: [4, 14], 5: [6, 18], 6: [8, 22] },
  atk_pct:  { 1: [1, 2], 2: [1, 3], 3: [2, 4], 4: [2, 5], 5: [3, 7], 6: [4, 8] },
  def_flat: { 1: [1, 4], 2: [2, 6], 3: [3, 10], 4: [4, 14], 5: [6, 18], 6: [8, 22] },
  def_pct:  { 1: [1, 2], 2: [1, 3], 3: [2, 4], 4: [2, 5], 5: [3, 7], 6: [4, 8] },
  spd_flat: { 1: [1, 2], 2: [1, 3], 3: [2, 4], 4: [2, 5], 5: [3, 6], 6: [3, 7] },
  critRate: { 1: [1, 2], 2: [1, 2], 3: [1, 3], 4: [2, 4], 5: [2, 5], 6: [3, 6] },
  critDmg:  { 1: [1, 2], 2: [1, 3], 3: [2, 4], 4: [2, 5], 5: [3, 6], 6: [3, 7] },
  acc:      { 1: [1, 2], 2: [1, 2], 3: [1, 3], 4: [2, 4], 5: [2, 5], 6: [3, 6] },
  res:      { 1: [1, 2], 2: [1, 2], 3: [1, 3], 4: [2, 4], 5: [2, 5], 6: [3, 6] },
};

export const GRADE_COLORS: Record<HeldItemGrade, string> = {
  common: '#aaa',
  rare: '#60a5fa',
  hero: '#c084fc',
  legend: '#fbbf24',
};

export const GRADE_INITIAL_SUBSTATS: Record<HeldItemGrade, number> = {
  common: 0,
  rare: 1,
  hero: 2,
  legend: 3,
};

export const STAT_TYPE_LABELS: Record<HeldItemMainStatType, string> = {
  hp_flat: 'HP',
  hp_pct: 'HP%',
  atk_flat: 'ATK',
  atk_pct: 'ATK%',
  def_flat: 'DEF',
  def_pct: 'DEF%',
  spd_flat: 'SPD',
  critRate: 'CRI Rate%',
  critDmg: 'CRI Dmg%',
  acc: 'ACC%',
  res: 'RES%',
};

export const ITEM_REMOVAL_COST = 10000;
