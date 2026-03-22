import { Router } from 'express';

export const collectionRouter = Router();

// Will be implemented in Phase 4
collectionRouter.get('/:playerId', (_req, res) => {
  res.status(501).json({ error: 'Not yet implemented' });
});
