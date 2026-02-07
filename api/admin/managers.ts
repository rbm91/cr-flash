import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Non authentifie' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'Acces reserve aux administrateurs' });

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('cr_managers').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Nom et email requis' });
    const { data, error } = await supabase.from('cr_managers').insert({ name, email }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'PUT') {
    const { id, name, email } = req.body;
    if (!id || !name || !email) return res.status(400).json({ error: 'ID, nom et email requis' });
    const { data, error } = await supabase.from('cr_managers').update({ name, email }).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'DELETE') {
    const id = req.query.id || req.body?.id;
    if (!id) return res.status(400).json({ error: 'ID requis' });
    const { error } = await supabase.from('cr_managers').delete().eq('id', parseInt(id as string));
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
