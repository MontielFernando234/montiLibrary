# Migraciones de Base de Datos — montiLibrary

> **Proyecto Supabase:** `ufuqwjhoxmwwezpavnpz`  
> **URL:** `https://ufuqwjhoxmwwezpavnpz.supabase.co`  
> **Fecha:** 2026-06-09

---

## Migración 1: `create_profiles_table`

Crea la tabla `profiles` vinculada 1:1 con `auth.users`, triggers automáticos e índices.

```sql
-- 1. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  date_of_birth DATE,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- 3. Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role, date_of_birth, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'reader'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data->>'address'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Migración 2: `enable_rls_profiles_policies`

Habilita Row Level Security y crea políticas de acceso basadas en roles.

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Users can update own profile (cannot change role/is_active)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND is_active = (SELECT is_active FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'));
```

---

## Migración 3: `create_helper_functions_and_seed_admin`

Funciones auxiliares para verificación de estado y rol, búsqueda full-text.

```sql
-- Check if user is active
CREATE OR REPLACE FUNCTION public.is_user_active(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_active FROM public.profiles WHERE id = user_id),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = user_id),
    'reader'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Full-text search column (generated)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name_search TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('spanish', coalesce(first_name, '') || ' ' || coalesce(last_name, ''))
  ) STORED;

CREATE INDEX idx_profiles_full_name_search ON public.profiles USING GIN(full_name_search);
```

---

## Resumen de Políticas RLS

| Política | Operación | Aplica a |
|----------|-----------|----------|
| Users can read own profile | SELECT | Todos los autenticados (solo su perfil) |
| Admins can read all profiles | SELECT | Admins (todos los perfiles) |
| Users can update own profile | UPDATE | Todos (sin cambiar rol ni estado) |
| Admins can update any profile | UPDATE | Admins (cualquier perfil) |
| Admins can delete profiles | DELETE | Admins |
| Admins can insert profiles | INSERT | Admins |

## Diagrama del Schema

```mermaid
erDiagram
    auth_users ||--o| profiles : "1:1 (ON DELETE CASCADE)"
    profiles {
        uuid id PK "FK → auth.users.id"
        text first_name "NOT NULL"
        text last_name "NOT NULL"
        text role "NOT NULL, CHECK(reader|admin), default: reader"
        boolean is_active "NOT NULL, default: true"
        date date_of_birth "nullable"
        text address "nullable"
        timestamptz created_at "NOT NULL, default: now()"
        timestamptz updated_at "NOT NULL, auto-updated via trigger"
        tsvector full_name_search "GENERATED, GIN indexed"
    }
```
