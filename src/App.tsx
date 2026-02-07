import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportForm from './pages/ReportForm';
import ReportView from './pages/ReportView';
import Admin from './pages/Admin';

export default function App() {
  const { user, loading, login, logout, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout user={user!} onLogout={logout}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard user={user!} />} />
        <Route path="/reports/new" element={<ReportForm />} />
        <Route path="/reports/:id" element={<ReportView />} />
        <Route path="/reports/:id/edit" element={<ReportForm />} />
        {user!.role === 'admin' && <Route path="/admin" element={<Admin />} />}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
