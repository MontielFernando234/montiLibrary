import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/contexts/ToastContext';
import type { Profile } from '@/types/database';

interface UserDeleteDialogProps {
  user: Profile;
  onClose: () => void;
  onDeleted: () => void;
}

/** UserDeleteDialog (US-11): Confirmation dialog for permanent user deletion */
export function UserDeleteDialog({ user, onClose, onDeleted }: UserDeleteDialogProps): React.JSX.Element {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();

  const fullName = `${user.first_name} ${user.last_name}`;

  const handleDelete = useCallback(async (): Promise<void> => {
    setIsDeleting(true);

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (error) {
      addToast('Error al eliminar usuario', 'error');
      console.error('Delete error:', error);
      setIsDeleting(false);
      return;
    }

    addToast('Usuario eliminado permanentemente', 'success');
    onDeleted();
  }, [user, addToast, onDeleted]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-card w-full max-w-md p-6 animate-fade-in border-danger-500/20!"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-danger-500 mb-2">
          Eliminar usuario permanentemente
        </h2>

        <p className="text-surface-300 text-sm mb-4">
          Esta acción es <strong className="text-danger-400">irreversible</strong>.
          Se eliminarán todos los datos de <strong className="text-surface-100">{fullName}</strong>.
        </p>

        <div className="mb-4">
          <label htmlFor="confirm-delete-email" className="block text-sm font-medium text-surface-200 mb-1.5">
            Escribe el ID del usuario para confirmar:
          </label>
          <input
            id="confirm-delete-email"
            type="text"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={user.id.slice(0, 8) + '...'}
            className="glass-input w-full px-3 py-2.5 text-sm font-mono"
          />
          <p className="text-surface-500 text-xs mt-1 font-mono">{user.id}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 text-sm">
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmEmail !== user.id || isDeleting}
            className="btn-danger flex-1 text-sm disabled:opacity-30"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar permanentemente'}
          </button>
        </div>
      </div>
    </div>
  );
}
