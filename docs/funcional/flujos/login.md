# Flujo de Usuario: Login y Acceso al Sistema

## Descripción
Proceso completo desde que el usuario accede a la aplicación hasta que ingresa al dashboard principal.

## Diagrama de flujo

```
Usuario → Landing Page (/welcome)
  │
  ├── ¿Tiene sesión activa?
  │     ├── Sí → Redirigir a Dashboard (/)
  │     └── No → Mostrar Landing
  │
  ├── Hace clic en "Iniciar Sesión"
  │     └── → LoginView (/login)
  │
  ├── Introduce email + contraseña
  │     ├── ¿Credenciales válidas?
  │     │     ├── Sí → Guardar token → Obtener perfil → Dashboard (/)
  │     │     └── No → Mostrar error "Credenciales inválidas"
  │     │
  │     └── ¿Olvidó contraseña?
  │           └── → ForgotPassword (/forgot-password)
  │                 └── Introduce email → Recibe enlace → ResetPassword (/reset-password)
  │                       └── Nueva contraseña → Login
  │
  └── Hace clic en "Cerrar Sesión" (desde cualquier página protegida)
        └── Limpiar sesión → Landing Page (/welcome)
```

## Pasos detallados

### Flujo feliz
1. El usuario accede a `https://materiagris.app`
2. Ve la Landing Page con información del sistema
3. Hace clic en "Iniciar Sesión"
4. Introduce email y contraseña
5. El sistema valida contra la API
6. Guarda el token JWT en localStorage
7. Obtiene los datos del usuario (nombre, roles, permisos)
8. Redirige al Dashboard

### Flujo de error — Credenciales inválidas
1. Usuario introduce email o contraseña incorrectos
2. El sistema muestra: "Credenciales inválidas. Verifica tus datos."
3. El usuario puede intentar de nuevo

### Flujo de error — Sesión expirada
1. Usuario tiene una sesión activa pero el token ha expirado
2. Al hacer una petición a la API, el backend devuelve 401
3. El frontend intenta refrescar el token automáticamente
4. Si el refresco falla: limpia sesión y redirige a login

## Reglas de negocio aplicadas
- Sesión persistente en localStorage (no se pierde al recargar)
- Token se refresca automáticamente al expirar
- Usuario autenticado no puede acceder a `/login` ni `/welcome`
- Usuario no autenticado no puede acceder a rutas protegidas
