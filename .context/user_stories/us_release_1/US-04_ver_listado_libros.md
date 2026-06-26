# US-04: Ver Listado de Libros

> **Épica:** Consulta del Catálogo de Libros (Lector)  
> **Prioridad:** Must Have  
> **Estimación:** 5 Story Points  
> **Sprint:** 2

---

## Descripción

**Como** lector autenticado,  
**Quiero** ver un listado paginado de los libros disponibles en la biblioteca,  
**Para** poder explorar el catálogo y encontrar libros de mi interés.

---

## Contexto de Usuario

- **Rol:** Lector (usuario autenticado)
- **Objetivo:** Explorar el inventario de libros de la biblioteca
- **Momento de uso:** Al acceder a la sección "Catálogo" después de iniciar sesión
- **Frecuencia:** Cada vez que el usuario visita la plataforma

---

## Criterios de Aceptación

### AC-01: Carga inicial del catálogo

```gherkin
Given que soy un lector autenticado
  And accedo a la ruta "/catalogo"
When la página termina de cargar
Then veo un grid de tarjetas (cards) de libros
  And cada tarjeta muestra: portada, título, autor y estado de disponibilidad
  And se muestran como máximo 12 libros por página
  And solo se muestran libros marcados como visibles y no eliminados
```

### AC-02: Paginación funcional

```gherkin
Given que el catálogo tiene más de 12 libros
When veo la parte inferior de la lista
Then se muestra un control de paginación con "Anterior" y "Siguiente"
  And el indicador muestra "Página X de Y · N libros"
  And al hacer clic en "Siguiente" se cargan los siguientes 12 libros
  And al estar en la primera página, el botón "Anterior" está deshabilitado
  And al estar en la última página, el botón "Siguiente" está deshabilitado
```

### AC-03: Contador de libros

```gherkin
Given que soy un lector autenticado en el catálogo
When la página termina de cargar
Then veo un encabezado "Catálogo de Libros"
  And debajo un contador que indica "X libros disponibles"
  And el número refleja el total de libros visibles (no solo los de la página actual)
```

### AC-04: Estado de carga (loading)

```gherkin
Given que soy un lector autenticado en el catálogo
When la página está cargando los datos del servidor
Then se muestran 12 tarjetas de esqueleto (skeleton) con efecto de animación
  And el contenido real reemplaza los skeletons al completar la carga
```

### AC-05: Catálogo vacío

```gherkin
Given que no hay libros visibles en el catálogo
When accedo a la ruta "/catalogo"
Then veo un mensaje amigable: "Sin libros"
  And una descripción: "El catálogo está vacío por el momento."
  And un ícono ilustrativo (📚)
```

### AC-06: Navegación a detalle

```gherkin
Given que soy un lector viendo el catálogo
When hago clic en una tarjeta de libro
Then soy redirigido a la página de detalle del libro ("/catalogo/{id}")
```

---

## Notas de Referencia

- **Endpoint:** `supabase.from('books').select('*').eq('is_visible', true).eq('is_deleted', false)`
- **Diseño:** Grid responsivo que adapta columnas según viewport (2→3→4→5→6 columnas)
- **Ordenamiento:** Por fecha de creación descendente (últimos agregados primero)
- **Portada:** Si el libro no tiene `cover_url`, se muestra un placeholder con ícono 📖

---

## Dependencias

- Épica 1: Autenticación (el usuario debe estar logueado)
- Tabla `books` en Supabase con RLS configurado

## Historias Relacionadas

- [US-05: Buscar libros](./US-05_buscar_libros.md) — extiende la funcionalidad con búsqueda
- [US-06: Ver detalle de libro](./US-06_ver_detalle_libro.md) — flujo posterior al clic en una tarjeta
- [US-07: Indicar disponibilidad](./US-07_indicar_disponibilidad.md) — badge de estado en cada tarjeta
