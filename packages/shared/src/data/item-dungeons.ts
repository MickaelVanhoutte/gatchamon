import type { ItemDungeonDef } from '../types/held-item.js';

export const ITEM_DUNGEONS: ItemDungeonDef[] = [
  {
    id: 101,
    name: 'Granite Cave',
    icon: '\u{26F0}',
    color: '#b8860b',
    description: 'A rugged cave carved from ancient stone. Drops Choice Band and Power Band items.',
    // Pool reference: [74, 75, 76, 95, 111] — Geodude, Graveler, Golem, Onix, Rhyhorn
    energyCost: 3,
    floors: [
      { enemyLevel: 8, enemies: [74, 74, 75], drops: [
        { setId: 'choice_band', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'power_band', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], stardustReward: [30, 50] },
      { enemyLevel: 12, enemies: [74, 75, 95], drops: [
        { setId: 'choice_band', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'power_band', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], stardustReward: [35, 55] },
      { enemyLevel: 16, enemies: [75, 95, 74], drops: [
        { setId: 'choice_band', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'power_band', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], stardustReward: [40, 60] },
      { enemyLevel: 20, enemies: [95, 75, 111], drops: [
        { setId: 'choice_band', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
        { setId: 'power_band', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
      ], stardustReward: [45, 65] },
      { enemyLevel: 24, enemies: [111, 95, 76], drops: [
        { setId: 'choice_band', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
        { setId: 'power_band', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
      ], stardustReward: [50, 70] },
      { enemyLevel: 28, enemies: [76, 111, 95], drops: [
        { setId: 'choice_band', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
        { setId: 'power_band', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
      ], stardustReward: [55, 75] },
      { enemyLevel: 32, enemies: [76, 95, 111], drops: [
        { setId: 'choice_band', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
        { setId: 'power_band', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
      ], stardustReward: [60, 80] },
      { enemyLevel: 36, enemies: [111, 76, 75], drops: [
        { setId: 'choice_band', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
        { setId: 'power_band', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
      ], stardustReward: [70, 90] },
      { enemyLevel: 40, enemies: [76, 111, 76], drops: [
        { setId: 'choice_band', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
        { setId: 'power_band', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
      ], stardustReward: [80, 100] },
      { enemyLevel: 45, enemies: [76, 111, 95], drops: [
        { setId: 'choice_band', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
        { setId: 'power_band', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
      ], stardustReward: [90, 120] },
    ],
  },
  {
    id: 102,
    name: 'Whispering Woods',
    icon: '\u{1F333}',
    color: '#228B22',
    description: 'A mysterious forest humming with life energy. Drops Leftovers and Razor Fang items.',
    // Pool reference: [1, 43, 44, 45, 69] — Bulbasaur, Oddish, Gloom, Vileplume, Bellsprout
    energyCost: 3,
    floors: [
      { enemyLevel: 8, enemies: [1, 43, 69], drops: [
        { setId: 'leftovers', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'razor_fang', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], stardustReward: [30, 50] },
      { enemyLevel: 12, enemies: [43, 1, 69], drops: [
        { setId: 'leftovers', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'razor_fang', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], stardustReward: [35, 55] },
      { enemyLevel: 16, enemies: [69, 43, 44], drops: [
        { setId: 'leftovers', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'razor_fang', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], stardustReward: [40, 60] },
      { enemyLevel: 20, enemies: [44, 1, 69], drops: [
        { setId: 'leftovers', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
        { setId: 'razor_fang', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
      ], stardustReward: [45, 65] },
      { enemyLevel: 24, enemies: [44, 45, 43], drops: [
        { setId: 'leftovers', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
        { setId: 'razor_fang', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
      ], stardustReward: [50, 70] },
      { enemyLevel: 28, enemies: [45, 44, 1], drops: [
        { setId: 'leftovers', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
        { setId: 'razor_fang', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
      ], stardustReward: [55, 75] },
      { enemyLevel: 32, enemies: [45, 69, 44], drops: [
        { setId: 'leftovers', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
        { setId: 'razor_fang', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
      ], stardustReward: [60, 80] },
      { enemyLevel: 36, enemies: [45, 44, 69], drops: [
        { setId: 'leftovers', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
        { setId: 'razor_fang', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
      ], stardustReward: [70, 90] },
      { enemyLevel: 40, enemies: [45, 44, 1], drops: [
        { setId: 'leftovers', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
        { setId: 'razor_fang', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
      ], stardustReward: [80, 100] },
      { enemyLevel: 45, enemies: [45, 44, 45], drops: [
        { setId: 'leftovers', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
        { setId: 'razor_fang', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
      ], stardustReward: [90, 120] },
    ],
  },
  {
    id: 103,
    name: 'Thunder Spire',
    icon: '\u26A1',
    color: '#f0c030',
    description: 'A tower crackling with electric energy. Drops Swift Wing and Quick Claw items.',
    // Pool reference: [25, 26, 81, 82, 100] — Pikachu, Raichu, Magnemite, Magneton, Voltorb
    energyCost: 3,
    floors: [
      { enemyLevel: 8, enemies: [25, 100, 81], drops: [
        { setId: 'swift_wing', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'quick_claw', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], stardustReward: [30, 50] },
      { enemyLevel: 12, enemies: [81, 25, 100], drops: [
        { setId: 'swift_wing', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'quick_claw', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], stardustReward: [35, 55] },
      { enemyLevel: 16, enemies: [100, 81, 25], drops: [
        { setId: 'swift_wing', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'quick_claw', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], stardustReward: [40, 60] },
      { enemyLevel: 20, enemies: [82, 25, 100], drops: [
        { setId: 'swift_wing', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
        { setId: 'quick_claw', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
      ], stardustReward: [45, 65] },
      { enemyLevel: 24, enemies: [26, 82, 81], drops: [
        { setId: 'swift_wing', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
        { setId: 'quick_claw', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
      ], stardustReward: [50, 70] },
      { enemyLevel: 28, enemies: [82, 26, 100], drops: [
        { setId: 'swift_wing', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
        { setId: 'quick_claw', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
      ], stardustReward: [55, 75] },
      { enemyLevel: 32, enemies: [26, 82, 25], drops: [
        { setId: 'swift_wing', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
        { setId: 'quick_claw', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
      ], stardustReward: [60, 80] },
      { enemyLevel: 36, enemies: [26, 82, 26], drops: [
        { setId: 'swift_wing', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
        { setId: 'quick_claw', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
      ], stardustReward: [70, 90] },
      { enemyLevel: 40, enemies: [26, 82, 82], drops: [
        { setId: 'swift_wing', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
        { setId: 'quick_claw', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
      ], stardustReward: [80, 100] },
      { enemyLevel: 45, enemies: [26, 82, 26], drops: [
        { setId: 'swift_wing', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
        { setId: 'quick_claw', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
      ], stardustReward: [90, 120] },
    ],
  },
  {
    id: 104,
    name: 'Frozen Peak',
    icon: '\u{2744}',
    color: '#87CEEB',
    description: 'An icy mountain summit wreathed in frost. Drops Scope Lens and Wise Glasses items.',
    // Pool reference: [87, 91, 124, 131, 144] — Dewgong, Cloyster, Jynx, Lapras, Articuno
    energyCost: 4,
    floors: [
      { enemyLevel: 10, enemies: [87, 91, 87], drops: [
        { setId: 'scope_lens', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'wise_glasses', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], stardustReward: [35, 55] },
      { enemyLevel: 14, enemies: [91, 87, 124], drops: [
        { setId: 'scope_lens', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'wise_glasses', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], stardustReward: [40, 60] },
      { enemyLevel: 18, enemies: [124, 87, 91], drops: [
        { setId: 'scope_lens', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'wise_glasses', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], stardustReward: [45, 65] },
      { enemyLevel: 22, enemies: [87, 124, 131], drops: [
        { setId: 'scope_lens', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
        { setId: 'wise_glasses', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
      ], stardustReward: [50, 70] },
      { enemyLevel: 26, enemies: [131, 91, 124], drops: [
        { setId: 'scope_lens', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
        { setId: 'wise_glasses', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
      ], stardustReward: [55, 75] },
      { enemyLevel: 30, enemies: [131, 124, 87], drops: [
        { setId: 'scope_lens', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
        { setId: 'wise_glasses', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
      ], stardustReward: [60, 80] },
      { enemyLevel: 34, enemies: [144, 131, 91], drops: [
        { setId: 'scope_lens', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
        { setId: 'wise_glasses', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
      ], stardustReward: [65, 85] },
      { enemyLevel: 38, enemies: [144, 124, 131], drops: [
        { setId: 'scope_lens', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
        { setId: 'wise_glasses', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
      ], stardustReward: [75, 95] },
      { enemyLevel: 42, enemies: [144, 131, 124], drops: [
        { setId: 'scope_lens', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
        { setId: 'wise_glasses', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
      ], stardustReward: [85, 110] },
      { enemyLevel: 48, enemies: [144, 131, 144], drops: [
        { setId: 'scope_lens', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
        { setId: 'wise_glasses', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
      ], stardustReward: [95, 130] },
    ],
  },
  {
    id: 105,
    name: 'Ancient Shrine',
    icon: '\u{26E9}',
    color: '#6a5acd',
    description: 'A sacred temple housing ancient power. Drops Focus Sash and King\'s Rock items.',
    // Pool reference: [147, 148, 149, 130, 142] — Dratini, Dragonair, Dragonite, Gyarados, Aerodactyl
    energyCost: 4,
    floors: [
      { enemyLevel: 10, enemies: [147, 147, 130], drops: [
        { setId: 'focus_sash', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'kings_rock', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], stardustReward: [35, 55] },
      { enemyLevel: 14, enemies: [147, 130, 142], drops: [
        { setId: 'focus_sash', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'kings_rock', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], stardustReward: [40, 60] },
      { enemyLevel: 18, enemies: [130, 147, 148], drops: [
        { setId: 'focus_sash', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'kings_rock', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], stardustReward: [45, 65] },
      { enemyLevel: 22, enemies: [148, 142, 130], drops: [
        { setId: 'focus_sash', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
        { setId: 'kings_rock', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
      ], stardustReward: [50, 70] },
      { enemyLevel: 26, enemies: [142, 148, 147], drops: [
        { setId: 'focus_sash', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
        { setId: 'kings_rock', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
      ], stardustReward: [55, 75] },
      { enemyLevel: 30, enemies: [148, 142, 149], drops: [
        { setId: 'focus_sash', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
        { setId: 'kings_rock', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
      ], stardustReward: [60, 80] },
      { enemyLevel: 34, enemies: [149, 148, 142], drops: [
        { setId: 'focus_sash', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
        { setId: 'kings_rock', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
      ], stardustReward: [65, 85] },
      { enemyLevel: 38, enemies: [149, 130, 148], drops: [
        { setId: 'focus_sash', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
        { setId: 'kings_rock', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
      ], stardustReward: [75, 95] },
      { enemyLevel: 42, enemies: [149, 142, 130], drops: [
        { setId: 'focus_sash', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
        { setId: 'kings_rock', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
      ], stardustReward: [85, 110] },
      { enemyLevel: 48, enemies: [149, 142, 149], drops: [
        { setId: 'focus_sash', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
        { setId: 'kings_rock', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
      ], stardustReward: [95, 130] },
    ],
  },
];

export function getItemDungeon(id: number): ItemDungeonDef | undefined {
  return ITEM_DUNGEONS.find(d => d.id === id);
}
