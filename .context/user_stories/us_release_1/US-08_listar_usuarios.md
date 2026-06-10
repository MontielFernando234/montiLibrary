# US-08: Listar Usuarios

> **Épica:** Gestión de Usuarios (CRUD Administrativo)  
> **Prioridad:** Must Have  
> **Estimación:** 5 Story Points  
> **Sprint:** 1

---

## Descripción

**Como** administrador,  
**Quiero** ver un listado paginado de todos los usuarios registrados en el sistema,  
**Para** gestionar sus cuentas, verificar roles y monitorear el estado de cada usuario.

---

## Contexto de Usuario

- **Rol:** Administrador
- **Objetivo:** Obtener una visión general de todos los usuarios del sistema
- **Momento de uso:** Al acceder al panel de administración de usuarios
- **Frecuencia:** Cada vez que necesite gestionar cuentas

---

## Criterios de Aceptación

### AC-01: Visualización del listado

```gherkin
Given que soy un administrador autenticado
  And accedo a la sección "Gestión de Usuarios" del panel admin
When la página se carga
Then veo una tabla con los siguientes datos de cada usuario:
  | Columna | Descripción |
  | Email | Dirección de correo electrónico |
  | Nombre | Nombre completo (first_name + last_name) |
  | Rol | "Lector" o "Administrador" |
  | Estado | "Activo" o "Inactivo" con indicador visual |
  | Fecha registro | Fecha de creación de la cuenta |
  And los usuarios se muestran ordenados por fecha de registro (más recientes primero)
```

### AC-02: Paginación funcional

```gherkin
Given que hay más de 10 usuarios registrados en el sistema
  And estoy en la página de listado de usuarios
When la tabla se renderiza
Then se muestran 10 usuarios por página
  And veo controles de paginación (anterior/siguiente y número de páginas)
  And puedo navegar entre páginas sin perder los filtros aplicados
```

### AC-03: Búsqueda por email

```gherkin
Given que estoy en la página de listado de usuarios
When ingreso un texto en el campo de búsqueda (ej. "juan@")
Then la tabla se filtra mostrando solo usuarios cuyo email contenga el texto ingresado
  And el filtrado se aplica al presionar Enter o tras 500ms de inactividad (debounce)
  And si no hay coincidencias, se muestra: "No se encontraron usuarios con ese criterio"
```

### AC-04: Filtro por rol

```gherkin
Given que estoy en la página de listado de usuarios
When selecciono un filtro de rol (Todos / Lector / Administrador)
Then la tabla se filtra mostrando solo usuarios con el rol seleccionado
  And la paginación se recalcula según los resultados filtrados
```

### AC-05: Filtro por estado

```gherkin
Given que estoy en la página de listado de usuarios
When selecciono un filtro de estado (Todos / Activo / Inactivo)
Then la tabla se filtra mostrando solo usuarios con el estado seleccionado
```

### AC-06: Acceso denegado a no-admins

```gherkin
Given que soy un usuario con rol "lector"
When intento acceder a la ruta /admin/users directamente
Then soy redirigido a la página del catálogo
  And veo un mensaje: "No tienes permisos para acceder a esta sección"
```

---

## Notas de Referencia

- **Query:** `supabase.from('profiles').select('*').range(offset, limit).order('created_at', { ascending: false })`
- **RLS:** Solo usuarios con `role = 'admin'` pueden leer todos los perfiles
- **Columnas acciones:** Cada fila tendrá botones para Editar, Desactivar/Eliminar (ver US-10, US-11)

---

## Dependencias

- **US-02:** El administrador debe haber iniciado sesión
- **US-17:** Requiere protección de ruta con verificación de rol admin

## Historias Relacionadas

- [US-09: Crear usuario](./US-09_crear_usuario.md)
- [US-10: Editar usuario](./US-10_editar_usuario.md)
- [US-11: Eliminar/desactivar](./US-11_eliminar_desactivar_usuario.md)
