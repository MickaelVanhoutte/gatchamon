import { Router } from 'express';
import { getDb } from '../db/schema.js';

export const chatRouter = Router();

interface ChatRow {
  id: number;
  player_id: string;
  player_name: string;
  message: string;
  created_at: string;
}

function toMessage(row: ChatRow) {
  return {
    id: row.id,
    playerId: row.player_id,
    playerName: row.player_name,
    message: row.message,
    createdAt: row.created_at,
  };
}

// GET /chat/recent?afterId=N
chatRouter.get('/recent', (req, res) => {
  const db = getDb();
  const afterId = parseInt(req.query.afterId as string, 10);

  let rows: ChatRow[];
  if (afterId > 0) {
    rows = db.prepare(
      'SELECT * FROM chat_messages WHERE id > ? ORDER BY id ASC LIMIT 50'
    ).all(afterId) as ChatRow[];
  } else {
    rows = db.prepare(
      'SELECT * FROM chat_messages ORDER BY id DESC LIMIT 50'
    ).all() as ChatRow[];
    rows.reverse();
  }

  res.json({ messages: rows.map(toMessage) });
});

// POST /chat/message
chatRouter.post('/message', (req, res) => {
  const db = getDb();
  const playerId = req.playerId!;
  const text = (req.body.message ?? '').trim();

  if (!text || text.length > 200) {
    res.status(400).json({ error: 'Message must be 1-200 characters' });
    return;
  }

  // Rate limit: 1 message per 2 seconds per player
  const last = db.prepare(
    "SELECT created_at FROM chat_messages WHERE player_id = ? ORDER BY id DESC LIMIT 1"
  ).get(playerId) as { created_at: string } | undefined;

  if (last) {
    const elapsed = Date.now() - new Date(last.created_at + 'Z').getTime();
    if (elapsed < 2000) {
      res.status(429).json({ error: 'Too fast — wait a moment' });
      return;
    }
  }

  // Look up player name
  const player = db.prepare('SELECT name FROM players WHERE id = ?').get(playerId) as { name: string } | undefined;
  if (!player) {
    res.status(400).json({ error: 'Player not found' });
    return;
  }

  const result = db.prepare(
    'INSERT INTO chat_messages (player_id, player_name, message) VALUES (?, ?, ?)'
  ).run(playerId, player.name, text);

  const row = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(result.lastInsertRowid) as ChatRow;

  // Cleanup: keep only last 200 messages
  db.prepare(
    'DELETE FROM chat_messages WHERE id NOT IN (SELECT id FROM chat_messages ORDER BY id DESC LIMIT 200)'
  ).run();

  res.json({ ok: true, message: toMessage(row) });
});
