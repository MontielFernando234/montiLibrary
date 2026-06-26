import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/contexts/ToastContext';
import { BookCard } from '@/components/catalog/BookCard';
import type { Book } from '@/types/database';

/** CatalogoPage (US-04, US-05, US-07) — Public book catalog with search and pagination */
export default function CatalogoPage(): React.JSX.Element {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);

  const { addToast } = useToast();
  const PAGE_SIZE = 12;

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchBooks = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    let query = supabase
      .from('books')
      .select('*', { count: 'exact' })
      .eq('is_visible', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    // US-05: Search by title or author (partial match)
    if (debouncedSearch.trim()) {
      const term = `%${debouncedSearch.trim()}%`;
      query = query.or(`title.ilike.${term},author.ilike.${term}`);
    }

    const { data, count, error } = await query;

    if (error) {
      addToast('Error al cargar el catálogo', 'error');
      console.error('Error fetching books:', error);
    } else {
      setBooks(data ?? []);
      setTotalCount(count ?? 0);
    }

    setIsLoading(false);
  }, [page, debouncedSearch, addToast]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Catálogo de Libros</h1>
          <p className="text-surface-400 text-sm mt-1">
            {totalCount} libro{totalCount !== 1 ? 's' : ''} disponible{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* US-05: Search bar */}
      <div className="glass-card p-4 mb-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-lg">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título o autor..."
            className="glass-input w-full pl-10 pr-4 py-3 text-sm"
            id="search-catalog"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 text-sm transition-colors"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Book grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <BookSkeleton key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-surface-200 mb-2">
            {debouncedSearch ? 'No se encontraron resultados' : 'Sin libros'}
          </h2>
          <p className="text-surface-400 text-sm max-w-md mx-auto">
            {debouncedSearch
              ? `No hay libros que coincidan con "${debouncedSearch}". Intenta con otro término.`
              : 'El catálogo está vacío por el momento.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 glass-card p-4">
          <p className="text-xs text-surface-400">
            Página {page + 1} de {totalPages} · {totalCount} libros
          </p>
          <div className="flex gap-2">
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
  );
}

/** Skeleton loading card for shimmer effect */
function BookSkeleton(): React.JSX.Element {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-surface-800/50" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-surface-700/50 rounded w-3/4" />
        <div className="h-3 bg-surface-700/30 rounded w-1/2" />
        <div className="h-5 bg-surface-700/20 rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}
