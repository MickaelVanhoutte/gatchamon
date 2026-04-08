import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hktmika@gmail.com';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const payload = verifyToken(header.slice(7));
    if (payload.googleEmail !== ADMIN_EMAIL) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    req.playerId = payload.playerId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
