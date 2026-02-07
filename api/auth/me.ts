import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Non authentifie' });

  const { data, error } = await supabase
    .from('cr_users')
    .select('id, name, email, role')
    .eq('id', user.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Utilisateur non trouve' });
  return res.json(data);
}
