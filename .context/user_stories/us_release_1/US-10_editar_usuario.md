# US-10: Editar Usuario (Admin)

> **Épica:** Gestión de Usuarios (CRUD Administrativo)  
> **Prioridad:** Should Have  
> **Estimación:** 3 Story Points  
> **Sprint:** 1

---

## Descripción

**Como** administrador,  
**Quiero** editar los datos de un usuario existente (nombre, apellido, rol, estado, campos opcionales),  
**Para** corregir información, actualizar permisos o ajustar datos del perfil.

---

## Contexto de Usuario

- **Rol:** Administrador
- **Objetivo:** Modificar datos de un usuario sin necesidad de recrear la cuenta
- **Momento de uso:** Cuando un usuario necesita un cambio de rol, corrección de datos o actualización de perfil
- **Frecuencia:** Ocasional

---

## Campos Editables

| Campo | Tipo | Editable | Notas |
|-------|------|----------|-------|
| Email | email | ❌ No | Solo lectura (mostrado como referencia) |
| Nombre | texto | ✅ Sí | Obligatorio |
| Apellido | texto | ✅ Sí | Obligatorio |
| Rol | select | ✅ Sí | "reader" o "admin" |
| Estado | toggle | ✅ Sí | Activo / Inactivo |
| Fecha de nacimiento | date | ✅ Sí | Opcional |
| Dirección | texto | ✅ Sí | Opcional |
| Contraseña | — | ❌ No | No se muestra ni edita aquí (ver US-12) |

---

## Criterios de Aceptación

### AC-01: Carga de datos del usuario

```gherkin
Given que soy un administrador autenticado
  And estoy en el listado de usuarios
When presiono el botón "Editar" en la fila de un usuario
Then se abre un formulario de edición precargado con los datos actuales del usuario
  And el campo email se muestra como solo lectura
  And puedo modificar nombre, apellido, rol, estado, fecha de nacimiento y dirección
```

### AC-02: Edición exitosa

```gherkin
Given que estoy en el formulario de edición de un usuario
  And he modificado uno o más campos con datos válidos
When presiono "Guardar cambios"
Then los datos se actualizan en la tabla "profiles" de Supabase
  And veo un mensaje de éxito: "Usuario actualizado correctamente"
  And los cambios se reflejan inmediatamente en el listado
```

### AC-03: Cambio de rol

```gherkin
Given que estoy editando un usuario con rol "lector"
When cambio su rol a "administrador" y guardo
Then el rol se actualiza en la base de datos
  And la próxima vez que el usuario inicie sesión, tendrá acceso al panel admin
  And se registra el cambio de rol en el sistema
```

### AC-04: Protección contra auto-desactivación

```gherkin
Given que estoy editando mi propio perfil de administrador
When intento cambiar mi rol a "lector" o desactivar mi cuenta
Then el sistema muestra una advertencia: "No puedes cambiar tu propio rol ni desactivarte"
  And no se permite guardar ese cambio
```

### AC-05: Validación de campos

```gherkin
Given que estoy editando un usuario
  And he dejado un campo obligatorio vacío (nombre o apellido)
When presiono "Guardar cambios"
Then el sistema resalta el campo con error
  And muestra: "Este campo es obligatorio"
  And no se envían los cambios
```

### AC-06: Cancelar edición

```gherkin
Given que estoy en el formulario de edición y he modificado datos
When presiono "Cancelar"
Then el formulario se cierra sin guardar cambios
  And los datos originales permanecen sin alteraciones
```

---

## Notas de Referencia

- **Update:** `supabase.from('profiles').update({ ... }).eq('id', userId)`
- **RLS:** Solo admins pueden actualizar perfiles ajenos
- **Audit:** Considerar registrar cambios de rol para trazabilidad

---

## Dependencias

- **US-08:** El listado de usuarios debe existir para acceder a la edición

## Historias Relacionadas

- [US-08: Listar usuarios](./US-08_listar_usuarios.md) — vista desde donde se accede
- [US-11: Eliminar/desactivar](./US-11_eliminar_desactivar_usuario.md) — gestión complementaria
- [US-12: Reset de contraseña](./US-12_reset_password_admin.md) — acción separada de edición
