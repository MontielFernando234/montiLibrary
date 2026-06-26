import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { StatusBadge } from '@/components/catalog/StatusBadge';
import { BookFormModal } from '@/components/admin/BookFormModal';
import { BookDeleteDialog } from '@/components/admin/BookDeleteDialog';
import type { Book } from '@/types/database';

type FilterStatus = 'all' | 'available' | 'reserved';
type FilterVisibility = 'all' | 'visible' | 'hidden';
type FilterDeleted = 'active' | 'deleted' | 'all';

/** BooksAdminPage (US-13, US-14, US-15, US-16) — Admin book management */
export default function BooksAdminPage(): React.JSX.Element {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterVisibility, setFilterVisibility] = useState<FilterVisibility>('all');
  const [filterDeleted, setFilterDeleted] = useState<FilterDeleted>('active');
  const [page, setPage] = useState(0);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { profile } = useAuth();
  const { addToast } = useToast();
  const PAGE_SIZE = 10;

  const fetchBooks = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    let query = supabase
      .from('books')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    // Filter by soft-delete status
    if (filterDeleted === 'active') {
      query = query.eq('is_deleted', false);
    } else if (filterDeleted === 'deleted') {
      query = query.eq('is_deleted', true);
    }

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    if (filterVisibility === 'visible') {
      query = query.eq('is_visible', true);
    } else if (filterVisibility === 'hidden') {
      query = query.eq('is_visible', false);
    }

    if (searchQuery.trim()) {
      const term = `%${searchQuery.trim()}%`;
      query = query.or(`title.ilike.${term},author.ilike.${term}`);
    }

    const { data, count, error } = await query;

    if (error) {
      addToast('Error al cargar libros', 'error');
      console.error('Error fetching books:', error);
    } else {
      setBooks(data ?? []);
      setTotalCount(count ?? 0);
    }

    setIsLoading(false);
  }, [page, filterStatus, filterVisibility, filterDeleted, searchQuery, addToast]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleToggleVisibility = useCallback(async (book: Book): Promise<void> => {
    const newVisibility = !book.is_visible;
    const { error } = await supabase
      .from('books')
      .update({ is_visible: newVisibility })
      .eq('id', book.id);

    if (error) {
      addToast('Error al actualizar visibilidad', 'error');
      return;
    }

    addToast(
      newVisibility ? 'Libro visible en el catálogo' : 'Libro oculto del catálogo',
      'success'
    );
    fetchBooks();
  }, [addToast, fetchBooks]);

  const handleRestoreBook = useCallback(async (book: Book): Promise<void> => {
    const { error } = await supabase
      .from('books')
      .update({
        is_deleted: false,
        deleted_at: null,
        deleted_by: null,
      })
      .eq('id', book.id);

    if (error) {
      addToast('Error al restaurar libro', 'error');
      return;
    }

    addToast('Libro restaurado correctamente', 'success');
    fetchBooks();
  }, [addToast, fetchBooks]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Gestión de Libros</h1>
          <p className="text-surface-400 text-sm mt-1">
            {totalCount} libro{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-sm px-4 py-2.5"
          id="btn-create-book"
        >
          + Nuevo Libro
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por título o autor..."
          className="glass-input px-3 py-2 text-sm flex-1"
          id="search-books-admin"
        />

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as FilterStatus); setPage(0); }}
          className="glass-input px-3 py-2 text-sm w-full sm:w-36"
          id="filter-book-status"
        >
          <option value="all">Todos los estados</option>
          <option value="available">Disponible</option>
          <option value="reserved">Reservado</option>
        </select>

        <select
          value={filterVisibility}
          onChange={(e) => { setFilterVisibility(e.target.value as FilterVisibility); setPage(0); }}
          className="glass-input px-3 py-2 text-sm w-full sm:w-36"
          id="filter-book-visibility"
        >
          <option value="all">Visibilidad</option>
          <option value="visible">Visible</option>
          <option value="hidden">Oculto</option>
        </select>

        <select
          value={filterDeleted}
          onChange={(e) => { setFilterDeleted(e.target.value as FilterDeleted); setPage(0); }}
          className="glass-input px-3 py-2 text-sm w-full sm:w-36"
          id="filter-book-deleted"
        >
          <option value="active">Activos</option>
          <option value="deleted">Eliminados</option>
          <option value="all">Todos</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-surface-400 font-medium">Portada</th>
                <th className="text-left px-4 py-3 text-surface-400 font-medium">Título</th>
                <th className="text-left px-4 py-3 text-surface-400 font-medium">Autor</th>
                <th className="text-left px-4 py-3 text-surface-400 font-medium">Género</th>
                <th className="text-left px-4 py-3 text-surface-400 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-surface-400 font-medium">Visibilidad</th>
                <th className="text-right px-4 py-3 text-surface-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-surface-400">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-surface-400">
                    No se encontraron libros con ese criterio
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr
                    key={book.id}
                    className={`border-b border-white/5 hover:bg-white/3 transition-colors ${
                      book.is_deleted ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="w-10 h-14 rounded overflow-hidden bg-surface-800/50 shrink-0">
                        {book.cover_url ? (
                          <img
                            src={book.cover_url}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg opacity-40">
                            📖
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-surface-100 font-medium max-w-[200px] truncate">
                      {book.title}
                    </td>
                    <td className="px-4 py-3 text-surface-300">{book.author}</td>
                    <td className="px-4 py-3 text-surface-400 text-xs">{book.genre ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={book.status} />
                    </td>
                    <td className="px-4 py-3">
                      {book.is_deleted ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-danger-500">
                          <span className="w-2 h-2 rounded-full bg-danger-500" />
                          Eliminado
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 text-xs ${
                          book.is_visible ? 'text-success-500' : 'text-surface-500'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            book.is_visible ? 'bg-success-500' : 'bg-surface-500'
                          }`} />
                          {book.is_visible ? 'Visible' : 'Oculto'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {book.is_deleted ? (
                          <button
                            onClick={() => handleRestoreBook(book)}
                            className="px-2 py-1 text-xs text-success-500 hover:bg-success-500/10 rounded transition-colors"
                            title="Restaurar"
                          >
                            ♻️
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingBook(book)}
                              className="px-2 py-1 text-xs text-primary-400 hover:bg-primary-500/10 rounded transition-colors"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleToggleVisibility(book)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                book.is_visible
                                  ? 'text-surface-400 hover:bg-surface-500/10'
                                  : 'text-primary-400 hover:bg-primary-500/10'
                              }`}
                              title={book.is_visible ? 'Ocultar' : 'Mostrar'}
                            >
                              {book.is_visible ? '👁️' : '👁️‍🗨️'}
                            </button>
                            <button
                              onClick={() => setDeletingBook(book)}
                              className="px-2 py-1 text-xs text-danger-500 hover:bg-danger-500/10 rounded transition-colors"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </>
                        )}
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
      {(showCreateModal || editingBook) && (
        <BookFormModal
          book={editingBook}
          onClose={() => { setShowCreateModal(false); setEditingBook(null); }}
          onSaved={() => { setShowCreateModal(false); setEditingBook(null); fetchBooks(); }}
        />
      )}

      {deletingBook && (
        <BookDeleteDialog
          book={deletingBook}
          currentUserId={profile?.id ?? ''}
          onClose={() => setDeletingBook(null)}
          onDeleted={() => { setDeletingBook(null); fetchBooks(); }}
        />
      )}
    </div>
  );
}
