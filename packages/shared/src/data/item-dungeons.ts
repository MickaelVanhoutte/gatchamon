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
      { enemyLevel: 15, enemyStars: 1, enemies: [74, 74, 75], drops: [
        { setId: 'choice_band', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'power_band', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], pokedollarReward: [30, 50] },
      { enemyLevel: 25, enemyStars: 2, statBoost: 1.1, enemies: [74, 75, 95], drops: [
        { setId: 'choice_band', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'power_band', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], pokedollarReward: [35, 55] },
      { enemyLevel: 35, enemyStars: 3, statBoost: 1.3, enemies: [75, 95, 74], drops: [
        { setId: 'choice_band', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'power_band', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], pokedollarReward: [40, 60] },
      { enemyLevel: 40, enemies: [95, 232, 111], enemyStars: 3, statBoost: 1.4, drops: [  // Onix, Donphan, Rhyhorn
        { setId: 'choice_band', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 36, hero: 22, legend: 2 } },
        { setId: 'power_band', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 36, hero: 22, legend: 2 } },
      ], pokedollarReward: [45, 65] },
      { enemyLevel: 46, enemies: [111, 208, 76], enemyStars: 4, statBoost: 1.5, drops: [  // Rhyhorn, Steelix, Golem
        { setId: 'choice_band', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 41, hero: 27, legend: 2 } },
        { setId: 'power_band', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 41, hero: 27, legend: 2 } },
      ], pokedollarReward: [50, 70] },
      { enemyLevel: 52, enemies: [76, 232, 208], enemyStars: 4, statBoost: 1.6, drops: [  // Golem, Donphan, Steelix
        { setId: 'choice_band', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 42, hero: 35, legend: 3 } },
        { setId: 'power_band', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 42, hero: 35, legend: 3 } },
      ], pokedollarReward: [55, 75] },
      { enemyLevel: 56, enemies: [208, 232, 111], enemyStars: 5, statBoost: 1.7, drops: [  // Steelix, Donphan, Rhyhorn
        { setId: 'choice_band', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 40, hero: 40, legend: 5 } },
        { setId: 'power_band', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 40, hero: 40, legend: 5 } },
      ], pokedollarReward: [60, 80], stardustDrop: { chance: 0.05, min: 1, max: 3 } },
      { enemyLevel: 60, enemies: [112, 208, 232], enemyStars: 5, statBoost: 1.9, drops: [  // Rhydon, Steelix, Donphan
        { setId: 'choice_band', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 35, hero: 47, legend: 8 } },
        { setId: 'power_band', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 35, hero: 47, legend: 8 } },
      ], pokedollarReward: [70, 90], stardustDrop: { chance: 0.10, min: 2, max: 4 } },
      { enemyLevel: 65, enemies: [112, 208, 232], enemyStars: 6, statBoost: 2.1, drops: [  // Rhydon, Steelix, Donphan
        { setId: 'choice_band', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 30, hero: 55, legend: 10 } },
        { setId: 'power_band', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 30, hero: 55, legend: 10 } },
      ], pokedollarReward: [80, 100], stardustDrop: { chance: 0.15, min: 3, max: 6 } },
      { enemyLevel: 72, enemies: [112, 208, 232], enemyStars: 6, statBoost: 2.4, drops: [  // Rhydon, Steelix, Donphan
        { setId: 'choice_band', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 30, hero: 55, legend: 15 } },
        { setId: 'power_band', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 30, hero: 55, legend: 15 } },
      ], pokedollarReward: [90, 120], stardustDrop: { chance: 0.20, min: 5, max: 10 } },
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
      { enemyLevel: 15, enemyStars: 1, enemies: [1, 43, 69], drops: [
        { setId: 'leftovers', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'razor_fang', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], pokedollarReward: [30, 50] },
      { enemyLevel: 25, enemyStars: 2, statBoost: 1.1, enemies: [43, 1, 69], drops: [
        { setId: 'leftovers', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'razor_fang', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], pokedollarReward: [35, 55] },
      { enemyLevel: 35, enemyStars: 3, statBoost: 1.3, enemies: [69, 43, 44], drops: [
        { setId: 'leftovers', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'razor_fang', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], pokedollarReward: [40, 60] },
      { enemyLevel: 40, enemies: [44, 182, 69], enemyStars: 3, statBoost: 1.4, drops: [  // Gloom, Bellossom, Bellsprout
        { setId: 'leftovers', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 36, hero: 22, legend: 2 } },
        { setId: 'razor_fang', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 36, hero: 22, legend: 2 } },
      ], pokedollarReward: [45, 65] },
      { enemyLevel: 46, enemies: [182, 45, 43], enemyStars: 4, statBoost: 1.5, drops: [  // Bellossom, Vileplume, Oddish
        { setId: 'leftovers', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 41, hero: 27, legend: 2 } },
        { setId: 'razor_fang', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 41, hero: 27, legend: 2 } },
      ], pokedollarReward: [50, 70] },
      { enemyLevel: 52, enemies: [45, 154, 182], enemyStars: 4, statBoost: 1.6, drops: [  // Vileplume, Meganium, Bellossom
        { setId: 'leftovers', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 42, hero: 35, legend: 3 } },
        { setId: 'razor_fang', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 42, hero: 35, legend: 3 } },
      ], pokedollarReward: [55, 75] },
      { enemyLevel: 56, enemies: [154, 182, 44], enemyStars: 5, statBoost: 1.7, drops: [  // Meganium, Bellossom, Gloom
        { setId: 'leftovers', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 40, hero: 40, legend: 5 } },
        { setId: 'razor_fang', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 40, hero: 40, legend: 5 } },
      ], pokedollarReward: [60, 80], stardustDrop: { chance: 0.05, min: 1, max: 3 } },
      { enemyLevel: 60, enemies: [154, 45, 71], enemyStars: 5, statBoost: 1.9, drops: [  // Meganium, Vileplume, Victreebel
        { setId: 'leftovers', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 35, hero: 47, legend: 8 } },
        { setId: 'razor_fang', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 35, hero: 47, legend: 8 } },
      ], pokedollarReward: [70, 90], stardustDrop: { chance: 0.10, min: 2, max: 4 } },
      { enemyLevel: 65, enemies: [154, 182, 71], enemyStars: 6, statBoost: 2.1, drops: [  // Meganium, Bellossom, Victreebel
        { setId: 'leftovers', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 30, hero: 55, legend: 10 } },
        { setId: 'razor_fang', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 30, hero: 55, legend: 10 } },
      ], pokedollarReward: [80, 100], stardustDrop: { chance: 0.15, min: 3, max: 6 } },
      { enemyLevel: 72, enemies: [154, 182, 71], enemyStars: 6, statBoost: 2.4, drops: [  // Meganium, Bellossom, Victreebel
        { setId: 'leftovers', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 30, hero: 55, legend: 15 } },
        { setId: 'razor_fang', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 30, hero: 55, legend: 15 } },
      ], pokedollarReward: [90, 120], stardustDrop: { chance: 0.20, min: 5, max: 10 } },
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
      { enemyLevel: 15, enemyStars: 1, enemies: [25, 100, 81], drops: [
        { setId: 'swift_wing', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'quick_claw', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], pokedollarReward: [30, 50] },
      { enemyLevel: 25, enemyStars: 2, statBoost: 1.1, enemies: [81, 25, 100], drops: [
        { setId: 'swift_wing', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'quick_claw', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], pokedollarReward: [35, 55] },
      { enemyLevel: 35, enemyStars: 3, statBoost: 1.3, enemies: [100, 81, 25], drops: [
        { setId: 'swift_wing', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'quick_claw', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], pokedollarReward: [40, 60] },
      { enemyLevel: 40, enemies: [82, 239, 100], enemyStars: 3, statBoost: 1.4, drops: [  // Magneton, Elekid, Voltorb
        { setId: 'swift_wing', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 36, hero: 22, legend: 2 } },
        { setId: 'quick_claw', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 36, hero: 22, legend: 2 } },
      ], pokedollarReward: [45, 65] },
      { enemyLevel: 46, enemies: [181, 82, 81], enemyStars: 4, statBoost: 1.5, drops: [  // Ampharos, Magneton, Magnemite
        { setId: 'swift_wing', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 41, hero: 27, legend: 2 } },
        { setId: 'quick_claw', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 41, hero: 27, legend: 2 } },
      ], pokedollarReward: [50, 70] },
      { enemyLevel: 52, enemies: [181, 239, 100], enemyStars: 4, statBoost: 1.6, drops: [  // Ampharos, Elekid, Voltorb
        { setId: 'swift_wing', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 42, hero: 35, legend: 3 } },
        { setId: 'quick_claw', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 42, hero: 35, legend: 3 } },
      ], pokedollarReward: [55, 75] },
      { enemyLevel: 56, enemies: [181, 82, 239], enemyStars: 5, statBoost: 1.7, drops: [  // Ampharos, Magneton, Elekid
        { setId: 'swift_wing', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 40, hero: 40, legend: 5 } },
        { setId: 'quick_claw', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 40, hero: 40, legend: 5 } },
      ], pokedollarReward: [60, 80], stardustDrop: { chance: 0.05, min: 1, max: 3 } },
      { enemyLevel: 60, enemies: [181, 82, 101], enemyStars: 5, statBoost: 1.9, drops: [  // Ampharos, Magneton, Electrode
        { setId: 'swift_wing', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 35, hero: 47, legend: 8 } },
        { setId: 'quick_claw', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 35, hero: 47, legend: 8 } },
      ], pokedollarReward: [70, 90], stardustDrop: { chance: 0.10, min: 2, max: 4 } },
      { enemyLevel: 65, enemies: [181, 239, 101], enemyStars: 6, statBoost: 2.1, drops: [  // Ampharos, Elekid, Electrode
        { setId: 'swift_wing', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 30, hero: 55, legend: 10 } },
        { setId: 'quick_claw', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 30, hero: 55, legend: 10 } },
      ], pokedollarReward: [80, 100], stardustDrop: { chance: 0.15, min: 3, max: 6 } },
      { enemyLevel: 72, enemies: [181, 239, 101], enemyStars: 6, statBoost: 2.4, drops: [  // Ampharos, Elekid, Electrode
        { setId: 'swift_wing', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 30, hero: 55, legend: 15 } },
        { setId: 'quick_claw', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 30, hero: 55, legend: 15 } },
      ], pokedollarReward: [90, 120], stardustDrop: { chance: 0.20, min: 5, max: 10 } },
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
      { enemyLevel: 15, enemyStars: 1, enemies: [87, 91, 87], drops: [
        { setId: 'scope_lens', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'wise_glasses', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], pokedollarReward: [35, 55] },
      { enemyLevel: 25, enemyStars: 2, statBoost: 1.1, enemies: [91, 87, 124], drops: [
        { setId: 'scope_lens', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'wise_glasses', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], pokedollarReward: [40, 60] },
      { enemyLevel: 35, enemyStars: 3, statBoost: 1.3, enemies: [124, 87, 91], drops: [
        { setId: 'scope_lens', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'wise_glasses', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], pokedollarReward: [45, 65] },
      { enemyLevel: 40, enemies: [215, 124, 131], enemyStars: 3, statBoost: 1.4, drops: [  // Sneasel, Jynx, Lapras
        { setId: 'scope_lens', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 36, hero: 22, legend: 2 } },
        { setId: 'wise_glasses', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 36, hero: 22, legend: 2 } },
      ], pokedollarReward: [50, 70] },
      { enemyLevel: 46, enemies: [131, 221, 124], enemyStars: 4, statBoost: 1.5, drops: [  // Lapras, Piloswine, Jynx
        { setId: 'scope_lens', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 41, hero: 27, legend: 2 } },
        { setId: 'wise_glasses', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 41, hero: 27, legend: 2 } },
      ], pokedollarReward: [55, 75] },
      { enemyLevel: 52, enemies: [221, 215, 225], enemyStars: 4, statBoost: 1.6, drops: [  // Piloswine, Sneasel, Delibird
        { setId: 'scope_lens', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 42, hero: 35, legend: 3 } },
        { setId: 'wise_glasses', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 42, hero: 35, legend: 3 } },
      ], pokedollarReward: [60, 80] },
      { enemyLevel: 56, enemies: [144, 221, 215], enemyStars: 5, statBoost: 1.7, drops: [  // Articuno, Piloswine, Sneasel
        { setId: 'scope_lens', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 40, hero: 40, legend: 5 } },
        { setId: 'wise_glasses', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 40, hero: 40, legend: 5 } },
      ], pokedollarReward: [65, 85], stardustDrop: { chance: 0.05, min: 1, max: 3 } },
      { enemyLevel: 60, enemies: [144, 221, 215], enemyStars: 5, statBoost: 1.9, drops: [  // Articuno, Piloswine, Sneasel
        { setId: 'scope_lens', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 35, hero: 47, legend: 8 } },
        { setId: 'wise_glasses', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 35, hero: 47, legend: 8 } },
      ], pokedollarReward: [75, 95], stardustDrop: { chance: 0.10, min: 2, max: 4 } },
      { enemyLevel: 65, enemies: [144, 221, 225], enemyStars: 6, statBoost: 2.1, drops: [  // Articuno, Piloswine, Delibird
        { setId: 'scope_lens', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 30, hero: 55, legend: 10 } },
        { setId: 'wise_glasses', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 30, hero: 55, legend: 10 } },
      ], pokedollarReward: [85, 110], stardustDrop: { chance: 0.15, min: 3, max: 6 } },
      { enemyLevel: 72, enemies: [144, 221, 215], enemyStars: 6, statBoost: 2.4, drops: [  // Articuno, Piloswine, Sneasel
        { setId: 'scope_lens', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 30, hero: 55, legend: 15 } },
        { setId: 'wise_glasses', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 30, hero: 55, legend: 15 } },
      ], pokedollarReward: [95, 130], stardustDrop: { chance: 0.20, min: 5, max: 10 } },
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
      { enemyLevel: 15, enemyStars: 1, enemies: [147, 147, 130], drops: [
        { setId: 'focus_sash', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
        { setId: 'kings_rock', minStars: 1, maxStars: 2, gradeWeights: { common: 70, rare: 25, hero: 5, legend: 0 } },
      ], pokedollarReward: [35, 55] },
      { enemyLevel: 25, enemyStars: 2, statBoost: 1.1, enemies: [147, 130, 142], drops: [
        { setId: 'focus_sash', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
        { setId: 'kings_rock', minStars: 1, maxStars: 2, gradeWeights: { common: 60, rare: 30, hero: 10, legend: 0 } },
      ], pokedollarReward: [40, 60] },
      { enemyLevel: 35, enemyStars: 3, statBoost: 1.3, enemies: [130, 147, 148], drops: [
        { setId: 'focus_sash', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
        { setId: 'kings_rock', minStars: 1, maxStars: 3, gradeWeights: { common: 50, rare: 35, hero: 15, legend: 0 } },
      ], pokedollarReward: [45, 65] },
      { enemyLevel: 40, enemies: [148, 142, 130], enemyStars: 3, statBoost: 1.4, drops: [
        { setId: 'focus_sash', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 36, hero: 22, legend: 2 } },
        { setId: 'kings_rock', minStars: 2, maxStars: 3, gradeWeights: { common: 40, rare: 36, hero: 22, legend: 2 } },
      ], pokedollarReward: [50, 70] },
      { enemyLevel: 46, enemies: [142, 148, 147], enemyStars: 4, statBoost: 1.5, drops: [
        { setId: 'focus_sash', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 41, hero: 27, legend: 2 } },
        { setId: 'kings_rock', minStars: 2, maxStars: 4, gradeWeights: { common: 30, rare: 41, hero: 27, legend: 2 } },
      ], pokedollarReward: [55, 75] },
      { enemyLevel: 52, enemies: [148, 142, 149], enemyStars: 4, statBoost: 1.6, drops: [
        { setId: 'focus_sash', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 42, hero: 35, legend: 3 } },
        { setId: 'kings_rock', minStars: 2, maxStars: 4, gradeWeights: { common: 20, rare: 42, hero: 35, legend: 3 } },
      ], pokedollarReward: [60, 80] },
      { enemyLevel: 56, enemies: [149, 148, 142], enemyStars: 5, statBoost: 1.7, drops: [
        { setId: 'focus_sash', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 40, hero: 40, legend: 5 } },
        { setId: 'kings_rock', minStars: 3, maxStars: 5, gradeWeights: { common: 15, rare: 40, hero: 40, legend: 5 } },
      ], pokedollarReward: [65, 85], stardustDrop: { chance: 0.05, min: 1, max: 3 } },
      { enemyLevel: 60, enemies: [149, 130, 142], enemyStars: 5, statBoost: 1.9, drops: [  // Dragonite, Gyarados, Aerodactyl
        { setId: 'focus_sash', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 35, hero: 47, legend: 8 } },
        { setId: 'kings_rock', minStars: 3, maxStars: 5, gradeWeights: { common: 10, rare: 35, hero: 47, legend: 8 } },
      ], pokedollarReward: [75, 95], stardustDrop: { chance: 0.10, min: 2, max: 4 } },
      { enemyLevel: 65, enemies: [149, 142, 130], enemyStars: 6, statBoost: 2.1, drops: [  // Dragonite, Aerodactyl, Gyarados
        { setId: 'focus_sash', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 30, hero: 55, legend: 10 } },
        { setId: 'kings_rock', minStars: 3, maxStars: 5, gradeWeights: { common: 5, rare: 30, hero: 55, legend: 10 } },
      ], pokedollarReward: [85, 110], stardustDrop: { chance: 0.15, min: 3, max: 6 } },
      { enemyLevel: 72, enemies: [149, 142, 149], enemyStars: 6, statBoost: 2.4, drops: [  // Dragonite, Aerodactyl, Dragonite
        { setId: 'focus_sash', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 30, hero: 55, legend: 15 } },
        { setId: 'kings_rock', minStars: 4, maxStars: 6, gradeWeights: { common: 0, rare: 30, hero: 55, legend: 15 } },
      ], pokedollarReward: [95, 130], stardustDrop: { chance: 0.20, min: 5, max: 10 } },
    ],
  },
];

export function getItemDungeon(id: number): ItemDungeonDef | undefined {
  return ITEM_DUNGEONS.find(d => d.id === id);
}
