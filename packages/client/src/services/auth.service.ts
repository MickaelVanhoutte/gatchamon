import type { Player } from '@gatchamon/shared';
import { api } from './api';
import { setPlayerId, setAuthToken, clearAuth } from '../config';

interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
}

interface AuthResponse {
  token: string;
  player: Player;
}

interface NeedsNameResponse {
  needsName: true;
  googleUser: GoogleUser;
}

export type SignInResult = AuthResponse | NeedsNameResponse;

export function isAuthResponse(r: SignInResult): r is AuthResponse {
  return 'token' in r;
}

/** Sign in with a Google ID token. Returns player if exists, or { needsName } for new users. */
export async function signInWithGoogle(idToken: string): Promise<SignInResult> {
  return api.post<SignInResult>('/auth/google', { idToken });
}

/** Register a new player with a Google account and trainer name. */
export async function registerWithGoogle(idToken: string, name: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/google/register', { idToken, name });
}

/** Store auth token and player ID after successful authentication. */
export function handleAuthSuccess(response: AuthResponse): void {
  setAuthToken(response.token);
  setPlayerId(response.player.id);
}

/** Clear all auth state. */
export function signOut(): void {
  clearAuth();
  window.location.reload();
}
