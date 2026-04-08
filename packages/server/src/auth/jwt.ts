import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface TokenPayload {
  playerId: string;
  googleId: string;
  googleEmail: string;
}

export function signToken(playerId: string, googleId: string, googleEmail: string): string {
  return jwt.sign({ playerId, googleId, googleEmail } satisfies TokenPayload, SECRET, {
    expiresIn: '30d',
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET) as TokenPayload;
}
