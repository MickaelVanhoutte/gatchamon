import type { DungeonDef } from '../types/evolution.js';
import { GEN_RESTRICTION_ENABLED, resolveActiveId } from './gen-filter.js';

export const DUNGEONS: DungeonDef[] = [
  // ============================================================
  // MAGIC ESSENCE DUNGEON — Primary source of Magic essences
  // ============================================================
  {
    id: 9,
    name: 'Arcane Sanctum',
    icon: 'magic',
    color: '#a855f7',
    description: 'A temple of pure arcane energy. The primary source of Magic essences.',
    energyCost: 4,
    floors: [
      {
        enemyLevel: 10,
        enemies: [63, 177, 517],  // Abra, Natu, Munna
        drops: [
          { essenceId: 'magic_low', quantity: [2, 4], chance: 0.9 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [177, 856, 63],  // Natu, Hatenna, Abra
        drops: [
          { essenceId: 'magic_low', quantity: [3, 5], chance: 1.0 },
          { essenceId: 'magic_mid', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 20,
        enemies: [856, 280, 517],  // Hatenna, Ralts, Munna
        enemyStars: 2,
        drops: [
          { essenceId: 'magic_low', quantity: [3, 5], chance: 1.0 },
          { essenceId: 'magic_mid', quantity: [1, 3], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 26,
        enemies: [64, 178, 196],  // Kadabra, Xatu, Espeon
        enemyStars: 2,
        drops: [
          { essenceId: 'magic_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'magic_low', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'magic_high', quantity: [0, 1], chance: 0.15 },
        ],
      },
      {
        enemyLevel: 32,
        enemies: [196, 576, 561],  // Espeon, Gothitelle, Sigilyph
        enemyStars: 3,
        statBoost: 1.15,
        drops: [
          { essenceId: 'magic_mid', quantity: [3, 5], chance: 0.9 },
          { essenceId: 'magic_low', quantity: [2, 4], chance: 1.0 },
          { essenceId: 'magic_high', quantity: [0, 1], chance: 0.25 },
        ],
      },
      {
        enemyLevel: 38,
        enemies: [857, 281, 196],  // Hattrem, Kirlia, Espeon
        enemyStars: 3,
        statBoost: 1.4,
        drops: [
          { essenceId: 'magic_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'magic_high', quantity: [0, 2], chance: 0.35 },
        ],
      },
      {
        enemyLevel: 44,
        enemies: [65, 858, 196],  // Alakazam, Hatterene, Espeon
        enemyStars: 4,
        statBoost: 1.4,
        drops: [
          { essenceId: 'magic_mid', quantity: [4, 7], chance: 1.0 },
          { essenceId: 'magic_high', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 52,
        enemies: [196, 858, 606],  // Espeon, Hatterene, Beheeyem
        enemyStars: 5,
        statBoost: 1.6,
        drops: [
          { essenceId: 'magic_mid', quantity: [4, 8], chance: 1.0 },
          { essenceId: 'magic_high', quantity: [1, 3], chance: 0.6 },
        ],
        stardustDrop: { chance: 0.05, min: 1, max: 2 },
      },
      {
        enemyLevel: 60,
        enemies: [282, 858, 579],  // Gardevoir, Hatterene, Reuniclus
        enemyStars: 5,
        statBoost: 1.8,
        drops: [
          { essenceId: 'magic_high', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'magic_mid', quantity: [5, 8], chance: 1.0 },
        ],
        stardustDrop: { chance: 0.10, min: 2, max: 4 },
      },
      {
        enemyLevel: 70,
        enemies: [282, 858, 65],  // Gardevoir, Hatterene, Alakazam
        enemyStars: 6,
        statBoost: 2.1,
        drops: [
          { essenceId: 'magic_high', quantity: [3, 5], chance: 0.9 },
          { essenceId: 'magic_mid', quantity: [5, 9], chance: 1.0 },
        ],
        stardustDrop: { chance: 0.15, min: 3, max: 6 },
      },
    ],
  },
  {
    id: 1,
    name: 'Verdant Cavern',
    icon: 'grass',
    color: '#3a7a2a',
    description: 'A lush cave teeming with plant and insect life. Drops Grass, Poison, and Bug essences.',
    energyCost: 3,
    floors: [
      {
        enemyLevel: 10,
        enemies: [10, 13, 43],  // Caterpie, Weedle, Oddish
        drops: [
          { essenceId: 'grass_low', quantity: [1, 4], chance: 0.85 },
          { essenceId: 'poison_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'bug_low', quantity: [1, 3], chance: 0.8 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [13, 43, 69],  // Weedle, Oddish, Bellsprout
        drops: [
          { essenceId: 'grass_low', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'poison_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'bug_low', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'grass_mid', quantity: [0, 1], chance: 0.2 },
        ],
      },
      {
        enemyLevel: 20,
        enemies: [43, 69, 10],  // Oddish, Bellsprout, Caterpie
        enemyStars: 2,
        drops: [
          { essenceId: 'grass_low', quantity: [2, 6], chance: 1.0 },
          { essenceId: 'poison_low', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'bug_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'grass_mid', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 26,
        enemies: [45, 182, 127],  // Vileplume, Bellossom, Pinsir
        enemyStars: 2,
        drops: [
          { essenceId: 'grass_mid', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'poison_mid', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'bug_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'grass_high', quantity: [0, 1], chance: 0.1 },
        ],
      },
      {
        enemyLevel: 32,
        enemies: [127, 182, 214],  // Pinsir, Bellossom, Heracross
        enemyStars: 3,
        statBoost: 1.15,
        drops: [
          { essenceId: 'grass_mid', quantity: [2, 5], chance: 0.85 },
          { essenceId: 'poison_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'bug_mid', quantity: [2, 3], chance: 0.8 },
          { essenceId: 'grass_high', quantity: [0, 1], chance: 0.2 },
        ],
      },
      {
        enemyLevel: 38,
        enemies: [154, 45, 212],  // Meganium, Vileplume, Scizor
        enemyStars: 3,
        statBoost: 1.4,
        drops: [
          { essenceId: 'grass_mid', quantity: [2, 6], chance: 0.95 },
          { essenceId: 'poison_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'bug_mid', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'grass_high', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 44,
        enemies: [212, 154, 205],  // Scizor, Meganium, Forretress
        enemyStars: 4,
        statBoost: 1.4,
        drops: [
          { essenceId: 'grass_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'poison_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'bug_mid', quantity: [2, 4], chance: 0.9 },
          { essenceId: 'grass_high', quantity: [1, 2], chance: 0.35 },
          { essenceId: 'poison_high', quantity: [0, 1], chance: 0.2 },
        ],
      },
      {
        enemyLevel: 52,
        enemies: [212, 214, 154],  // Scizor, Heracross, Meganium
        enemyStars: 5,
        statBoost: 1.6,
        drops: [
          { essenceId: 'grass_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'poison_mid', quantity: [2, 5], chance: 0.9 },
          { essenceId: 'bug_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'grass_high', quantity: [1, 4], chance: 0.55 },
          { essenceId: 'poison_high', quantity: [0, 2], chance: 0.3 },
        ],
        stardustDrop: { chance: 0.05, min: 1, max: 2 },
      },
      {
        enemyLevel: 60,
        enemies: [212, 214, 182],  // Scizor, Heracross, Bellossom
        enemyStars: 5,
        statBoost: 1.8,
        drops: [
          { essenceId: 'grass_high', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'poison_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'bug_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'grass_mid', quantity: [3, 6], chance: 1.0 },
        ],
        stardustDrop: { chance: 0.10, min: 2, max: 4 },
      },
      {
        enemyLevel: 70,
        enemies: [212, 214, 154],  // Scizor, Heracross, Meganium
        enemyStars: 6,
        statBoost: 2.1,
        drops: [
          { essenceId: 'grass_high', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'poison_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'bug_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'grass_mid', quantity: [4, 7], chance: 1.0 },
        ],
        stardustDrop: { chance: 0.15, min: 3, max: 6 },
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
        enemyLevel: 10,
        enemies: [4, 74, 58],  // Charmander, Geodude, Growlithe
        drops: [
          { essenceId: 'fire_low', quantity: [1, 4], chance: 0.85 },
          { essenceId: 'rock_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'ground_low', quantity: [1, 2], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [58, 4, 74],  // Growlithe, Charmander, Geodude
        drops: [
          { essenceId: 'fire_low', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'rock_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'ground_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'fire_mid', quantity: [0, 1], chance: 0.2 },
        ],
      },
      {
        enemyLevel: 20,
        enemies: [74, 107, 4],  // Geodude, Hitmonchan, Charmander
        enemyStars: 2,
        drops: [
          { essenceId: 'fire_low', quantity: [2, 6], chance: 1.0 },
          { essenceId: 'rock_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'ground_mid', quantity: [0, 1], chance: 0.4 },
          { essenceId: 'fire_mid', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 26,
        enemies: [59, 240, 112],  // Arcanine, Magby, Rhydon
        enemyStars: 2,
        drops: [
          { essenceId: 'fire_mid', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'rock_mid', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'ground_mid', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'fire_high', quantity: [0, 1], chance: 0.1 },
        ],
      },
      {
        enemyLevel: 32,
        enemies: [59, 240, 157],  // Arcanine, Magby, Typhlosion
        enemyStars: 3,
        statBoost: 1.15,
        drops: [
          { essenceId: 'fire_mid', quantity: [2, 5], chance: 0.85 },
          { essenceId: 'rock_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'ground_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'fire_high', quantity: [0, 1], chance: 0.2 },
        ],
      },
      {
        enemyLevel: 38,
        enemies: [157, 76, 229],  // Typhlosion, Golem, Houndoom
        enemyStars: 3,
        statBoost: 1.4,
        drops: [
          { essenceId: 'fire_mid', quantity: [2, 6], chance: 0.95 },
          { essenceId: 'rock_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'ground_mid', quantity: [2, 3], chance: 0.8 },
          { essenceId: 'fire_high', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 44,
        enemies: [157, 229, 112],  // Typhlosion, Houndoom, Rhydon
        enemyStars: 4,
        statBoost: 1.4,
        drops: [
          { essenceId: 'fire_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'rock_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'ground_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'fire_high', quantity: [1, 2], chance: 0.35 },
          { essenceId: 'rock_high', quantity: [0, 1], chance: 0.2 },
        ],
      },
      {
        enemyLevel: 52,
        enemies: [157, 229, 59],  // Typhlosion, Houndoom, Arcanine
        enemyStars: 5,
        statBoost: 1.6,
        drops: [
          { essenceId: 'fire_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'rock_mid', quantity: [2, 5], chance: 0.9 },
          { essenceId: 'ground_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'fire_high', quantity: [1, 4], chance: 0.55 },
          { essenceId: 'rock_high', quantity: [0, 2], chance: 0.3 },
        ],
        stardustDrop: { chance: 0.05, min: 1, max: 2 },
      },
      {
        enemyLevel: 60,
        enemies: [157, 229, 240],  // Typhlosion, Houndoom, Magby
        enemyStars: 5,
        statBoost: 1.8,
        drops: [
          { essenceId: 'fire_high', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'rock_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'ground_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'fire_mid', quantity: [3, 6], chance: 1.0 },
        ],
        stardustDrop: { chance: 0.10, min: 2, max: 4 },
      },
      {
        enemyLevel: 70,
        enemies: [157, 229, 59],  // Typhlosion, Houndoom, Arcanine
        enemyStars: 6,
        statBoost: 2.1,
        drops: [
          { essenceId: 'fire_high', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'rock_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'ground_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'fire_mid', quantity: [4, 7], chance: 1.0 },
        ],
        stardustDrop: { chance: 0.15, min: 3, max: 6 },
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
        enemyLevel: 10,
        enemies: [7, 60, 129],  // Squirtle, Poliwag, Magikarp
        drops: [
          { essenceId: 'water_low', quantity: [1, 4], chance: 0.85 },
          { essenceId: 'ice_low', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'dragon_low', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [60, 7, 129],  // Poliwag, Squirtle, Magikarp
        drops: [
          { essenceId: 'water_low', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'ice_low', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'dragon_low', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'water_mid', quantity: [0, 1], chance: 0.2 },
        ],
      },
      {
        enemyLevel: 20,
        enemies: [129, 131, 60],  // Magikarp, Lapras, Poliwag
        enemyStars: 2,
        drops: [
          { essenceId: 'water_low', quantity: [2, 6], chance: 1.0 },
          { essenceId: 'ice_mid', quantity: [0, 2], chance: 0.4 },
          { essenceId: 'dragon_low', quantity: [1, 3], chance: 0.5 },
          { essenceId: 'water_mid', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 26,
        enemies: [131, 171, 121],  // Lapras, Lanturn, Starmie
        enemyStars: 2,
        drops: [
          { essenceId: 'water_mid', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'ice_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'dragon_mid', quantity: [0, 1], chance: 0.4 },
          { essenceId: 'water_high', quantity: [0, 1], chance: 0.1 },
        ],
      },
      {
        enemyLevel: 32,
        enemies: [131, 171, 160],  // Lapras, Lanturn, Feraligatr
        enemyStars: 3,
        statBoost: 1.15,
        drops: [
          { essenceId: 'water_mid', quantity: [2, 5], chance: 0.85 },
          { essenceId: 'ice_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'dragon_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'water_high', quantity: [0, 1], chance: 0.2 },
        ],
      },
      {
        enemyLevel: 38,
        enemies: [160, 131, 130],  // Feraligatr, Lapras, Gyarados
        enemyStars: 3,
        statBoost: 1.4,
        drops: [
          { essenceId: 'water_mid', quantity: [2, 6], chance: 0.95 },
          { essenceId: 'ice_mid', quantity: [2, 3], chance: 0.7 },
          { essenceId: 'dragon_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'water_high', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 44,
        enemies: [160, 171, 130],  // Feraligatr, Lanturn, Gyarados
        enemyStars: 4,
        statBoost: 1.4,
        drops: [
          { essenceId: 'water_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'ice_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'dragon_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'water_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'dragon_high', quantity: [0, 1], chance: 0.2 },
        ],
      },
      {
        enemyLevel: 52,
        enemies: [160, 131, 171],  // Feraligatr, Lapras, Lanturn
        enemyStars: 5,
        statBoost: 1.6,
        drops: [
          { essenceId: 'water_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'ice_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'dragon_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'water_high', quantity: [1, 4], chance: 0.55 },
          { essenceId: 'dragon_high', quantity: [0, 1], chance: 0.3 },
        ],
        stardustDrop: { chance: 0.05, min: 1, max: 2 },
      },
      {
        enemyLevel: 60,
        enemies: [160, 131, 130],  // Feraligatr, Lapras, Gyarados
        enemyStars: 5,
        statBoost: 1.8,
        drops: [
          { essenceId: 'water_high', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'ice_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'dragon_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'water_mid', quantity: [3, 6], chance: 1.0 },
        ],
        stardustDrop: { chance: 0.10, min: 2, max: 4 },
      },
      {
        enemyLevel: 70,
        enemies: [160, 171, 130],  // Feraligatr, Lanturn, Gyarados
        enemyStars: 6,
        statBoost: 2.1,
        drops: [
          { essenceId: 'water_high', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'ice_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'dragon_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'water_mid', quantity: [4, 7], chance: 1.0 },
        ],
        stardustDrop: { chance: 0.15, min: 3, max: 6 },
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
        enemyLevel: 10,
        enemies: [16, 39, 25],  // Pidgey, Jigglypuff, Pikachu
        drops: [
          { essenceId: 'electric_low', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'flying_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'normal_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'psychic_low', quantity: [0, 1], chance: 0.4 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [25, 16, 133],  // Pikachu, Pidgey, Eevee
        drops: [
          { essenceId: 'electric_low', quantity: [2, 5], chance: 0.85 },
          { essenceId: 'flying_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'normal_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'psychic_low', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 20,
        enemies: [63, 39, 25],  // Abra, Jigglypuff, Pikachu
        enemyStars: 2,
        drops: [
          { essenceId: 'electric_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'flying_mid', quantity: [0, 2], chance: 0.4 },
          { essenceId: 'normal_mid', quantity: [0, 2], chance: 0.4 },
          { essenceId: 'psychic_mid', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'electric_low', quantity: [2, 5], chance: 1.0 },
        ],
      },
      {
        enemyLevel: 26,
        enemies: [65, 239, 85],  // Alakazam, Elekid, Dodrio
        enemyStars: 2,
        drops: [
          { essenceId: 'electric_mid', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'flying_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'normal_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'psychic_mid', quantity: [0, 2], chance: 0.4 },
        ],
      },
      {
        enemyLevel: 32,
        enemies: [181, 125, 85],  // Ampharos, Electabuzz, Dodrio
        enemyStars: 3,
        statBoost: 1.15,
        drops: [
          { essenceId: 'electric_mid', quantity: [2, 5], chance: 0.85 },
          { essenceId: 'flying_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'normal_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'psychic_mid', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 38,
        enemies: [181, 239, 143],  // Ampharos, Elekid, Snorlax
        enemyStars: 3,
        statBoost: 1.4,
        drops: [
          { essenceId: 'electric_mid', quantity: [2, 6], chance: 0.95 },
          { essenceId: 'flying_mid', quantity: [2, 4], chance: 0.7 },
          { essenceId: 'normal_mid', quantity: [2, 3], chance: 0.7 },
          { essenceId: 'psychic_mid', quantity: [1, 3], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 44,
        enemies: [181, 125, 143],  // Ampharos, Electabuzz, Snorlax
        enemyStars: 4,
        statBoost: 1.4,
        drops: [
          { essenceId: 'electric_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'flying_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'normal_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'psychic_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'electric_high', quantity: [0, 1], chance: 0.25 },
        ],
      },
      {
        enemyLevel: 52,
        enemies: [181, 125, 239],  // Ampharos, Electabuzz, Elekid
        enemyStars: 5,
        statBoost: 1.6,
        drops: [
          { essenceId: 'electric_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'flying_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'normal_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'psychic_high', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'electric_high', quantity: [1, 3], chance: 0.45 },
        ],
        stardustDrop: { chance: 0.05, min: 1, max: 2 },
      },
      {
        enemyLevel: 60,
        enemies: [181, 125, 143],  // Ampharos, Electabuzz, Snorlax
        enemyStars: 5,
        statBoost: 1.8,
        drops: [
          { essenceId: 'electric_high', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'flying_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'psychic_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'electric_mid', quantity: [3, 6], chance: 1.0 },
        ],
        stardustDrop: { chance: 0.10, min: 2, max: 4 },
      },
      {
        enemyLevel: 70,
        enemies: [181, 239, 143],  // Ampharos, Elekid, Snorlax
        enemyStars: 6,
        statBoost: 2.1,
        drops: [
          { essenceId: 'electric_high', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'flying_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'normal_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'psychic_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'electric_mid', quantity: [4, 7], chance: 1.0 },
        ],
        stardustDrop: { chance: 0.15, min: 3, max: 6 },
      },
    ],
  },
  {
    id: 5,
    name: 'Shadow Sanctum',
    icon: 'ghost',
    color: '#6a5acd',
    description: 'A haunted temple of dark power. Drops Ghost, Fighting, and Poison essences.',
    energyCost: 4,
    floors: [
      {
        enemyLevel: 10,
        enemies: [92, 41, 66],  // Gastly, Zubat, Machop
        drops: [
          { essenceId: 'ghost_low', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'fighting_low', quantity: [1, 3], chance: 0.65 },
          { essenceId: 'poison_low', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [66, 92, 41],  // Machop, Gastly, Zubat
        drops: [
          { essenceId: 'ghost_low', quantity: [2, 5], chance: 0.85 },
          { essenceId: 'fighting_low', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'poison_low', quantity: [1, 3], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 20,
        enemies: [41, 106, 92],  // Zubat, Hitmonlee, Gastly
        enemyStars: 2,
        drops: [
          { essenceId: 'ghost_mid', quantity: [1, 3], chance: 0.55 },
          { essenceId: 'fighting_mid', quantity: [0, 2], chance: 0.4 },
          { essenceId: 'poison_mid', quantity: [0, 2], chance: 0.4 },
          { essenceId: 'ghost_low', quantity: [2, 4], chance: 0.9 },
        ],
      },
      {
        enemyLevel: 26,
        enemies: [94, 68, 169],  // Gengar, Machamp, Crobat
        enemyStars: 2,
        drops: [
          { essenceId: 'ghost_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'fighting_mid', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'poison_mid', quantity: [1, 3], chance: 0.55 },
          { essenceId: 'ghost_high', quantity: [0, 1], chance: 0.1 },
          { essenceId: 'fighting_high', quantity: [0, 1], chance: 0.1 },
        ],
      },
      {
        enemyLevel: 32,
        enemies: [94, 214, 169],  // Gengar, Heracross, Crobat
        enemyStars: 3,
        statBoost: 1.15,
        drops: [
          { essenceId: 'ghost_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'fighting_mid', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'poison_mid', quantity: [1, 3], chance: 0.65 },
          { essenceId: 'ghost_high', quantity: [0, 1], chance: 0.25 },
        ],
      },
      {
        enemyLevel: 38,
        enemies: [94, 237, 97],  // Gengar, Hitmontop, Hypno
        enemyStars: 3,
        statBoost: 1.4,
        drops: [
          { essenceId: 'ghost_mid', quantity: [3, 5], chance: 0.9 },
          { essenceId: 'fighting_mid', quantity: [2, 5], chance: 0.85 },
          { essenceId: 'poison_mid', quantity: [2, 3], chance: 0.7 },
          { essenceId: 'ghost_high', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 44,
        enemies: [94, 237, 169],  // Gengar, Hitmontop, Crobat
        enemyStars: 4,
        statBoost: 1.4,
        drops: [
          { essenceId: 'ghost_mid', quantity: [3, 5], chance: 1.0 },
          { essenceId: 'fighting_mid', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'poison_mid', quantity: [2, 3], chance: 0.7 },
          { essenceId: 'ghost_high', quantity: [1, 3], chance: 0.4 },
          { essenceId: 'poison_high', quantity: [0, 1], chance: 0.25 },
        ],
      },
      {
        enemyLevel: 52,
        enemies: [94, 214, 169],  // Gengar, Heracross, Crobat
        enemyStars: 5,
        statBoost: 1.6,
        drops: [
          { essenceId: 'ghost_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'fighting_mid', quantity: [2, 6], chance: 0.95 },
          { essenceId: 'ghost_high', quantity: [1, 3], chance: 0.5 },
          { essenceId: 'poison_high', quantity: [1, 2], chance: 0.4 },
        ],
        stardustDrop: { chance: 0.05, min: 1, max: 2 },
      },
      {
        enemyLevel: 60,
        enemies: [94, 237, 169],  // Gengar, Hitmontop, Crobat
        enemyStars: 5,
        statBoost: 1.8,
        drops: [
          { essenceId: 'ghost_high', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'fighting_high', quantity: [1, 3], chance: 0.55 },
          { essenceId: 'poison_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'ghost_mid', quantity: [3, 6], chance: 1.0 },
        ],
        stardustDrop: { chance: 0.10, min: 2, max: 4 },
      },
      {
        enemyLevel: 70,
        enemies: [94, 214, 237],  // Gengar, Heracross, Hitmontop
        enemyStars: 6,
        statBoost: 2.1,
        drops: [
          { essenceId: 'ghost_high', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'fighting_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'poison_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'ghost_mid', quantity: [4, 7], chance: 1.0 },
        ],
        stardustDrop: { chance: 0.15, min: 3, max: 6 },
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
          { essenceId: 'fairy_low', quantity: [1, 4], chance: 0.85 },
          { essenceId: 'normal_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'grass_low', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [209, 546, 174],  // Snubbull, Cottonee, Igglybuff
        drops: [
          { essenceId: 'fairy_low', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'normal_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'fairy_mid', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'grass_low', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 20,
        enemies: [546, 684, 209],  // Cottonee, Swirlix, Snubbull
        enemyStars: 2,
        drops: [
          { essenceId: 'fairy_low', quantity: [2, 6], chance: 1.0 },
          { essenceId: 'fairy_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'normal_mid', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'grass_mid', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 26,
        enemies: [282, 176, 684],  // Gardevoir, Togetic, Swirlix
        enemyStars: 2,
        drops: [
          { essenceId: 'fairy_mid', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'normal_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'fairy_high', quantity: [0, 1], chance: 0.1 },
          { essenceId: 'grass_mid', quantity: [0, 2], chance: 0.4 },
        ],
      },
      {
        enemyLevel: 32,
        enemies: [282, 176, 210],  // Gardevoir, Togetic, Granbull
        enemyStars: 3,
        statBoost: 1.15,
        drops: [
          { essenceId: 'fairy_mid', quantity: [2, 5], chance: 0.85 },
          { essenceId: 'normal_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'fairy_high', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'grass_mid', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 38,
        enemies: [282, 184, 210],  // Gardevoir, Azumarill, Granbull
        enemyStars: 3,
        statBoost: 1.4,
        drops: [
          { essenceId: 'fairy_mid', quantity: [3, 6], chance: 0.95 },
          { essenceId: 'fairy_high', quantity: [0, 2], chance: 0.3 },
          { essenceId: 'normal_mid', quantity: [2, 3], chance: 0.7 },
          { essenceId: 'grass_mid', quantity: [1, 3], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 44,
        enemies: [282, 176, 184],  // Gardevoir, Togetic, Azumarill
        enemyStars: 4,
        statBoost: 1.4,
        drops: [
          { essenceId: 'fairy_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'fairy_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'normal_high', quantity: [0, 1], chance: 0.25 },
          { essenceId: 'grass_mid', quantity: [1, 3], chance: 0.7 },
        ],
      },
      {
        enemyLevel: 52,
        enemies: [282, 184, 210],  // Gardevoir, Azumarill, Granbull
        enemyStars: 5,
        statBoost: 1.6,
        drops: [
          { essenceId: 'fairy_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'fairy_high', quantity: [1, 4], chance: 0.55 },
          { essenceId: 'normal_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'grass_high', quantity: [0, 1], chance: 0.3 },
        ],
        stardustDrop: { chance: 0.05, min: 1, max: 2 },
      },
      {
        enemyLevel: 60,
        enemies: [282, 176, 184],  // Gardevoir, Togetic, Azumarill
        enemyStars: 5,
        statBoost: 1.8,
        drops: [
          { essenceId: 'fairy_high', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'normal_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'fairy_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'grass_high', quantity: [1, 2], chance: 0.5 },
        ],
        stardustDrop: { chance: 0.10, min: 2, max: 4 },
      },
      {
        enemyLevel: 70,
        enemies: [282, 176, 184],  // Gardevoir, Togetic, Azumarill
        enemyStars: 6,
        statBoost: 2.1,
        drops: [
          { essenceId: 'fairy_high', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'normal_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'fairy_mid', quantity: [4, 7], chance: 1.0 },
          { essenceId: 'grass_high', quantity: [1, 2], chance: 0.5 },
        ],
        stardustDrop: { chance: 0.15, min: 3, max: 6 },
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
          { essenceId: 'dark_low', quantity: [1, 4], chance: 0.85 },
          { essenceId: 'ghost_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'psychic_low', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [261, 302, 198],  // Poochyena, Sableye, Murkrow
        drops: [
          { essenceId: 'dark_low', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'ghost_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'dark_mid', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'psychic_low', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 20,
        enemies: [302, 215, 261],  // Sableye, Sneasel, Poochyena
        enemyStars: 2,
        drops: [
          { essenceId: 'dark_low', quantity: [2, 6], chance: 1.0 },
          { essenceId: 'dark_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'ghost_mid', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'psychic_mid', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 26,
        enemies: [359, 197, 215],  // Absol, Umbreon, Sneasel
        enemyStars: 2,
        drops: [
          { essenceId: 'dark_mid', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'ghost_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'dark_high', quantity: [0, 1], chance: 0.1 },
          { essenceId: 'psychic_mid', quantity: [0, 2], chance: 0.4 },
        ],
      },
      {
        enemyLevel: 32,
        enemies: [359, 197, 229],  // Absol, Umbreon, Houndoom
        enemyStars: 3,
        statBoost: 1.15,
        drops: [
          { essenceId: 'dark_mid', quantity: [2, 5], chance: 0.85 },
          { essenceId: 'ghost_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'dark_high', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'psychic_mid', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 38,
        enemies: [229, 215, 302],  // Houndoom, Sneasel, Sableye
        enemyStars: 3,
        statBoost: 1.4,
        drops: [
          { essenceId: 'dark_mid', quantity: [3, 6], chance: 0.95 },
          { essenceId: 'dark_high', quantity: [0, 2], chance: 0.3 },
          { essenceId: 'ghost_mid', quantity: [2, 3], chance: 0.7 },
          { essenceId: 'psychic_mid', quantity: [1, 3], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 44,
        enemies: [229, 197, 302],  // Houndoom, Umbreon, Sableye
        enemyStars: 4,
        statBoost: 1.4,
        drops: [
          { essenceId: 'dark_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'dark_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'ghost_high', quantity: [0, 1], chance: 0.25 },
          { essenceId: 'psychic_mid', quantity: [1, 3], chance: 0.7 },
        ],
      },
      {
        enemyLevel: 52,
        enemies: [359, 229, 197],  // Absol, Houndoom, Umbreon
        enemyStars: 5,
        statBoost: 1.6,
        drops: [
          { essenceId: 'dark_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'dark_high', quantity: [1, 4], chance: 0.55 },
          { essenceId: 'ghost_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'psychic_high', quantity: [0, 1], chance: 0.3 },
        ],
        stardustDrop: { chance: 0.05, min: 1, max: 2 },
      },
      {
        enemyLevel: 60,
        enemies: [229, 197, 302],  // Houndoom, Umbreon, Sableye
        enemyStars: 5,
        statBoost: 1.8,
        drops: [
          { essenceId: 'dark_high', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'ghost_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'dark_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'psychic_high', quantity: [1, 2], chance: 0.5 },
        ],
        stardustDrop: { chance: 0.10, min: 2, max: 4 },
      },
      {
        enemyLevel: 70,
        enemies: [229, 197, 359],  // Houndoom, Umbreon, Absol
        enemyStars: 6,
        statBoost: 2.1,
        drops: [
          { essenceId: 'dark_high', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'ghost_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'dark_mid', quantity: [4, 7], chance: 1.0 },
          { essenceId: 'psychic_high', quantity: [1, 2], chance: 0.5 },
        ],
        stardustDrop: { chance: 0.15, min: 3, max: 6 },
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
          { essenceId: 'steel_low', quantity: [1, 4], chance: 0.85 },
          { essenceId: 'rock_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'electric_low', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 15,
        enemies: [304, 436, 81],  // Aron, Bronzor, Magnemite
        drops: [
          { essenceId: 'steel_low', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'rock_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'steel_mid', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'electric_low', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 20,
        enemies: [436, 304, 374],  // Bronzor, Aron, Beldum
        enemyStars: 2,
        drops: [
          { essenceId: 'steel_low', quantity: [2, 6], chance: 1.0 },
          { essenceId: 'steel_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'rock_mid', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'electric_mid', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 26,
        enemies: [376, 205, 437],  // Metagross, Forretress, Bronzong
        enemyStars: 2,
        drops: [
          { essenceId: 'steel_mid', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'rock_mid', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'steel_high', quantity: [0, 1], chance: 0.1 },
          { essenceId: 'electric_mid', quantity: [0, 2], chance: 0.4 },
        ],
      },
      {
        enemyLevel: 32,
        enemies: [208, 306, 437],  // Steelix, Aggron, Bronzong
        enemyStars: 3,
        statBoost: 1.15,
        drops: [
          { essenceId: 'steel_mid', quantity: [2, 5], chance: 0.85 },
          { essenceId: 'rock_mid', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'steel_high', quantity: [0, 1], chance: 0.2 },
          { essenceId: 'electric_mid', quantity: [1, 2], chance: 0.5 },
        ],
      },
      {
        enemyLevel: 38,
        enemies: [212, 306, 227],  // Scizor, Aggron, Skarmory
        enemyStars: 3,
        statBoost: 1.4,
        drops: [
          { essenceId: 'steel_mid', quantity: [3, 6], chance: 0.95 },
          { essenceId: 'steel_high', quantity: [0, 2], chance: 0.3 },
          { essenceId: 'rock_mid', quantity: [2, 3], chance: 0.7 },
          { essenceId: 'electric_mid', quantity: [1, 3], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 44,
        enemies: [208, 212, 437],  // Steelix, Scizor, Bronzong
        enemyStars: 4,
        statBoost: 1.4,
        drops: [
          { essenceId: 'steel_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'steel_high', quantity: [1, 2], chance: 0.4 },
          { essenceId: 'electric_mid', quantity: [1, 3], chance: 0.7 },
        ],
      },
      {
        enemyLevel: 52,
        enemies: [227, 208, 205],  // Skarmory, Steelix, Forretress
        enemyStars: 5,
        statBoost: 1.6,
        drops: [
          { essenceId: 'steel_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'steel_high', quantity: [1, 4], chance: 0.55 },
          { essenceId: 'electric_high', quantity: [0, 1], chance: 0.3 },
        ],
        stardustDrop: { chance: 0.05, min: 1, max: 2 },
      },
      {
        enemyLevel: 60,
        enemies: [212, 208, 227],  // Scizor, Steelix, Skarmory
        enemyStars: 5,
        statBoost: 1.8,
        drops: [
          { essenceId: 'steel_high', quantity: [1, 4], chance: 0.75 },
          { essenceId: 'rock_high', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'steel_mid', quantity: [3, 6], chance: 1.0 },
          { essenceId: 'electric_high', quantity: [1, 2], chance: 0.5 },
        ],
        stardustDrop: { chance: 0.10, min: 2, max: 4 },
      },
      {
        enemyLevel: 70,
        enemies: [212, 208, 205],  // Scizor, Steelix, Forretress
        enemyStars: 6,
        statBoost: 2.1,
        drops: [
          { essenceId: 'steel_high', quantity: [2, 5], chance: 0.95 },
          { essenceId: 'rock_high', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'steel_mid', quantity: [4, 7], chance: 1.0 },
          { essenceId: 'electric_high', quantity: [1, 2], chance: 0.5 },
        ],
        stardustDrop: { chance: 0.15, min: 3, max: 6 },
      },
    ],
  },
];

export function getDungeon(id: number): DungeonDef | undefined {
  const dungeon = DUNGEONS.find(d => d.id === id);
  if (!dungeon || !GEN_RESTRICTION_ENABLED) return dungeon;
  return {
    ...dungeon,
    floors: dungeon.floors.map(f => ({
      ...f,
      enemies: f.enemies.map(resolveActiveId),
    })),
  };
}
