# US-17: Acceso a Rutas Protegidas

> **Épica:** Acceso y Seguridad  
> **Prioridad:** Must Have  
> **Estimación:** 5 Story Points  
> **Sprint:** 1

---

## Descripción

**Como** visitante no autenticado,  
**Quiero** ser redirigido automáticamente a la página de login si intento acceder a una ruta protegida,  
**Para** que solo usuarios autenticados y autorizados puedan ver el catálogo y las funciones administrativas.

---

## Contexto de Usuario

- **Rol:** Visitante, Lector, Administrador (afecta a todos)
- **Objetivo:** Garantizar la seguridad del sistema mediante control de acceso basado en roles
- **Momento de uso:** Cada vez que se navega a cualquier ruta del sistema
- **Frecuencia:** Constante (cada navegación)

---

## Mapa de Rutas y Permisos

| Ruta | Visitante | Lector | Admin |
|------|-----------|--------|-------|
| `/login` | ✅ | ➡️ Redirige a catálogo | ➡️ Redirige a admin |
| `/register` | ✅ | ➡️ Redirige a catálogo | ➡️ Redirige a admin |
| `/catalogo` | ❌ → login | ✅ | ✅ |
| `/catalogo/:id` | ❌ → login | ✅ | ✅ |
| `/admin/*` | ❌ → login | ❌ → catálogo | ✅ |

---

## Criterios de Aceptación

### AC-01: Visitante accede a ruta protegida

```gherkin
Given que soy un visitante (no autenticado)
When intento acceder directamente a una ruta protegida (ej. /catalogo, /admin/users)
Then soy redirigido automáticamente a la página de login (/login)
  And no puedo ver ningún contenido de la ruta protegida
  And la URL destino original se preserva para redirigir tras login exitoso
```

### AC-02: Lector accede a ruta admin

```gherkin
Given que soy un lector autenticado (rol: reader)
When intento acceder a una ruta administrativa (ej. /admin/users)
Then soy redirigido a la página del catálogo (/catalogo)
  And veo un mensaje: "No tienes permisos para acceder a esta sección"
  And no puedo ver ningún contenido administrativo
```

### AC-03: Redirección post-login con destino original

```gherkin
Given que soy un visitante que fue redirigido al login desde /catalogo/5
When inicio sesión exitosamente
Then soy redirigido automáticamente a /catalogo/5 (la ruta original)
  And no voy a la ruta por defecto genérica
```

### AC-04: Usuario autenticado accede a login/register

```gherkin
Given que soy un usuario ya autenticado (lector o admin)
When intento acceder a /login o /register
Then soy redirigido automáticamente a mi ruta por defecto según mi rol:
  | Rol | Redirige a |
  | Lector | /catalogo |
  | Admin | /admin |
  And no puedo ver el formulario de login/registro
```

### AC-05: Token expirado

```gherkin
Given que mi sesión ha expirado (token JWT inválido o expirado)
When intento navegar a cualquier ruta protegida
Then el sistema detecta el token inválido
  And limpia la sesión local
  And me redirige a /login
  And veo un mensaje: "Tu sesión ha expirado. Inicia sesión nuevamente."
```

### AC-06: Verificación en cada navegación

```gherkin
Given que estoy navegando por el sistema
When cambio de ruta (ya sea por clic o por URL directa)
Then el sistema verifica mi estado de autenticación y rol antes de renderizar la página
  And si no tengo permisos suficientes, aplica la redirección correspondiente
  And la verificación no causa un flash visible del contenido protegido
```

---

## Notas de Referencia

- **Middleware frontend:** Implementar un componente `<ProtectedRoute>` que envuelva las rutas protegidas
- **Verificación de rol:** Consultar `profiles.role` tras la autenticación
- **State management:** Usar `AuthContext` para gestionar el estado de autenticación globalmente
- **Listener de auth:** `supabase.auth.onAuthStateChange()` para reaccionar a cambios de sesión
- **Anti-flash:** Mostrar un loader/skeleton mientras se verifica la autenticación para evitar mostrar contenido protegido brevemente

---

## Dependencias

- **US-02:** Requiere que el sistema de login exista
- **US-03:** Requiere que el logout limpie correctamente el estado

## Historias Relacionadas

- [US-02: Inicio de sesión](./US-02_inicio_sesion.md) — página a la que se redirige
- [US-03: Cierre de sesión](./US-03_cierre_sesion.md) — limpieza de sesión
- [US-08: Listar usuarios](./US-08_listar_usuarios.md) — ruta admin protegida
- [US-18: Mensajes de error](./US-18_mensajes_error.md) — mensajes de acceso denegado
