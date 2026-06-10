import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/shared/ProtectedRoute';

// Lazy-loaded pages for optimal bundle splitting
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const CatalogoPage = lazy(() => import('@/pages/CatalogoPage'));
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'));

// Lazy-loaded layouts
const ReaderLayout = lazy(() => import('@/layouts/ReaderLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));

/** Suspense fallback */
function PageLoader(): React.JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-surface-400 text-sm">Cargando...</p>
      </div>
    </div>
  );
}

/**
 * Application router implementing US-17 access control:
 * - Public routes: /login, /register (redirect if authenticated)
 * - Protected routes: /catalogo (any authenticated user)
 * - Admin routes: /admin/* (admin role required)
 */
export function AppRouter(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes (redirect if already logged in) */}
          <Route path="/login" element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          } />

          {/* Reader routes (any authenticated user) */}
          <Route element={
            <ProtectedRoute>
              <ReaderLayout />
            </ProtectedRoute>
          }>
            <Route path="/catalogo" element={<CatalogoPage />} />
          </Route>

          {/* Admin routes (admin role required) */}
          <Route element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
