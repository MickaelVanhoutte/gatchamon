import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { playerRouter } from './routes/player.js';
import { summonRouter } from './routes/summon.js';
import { collectionRouter } from './routes/collection.js';
import { battleRouter } from './routes/battle.js';
import { monsterManagementRouter } from './routes/monster-management.js';
import { heldItemsRouter } from './routes/held-items.js';
import { dailyRouter } from './routes/daily.js';
import { adminRouter } from './routes/admin.js';
import { arenaRouter } from './routes/arena.js';
import { chatRouter } from './routes/chat.js';
import { retrySummonRouter } from './routes/retry-summon.js';
import { authRouter } from './routes/auth.js';
import { worldBossRouter } from './routes/world-boss.js';
import { requireAuth } from './auth/middleware.js';
import { requireAdmin } from './auth/admin.js';
import { initDb } from './db/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Public routes (no auth required)
app.use('/api/auth', authRouter);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// All other routes require authentication
app.use('/api', requireAuth);
app.use('/api/player', playerRouter);
app.use('/api/summon', summonRouter);
app.use('/api/collection', collectionRouter);
app.use('/api/battle', battleRouter);
app.use('/api', monsterManagementRouter);
app.use('/api/items', heldItemsRouter);
app.use('/api/daily', dailyRouter);
app.use('/api/arena', arenaRouter);
app.use('/api/chat', chatRouter);
app.use('/api/retry-summon', retrySummonRouter);
app.use('/api/world-boss', worldBossRouter);
app.use('/api/admin', requireAdmin, adminRouter);

// In production, serve the client's built static files
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));

  // SPA fallback: any non-API route serves index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gatchamon server running on http://localhost:${PORT}`);
});
