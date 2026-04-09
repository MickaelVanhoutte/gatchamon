import type { PokemonInstance, PokemonTemplate } from '@gatchamon/shared';
import { getTemplate } from '@gatchamon/shared';
import { rollPremiumStarRating, pickFromPool, createTemporaryInstance, persistInstance } from './gacha.service.js';
import { incrementMission, trackTrophyStat, getInbox, claimInboxReward } from './daily.service.js';

const MAX_ATTEMPTS = 100;

interface RetrySummonResult {
  pokemon: PokemonInstance;
  template: PokemonTemplate;
}

interface RetrySession {
  attemptsUsed: number;
  currentResults: RetrySummonResult[] | null;
  backupResults: RetrySummonResult[] | null;
  inboxItemId: string;
}

// In-memory session store — sessions are short-lived and don't need persistence
const sessions = new Map<string, RetrySession>();

function generateRoll(playerId: string): RetrySummonResult[] {
  const results: RetrySummonResult[] = [];
  for (let i = 0; i < 10; i++) {
    const stars = rollPremiumStarRating();
    const template = pickFromPool(stars);
    const pokemon = createTemporaryInstance(template, playerId);
    results.push({ pokemon, template });
  }
  return results;
}

export function getSession(playerId: string): RetrySession | null {
  return sessions.get(playerId) ?? null;
}

export function startOrResumeSession(playerId: string, inboxItemId: string): RetrySession {
  const existing = sessions.get(playerId);
  if (existing) return existing;

  const session: RetrySession = {
    attemptsUsed: 0,
    currentResults: null,
    backupResults: null,
    inboxItemId,
  };
  sessions.set(playerId, session);
  return session;
}

export function rollOnce(playerId: string): RetrySummonResult[] {
  const session = sessions.get(playerId);
  if (!session) throw new Error('No active retry summon session');
  if (session.attemptsUsed >= MAX_ATTEMPTS) throw new Error('Max attempts reached');

  const results = generateRoll(playerId);
  session.currentResults = results;
  session.attemptsUsed++;
  return results;
}

export function saveBackupAndRoll(playerId: string): RetrySummonResult[] {
  const session = sessions.get(playerId);
  if (!session) throw new Error('No active retry summon session');
  if (!session.currentResults) throw new Error('No current results to save as backup');
  if (session.attemptsUsed >= MAX_ATTEMPTS) throw new Error('Max attempts reached');

  session.backupResults = session.currentResults;
  const results = generateRoll(playerId);
  session.currentResults = results;
  session.attemptsUsed++;
  return results;
}

export function confirmChoice(playerId: string, choice: 'current' | 'backup'): RetrySummonResult[] {
  const session = sessions.get(playerId);
  if (!session) throw new Error('No active retry summon session');

  const chosen = choice === 'current' ? session.currentResults : session.backupResults;
  if (!chosen) throw new Error(`No ${choice} results to confirm`);

  // Persist all chosen pokemon to DB
  for (const result of chosen) {
    persistInstance(result.pokemon);
  }

  // Track stats
  trackTrophyStat(playerId, 'totalSummons', 10);
  trackTrophyStat(playerId, 'totalMonstersCollected', 10);
  incrementMission(playerId, 'summon_any', 10);
  incrementMission(playerId, 'collect_monster', 10);

  // Claim the inbox item
  claimInboxReward(playerId, session.inboxItemId);

  // Clean up session
  sessions.delete(playerId);

  return chosen;
}
