import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Non authentifie' });

  const id = parseInt(req.query.id as string);

  const { data: report } = await supabase.from('cr_reports').select('user_id').eq('id', id).single();
  if (!report) return res.status(404).json({ error: 'Compte-rendu non trouve' });
  if (user.role !== 'admin' && report.user_id !== user.id) {
    return res.status(403).json({ error: 'Acces non autorise' });
  }

  const { data, error } = await supabase
    .from('cr_report_history')
    .select('*, cr_users(name)')
    .eq('report_id', id)
    .order('edited_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const history = (data || []).map((h: any) => ({
    ...h,
    editorName: h.cr_users?.name || null,
    cr_users: undefined,
  }));
  return res.json(history);
}
