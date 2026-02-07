import type { VercelRequest } from '@vercel/node';

export async function getSupabase() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  );
}

export async function verifyToken(req: VercelRequest) {
  const jwtMod = await import('jsonwebtoken');
  const jwt = (jwtMod as any).default || jwtMod;
  const JWT_SECRET = process.env.JWT_SECRET || 'cr-flash-jwt-secret-dev';

  const authHeader = req.headers['authorization'];
  const token = authHeader && (authHeader as string).split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string; name: string };
  } catch {
    return null;
  }
}
