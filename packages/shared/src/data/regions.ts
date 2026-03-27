export interface RegionDef {
  id: number;
  name: string;
  icon: string;
  color: string;
  commonPool: number[];    // template IDs for floors 1-9
  bossPool: number[];      // template IDs for floor 10
  bossCompanions: number[]; // 2 template IDs flanking the boss on floor 10
  floorNames: string[];    // 10 themed names
  mapPosition: { x: number; y: number };
}

export const REGIONS: RegionDef[] = [
  {
    id: 1,
    name: 'Verdant Woods',
    icon: 'tree',
    color: '#3a7a2a',
    commonPool: [10, 13, 69, 43],       // Caterpie, Weedle, Bellsprout, Oddish
    bossPool: [127],                      // Pinsir
    bossCompanions: [10, 13],             // Caterpie, Weedle
    floorNames: [
      'Mossy Path', 'Thicket', 'Fern Hollow', 'Vine Bridge',
      'Mushroom Glade', 'Ancient Oak', 'Spider Den', 'Canopy Walk',
      'Deep Brush', 'Heart of the Forest',
    ],
    mapPosition: { x: 100, y: 380 },
  },
  {
    id: 2,
    name: 'Windswept Plains',
    icon: 'wheat',
    color: '#c4a74a',
    commonPool: [16, 19, 21, 39],        // Pidgey, Rattata, Spearow, Jigglypuff
    bossPool: [128],                      // Tauros
    bossCompanions: [16, 19],             // Pidgey, Rattata
    floorNames: [
      'Tall Grass', 'Open Field', 'Windy Hill', 'Stampede Trail',
      'Dusty Road', 'Hawk Ridge', 'Grazing Meadow', 'Stone Fence',
      'Cyclone Pass', 'The Great Expanse',
    ],
    mapPosition: { x: 280, y: 220 },
  },
  {
    id: 3,
    name: 'Toxic Marsh',
    icon: 'poison',
    color: '#8a4a8a',
    commonPool: [41, 13, 43, 92],        // Zubat, Weedle, Oddish, Gastly
    bossPool: [1],                        // Bulbasaur
    bossCompanions: [41, 92],             // Zubat, Gastly
    floorNames: [
      'Bog Entrance', 'Murky Shallows', 'Poison Pools', 'Rotten Log',
      'Miasma Pit', 'Sludge Banks', 'Gas Vents', 'Fungus Cavern',
      'Venom Falls', 'Swamp Heart',
    ],
    mapPosition: { x: 460, y: 420 },
  },
  {
    id: 4,
    name: 'Crystal Caverns',
    icon: 'rock',
    color: '#8a7a5a',
    commonPool: [74, 41, 19, 66],        // Geodude, Zubat, Rattata, Machop
    bossPool: [142],                      // Aerodactyl
    bossCompanions: [74, 66],             // Geodude, Machop
    floorNames: [
      'Cave Mouth', 'Echo Chamber', 'Crystal Vein', 'Stalactite Hall',
      'Underground River', 'Gem Deposit', 'Collapsed Tunnel', 'Lava Tube',
      'Fossil Chamber', 'Ancient Sanctum',
    ],
    mapPosition: { x: 650, y: 250 },
  },
  {
    id: 5,
    name: 'Azure Coast',
    icon: 'wave',
    color: '#4a8ab0',
    commonPool: [129, 60, 7],            // Magikarp, Poliwag, Squirtle
    bossPool: [131],                      // Lapras
    bossCompanions: [60, 7],              // Poliwag, Squirtle
    floorNames: [
      'Sandy Shore', 'Tide Pools', 'Coral Reef', 'Sea Cave',
      'Sunken Ship', 'Whirlpool Bay', 'Kelp Forest', 'Deep Trench',
      'Storm Strait', 'Abyssal Throne',
    ],
    mapPosition: { x: 840, y: 440 },
  },
  {
    id: 6,
    name: 'Thunderpeak Ridge',
    icon: 'electric',
    color: '#f0c030',
    commonPool: [25, 66, 74],            // Pikachu, Machop, Geodude
    bossPool: [106],                      // Hitmonlee
    bossCompanions: [25, 74],             // Pikachu, Geodude
    floorNames: [
      'Foothills', 'Charged Path', 'Lightning Rocks', 'Thunder Plateau',
      'Static Field', 'Storm Lookout', 'Bolt Canyon', 'Powerline Ridge',
      'Voltaic Peak', 'Arena of Storms',
    ],
    mapPosition: { x: 1020, y: 200 },
  },
  {
    id: 7,
    name: 'Ember Highlands',
    icon: 'fire',
    color: '#d04040',
    commonPool: [4, 58, 74],             // Charmander, Growlithe, Geodude
    bossPool: [107],                      // Hitmonchan
    bossCompanions: [4, 58],              // Charmander, Growlithe
    floorNames: [
      'Ash Trail', 'Scorched Earth', 'Lava Fields', 'Cinder Ridge',
      'Magma Pools', 'Flame Geysers', 'Inferno Pass', 'Obsidian Cliff',
      'Eruption Site', 'Volcanic Core',
    ],
    mapPosition: { x: 1180, y: 380 },
  },
  {
    id: 8,
    name: 'Phantom Ruins',
    icon: 'ghost',
    color: '#6a5acd',
    commonPool: [92, 63, 41, 39],        // Gastly, Abra, Zubat, Jigglypuff
    bossPool: [115],                      // Kangaskhan
    bossCompanions: [92, 63],             // Gastly, Abra
    floorNames: [
      'Crumbling Gate', 'Haunted Hall', 'Spirit Well', 'Cursed Library',
      'Shadow Corridor', 'Phantom Gallery', 'Mind Maze', 'Wailing Chamber',
      'Void Altar', 'Throne of Echoes',
    ],
    mapPosition: { x: 1340, y: 180 },
  },
  {
    id: 9,
    name: 'Frozen Tundra',
    icon: 'ice',
    color: '#88ccee',
    commonPool: [60, 133, 147],          // Poliwag, Eevee, Dratini
    bossPool: [131],                      // Lapras
    bossCompanions: [133, 147],           // Eevee, Dratini
    floorNames: [
      'Frost Gate', 'Snowdrift Path', 'Ice Bridge', 'Blizzard Valley',
      'Frozen Lake', 'Glacier Caves', 'Aurora Ridge', 'Permafrost Depths',
      'Crystal Spire', 'Heart of Winter',
    ],
    mapPosition: { x: 1500, y: 350 },
  },
  {
    id: 10,
    name: 'Pokemon League',
    icon: 'crown',
    color: '#7038f8',
    commonPool: [1, 4, 7, 25, 147, 133], // Bulbasaur, Charmander, Squirtle, Pikachu, Dratini, Eevee
    bossPool: [142],                      // Aerodactyl
    bossCompanions: [147, 133],           // Dratini, Eevee
    floorNames: [
      'Registration Hall', 'Qualifying Round', 'Group Stage', 'Quarterfinals',
      'Elimination Round', 'Semifinal Arena', 'Rival Battle', 'Elite Floor',
      'Champion Gate', 'Grand Championship',
    ],
    mapPosition: { x: 1680, y: 260 },
  },
];

export const TOTAL_REGIONS = REGIONS.length;
