----------------
Objetivo: Definir el alcance del backlog del mvp. Para esta primera versión.

Alcance: Gestión básica de usuarios (CRUD), Gestión básica del catálogo (CRUD), Consulta de libros.

Roles: Para esta versión contaremos con: lector, admin y visitante.
Lector: usuario normal que se registra, inicia sesión y consulta el catálogo.
Administrador: gestiona usuarios y catálogo (crear, editar, borrar).
Visitante: usuario no autenticado que debe autenticarse para acceder al catálogo.
----------------

# Historias de Autenticación
## US-01 Registro de usuario

Como visitante

Quiero registrarme con email y contraseña

Para poder acceder al sistema como lector

### Criterios de aceptación

- Formulario con email y contraseña valida la estructura del email y longitud mínima de contraseña.
- Al enviar, Supabase crea la cuenta y devuelve confirmación.
- Mensaje de error claro si el email ya existe o datos inválidos.

### Pruebas

- Registro exitoso con datos válidos.

- Intento de registro con email duplicado → error.

## US-02 Inicio de sesión

Como lector

Quiero iniciar sesión con email y contraseña

Para acceder al catálogo y funciones protegidas

### Criterios de aceptación

- Login usa Supabase y devuelve token JWT.

- Usuario autenticado redirige al catálogo.

- Mensaje de error para credenciales inválidas.

### Pruebas

- Login exitoso redirige a catálogo.

- Login con contraseña incorrecta muestra error.

## US-03 Cierre de sesión

Como lector

Quiero cerrar sesión

Para proteger mi cuenta en dispositivos compartidos

### Criterios de aceptación

- Al cerrar sesión se elimina token local y se redirige a la pantalla de login.

- Acceso a rutas protegidas tras logout redirige a login.

### Pruebas

- Logout invalida sesión y bloquea acceso a catálogo.

# Historias del Catálogo de Libros
## US-04 Ver listado de libros

Como lector

Quiero ver un listado paginado de libros

Para explorar el catálogo

### Criterios de aceptación

- Endpoint GET /books devuelve lista con título, autor, estado y portada.

- Interfaz muestra al menos 10 ítems por página y paginación funcional.

### Pruebas

- Carga inicial muestra libros; paginación funciona.

## US-05 Buscar libros por título o autor

Como lector

Quiero buscar por título o autor

Para encontrar libros rápidamente

### Criterios de aceptación

- Campo de búsqueda filtra resultados por coincidencia parcial en título o autor.

- Resultados vacíos muestran mensaje “No se encontraron resultados”.

### Pruebas

- Búsqueda por fragmento de título devuelve coincidencias.

## US-06 Ver detalle de libro

Como lector

Quiero ver la ficha de un libro con descripción completa

Para decidir si me interesa reservarlo en el futuro

### Criterios de aceptación

- Página de detalle muestra título, autor, año, género, sinopsis, estado y portada.

- Botón de acción (p. ej. reservar) aparece solo si corresponde (aunque reserva no implementada en este MVP ampliado).

### Pruebas

- Abrir detalle de un libro muestra todos los campos.

## US-07 Indicar disponibilidad

Como lector

Quiero ver claramente si un libro está disponible o reservado

Para no intentar acciones inválidas

### Criterios de aceptación

- Cada ítem en la lista y en el detalle muestra estado: Disponible o Reservado.

- Estilos visuales diferencian ambos estados.

### Pruebas

- Libros con estado reservado se muestran como no disponibles.

# Historias de Gestión de Usuarios (CRUD)
## US-08 Listar usuarios

Como administrador

Quiero ver un listado de usuarios registrados

Para gestionar cuentas y roles

### Criterios de aceptación

- Endpoint GET /admin/users devuelve lista con email, nombre, rol, estado (activo/inactivo).

- Interfaz permite paginar y buscar por email.

### Pruebas

- Admin ve lista completa; búsqueda por email funciona.

## US-09 Crear usuario

Como administrador

Quiero crear un usuario manualmente (email, rol)

Para añadir lectores o cuentas de prueba

### Criterios de aceptación

- Formulario crea usuario en Supabase con rol asignado.

- Validación de email y rol; mensaje de éxito al crear.

### Pruebas

- Crear usuario nuevo aparece en la lista; recibe email si se configura.

## US-10 Editar usuario

Como administrador

Quiero editar datos de un usuario (rol, estado, nombre)

Para corregir o actualizar permisos

### Criterios de aceptación

- Cambios se persisten en la base y se reflejan en la lista.

- No se muestra ni se edita la contraseña desde aquí (opcional: reset de contraseña).

### Pruebas

- Editar rol cambia permisos; usuario ve cambios tras nuevo login.

## US-11 Eliminar o desactivar usuario

Como administrador

Quiero desactivar o eliminar una cuenta

Para mantener la base de usuarios limpia y segura

### Criterios de aceptación

- Opción para desactivar (recomendado) y eliminar (irreversible) con confirmación.

- Usuarios desactivados no pueden iniciar sesión.

### Pruebas

- Desactivar impide login; eliminar remueve registro.

## US-12 Reset de contraseña por admin

Como administrador

Quiero forzar un reset de contraseña o enviar enlace de recuperación

Para ayudar a usuarios que no pueden acceder

### Criterios de aceptación

- Admin puede enviar enlace de recuperación vía Supabase o marcar reset.

- Usuario recibe instrucciones por email (si está configurado).

### Pruebas

- Solicitud de reset genera email de recuperación.

# Historias de Administración del Catálogo (CRUD)
## US-13 Listar libros para admin

Como administrador

Quiero ver y filtrar todos los libros del catálogo

Para gestionar inventario

### Criterios de aceptación

- Vista admin muestra todos los libros, incluidos los no visibles para usuarios.

### Pruebas

- Admin ve libros y filtros por estado.

## US-14 Crear libro

Como administrador

Quiero agregar un nuevo libro con metadatos y portada

Para ampliar el catálogo

### Criterios de aceptación

- Formulario con título, autor, año, género, descripción y subida de portada.

- Registro persiste en Supabase y portada en Storage.

### Pruebas

- Crear libro aparece en catálogo público si marcado como visible.

## US-15 Editar libro

Como administrador

Quiero editar los datos de un libro

Para corregir información o actualizar portada

### Criterios de aceptación

- Cambios se guardan y se reflejan en la vista pública.

### Pruebas

- Editar título y portada se actualiza en detalle público.

## US-16 Eliminar libro

Como administrador

Quiero eliminar un libro del catálogo

Para retirar títulos obsoletos o duplicados

### Criterios de aceptación

- Confirmación antes de eliminar; opción de marcar como inactivo en lugar de borrar.

### Pruebas

- Eliminado no aparece en catálogo público; storage de portada se limpia si corresponde.

# Acceso y Seguridad
## US-17 Acceso a rutas protegidas

Como visitante

Quiero ser redirigido al login si intento acceder a rutas protegidas

Para que solo usuarios autenticados vean el catálogo y panel admin

### Criterios de aceptación

- Middleware en frontend verifica token; rutas admin requieren rol admin en claims.

### Pruebas

- Acceso directo a /admin sin token redirige a login.

## US-18 Mensajes de error y feedback

Como usuario

Quiero recibir mensajes claros ante errores (login, validación, permisos)

Para entender qué corregir

### Criterios de aceptación

- Todos los errores visibles muestran texto amigable y no exponen detalles sensibles.

### Pruebas

- Error 401 muestra mensaje genérico; errores de validación muestran campos afectados.