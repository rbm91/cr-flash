import _jwt from 'jsonwebtoken';
import type { VercelRequest } from '@vercel/node';

// Handle ESM/CJS interop - jsonwebtoken is CJS
const jwt = (_jwt as any).default || _jwt;

const JWT_SECRET = process.env.JWT_SECRET || 'cr-flash-jwt-secret-dev';

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(req: VercelRequest): TokenPayload | null {
  const authHeader = req.headers['authorization'];
  const token = authHeader && (authHeader as string).split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
