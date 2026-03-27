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
  {
    regionId: 1,
    name: 'Bugsy',
    icon: '🪲',
    team: [
      [10, 11, 12],    // Caterpie → Metapod → Butterfree
      [13, 14, 15],    // Weedle → Kakuna → Beedrill
      [123, 212, 212], // Scyther → Scizor → Scizor
    ],
    bossIndex: 2,
    dialogue: "My bug Pokemon are tough as nails! Bring it on!",
  },
  {
    regionId: 2,
    name: 'Whitney',
    icon: '🐄',
    team: [
      [19, 20, 20],    // Rattata → Raticate → Raticate
      [39, 35, 36],    // Jigglypuff → Clefairy → Clefable
      [241, 241, 241], // Miltank → Miltank → Miltank
    ],
    bossIndex: 2,
    dialogue: "Don't you dare underestimate my Pokemon!",
  },
  {
    regionId: 3,
    name: 'Janine',
    icon: '🥷',
    team: [
      [41, 42, 169],   // Zubat → Golbat → Crobat
      [49, 49, 49],    // Venomoth → Venomoth → Venomoth
      [89, 89, 89],    // Muk → Muk → Muk
    ],
    bossIndex: 2,
    dialogue: "I shall demonstrate the art of poison!",
  },
  {
    regionId: 4,
    name: 'Brock',
    icon: '🪨',
    team: [
      [74, 75, 76],      // Geodude → Graveler → Golem
      [95, 208, 208],    // Onix → Steelix → Steelix
      [142, 142, 142],   // Aerodactyl → Aerodactyl → Aerodactyl
    ],
    bossIndex: 2,
    dialogue: "My rock-solid willpower is evident in my Pokemon!",
  },
  {
    regionId: 5,
    name: 'Misty',
    icon: '💧',
    team: [
      [60, 61, 62],     // Poliwag → Poliwhirl → Poliwrath
      [120, 121, 121],  // Staryu → Starmie → Starmie
      [131, 131, 131],  // Lapras → Lapras → Lapras
    ],
    bossIndex: 2,
    dialogue: "My water-type Pokemon will wash you away!",
  },
  {
    regionId: 6,
    name: 'Lt. Surge',
    icon: '⚡',
    team: [
      [25, 26, 26],     // Pikachu → Raichu → Raichu
      [100, 101, 101],  // Voltorb → Electrode → Electrode
      [106, 106, 106],  // Hitmonlee → Hitmonlee → Hitmonlee
    ],
    bossIndex: 2,
    dialogue: "Hey kid! You won't live long in combat! Not with your Pokemon!",
  },
  {
    regionId: 7,
    name: 'Blaine',
    icon: '🔥',
    team: [
      [4, 5, 6],        // Charmander → Charmeleon → Charizard
      [77, 78, 78],     // Ponyta → Rapidash → Rapidash
      [58, 59, 59],     // Growlithe → Arcanine → Arcanine
    ],
    bossIndex: 2,
    dialogue: "Hah! My fiery Pokemon will incinerate all challengers!",
  },
  {
    regionId: 8,
    name: 'Morty',
    icon: '👻',
    team: [
      [92, 93, 94],         // Gastly → Haunter → Gengar
      [679, 680, 681],      // Honedge → Doublade → Aegislash
      [302, 302, 10302],    // Sableye → Sableye → Sableye-Mega
    ],
    bossIndex: 2,
    dialogue: "I see everything with my mind's eye... including your defeat!",
  },
  {
    regionId: 9,
    name: 'Pryce',
    icon: '❄️',
    team: [
      [220, 221, 473],  // Swinub → Piloswine → Mamoswine
      [215, 461, 461],  // Sneasel → Weavile → Weavile
      [996, 997, 998],  // Frigibax → Arctibax → Baxcalibur
    ],
    bossIndex: 2,
    dialogue: "Pokemon have many experiences in their pokemon lifetimes. I, too, have seen and suffered a lot. Since I am your elder, let me show you what I mean.",
  },
];

// ---------------------------------------------------------------------------
// Pokemon League champions (region 10, 5 floors)
// ---------------------------------------------------------------------------

export const LEAGUE_CHAMPIONS: LeagueChampionDef[] = [
  {
    floor: 1,
    name: 'Will',
    icon: '🔮',
    team: [178, 124, 80, 103], // Xatu, Jynx, Slowbro, Exeggutor
    bossIndex: 3,
    dialogue: "I have trained all around the world, making my psychic Pokemon powerful. Allow me to demonstrate!",
    floorName: 'Will - Psychic Master',
  },
  {
    floor: 2,
    name: 'Koga',
    icon: '🥷',
    team: [168, 205, 89, 169], // Ariados, Forretress, Muk, Crobat
    bossIndex: 3,
    dialogue: "Fwahahahaha! I am Koga, master of poison! Prepare to be defeated!",
    floorName: 'Koga - Poison Master',
  },
  {
    floor: 3,
    name: 'Bruno',
    icon: '💪',
    team: [237, 106, 107, 68], // Hitmontop, Hitmonlee, Hitmonchan, Machamp
    bossIndex: 3,
    dialogue: "I trained with my fighting Pokemon through mountains and storms! We are ready!",
    floorName: 'Bruno - Fighting Master',
  },
  {
    floor: 4,
    name: 'Karen',
    icon: '🌙',
    team: [197, 198, 229, 94], // Umbreon, Murkrow, Houndoom, Gengar
    bossIndex: 3,
    dialogue: "Strong Pokemon. Weak Pokemon. That is only the selfish perception of people. Truly skilled trainers should try to win with their favorites.",
    floorName: 'Karen - Dark Master',
  },
  {
    floor: 5,
    name: 'Cynthia',
    icon: '👑',
    team: [442, 407, 350, 448, 468, 445], // Spiritomb, Roserade, Milotic, Lucario, Togekiss, Garchomp
    bossIndex: 5,
    dialogue: "When one life meets another life, something will be born. I'm Pokemon League Champion Cynthia. I accept your challenge!",
    floorName: 'Cynthia - Champion',
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
