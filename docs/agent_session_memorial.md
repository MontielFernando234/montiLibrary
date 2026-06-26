# Memorial de Sesión Agéntica — montiLibrary

---

## Sesión 1 — 2026-06-09 21:35 a 22:45 (UTC-3)

### Requerimiento Abordado
Implementación de las historias de usuario relacionadas con **Login y Gestión de Usuarios** del Release 1 (MVP).

### Épicas/Historias Procesadas

#### Fase 1 — Producto ✅ Completada
Se generaron **11 archivos** de historias de usuario en `.context/user_stories/us_release_1/`:

| Historia | Archivo | Estado |
|----------|---------|--------|
| Épicas resumen | `_epicas_login_gestion_usuarios.md` | ✅ |
| US-01: Registro | `US-01_registro_usuario.md` | ✅ |
| US-02: Login | `US-02_inicio_sesion.md` | ✅ |
| US-03: Logout | `US-03_cierre_sesion.md` | ✅ |
| US-08: Listar usuarios | `US-08_listar_usuarios.md` | ✅ |
| US-09: Crear usuario | `US-09_crear_usuario.md` | ✅ |
| US-10: Editar usuario | `US-10_editar_usuario.md` | ✅ |
| US-11: Eliminar/desactivar | `US-11_eliminar_desactivar_usuario.md` | ✅ |
| US-12: Reset password | `US-12_reset_password_admin.md` | ✅ |
| US-17: Rutas protegidas | `US-17_rutas_protegidas.md` | ✅ |
| US-18: Mensajes error | `US-18_mensajes_error.md` | ✅ |

#### Fase 2 — Backend (Supabase) ✅ Completada
Se aplicaron **3 migraciones** al proyecto Supabase `ufuqwjhoxmwwezpavnpz`:

1. `create_profiles_table` — Tabla profiles + triggers + índices
2. `enable_rls_profiles_policies` — RLS habilitado + 6 políticas de acceso
3. `create_helper_functions_and_seed_admin` — Funciones auxiliares + búsqueda full-text

#### Fase 3 — Frontend (React + Vite) ✅ Completada
Se implementó toda la estructura frontend siguiendo las guidelines de arquitectura:
- Configuración base (`package.json`, `vite.config.ts`, tsconfig) con dependencias React 19, Vite 6, TailwindCSS v4.
- `AuthContext` y `ToastContext` para manejar estado global, sesión y notificaciones.
- Componente `ProtectedRoute` para control de acceso (Lector vs Admin).
- Páginas públicas: `LoginPage` y `RegisterPage` con validación y diseño en glassmorphism.
- Panel Admin: `UsersPage` (listado, paginación, filtros) e integraciones `UserFormModal`, `UserDeleteDialog`, `ResetPasswordButton`.
- Layouts: `AdminLayout` y `ReaderLayout`.

### Decisiones Técnicas Tomadas
- **ADR-001:** Supabase Auth + profiles separada + roles en DB + soft-delete + email confirmation.
- Stack elegido: Vite + React + TypeScript + Tailwind v4.
- Manejador de paquetes: `pnpm` por seguridad.
- UI Design: Diseño premium Dark Mode con glassmorphism (vibrante, azules/violetas).

### Documentación Generada
- `docs/database_migrations.md` — Documentación completa de migraciones
- `docs/adr/ADR-001_auth_user_management.md` — Decisión arquitectónica
- `docs/agent_session_memorial.md` — Este documento

### Próximos Pasos Pendientes
- **Verificación Manual:**
  1. Ejecutar `pnpm install` desde la terminal del sistema.
  2. Ejecutar `pnpm dev` para levantar el servidor.
  3. Cargar la `VITE_SUPABASE_ANON_KEY` real en `.env.local`.
  4. Realizar validación E2E probando flujos de registro, login y rol admin.
- Desarrollar la épica del Catálogo (US-04 a US-07).

---

## Sesión 2 — 2026-06-10 12:55 a 13:09 (UTC-3)

### Requerimiento Abordado
Fix de errores de build de TypeScript (`tsc -b && vite build`) para preparar el deploy a **Netlify**.

### Contexto
Al ejecutar `pnpm run build`, el proceso `tsc -b` reportó **4 errores** que impedían la compilación:

```
1. vite.config.ts:4  — TS2307: Cannot find module 'path'
2. vite.config.ts:11 — TS2304: Cannot find name '__dirname'
3. UserFormModal.tsx:75 — TS2345: Argument not assignable to parameter of type 'never'
4. UsersPage.tsx:87   — TS2345: Argument not assignable to parameter of type 'never'
```

