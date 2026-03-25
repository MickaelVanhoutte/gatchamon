import type { DungeonDef } from '../types/evolution.js';

export const DUNGEONS: DungeonDef[] = [
  {
    id: 1,
    name: 'Verdant Cavern',
    icon: 'grass',
    color: '#3a7a2a',
    description: 'A lush cave teeming with plant and insect life. Drops Grass, Poison, and Bug essences.',
    energyCost: 3,
    floors: [
      {
        enemyLevel: 8,
        enemies: [10, 13, 43],  // Caterpie, Weedle, Oddish
        drops: [
          { essenceId: 'grass_low', quantity: [1, 3], chance: 0.8 },
          { essenceId: 'poison_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'bug_low', quantity: [1, 3], chance: 0.8 },
          { essenceId: 'magic_low', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [13, 43, 69],  // Weedle, Oddish, Bellsprout
        drops: [
          { essenceId: 'grass_low', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'poison_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'bug_low', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'grass_mid', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'magic_low', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 22,
        enemies: [43, 69, 10],  // Oddish, Bellsprout, Caterpie
        drops: [
          { essenceId: 'grass_low', quantity: [2, 5], chance: 1.0 },
          { essenceId: 'poison_low', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'bug_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'grass_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'poison_mid', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'magic_low', quantity: [1, 2], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 30,
        enemies: [69, 127, 43],  // Bellsprout, Pinsir, Oddish
        drops: [
          { essenceId: 'grass_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'poison_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'bug_mid', quantity: [2, 3], chance: 0.8 },
          { essenceId: 'grass_high', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'magic_mid', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 40,
        enemies: [127, 69, 13],  // Pinsir, Bellsprout, Weedle
        drops: [
          { essenceId: 'grass_mid', quantity: [3, 5], chance: 1.0 },
          { essenceId: 'poison_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'bug_mid', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'grass_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'poison_high', quantity: [0, 1], chance: 0.25 },
          { essenceId: 'magic_mid', quantity: [1, 2], chance: 0.6 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Volcanic Depths',
    icon: 'fire',
    color: '#d04040',
    description: 'Scorching tunnels of magma and stone. Drops Fire, Rock, and Ground essences.',
    energyCost: 3,
    floors: [
      {
        enemyLevel: 8,
        enemies: [4, 74, 58],  // Charmander, Geodude, Growlithe
        drops: [
          { essenceId: 'fire_low', quantity: [1, 3], chance: 0.8 },
          { essenceId: 'rock_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'ground_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'magic_low', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [58, 4, 74],  // Growlithe, Charmander, Geodude
        drops: [
          { essenceId: 'fire_low', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'rock_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'ground_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'fire_mid', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'magic_low', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 22,
        enemies: [74, 107, 4],  // Geodude, Hitmonchan, Charmander
        drops: [
          { essenceId: 'fire_low', quantity: [2, 5], chance: 1.0 },
          { essenceId: 'rock_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'ground_mid', quantity: [0, 1], chance: 0.4 },
          { essenceId: 'fire_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'magic_low', quantity: [1, 2], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 30,
        enemies: [107, 58, 74],  // Hitmonchan, Growlithe, Geodude
        drops: [
          { essenceId: 'fire_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'rock_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'ground_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'fire_high', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'magic_mid', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 40,
        enemies: [107, 4, 58],  // Hitmonchan, Charmander, Growlithe
        drops: [
          { essenceId: 'fire_mid', quantity: [3, 5], chance: 1.0 },
          { essenceId: 'rock_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'ground_mid', quantity: [2, 3], chance: 0.8 },
          { essenceId: 'fire_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'rock_high', quantity: [0, 1], chance: 0.25 },
          { essenceId: 'magic_mid', quantity: [1, 2], chance: 0.6 },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Abyssal Trench',
    icon: 'wave',
    color: '#4a8ab0',
    description: 'Dark ocean depths hiding ancient power. Drops Water, Ice, and Dragon essences.',
    energyCost: 3,
    floors: [
      {
        enemyLevel: 8,
        enemies: [7, 60, 129],  // Squirtle, Poliwag, Magikarp
        drops: [
          { essenceId: 'water_low', quantity: [1, 3], chance: 0.8 },
          { essenceId: 'ice_low', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'dragon_low', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'magic_low', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [60, 7, 129],  // Poliwag, Squirtle, Magikarp
        drops: [
          { essenceId: 'water_low', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'ice_low', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'dragon_low', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'water_mid', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'magic_low', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 22,
        enemies: [129, 131, 60],  // Magikarp, Lapras, Poliwag
        drops: [
          { essenceId: 'water_low', quantity: [2, 5], chance: 1.0 },
          { essenceId: 'ice_mid', quantity: [0, 2], chance: 0.4 },
          { essenceId: 'dragon_low', quantity: [1, 3], chance: 0.5 },
          { essenceId: 'water_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'magic_low', quantity: [1, 2], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 30,
        enemies: [131, 147, 7],  // Lapras, Dratini, Squirtle
        drops: [
          { essenceId: 'water_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'ice_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'dragon_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'water_high', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'magic_mid', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 40,
        enemies: [147, 131, 60],  // Dratini, Lapras, Poliwag
        drops: [
          { essenceId: 'water_mid', quantity: [3, 5], chance: 1.0 },
          { essenceId: 'ice_mid', quantity: [2, 3], chance: 0.7 },
          { essenceId: 'dragon_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'water_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'dragon_high', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'magic_mid', quantity: [1, 2], chance: 0.6 },
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'Storm Citadel',
    icon: 'electric',
    color: '#f0c030',
    description: 'A fortress crackling with elemental energy. Drops Electric, Flying, Normal, and Psychic essences.',
    energyCost: 3,
    floors: [
      {
        enemyLevel: 8,
        enemies: [16, 39, 25],  // Pidgey, Jigglypuff, Pikachu
        drops: [
          { essenceId: 'electric_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'flying_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'normal_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'psychic_low', quantity: [0, 1], chance: 0.4 },
          { essenceId: 'magic_low', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [25, 16, 133],  // Pikachu, Pidgey, Eevee
        drops: [
          { essenceId: 'electric_low', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'flying_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'normal_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'psychic_low', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'magic_low', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 22,
        enemies: [63, 39, 25],  // Abra, Jigglypuff, Pikachu
        drops: [
          { essenceId: 'electric_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'flying_mid', quantity: [0, 2], chance: 0.4 },
          { essenceId: 'normal_mid', quantity: [0, 2], chance: 0.4 },
          { essenceId: 'psychic_mid', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'electric_low', quantity: [2, 4], chance: 1.0 },
          { essenceId: 'magic_low', quantity: [1, 2], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 30,
        enemies: [133, 63, 16],  // Eevee, Abra, Pidgey
        drops: [
          { essenceId: 'electric_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'flying_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'normal_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'psychic_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'magic_mid', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 40,
        enemies: [63, 133, 25],  // Abra, Eevee, Pikachu
        drops: [
          { essenceId: 'electric_mid', quantity: [3, 5], chance: 1.0 },
          { essenceId: 'flying_mid', quantity: [2, 4], chance: 0.7 },
          { essenceId: 'normal_mid', quantity: [2, 3], chance: 0.7 },
          { essenceId: 'psychic_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'electric_high', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'magic_mid', quantity: [1, 2], chance: 0.6 },
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Shadow Sanctum',
    icon: 'ghost',
    color: '#6a5acd',
    description: 'A haunted temple of dark power. Drops Ghost, Fighting, and Magic essences.',
    energyCost: 4,
    floors: [
      {
        enemyLevel: 10,
        enemies: [92, 41, 66],  // Gastly, Zubat, Machop
        drops: [
          { essenceId: 'ghost_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'fighting_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'poison_low', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'magic_low', quantity: [1, 2], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 18,
        enemies: [66, 92, 41],  // Machop, Gastly, Zubat
        drops: [
          { essenceId: 'ghost_low', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'fighting_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'poison_low', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'magic_low', quantity: [1, 3], chance: 0.7 },
        ],
      },
      {
        enemyLevel: 26,
        enemies: [41, 106, 92],  // Zubat, Hitmonlee, Gastly
        drops: [
          { essenceId: 'ghost_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'fighting_mid', quantity: [0, 2], chance: 0.4 },
          { essenceId: 'poison_mid', quantity: [0, 2], chance: 0.4 },
          { essenceId: 'ghost_low', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'magic_mid', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 35,
        enemies: [106, 107, 92],  // Hitmonlee, Hitmonchan, Gastly
        drops: [
          { essenceId: 'ghost_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'fighting_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'poison_mid', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'magic_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'ghost_high', quantity: [0, 1], chance: 0.2 },
        ],
      },
      {
        enemyLevel: 45,
        enemies: [107, 106, 66],  // Hitmonchan, Hitmonlee, Machop
        drops: [
          { essenceId: 'ghost_mid', quantity: [3, 5], chance: 1.0 },
          { essenceId: 'fighting_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'poison_mid', quantity: [2, 3], chance: 0.7 },
          { essenceId: 'magic_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'ghost_high', quantity: [1, 2], chance: 0.35 },
          { essenceId: 'magic_high', quantity: [0, 1], chance: 0.25 },
        ],
      },
    ],
  },
  // ============================================================
  // NEW DUNGEONS — Fairy, Dark, Steel
  // ============================================================
  {
    id: 6,
    name: 'Moonlit Grove',
    icon: 'fairy',
    color: '#ee99ac',
    description: 'An enchanted forest bathed in moonlight. Drops Fairy, Normal, and Grass essences.',
    energyCost: 3,
    floors: [
      {
        enemyLevel: 10,
        enemies: [174, 209, 39],  // Igglybuff, Snubbull, Jigglypuff
        drops: [
          { essenceId: 'fairy_low', quantity: [1, 3], chance: 0.8 },
          { essenceId: 'normal_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'grass_low', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'magic_low', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 18,
        enemies: [209, 546, 174],  // Snubbull, Cottonee, Igglybuff
        drops: [
          { essenceId: 'fairy_low', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'normal_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'fairy_mid', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'magic_low', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 25,
        enemies: [546, 684, 209],  // Cottonee, Swirlix, Snubbull
        drops: [
          { essenceId: 'fairy_low', quantity: [2, 5], chance: 1.0 },
          { essenceId: 'fairy_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'normal_mid', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'magic_low', quantity: [1, 2], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 33,
        enemies: [684, 282, 546],  // Swirlix, Gardevoir, Cottonee
        drops: [
          { essenceId: 'fairy_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'normal_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'fairy_high', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'magic_mid', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 42,
        enemies: [282, 684, 174],  // Gardevoir, Swirlix, Igglybuff
        drops: [
          { essenceId: 'fairy_mid', quantity: [3, 5], chance: 1.0 },
          { essenceId: 'fairy_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'normal_high', quantity: [0, 1], chance: 0.25 },
          { essenceId: 'magic_mid', quantity: [1, 2], chance: 0.6 },
        ],
      },
    ],
  },
  {
    id: 7,
    name: 'Shadow Crypt',
    icon: 'dark',
    color: '#705848',
    description: 'A crypt shrouded in perpetual darkness. Drops Dark, Ghost, and Psychic essences.',
    energyCost: 3,
    floors: [
      {
        enemyLevel: 10,
        enemies: [198, 261, 215],  // Murkrow, Poochyena, Sneasel
        drops: [
          { essenceId: 'dark_low', quantity: [1, 3], chance: 0.8 },
          { essenceId: 'ghost_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'psychic_low', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'magic_low', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 18,
        enemies: [261, 302, 198],  // Poochyena, Sableye, Murkrow
        drops: [
          { essenceId: 'dark_low', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'ghost_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'dark_mid', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'magic_low', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 25,
        enemies: [302, 215, 261],  // Sableye, Sneasel, Poochyena
        drops: [
          { essenceId: 'dark_low', quantity: [2, 5], chance: 1.0 },
          { essenceId: 'dark_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'ghost_mid', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'magic_low', quantity: [1, 2], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 33,
        enemies: [359, 302, 198],  // Absol, Sableye, Murkrow
        drops: [
          { essenceId: 'dark_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'ghost_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'dark_high', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'magic_mid', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 42,
        enemies: [359, 215, 302],  // Absol, Sneasel, Sableye
        drops: [
          { essenceId: 'dark_mid', quantity: [3, 5], chance: 1.0 },
          { essenceId: 'dark_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'ghost_high', quantity: [0, 1], chance: 0.25 },
          { essenceId: 'magic_mid', quantity: [1, 2], chance: 0.6 },
        ],
      },
    ],
  },
  {
    id: 8,
    name: 'Iron Forge',
    icon: 'steel',
    color: '#b8b8d0',
    description: 'An ancient foundry where metal Pokemon dwell. Drops Steel, Rock, and Electric essences.',
    energyCost: 3,
    floors: [
      {
        enemyLevel: 10,
        enemies: [81, 304, 436],  // Magnemite, Aron, Bronzor
        drops: [
          { essenceId: 'steel_low', quantity: [1, 3], chance: 0.8 },
          { essenceId: 'rock_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'electric_low', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'magic_low', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 18,
        enemies: [304, 436, 81],  // Aron, Bronzor, Magnemite
        drops: [
          { essenceId: 'steel_low', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'rock_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'steel_mid', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'magic_low', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 25,
        enemies: [436, 304, 374],  // Bronzor, Aron, Beldum
        drops: [
          { essenceId: 'steel_low', quantity: [2, 5], chance: 1.0 },
          { essenceId: 'steel_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'rock_mid', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'magic_low', quantity: [1, 2], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 33,
        enemies: [374, 304, 436],  // Beldum, Aron, Bronzor
        drops: [
          { essenceId: 'steel_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'rock_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'steel_high', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'magic_mid', quantity: [0, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 42,
        enemies: [376, 374, 304],  // Metagross, Beldum, Aron
        drops: [
          { essenceId: 'steel_mid', quantity: [3, 5], chance: 1.0 },
          { essenceId: 'steel_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'electric_high', quantity: [0, 1], chance: 0.25 },
          { essenceId: 'magic_mid', quantity: [1, 2], chance: 0.6 },
        ],
      },
    ],
  },
];

export function getDungeon(id: number): DungeonDef | undefined {
  return DUNGEONS.find(d => d.id === id);
}
