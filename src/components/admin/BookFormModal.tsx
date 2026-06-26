import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/contexts/ToastContext';
import type { Book } from '@/types/database';

interface BookFormModalProps {
  book: Book | null; // null = create mode, Book = edit mode
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  title: string;
  author: string;
  year: string;
  genre: string;
  description: string;
  status: 'available' | 'reserved';
  is_visible: boolean;
}

/** BookFormModal (US-14 / US-15): Create or edit a book */
export function BookFormModal({ book, onClose, onSaved }: BookFormModalProps): React.JSX.Element {
  const isEdit = book !== null;
  const { addToast } = useToast();

  const [form, setForm] = useState<FormState>({
    title: book?.title ?? '',
    author: book?.author ?? '',
    year: book?.year ? String(book.year) : '',
    genre: book?.genre ?? '',
    description: book?.description ?? '',
    status: book?.status ?? 'available',
    is_visible: book?.is_visible ?? true,
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(book?.cover_url ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = useCallback((field: keyof FormState, value: string | boolean): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      addToast('Solo se permiten imágenes (JPG, PNG, WebP, GIF)', 'error');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      addToast('La imagen no debe superar 5MB', 'error');
      return;
    }

    setCoverFile(file);
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [addToast]);

  const removeCover = useCallback((): void => {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'El título es obligatorio';
    if (!form.author.trim()) errors.author = 'El autor es obligatorio';
    if (form.year && (isNaN(Number(form.year)) || Number(form.year) < 0 || Number(form.year) > new Date().getFullYear() + 1)) {
      errors.year = 'Ingresa un año válido';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const uploadCover = useCallback(async (bookId: string): Promise<string | null> => {
    if (!coverFile) return book?.cover_url ?? null;

    const fileExt = coverFile.name.split('.').pop() ?? 'jpg';
    const filePath = `${bookId}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('book-covers')
      .upload(filePath, coverFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading cover:', uploadError);
      addToast('Error al subir la portada', 'error');
      return book?.cover_url ?? null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('book-covers')
      .getPublicUrl(filePath);

    return publicUrl;
  }, [coverFile, book, addToast]);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    if (isEdit && book) {
      // Upload cover if changed
      let coverUrl = book.cover_url;
      if (coverFile) {
        coverUrl = await uploadCover(book.id);
      } else if (coverPreview === null && book.cover_url) {
        // Cover was removed
        coverUrl = null;
      }

      const { error } = await supabase
        .from('books')
        .update({
          title: form.title.trim(),
          author: form.author.trim(),
          year: form.year ? Number(form.year) : null,
          genre: form.genre.trim() || null,
          description: form.description.trim() || null,
          status: form.status,
          is_visible: form.is_visible,
          cover_url: coverUrl,
        })
        .eq('id', book.id);

      if (error) {
        addToast('Error al actualizar libro', 'error');
        setIsSubmitting(false);
        return;
      }

      addToast('Libro actualizado correctamente', 'success');
    } else {
      // CREATE new book
      const { data: newBook, error } = await supabase
        .from('books')
        .insert({
          title: form.title.trim(),
          author: form.author.trim(),
          year: form.year ? Number(form.year) : null,
          genre: form.genre.trim() || null,
          description: form.description.trim() || null,
          status: form.status,
          is_visible: form.is_visible,
        })
        .select('id')
        .single();

      if (error || !newBook) {
        addToast(`Error al crear libro: ${error?.message ?? 'unknown'}`, 'error');
        setIsSubmitting(false);
        return;
      }

      // Upload cover if selected
      if (coverFile) {
        const coverUrl = await uploadCover(newBook.id);
        if (coverUrl) {
          await supabase
            .from('books')
            .update({ cover_url: coverUrl })
            .eq('id', newBook.id);
        }
      }

      addToast('Libro creado correctamente', 'success');
    }

    setIsSubmitting(false);
    onSaved();
  }, [isEdit, book, form, coverFile, coverPreview, validate, uploadCover, addToast, onSaved]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-card w-full max-w-2xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-surface-100 mb-5">
          {isEdit ? 'Editar Libro' : 'Nuevo Libro'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldInput
              id="book-title"
              label="Título *"
              value={form.title}
              onChange={(v) => updateField('title', v)}
              error={fieldErrors.title}
            />
            <FieldInput
              id="book-author"
              label="Autor *"
              value={form.author}
              onChange={(v) => updateField('author', v)}
              error={fieldErrors.author}
            />
          </div>

          {/* Year & Genre */}
          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              id="book-year"
              label="Año"
              type="number"
              value={form.year}
              onChange={(v) => updateField('year', v)}
              error={fieldErrors.year}
              placeholder="Ej: 2024"
            />
            <FieldInput
              id="book-genre"
              label="Género"
              value={form.genre}
              onChange={(v) => updateField('genre', v)}
              placeholder="Ej: Novela, Ciencia ficción"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="book-description" className="block text-sm font-medium text-surface-200 mb-1">
              Sinopsis
            </label>
            <textarea
              id="book-description"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Descripción del libro..."
              rows={3}
              className="glass-input w-full px-3 py-2.5 text-sm resize-none"
            />
          </div>

          {/* Cover upload */}
          <div>
            <label className="block text-sm font-medium text-surface-200 mb-1">
              Portada
            </label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="w-20 h-28 rounded-lg overflow-hidden bg-surface-800/50 shrink-0 border border-white/5">
                {coverPreview ? (
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
                    📖
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                  id="book-cover-upload"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-ghost text-xs px-3 py-1.5 w-full"
                >
                  {coverPreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </button>
                {coverPreview && (
                  <button
                    type="button"
                    onClick={removeCover}
                    className="text-xs text-danger-500 hover:text-danger-400 transition-colors w-full text-center"
                  >
                    Quitar portada
                  </button>
                )}
                <p className="text-xs text-surface-500">JPG, PNG, WebP o GIF. Máx 5MB.</p>
              </div>
            </div>
          </div>

          {/* Status & Visibility */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="book-status" className="block text-sm font-medium text-surface-200 mb-1">
                Estado
              </label>
              <select
                id="book-status"
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="glass-input w-full px-3 py-2.5 text-sm"
              >
                <option value="available">Disponible</option>
                <option value="reserved">Reservado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-200 mb-1">
                Visibilidad
              </label>
              <div
                className="glass-input flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                onClick={() => updateField('is_visible', !form.is_visible)}
              >
                <div className={`w-9 h-5 rounded-full transition-colors relative ${
                  form.is_visible ? 'bg-success-500' : 'bg-surface-700'
                }`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    form.is_visible ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </div>
                <span className="text-sm text-surface-200">
                  {form.is_visible ? 'Visible' : 'Oculto'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 text-sm">
              {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear libro'}
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
