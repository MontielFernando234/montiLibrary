import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/database';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/** Loading spinner shown while auth state is being determined */
function AuthLoader(): React.JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-surface-300 text-sm">Verificando sesión...</p>
      </div>
    </div>
  );
}

/**
 * Protects routes based on authentication status and user role.
 * - Unauthenticated users → redirected to /login (preserving original URL)
 * - Authenticated users without required role → redirected to /catalogo
 * - Deactivated users are handled by AuthContext (signed out automatically)
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps): React.JSX.Element {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoader />;
  }

  // Not authenticated → go to login, preserve intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Authenticated but role check needed
  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/catalogo" replace />;
  }

  return <>{children}</>;
}

/**
 * Redirects authenticated users away from public pages (login, register).
 * - Readers → /catalogo
 * - Admins → /admin
 */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoader />;
  }

  if (user && profile) {
    const destination = profile.role === 'admin' ? '/admin' : '/catalogo';
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
}
