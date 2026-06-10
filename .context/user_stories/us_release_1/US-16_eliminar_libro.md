# US-16: Eliminar Libro

> **Épica:** Administración del Catálogo (CRUD)  
> **Prioridad:** Should Have  
> **Estimación:** 3 Story Points  
> **Sprint:** 2

---

## Descripción

**Como** administrador,  
**Quiero** eliminar un libro del catálogo con opción de baja lógica o eliminación permanente,  
**Para** retirar títulos obsoletos o duplicados manteniendo la integridad referencial de los datos.

---

## Contexto de Usuario

- **Rol:** Administrador
- **Objetivo:** Gestionar la baja de libros del catálogo de forma controlada
- **Momento de uso:** Cuando un libro ya no forma parte del inventario o se detecta un duplicado
- **Frecuencia:** Baja, según necesidad de limpieza del catálogo

---

## Opciones de Eliminación

| Opción | Ícono | Acción en BD | Reversible | Portada Storage |
|--------|-------|--------------|------------|-----------------|
| **Baja lógica** (recomendada) | 🗃️ | `is_deleted=true`, `deleted_at=now()`, `deleted_by=admin_id`, `is_visible=false` | ✅ Sí | Se mantiene |
| **Eliminación permanente** | 🗑️ | `DELETE FROM books WHERE id=...` | ❌ No | Se elimina |

---

## Criterios de Aceptación

### AC-01: Abrir diálogo de confirmación

```gherkin
Given que soy un administrador en la tabla de libros
When hago clic en el botón de eliminar (🗑️) de un libro
Then se abre un diálogo de confirmación
  And el título dice "Eliminar Libro"
  And muestra el nombre del libro: "{título}" — {autor}
  And presenta dos opciones de eliminación
```

### AC-02: Baja lógica (soft-delete)

```gherkin
Given que estoy en el diálogo de eliminación de un libro
When hago clic en la opción "Baja lógica (recomendado)"
Then el libro se actualiza en la BD con:
  | Campo | Valor |
  | is_deleted | true |
  | deleted_at | timestamp actual |
  | deleted_by | ID del admin actual |
  | is_visible | false |
  And el diálogo se cierra
  And la tabla se refresca
  And se muestra un toast: "Libro marcado como eliminado (se puede restaurar)"
  And el libro ya no aparece en el catálogo público
  And el libro aparece en el filtro "Eliminados" del admin
```

### AC-03: Eliminación permanente

```gherkin
Given que estoy en el diálogo de eliminación de un libro
When hago clic en la opción "Eliminar permanentemente"
Then se elimina el registro del libro de la tabla "books"
  And si el libro tenía portada en Storage, se elimina el archivo del bucket "book-covers"
  And el diálogo se cierra
  And la tabla se refresca
  And se muestra un toast: "Libro eliminado permanentemente"
  And el libro no puede ser recuperado
```

### AC-04: Presentación de las opciones

```gherkin
Given que estoy en el diálogo de eliminación
When observo las opciones disponibles
Then la opción "Baja lógica" se presenta como la recomendada
  And tiene la descripción: "Marca el libro como eliminado. Se puede restaurar después."
  And la opción "Eliminar permanentemente" advierte: "Borra el libro y su portada. Esta acción es irreversible."
  And ambas opciones tienen efectos hover distinguibles (naranja para lógica, rojo para permanente)
```

### AC-05: Cancelar eliminación

```gherkin
Given que estoy en el diálogo de eliminación de un libro
When hago clic en "Cancelar" o fuera del diálogo
Then el diálogo se cierra
  And no se realiza ninguna acción sobre el libro
  And la tabla permanece sin cambios
```

### AC-06: Estado de procesamiento

```gherkin
Given que he seleccionado una opción de eliminación
When la operación se está procesando
Then los botones se deshabilitan para evitar doble clic
  And se muestra un indicador de carga con spinner
  And el texto "Procesando..." aparece debajo del spinner
```

---

## Notas de Referencia

- **Integridad referencial:** La baja lógica es la opción recomendada porque mantiene la integridad referencial de los datos. Si en el futuro se implementan reservas, préstamos o relaciones con otros objetos, los registros eliminados lógicamente no romperán las FK.
- **Limpieza de Storage:** En la eliminación permanente, se extrae el path del archivo del `cover_url` y se usa `supabase.storage.from('book-covers').remove([path])`.
- **Campo `deleted_by`:** FK a `auth.users(id)` para auditoría de quién realizó la baja.

---

## Dependencias

- [US-13: Listar libros para admin](./US-13_listar_libros_admin.md) — el botón eliminar está en la tabla

## Historias Relacionadas

- [US-11: Eliminar/desactivar usuario](./US-11_eliminar_desactivar_usuario.md) — patrón similar de baja lógica
