import type { DungeonDef } from '../types/evolution.js';

export const DUNGEONS: DungeonDef[] = [
  {
    id: 1,
    name: 'Verdant Cavern',
    icon: '\u{1F33F}',
    color: '#3a7a2a',
    description: 'A lush cave teeming with plant and insect life. Drops Grass, Poison, and Bug essences.',
    enemyPool: [10, 13, 43, 69, 127],  // Caterpie, Weedle, Oddish, Bellsprout, Pinsir
    energyCost: 5,
    floors: [
      {
        enemyLevel: 8,
        drops: [
          { essenceId: 'grass_low', quantity: [1, 3], chance: 0.8 },
          { essenceId: 'poison_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'bug_low', quantity: [1, 3], chance: 0.8 },
          { essenceId: 'magic_low', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 15,
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
    icon: '\u{1F525}',
    color: '#d04040',
    description: 'Scorching tunnels of magma and stone. Drops Fire, Rock, and Ground essences.',
    enemyPool: [4, 58, 74, 107],  // Charmander, Growlithe, Geodude, Hitmonchan
    energyCost: 5,
    floors: [
      {
        enemyLevel: 8,
        drops: [
          { essenceId: 'fire_low', quantity: [1, 3], chance: 0.8 },
          { essenceId: 'rock_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'ground_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'magic_low', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 15,
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
    icon: '\u{1F30A}',
    color: '#4a8ab0',
    description: 'Dark ocean depths hiding ancient power. Drops Water, Ice, and Dragon essences.',
    enemyPool: [7, 60, 129, 131, 147],  // Squirtle, Poliwag, Magikarp, Lapras, Dratini
    energyCost: 5,
    floors: [
      {
        enemyLevel: 8,
        drops: [
          { essenceId: 'water_low', quantity: [1, 3], chance: 0.8 },
          { essenceId: 'ice_low', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'dragon_low', quantity: [0, 1], chance: 0.3 },
          { essenceId: 'magic_low', quantity: [0, 1], chance: 0.3 },
        ],
      },
      {
        enemyLevel: 15,
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
    icon: '\u26A1',
    color: '#f0c030',
    description: 'A fortress crackling with elemental energy. Drops Electric, Flying, Normal, and Psychic essences.',
    enemyPool: [25, 16, 63, 39, 133],  // Pikachu, Pidgey, Abra, Jigglypuff, Eevee
    energyCost: 5,
    floors: [
      {
        enemyLevel: 8,
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
    icon: '\u{1F47B}',
    color: '#6a5acd',
    description: 'A haunted temple of dark power. Drops Ghost, Fighting, and Magic essences.',
    enemyPool: [92, 66, 106, 107, 41],  // Gastly, Machop, Hitmonlee, Hitmonchan, Zubat
    energyCost: 6,
    floors: [
      {
        enemyLevel: 10,
        drops: [
          { essenceId: 'ghost_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'fighting_low', quantity: [1, 2], chance: 0.6 },
          { essenceId: 'poison_low', quantity: [1, 2], chance: 0.5 },
          { essenceId: 'magic_low', quantity: [1, 2], chance: 0.6 },
        ],
      },
      {
        enemyLevel: 18,
        drops: [
          { essenceId: 'ghost_low', quantity: [2, 4], chance: 0.8 },
          { essenceId: 'fighting_low', quantity: [1, 3], chance: 0.7 },
          { essenceId: 'poison_low', quantity: [1, 3], chance: 0.6 },
          { essenceId: 'magic_low', quantity: [1, 3], chance: 0.7 },
        ],
      },
      {
        enemyLevel: 26,
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
];

export function getDungeon(id: number): DungeonDef | undefined {
  return DUNGEONS.find(d => d.id === id);
}
