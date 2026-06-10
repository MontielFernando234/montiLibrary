# US-02: Inicio de Sesión

> **Épica:** Autenticación de Usuarios  
> **Prioridad:** Must Have  
> **Estimación:** 3 Story Points  
> **Sprint:** 1

---

## Descripción

**Como** lector registrado,  
**Quiero** iniciar sesión con mi email y contraseña,  
**Para** acceder al catálogo de libros y a las funciones protegidas del sistema.

---

## Contexto de Usuario

- **Rol:** Lector (usuario registrado con email confirmado)
- **Objetivo:** Autenticarse para acceder a las funcionalidades del sistema
- **Momento de uso:** Cada vez que el usuario necesita acceder al sistema
- **Frecuencia:** Múltiples veces (cada sesión)

---

## Campos del Formulario

| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| Email | email | ✅ Sí | Formato válido de email |
| Contraseña | password | ✅ Sí | No vacío |

---

## Criterios de Aceptación

### AC-01: Login exitoso como lector

```gherkin
Given que soy un lector registrado con email confirmado
  And estoy en la página de inicio de sesión
  And he ingresado mi email y contraseña correctos
When presiono el botón "Iniciar sesión"
Then el sistema me autentica exitosamente vía Supabase Auth
  And recibo un token JWT válido almacenado en la sesión del navegador
  And soy redirigido a la página del catálogo de libros
```

### AC-02: Login exitoso como administrador

```gherkin
Given que soy un administrador registrado con email confirmado
  And estoy en la página de inicio de sesión
  And he ingresado mi email y contraseña correctos
When presiono el botón "Iniciar sesión"
Then el sistema me autentica exitosamente
  And soy redirigido al panel de administración
  And tengo acceso tanto al catálogo como a las funciones de gestión
```

### AC-03: Credenciales inválidas

```gherkin
Given que estoy en la página de inicio de sesión
  And he ingresado un email o contraseña incorrectos
When presiono el botón "Iniciar sesión"
Then el sistema muestra un mensaje genérico: "Email o contraseña incorrectos"
  And no se revela si el email existe o no en el sistema
  And el campo de contraseña se limpia
  And permanezco en la página de login
```

### AC-04: Email no confirmado

```gherkin
Given que me registré pero no he confirmado mi email
  And estoy en la página de inicio de sesión
  And he ingresado mi email y contraseña correctos
When presiono el botón "Iniciar sesión"
Then el sistema muestra: "Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada."
  And se ofrece la opción de reenviar el email de confirmación
```

### AC-05: Usuario desactivado

```gherkin
Given que mi cuenta ha sido desactivada por un administrador
  And estoy en la página de inicio de sesión
  And he ingresado mi email y contraseña correctos
When presiono el botón "Iniciar sesión"
Then el sistema muestra: "Tu cuenta ha sido desactivada. Contacta al administrador."
  And no se permite el acceso al sistema
```

### AC-06: Campos vacíos

```gherkin
Given que estoy en la página de inicio de sesión
  And he dejado el campo de email o contraseña vacío
When presiono el botón "Iniciar sesión"
Then el sistema resalta los campos vacíos con indicador visual de error
  And muestra: "Este campo es obligatorio"
  And no se envía la solicitud al servidor
```

### AC-07: Navegación a registro

```gherkin
Given que estoy en la página de inicio de sesión
  And no tengo una cuenta
When hago clic en el enlace "¿No tienes cuenta? Regístrate"
Then soy redirigido a la página de registro
```

---

## Notas de Referencia

- **Autenticación:** Se usa `supabase.auth.signInWithPassword()` con `email` y `password`
- **Token JWT:** Supabase gestiona automáticamente el token y su refresh
- **Verificación de estado activo:** Tras autenticación exitosa, se consulta `profiles.is_active`. Si es `false`, se cierra la sesión inmediatamente
- **Redirección por rol:** Se consulta `profiles.role` para decidir la ruta de destino (catálogo vs admin)

---

## Dependencias

- **US-01:** El usuario debe haberse registrado previamente
- **US-17:** Las rutas protegidas redirigen aquí cuando no hay sesión activa

## Historias Relacionadas

- [US-01: Registro de usuario](./US-01_registro_usuario.md) — flujo previo
- [US-03: Cierre de sesión](./US-03_cierre_sesion.md) — flujo complementario
- [US-17: Rutas protegidas](./US-17_rutas_protegidas.md) — redirección al login
