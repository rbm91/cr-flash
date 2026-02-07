import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { GtCommission, Manager } from '../types';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'commissions' | 'managers'>('commissions');
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Administration</h1>
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          <button onClick={() => setActiveTab('commissions')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'commissions' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            GT / Commissions
          </button>
          <button onClick={() => setActiveTab('managers')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'managers' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Managers
          </button>
        </nav>
      </div>
      {activeTab === 'commissions' ? <CommissionsTab /> : <ManagersTab />}
    </div>
  );
}

function CommissionsTab() {
  const [commissions, setCommissions] = useState<GtCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');

  const load = () => { setLoading(true); adminApi.getGtCommissions().then(setCommissions).catch(e => setError(e.message)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try { await adminApi.createGtCommission(newName.trim()); setNewName(''); load(); } catch (e: any) { setError(e.message); }
  };
  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    try { await adminApi.updateGtCommission(id, editingName.trim()); setEditingId(null); load(); } catch (e: any) { setError(e.message); }
  };
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette commission ?')) return;
    try { await adminApi.deleteGtCommission(id); load(); } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Chargement...</div>;
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      <div className="flex gap-2 mb-6">
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom de la nouvelle commission..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
        <button onClick={handleAdd} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Ajouter</button>
      </div>
      <div className="space-y-2">
        {commissions.map((c) => (
          <div key={c.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            {editingId === c.id ? (
              <>
                <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500" onKeyDown={(e) => e.key === 'Enter' && handleUpdate(c.id)} />
                <button onClick={() => handleUpdate(c.id)} className="text-green-600 hover:text-green-800 font-medium text-sm">Valider</button>
                <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 text-sm">Annuler</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-gray-900">{c.name}</span>
                <button onClick={() => { setEditingId(c.id); setEditingName(c.name); }} className="text-primary-600 hover:text-primary-800 font-medium text-sm">Modifier</button>
                <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Supprimer</button>
              </>
            )}
          </div>
        ))}
        {commissions.length === 0 && <p className="text-center text-gray-500 py-4">Aucune commission</p>}
      </div>
    </div>
  );
}

function ManagersTab() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [error, setError] = useState('');

  const load = () => { setLoading(true); adminApi.getManagers().then(setManagers).catch(e => setError(e.message)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    try { await adminApi.createManager(newName.trim(), newEmail.trim()); setNewName(''); setNewEmail(''); load(); } catch (e: any) { setError(e.message); }
  };
  const handleUpdate = async (id: number) => {
    if (!editingName.trim() || !editingEmail.trim()) return;
    try { await adminApi.updateManager(id, editingName.trim(), editingEmail.trim()); setEditingId(null); load(); } catch (e: any) { setError(e.message); }
  };
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce manager ?')) return;
    try { await adminApi.deleteManager(id); load(); } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Chargement...</div>;
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      <div className="flex gap-2 mb-6">
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
        <button onClick={handleAdd} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Ajouter</button>
      </div>
      <div className="space-y-2">
        {managers.map((m) => (
          <div key={m.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            {editingId === m.id ? (
              <>
                <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500" />
                <input type="email" value={editingEmail} onChange={(e) => setEditingEmail(e.target.value)} className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500" onKeyDown={(e) => e.key === 'Enter' && handleUpdate(m.id)} />
                <button onClick={() => handleUpdate(m.id)} className="text-green-600 hover:text-green-800 font-medium text-sm">Valider</button>
                <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 text-sm">Annuler</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-gray-900">{m.name}</span>
                <span className="flex-1 text-gray-500 text-sm">{m.email}</span>
                <button onClick={() => { setEditingId(m.id); setEditingName(m.name); setEditingEmail(m.email); }} className="text-primary-600 hover:text-primary-800 font-medium text-sm">Modifier</button>
                <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Supprimer</button>
              </>
            )}
          </div>
        ))}
        {managers.length === 0 && <p className="text-center text-gray-500 py-4">Aucun manager</p>}
      </div>
    </div>
  );
}
