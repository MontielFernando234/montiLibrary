import { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  date_of_birth: string;
  address: string;
}

const INITIAL_FORM: FormData = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
  date_of_birth: '',
  address: '',
};

/** Password requirements checker */
function usePasswordRequirements(password: string) {
  return useMemo(() => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  }), [password]);
}

/** RegisterPage (US-01): Full registration form with validation */
export default function RegisterPage(): React.JSX.Element {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { signUp } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const passwordReqs = usePasswordRequirements(form.password);

  const updateField = useCallback((field: keyof FormData, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!form.first_name.trim() || form.first_name.trim().length < 2)
      errors.first_name = 'Mínimo 2 caracteres';
    if (!form.last_name.trim() || form.last_name.trim().length < 2)
      errors.last_name = 'Mínimo 2 caracteres';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = 'Ingresa un email válido';
    if (!passwordReqs.minLength || !passwordReqs.hasUppercase || !passwordReqs.hasNumber)
      errors.password = 'La contraseña no cumple los requisitos';
    if (form.password !== form.confirm_password)
      errors.confirm_password = 'Las contraseñas no coinciden';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form, passwordReqs]);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFieldErrors({});

    const { error } = await signUp(form.email, form.password, {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      date_of_birth: form.date_of_birth || undefined,
      address: form.address.trim() || undefined,
    });

    if (error) {
      addToast(error, 'error');
      setIsSubmitting(false);
      return;
    }

    addToast('Cuenta creada. Revisa tu email para confirmar.', 'info');
    navigate('/login');
  }, [form, validate, signUp, addToast, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-lg p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            Crear cuenta
          </h1>
          <p className="text-surface-300 mt-2 text-sm">Regístrate para acceder al catálogo</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-first-name" className="block text-sm font-medium text-surface-200 mb-1">
                Nombre *
              </label>
              <input
                id="reg-first-name"
                type="text"
                value={form.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                placeholder="Juan"
                className={`glass-input w-full px-3 py-2.5 text-sm ${fieldErrors.first_name ? 'border-danger-500!' : ''}`}
                aria-invalid={!!fieldErrors.first_name}
              />
              {fieldErrors.first_name && (
                <p className="text-danger-500 text-xs mt-1">{fieldErrors.first_name}</p>
              )}
            </div>
            <div>
              <label htmlFor="reg-last-name" className="block text-sm font-medium text-surface-200 mb-1">
                Apellido *
              </label>
              <input
                id="reg-last-name"
                type="text"
                value={form.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                placeholder="Pérez"
                className={`glass-input w-full px-3 py-2.5 text-sm ${fieldErrors.last_name ? 'border-danger-500!' : ''}`}
                aria-invalid={!!fieldErrors.last_name}
              />
              {fieldErrors.last_name && (
                <p className="text-danger-500 text-xs mt-1">{fieldErrors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-surface-200 mb-1">
              Email *
            </label>
            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="tu@email.com"
              className={`glass-input w-full px-3 py-2.5 text-sm ${fieldErrors.email ? 'border-danger-500!' : ''}`}
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
            />
            {fieldErrors.email && (
              <p className="text-danger-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-surface-200 mb-1">
              Contraseña *
            </label>
            <input
              id="reg-password"
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="••••••••"
              className={`glass-input w-full px-3 py-2.5 text-sm ${fieldErrors.password ? 'border-danger-500!' : ''}`}
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.password}
            />
            {/* Password requirements */}
            {form.password.length > 0 && (
              <div className="mt-2 space-y-1">
                <RequirementItem met={passwordReqs.minLength} label="Mínimo 8 caracteres" />
                <RequirementItem met={passwordReqs.hasUppercase} label="Al menos 1 mayúscula" />
                <RequirementItem met={passwordReqs.hasNumber} label="Al menos 1 número" />
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-surface-200 mb-1">
              Confirmar contraseña *
            </label>
            <input
              id="reg-confirm-password"
              type="password"
              value={form.confirm_password}
              onChange={(e) => updateField('confirm_password', e.target.value)}
              placeholder="••••••••"
              className={`glass-input w-full px-3 py-2.5 text-sm ${fieldErrors.confirm_password ? 'border-danger-500!' : ''}`}
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.confirm_password}
            />
            {fieldErrors.confirm_password && (
              <p className="text-danger-500 text-xs mt-1">{fieldErrors.confirm_password}</p>
            )}
          </div>

          {/* Optional fields */}
          <details className="group">
            <summary className="text-sm text-surface-400 cursor-pointer hover:text-surface-300 transition-colors">
              Campos opcionales
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="reg-dob" className="block text-sm font-medium text-surface-200 mb-1">
                  Fecha de nacimiento
                </label>
                <input
                  id="reg-dob"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => updateField('date_of_birth', e.target.value)}
                  className="glass-input w-full px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label htmlFor="reg-address" className="block text-sm font-medium text-surface-200 mb-1">
                  Dirección
                </label>
                <input
                  id="reg-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Calle 123, Ciudad"
                  className="glass-input w-full px-3 py-2.5 text-sm"
                  maxLength={200}
                />
              </div>
            </div>
          </details>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 text-base mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registrando...
              </span>
            ) : (
              'Registrarme'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-surface-400 text-sm mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Small inline component for password requirements */
function RequirementItem({ met, label }: { met: boolean; label: string }): React.JSX.Element {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-success-500' : 'text-surface-400'}`}>
      <span>{met ? '✓' : '○'}</span>
      <span>{label}</span>
    </div>
  );
}
