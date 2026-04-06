import type { Difficulty } from '../types/player.js';
import { isLeagueRegion } from './regions.js';

// ---------------------------------------------------------------------------
// Gym Leader definitions for regions 1-9
// ---------------------------------------------------------------------------

export interface GymLeaderDef {
  regionId: number;
  name: string;
  icon: string;
  /** Each slot is [normalId, hardId, hellId] — Pokemon evolve per difficulty */
  team: [number, number, number][];
  bossIndex: number;
  dialogue: string;
}

export interface LeagueChampionDef {
  regionId: number;
  floor: number;
  name: string;
  icon: string;
  team: number[];
  bossIndex: number;
  dialogue: string;
  floorName: string;
}

const DIFFICULTY_INDEX: Record<Difficulty, 0 | 1 | 2> = {
  normal: 0,
  hard: 1,
  hell: 2,
};

export const GYM_LEADERS: GymLeaderDef[] = [
  // ── Gen 1 story: Kanto Gym Leaders ──
  {
    regionId: 1,
    name: 'Brock',
    icon: 'brock.png',
    team: [
      [74, 75, 76],     // Geodude → Graveler → Golem
      [95, 95, 95],     // Onix
      [111, 111, 112],  // Rhyhorn → Rhyhorn → Rhydon
    ],
    bossIndex: 2,
    dialogue: "My rock-solid willpower is evident in my Pokemon!",
  },
  {
    regionId: 2,
    name: 'Misty',
    icon: 'misty.png',
    team: [
      [120, 120, 121],  // Staryu → Staryu → Starmie
      [60, 61, 62],     // Poliwag → Poliwhirl → Poliwrath
      [121, 121, 121],  // Starmie
    ],
    bossIndex: 2,
    dialogue: "My water-type Pokemon will wash you away!",
  },
  {
    regionId: 3,
    name: 'Lt. Surge',
    icon: 'lt-surge.png',
    team: [
      [100, 100, 101],  // Voltorb → Voltorb → Electrode
      [25, 25, 26],     // Pikachu → Pikachu → Raichu
      [26, 26, 26],     // Raichu
    ],
    bossIndex: 2,
    dialogue: "Hey kid! You won't live long in combat! Not with your Pokemon!",
  },
  {
    regionId: 4,
    name: 'Erika',
    icon: 'erika.png',
    team: [
      [114, 114, 114],  // Tangela
      [69, 70, 71],     // Bellsprout → Weepinbell → Victreebel
      [43, 44, 45],     // Oddish → Gloom → Vileplume
    ],
    bossIndex: 2,
    dialogue: "I am a student of the art of flower arranging. My Pokemon are of the Grass-type.",
  },
  {
    regionId: 5,
    name: 'Koga',
    icon: 'koga.png',
    team: [
      [109, 109, 110],  // Koffing → Koffing → Weezing
      [48, 48, 49],     // Venonat → Venonat → Venomoth
      [89, 89, 89],     // Muk
    ],
    bossIndex: 2,
    dialogue: "Fwahahahaha! A mere child like you dares to challenge me? Very well, I shall show you true terror!",
  },
  {
    regionId: 6,
    name: 'Sabrina',
    icon: 'sabrina.png',
    team: [
      [122, 122, 122],  // Mr. Mime
      [63, 64, 65],     // Abra → Kadabra → Alakazam
      [65, 65, 65],     // Alakazam
    ],
    bossIndex: 2,
    dialogue: "I had a vision of your arrival. I have been training my psychic powers. I won't lose.",
  },
  {
    regionId: 7,
    name: 'Blaine',
    icon: 'blaine.png',
    team: [
      [77, 77, 78],     // Ponyta → Ponyta → Rapidash
      [58, 58, 59],     // Growlithe → Growlithe → Arcanine
      [59, 59, 59],     // Arcanine
    ],
    bossIndex: 2,
    dialogue: "Hah! My fiery Pokemon will incinerate all challengers!",
  },
  {
    regionId: 8,
    name: 'Giovanni',
    icon: 'giovanni.png',
    team: [
      [50, 51, 51],     // Diglett → Dugtrio → Dugtrio
      [104, 105, 105],  // Cubone → Marowak → Marowak
      [111, 111, 112],  // Rhyhorn → Rhyhorn → Rhydon
    ],
    bossIndex: 2,
    dialogue: "I am the leader of Team Rocket! I shall make you feel a world of pain!",
  },
  // Region 9 (Victory Road) has no gym leader — uses fallback boss system

  // ── Gen 2 story: Johto Gym Leaders ──
  {
    regionId: 11,
    name: 'Falkner',
    icon: 'falkner.png',
    team: [
      [163, 164, 164],   // Hoothoot → Noctowl → Noctowl
      [16, 17, 18],       // Pidgey → Pidgeotto → Pidgeot
      [17, 18, 18],       // Pidgeotto → Pidgeot → Pidgeot
    ],
    bossIndex: 2,
    dialogue: "People say you can clip Flying-type Pokemon's wings with a jolt of electricity... I won't allow such insPokemon's Pokemon trainers!",
  },
  {
    regionId: 12,
    name: 'Bugsy',
    icon: 'bugsy.png',
    team: [
      [11, 12, 12],       // Metapod → Butterfree → Butterfree
      [14, 15, 15],       // Kakuna → Beedrill → Beedrill
      [123, 123, 212],    // Scyther → Scyther → Scizor
    ],
    bossIndex: 2,
    dialogue: "I'm Bugsy! I never lose when it comes to Bug-type Pokemon!",
  },
  {
    regionId: 13,
    name: 'Whitney',
    icon: 'whitney.png',
    team: [
      [35, 36, 36],       // Clefairy → Clefable → Clefable
      [161, 162, 162],    // Sentret → Furret → Furret
      [241, 241, 241],    // Miltank → Miltank → Miltank
    ],
    bossIndex: 2,
    dialogue: "Everyone was so easy to beat! I mean, I just kept winning! Wahaha!",
  },
  {
    regionId: 14,
    name: 'Morty',
    icon: 'morty.png',
    team: [
      [92, 93, 93],       // Gastly → Haunter → Haunter
      [200, 200, 200],    // Misdreavus → Misdreavus → Misdreavus
      [93, 94, 94],       // Haunter → Gengar → Gengar
    ],
    bossIndex: 2,
    dialogue: "I see... Your journey has taken you to many places and you have witnessed much. I'm going to show you the power of Ghost-type Pokemon!",
  },
  {
    regionId: 15,
    name: 'Chuck',
    icon: 'chuck.png',
    team: [
      [57, 57, 57],       // Primeape → Primeape → Primeape
      [236, 237, 237],    // Tyrogue → Hitmontop → Hitmontop
      [61, 62, 62],       // Poliwhirl → Poliwrath → Poliwrath
    ],
    bossIndex: 2,
    dialogue: "Wahahah! I trained under the waterfall of this cave every day! The power of my Fighting Pokemon shall crush you!",
  },
  {
    regionId: 16,
    name: 'Jasmine',
    icon: 'jasmine.png',
    team: [
      [81, 82, 82],       // Magnemite → Magneton → Magneton
      [204, 205, 205],    // Pineco → Forretress → Forretress
      [95, 208, 208],     // Onix → Steelix → Steelix
    ],
    bossIndex: 2,
    dialogue: "...Um... I don't really know how to say this, but... I...I really love Steel-type Pokemon. They're so cool and beautiful...",
  },
  {
    regionId: 17,
    name: 'Pryce',
    icon: 'pryce.png',
    team: [
      [86, 87, 87],       // Seel → Dewgong → Dewgong
      [215, 215, 215],    // Sneasel → Sneasel → Sneasel
      [220, 221, 221],    // Swinub → Piloswine → Piloswine
    ],
    bossIndex: 2,
    dialogue: "Pokemon have been my Pokemon for over fifty years now. It'd be Pokemon of me to think I had no more to learn!",
  },
  {
    regionId: 18,
    name: 'Clair',
    icon: 'clair.png',
    team: [
      [148, 148, 149],    // Dragonair → Dragonair → Dragonite
      [130, 130, 130],    // Gyarados → Gyarados → Gyarados
      [148, 230, 230],    // Dragonair → Kingdra → Kingdra
    ],
    bossIndex: 2,
    dialogue: "Do you know the Pokemon Dragon's Den? I learned to train Pokemon there. I'm going to use my Pokemon power to crush you!",
  },
];

