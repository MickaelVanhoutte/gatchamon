import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

export interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleUser> {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub) {
    throw new Error('Invalid Google token');
  }
  return {
    googleId: payload.sub,
    email: payload.email ?? '',
    name: payload.name ?? '',
  };
}
