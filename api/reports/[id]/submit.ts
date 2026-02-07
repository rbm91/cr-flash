import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Non authentifie' });

  const id = parseInt(req.query.id as string);

  const { data: existing } = await supabase.from('cr_reports').select('*').eq('id', id).single();
  if (!existing) return res.status(404).json({ error: 'Compte-rendu non trouve' });
  if (user.role !== 'admin' && existing.user_id !== user.id) {
    return res.status(403).json({ error: 'Acces non autorise' });
  }

  const { data, error } = await supabase
    .from('cr_reports')
    .update({ status: 'submitted', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}
