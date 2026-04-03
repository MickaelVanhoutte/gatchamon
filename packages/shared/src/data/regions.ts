import type { Difficulty } from '../types/player.js';

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

export interface StoryArc {
  id: string;
  name: string;
  regionIds: number[];
  prerequisite?: { arcId: string; difficulty: Difficulty };
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

  // ── Gen 2 story: Johto regions ──
  {
    id: 11,
    name: 'Violet Skies',
    icon: 'bird',
    color: '#6890f0',
    commonPool: [16, 17, 21, 161, 163, 164, 165, 177, 187, 198, 19, 167, 172, 175],
    bossPool: [18],                        // Pidgeot
    bossCompanions: [164, 178],            // Noctowl, Xatu
    floorNames: [
      'Sky Trail', 'Feather Path', 'Nest Walk', 'Wind Ridge',
      'Cloud Passage', 'Roost Ledge', 'Updraft Hall', 'Talon Pass',
      'Aviary Gate', 'Violet Gym',
    ],
    mapPosition: { x: 100, y: 300 },
  },
  {
    id: 12,
    name: 'Azalea Woods',
    icon: 'bug',
    color: '#a8b820',
    commonPool: [10, 13, 165, 166, 167, 168, 204, 191, 152, 46, 48, 194, 174, 172],
    bossPool: [212],                       // Scizor
    bossCompanions: [168, 205],            // Ariados, Forretress
    floorNames: [
      'Forest Entry', 'Silk Bridge', 'Cocoon Hollow', 'Moss Tunnel',
      'Hive Chamber', 'Web Maze', 'Chrysalis Hall', 'Bark Trail',
      'Canopy Depths', 'Azalea Gym',
    ],
    mapPosition: { x: 280, y: 440 },
  },
  {
    id: 13,
    name: 'Goldenrod City',
    icon: 'star',
    color: '#a8a878',
    commonPool: [161, 162, 174, 190, 206, 216, 241, 35, 39, 133, 209, 173, 175, 183],
    bossPool: [242],                       // Blissey
    bossCompanions: [241, 210],            // Miltank, Granbull
    floorNames: [
      'Market Street', 'Radio Tower', 'Underground Pass', 'Game Corner',
      'Train Station', 'Department Floor', 'Flower Shop', 'Contest Hall',
      'Golden Arch', 'Goldenrod Gym',
    ],
    mapPosition: { x: 460, y: 260 },
  },
  {
    id: 14,
    name: 'Ecruteak Shrine',
    icon: 'ghost',
    color: '#705898',
    commonPool: [92, 93, 200, 197, 177, 178, 196, 41, 42, 169, 202, 96, 63, 234],
    bossPool: [94],                        // Gengar
    bossCompanions: [200, 197],            // Misdreavus, Umbreon
    floorNames: [
      'Burnt Path', 'Shrine Gate', 'Bell Tower Base', 'Spirit Corridor',
      'Incense Hall', 'Fog Bridge', 'Dance Theatre', 'Kimono Room',
      'Sacred Peak', 'Ecruteak Gym',
    ],
    mapPosition: { x: 640, y: 380 },
  },
  {
    id: 15,
    name: 'Cianwood Shore',
    icon: 'fist',
    color: '#c03028',
    commonPool: [66, 67, 236, 237, 57, 62, 214, 185, 217, 231, 186, 184, 56, 232],
    bossPool: [68],                        // Machamp
    bossCompanions: [237, 214],            // Hitmontop, Heracross
    floorNames: [
      'Tidal Path', 'Beach Approach', 'Rocky Shore', 'Wave Cave',
      'Dojo Trail', 'Storm Cliff', 'Coral Bridge', 'Waterfall Pass',
      'Surf Chamber', 'Cianwood Gym',
    ],
    mapPosition: { x: 820, y: 460 },
  },
  {
    id: 16,
    name: 'Olivine Harbor',
    icon: 'shield',
    color: '#b8b8d0',
    commonPool: [81, 82, 205, 208, 212, 227, 170, 171, 179, 180, 181, 239, 204, 219],
    bossPool: [208],                       // Steelix
    bossCompanions: [212, 227],            // Scizor, Skarmory
    floorNames: [
      'Port Entrance', 'Cargo Wharf', 'Lighthouse Base', 'Iron Corridor',
      'Steel Forge', 'Anchor Bay', 'Mast Walk', 'Hull Chamber',
      'Compass Room', 'Olivine Gym',
    ],
    mapPosition: { x: 1000, y: 300 },
  },
  {
    id: 17,
    name: 'Mahogany Frost',
    icon: 'ice',
    color: '#98d8d8',
    commonPool: [86, 87, 215, 220, 221, 225, 238, 90, 91, 170, 223, 224, 245, 199],
    bossPool: [131],                       // Lapras
    bossCompanions: [225, 221],            // Delibird, Piloswine
    floorNames: [
      'Frost Trail', 'Ice Cave', 'Frozen Lake', 'Snowdrift Pass',
      'Glacier Path', 'Hail Ridge', 'Icicle Cavern', 'Sleet Bridge',
      'Permafrost Hall', 'Mahogany Gym',
    ],
    mapPosition: { x: 1180, y: 420 },
  },
  {
    id: 18,
    name: 'Blackthorn Peak',
    icon: 'dragon',
    color: '#7038f8',
    commonPool: [147, 148, 230, 207, 246, 247, 248, 142, 149, 228, 229, 233, 213, 193],
    bossPool: [149],                       // Dragonite
    bossCompanions: [230, 248],            // Kingdra, Tyranitar
    floorNames: [
      'Mountain Base', 'Dragon Path', 'Scale Ridge', 'Fang Cavern',
      'Wyvern Pass', 'Drake Bridge', 'Claw Peak', 'Dragonlair',
      'Summit Gate', 'Blackthorn Gym',
    ],
    mapPosition: { x: 1360, y: 250 },
  },
  {
    id: 19,
    name: 'Johto Victory Road',
    icon: 'crown',
    color: '#6a5acd',
    commonPool: [169, 212, 214, 208, 248, 217, 232, 164, 178, 229, 205, 221, 237, 227],
    bossPool: [248],                       // Tyranitar
    bossCompanions: [212, 208],            // Scizor, Steelix
    floorNames: [
      'Cave Mouth', 'Boulder Path', 'Rapids Crossing', 'Strength Puzzle',
      'Lantern Passage', 'Ledge Walk', 'Rock Climb', 'Waterfall Chamber',
      'Final Approach', 'Victory Summit',
    ],
    mapPosition: { x: 1520, y: 380 },
  },
  {
    id: 20,
    name: 'Johto Pokemon League',
    icon: 'crown',
    color: '#7038f8',
    commonPool: [152, 155, 158, 175, 196, 197, 243, 244],
    bossPool: [249],                       // Lugia
    bossCompanions: [243, 244],            // Raikou, Entei
    floorCount: 5,
    floorNames: [
      'Will - Psychic Master', 'Koga - Poison Master', 'Bruno - Fighting Master',
      'Karen - Dark Master', 'Lance - Champion',
    ],
    mapPosition: { x: 1680, y: 260 },
  },
];

export const STORY_ARCS: StoryArc[] = [
  { id: 'kanto', name: 'Kanto', regionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  {
    id: 'johto', name: 'Johto', regionIds: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    prerequisite: { arcId: 'kanto', difficulty: 'normal' },
  },
];

export function getArcForRegion(regionId: number): StoryArc | undefined {
  return STORY_ARCS.find(a => a.regionIds.includes(regionId));
}

export function isLeagueRegion(regionId: number): boolean {
  const arc = getArcForRegion(regionId);
  if (!arc) return false;
  return regionId === arc.regionIds[arc.regionIds.length - 1];
}

export function getNextRegionInArc(regionId: number): number | undefined {
  const arc = getArcForRegion(regionId);
  if (!arc) return undefined;
  const idx = arc.regionIds.indexOf(regionId);
  return idx >= 0 && idx < arc.regionIds.length - 1 ? arc.regionIds[idx + 1] : undefined;
}

export const TOTAL_REGIONS = REGIONS.length;

export function getFloorCount(regionId: number): number {
  const region = REGIONS.find(r => r.id === regionId);
  return region?.floorCount ?? 10;
}
