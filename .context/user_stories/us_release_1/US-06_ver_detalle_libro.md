# US-06: Ver Detalle de Libro

> **Épica:** Consulta del Catálogo de Libros (Lector)  
> **Prioridad:** Must Have  
> **Estimación:** 3 Story Points  
> **Sprint:** 2

---

## Descripción

**Como** lector autenticado,  
**Quiero** ver la ficha completa de un libro con toda su información detallada,  
**Para** decidir si me interesa reservarlo en el futuro y conocer más sobre la obra.

---

## Contexto de Usuario

- **Rol:** Lector (usuario autenticado)
- **Objetivo:** Obtener información completa sobre un libro específico
- **Momento de uso:** Después de encontrar un libro interesante en el catálogo (listado o búsqueda)
- **Frecuencia:** Cada vez que el usuario quiere más información sobre un libro

---

## Campos Mostrados

| Campo | Fuente | Obligatorio | Ubicación |
|-------|--------|-------------|-----------|
| Portada | `cover_url` (Storage) | No (placeholder si no existe) | Columna izquierda |
| Título | `title` | Sí | Encabezado principal |
| Autor | `author` | Sí | Subtítulo |
| Estado | `status` | Sí | Badge junto al título |
| Año | `year` | No | Tag de metadatos |
| Género | `genre` | No | Tag de metadatos |
| Sinopsis | `description` | No | Sección "Sinopsis" |

---

## Criterios de Aceptación

### AC-01: Carga exitosa del detalle

```gherkin
Given que soy un lector autenticado
  And existe un libro con id "abc123" en el catálogo
When accedo a la ruta "/catalogo/abc123"
Then se muestra la ficha completa del libro con:
  | Elemento | Contenido |
  | Portada | Imagen del libro o placeholder (📖) |
  | Título | El título del libro en tamaño grande |
  | Autor | "por [nombre del autor]" |
  | Estado | Badge de disponibilidad (verde o naranja) |
  | Año | Si existe, mostrado como tag |
  | Género | Si existe, mostrado como tag |
  | Sinopsis | Si existe, sección con el texto completo |
```

### AC-02: Libro sin portada

```gherkin
Given que soy un lector viendo el detalle de un libro
  And el libro no tiene una portada cargada (cover_url es null)
When la página termina de cargar
Then se muestra un placeholder visual con gradiente y un ícono de libro (📖)
  And el texto "Sin portada" aparece debajo del ícono
```

### AC-03: Libro sin descripción

```gherkin
Given que soy un lector viendo el detalle de un libro
  And el libro no tiene descripción (description es null)
When la página termina de cargar
Then se muestra un texto en itálica: "Este libro no tiene descripción disponible."
  And no se muestra la sección de "Sinopsis"
```

### AC-04: Botón de reserva (placeholder futuro)

```gherkin
Given que soy un lector viendo el detalle de un libro disponible
When veo la sección de acciones
Then se muestra un botón "🔖 Reservar — Próximamente" deshabilitado
  And un texto explicativo: "La funcionalidad de reserva estará disponible en una próxima versión."
  And el botón no es clickeable
```

### AC-05: Navegación de vuelta al catálogo

```gherkin
Given que soy un lector viendo el detalle de un libro
When hago clic en el enlace "← Volver al catálogo"
Then soy redirigido a la página del catálogo ("/catalogo")
```

### AC-06: Libro no encontrado

```gherkin
Given que soy un lector autenticado
  And accedo a "/catalogo/{id}" con un id que no existe o no es visible
When la página termina de cargar
Then se muestra un mensaje: "Libro no encontrado"
  And una descripción: "El libro que buscas no existe o no está disponible."
  And un botón "← Volver al catálogo" que me lleva de regreso
```

### AC-07: Estado de carga (loading)

```gherkin
Given que soy un lector accediendo al detalle de un libro
When la información se está cargando del servidor
Then se muestran elementos skeleton con efecto de animación
  And el skeleton simula la disposición de la portada, título, autor y descripción
```

---

## Notas de Referencia

- **Endpoint:** `supabase.from('books').select('*').eq('id', bookId).single()`
- **Layout:** Dos columnas en desktop (portada | info), una columna en mobile
- **Portada:** Aspect ratio 3:4, bordes redondeados, sombra prominente
- **Metadata:** Tags con fondo glassmorphism para año y género

---

## Dependencias

- [US-04: Ver listado de libros](./US-04_ver_listado_libros.md) — la navegación al detalle viene del listado
- [US-07: Indicar disponibilidad](./US-07_indicar_disponibilidad.md) — el badge de estado se muestra en el detalle

## Historias Relacionadas

- [US-05: Buscar libros](./US-05_buscar_libros.md) — también puede navegar al detalle desde resultados de búsqueda
