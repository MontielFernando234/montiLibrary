import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/contexts/ToastContext';
import type { Book } from '@/types/database';

interface BookDeleteDialogProps {
  book: Book;
  currentUserId: string;
  onClose: () => void;
  onDeleted: () => void;
}

/** BookDeleteDialog (US-16): Confirmation dialog for soft-delete or hard-delete */
export function BookDeleteDialog({ book, currentUserId, onClose, onDeleted }: BookDeleteDialogProps): React.JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSoftDelete = useCallback(async (): Promise<void> => {
    setIsSubmitting(true);

    const { error } = await supabase
      .from('books')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: currentUserId,
        is_visible: false,
      })
      .eq('id', book.id);

    if (error) {
      addToast('Error al eliminar libro', 'error');
      setIsSubmitting(false);
      return;
    }

    addToast('Libro marcado como eliminado (se puede restaurar)', 'success');
    setIsSubmitting(false);
    onDeleted();
  }, [book.id, currentUserId, addToast, onDeleted]);

  const handleHardDelete = useCallback(async (): Promise<void> => {
    setIsSubmitting(true);

    // Delete cover from storage if exists
    if (book.cover_url) {
      const coverPath = book.cover_url.split('/book-covers/')[1];
      if (coverPath) {
        await supabase.storage.from('book-covers').remove([coverPath]);
      }
    }

    // Delete the record permanently
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', book.id);

    if (error) {
      addToast('Error al eliminar libro permanentemente', 'error');
      setIsSubmitting(false);
      return;
    }

    addToast('Libro eliminado permanentemente', 'success');
    setIsSubmitting(false);
    onDeleted();
  }, [book, addToast, onDeleted]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-card w-full max-w-md p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-surface-100 mb-2">Eliminar Libro</h2>
        <p className="text-surface-300 text-sm mb-1">
          ¿Qué acción deseas realizar con el libro?
        </p>
        <p className="text-primary-400 font-medium text-sm mb-5">
          "{book.title}" — {book.author}
        </p>

        <div className="space-y-3">
          {/* Soft delete (recommended) */}
          <button
            onClick={handleSoftDelete}
            disabled={isSubmitting}
            className="w-full glass-input p-4 text-left hover:border-warning-500/30 hover:bg-warning-500/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🗃️</span>
              <div>
                <p className="text-sm font-medium text-surface-100 group-hover:text-warning-500 transition-colors">
                  Baja lógica (recomendado)
                </p>
                <p className="text-xs text-surface-400 mt-0.5">
                  Marca el libro como eliminado. Se puede restaurar después.
                </p>
              </div>
            </div>
          </button>

          {/* Hard delete */}
          <button
            onClick={handleHardDelete}
            disabled={isSubmitting}
            className="w-full glass-input p-4 text-left hover:border-danger-500/30 hover:bg-danger-500/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🗑️</span>
              <div>
                <p className="text-sm font-medium text-surface-100 group-hover:text-danger-500 transition-colors">
                  Eliminar permanentemente
                </p>
                <p className="text-xs text-surface-400 mt-0.5">
                  Borra el libro y su portada. Esta acción es irreversible.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="btn-ghost w-full text-sm mt-4"
        >
          Cancelar
        </button>

        {isSubmitting && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-surface-400">Procesando...</span>
          </div>
        )}
      </div>
    </div>
  );
}
