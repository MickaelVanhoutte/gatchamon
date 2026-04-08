import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt.js';

declare global {
  namespace Express {
    interface Request {
      playerId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const payload = verifyToken(header.slice(7));
    req.playerId = payload.playerId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
