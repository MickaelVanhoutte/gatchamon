import express from 'express';
import cors from 'cors';
import { playerRouter } from './routes/player.js';
import { summonRouter } from './routes/summon.js';
import { collectionRouter } from './routes/collection.js';
import { battleRouter } from './routes/battle.js';
import { initDb } from './db/schema.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Routes
app.use('/api/player', playerRouter);
app.use('/api/summon', summonRouter);
app.use('/api/collection', collectionRouter);
app.use('/api/battle', battleRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Gatchamon server running on http://localhost:${PORT}`);
});
