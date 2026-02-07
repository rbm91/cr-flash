import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, string> = {};

  try {
    const bcrypt = await import('bcryptjs');
    checks.bcryptjs = 'OK - keys: ' + Object.keys(bcrypt).join(',');
  } catch (e: any) {
    checks.bcryptjs = 'FAIL - ' + e.message;
  }

  try {
    const jwt = await import('jsonwebtoken');
    checks.jsonwebtoken = 'OK - keys: ' + Object.keys(jwt).join(',');
  } catch (e: any) {
    checks.jsonwebtoken = 'FAIL - ' + e.message;
  }

  try {
    const supamod = await import('@supabase/supabase-js');
    const createClient = supamod.createClient;
    checks.supabase_import = 'OK';
    const client = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    );
    const { data, error } = await client.from('cr_users').select('email').limit(1);
    checks.supabase_query = error ? 'FAIL - ' + error.message : 'OK - count: ' + (data?.length || 0);
  } catch (e: any) {
    checks.supabase = 'FAIL - ' + e.message;
  }

  checks.env_url = process.env.SUPABASE_URL ? 'SET' : 'NOT SET';
  checks.env_key = process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'NOT SET';
  checks.env_jwt = process.env.JWT_SECRET ? 'SET' : 'NOT SET';

  res.json(checks);
}
