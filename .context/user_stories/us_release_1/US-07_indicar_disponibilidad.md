# US-07: Indicar Disponibilidad

> **Épica:** Consulta del Catálogo de Libros (Lector)  
> **Prioridad:** Must Have  
> **Estimación:** 2 Story Points  
> **Sprint:** 2

---

## Descripción

**Como** lector autenticado,  
**Quiero** ver claramente si un libro está disponible o reservado mediante un indicador visual,  
**Para** no intentar acciones inválidas y saber de un vistazo qué libros puedo solicitar.

---

## Contexto de Usuario

- **Rol:** Lector (usuario autenticado)
- **Objetivo:** Identificar rápidamente el estado de disponibilidad de cada libro
- **Momento de uso:** Al navegar por el catálogo (listado y detalle)
- **Frecuencia:** Constante durante la exploración del catálogo

---

## Estados de Disponibilidad

| Estado | Valor en BD | Color | Ícono | Texto |
|--------|-------------|-------|-------|-------|
| Disponible | `available` | Verde (#22c55e) | Punto pulsante | "Disponible" |
| Reservado | `reserved` | Naranja (#f59e0b) | Punto estático | "Reservado" |

---

## Criterios de Aceptación

### AC-01: Badge en tarjeta del catálogo

```gherkin
Given que soy un lector viendo el listado del catálogo
When observo una tarjeta de libro
Then veo un badge de estado en la esquina superior derecha de la portada
  And si el libro está disponible, el badge es verde con texto "Disponible"
  And si el libro está reservado, el badge es naranja con texto "Reservado"
  And el badge tiene un punto circular de color indicativo
```

### AC-02: Badge en detalle de libro

```gherkin
Given que soy un lector viendo la ficha de detalle de un libro
When observo la sección de información
Then veo un badge de estado más grande (tamaño "md") junto al título
  And el badge usa los mismos colores y textos que en la tarjeta
  And está posicionado a la derecha del título principal
```

### AC-03: Animación del punto en estado disponible

```gherkin
Given que un libro tiene estado "available"
When el badge se muestra en pantalla
Then el punto circular verde tiene un efecto de pulso (animate-pulse)
  And el efecto indica visualmente que el libro está activo/disponible
```

### AC-04: Sin animación en estado reservado

```gherkin
Given que un libro tiene estado "reserved"
When el badge se muestra en pantalla
Then el punto circular naranja es estático (sin animación)
  And transmite visualmente que el libro no está disponible para acciones
```

### AC-05: Diferenciación visual inmediata

```gherkin
Given que soy un lector explorando el catálogo
When veo múltiples tarjetas de libros con diferentes estados
Then puedo distinguir inmediatamente entre libros disponibles y reservados
  And la diferencia es evidente por el contraste de color (verde vs naranja)
  And no necesito leer el texto para identificar el estado
```

---

## Notas de Referencia

- **Componente:** `StatusBadge` reutilizable con prop `size` ("sm" para cards, "md" para detalle)
- **Campo:** `books.status` — puede ser `'available'` o `'reserved'`
- **Colores:** Verde usa `success-500` (#22c55e), naranja usa `warning-500` (#f59e0b) del design system

---

## Dependencias

- [US-04: Ver listado de libros](./US-04_ver_listado_libros.md) — el badge se muestra en las tarjetas
- [US-06: Ver detalle de libro](./US-06_ver_detalle_libro.md) — el badge se muestra en el detalle

## Historias Relacionadas

- [US-13: Listar libros para admin](./US-13_listar_libros_admin.md) — reutiliza el mismo componente StatusBadge
