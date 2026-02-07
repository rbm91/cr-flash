import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, string> = {};

  try {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('test', 10);
    checks.bcryptjs = 'OK - hash: ' + hash.substring(0, 10);
  } catch (e: any) {
    checks.bcryptjs = 'FAIL - ' + e.message;
  }

  try {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ test: true }, 'secret');
    checks.jsonwebtoken = 'OK - token: ' + token.substring(0, 20);
  } catch (e: any) {
    checks.jsonwebtoken = 'FAIL - ' + e.message;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    checks.supabase_import = 'OK';
    const client = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    );
    const { data, error } = await client.from('cr_users').select('email').limit(1);
    checks.supabase_query = error ? 'FAIL - ' + error.message : 'OK - ' + JSON.stringify(data);
  } catch (e: any) {
    checks.supabase_query = 'FAIL - ' + e.message;
  }

  checks.env_url = process.env.SUPABASE_URL ? 'SET' : 'NOT SET';
  checks.env_key = process.env.SUPABASE_SERVICE_KEY ? 'SET (' + process.env.SUPABASE_SERVICE_KEY.length + ' chars)' : 'NOT SET';
  checks.env_jwt = process.env.JWT_SECRET ? 'SET' : 'NOT SET';

  res.json(checks);
}
