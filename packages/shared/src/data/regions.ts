export interface RegionDef {
  id: number;
  name: string;
  icon: string;
  color: string;
  commonPool: number[];    // template IDs for floors 1-9
  bossPool: number[];      // template IDs for floor 10
  floorNames: string[];    // 10 themed names
  mapPosition: { x: number; y: number };
}

export const REGIONS: RegionDef[] = [
  {
    id: 1,
    name: 'Verdant Woods',
    icon: '\u{1F332}',
    color: '#3a7a2a',
    commonPool: [10, 13, 69, 43],       // Caterpie, Weedle, Bellsprout, Oddish
    bossPool: [127],                      // Pinsir
    floorNames: [
      'Mossy Path', 'Thicket', 'Fern Hollow', 'Vine Bridge',
      'Mushroom Glade', 'Ancient Oak', 'Spider Den', 'Canopy Walk',
      'Deep Brush', 'Heart of the Forest',
    ],
    mapPosition: { x: 4, y: 55 },
  },
  {
    id: 2,
    name: 'Windswept Plains',
    icon: '\u{1F33E}',
    color: '#c4a74a',
    commonPool: [16, 19, 21, 39],        // Pidgey, Rattata, Spearow, Jigglypuff
    bossPool: [128],                      // Tauros
    floorNames: [
      'Tall Grass', 'Open Field', 'Windy Hill', 'Stampede Trail',
      'Dusty Road', 'Hawk Ridge', 'Grazing Meadow', 'Stone Fence',
      'Cyclone Pass', 'The Great Expanse',
    ],
    mapPosition: { x: 14, y: 28 },
  },
  {
    id: 3,
    name: 'Toxic Marsh',
    icon: '\u{2620}\u{FE0F}',
    color: '#8a4a8a',
    commonPool: [41, 13, 43, 92],        // Zubat, Weedle, Oddish, Gastly
    bossPool: [1],                        // Bulbasaur
    floorNames: [
      'Bog Entrance', 'Murky Shallows', 'Poison Pools', 'Rotten Log',
      'Miasma Pit', 'Sludge Banks', 'Gas Vents', 'Fungus Cavern',
      'Venom Falls', 'Swamp Heart',
    ],
    mapPosition: { x: 23, y: 65 },
  },
  {
    id: 4,
    name: 'Crystal Caverns',
    icon: '\u{1FAA8}',
    color: '#8a7a5a',
    commonPool: [74, 41, 19, 66],        // Geodude, Zubat, Rattata, Machop
    bossPool: [142],                      // Aerodactyl
    floorNames: [
      'Cave Mouth', 'Echo Chamber', 'Crystal Vein', 'Stalactite Hall',
      'Underground River', 'Gem Deposit', 'Collapsed Tunnel', 'Lava Tube',
      'Fossil Chamber', 'Ancient Sanctum',
    ],
    mapPosition: { x: 33, y: 30 },
  },
  {
    id: 5,
    name: 'Azure Coast',
    icon: '\u{1F30A}',
    color: '#4a8ab0',
    commonPool: [129, 60, 7],            // Magikarp, Poliwag, Squirtle
    bossPool: [131],                      // Lapras
    floorNames: [
      'Sandy Shore', 'Tide Pools', 'Coral Reef', 'Sea Cave',
      'Sunken Ship', 'Whirlpool Bay', 'Kelp Forest', 'Deep Trench',
      'Storm Strait', 'Abyssal Throne',
    ],
    mapPosition: { x: 43, y: 62 },
  },
  {
    id: 6,
    name: 'Thunderpeak Ridge',
    icon: '\u{26A1}',
    color: '#f0c030',
    commonPool: [25, 66, 74],            // Pikachu, Machop, Geodude
    bossPool: [106],                      // Hitmonlee
    floorNames: [
      'Foothills', 'Charged Path', 'Lightning Rocks', 'Thunder Plateau',
      'Static Field', 'Storm Lookout', 'Bolt Canyon', 'Powerline Ridge',
      'Voltaic Peak', 'Arena of Storms',
    ],
    mapPosition: { x: 54, y: 30 },
  },
  {
    id: 7,
    name: 'Ember Highlands',
    icon: '\u{1F525}',
    color: '#d04040',
    commonPool: [4, 58, 74],             // Charmander, Growlithe, Geodude
    bossPool: [107],                      // Hitmonchan
    floorNames: [
      'Ash Trail', 'Scorched Earth', 'Lava Fields', 'Cinder Ridge',
      'Magma Pools', 'Flame Geysers', 'Inferno Pass', 'Obsidian Cliff',
      'Eruption Site', 'Volcanic Core',
    ],
    mapPosition: { x: 64, y: 60 },
  },
  {
    id: 8,
    name: 'Phantom Ruins',
    icon: '\u{1F47B}',
    color: '#6a5acd',
    commonPool: [92, 63, 41, 39],        // Gastly, Abra, Zubat, Jigglypuff
    bossPool: [115],                      // Kangaskhan
    floorNames: [
      'Crumbling Gate', 'Haunted Hall', 'Spirit Well', 'Cursed Library',
      'Shadow Corridor', 'Phantom Gallery', 'Mind Maze', 'Wailing Chamber',
      'Void Altar', 'Throne of Echoes',
    ],
    mapPosition: { x: 75, y: 28 },
  },
  {
    id: 9,
    name: 'Frozen Tundra',
    icon: '\u{2744}\u{FE0F}',
    color: '#88ccee',
    commonPool: [60, 133, 147],          // Poliwag, Eevee, Dratini
    bossPool: [131],                      // Lapras
    floorNames: [
      'Frost Gate', 'Snowdrift Path', 'Ice Bridge', 'Blizzard Valley',
      'Frozen Lake', 'Glacier Caves', 'Aurora Ridge', 'Permafrost Depths',
      'Crystal Spire', 'Heart of Winter',
    ],
    mapPosition: { x: 84, y: 62 },
  },
  {
    id: 10,
    name: 'Sacred Summit',
    icon: '\u{1F3D4}\u{FE0F}',
    color: '#a0522d',
    commonPool: [147, 133, 58, 63],      // Dratini, Eevee, Growlithe, Abra
    bossPool: [143],                      // Snorlax
    floorNames: [
      'Mountain Trail', 'Cliffside Path', 'Eagle Nest', 'Cloud Bridge',
      'Skyward Steps', 'Windsworn Ledge', 'Guardian Stones', 'Summit Pass',
      'Celestial Gate', 'Peak of Legends',
    ],
    mapPosition: { x: 88, y: 35 },
  },
  {
    id: 11,
    name: 'Pokemon League',
    icon: '\u{1F451}',
    color: '#7038f8',
    commonPool: [1, 4, 7, 25],           // Bulbasaur, Charmander, Squirtle, Pikachu
    bossPool: [142],                      // Aerodactyl
    floorNames: [
      'Registration Hall', 'Qualifying Round', 'Group Stage', 'Quarterfinals',
      'Elimination Round', 'Semifinal Arena', 'Rival Battle', 'Elite Floor',
      'Champion Gate', 'Grand Championship',
    ],
    mapPosition: { x: 93, y: 58 },
  },

  // ============================================================
  // NEW REGIONS — Gen 2+ Pokemon
  // ============================================================
  {
    id: 12,
    name: 'Dark Labyrinth',
    icon: '\u{1F311}',
    color: '#705848',
    commonPool: [198, 215, 261, 302],    // Murkrow, Sneasel, Poochyena, Sableye
    bossPool: [359],                      // Absol
    floorNames: [
      'Shadow Entrance', 'Dim Passage', 'Blindfold Hall', 'Murky Depths',
      'Night Corridor', 'Deception Room', 'Phantom Staircase', 'Abyss Chamber',
      'Malice Vault', 'Heart of Darkness',
    ],
    mapPosition: { x: 10, y: 15 },
  },
  {
    id: 13,
    name: 'Fairy Glen',
    icon: '\u{1F9DA}',
    color: '#ee99ac',
    commonPool: [174, 209, 546, 684],    // Igglybuff, Snubbull, Cottonee, Swirlix
    bossPool: [282],                      // Gardevoir
    floorNames: [
      'Petal Path', 'Pixie Glade', 'Enchanted Spring', 'Moonlit Clearing',
      'Fairy Ring', 'Crystal Brook', 'Starlight Meadow', 'Blossom Arch',
      'Dream Bower', 'Celestial Garden',
    ],
    mapPosition: { x: 25, y: 15 },
  },
  {
    id: 14,
    name: 'Steel Foundry',
    icon: '\u{2699}\u{FE0F}',
    color: '#b8b8d0',
    commonPool: [81, 304, 374, 436],     // Magnemite, Aron, Beldum, Bronzor
    bossPool: [376],                      // Metagross
    floorNames: [
      'Scrap Yard', 'Smelting Hall', 'Gear Works', 'Forging Chamber',
      'Iron Tunnel', 'Alloy Corridor', 'Chrome Dome', 'Titanium Gate',
      'Core Furnace', 'Master Forge',
    ],
    mapPosition: { x: 40, y: 15 },
  },
  {
    id: 15,
    name: 'Johto Gardens',
    icon: '\u{1F338}',
    color: '#78c850',
    commonPool: [152, 155, 158, 161],    // Chikorita, Cyndaquil, Totodile, Sentret
    bossPool: [248],                      // Tyranitar
    floorNames: [
      'Sprout Path', 'Herb Garden', 'Berry Grove', 'Azalea Trail',
      'Goldenrod Field', 'Tin Tower Steps', 'Whirl Passage', 'Silver Ridge',
      'Rainbow Bridge', 'Sacred Tower',
    ],
    mapPosition: { x: 55, y: 15 },
  },
  {
    id: 16,
    name: 'Hoenn Shores',
    icon: '\u{1F3DD}\u{FE0F}',
    color: '#6890f0',
    commonPool: [255, 258, 261, 270],    // Torchic, Mudkip, Poochyena, Lotad
    bossPool: [373],                      // Salamence
    floorNames: [
      'Route 101', 'Petalburg Wood', 'Dewford Reef', 'Slateport Docks',
      'Mauville Circuit', 'Fortree Canopy', 'Lilycove Cove', 'Mossdeep Lab',
      'Sootopolis Basin', 'Sky Pillar',
    ],
    mapPosition: { x: 70, y: 15 },
  },
  {
    id: 17,
    name: 'Sinnoh Peaks',
    icon: '\u{1F3D4}\u{FE0F}',
    color: '#4a8ab0',
    commonPool: [387, 390, 393, 396],    // Turtwig, Chimchar, Piplup, Starly
    bossPool: [445],                      // Garchomp
    floorNames: [
      'Jubilife Gate', 'Floaroma Meadow', 'Eterna Forest', 'Hearthome Gardens',
      'Veilstone Quarry', 'Pastoria Wetlands', 'Snowpoint Glacier', 'Sunyshore Cliff',
      'Spear Pillar', 'Hall of Origin',
    ],
    mapPosition: { x: 85, y: 15 },
  },
  {
    id: 18,
    name: 'Unova Metropolis',
    icon: '\u{1F3D9}\u{FE0F}',
    color: '#a0a0b0',
    commonPool: [495, 498, 501, 504],    // Snivy, Tepig, Oshawott, Patrat
    bossPool: [635],                      // Hydreigon
    floorNames: [
      'Nuvema Outskirts', 'Striaton Cafe', 'Nacrene Museum', 'Castelia Streets',
      'Nimbasa Park', 'Driftveil Market', 'Twist Mountain', 'Opelucid Tower',
      'Giant Chasm', 'Victory Road',
    ],
    mapPosition: { x: 10, y: 80 },
  },
  {
    id: 19,
    name: 'Kalos Chateau',
    icon: '\u{1F3F0}',
    color: '#c084fc',
    commonPool: [650, 653, 656, 661],    // Chespin, Fennekin, Froakie, Fletchling
    bossPool: [706],                      // Goodra
    floorNames: [
      'Lumiose Boulevard', 'Santalune Garden', 'Cyllage Coast', 'Shalour Arena',
      'Laverre Path', 'Anistar Sundial', 'Snowbelle Forest', 'Tower of Mastery',
      'Terminus Cave', 'Chamber of Emptiness',
    ],
    mapPosition: { x: 30, y: 80 },
  },
  {
    id: 20,
    name: 'Alola Paradise',
    icon: '\u{1F334}',
    color: '#f8d030',
    commonPool: [722, 725, 728, 731],    // Rowlet, Litten, Popplio, Pikipek
    bossPool: [785],                      // Tapu Koko
    floorNames: [
      'Iki Town Trail', 'Hau\'oli Beach', 'Verdant Cavern', 'Brooklet Hill',
      'Wela Volcano', 'Lush Jungle', 'Po Town', 'Vast Poni Canyon',
      'Altar of the Moon', 'Ultra Space',
    ],
    mapPosition: { x: 50, y: 80 },
  },
  {
    id: 21,
    name: 'Galar Arena',
    icon: '\u{1F3DF}\u{FE0F}',
    color: '#e94560',
    commonPool: [810, 813, 816, 819],    // Grookey, Scorbunny, Sobble, Skwovet
    bossPool: [884],                      // Duraludon
    floorNames: [
      'Postwick Pastures', 'Slumbering Weald', 'Motostoke Plaza', 'Turffield Stadium',
      'Hulbury Harbor', 'Hammerlocke Vault', 'Circhester Baths', 'Spikemuth Alley',
      'Tower Summit', 'Energy Plant',
    ],
    mapPosition: { x: 70, y: 80 },
  },
  {
    id: 22,
    name: 'Paldea Wilds',
    icon: '\u{1F332}',
    color: '#3a7a2a',
    commonPool: [906, 909, 912, 915],    // Sprigatito, Fuecoco, Quaxly, Lechonk
    bossPool: [998],                      // Annihilape (id may vary, using generated ID)
    floorNames: [
      'Mesagoza Gate', 'South Province', 'West Province', 'East Province',
      'Asado Desert', 'Casseroya Lake', 'Glaseado Mountain', 'North Province',
      'Area Zero Entrance', 'Great Crater',
    ],
    mapPosition: { x: 90, y: 80 },
  },
];

export const TOTAL_REGIONS = REGIONS.length;
