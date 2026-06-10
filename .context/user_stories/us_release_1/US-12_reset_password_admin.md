# US-12: Reset de Contraseña por Admin

> **Épica:** Gestión de Usuarios (CRUD Administrativo)  
> **Prioridad:** Could Have  
> **Estimación:** 2 Story Points  
> **Sprint:** 1

---

## Descripción

**Como** administrador,  
**Quiero** forzar un reset de contraseña o enviar un enlace de recuperación a un usuario,  
**Para** ayudar a usuarios que no pueden acceder a su cuenta por haber olvidado sus credenciales.

---

## Contexto de Usuario

- **Rol:** Administrador
- **Objetivo:** Asistir a usuarios con problemas de acceso sin necesidad de recrear la cuenta
- **Momento de uso:** Cuando un usuario reporta que olvidó su contraseña y no puede recuperarla por sí mismo
- **Frecuencia:** Ocasional

---

## Criterios de Aceptación

### AC-01: Enviar enlace de recuperación

```gherkin
Given que soy un administrador autenticado
  And estoy en el listado de usuarios o en la vista de edición de un usuario
When presiono el botón "Enviar reset de contraseña"
Then el sistema muestra un diálogo de confirmación: "Se enviará un enlace de recuperación a [email]. ¿Confirmar?"
When confirmo la acción
Then el sistema ejecuta el envío del enlace de recuperación vía Supabase
  And veo un mensaje: "Enlace de recuperación enviado a [email]"
  And el usuario recibe un email con instrucciones para restablecer su contraseña
```

### AC-02: Usuario recibe el email

```gherkin
Given que un administrador ha solicitado un reset de contraseña para mi cuenta
When reviso mi bandeja de correo
Then encuentro un email con asunto: "Restablecer contraseña - montiLibrary"
  And el email contiene un enlace seguro para crear una nueva contraseña
  And el enlace tiene una expiración de tiempo razonable (ej. 1 hora)
```

### AC-03: Reset para usuario inactivo

```gherkin
Given que soy un administrador
  And quiero enviar un reset de contraseña a un usuario con estado "Inactivo"
When presiono "Enviar reset de contraseña"
Then el sistema muestra una advertencia: "Este usuario está inactivo. El reset se enviará, pero no podrá iniciar sesión hasta que se reactive su cuenta."
  And el administrador puede decidir si continuar o cancelar
```

### AC-04: Error en el envío

```gherkin
Given que soy un administrador e intento enviar un reset de contraseña
When ocurre un error en el proceso (ej. servicio de email no disponible)
Then el sistema muestra un mensaje de error: "No se pudo enviar el enlace. Intenta nuevamente."
  And se registra el error para diagnóstico
```

---

## Notas de Referencia

- **API:** `supabase.auth.resetPasswordForEmail(email, { redirectTo: '...' })`
- **Redirect:** El enlace debe redirigir a una página donde el usuario pueda ingresar su nueva contraseña
- **Email:** Se utiliza el servicio de email de Supabase (SMTP configurado en el proyecto)
- **Testing:** Usar bandejas temporales como yopmail.com para verificar la funcionalidad

---

## Dependencias

- **US-08:** El listado de usuarios debe existir para acceder a esta acción
- **US-10:** Se puede acceder también desde la vista de edición de usuario

## Historias Relacionadas

- [US-08: Listar usuarios](./US-08_listar_usuarios.md) — acceso desde listado
- [US-10: Editar usuario](./US-10_editar_usuario.md) — acceso desde edición
- [US-02: Inicio de sesión](./US-02_inicio_sesion.md) — el usuario podrá iniciar sesión tras el reset
