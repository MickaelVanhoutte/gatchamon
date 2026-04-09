import { Router } from 'express';
import {
  getSession,
  startOrResumeSession,
  rollOnce,
  saveBackupAndRoll,
  confirmChoice,
} from '../services/retry-summon.service.js';
import { getInbox } from '../services/daily.service.js';

export const retrySummonRouter = Router();

/** Find the retry-summon inbox item for this player */
function findRetrySummonItem(playerId: string): { id: string } | null {
  const inbox = getInbox(playerId);
  const item = inbox.find(i => i.specialItem === 'retry-summon-100' && !i.claimed);
  return item ? { id: item.id } : null;
}

// Get current session state (for page resume)
retrySummonRouter.get('/state', (req, res) => {
  try {
    const playerId = (req as any).playerId;
    const session = getSession(playerId);

    // Also check if player has an unclaimed retry summon inbox item
    const inboxItem = findRetrySummonItem(playerId);

    res.json({
      hasItem: !!inboxItem,
      inboxItemId: inboxItem?.id ?? null,
      session: session ? {
        attemptsUsed: session.attemptsUsed,
        currentResults: session.currentResults,
        backupResults: session.backupResults,
      } : null,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Start session and perform first roll
retrySummonRouter.post('/roll', (req, res) => {
  try {
    const playerId = (req as any).playerId;

    // Ensure session exists
    let session = getSession(playerId);
    if (!session) {
      const inboxItem = findRetrySummonItem(playerId);
      if (!inboxItem) {
        res.status(400).json({ error: 'No retry summon item available' });
        return;
      }
      session = startOrResumeSession(playerId, inboxItem.id);
    }

    const results = rollOnce(playerId);
    res.json({
      attemptsUsed: session.attemptsUsed,
      results,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Save current as backup and perform new roll
retrySummonRouter.post('/save-backup', (req, res) => {
  try {
    const playerId = (req as any).playerId;
    const results = saveBackupAndRoll(playerId);
    const session = getSession(playerId);
    res.json({
      attemptsUsed: session?.attemptsUsed ?? 0,
      results,
      backupResults: session?.backupResults ?? null,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Confirm chosen set
retrySummonRouter.post('/confirm', (req, res) => {
  try {
    const playerId = (req as any).playerId;
    const { choice } = req.body;
    if (choice !== 'current' && choice !== 'backup') {
      res.status(400).json({ error: 'choice must be "current" or "backup"' });
      return;
    }
    const results = confirmChoice(playerId, choice);
    res.json({ results });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
