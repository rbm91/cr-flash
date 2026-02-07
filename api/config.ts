import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from './lib/auth';
import { supabase } from './lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Non authentifie' });

  // Route: /api/config?type=gt-commissions or /api/config?type=managers
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
}
