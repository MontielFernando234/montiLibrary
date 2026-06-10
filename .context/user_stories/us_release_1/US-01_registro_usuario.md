# US-01: Registro de Usuario

> **Épica:** Autenticación de Usuarios  
> **Prioridad:** Must Have  
> **Estimación:** 5 Story Points  
> **Sprint:** 1

---

## Descripción

**Como** visitante,  
**Quiero** registrarme proporcionando mi nombre, apellido, email y contraseña,  
**Para** poder acceder al sistema como lector y consultar el catálogo de libros.

---

## Contexto de Usuario

- **Rol:** Visitante (usuario no autenticado)
- **Objetivo:** Crear una cuenta personal en la plataforma
- **Momento de uso:** Primera interacción con el sistema, cuando desea acceder al catálogo
- **Frecuencia:** Una sola vez por usuario

---

## Campos del Formulario

| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| Nombre | texto | ✅ Sí | Mínimo 2 caracteres, solo letras y espacios |
| Apellido | texto | ✅ Sí | Mínimo 2 caracteres, solo letras y espacios |
| Email | email | ✅ Sí | Formato válido de email (RFC 5322) |
| Contraseña | password | ✅ Sí | Mínimo 8 caracteres, al menos 1 mayúscula, 1 número |
| Confirmar contraseña | password | ✅ Sí | Debe coincidir con contraseña |
| Fecha de nacimiento | date | ❌ No | Fecha válida, no futura |
| Dirección | texto | ❌ No | Máximo 200 caracteres |

---

## Criterios de Aceptación

### AC-01: Registro exitoso con datos válidos

```gherkin
Given que soy un visitante en la página de registro
  And he completado todos los campos obligatorios con datos válidos
  And las contraseñas coinciden
When presiono el botón "Registrarme"
Then el sistema crea mi cuenta en Supabase Auth
  And se crea mi perfil en la tabla "profiles" con rol "reader"
  And se envía un email de confirmación a la dirección proporcionada
  And veo un mensaje indicando que revise su email para confirmar la cuenta
```

### AC-02: Validación de email duplicado

```gherkin
Given que soy un visitante en la página de registro
  And he ingresado un email que ya está registrado en el sistema
When presiono el botón "Registrarme"
Then el sistema muestra un mensaje de error: "Este email ya se encuentra registrado"
  And no se crea una cuenta duplicada
  And los datos del formulario se mantienen (excepto contraseña)
```

### AC-03: Validación de campos obligatorios

```gherkin
Given que soy un visitante en la página de registro
  And he dejado uno o más campos obligatorios vacíos
When presiono el botón "Registrarme"
Then el sistema resalta los campos faltantes con un indicador visual de error
  And muestra un mensaje específico por cada campo: "Este campo es obligatorio"
  And no se envía la solicitud al servidor
```

### AC-04: Validación de formato de email

```gherkin
Given que soy un visitante en la página de registro
  And he ingresado un email con formato inválido (ej. "usuario@", "usuario.com")
When el campo de email pierde el foco o presiono "Registrarme"
Then el sistema muestra un mensaje: "Ingresa un email válido"
  And el campo se marca visualmente como inválido
```

### AC-05: Validación de contraseña segura

```gherkin
Given que soy un visitante en la página de registro
  And he ingresado una contraseña que no cumple los requisitos mínimos
When el campo de contraseña pierde el foco
Then el sistema muestra los requisitos no cumplidos:
  | Requisito | Estado |
  | Mínimo 8 caracteres | ✅/❌ |
  | Al menos 1 mayúscula | ✅/❌ |
  | Al menos 1 número | ✅/❌ |
```

### AC-06: Confirmación de contraseña no coincide

```gherkin
Given que soy un visitante en la página de registro
  And he ingresado contraseñas diferentes en "Contraseña" y "Confirmar contraseña"
When el campo "Confirmar contraseña" pierde el foco
Then el sistema muestra: "Las contraseñas no coinciden"
  And el botón "Registrarme" permanece deshabilitado
```

### AC-07: Navegación a login

```gherkin
Given que soy un visitante en la página de registro
  And ya tengo una cuenta
When hago clic en el enlace "¿Ya tienes cuenta? Inicia sesión"
Then soy redirigido a la página de inicio de sesión
```

---

## Notas de Referencia

- **Autenticación:** Se usa `supabase.auth.signUp()` con `email`, `password` y `user_metadata` (first_name, last_name)
- **Perfil:** Un trigger en la base de datos crea automáticamente el registro en `profiles` al registrarse un usuario
- **Confirmación de email:** Habilitada — el usuario debe confirmar su email antes de poder iniciar sesión
- **Rol por defecto:** `reader`

---

## Dependencias

- Ninguna — es la primera historia del flujo de autenticación

## Historias Relacionadas

- [US-02: Inicio de sesión](./US-02_inicio_sesion.md) — flujo posterior al registro
- [US-18: Mensajes de error](./US-18_mensajes_error.md) — estándares de mensajes de error
