import type { VercelRequest } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || 'cr-flash-jwt-secret-dev';

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
  name: string;
}

async function getJwt() {
  const mod = await import('jsonwebtoken');
  return (mod as any).default || mod;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  const jwt = await getJwt();
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export async function verifyToken(req: VercelRequest): Promise<TokenPayload | null> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && (authHeader as string).split(' ')[1];
  if (!token) return null;

  try {
    const jwt = await getJwt();
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
