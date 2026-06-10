# US-18: Mensajes de Error y Feedback

> **Épica:** Acceso y Seguridad  
> **Prioridad:** Must Have  
> **Estimación:** 3 Story Points  
> **Sprint:** 1

---

## Descripción

**Como** usuario del sistema (visitante, lector o administrador),  
**Quiero** recibir mensajes claros y amigables ante cualquier error o acción del sistema,  
**Para** entender qué salió mal, qué debo corregir, y no sentirme perdido ni frustrado.

---

## Contexto de Usuario

- **Rol:** Todos los usuarios del sistema
- **Objetivo:** Recibir feedback comprensible y accionable ante errores o acciones del sistema
- **Momento de uso:** En cualquier interacción que genere un resultado (éxito, error, advertencia)
- **Frecuencia:** Constante

---

## Tipos de Mensajes

| Tipo | Color/Estilo | Ícono | Duración | Ejemplo |
|------|-------------|-------|----------|---------|
| **Éxito** | Verde | ✅ | 3 segundos (auto-dismiss) | "Usuario creado correctamente" |
| **Error** | Rojo | ❌ | Hasta que el usuario cierre | "Email o contraseña incorrectos" |
| **Advertencia** | Amarillo | ⚠️ | Hasta que el usuario cierre | "Tu sesión expirará pronto" |
| **Información** | Azul | ℹ️ | 5 segundos (auto-dismiss) | "Revisa tu email para confirmar la cuenta" |

---

## Criterios de Aceptación

### AC-01: Errores de autenticación son genéricos

```gherkin
Given que un usuario intenta iniciar sesión con credenciales incorrectas
When el servidor responde con error 401
Then el sistema muestra un mensaje genérico: "Email o contraseña incorrectos"
  And no se revela información sobre si el email existe o no en el sistema
  And no se muestran detalles técnicos del error (ej. stack trace, códigos internos)
```

### AC-02: Errores de validación son específicos por campo

```gherkin
Given que un usuario envía un formulario con datos inválidos
When el sistema detecta campos con errores de validación
Then se muestran mensajes específicos junto a cada campo afectado:
  | Campo | Error | Mensaje |
  | Email | Formato inválido | "Ingresa un email válido" |
  | Contraseña | Muy corta | "La contraseña debe tener al menos 8 caracteres" |
  | Nombre | Vacío | "Este campo es obligatorio" |
  And los campos con error se resaltan visualmente (borde rojo, ícono de error)
  And el primer campo con error recibe el foco automáticamente
```

### AC-03: Errores de permisos

```gherkin
Given que un usuario intenta acceder a una funcionalidad sin los permisos necesarios
When el servidor responde con error 403
Then el sistema muestra: "No tienes permisos para realizar esta acción"
  And no se muestran detalles sobre los permisos requeridos
  And el usuario es redirigido a una página apropiada según su rol
```

### AC-04: Errores de servidor

```gherkin
Given que ocurre un error inesperado en el servidor (500, timeout, red)
When el sistema no puede completar la operación solicitada
Then el sistema muestra: "Ocurrió un error inesperado. Intenta nuevamente en unos momentos."
  And se ofrece un botón "Reintentar" si la acción es repetible
  And no se muestran mensajes técnicos al usuario
  And el error se registra en la consola del navegador para diagnóstico
```

### AC-05: Feedback de acciones exitosas

```gherkin
Given que un usuario o administrador completa una acción exitosamente
When la operación se ejecuta correctamente
Then el sistema muestra una notificación de éxito (toast notification):
  | Acción | Mensaje |
  | Registro | "Cuenta creada. Revisa tu email para confirmar." |
  | Login | Redirección silenciosa (sin mensaje) |
  | Logout | "Sesión cerrada correctamente" |
  | Crear usuario | "Usuario creado correctamente" |
  | Editar usuario | "Usuario actualizado correctamente" |
  | Desactivar | "Usuario desactivado correctamente" |
  | Eliminar | "Usuario eliminado permanentemente" |
  | Reset password | "Enlace de recuperación enviado" |
  And la notificación desaparece automáticamente tras 3 segundos
  And el usuario puede cerrarla manualmente antes
```

### AC-06: Accesibilidad de mensajes

```gherkin
Given que el sistema muestra un mensaje de error o éxito
When un usuario con lector de pantalla interactúa con la aplicación
Then los mensajes se anuncian automáticamente (usando aria-live="polite")
  And los campos con error tienen aria-invalid="true" y aria-describedby apuntando al mensaje
  And los mensajes de éxito usan role="status"
  And los mensajes de error usan role="alert"
```

---

## Catálogo de Mensajes de Error

| Código | Contexto | Mensaje al Usuario |
|--------|----------|-------------------|
| 401 | Login | "Email o contraseña incorrectos" |
| 401 | Sesión expirada | "Tu sesión ha expirado. Inicia sesión nuevamente." |
| 403 | Acceso denegado | "No tienes permisos para acceder a esta sección" |
| 409 | Email duplicado | "Este email ya se encuentra registrado" |
| 422 | Validación | Mensajes específicos por campo |
| 500 | Error servidor | "Ocurrió un error inesperado. Intenta nuevamente." |
| Network | Sin conexión | "No se pudo conectar con el servidor. Verifica tu conexión." |

---

## Notas de Referencia

- **Componente:** Implementar un componente reutilizable `<Toast>` o `<Notification>` global
- **Estado global:** Usar un context o store para gestionar las notificaciones desde cualquier parte de la app
- **Seguridad:** NUNCA exponer detalles técnicos, stack traces, nombres de tablas o columnas al usuario final
- **i18n-ready:** Centralizar todos los mensajes en un archivo de constantes para facilitar futura internacionalización

---

## Dependencias

- Ninguna directa — es una historia transversal que afecta a todas las demás

## Historias Relacionadas

- Todas las historias de autenticación y gestión de usuarios utilizan estos patrones de feedback
- [US-17: Rutas protegidas](./US-17_rutas_protegidas.md) — mensajes de acceso denegado
