# US-13: Listar Libros para Admin

> **Épica:** Administración del Catálogo (CRUD)  
> **Prioridad:** Must Have  
> **Estimación:** 5 Story Points  
> **Sprint:** 2

---

## Descripción

**Como** administrador,  
**Quiero** ver y filtrar todos los libros del catálogo incluyendo los ocultos y eliminados,  
**Para** gestionar el inventario completo de la biblioteca con visibilidad total.

---

## Contexto de Usuario

- **Rol:** Administrador
- **Objetivo:** Supervisar y gestionar todos los libros registrados en el sistema
- **Momento de uso:** Al acceder al panel de administración, sección "Libros"
- **Frecuencia:** Regularmente para mantenimiento del catálogo

---

## Criterios de Aceptación

### AC-01: Vista de tabla completa

```gherkin
Given que soy un administrador autenticado
  And accedo a la ruta "/admin/books"
When la página termina de cargar
Then veo una tabla con columnas: Portada, Título, Autor, Género, Estado, Visibilidad, Acciones
  And la tabla muestra todos los libros activos (no eliminados) por defecto
  And se muestran 10 libros por página con paginación funcional
  And el encabezado muestra "Gestión de Libros" y el conteo total
```

### AC-02: Filtro por estado de disponibilidad

```gherkin
Given que soy un administrador en la gestión de libros
When selecciono un filtro de estado (Todos/Disponible/Reservado)
Then la tabla se filtra mostrando solo los libros con el estado seleccionado
  And el conteo se actualiza reflejando los resultados filtrados
  And la paginación se reinicia a la página 1
```

### AC-03: Filtro por visibilidad

```gherkin
Given que soy un administrador en la gestión de libros
When selecciono un filtro de visibilidad (Todos/Visible/Oculto)
Then la tabla se filtra mostrando solo los libros con la visibilidad seleccionada
  And puedo ver libros ocultos que los lectores no pueden ver
```

### AC-04: Filtro por estado de eliminación

```gherkin
Given que soy un administrador en la gestión de libros
When selecciono el filtro "Eliminados"
Then la tabla muestra solo los libros con baja lógica (is_deleted = true)
  And las filas de libros eliminados se muestran con opacidad reducida
  And en las acciones se muestra un botón de "Restaurar" (♻️) en lugar de las acciones habituales
```

### AC-05: Búsqueda por título o autor

```gherkin
Given que soy un administrador en la gestión de libros
When ingreso texto en el campo "Buscar por título o autor..."
Then la tabla se filtra mostrando coincidencias parciales en título o autor
  And la búsqueda no distingue entre mayúsculas y minúsculas
  And la búsqueda se ejecuta con un debounce de 500ms
```

### AC-06: Alternar visibilidad de un libro

```gherkin
Given que soy un administrador viendo la tabla de libros
  And un libro está marcado como "Visible"
When hago clic en el botón de ojo (👁️) en las acciones
Then el libro se marca como "Oculto" en la base de datos
  And se muestra un toast: "Libro oculto del catálogo"
  And la tabla se refresca mostrando el nuevo estado
  And el libro deja de ser visible para los lectores en "/catalogo"
```

### AC-07: Restaurar un libro eliminado

```gherkin
Given que soy un administrador viendo libros eliminados (filtro "Eliminados")
When hago clic en el botón de restaurar (♻️)
Then el libro se marca como activo (is_deleted = false, deleted_at = null)
  And se muestra un toast: "Libro restaurado correctamente"
  And el libro vuelve a aparecer en la vista de libros activos
```

### AC-08: Portada miniatura en tabla

```gherkin
Given que soy un administrador viendo la tabla de libros
When observo la columna "Portada"
Then cada fila muestra una miniatura de la portada del libro (40x56px)
  And si el libro no tiene portada, se muestra un placeholder con ícono 📖
```

---

## Notas de Referencia

- **RLS:** El admin tiene política que permite ver TODOS los libros (incluidos ocultos y eliminados)
- **Navegación:** El sidebar admin tiene un ítem "Libros" (📖) con detección de ruta activa
- **Botón:** "Nuevo Libro" abre el modal de creación (US-14)

---

## Dependencias

- Épica 1: Autenticación (el admin debe estar logueado)
- Épica 3: Rutas protegidas (solo rol admin puede acceder a /admin/books)

## Historias Relacionadas

- [US-14: Crear libro](./US-14_crear_libro.md) — botón "Nuevo Libro" abre el modal
- [US-15: Editar libro](./US-15_editar_libro.md) — botón editar (✏️) en cada fila
- [US-16: Eliminar libro](./US-16_eliminar_libro.md) — botón eliminar (🗑️) en cada fila
