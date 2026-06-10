import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/types/database';

interface UserFormModalProps {
  user: Profile | null; // null = create mode, Profile = edit mode
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  first_name: string;
  last_name: string;
  email: string;
  role: 'reader' | 'admin';
  password: string;
  date_of_birth: string;
  address: string;
}

/** UserFormModal (US-09 / US-10): Create or edit a user */
export function UserFormModal({ user, onClose, onSaved }: UserFormModalProps): React.JSX.Element {
  const isEdit = user !== null;
  const { profile: currentProfile } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState<FormState>({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: '',
    role: user?.role ?? 'reader',
    password: '',
    date_of_birth: user?.date_of_birth ?? '',
    address: user?.address ?? '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: keyof FormState, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!form.first_name.trim()) errors.first_name = 'Este campo es obligatorio';
    if (!form.last_name.trim()) errors.last_name = 'Este campo es obligatorio';
    if (!isEdit) {
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errors.email = 'Ingresa un email válido';
      if (!form.password || form.password.length < 8)
        errors.password = 'Mínimo 8 caracteres';
    }

    // Prevent admin from changing own role
    if (isEdit && user?.id === currentProfile?.id && form.role !== currentProfile?.role) {
      errors.role = 'No puedes cambiar tu propio rol';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form, isEdit, user, currentProfile]);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    if (isEdit && user) {
      // UPDATE existing user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          role: form.role,
          date_of_birth: form.date_of_birth || null,
          address: form.address.trim() || null,
        })
        .eq('id', user.id);

      if (error) {
        addToast('Error al actualizar usuario', 'error');
        setIsSubmitting(false);
        return;
      }

      addToast('Usuario actualizado correctamente', 'success');
    } else {
      // CREATE new user via Supabase Auth signUp + metadata
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            role: form.role,
            date_of_birth: form.date_of_birth || null,
            address: form.address.trim() || null,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          addToast('Este email ya se encuentra registrado', 'error');
        } else {
          addToast(`Error al crear usuario: ${error.message}`, 'error');
        }
        setIsSubmitting(false);
        return;
      }

      addToast('Usuario creado correctamente', 'success');
    }

    setIsSubmitting(false);
    onSaved();
  }, [isEdit, user, form, validate, addToast, onSaved]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-card w-full max-w-lg p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-surface-100 mb-5">
          {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              id="modal-first-name"
              label="Nombre *"
              value={form.first_name}
              onChange={(v) => updateField('first_name', v)}
              error={fieldErrors.first_name}
            />
            <FieldInput
              id="modal-last-name"
              label="Apellido *"
              value={form.last_name}
              onChange={(v) => updateField('last_name', v)}
              error={fieldErrors.last_name}
            />
          </div>

          {/* Email (only for create) */}
          {!isEdit && (
            <FieldInput
              id="modal-email"
              label="Email *"
              type="email"
              value={form.email}
              onChange={(v) => updateField('email', v)}
              error={fieldErrors.email}
              placeholder="usuario@email.com"
            />
          )}

          {/* Role */}
          <div>
            <label htmlFor="modal-role" className="block text-sm font-medium text-surface-200 mb-1">
              Rol *
            </label>
            <select
              id="modal-role"
              value={form.role}
              onChange={(e) => updateField('role', e.target.value)}
              className={`glass-input w-full px-3 py-2.5 text-sm ${fieldErrors.role ? 'border-danger-500!' : ''}`}
            >
              <option value="reader">Lector</option>
              <option value="admin">Administrador</option>
            </select>
            {fieldErrors.role && (
              <p className="text-danger-500 text-xs mt-1">{fieldErrors.role}</p>
            )}
          </div>

          {/* Password (only for create) */}
          {!isEdit && (
            <FieldInput
              id="modal-password"
              label="Contraseña temporal *"
              type="password"
              value={form.password}
              onChange={(v) => updateField('password', v)}
              error={fieldErrors.password}
              placeholder="Mínimo 8 caracteres"
            />
          )}

          {/* Optional fields */}
          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              id="modal-dob"
              label="Fecha de nacimiento"
              type="date"
              value={form.date_of_birth}
              onChange={(v) => updateField('date_of_birth', v)}
            />
            <FieldInput
              id="modal-address"
              label="Dirección"
              value={form.address}
              onChange={(v) => updateField('address', v)}
              placeholder="Opcional"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 text-sm">
              {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Reusable form field */
function FieldInput({
  id, label, type = 'text', value, onChange, error, placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}): React.JSX.Element {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-surface-200 mb-1">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`glass-input w-full px-3 py-2.5 text-sm ${error ? 'border-danger-500!' : ''}`}
        aria-invalid={!!error}
      />
      {error && <p className="text-danger-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
