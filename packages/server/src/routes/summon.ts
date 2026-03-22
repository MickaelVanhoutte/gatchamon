import { Router } from 'express';

export const summonRouter = Router();

// Will be implemented in Phase 3
summonRouter.post('/', (_req, res) => {
  res.status(501).json({ error: 'Not yet implemented' });
});
