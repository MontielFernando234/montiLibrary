# US-15: Editar Libro

> **Épica:** Administración del Catálogo (CRUD)  
> **Prioridad:** Should Have  
> **Estimación:** 3 Story Points  
> **Sprint:** 2

---

## Descripción

**Como** administrador,  
**Quiero** editar los datos de un libro existente incluyendo su portada,  
**Para** corregir información errónea, actualizar sinopsis o cambiar la imagen de portada.

---

## Contexto de Usuario

- **Rol:** Administrador
- **Objetivo:** Actualizar la información de un libro que ya está registrado en el sistema
- **Momento de uso:** Cuando se detectan datos incorrectos, información desactualizada, o se quiere mejorar la ficha del libro
- **Frecuencia:** Moderada, según necesidad de correcciones

---

## Criterios de Aceptación

### AC-01: Abrir modal con datos precargados

```gherkin
Given que soy un administrador en la tabla de libros
When hago clic en el botón de editar (✏️) de un libro
Then se abre el modal con título "Editar Libro"
  And todos los campos se precargan con los datos actuales del libro
  And si el libro tiene portada, se muestra la preview con la imagen actual
```

### AC-02: Actualización exitosa de datos

```gherkin
Given que estoy en el modal de edición de un libro
  And he modificado uno o más campos
When hago clic en "Guardar cambios"
Then los datos se actualizan en la tabla "books" de Supabase
  And el modal se cierra
  And la tabla se refresca mostrando los datos actualizados
  And se muestra un toast: "Libro actualizado correctamente"
  And los cambios se reflejan en la vista pública del catálogo
```

### AC-03: Cambiar portada existente

```gherkin
Given que estoy editando un libro que ya tiene portada
  And hago clic en "Cambiar imagen"
When selecciono una nueva imagen válida
Then la preview se actualiza con la nueva imagen
  And al guardar, la nueva imagen reemplaza la anterior en Supabase Storage (upsert)
  And la URL pública se actualiza automáticamente
```

### AC-04: Quitar portada

```gherkin
Given que estoy editando un libro que tiene portada
When hago clic en "Quitar portada"
Then la preview se vacía mostrando el placeholder (📖)
  And al guardar, el campo cover_url se establece a null
  And el libro se muestra sin portada en el catálogo
```

### AC-05: Cambiar estado de disponibilidad

```gherkin
Given que estoy editando un libro con estado "Disponible"
When cambio el select de Estado a "Reservado"
  And hago clic en "Guardar cambios"
Then el estado del libro se actualiza a "reserved"
  And el badge en el catálogo cambia de verde a naranja
  And los lectores ven el libro como "Reservado"
```

### AC-06: Cambiar visibilidad

```gherkin
Given que estoy editando un libro visible
When cambio el toggle de Visibilidad a "Oculto"
  And hago clic en "Guardar cambios"
Then el libro deja de ser visible para los lectores en "/catalogo"
  And sigue visible para los admins en "/admin/books" con indicador "Oculto"
```

---

## Notas de Referencia

- **Reutilización:** Usa el mismo componente `BookFormModal` que la creación (US-14), pero con `book` prop no-null
- **Storage upsert:** Al cambiar portada, se usa `supabase.storage.upload(filePath, file, { upsert: true })`
- **Campo `updated_at`:** Se actualiza automáticamente via trigger en la BD

---

## Dependencias

- [US-13: Listar libros para admin](./US-13_listar_libros_admin.md) — el botón editar está en la tabla
- [US-14: Crear libro](./US-14_crear_libro.md) — reutiliza el componente BookFormModal

## Historias Relacionadas

- [US-07: Indicar disponibilidad](./US-07_indicar_disponibilidad.md) — los cambios de estado afectan el badge
