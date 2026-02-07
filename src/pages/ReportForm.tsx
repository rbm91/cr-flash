import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import StarRating from '../components/StarRating';
import { reportsApi, configApi } from '../services/api';
import { GtCommission, ReportFormData } from '../types';

export default function ReportForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [commissions, setCommissions] = useState<GtCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [reportId, setReportId] = useState<number | null>(id ? parseInt(id) : null);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState<ReportFormData>({
    gtCommission: '', meetingDate: '', agenda: '', meetingVibe: 3, rulesRespect: 3,
    discussedTopics: '', progressAndAgreements: '', issuesAndDisagreements: '',
    topicsForNextMeeting: '', networkCommunication: '', nextMeetingDate: '',
  });

  const formRef = useRef(form);
  formRef.current = form;
  const reportIdRef = useRef(reportId);
  reportIdRef.current = reportId;

  useEffect(() => {
    const loadData = async () => {
      try {
        const comms = await configApi.getGtCommissions();
        setCommissions(comms);
        if (id) {
          const report = await reportsApi.getById(parseInt(id));
          setForm({
            gtCommission: report.gt_commission || '',
            meetingDate: report.meeting_date || '',
            agenda: report.agenda || '',
            meetingVibe: report.meeting_vibe || 3,
            rulesRespect: report.rules_respect || 3,
            discussedTopics: report.discussed_topics || '',
            progressAndAgreements: report.progress_and_agreements || '',
            issuesAndDisagreements: report.issues_and_disagreements || '',
            topicsForNextMeeting: report.topics_for_next_meeting || '',
            networkCommunication: report.network_communication || '',
            nextMeetingDate: report.next_meeting_date || '',
          });
        }
      } catch (err: any) { setError(err.message); }
      finally { setLoading(false); }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => { autoSave(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const autoSave = useCallback(async () => {
    try {
      if (reportIdRef.current) {
        await reportsApi.update(reportIdRef.current, formRef.current);
      } else {
        const created = await reportsApi.create(formRef.current);
        setReportId(created.id);
        reportIdRef.current = created.id;
      }
      setLastSaved(new Date().toLocaleTimeString('fr-FR'));
    } catch {}
  }, []);

  const handleSaveDraft = async () => {
    setSaving(true); setError('');
    try {
      if (reportId) { await reportsApi.update(reportId, form); }
      else { const created = await reportsApi.create(form); setReportId(created.id); }
      setLastSaved(new Date().toLocaleTimeString('fr-FR'));
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      let currentId = reportId;
      if (currentId) { await reportsApi.update(currentId, form); }
      else { const created = await reportsApi.create(form); currentId = created.id; }
      await reportsApi.submit(currentId!);
      navigate('/dashboard');
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const updateField = <K extends keyof ReportFormData>(field: K, value: ReportFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Previsualisation</h1>
          <button onClick={() => setShowPreview(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">Retour au formulaire</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-primary-800">Compte-Rendu Flash</h2>
            <p className="text-gray-500">GT/Commission : {form.gtCommission || '-'}</p>
            <p className="text-gray-500">Date de reunion : {form.meetingDate || '-'}</p>
          </div>
          <PreviewSection title="Ordre du jour" content={form.agenda} />
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-sm font-medium text-gray-700">Ambiance : </span><span className="text-yellow-500">{'★'.repeat(form.meetingVibe || 0)}{'☆'.repeat(5 - (form.meetingVibe || 0))}</span></div>
            <div><span className="text-sm font-medium text-gray-700">Respect des regles : </span><span className="text-yellow-500">{'★'.repeat(form.rulesRespect || 0)}{'☆'.repeat(5 - (form.rulesRespect || 0))}</span></div>
          </div>
          <PreviewSection title="Sujets discutes" content={form.discussedTopics} />
          <PreviewSection title="Avancees et accords" content={form.progressAndAgreements} />
          <PreviewSection title="Points de blocage" content={form.issuesAndDisagreements} />
          <PreviewSection title="Prochaine reunion" content={form.topicsForNextMeeting} />
          <PreviewSection title="Communication reseau" content={form.networkCommunication} />
          {form.nextMeetingDate && <div className="border-t pt-4"><span className="text-sm font-medium text-gray-700">Prochaine reunion : {form.nextMeetingDate}</span></div>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Modifier le Compte-Rendu' : 'Nouveau Compte-Rendu'}</h1>
          {lastSaved && <p className="text-sm text-green-600 mt-1">Derniere sauvegarde : {lastSaved}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPreview(true)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">Previsualiser</button>
          <button onClick={handleSaveDraft} disabled={saving} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors">{saving ? 'Sauvegarde...' : 'Enregistrer le brouillon'}</button>
          <button onClick={handleSubmit} disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">Soumettre</button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GT / Commission</label>
          <select value={form.gtCommission} onChange={(e) => updateField('gtCommission', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="">Selectionnez...</option>
            {commissions.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de la reunion</label>
          <input type="date" value={form.meetingDate} onChange={(e) => updateField('meetingDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ordre du jour</label>
          <RichTextEditor content={form.agenda || ''} onChange={(html) => updateField('agenda', html)} placeholder="Decrivez l'ordre du jour..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StarRating value={form.meetingVibe || 3} onChange={(v) => updateField('meetingVibe', v)} label="Ambiance de la reunion" />
          <StarRating value={form.rulesRespect || 3} onChange={(v) => updateField('rulesRespect', v)} label="Respect des regles de fonctionnement" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sujets discutes</label>
          <RichTextEditor content={form.discussedTopics || ''} onChange={(html) => updateField('discussedTopics', html)} placeholder="Quels sujets ont ete abordes ?" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Avancees et accords</label>
          <RichTextEditor content={form.progressAndAgreements || ''} onChange={(html) => updateField('progressAndAgreements', html)} placeholder="Quelles avancees et accords ?" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Points de blocage et desaccords</label>
          <RichTextEditor content={form.issuesAndDisagreements || ''} onChange={(html) => updateField('issuesAndDisagreements', html)} placeholder="Points de blocage ou desaccords ?" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sujets pour la prochaine reunion</label>
          <RichTextEditor content={form.topicsForNextMeeting || ''} onChange={(html) => updateField('topicsForNextMeeting', html)} placeholder="Sujets pour la prochaine reunion ?" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Communication reseau</label>
          <RichTextEditor content={form.networkCommunication || ''} onChange={(html) => updateField('networkCommunication', html)} placeholder="Informations a communiquer au reseau..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de la prochaine reunion</label>
          <input type="date" value={form.nextMeetingDate} onChange={(e) => updateField('nextMeetingDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Annuler</button>
          <button onClick={handleSaveDraft} disabled={saving} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors">Enregistrer le brouillon</button>
          <button onClick={handleSubmit} disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">Soumettre</button>
        </div>
      </div>
    </div>
  );
}

function PreviewSection({ title, content }: { title: string; content?: string }) {
  if (!content) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">{title}</h3>
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
