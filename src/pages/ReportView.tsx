import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Report, ReportHistoryEntry } from '../types';
import { reportsApi } from '../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportView() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([reportsApi.getById(parseInt(id)), reportsApi.getHistory(parseInt(id))])
      .then(([r, h]) => { setReport(r); setHistory(h); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const stripHtml = (html: string | null): string => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const exportExcel = () => {
    if (!report) return;
    const data = [
      ['Compte-Rendu Flash'], [],
      ['GT / Commission', report.gt_commission || ''],
      ['Date de reunion', report.meeting_date || ''],
      ['Ambiance', `${report.meeting_vibe || '-'}/5`],
      ['Respect des regles', `${report.rules_respect || '-'}/5`],
      [], ['Ordre du jour'], [stripHtml(report.agenda)],
      [], ['Sujets discutes'], [stripHtml(report.discussed_topics)],
      [], ['Avancees et accords'], [stripHtml(report.progress_and_agreements)],
      [], ['Points de blocage'], [stripHtml(report.issues_and_disagreements)],
      [], ['Prochaine reunion'], [stripHtml(report.topics_for_next_meeting)],
      [], ['Communication reseau'], [stripHtml(report.network_communication)],
      [], ['Date prochaine reunion', report.next_meeting_date || ''],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 35 }, { wch: 60 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Compte-Rendu Flash');
    XLSX.writeFile(wb, `CR_Flash_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPdf = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`CR_Flash_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (error || !report) return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error || 'Compte-rendu non trouve'}</div>;

  const statusBadge = report.status === 'submitted'
    ? <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Soumis</span>
    : <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Brouillon</span>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-800">&larr; Retour</Link>
          <h1 className="text-2xl font-bold text-gray-900">Compte-Rendu #{report.id}</h1>
          {statusBadge}
        </div>
        <div className="flex gap-2">
          <Link to={`/reports/${report.id}/edit`} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">Modifier</Link>
          {report.status === 'submitted' && (
            <>
              <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">Export Excel</button>
              <button onClick={exportPdf} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">Export PDF</button>
            </>
          )}
        </div>
      </div>

      <div ref={printRef} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold text-primary-800">Compte-Rendu Flash</h2>
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
            <p><span className="font-medium">GT/Commission :</span> {report.gt_commission || '-'}</p>
            <p><span className="font-medium">Date de reunion :</span> {report.meeting_date || '-'}</p>
          </div>
        </div>
        <Section title="Ordre du jour" content={report.agenda} />
        <div className="grid grid-cols-2 gap-4">
          <div><span className="text-sm font-medium text-gray-700">Ambiance : </span><span className="text-yellow-500 text-lg">{'★'.repeat(report.meeting_vibe || 0)}{'☆'.repeat(5 - (report.meeting_vibe || 0))}</span></div>
          <div><span className="text-sm font-medium text-gray-700">Respect des regles : </span><span className="text-yellow-500 text-lg">{'★'.repeat(report.rules_respect || 0)}{'☆'.repeat(5 - (report.rules_respect || 0))}</span></div>
        </div>
        <Section title="Sujets discutes" content={report.discussed_topics} />
        <Section title="Avancees et accords" content={report.progress_and_agreements} />
        <Section title="Points de blocage" content={report.issues_and_disagreements} />
        <Section title="Prochaine reunion" content={report.topics_for_next_meeting} />
        <Section title="Communication reseau" content={report.network_communication} />
        {report.next_meeting_date && <div className="border-t pt-4"><span className="text-sm font-medium text-gray-700">Prochaine reunion : {report.next_meeting_date}</span></div>}
      </div>

      {history.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des modifications</h3>
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="border-l-4 border-primary-300 pl-4 py-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{entry.editorName || 'Inconnu'}</span> - {entry.edited_at ? new Date(entry.edited_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                </p>
                <details className="mt-1">
                  <summary className="text-xs text-primary-600 cursor-pointer">Voir les modifications</summary>
                  <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(typeof entry.changes === 'string' ? JSON.parse(entry.changes) : entry.changes, null, 2)}</pre>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, content }: { title: string; content: string | null }) {
  if (!content) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">{title}</h3>
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
