import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/contexts/ToastContext';
import { StatusBadge } from '@/components/catalog/StatusBadge';
import type { Book } from '@/types/database';

/** BookDetailPage (US-06 / US-07): Full book detail view */
export default function BookDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { addToast } = useToast();

  const fetchBook = useCallback(async (): Promise<void> => {
    if (!id) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      addToast('No se pudo cargar el libro', 'error');
      console.error('Error fetching book:', error);
    } else {
      setBook(data);
    }

    setIsLoading(false);
  }, [id, addToast]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        <div className="glass-card p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-80 aspect-[3/4] bg-surface-800/50 rounded-xl animate-pulse" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-surface-700/50 rounded w-3/4 animate-pulse" />
              <div className="h-5 bg-surface-700/30 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-surface-700/20 rounded w-1/4 animate-pulse" />
              <div className="space-y-2 mt-6">
                <div className="h-3 bg-surface-700/20 rounded w-full animate-pulse" />
                <div className="h-3 bg-surface-700/20 rounded w-full animate-pulse" />
                <div className="h-3 bg-surface-700/20 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-surface-200 mb-2">Libro no encontrado</h2>
          <p className="text-surface-400 text-sm mb-6">
            El libro que buscas no existe o no está disponible.
          </p>
          <Link to="/catalogo" className="btn-primary text-sm px-6 py-2.5 inline-block">
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      {/* Back navigation */}
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-primary-400 transition-colors mb-6"
      >
        ← Volver al catálogo
      </Link>

      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <div className="w-full md:w-80 shrink-0">
            <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={`Portada de ${book.title}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-900/40 to-accent-600/30 rounded-xl">
                  <span className="text-7xl mb-3 opacity-60">📖</span>
                  <span className="text-sm text-surface-400 font-medium">Sin portada</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-surface-100 mb-2">
                  {book.title}
                </h1>
                <p className="text-lg text-surface-300">
                  por <span className="text-primary-400 font-medium">{book.author}</span>
                </p>
              </div>
              <StatusBadge status={book.status} size="md" />
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3 mb-6">
              {book.year && (
                <MetaTag label="Año" value={String(book.year)} />
              )}
              {book.genre && (
                <MetaTag label="Género" value={book.genre} />
              )}
            </div>

            {/* Description */}
            {book.description ? (
              <div>
                <h2 className="text-sm font-semibold text-surface-200 mb-2 uppercase tracking-wider">
                  Sinopsis
                </h2>
                <p className="text-surface-300 text-sm leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            ) : (
              <p className="text-surface-500 text-sm italic">
                Este libro no tiene descripción disponible.
              </p>
            )}

            {/* Action area (placeholder for future reservation) */}
            {book.status === 'available' && (
              <div className="mt-8 pt-6 border-t border-white/5">
                <button
                  disabled
                  className="btn-primary text-sm px-6 py-2.5 opacity-50 cursor-not-allowed"
                  title="Funcionalidad de reserva próximamente"
                >
                  🔖 Reservar — Próximamente
                </button>
                <p className="text-xs text-surface-500 mt-2">
                  La funcionalidad de reserva estará disponible en una próxima versión.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small metadata tag */
function MetaTag({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="glass-input px-3 py-1.5 rounded-lg">
      <span className="text-xs text-surface-400">{label}: </span>
      <span className="text-xs text-surface-200 font-medium">{value}</span>
    </div>
  );
}
