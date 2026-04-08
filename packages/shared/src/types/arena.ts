// ---------------------------------------------------------------------------
// Arena types — PvP matchmaking, defense teams, history, and rivals
// ---------------------------------------------------------------------------

export interface ArenaDefense {
  playerId: string;
  teamInstanceIds: string[];
  updatedAt: string;
}

/** Public-facing opponent info (no instance IDs exposed to attackers). */
export interface ArenaOpponent {
  playerId: string;
  playerName: string;
  trainerLevel: number;
  arenaElo: number;
  defenseTeam: ArenaDefensePreview[];
}

export interface ArenaDefensePreview {
  templateId: number;
  level: number;
  stars: number;
  isShiny: boolean;
}

export interface ArenaHistoryEntry {
  id: string;
  attackerId: string;
  attackerName: string;
  defenderId: string;
  defenderName: string;
  attackerWon: boolean;
  attackerTeam: ArenaDefensePreview[];
  defenderTeam: ArenaDefensePreview[];
  attackerEloChange: number;
  defenderEloChange: number;
  createdAt: string;
}

export interface ArenaRival {
  rivalId: string;
  name: string;
  icon: string;
  team: ArenaDefensePreview[];
  cooldownExpired: boolean;
}

export interface ArenaRewards {
  stardust: number;
  arenaCoins: number;
  eloChange: number;
}
