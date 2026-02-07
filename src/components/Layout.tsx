import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, onLogout, children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to || location.pathname.startsWith(to + '/');
    return (
      <Link
        to={to}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          active
            ? 'bg-primary-700 text-white'
            : 'text-primary-100 hover:bg-primary-600 hover:text-white'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-white font-bold text-lg">
                CR Flash
              </Link>
              <div className="flex gap-1">
                {navLink('/dashboard', 'Tableau de bord')}
                {navLink('/reports/new', 'Nouveau CR')}
                {user.role === 'admin' && navLink('/admin', 'Administration')}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-primary-200 text-sm">
                {user.name}
                <span className="ml-2 px-2 py-0.5 bg-primary-900 rounded text-xs uppercase">
                  {user.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="text-primary-200 hover:text-white text-sm font-medium transition-colors"
              >
                Deconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
