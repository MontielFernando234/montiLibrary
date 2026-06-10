import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/contexts/ToastContext';

interface ResetPasswordButtonProps {
  userId: string;
  userEmail: string;
}

/** ResetPasswordButton (US-12): Sends a password reset email */
export function ResetPasswordButton({ userId: _userId, userEmail }: ResetPasswordButtonProps): React.JSX.Element {
  const [isSending, setIsSending] = useState(false);
  const { addToast } = useToast();

  const handleReset = useCallback(async (): Promise<void> => {
    if (!userEmail) {
      addToast('No se puede enviar reset: email no disponible', 'warning');
      return;
    }

    const confirmed = window.confirm(
      `Se enviará un enlace de recuperación a ${userEmail}. ¿Confirmar?`
    );
    if (!confirmed) return;

    setIsSending(true);

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      addToast('No se pudo enviar el enlace. Intenta nuevamente.', 'error');
    } else {
      addToast(`Enlace de recuperación enviado a ${userEmail}`, 'success');
    }

    setIsSending(false);
  }, [userEmail, addToast]);

  return (
    <button
      onClick={handleReset}
      disabled={isSending || !userEmail}
      className="px-2 py-1 text-xs text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 rounded transition-colors disabled:opacity-30"
      title="Enviar reset de contraseña"
    >
      {isSending ? '⏳' : '🔑'}
    </button>
  );
}
