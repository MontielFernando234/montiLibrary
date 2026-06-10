import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Profile } from '@/types/database';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { UserDeleteDialog } from '@/components/admin/UserDeleteDialog';
import { ResetPasswordButton } from '@/components/admin/ResetPasswordButton';

type FilterRole = 'all' | 'reader' | 'admin';
type FilterStatus = 'all' | 'active' | 'inactive';

/** UsersPage (US-08, US-09, US-10, US-11, US-12) — Admin user management */
export default function UsersPage(): React.JSX.Element {
  const [users, setUsers] = useState<Profile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [page, setPage] = useState(0);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [deletingUser, setDeletingUser] = useState<Profile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { profile: currentProfile } = useAuth();
  const { addToast } = useToast();
  const PAGE_SIZE = 10;

  const fetchUsers = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filterRole !== 'all') {
      query = query.eq('role', filterRole);
    }

    if (filterStatus === 'active') {
      query = query.eq('is_active', true);
    } else if (filterStatus === 'inactive') {
      query = query.eq('is_active', false);
    }

    if (searchEmail.trim()) {
      query = query.ilike('id', `%${searchEmail.trim()}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      addToast('Error al cargar usuarios', 'error');
      console.error('Error fetching users:', error);
    } else {
      setUsers(data ?? []);
      setTotalCount(count ?? 0);
    }

    setIsLoading(false);
  }, [page, filterRole, filterStatus, searchEmail, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchEmail]);

  const handleToggleActive = useCallback(async (user: Profile): Promise<void> => {
    if (user.id === currentProfile?.id) {
      addToast('No puedes desactivar tu propia cuenta', 'warning');
      return;
    }

    const newStatus = !user.is_active;
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: newStatus })
      .eq('id', user.id);

    if (error) {
      addToast('Error al actualizar estado del usuario', 'error');
      return;
    }

    addToast(
      newStatus ? 'Usuario reactivado correctamente' : 'Usuario desactivado correctamente',
      'success'
    );
    fetchUsers();
  }, [currentProfile, addToast, fetchUsers]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Gestión de Usuarios</h1>
          <p className="text-surface-400 text-sm mt-1">
            {totalCount} usuario{totalCount !== 1 ? 's' : ''} registrado{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-sm px-4 py-2.5"
          id="btn-create-user"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <input
          type="text"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="Buscar por email..."
          className="glass-input px-3 py-2 text-sm flex-1"
          id="search-users"
        />

        {/* Role filter */}
        <select
          value={filterRole}
          onChange={(e) => { setFilterRole(e.target.value as FilterRole); setPage(0); }}
          className="glass-input px-3 py-2 text-sm w-full sm:w-40"
          id="filter-role"
        >
          <option value="all">Todos los roles</option>
          <option value="reader">Lector</option>
          <option value="admin">Administrador</option>
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as FilterStatus); setPage(0); }}
          className="glass-input px-3 py-2 text-sm w-full sm:w-40"
          id="filter-status"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-surface-400 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-surface-400 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-surface-400 font-medium">Rol</th>
                <th className="text-left px-4 py-3 text-surface-400 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-surface-400 font-medium">Registro</th>
                <th className="text-right px-4 py-3 text-surface-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-surface-400">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-surface-400">
                    No se encontraron usuarios con ese criterio
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3 text-surface-100 font-medium">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-4 py-3 text-surface-300">{user.id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-accent-500/20 text-accent-400'
                          : 'bg-primary-500/20 text-primary-400'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Lector'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${
                        user.is_active ? 'text-success-500' : 'text-danger-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          user.is_active ? 'bg-success-500' : 'bg-danger-500'
                        }`} />
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-surface-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="px-2 py-1 text-xs text-primary-400 hover:bg-primary-500/10 rounded transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            user.is_active
                              ? 'text-warning-500 hover:bg-warning-500/10'
                              : 'text-success-500 hover:bg-success-500/10'
                          }`}
                          title={user.is_active ? 'Desactivar' : 'Reactivar'}
                          disabled={user.id === currentProfile?.id}
                        >
                          {user.is_active ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="px-2 py-1 text-xs text-danger-500 hover:bg-danger-500/10 rounded transition-colors"
                          title="Eliminar"
                          disabled={user.id === currentProfile?.id}
                        >
                          🗑️
                        </button>
                        <ResetPasswordButton userId={user.id} userEmail="" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-surface-400">
              Página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(showCreateModal || editingUser) && (
        <UserFormModal
          user={editingUser}
          onClose={() => { setShowCreateModal(false); setEditingUser(null); }}
          onSaved={() => { setShowCreateModal(false); setEditingUser(null); fetchUsers(); }}
        />
      )}

      {deletingUser && (
        <UserDeleteDialog
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onDeleted={() => { setDeletingUser(null); fetchUsers(); }}
        />
      )}
    </div>
  );
}
