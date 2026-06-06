# Módulo de Autenticación

## Descripción
Gestiona el ciclo completo de autenticación de usuarios: inicio de sesión, landing público, recuperación y restablecimiento de contraseña. Sigue Clean Architecture con casos de uso separados y contenedores de DI.

## Pantallas

| Ruta | Vista | Acceso |
|------|-------|--------|
| `/welcome` | LandingPage.vue | Público |
| `/login` | LoginView.vue | Público |
| `/forgot-password` | ForgotPasswordPage.vue | Público |
| `/reset-password` | ResetPasswordPage.vue | Público |

## Componentes Relacionados

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| `AuthLayout.vue` | `modules/auth/presentation/components/` | Layout compartido: gradiente bg, logo, card blanca, footer oscuro |
| `LoginForm.vue` | `modules/auth/presentation/components/` | Formulario de login reutilizable |
| `AppSidebar.vue` | `shared/components/` | Menú de navegación (logout) |
| `TopBar.vue` | `shared/components/` | Avatar y menú de usuario |

## UI y Diseño

Las 3 páginas de autenticación (Login, ForgotPassword, ResetPassword) comparten el layout `AuthLayout.vue`:

- **Fondo**: Gradiente suave violeta→cyan (`rgba(124,58,237,0.10)` → `rgba(6,182,212,0.06)`)
- **Card**: Blanca, `rounded-2xl`, sombra sutil
- **Branding**: Logo `logo-materiagris.svg` + "MaterIA Gris" (link a `/welcome`)
- **Botones**: Violeta `#7c3aed` con glow shadow (consistente con landing)
- **Inputs**: `rounded-xl`, focus ring violeta
- **Footer**: Fondo oscuro `#0f0a1e`, texto `#9690a8`, links legales
- **Layout**: Una columna centrada, `max-w-md`

## Lógica de Estado

### Store: `useAuthStore` (`core/store/auth.js`)

| Propiedad/Acción | Tipo | Descripción |
|-----------------|------|-------------|
| `user` | `ref` | Usuario autenticado (roles, permisos). Persiste en localStorage |
| `fetchUser()` | async | Obtiene datos del usuario via `GET /api/me` |
| `clearUser()` | fn | Limpia usuario y token del store/localStorage |
| `hasPermission(slug)` | fn | Verifica permiso individual (soporta mapa, array, objetos) |
| `hasPermissions(slugs, mode)` | fn | Verifica múltiples permisos con modo `any`/`all` |

### Flujo de autenticación

```
LoginView
  → loginContainer.provideLoginUseCase()
    → LoginUseCase.execute(credentials)
      → AuthService.login(credentials)
        → ApiUserRepository.login(credentials) → POST /auth/login
        → LocalStorageGateway.saveToken(access_token)
      → AuthService.fetchUser()
        → ApiUserRepository.me() → GET /api/me
        → authStore.fetchUser()
```

### Guards de navegación (`core/router/index.js`)

- `beforeEach`: verifica existencia de `access_token` en localStorage
- Si no hay token y la ruta requiere auth → redirige a `/login`
- Si hay token pero no hay usuario → llama `authStore.fetchUser()`
- Si hay token y la ruta es pública (login, welcome) → redirige a `/`

### Casos de Uso (Domain)

| Use Case | Método | Propósito |
|----------|--------|-----------|
| `LoginUseCase` | `execute(credentials)` | Autenticar usuario, guardar token, cargar perfil |
| `ForgotPasswordUseCase` | `execute(email)` | Enviar solicitud de recuperación |
| `ResetPasswordUseCase` | `execute(token, password)` | Restablecer contraseña |

### Servicios de Dominio

| Servicio | Propósito |
|----------|-----------|
| `AuthService` | Coordina login, refresh, logout. Recibe `userRepository` por DI |
| `StorageGateway` | Interfaz abstracta para persistencia (tokens) |

### Infraestructura

| Clase | Propósito |
|-------|-----------|
| `ApiUserRepository` | Implementación HTTP (`login`, `me`, `refresh`, `logout`) |
| `LocalStorageGateway` | Persistencia en localStorage (`getToken`, `saveToken`, `clearToken`) |

### Contenedores (DI)

| Contenedor | Exporta |
|------------|---------|
| `authContainer.js` | `provideAuthService()` |
| `loginContainer.js` | `provideLoginUseCase()` |
| `forgotContainer.js` | `provideForgotUseCase()` |
| `resetContainer.js` | `provideResetPasswordUseCase()` |

## Estado de Desarrollo
✅ Completado. Flujo funcional: login, logout, refresh token, recuperación de contraseña.
⚠️ Observación: `LoginView.vue` crea su propio `AuthService` via `provideAuthService()` en lugar de reutilizar el ya creado en `main.js` (inyectado via serviceRegistry). Posible duplicación a refactorizar.

## Pendientes (Roadmap)

- [ ] Refactorizar `LoginView.vue` para reutilizar `AuthService` del `serviceRegistry`
- [ ] Agregar pantalla de registro de nuevos usuarios (sign-up)
- [ ] Implementar cierre de sesión en todos los dispositivos
- [ ] Agregar notificación visual en recover/reset password (estado de éxito/error)
- [ ] Tests unitarios para `AuthService`, `LoginUseCase`, stores
