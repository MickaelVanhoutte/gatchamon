/**
 * Single source of truth for client vs server mode.
 *
 * - Build-time: set VITE_USE_SERVER=true in .env
 * - Runtime:    localStorage.setItem('gatchamon_use_server', 'true')
 * - Default:    false — game works fully offline via localStorage
 */
export const USE_SERVER =
  localStorage.getItem('gatchamon_use_server') === 'true' ||
  import.meta.env.VITE_USE_SERVER === 'true';

/** Player ID stored locally — used for server API calls. */
const PLAYER_ID_KEY = 'gatchamon_player_id';

export function getPlayerId(): string | null {
  return localStorage.getItem(PLAYER_ID_KEY);
}

export function setPlayerId(id: string): void {
  localStorage.setItem(PLAYER_ID_KEY, id);
}
