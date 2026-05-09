# Módulo Funcional: Autenticación

## Propósito de Negocio
Permitir el acceso seguro al sistema solo a usuarios autorizados, garantizando que cada profesional acceda a la información que le corresponde según su rol.

## Actores
- Médico
- Administrador
- Recepcionista (futuro)

## Funcionalidades
| Funcionalidad | Estado |
|--------------|--------|
| Inicio de sesión con email y contraseña | ✅ Implementado |
| Recuperación de contraseña (solicitud) | ✅ Implementado |
| Restablecimiento de contraseña | ✅ Implementado |
| Cierre de sesión | ✅ Implementado |
| Refresco automático de token | ✅ Implementado |
| Redirección post-login según rol | ✅ Implementado |
| Registro de nuevos usuarios (auto-registro) | ❌ Planificado |

## Criterios de Aceptación
- El usuario debe poder iniciar sesión con email y contraseña válidos
- Si las credenciales son incorrectas, debe mostrar un mensaje de error claro
- Si el usuario ya está autenticado y accede a `/login`, debe redirigirse al dashboard
- Si el usuario no está autenticado e intenta acceder a una ruta protegida, debe redirigirse a `/login`
- La sesión debe mantenerse al recargar la página (persistencia de token)
- Al cerrar sesión, deben limpiarse todos los datos de sesión

## Reglas de Negocio
- El sistema no permite el auto-registro; los usuarios son creados por un administrador
- El token de acceso tiene una caducidad definida (configurada en backend)
- Si el token expira, se intenta un refresco automático; si falla, se redirige a login
- La recuperación de contraseña requiere acceso al email registrado

## Flujo Principal
1. Usuario accede a la aplicación → ve la Landing Page (`/welcome`)
2. Hace clic en "Iniciar Sesión" → navega a `/login`
3. Introduce email y contraseña
4. Sistema valida credenciales contra la API
5. Si son correctas: guarda el token, obtiene datos del usuario, redirige a Dashboard (`/`)
6. Si son incorrectas: muestra mensaje de error

## Flujo Alternativo — Recuperación de Contraseña
1. En la pantalla de login, el usuario hace clic en "¿Olvidaste tu contraseña?"
2. Introduce su email
3. El sistema envía un enlace de restablecimiento al email
4. El usuario accede al enlace y establece una nueva contraseña

## Dependencias
- API REST de autenticación (`POST /auth/login`, `POST /auth/refresh`, etc.)
- Servicio de correo para recuperación de contraseña

## Estado
✅ **Implementado.** Login, logout, refresh token, recuperación y restablecimiento funcionales.

## Pendientes (Roadmap)
- [ ] Añadir autenticación con terceros (Google, Microsoft)
- [ ] Auto-registro de nuevos usuarios (con invitación)
- [ ] Notificar al usuario cuando su sesión esté por expirar
- [ ] Historial de inicios de sesión
