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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ error: 'Non authentifie' });

    const supabase = await getSupabase();
    const id = req.query.id ? parseInt(req.query.id as string) : null;
    const action = req.query.action as string | undefined;

    if (id) {
      if (action === 'submit' && req.method === 'POST') {
        const { data: existing } = await supabase.from('cr_reports').select('*').eq('id', id).single();
        if (!existing) return res.status(404).json({ error: 'Compte-rendu non trouve' });
        if (user.role !== 'admin' && existing.user_id !== user.id) return res.status(403).json({ error: 'Acces non autorise' });
        const { data, error } = await supabase.from('cr_reports').update({ status: 'submitted', updated_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      }
      if (action === 'history' && req.method === 'GET') {
        const { data: report } = await supabase.from('cr_reports').select('user_id').eq('id', id).single();
        if (!report) return res.status(404).json({ error: 'Compte-rendu non trouve' });
        if (user.role !== 'admin' && report.user_id !== user.id) return res.status(403).json({ error: 'Acces non autorise' });
        const { data, error } = await supabase.from('cr_report_history').select('*, cr_users(name)').eq('report_id', id).order('edited_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json((data || []).map((h: any) => ({ ...h, editorName: h.cr_users?.name || null, cr_users: undefined })));
      }
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('cr_reports').select('*').eq('id', id).single();
        if (error || !data) return res.status(404).json({ error: 'Compte-rendu non trouve' });
        if (user.role !== 'admin' && data.user_id !== user.id) return res.status(403).json({ error: 'Acces non autorise' });
        return res.json(data);
      }
      if (req.method === 'PUT') {
        const { data: existing } = await supabase.from('cr_reports').select('*').eq('id', id).single();
        if (!existing) return res.status(404).json({ error: 'Compte-rendu non trouve' });
        if (user.role !== 'admin' && existing.user_id !== user.id) return res.status(403).json({ error: 'Acces non autorise' });
        if (existing.status === 'submitted') {
          const changes: Record<string, any> = {};
          const fm: Record<string, string> = { gtCommission:'gt_commission', meetingDate:'meeting_date', agenda:'agenda', meetingVibe:'meeting_vibe', rulesRespect:'rules_respect', discussedTopics:'discussed_topics', progressAndAgreements:'progress_and_agreements', issuesAndDisagreements:'issues_and_disagreements', topicsForNextMeeting:'topics_for_next_meeting', networkCommunication:'network_communication', nextMeetingDate:'next_meeting_date' };
          for (const [c, s] of Object.entries(fm)) { if (req.body[c] !== undefined && req.body[c] !== existing[s]) changes[c] = { old: existing[s], new: req.body[c] }; }
          if (Object.keys(changes).length > 0) await supabase.from('cr_report_history').insert({ report_id: id, editor_id: user.id, changes });
        }
        const now = new Date().toISOString();
        const u: any = { updated_at: now };
        if (req.body.gtCommission !== undefined) u.gt_commission = req.body.gtCommission;
        if (req.body.meetingDate !== undefined) u.meeting_date = req.body.meetingDate;
        if (req.body.agenda !== undefined) u.agenda = req.body.agenda;
        if (req.body.meetingVibe !== undefined) u.meeting_vibe = req.body.meetingVibe;
        if (req.body.rulesRespect !== undefined) u.rules_respect = req.body.rulesRespect;
        if (req.body.discussedTopics !== undefined) u.discussed_topics = req.body.discussedTopics;
        if (req.body.progressAndAgreements !== undefined) u.progress_and_agreements = req.body.progressAndAgreements;
        if (req.body.issuesAndDisagreements !== undefined) u.issues_and_disagreements = req.body.issuesAndDisagreements;
        if (req.body.topicsForNextMeeting !== undefined) u.topics_for_next_meeting = req.body.topicsForNextMeeting;
        if (req.body.networkCommunication !== undefined) u.network_communication = req.body.networkCommunication;
        if (req.body.nextMeetingDate !== undefined) u.next_meeting_date = req.body.nextMeetingDate;
        if (req.body.status !== undefined) u.status = req.body.status;
        const { data, error } = await supabase.from('cr_reports').update(u).eq('id', id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (req.method === 'GET') {
      let query = supabase.from('cr_reports').select('*, cr_users(name)').order('updated_at', { ascending: false });
      if (user.role !== 'admin') query = query.eq('user_id', user.id);
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.json((data || []).map((r: any) => ({ ...r, userName: r.cr_users?.name || null, cr_users: undefined })));
    }

    if (req.method === 'POST') {
      const now = new Date().toISOString();
      const { data, error } = await supabase.from('cr_reports').insert({
        user_id: user.id, status: 'draft', gt_commission: req.body.gtCommission || null,
        meeting_date: req.body.meetingDate || null, agenda: req.body.agenda || null,
        meeting_vibe: req.body.meetingVibe || null, rules_respect: req.body.rulesRespect || null,
        discussed_topics: req.body.discussedTopics || null, progress_and_agreements: req.body.progressAndAgreements || null,
        issues_and_disagreements: req.body.issuesAndDisagreements || null,
        topics_for_next_meeting: req.body.topicsForNextMeeting || null,
        network_communication: req.body.networkCommunication || null,
        next_meeting_date: req.body.nextMeetingDate || null, created_at: now, updated_at: now,
      }).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
