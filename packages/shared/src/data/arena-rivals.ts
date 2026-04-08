import { GYM_LEADERS } from './gym-leaders.js';
import type { ArenaDefensePreview } from '../types/arena.js';
import { getTemplate } from './pokedex/index.js';

// ---------------------------------------------------------------------------
// Arena Rivals — Gym leaders as daily-battle NPCs
// ---------------------------------------------------------------------------

export interface ArenaRivalDef {
  rivalId: string;
  name: string;
  icon: string;
  /** Template IDs for the rival's team (normal-difficulty variants). */
  teamTemplateIds: number[];
}

/** Build arena rivals from the GYM_LEADERS definitions. */
export const ARENA_RIVALS: ArenaRivalDef[] = GYM_LEADERS.map(gl => ({
  rivalId: `gym-${gl.regionId}`,
  name: gl.name,
  icon: gl.icon,
  // Use the normal-difficulty (index 0) template for each slot
  teamTemplateIds: gl.team.map(slot => slot[0]),
}));

export function getArenaRival(rivalId: string): ArenaRivalDef | undefined {
  return ARENA_RIVALS.find(r => r.rivalId === rivalId);
}

/**
 * Get a rival's team with level scaling based on the attacker's ELO.
 * Base level 20, +1 per 50 ELO above 800, capped at 100.
 */
export function getArenaRivalTeam(
  rivalId: string,
  attackerElo: number,
): { templateIds: number[]; level: number; stars: 1 | 2 | 3; previews: ArenaDefensePreview[] } | undefined {
  const rival = getArenaRival(rivalId);
  if (!rival) return undefined;

  const level = Math.min(100, Math.max(20, 20 + Math.floor((attackerElo - 800) / 50)));
  // Stars scale mildly: 1★ below 1200, 2★ 1200-1600, 3★ above 1600
  const stars: 1 | 2 | 3 = attackerElo >= 1600 ? 3 : attackerElo >= 1200 ? 2 : 1;

  const previews: ArenaDefensePreview[] = rival.teamTemplateIds.map(tid => ({
    templateId: tid,
    level,
    stars,
    isShiny: false,
  }));

  return { templateIds: rival.teamTemplateIds, level, stars, previews };
}
