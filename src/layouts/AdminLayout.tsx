import { useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

/** Admin layout with sidebar navigation and header */
export default function AdminLayout(): React.JSX.Element {
  const { profile, signOut } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  const handleLogout = useCallback(async (): Promise<void> => {
    await signOut();
    addToast('Sesión cerrada correctamente', 'success');
  }, [signOut, addToast]);

  const isActive = (path: string): boolean => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            montiLibrary
          </h1>
          <p className="text-xs text-surface-400 mt-1">Panel de Administración</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <NavItem
            to="/admin"
            label="Dashboard"
            icon="📊"
            active={location.pathname === '/admin'}
          />
          <NavItem
            to="/admin/users"
            label="Usuarios"
            icon="👥"
            active={isActive('/admin/users')}
          />
          <NavItem
            to="/catalogo"
            label="Ver Catálogo"
            icon="📚"
            active={false}
          />
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-100 truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-xs text-accent-400">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost w-full text-sm py-2"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

/** Sidebar navigation item */
function NavItem({ to, label, icon, active }: {
  to: string;
  label: string;
  icon: string;
  active: boolean;
}): React.JSX.Element {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-primary-500/15 text-primary-400 font-medium'
          : 'text-surface-300 hover:bg-white/5 hover:text-surface-100'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
