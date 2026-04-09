/** Player ID stored locally — used for server API calls. */
const PLAYER_ID_KEY = 'gatchamon_player_id';

export function getPlayerId(): string | null {
  return localStorage.getItem(PLAYER_ID_KEY);
}

export function setPlayerId(id: string): void {
  localStorage.setItem(PLAYER_ID_KEY, id);
}

/** Auth token stored locally — used for authenticated API calls. */
const AUTH_TOKEN_KEY = 'gatchamon_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(PLAYER_ID_KEY);
}