### Análisis de Causa Raíz

#### Error 1-2: `vite.config.ts` — Módulo `path` y `__dirname`
- **Causa:** Se usaba `import path from 'path'` y `__dirname` (APIs de CommonJS/Node.js) sin tener `@types/node` instalado en las dependencias del proyecto.
- **Contexto:** `tsconfig.node.json` (que compila `vite.config.ts`) no incluye `types: ["node"]` y el proyecto no tiene `@types/node` en `devDependencies`.

#### Error 3-4: `.update()` infiere tipo `never`
- **Causa:** La interfaz `Database` en `src/types/database.ts` no cumplía con la estructura `GenericSchema` que `@supabase/supabase-js` v2.49+ exige internamente.
- **Detalle técnico:** `GenericSchema` (definido en `@supabase/supabase-js/dist/index.d.mts`) requiere:
  ```ts
  type GenericSchema = {
    Tables: Record<string, GenericTable>;  // GenericTable requiere Relationships
    Views: Record<string, GenericView>;
    Functions: Record<string, GenericFunction>;
  };
  ```
  La interfaz `Database` del proyecto carecía de:
  - `Relationships: []` en la definición de la tabla `profiles`
  - `Views: Record<string, never>` en el schema `public`
- **Efecto:** Sin estas propiedades, TypeScript no podía resolver `Database['public']` como `GenericSchema`, colapsando la inferencia de tipos en toda la cadena `.from().update()` al tipo `never`.

### Archivos Modificados

| Archivo | Cambio | Motivo |
|---------|--------|--------|
| `vite.config.ts` | Eliminado `import path from 'path'`. Alias `@` ahora usa sintaxis nativa de Vite: `{ find: '@', replacement: '/src' }` | Evita dependencia de `@types/node` |
| `src/types/database.ts` | Agregado `Relationships: []` en tabla `profiles` y `Views: Record<string, never>` en schema `public` | Cumplir con `GenericSchema` de supabase-js v2.49+ |
| `src/components/admin/UserFormModal.tsx` | Sin cambios netos (se probaron casts intermedios, revertidos al resolver causa raíz) | `.update()` ahora infiere correctamente |
| `src/pages/admin/UsersPage.tsx` | Sin cambios netos (ídem anterior) | `.update()` ahora infiere correctamente |

### Decisiones Técnicas Tomadas

1. **No instalar `@types/node`:** Se optó por usar la API nativa de Vite para aliases en lugar de agregar una dependencia extra. Esto mantiene el proyecto más liviano y evita exponer APIs de Node.js al código del frontend accidentalmente.
2. **Corregir tipos en la fuente (no usar casts):** En lugar de aplicar `as any` o `as ProfileUpdate` como workaround, se corrigió la interfaz `Database` para que la inferencia de tipos funcione naturalmente. Esto asegura type-safety real en todas las operaciones de Supabase.

### Próximos Pasos Pendientes
- **Ejecutar `pnpm run build`** para confirmar que los 4 errores están resueltos.
- **Deploy a Netlify** una vez validado el build exitoso.
- Continuar con la épica del Catálogo (US-04 a US-07).

---

## Sesión 3 — 2026-06-10 17:43 a 17:58 (UTC-3)

### Requerimiento Abordado
Implementación completa de la **Épica del Catálogo de Libros** (US-04 a US-07 + US-13 a US-16).

### Épicas/Historias Procesadas

#### Fase 0 — Producto (PO / Analista Funcional) ✅ Completada
Se generaron **9 archivos** de historias de usuario en `.context/user_stories/us_release_1/`:

| Historia | Archivo | Estado |
|----------|---------|--------|
| Épicas resumen | `_epicas_catalogo_libros.md` | ✅ |
| US-04: Ver listado de libros | `US-04_ver_listado_libros.md` | ✅ |
| US-05: Buscar libros | `US-05_buscar_libros.md` | ✅ |
| US-06: Ver detalle de libro | `US-06_ver_detalle_libro.md` | ✅ |
| US-07: Indicar disponibilidad | `US-07_indicar_disponibilidad.md` | ✅ |
| US-13: Listar libros admin | `US-13_listar_libros_admin.md` | ✅ |
| US-14: Crear libro | `US-14_crear_libro.md` | ✅ |
| US-15: Editar libro | `US-15_editar_libro.md` | ✅ |
| US-16: Eliminar libro | `US-16_eliminar_libro.md` | ✅ |

