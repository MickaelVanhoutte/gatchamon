import type { ItemDungeonDef } from '../types/held-item.js';

export const ITEM_DUNGEONS: ItemDungeonDef[] = [
  {
    id: 101,
    name: 'Granite Cave',
    icon: 'mountain',
    color: '#b8860b',
    description: 'A rugged cave carved from ancient stone. Drops Choice Band and Power Band items.',
    // Pool reference: [74, 75, 76, 95, 111] — Geodude, Graveler, Golem, Onix, Rhyhorn
    energyCost: 3,
    floors: [
      { enemyLevel: 10, enemies: [74, 74, 75], drops: [
        { setId: 'choice_band', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'power_band', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], pokedollarReward: [30, 50] },
      { enemyLevel: 16, enemies: [74, 75, 95], drops: [
        { setId: 'choice_band', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'power_band', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], pokedollarReward: [35, 55] },
      { enemyLevel: 22, enemies: [75, 95, 74], drops: [
        { setId: 'choice_band', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'power_band', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], pokedollarReward: [40, 60] },
      { enemyLevel: 30, enemies: [95, 75, 111], enemyStars: 2, drops: [
        { setId: 'choice_band', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
        { setId: 'power_band', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
      ], pokedollarReward: [45, 65] },
      { enemyLevel: 38, enemies: [111, 95, 76], enemyStars: 3, statBoost: 1.1, drops: [
        { setId: 'choice_band', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
        { setId: 'power_band', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
      ], pokedollarReward: [50, 70] },
      { enemyLevel: 45, enemies: [76, 111, 95], enemyStars: 3, statBoost: 1.2, drops: [
        { setId: 'choice_band', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
        { setId: 'power_band', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
      ], pokedollarReward: [55, 75] },
      { enemyLevel: 52, enemies: [76, 95, 111], enemyStars: 4, statBoost: 1.3, drops: [
        { setId: 'choice_band', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
        { setId: 'power_band', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
      ], pokedollarReward: [60, 80] },
      { enemyLevel: 60, enemies: [112, 76, 95], enemyStars: 5, statBoost: 1.5, drops: [  // Rhydon, Golem, Onix
        { setId: 'choice_band', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
        { setId: 'power_band', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
      ], pokedollarReward: [70, 90] },
      { enemyLevel: 70, enemies: [112, 76, 95], enemyStars: 5, statBoost: 1.7, drops: [  // Rhydon, Golem, Onix
        { setId: 'choice_band', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
        { setId: 'power_band', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
      ], pokedollarReward: [80, 100], stardustDrop: { chance: 0.10, min: 3, max: 5 } },
      { enemyLevel: 80, enemies: [112, 76, 95], enemyStars: 6, statBoost: 2.0, drops: [  // Rhydon, Golem, Onix
        { setId: 'choice_band', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
        { setId: 'power_band', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
      ], pokedollarReward: [90, 120], stardustDrop: { chance: 0.10, min: 3, max: 5 } },
    ],
  },
  {
    id: 102,
    name: 'Whispering Woods',
    icon: 'tree',
    color: '#228B22',
    description: 'A mysterious forest humming with life energy. Drops Leftovers and Razor Fang items.',
    // Pool reference: [1, 43, 44, 45, 69] — Bulbasaur, Oddish, Gloom, Vileplume, Bellsprout
    energyCost: 3,
    floors: [
      { enemyLevel: 10, enemies: [1, 43, 69], drops: [
        { setId: 'leftovers', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'razor_fang', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], pokedollarReward: [30, 50] },
      { enemyLevel: 16, enemies: [43, 1, 69], drops: [
        { setId: 'leftovers', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'razor_fang', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], pokedollarReward: [35, 55] },
      { enemyLevel: 22, enemies: [69, 43, 44], drops: [
        { setId: 'leftovers', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'razor_fang', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], pokedollarReward: [40, 60] },
      { enemyLevel: 30, enemies: [44, 1, 69], enemyStars: 2, drops: [
        { setId: 'leftovers', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
        { setId: 'razor_fang', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
      ], pokedollarReward: [45, 65] },
      { enemyLevel: 38, enemies: [44, 45, 43], enemyStars: 3, statBoost: 1.1, drops: [
        { setId: 'leftovers', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
        { setId: 'razor_fang', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
      ], pokedollarReward: [50, 70] },
      { enemyLevel: 45, enemies: [45, 44, 1], enemyStars: 3, statBoost: 1.2, drops: [
        { setId: 'leftovers', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
        { setId: 'razor_fang', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
      ], pokedollarReward: [55, 75] },
      { enemyLevel: 52, enemies: [45, 69, 44], enemyStars: 4, statBoost: 1.3, drops: [
        { setId: 'leftovers', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
        { setId: 'razor_fang', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
      ], pokedollarReward: [60, 80] },
      { enemyLevel: 60, enemies: [3, 45, 71], enemyStars: 5, statBoost: 1.5, drops: [  // Venusaur, Vileplume, Victreebel
        { setId: 'leftovers', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
        { setId: 'razor_fang', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
      ], pokedollarReward: [70, 90] },
      { enemyLevel: 70, enemies: [3, 45, 71], enemyStars: 5, statBoost: 1.7, drops: [  // Venusaur, Vileplume, Victreebel
        { setId: 'leftovers', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
        { setId: 'razor_fang', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
      ], pokedollarReward: [80, 100], stardustDrop: { chance: 0.10, min: 3, max: 5 } },
      { enemyLevel: 80, enemies: [3, 45, 71], enemyStars: 6, statBoost: 2.0, drops: [  // Venusaur, Vileplume, Victreebel
        { setId: 'leftovers', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
        { setId: 'razor_fang', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
      ], pokedollarReward: [90, 120], stardustDrop: { chance: 0.10, min: 3, max: 5 } },
    ],
  },
  {
    id: 103,
    name: 'Thunder Spire',
    icon: 'electric',
    color: '#f0c030',
    description: 'A tower crackling with electric energy. Drops Swift Wing and Quick Claw items.',
    // Pool reference: [25, 26, 81, 82, 100] — Pikachu, Raichu, Magnemite, Magneton, Voltorb
    energyCost: 3,
    floors: [
      { enemyLevel: 10, enemies: [25, 100, 81], drops: [
        { setId: 'swift_wing', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'quick_claw', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], pokedollarReward: [30, 50] },
      { enemyLevel: 16, enemies: [81, 25, 100], drops: [
        { setId: 'swift_wing', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'quick_claw', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], pokedollarReward: [35, 55] },
      { enemyLevel: 22, enemies: [100, 81, 25], drops: [
        { setId: 'swift_wing', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'quick_claw', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], pokedollarReward: [40, 60] },
      { enemyLevel: 30, enemies: [82, 25, 100], enemyStars: 2, drops: [
        { setId: 'swift_wing', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
        { setId: 'quick_claw', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
      ], pokedollarReward: [45, 65] },
      { enemyLevel: 38, enemies: [26, 82, 81], enemyStars: 3, statBoost: 1.1, drops: [
        { setId: 'swift_wing', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
        { setId: 'quick_claw', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
      ], pokedollarReward: [50, 70] },
      { enemyLevel: 45, enemies: [82, 26, 100], enemyStars: 3, statBoost: 1.2, drops: [
        { setId: 'swift_wing', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
        { setId: 'quick_claw', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
      ], pokedollarReward: [55, 75] },
      { enemyLevel: 52, enemies: [26, 82, 25], enemyStars: 4, statBoost: 1.3, drops: [
        { setId: 'swift_wing', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
        { setId: 'quick_claw', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
      ], pokedollarReward: [60, 80] },
      { enemyLevel: 60, enemies: [125, 82, 101], enemyStars: 5, statBoost: 1.5, drops: [  // Electabuzz, Magneton, Electrode
        { setId: 'swift_wing', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
        { setId: 'quick_claw', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
      ], pokedollarReward: [70, 90] },
      { enemyLevel: 70, enemies: [125, 82, 101], enemyStars: 5, statBoost: 1.7, drops: [  // Electabuzz, Magneton, Electrode
        { setId: 'swift_wing', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
        { setId: 'quick_claw', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
      ], pokedollarReward: [80, 100], stardustDrop: { chance: 0.10, min: 3, max: 5 } },
      { enemyLevel: 80, enemies: [125, 82, 101], enemyStars: 6, statBoost: 2.0, drops: [  // Electabuzz, Magneton, Electrode
        { setId: 'swift_wing', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
        { setId: 'quick_claw', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
      ], pokedollarReward: [90, 120], stardustDrop: { chance: 0.10, min: 3, max: 5 } },
    ],
  },
  {
    id: 104,
    name: 'Frozen Peak',
    icon: 'ice',
    color: '#87CEEB',
    description: 'An icy mountain summit wreathed in frost. Drops Scope Lens and Wise Glasses items.',
    // Pool reference: [87, 91, 124, 131, 144] — Dewgong, Cloyster, Jynx, Lapras, Articuno
    energyCost: 4,
    floors: [
      { enemyLevel: 10, enemies: [87, 91, 87], drops: [
        { setId: 'scope_lens', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'wise_glasses', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], pokedollarReward: [35, 55] },
      { enemyLevel: 16, enemies: [91, 87, 124], drops: [
        { setId: 'scope_lens', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'wise_glasses', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], pokedollarReward: [40, 60] },
      { enemyLevel: 22, enemies: [124, 87, 91], drops: [
        { setId: 'scope_lens', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'wise_glasses', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], pokedollarReward: [45, 65] },
      { enemyLevel: 30, enemies: [87, 124, 131], enemyStars: 2, drops: [
        { setId: 'scope_lens', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
        { setId: 'wise_glasses', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
      ], pokedollarReward: [50, 70] },
      { enemyLevel: 38, enemies: [131, 91, 124], enemyStars: 3, statBoost: 1.1, drops: [
        { setId: 'scope_lens', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
        { setId: 'wise_glasses', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
      ], pokedollarReward: [55, 75] },
      { enemyLevel: 45, enemies: [131, 124, 87], enemyStars: 3, statBoost: 1.2, drops: [
        { setId: 'scope_lens', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
        { setId: 'wise_glasses', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
      ], pokedollarReward: [60, 80] },
      { enemyLevel: 52, enemies: [144, 131, 91], enemyStars: 4, statBoost: 1.3, drops: [
        { setId: 'scope_lens', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
        { setId: 'wise_glasses', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
      ], pokedollarReward: [65, 85] },
      { enemyLevel: 60, enemies: [144, 124, 131], enemyStars: 5, statBoost: 1.5, drops: [  // Articuno, Jynx, Lapras
        { setId: 'scope_lens', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
        { setId: 'wise_glasses', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
      ], pokedollarReward: [75, 95] },
      { enemyLevel: 70, enemies: [144, 131, 124], enemyStars: 5, statBoost: 1.7, drops: [  // Articuno, Lapras, Jynx
        { setId: 'scope_lens', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
        { setId: 'wise_glasses', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
      ], pokedollarReward: [85, 110], stardustDrop: { chance: 0.10, min: 3, max: 5 } },
      { enemyLevel: 80, enemies: [144, 131, 144], enemyStars: 6, statBoost: 2.0, drops: [  // Articuno, Lapras, Articuno
        { setId: 'scope_lens', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
        { setId: 'wise_glasses', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
      ], pokedollarReward: [95, 130], stardustDrop: { chance: 0.10, min: 3, max: 5 } },
    ],
  },
  {
    id: 105,
    name: 'Ancient Shrine',
    icon: 'shrine',
    color: '#6a5acd',
    description: 'A sacred temple housing ancient power. Drops Focus Sash and King\'s Rock items.',
    // Pool reference: [147, 148, 149, 130, 142] — Dratini, Dragonair, Dragonite, Gyarados, Aerodactyl
    energyCost: 4,
    floors: [
      { enemyLevel: 10, enemies: [147, 147, 130], drops: [
        { setId: 'focus_sash', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'kings_rock', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], pokedollarReward: [35, 55] },
      { enemyLevel: 16, enemies: [147, 130, 142], drops: [
        { setId: 'focus_sash', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'kings_rock', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], pokedollarReward: [40, 60] },
      { enemyLevel: 22, enemies: [130, 147, 148], drops: [
        { setId: 'focus_sash', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'kings_rock', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], pokedollarReward: [45, 65] },
      { enemyLevel: 30, enemies: [148, 142, 130], enemyStars: 2, drops: [
        { setId: 'focus_sash', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
        { setId: 'kings_rock', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 35, hero: 20, legend: 5 } },
      ], pokedollarReward: [50, 70] },
      { enemyLevel: 38, enemies: [142, 148, 147], enemyStars: 3, statBoost: 1.1, drops: [
        { setId: 'focus_sash', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
        { setId: 'kings_rock', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 40, hero: 25, legend: 5 } },
      ], pokedollarReward: [55, 75] },
      { enemyLevel: 45, enemies: [148, 142, 149], enemyStars: 3, statBoost: 1.2, drops: [
        { setId: 'focus_sash', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
        { setId: 'kings_rock', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 40, hero: 30, legend: 10 } },
      ], pokedollarReward: [60, 80] },
      { enemyLevel: 52, enemies: [149, 148, 142], enemyStars: 4, statBoost: 1.3, drops: [
        { setId: 'focus_sash', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
        { setId: 'kings_rock', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 35, hero: 35, legend: 15 } },
      ], pokedollarReward: [65, 85] },
      { enemyLevel: 60, enemies: [149, 130, 142], enemyStars: 5, statBoost: 1.5, drops: [  // Dragonite, Gyarados, Aerodactyl
        { setId: 'focus_sash', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
        { setId: 'kings_rock', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 30, hero: 40, legend: 20 } },
      ], pokedollarReward: [75, 95] },
      { enemyLevel: 70, enemies: [149, 142, 130], enemyStars: 5, statBoost: 1.7, drops: [  // Dragonite, Aerodactyl, Gyarados
        { setId: 'focus_sash', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
        { setId: 'kings_rock', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 25, hero: 45, legend: 25 } },
      ], pokedollarReward: [85, 110], stardustDrop: { chance: 0.10, min: 3, max: 5 } },
      { enemyLevel: 80, enemies: [149, 142, 149], enemyStars: 6, statBoost: 2.0, drops: [  // Dragonite, Aerodactyl, Dragonite
        { setId: 'focus_sash', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
        { setId: 'kings_rock', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 20, hero: 45, legend: 35 } },
      ], pokedollarReward: [95, 130], stardustDrop: { chance: 0.10, min: 3, max: 5 } },
    ],
  },
];

export function getItemDungeon(id: number): ItemDungeonDef | undefined {
  return ITEM_DUNGEONS.find(d => d.id === id);
}
