import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/catalog/StatusBadge';
import type { Book } from '@/types/database';

interface BookCardProps {
  book: Book;
}

/** BookCard (US-04 / US-07): Card component for the catalog grid */
export function BookCard({ book }: BookCardProps): React.JSX.Element {
  return (
    <Link
      to={`/catalogo/${book.id}`}
      className="group glass-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary-500/20 flex flex-col"
      id={`book-card-${book.id}`}
    >
      {/* Cover image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-900/50">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={`Portada de ${book.title}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-900/40 to-accent-600/20">
            <span className="text-5xl mb-2 opacity-60">📖</span>
            <span className="text-xs text-surface-400 font-medium">Sin portada</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badge overlay */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={book.status} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-surface-100 line-clamp-2 mb-1 group-hover:text-primary-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-surface-400 mb-2">{book.author}</p>

        <div className="mt-auto flex items-center justify-between">
          {book.genre && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 font-medium">
              {book.genre}
            </span>
          )}
          {book.year && (
            <span className="text-xs text-surface-500">{book.year}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