Cada historia sigue el formato 3 C's (Card, Conversation, Confirmation) con criterios de aceptación en formato Gherkin (Given-When-Then), criterios INVEST, contexto de usuario, y referencias técnicas.

#### Fase 1 — Backend (Supabase) ✅ Completada
Se aplicaron **3 migraciones** al proyecto Supabase `ufuqwjhoxmwwezpavnpz`:

1. `create_books_table` — Tabla books con campos de soft-delete (`is_deleted`, `deleted_at`, `deleted_by`), full-text search (español), trigger `updated_at`, e índices para búsqueda y filtros.
2. `enable_rls_books_policies` — RLS habilitado + 5 políticas de acceso (lectores ven libros visibles/activos, admins ven todo, admins pueden CRUD completo).
3. `create_book_covers_storage` — Bucket `book-covers` (público, 5MB max, JPEG/PNG/WebP/GIF) + 4 políticas Storage (lectura pública, escritura/actualización/eliminación solo admin).

**Seed data:** 13 libros de ejemplo insertados (clásicos de literatura latinoamericana y universal), incluyendo 1 libro oculto para testing admin.

#### Fase 2 — Frontend Lector ✅ Completada

| Historia | Componente/Página | Funcionalidad |
|----------|-------------------|---------------|
| US-04 | `CatalogoPage.tsx` (reescritura) | Grid paginado responsivo (12 por página), skeleton loading |
| US-05 | `CatalogoPage.tsx` | Barra de búsqueda con debounce 400ms, filtro por título/autor (`ilike`) |
| US-06 | `BookDetailPage.tsx` (nueva) | Detalle completo: portada, título, autor, año, género, sinopsis, botón reserva placeholder |
| US-07 | `StatusBadge.tsx` + `BookCard.tsx` (nuevos) | Badge de disponibilidad (verde pulsante / naranja) en cards y detalle |

#### Fase 3 — Frontend Admin ✅ Completada

| Historia | Componente/Página | Funcionalidad |
|----------|-------------------|---------------|
| US-13 | `BooksAdminPage.tsx` (nueva) | Tabla con todos los libros (incluidos ocultos y eliminados), filtros por estado/visibilidad/baja, paginación |
| US-14 | `BookFormModal.tsx` (nuevo) | Modal crear libro con upload de portada a Supabase Storage, preview, validación |
| US-15 | `BookFormModal.tsx` | Modal editar libro (reutiliza mismo componente en modo edición) |
| US-16 | `BookDeleteDialog.tsx` (nuevo) | Diálogo con opciones: baja lógica (recomendada) y eliminación permanente (incluye limpieza de Storage) |

#### Fase 4 — Integración ✅ Completada

| Archivo | Cambio |
|---------|--------|
| `AppRouter.tsx` | Agregadas rutas `/catalogo/:id` y `/admin/books` (lazy-loaded) |
| `AdminLayout.tsx` | Nuevo ítem de navegación "Libros" (📖) en sidebar |
| `index.css` | Animaciones shimmer para skeleton loading y line-clamp utility |
| `database.ts` | Tipos `Book`, `BookInsert`, `BookUpdate`, `BookStatus` |

### Decisiones Técnicas Tomadas

1. **Soft-delete para libros:** Se implementaron campos `is_deleted`, `deleted_at` y `deleted_by` para mantener integridad referencial. El diálogo de eliminación ofrece ambas opciones (baja lógica recomendada vs eliminación permanente).
2. **Storage bucket público:** `book-covers` configurado como público para lectura (cualquier usuario autenticado puede ver portadas) pero con escritura restringida a admins.
3. **RLS dual para SELECT:** Lectores solo ven libros con `is_visible=true AND is_deleted=false`. Admins ven absolutamente todos los libros para gestión completa.
4. **Búsqueda con `ilike`:** Se optó por coincidencia parcial con `ilike` en lugar de full-text search para búsquedas simples del usuario, mientras que el índice GIN queda disponible para búsquedas más avanzadas en el futuro.

### Próximos Pasos Pendientes
- **Verificación Manual:**
  1. Ejecutar `pnpm run build` para validar TypeScript.
  2. Ejecutar `pnpm dev` para testing visual.
  3. Probar flujos: búsqueda, paginación, detalle, CRUD admin con upload de portada.
- Considerar implementación de la funcionalidad de reservas (roadmap futuro).

---

