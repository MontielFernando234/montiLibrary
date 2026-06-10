# US-03: Cierre de Sesión

> **Épica:** Autenticación de Usuarios  
> **Prioridad:** Must Have  
> **Estimación:** 2 Story Points  
> **Sprint:** 1

---

## Descripción

**Como** lector autenticado,  
**Quiero** cerrar mi sesión de forma segura,  
**Para** proteger mi cuenta cuando uso dispositivos compartidos o públicos.

---

## Contexto de Usuario

- **Rol:** Lector o Administrador (cualquier usuario autenticado)
- **Objetivo:** Terminar la sesión activa de forma segura
- **Momento de uso:** Al finalizar el uso de la plataforma o cambiar de cuenta
- **Frecuencia:** Al final de cada sesión

---

## Criterios de Aceptación

### AC-01: Logout exitoso

```gherkin
Given que soy un usuario autenticado (lector o administrador)
  And estoy en cualquier página del sistema
When presiono el botón "Cerrar sesión" visible en la navegación
Then el sistema elimina el token JWT del almacenamiento local del navegador
  And la sesión de Supabase Auth se invalida
  And soy redirigido a la página de inicio de sesión
  And veo un mensaje breve: "Sesión cerrada correctamente"
```

### AC-02: Acceso bloqueado tras logout

```gherkin
Given que he cerrado sesión exitosamente
When intento acceder directamente a una ruta protegida (ej. /catalogo, /admin/users)
Then el sistema detecta que no hay sesión activa
  And soy redirigido automáticamente a la página de login
  And no puedo ver ningún contenido protegido
```

### AC-03: Botón de logout siempre visible

```gherkin
Given que soy un usuario autenticado
When navego por cualquier sección del sistema
Then el botón "Cerrar sesión" está siempre visible en el header o menú de navegación
  And es fácilmente identificable con un icono y/o texto descriptivo
```

### AC-04: Sesión no persiste tras cerrar navegador (opcional)

```gherkin
Given que he cerrado el navegador sin hacer logout explícito
When vuelvo a abrir la aplicación
Then el sistema verifica si el token sigue siendo válido
  And si el token expiró, me redirige al login
  And si el token sigue vigente, me permite continuar navegando
```

---

## Notas de Referencia

- **Logout:** Se usa `supabase.auth.signOut()` para invalidar la sesión
- **Limpieza local:** Asegurar que `localStorage` y estado de React (AuthContext) se limpien completamente
- **UX:** El botón debe estar accesible sin necesidad de abrir menús adicionales en desktop

---

## Dependencias

- **US-02:** El usuario debe haber iniciado sesión previamente
- **US-17:** Funciona en conjunto con la protección de rutas

## Historias Relacionadas

- [US-02: Inicio de sesión](./US-02_inicio_sesion.md) — flujo previo
- [US-17: Rutas protegidas](./US-17_rutas_protegidas.md) — redireccionamiento post-logout
