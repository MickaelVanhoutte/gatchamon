import type { Difficulty } from '../types/player.js';

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
    icon: '🪨',
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
    icon: '💧',
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
    icon: '⚡',
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
    icon: '🌿',
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
    icon: '🥷',
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
    icon: '🔮',
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
    icon: '🔥',
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
    icon: '🏴',
    team: [
      [50, 51, 51],     // Diglett → Dugtrio → Dugtrio
      [104, 105, 105],  // Cubone → Marowak → Marowak
      [111, 111, 112],  // Rhyhorn → Rhyhorn → Rhydon
    ],
    bossIndex: 2,
    dialogue: "I am the leader of Team Rocket! I shall make you feel a world of pain!",
  },
  // Region 9 (Victory Road) has no gym leader — uses fallback boss system
];

// ---------------------------------------------------------------------------
// Pokemon League champions (region 10, 5 floors)
// ---------------------------------------------------------------------------

export const LEAGUE_CHAMPIONS: LeagueChampionDef[] = [
  // ── Gen 1 story: Kanto Elite Four + Champion ──
  {
    floor: 1,
    name: 'Lorelei',
    icon: '❄️',
    team: [87, 91, 124, 131], // Dewgong, Cloyster, Jynx, Lapras
    bossIndex: 3,
    dialogue: "No one can best me when it comes to icy Pokemon! Freeze them!",
    floorName: 'Lorelei - Ice Master',
  },
  {
    floor: 2,
    name: 'Bruno',
    icon: '💪',
    team: [95, 107, 106, 68], // Onix, Hitmonchan, Hitmonlee, Machamp
    bossIndex: 3,
    dialogue: "Through rigorous training, people and Pokemon can become stronger without limit!",
    floorName: 'Bruno - Fighting Master',
  },
  {
    floor: 3,
    name: 'Agatha',
    icon: '👻',
    team: [42, 93, 24, 94], // Golbat, Haunter, Arbok, Gengar
    bossIndex: 3,
    dialogue: "I see you have no fear... The Gengar line has been my Pokemon of choice for decades!",
    floorName: 'Agatha - Ghost Master',
  },
  {
    floor: 4,
    name: 'Lance',
    icon: '🐉',
    team: [148, 130, 142, 149], // Dragonair, Gyarados, Aerodactyl, Dragonite
    bossIndex: 3,
    dialogue: "I am the last of the Elite Four! I have been waiting for a truly powerful challenger!",
    floorName: 'Lance - Dragon Master',
  },
  {
    floor: 5,
    name: 'Blue',
    icon: '👑',
    team: [18, 65, 112, 59, 103, 9], // Pidgeot, Alakazam, Rhydon, Arcanine, Exeggutor, Blastoise
    bossIndex: 5,
    dialogue: "Hey! I heard you beat the Elite Four! Well, I'm the Champion! You'll need more than that to beat me!",
    floorName: 'Blue - Champion',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getGymLeader(regionId: number): GymLeaderDef | undefined {
  return GYM_LEADERS.find(g => g.regionId === regionId);
}

export function getLeagueChampion(floor: number): LeagueChampionDef | undefined {
  return LEAGUE_CHAMPIONS.find(c => c.floor === floor);
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
  if (regionId === 10) {
    const champion = getLeagueChampion(floor);
    if (!champion) return null;
    return { name: champion.name, icon: champion.icon, dialogue: champion.dialogue };
  }
  // For regions 1-9, only the boss floor (floor 10) has a gym leader
  if (floor !== 10) return null;
  const leader = getGymLeader(regionId);
  if (!leader) return null;
  return { name: leader.name, icon: leader.icon, dialogue: leader.dialogue };
}
