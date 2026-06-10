# US-11: Eliminar o Desactivar Usuario

> **Épica:** Gestión de Usuarios (CRUD Administrativo)  
> **Prioridad:** Should Have  
> **Estimación:** 3 Story Points  
> **Sprint:** 1

---

## Descripción

**Como** administrador,  
**Quiero** desactivar o eliminar la cuenta de un usuario,  
**Para** mantener la base de usuarios limpia, segura y controlar el acceso al sistema.

---

## Contexto de Usuario

- **Rol:** Administrador
- **Objetivo:** Revocar el acceso a usuarios que ya no deben tener cuenta activa
- **Momento de uso:** Cuando un usuario infringe reglas, ya no necesita acceso, o la cuenta es fraudulenta
- **Frecuencia:** Ocasional

---

## Criterios de Aceptación

### AC-01: Desactivar usuario (acción recomendada)

```gherkin
Given que soy un administrador autenticado
  And estoy en el listado de usuarios
When presiono el botón "Desactivar" en la fila de un usuario activo
Then el sistema muestra un diálogo de confirmación: "¿Estás seguro de que deseas desactivar a [nombre] ([email])?"
  And el diálogo muestra las consecuencias: "El usuario no podrá iniciar sesión"
When confirmo la acción
Then el campo "is_active" se actualiza a "false" en la tabla "profiles"
  And el estado del usuario en la tabla cambia a "Inactivo" con indicador visual diferenciado
  And veo un mensaje: "Usuario desactivado correctamente"
```

### AC-02: Reactivar usuario

```gherkin
Given que soy un administrador autenticado
  And hay un usuario con estado "Inactivo" en el listado
When presiono el botón "Reactivar" en la fila de ese usuario
Then el sistema actualiza "is_active" a "true"
  And el estado cambia a "Activo" en la tabla
  And el usuario puede volver a iniciar sesión
  And veo un mensaje: "Usuario reactivado correctamente"
```

### AC-03: Eliminar usuario (acción irreversible)

```gherkin
Given que soy un administrador autenticado
  And estoy en el listado de usuarios
When presiono el botón "Eliminar" en la fila de un usuario
Then el sistema muestra un diálogo de confirmación severo:
  | Elemento | Contenido |
  | Título | "Eliminar usuario permanentemente" |
  | Mensaje | "Esta acción es irreversible. Se eliminarán todos los datos de [nombre]." |
  | Input confirmación | "Escribe el email del usuario para confirmar" |
  | Botón | "Eliminar permanentemente" (en rojo) |
When ingreso el email correctamente y confirmo
Then el registro se elimina de la tabla "profiles"
  And la cuenta se elimina de Supabase Auth
  And el usuario desaparece del listado
  And veo un mensaje: "Usuario eliminado permanentemente"
```

### AC-04: Protección contra auto-eliminación

```gherkin
Given que soy un administrador autenticado
When intento desactivar o eliminar mi propia cuenta
Then el sistema muestra: "No puedes desactivar ni eliminar tu propia cuenta"
  And no se permite ejecutar la acción
```

### AC-05: Efecto de desactivación en el login

```gherkin
Given que un usuario ha sido desactivado por un administrador
When ese usuario intenta iniciar sesión con sus credenciales válidas
Then el sistema muestra: "Tu cuenta ha sido desactivada. Contacta al administrador."
  And no se permite el acceso al sistema
```

### AC-06: Cancelar acción

```gherkin
Given que estoy viendo el diálogo de confirmación de desactivación o eliminación
When presiono "Cancelar"
Then el diálogo se cierra
  And no se realiza ninguna acción sobre el usuario
```

---

## Notas de Referencia

- **Desactivar:** `supabase.from('profiles').update({ is_active: false }).eq('id', userId)`
- **Eliminar:** `supabase.auth.admin.deleteUser(userId)` + cascade en profiles
- **Recomendación:** Favorecer la desactivación sobre la eliminación. La eliminación debe ser una acción de último recurso
- **RLS:** Solo admins pueden ejecutar estas operaciones

---

## Dependencias

- **US-08:** El listado de usuarios debe existir para acceder a estas acciones
- **US-02:** La verificación de estado activo se valida durante el login

## Historias Relacionadas

- [US-08: Listar usuarios](./US-08_listar_usuarios.md) — vista desde donde se accede
- [US-10: Editar usuario](./US-10_editar_usuario.md) — gestión complementaria
- [US-02: Inicio de sesión](./US-02_inicio_sesion.md) — efecto de desactivación
