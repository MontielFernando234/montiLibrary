import { useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

/** Reader layout with simple header navigation */
export default function ReaderLayout(): React.JSX.Element {
  const { profile, signOut } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  const handleLogout = useCallback(async (): Promise<void> => {
    await signOut();
    addToast('Sesión cerrada correctamente', 'success');
  }, [signOut, addToast]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/catalogo" className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            montiLibrary
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-4">
            <Link
              to="/catalogo"
              className={`text-sm transition-colors ${
                location.pathname === '/catalogo'
                  ? 'text-primary-400 font-medium'
                  : 'text-surface-300 hover:text-surface-100'
              }`}
            >
              Catálogo
            </Link>

            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-sm text-accent-400 hover:text-accent-300 transition-colors"
              >
                Admin
              </Link>
            )}

            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-surface-400 hover:text-surface-200 transition-colors"
              >
                Salir
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
