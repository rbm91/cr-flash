import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    // Dynamic imports to avoid ESM/CJS issues
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    );
    const jwtMod = await import('jsonwebtoken');
    const jwt = (jwtMod as any).default || jwtMod;
    const bcryptMod = await import('bcryptjs');
    const bcrypt = (bcryptMod as any).default || bcryptMod;

    const JWT_SECRET = process.env.JWT_SECRET || 'cr-flash-jwt-secret-dev';
    const action = req.query.action as string;

    if (action === 'login' && req.method === 'POST') {
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

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }

    if (action === 'me' && req.method === 'GET') {
      const authHeader = req.headers['authorization'];
      const tokenStr = authHeader && (authHeader as string).split(' ')[1];
      if (!tokenStr) return res.status(401).json({ error: 'Non authentifie' });

      let payload: any;
      try {
        payload = jwt.verify(tokenStr, JWT_SECRET);
      } catch {
        return res.status(401).json({ error: 'Token invalide' });
      }

      const { data, error } = await supabase
        .from('cr_users')
        .select('id, name, email, role')
        .eq('id', payload.id)
        .single();

      if (error || !data) return res.status(404).json({ error: 'Utilisateur non trouve' });
      return res.json(data);
    }

    return res.status(400).json({ error: 'Action invalide' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
