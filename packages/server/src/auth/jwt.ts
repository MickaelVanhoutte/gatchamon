import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface TokenPayload {
  playerId: string;
  googleId: string;
}

export function signToken(playerId: string, googleId: string): string {
  return jwt.sign({ playerId, googleId } satisfies TokenPayload, SECRET, {
    expiresIn: '30d',
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET) as TokenPayload;
}
