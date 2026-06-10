# US-14: Crear Libro

> **Épica:** Administración del Catálogo (CRUD)  
> **Prioridad:** Must Have  
> **Estimación:** 5 Story Points  
> **Sprint:** 2

---

## Descripción

**Como** administrador,  
**Quiero** agregar un nuevo libro al catálogo proporcionando sus metadatos y una portada,  
**Para** ampliar el inventario de la biblioteca y que los lectores puedan descubrir nuevos títulos.

---

## Contexto de Usuario

- **Rol:** Administrador
- **Objetivo:** Registrar un nuevo libro en el sistema con toda su información
- **Momento de uso:** Cuando la biblioteca adquiere un nuevo título o se digitaliza un libro existente
- **Frecuencia:** Variable, según las adquisiciones de la biblioteca

---

## Campos del Formulario

| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| Título | texto | ✅ Sí | No puede estar vacío |
| Autor | texto | ✅ Sí | No puede estar vacío |
| Año | número | ❌ No | Entero positivo, no mayor al año actual + 1 |
| Género | texto | ❌ No | Texto libre |
| Sinopsis | textarea | ❌ No | Texto largo |
| Estado | select | ✅ Sí | "Disponible" o "Reservado" (default: Disponible) |
| Visibilidad | toggle | ✅ Sí | Visible u Oculto (default: Visible) |
| Portada | file upload | ❌ No | JPEG, PNG, WebP o GIF. Máx 5MB |

---

## Criterios de Aceptación

### AC-01: Abrir modal de creación

```gherkin
Given que soy un administrador en la página "/admin/books"
When hago clic en el botón "+ Nuevo Libro"
Then se abre un modal con el formulario de creación
  And el título del modal es "Nuevo Libro"
  And todos los campos están vacíos excepto Estado (Disponible) y Visibilidad (Visible)
```

### AC-02: Creación exitosa con datos obligatorios

```gherkin
Given que estoy en el modal de nuevo libro
  And he completado al menos Título y Autor
When hago clic en "Crear libro"
Then el libro se crea en la tabla "books" de Supabase
  And el modal se cierra
  And la tabla de libros se refresca mostrando el nuevo libro
  And se muestra un toast: "Libro creado correctamente"
```

### AC-03: Validación de campos obligatorios

```gherkin
Given que estoy en el modal de nuevo libro
  And he dejado el campo Título o Autor vacío
When hago clic en "Crear libro"
Then se muestra un mensaje de error bajo el campo: "El título es obligatorio" o "El autor es obligatorio"
  And el campo se resalta con borde rojo
  And no se envía la solicitud al servidor
```

### AC-04: Subida de portada exitosa

```gherkin
Given que estoy en el modal de nuevo libro
  And hago clic en "Seleccionar imagen"
When selecciono un archivo de imagen válido (JPEG, PNG, WebP o GIF, menor a 5MB)
Then se muestra una vista previa de la imagen en el modal (miniatura 80x112px)
  And aparece un botón "Cambiar imagen" para reemplazarla
  And aparece un enlace "Quitar portada" para removerla
```

### AC-05: Validación de archivo de portada

```gherkin
Given que estoy en el modal de nuevo libro
  And intento subir una portada
When selecciono un archivo que no es imagen (ej. PDF, DOC)
Then se muestra un toast de error: "Solo se permiten imágenes (JPG, PNG, WebP, GIF)"
  And el archivo no se carga

When selecciono una imagen mayor a 5MB
Then se muestra un toast de error: "La imagen no debe superar 5MB"
  And el archivo no se carga
```

### AC-06: Validación de año

```gherkin
Given que estoy en el modal de nuevo libro
  And he ingresado un año inválido (negativo, mayor al año actual + 1, o texto)
When hago clic en "Crear libro"
Then se muestra un mensaje: "Ingresa un año válido"
  And el campo se resalta con borde rojo
```

### AC-07: Toggle de visibilidad

```gherkin
Given que estoy en el modal de nuevo libro
When hago clic en el toggle de Visibilidad
Then el toggle cambia de estado (verde/activo ↔ gris/inactivo)
  And el texto cambia entre "Visible" y "Oculto"
  And si está en "Oculto", el libro no será visible para los lectores al crearse
```

### AC-08: Cancelar creación

```gherkin
Given que estoy en el modal de nuevo libro
  And he completado algunos campos
When hago clic en "Cancelar" o fuera del modal
Then el modal se cierra sin guardar cambios
  And la tabla de libros no se modifica
```

---

## Notas de Referencia

- **Storage:** La portada se sube al bucket `book-covers` de Supabase Storage con el ID del libro como nombre de archivo
- **Proceso:** 1) Se crea el libro (INSERT), 2) Se sube la portada con el ID obtenido, 3) Se actualiza `cover_url` con la URL pública
- **URL pública:** `supabase.storage.from('book-covers').getPublicUrl(filePath)`

---

## Dependencias

- [US-13: Listar libros para admin](./US-13_listar_libros_admin.md) — el botón de crear está en esa página

## Historias Relacionadas

- [US-15: Editar libro](./US-15_editar_libro.md) — reutiliza el mismo modal con datos precargados
