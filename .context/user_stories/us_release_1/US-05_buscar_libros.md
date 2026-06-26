# US-05: Buscar Libros por Título o Autor

> **Épica:** Consulta del Catálogo de Libros (Lector)  
> **Prioridad:** Must Have  
> **Estimación:** 3 Story Points  
> **Sprint:** 2

---

## Descripción

**Como** lector autenticado,  
**Quiero** buscar libros por título o autor ingresando un texto en un campo de búsqueda,  
**Para** encontrar rápidamente libros específicos sin tener que navegar página por página.

---

## Contexto de Usuario

- **Rol:** Lector (usuario autenticado)
- **Objetivo:** Localizar rápidamente un libro específico o explorar obras de un autor
- **Momento de uso:** Cuando el usuario tiene en mente un título o autor particular
- **Frecuencia:** Frecuente, especialmente con catálogos grandes

---

## Criterios de Aceptación

### AC-01: Búsqueda por título parcial

```gherkin
Given que soy un lector autenticado en el catálogo
  And existe un libro con título "Cien años de soledad"
When ingreso "años" en el campo de búsqueda
Then los resultados se filtran mostrando solo libros cuyo título contenga "años"
  And el libro "Cien años de soledad" aparece en los resultados
  And el contador se actualiza reflejando la cantidad de coincidencias
```

### AC-02: Búsqueda por autor parcial

```gherkin
Given que soy un lector autenticado en el catálogo
  And existen libros de "Gabriel García Márquez"
When ingreso "García" en el campo de búsqueda
Then los resultados muestran todos los libros cuyo autor contenga "García"
  And la búsqueda no distingue entre mayúsculas y minúsculas
```

### AC-03: Búsqueda sin resultados

```gherkin
Given que soy un lector autenticado en el catálogo
When ingreso un texto que no coincide con ningún título ni autor (ej. "xyznonexistent")
Then se muestra un estado vacío con el mensaje: "No se encontraron resultados"
  And una descripción: "No hay libros que coincidan con 'xyznonexistent'. Intenta con otro término."
  And el ícono ilustrativo 📚 es visible
```

### AC-04: Búsqueda con debounce

```gherkin
Given que soy un lector escribiendo en el campo de búsqueda
When ingreso texto rápidamente
Then la búsqueda al servidor no se ejecuta en cada pulsación de tecla
  And se espera un intervalo de 400ms sin actividad antes de realizar la consulta
  And la paginación se reinicia a la página 1 al cambiar el término de búsqueda
```

### AC-05: Limpiar búsqueda

```gherkin
Given que soy un lector y he realizado una búsqueda
  And el campo de búsqueda contiene texto
When hago clic en el botón de limpiar (✕) dentro del campo de búsqueda
Then el campo se vacía
  And se muestran todos los libros del catálogo nuevamente
  And la paginación se reinicia a la página 1
```

### AC-06: Placeholder informativo

```gherkin
Given que soy un lector en el catálogo
When el campo de búsqueda está vacío
Then muestra el placeholder: "Buscar por título o autor..."
  And tiene un ícono de lupa (🔍) a la izquierda
```

---

## Notas de Referencia

- **Método de búsqueda:** `ilike` de Supabase para coincidencia parcial case-insensitive
- **Query:** `.or('title.ilike.%término%,author.ilike.%término%')`
- **Debounce:** 400ms antes de ejecutar la consulta al servidor
- **Índice GIN:** La tabla tiene un índice full-text (español) disponible para búsquedas avanzadas futuras

---

## Dependencias

- [US-04: Ver listado de libros](./US-04_ver_listado_libros.md) — la búsqueda opera sobre el listado existente

## Historias Relacionadas

- [US-13: Listar libros para admin](./US-13_listar_libros_admin.md) — el admin tiene su propia búsqueda con filtros adicionales
