import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { supabase } from './lib/supabase';
import { signToken, verifyToken } from './lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Route: /api/auth?action=login or /api/auth?action=me
  const action = req.query.action as string;

  if (action === 'login' && req.method === 'POST') {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

      const { data: user, error } = await supabase
        .from('cr_users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

      const isValid = bcrypt.compareSync(password, user.password);
      if (!isValid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

      const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (action === 'me' && req.method === 'GET') {
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

  return res.status(400).json({ error: 'Action invalide' });
}
