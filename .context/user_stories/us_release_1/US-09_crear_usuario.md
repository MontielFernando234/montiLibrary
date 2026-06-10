# US-09: Crear Usuario (Admin)

> **Épica:** Gestión de Usuarios (CRUD Administrativo)  
> **Prioridad:** Should Have  
> **Estimación:** 5 Story Points  
> **Sprint:** 1

---

## Descripción

**Como** administrador,  
**Quiero** crear un nuevo usuario manualmente asignándole email, nombre, apellido y rol,  
**Para** añadir lectores, otros administradores o cuentas de prueba al sistema.

---

## Contexto de Usuario

- **Rol:** Administrador
- **Objetivo:** Dar de alta un usuario sin que éste pase por el flujo de auto-registro
- **Momento de uso:** Cuando se necesita agregar un usuario específico al sistema
- **Frecuencia:** Ocasional

---

## Campos del Formulario

| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| Nombre | texto | ✅ Sí | Mínimo 2 caracteres |
| Apellido | texto | ✅ Sí | Mínimo 2 caracteres |
| Email | email | ✅ Sí | Formato válido, no duplicado |
| Rol | select | ✅ Sí | "reader" o "admin" |
| Contraseña temporal | password | ✅ Sí | Mínimo 8 caracteres |
| Fecha de nacimiento | date | ❌ No | Fecha válida, no futura |
| Dirección | texto | ❌ No | Máximo 200 caracteres |

---

## Criterios de Aceptación

### AC-01: Creación exitosa de usuario

```gherkin
Given que soy un administrador autenticado
  And estoy en la sección de gestión de usuarios
  And presiono el botón "Nuevo Usuario"
When completo el formulario con datos válidos y presiono "Crear"
Then el sistema crea la cuenta en Supabase Auth con el email y contraseña proporcionados
  And se crea el perfil en la tabla "profiles" con el rol asignado
  And veo un mensaje de éxito: "Usuario creado correctamente"
  And el nuevo usuario aparece en el listado de usuarios
```

### AC-02: Validación de email duplicado

```gherkin
Given que estoy creando un nuevo usuario
  And he ingresado un email que ya está registrado en el sistema
When presiono "Crear"
Then el sistema muestra: "Este email ya se encuentra registrado"
  And el formulario no se cierra
  And los datos ingresados se mantienen para corrección
```

### AC-03: Validación de campos obligatorios

```gherkin
Given que estoy en el formulario de creación de usuario
  And he dejado uno o más campos obligatorios vacíos
When presiono "Crear"
Then el sistema resalta los campos faltantes con indicador visual
  And muestra "Este campo es obligatorio" en cada campo vacío
  And no se envía la solicitud
```

### AC-04: Asignación de rol

```gherkin
Given que estoy creando un nuevo usuario
When selecciono el rol "Administrador" en el dropdown
  And completo los demás campos correctamente
  And presiono "Crear"
Then el usuario se crea con el rol "admin" en su perfil
  And al iniciar sesión, tendrá acceso al panel de administración
```

### AC-05: Cancelar creación

```gherkin
Given que estoy en el formulario de creación de usuario
  And he ingresado algunos datos
When presiono "Cancelar"
Then el formulario se cierra sin guardar cambios
  And vuelvo al listado de usuarios
  And no se ha creado ningún usuario
```

---

## Notas de Referencia

- **Creación:** Se usa `supabase.auth.admin.createUser()` (requiere service_role key en server-side o Edge Function)
- **Alternativa:** Si no se usa admin API, se puede usar `signUp` + actualización de rol vía RLS admin
- **Email de bienvenida:** Supabase puede enviar automáticamente un email de confirmación al nuevo usuario

---

## Dependencias

- **US-08:** El listado de usuarios debe existir para navegar a la creación
- **US-02:** El usuario creado podrá iniciar sesión con las credenciales asignadas

## Historias Relacionadas

- [US-08: Listar usuarios](./US-08_listar_usuarios.md) — vista desde donde se accede
- [US-10: Editar usuario](./US-10_editar_usuario.md) — edición post-creación
