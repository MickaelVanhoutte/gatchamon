import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema.js';
import { verifyGoogleToken } from '../auth/google.js';
import { signToken } from '../auth/jwt.js';
import { rowToPlayer } from './player.js';
import { sendInboxItem } from '../services/daily.service.js';

export const authRouter = Router();

/** Sign in with Google. Returns player + token if account exists, or { needsName } for new users. */
authRouter.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ error: 'idToken is required' });
      return;
    }

    const googleUser = await verifyGoogleToken(idToken);
    const db = getDb();

    const row = db.prepare('SELECT * FROM players WHERE google_id = ?').get(googleUser.googleId) as any;
    if (row) {
      const token = signToken(row.id, googleUser.googleId, row.google_email ?? googleUser.email);
      res.json({ token, player: rowToPlayer(row) });
    } else {
      res.json({ needsName: true, googleUser: { googleId: googleUser.googleId, email: googleUser.email, name: googleUser.name } });
    }
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid Google token' });
  }
});

/** Register a new player with Google account. */
authRouter.post('/google/register', async (req, res) => {
  try {
    const { idToken, name } = req.body;
    if (!idToken || !name) {
      res.status(400).json({ error: 'idToken and name are required' });
      return;
    }

    const googleUser = await verifyGoogleToken(idToken);
    const db = getDb();
    const trimmed = (name as string).trim();

    if (!trimmed || trimmed.length > 20) {
      res.status(400).json({ error: 'Name must be 1-20 characters' });
      return;
    }

    // Check if Google account is already linked
    const existingGoogle = db.prepare('SELECT 1 FROM players WHERE google_id = ?').get(googleUser.googleId);
    if (existingGoogle) {
      res.status(409).json({ error: 'This Google account is already linked to a player' });
      return;
    }

    // Check name uniqueness
    const existingName = db.prepare('SELECT 1 FROM players WHERE LOWER(name) = LOWER(?)').get(trimmed);
    if (existingName) {
      res.status(409).json({ error: 'This trainer name is already taken' });
      return;
    }

    const id = uuidv4();
    const storyProgress = JSON.stringify({ normal: { '1': 1 }, hard: {}, hell: {} });
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO players (id, name, pokeballs, regular_pokeballs, premium_pokeballs, energy, story_progress, pokedollars, created_at, last_energy_update, google_id, google_email)
       VALUES (?, ?, 50, 50, 10, 100, ?, 10000, ?, ?, ?, ?)`
    ).run(id, trimmed, storyProgress, now, now, googleUser.googleId, googleUser.email);

    // Grant welcome bonuses
    sendInboxItem(id, {
      title: 'New Player Bonus: 100 Energy',
      message: "Welcome, new trainer! Here's some energy to help you on your journey.",
      reward: { energy: 100 },
    });
    sendInboxItem(id, {
      title: 'Welcome Gift: 100x Retry Summon!',
      message: 'Use this special ticket to perform a x10 premium summon up to 100 times. Save a backup and keep the best result!',
      specialItem: 'retry-summon-100',
    });

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id) as any;
    const token = signToken(id, googleUser.googleId, googleUser.email);
    res.status(201).json({ token, player: rowToPlayer(player) });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Registration failed' });
  }
});
