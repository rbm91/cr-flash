import type { VercelRequest, VercelResponse } from '@vercel/node';

async function getSupabase() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || '');
}

async function verifyToken(req: VercelRequest) {
  const jwtMod = await import('jsonwebtoken');
  const jwt = (jwtMod as any).default || jwtMod;
  const JWT_SECRET = process.env.JWT_SECRET || 'cr-flash-jwt-secret-dev';
  const authHeader = req.headers['authorization'];
  const token = authHeader && (authHeader as string).split(' ')[1];
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string; name: string }; } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ error: 'Non authentifie' });

    const supabase = await getSupabase();
    const type = req.query.type as string;

    if (type === 'gt-commissions') {
      const { data, error } = await supabase.from('cr_gt_commissions').select('*');
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    if (type === 'managers') {
      const { data, error } = await supabase.from('cr_managers').select('*');
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(400).json({ error: 'Type invalide (gt-commissions ou managers)' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