## Sesión 3 (bugfix) — 2026-06-10 18:25 (UTC-3)

### Requerimiento Abordado
Fix de error **HTTP 500** al iniciar sesión: `"infinite recursion detected in policy for relation 'profiles'"`.

### Análisis de Causa Raíz

Las políticas RLS de `profiles` y `books` usaban subqueries a la tabla `profiles` para verificar si el usuario es admin:
```sql
-- ❌ CAUSA DEL PROBLEMA: subquery a profiles dentro de política de profiles
EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin')
```

Al ejecutar un SELECT en `profiles`, PostgreSQL evaluaba las políticas RLS de la misma tabla, las cuales a su vez hacían un SELECT a `profiles`, disparando las mismas políticas → **recursión infinita**.

### Solución Aplicada

**2 migraciones** aplicadas:

1. **`fix_rls_infinite_recursion`** — Reemplaza TODAS las políticas de `profiles` y `books` que hacían subqueries por llamadas a la función `get_user_role(auth.uid())` que es `SECURITY DEFINER` (bypasa RLS):
   ```sql
   -- ✅ SOLUCIÓN: función SECURITY DEFINER que no dispara RLS
   public.get_user_role(auth.uid()) = 'admin'
   ```
   Adicionalmente, simplifica la política de update propio y agrega trigger `protect_role_and_status()` para que los no-admins no puedan cambiar `role` ni `is_active`.

2. **`fix_storage_rls_recursion`** — Mismo fix para las políticas del bucket `book-covers` en `storage.objects`.

### Decisión Técnica
- **ADR implícito:** Todas las políticas RLS que necesiten verificar el rol del usuario deben usar `public.get_user_role(auth.uid())` en lugar de subqueries directas a `profiles`. Esto evita recursión y es más eficiente (función cacheable, STABLE).

---

## Sesión 4 — 2026-06-10 18:45 (UTC-3)

### Requerimiento Abordado
Sincronización y carga de las Épicas e Historias del Catálogo de Libros (Release 1) en Jira, incluyendo relaciones y contenido completo.

### Historias/Épicas Cargadas en Jira

Se crearon las siguientes épicas e historias de usuario en el proyecto `SCRUM` con sus respectivos IDs en Jira y contenidos completos en markdown:

| ID Jira | Tipo | Título | Relación / Épica |
|---------|------|--------|------------------|
| `SCRUM-18` | Epic | Épica 4: Consulta del Catálogo de Libros (Lector) | Relates to `SCRUM-5` (Autenticación) |
| `SCRUM-19` | Epic | Épica 5: Administración del Catálogo (CRUD Administrativo) | Relates to `SCRUM-5` (Autenticación) y `SCRUM-7` (Seguridad) |
| `SCRUM-20` | Historia | US-04: Ver Listado de Libros | Asociada a `SCRUM-18` |
| `SCRUM-21` | Historia | US-05: Buscar Libros por Título o Autor | Asociada a `SCRUM-18`, Relacionada con `US-04` |
| `SCRUM-22` | Historia | US-06: Ver Detalle de Libro | Asociada a `SCRUM-18`, Relacionada con `US-04` |
| `SCRUM-23` | Historia | US-07: Indicar Disponibilidad | Asociada a `SCRUM-18`, Relacionada con `US-04` |
| `SCRUM-24` | Historia | US-13: Listar Libros para Admin | Asociada a `SCRUM-19` |
| `SCRUM-25` | Historia | US-14: Crear Libro | Asociada a `SCRUM-19`, Relacionada con `US-13` |
| `SCRUM-26` | Historia | US-15: Editar Libro | Asociada a `SCRUM-19`, Relacionada con `US-13` |
| `SCRUM-27` | Historia | US-16: Eliminar Libro | Asociada a `SCRUM-19`, Relacionada con `US-13` |

### Detalles del Proceso
- **Contenido Completo:** Se subió la especificación completa en formato Markdown de cada archivo `.md` de la historia de usuario como la descripción en Jira (incluyendo Given-When-Then de los criterios de aceptación Gherkin, contexto de usuario, notas de referencia, dependencias e historias relacionadas).
- **Relaciones:** Se establecieron vínculos de tipo `Relates` para asociar las historias a sus épicas correspondientes y para modelar las dependencias directas entre las historias (ej. búsquedas y detalles relacionados al listado base).

### Próximos Pasos Pendientes
- Iniciar la planificación y asignación de tareas del Sprint 2 para la ejecución de las historias cargadas.
