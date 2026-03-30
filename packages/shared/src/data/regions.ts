export interface RegionDef {
  id: number;
  name: string;
  icon: string;
  color: string;
  commonPool: number[];    // template IDs for floors 1-9
  bossPool: number[];      // template IDs for floor 10
  bossCompanions: number[]; // 2 template IDs flanking the boss on floor 10
  floorNames: string[];    // themed names (length = floorCount)
  floorCount?: number;     // defaults to 10 if omitted
  mapPosition: { x: number; y: number };
}

export const REGIONS: RegionDef[] = [
  // ── Gen 1 story: Kanto regions ──
  // Each region has a diverse commonPool with a slight bias toward the gym leader's type.
  {
    id: 1,
    name: 'Pewter Passage',
    icon: 'rock',
    color: '#8a7a5a',
    // Early route Pokemon + a couple rock types
    commonPool: [19, 16, 10, 13, 21, 29, 32, 39, 74, 27, 46, 41, 35, 56],
    // Rattata, Pidgey, Caterpie, Weedle, Spearow, Nidoran-F, Nidoranm, Jigglypuff,
    // Geodude, Sandshrew, Paras, Zubat, Clefairy, Mankey
    bossPool: [95],                        // Onix
    bossCompanions: [74, 27],              // Geodude, Sandshrew
    floorNames: [
      'Rocky Trail', 'Boulder Alley', 'Gravel Pit', 'Fossil Dig',
      'Stone Corridor', 'Pebble Creek', 'Slate Ridge', 'Granite Hall',
      'Bedrock Depths', 'Pewter Gym',
    ],
    mapPosition: { x: 100, y: 380 },
  },
  {
    id: 2,
    name: 'Cerulean Cove',
    icon: 'wave',
    color: '#4a8ab0',
    // Diverse mix + a few water types
    commonPool: [19, 16, 43, 69, 129, 60, 118, 54, 23, 63, 48, 52, 72, 90, 120],
    // Rattata, Pidgey, Oddish, Bellsprout, Magikarp, Poliwag, Goldeen, Psyduck,
    // Ekans, Abra, Venonat, Meowth, Tentacool, Shellder, Staryu
    bossPool: [121],                       // Starmie
    bossCompanions: [120, 60],             // Staryu, Poliwag
    floorNames: [
      'Sandy Shore', 'Tide Pools', 'Coral Reef', 'Cerulean Cave',
      'Cascade Falls', 'Sea Grotto', 'Whirlpool Bay', 'Kelp Forest',
      'Abyssal Trench', 'Cerulean Gym',
    ],
    mapPosition: { x: 280, y: 220 },
  },
  {
    id: 3,
    name: 'Vermilion Docks',
    icon: 'electric',
    color: '#f0c030',
    // Diverse mix + a few electric types
    commonPool: [20, 17, 81, 100, 25, 66, 96, 88, 50, 56, 98, 58, 74, 84],
    // Raticate, Pidgeotto, Magnemite, Voltorb, Pikachu, Machop, Drowzee,
    // Grimer, Diglett, Mankey, Krabby, Growlithe, Geodude, Doduo
    bossPool: [26],                        // Raichu
    bossCompanions: [100, 81],             // Voltorb, Magnemite
    floorNames: [
      'Harbor Gate', 'Cargo Bay', 'Generator Room', 'Charged Path',
      'Spark Alley', 'Thunder Corridor', 'Power Grid', 'Volt Chamber',
      'Lightning Field', 'Vermilion Gym',
    ],
    mapPosition: { x: 460, y: 420 },
  },
  {
    id: 4,
    name: 'Celadon Gardens',
    icon: 'tree',
    color: '#3a7a2a',
    // Diverse mix + a few grass types
    commonPool: [43, 69, 114, 102, 17, 30, 33, 37, 133, 44, 70, 12, 15, 84, 48],
    // Oddish, Bellsprout, Tangela, Exeggcute, Pidgeotto, Nidorina, Nidorino,
    // Vulpix, Eevee, Gloom, Weepinbell, Butterfree, Beedrill, Doduo, Venonat
    bossPool: [45],                        // Vileplume
    bossCompanions: [44, 70],              // Gloom, Weepinbell
    floorNames: [
      'Flower Path', 'Herb Garden', 'Vine Maze', 'Pollen Grove',
      'Mushroom Glade', 'Moss Bridge', 'Fern Hollow', 'Canopy Walk',
      'Blossom Peak', 'Celadon Gym',
    ],
    mapPosition: { x: 650, y: 250 },
  },
  {
    id: 5,
    name: 'Fuchsia Marsh',
    icon: 'poison',
    color: '#8a4a8a',
    // Diverse mix + a few poison types
    commonPool: [109, 41, 23, 48, 30, 33, 79, 54, 111, 77, 92, 84, 115, 108, 88],
    // Koffing, Zubat, Ekans, Venonat, Nidorina, Nidorino, Slowpoke, Psyduck,
    // Rhyhorn, Ponyta, Gastly, Doduo, Kangaskhan, Lickitung, Grimer
    bossPool: [110],                       // Weezing
    bossCompanions: [109, 42],             // Koffing, Golbat
    floorNames: [
      'Bog Entrance', 'Murky Shallows', 'Poison Pools', 'Rotten Log',
      'Miasma Pit', 'Sludge Banks', 'Gas Vents', 'Fungus Cavern',
      'Venom Falls', 'Fuchsia Gym',
    ],
    mapPosition: { x: 840, y: 440 },
  },
  {
    id: 6,
    name: 'Saffron Towers',
    icon: 'psychic',
    color: '#f85888',
    // Diverse mix + a few psychic types
    commonPool: [63, 96, 79, 92, 67, 57, 64, 102, 100, 22, 42, 137, 108, 122, 93],
    // Abra, Drowzee, Slowpoke, Gastly, Machoke, Primeape, Kadabra, Exeggcute,
    // Voltorb, Fearow, Golbat, Porygon, Lickitung, Mr. Mime, Haunter
    bossPool: [65],                        // Alakazam
    bossCompanions: [64, 97],              // Kadabra, Hypno
    floorNames: [
      'Lobby', 'Mirror Hall', 'Warp Tiles', 'Mind Maze',
      'Teleport Chamber', 'Psychic Ward', 'Dream Corridor', 'Illusion Room',
      'Spirit Sanctum', 'Saffron Gym',
    ],
    mapPosition: { x: 1020, y: 200 },
  },
  {
    id: 7,
    name: 'Cinnabar Volcano',
    icon: 'fire',
    color: '#d04040',
    // Diverse mix + a few fire types
    commonPool: [58, 77, 37, 126, 4, 74, 111, 109, 104, 66, 75, 20, 24, 81, 138],
    // Growlithe, Ponyta, Vulpix, Magmar, Charmander, Geodude, Rhyhorn, Koffing,
    // Cubone, Machop, Graveler, Raticate, Arbok, Magnemite, Omanyte
    bossPool: [59],                        // Arcanine
    bossCompanions: [78, 126],             // Rapidash, Magmar
    floorNames: [
      'Ash Trail', 'Scorched Earth', 'Lava Fields', 'Cinder Ridge',
      'Magma Pools', 'Flame Geysers', 'Inferno Pass', 'Obsidian Cliff',
      'Eruption Site', 'Cinnabar Gym',
    ],
    mapPosition: { x: 1180, y: 380 },
  },
  {
    id: 8,
    name: 'Viridian Fortress',
    icon: 'ground',
    color: '#e0c068',
    // Diverse mix + a few ground types
    commonPool: [50, 27, 104, 111, 31, 34, 24, 53, 42, 57, 97, 67, 89, 128, 85],
    // Diglett, Sandshrew, Cubone, Rhyhorn, Nidoqueen, Nidoking, Arbok, Persian,
    // Golbat, Primeape, Hypno, Machoke, Muk, Tauros, Dodrio
    bossPool: [112],                       // Rhydon
    bossCompanions: [51, 105],             // Dugtrio, Marowak
    floorNames: [
      'Forest Gate', 'Hidden Path', 'Underground Tunnel', 'Sand Pit',
      'Earthquake Hall', 'Fossil Vault', 'Tremor Ridge', 'Crumbling Bridge',
      'Bedrock Throne', 'Viridian Gym',
    ],
    mapPosition: { x: 1340, y: 180 },
  },
  {
    id: 9,
    name: 'Victory Road',
    icon: 'crown',
    color: '#6a5acd',
    // Tough mix of evolved Pokemon from many types
    commonPool: [67, 75, 42, 95, 105, 57, 20, 22, 47, 49, 28, 76, 132, 123, 127],
    // Machoke, Graveler, Golbat, Onix, Marowak, Primeape, Raticate, Fearow,
    // Parasect, Venomoth, Sandslash, Golem, Ditto, Scyther, Pinsir
    bossPool: [142],                       // Aerodactyl
    bossCompanions: [95, 68],              // Onix, Machamp
    floorNames: [
      'Cave Entrance', 'Boulder Maze', 'Waterfall Chamber', 'Strength Puzzle',
      'Dark Passage', 'Ledge Walk', 'Rock Climb', 'Final Ascent',
      'Summit Gate', 'Victory Peak',
    ],
    mapPosition: { x: 1500, y: 350 },
  },
  {
    id: 10,
    name: 'Pokemon League',
    icon: 'crown',
    color: '#7038f8',
    commonPool: [1, 4, 7, 25, 147, 133], // Bulbasaur, Charmander, Squirtle, Pikachu, Dratini, Eevee
    bossPool: [142],                       // Aerodactyl
    bossCompanions: [147, 133],            // Dratini, Eevee
    floorCount: 5,
    floorNames: [
      'Lorelei - Ice Master', 'Bruno - Fighting Master', 'Agatha - Ghost Master',
      'Lance - Dragon Master', 'Blue - Champion',
    ],
    mapPosition: { x: 1680, y: 260 },
  },
];

export const TOTAL_REGIONS = REGIONS.length;

export function getFloorCount(regionId: number): number {
  const region = REGIONS.find(r => r.id === regionId);
  return region?.floorCount ?? 10;
}
