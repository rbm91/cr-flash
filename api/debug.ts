import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, string> = {};

  try {
    const bcrypt = await import('bcryptjs');
    checks.bcryptjs = 'OK - ' + typeof bcrypt.default?.compareSync;
  } catch (e: any) {
    checks.bcryptjs = 'FAIL - ' + e.message;
  }

  try {
    const jwt = await import('jsonwebtoken');
    checks.jsonwebtoken = 'OK - ' + typeof jwt.default?.sign;
  } catch (e: any) {
    checks.jsonwebtoken = 'FAIL - ' + e.message;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    checks.supabase = 'OK - ' + typeof createClient;
  } catch (e: any) {
    checks.supabase = 'FAIL - ' + e.message;
  }

  checks.SUPABASE_URL = process.env.SUPABASE_URL ? 'SET' : 'NOT SET';
  checks.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'NOT SET';
  checks.JWT_SECRET = process.env.JWT_SECRET ? 'SET' : 'NOT SET';

  res.json(checks);
}