// ---------------------------------------------------------------------------
// Pokemon League champions (region 10, 5 floors)
// ---------------------------------------------------------------------------

export const LEAGUE_CHAMPIONS: LeagueChampionDef[] = [
  // ── Gen 1 story: Kanto Elite Four + Champion ──
  {
    regionId: 10,
    floor: 1,
    name: 'Lorelei',
    icon: 'lorelei.png',
    team: [87, 91, 124, 131], // Dewgong, Cloyster, Jynx, Lapras
    bossIndex: 3,
    dialogue: "No one can best me when it comes to icy Pokemon! Freeze them!",
    floorName: 'Lorelei - Ice Master',
  },
  {
    regionId: 10,
    floor: 2,
    name: 'Bruno',
    icon: 'bruno.png',
    team: [95, 107, 106, 68], // Onix, Hitmonchan, Hitmonlee, Machamp
    bossIndex: 3,
    dialogue: "Through rigorous training, people and Pokemon can become stronger without limit!",
    floorName: 'Bruno - Fighting Master',
  },
  {
    regionId: 10,
    floor: 3,
    name: 'Agatha',
    icon: 'agatha.png',
    team: [42, 93, 24, 94], // Golbat, Haunter, Arbok, Gengar
    bossIndex: 3,
    dialogue: "I see you have no fear... The Gengar line has been my Pokemon of choice for decades!",
    floorName: 'Agatha - Ghost Master',
  },
  {
    regionId: 10,
    floor: 4,
    name: 'Lance',
    icon: 'lance.png',
    team: [148, 130, 142, 149], // Dragonair, Gyarados, Aerodactyl, Dragonite
    bossIndex: 3,
    dialogue: "I am the last of the Elite Four! I have been waiting for a truly powerful challenger!",
    floorName: 'Lance - Dragon Master',
  },
  {
    regionId: 10,
    floor: 5,
    name: 'Blue',
    icon: 'blue.png',
    team: [18, 65, 112, 59, 103, 9], // Pidgeot, Alakazam, Rhydon, Arcanine, Exeggutor, Blastoise
    bossIndex: 5,
    dialogue: "Hey! I heard you beat the Elite Four! Well, I'm the Champion! You'll need more than that to beat me!",
    floorName: 'Blue - Champion',
  },

  // ── Gen 2 story: Johto Elite Four + Champion ──
  {
    regionId: 20,
    floor: 1,
    name: 'Will',
    icon: 'will.png',
    team: [178, 124, 80, 103],  // Xatu, Jynx, Slowbro, Exeggutor
    bossIndex: 0,
    dialogue: "I have trained all around the world, making my Psychic-type Pokemon powerful.",
    floorName: 'Will - Psychic Master',
  },
  {
    regionId: 20,
    floor: 2,
    name: 'Koga',
    icon: 'koga.png',
    team: [168, 205, 89, 169],  // Ariados, Forretress, Muk, Crobat
    bossIndex: 3,
    dialogue: "Pokemon is not merely about brute force — you shall see soon enough!",
    floorName: 'Koga - Poison Master',
  },
  {
    regionId: 20,
    floor: 3,
    name: 'Bruno',
    icon: 'bruno.png',
    team: [237, 106, 107, 68],  // Hitmontop, Hitmonlee, Hitmonchan, Machamp
    bossIndex: 3,
    dialogue: "We will grind you down with our superior power! Hoo hah!",
    floorName: 'Bruno - Fighting Master',
  },
  {
    regionId: 20,
    floor: 4,
    name: 'Karen',
    icon: 'karen.png',
    team: [197, 198, 94, 229],  // Umbreon, Murkrow, Gengar, Houndoom
    bossIndex: 3,
    dialogue: "Strong Pokemon. Weak Pokemon. That is only the selfish perception of people. Truly skilled trainers should try to win with their favorites.",
    floorName: 'Karen - Dark Master',
  },
  {
    regionId: 20,
    floor: 5,
    name: 'Lance',
    icon: 'lance.png',
    team: [149, 149, 149, 142, 6, 130],  // 3x Dragonite, Aerodactyl, Charizard, Gyarados
    bossIndex: 0,
    dialogue: "I've been Pokemon Champion for too long now... You are the first trainer in a long while who has given me a Pokemon. Let me test your true power!",
    floorName: 'Lance - Champion',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getGymLeader(regionId: number): GymLeaderDef | undefined {
  return GYM_LEADERS.find(g => g.regionId === regionId);
}

export function getLeagueChampion(regionId: number, floor: number): LeagueChampionDef | undefined {
  return LEAGUE_CHAMPIONS.find(c => c.regionId === regionId && c.floor === floor);
}

/** Get the team template IDs for a gym leader, resolved for difficulty. */
export function getGymLeaderTeam(regionId: number, difficulty: Difficulty): number[] | undefined {
  const leader = getGymLeader(regionId);
  if (!leader) return undefined;
  const idx = DIFFICULTY_INDEX[difficulty];
  return leader.team.map(slot => slot[idx]);
}

/**
 * Get boss dialogue data for a region + floor combo.
 * Returns null for non-boss floors.
 */
export function getBossDialogue(
  regionId: number,
  floor: number,
): { name: string; icon: string; dialogue: string } | null {
  if (isLeagueRegion(regionId)) {
    const champion = getLeagueChampion(regionId, floor);
    if (!champion) return null;
    return { name: champion.name, icon: champion.icon, dialogue: champion.dialogue };
  }
  // For regions 1-9, only the boss floor (floor 10) has a gym leader
  if (floor !== 10) return null;
  const leader = getGymLeader(regionId);
  if (!leader) return null;
  return { name: leader.name, icon: leader.icon, dialogue: leader.dialogue };
}
