# Clean Architecture — MateriaGris Frontend

## Capas

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                          │
│    pages / components / composables                      │
│  (Vue SFC, refs, eventos, templates)                    │
│                     │                                    │
│                     ▼                                    │
├─────────────────────────────────────────────────────────┤
│                   APPLICATION                            │
│    containers / provideX()                               │
│  (fábricas de dependencias, wiring)                      │
│                     │                                    │
│                     ▼                                    │
├─────────────────────────────────────────────────────────┤
│                     DOMAIN                               │
│    entities / repositories (interfaces)                  │
│    use-cases / services                                  │
│  (lógica pura, sin imports de infraestructura)           │
│                     │                                    │
│                     ▼                                    │
├─────────────────────────────────────────────────────────┤
│                 INFRASTRUCTURE                           │
│    Api*Repository / LocalStorageGateway                  │
│  (fetchClient, localStorage, implementaciones)           │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                      CORE                                │
│    httpClient / router / store / serviceRegistry         │
│  (infraestructura global, DI)                            │
└─────────────────────────────────────────────────────────┘
```

## Reglas de dependencia

- **DOMAIN** → NO importa nada de infrastructure, application, presentation ni core
- **INFRASTRUCTURE** → importa DOMAIN (implementa interfaces)
- **APPLICATION** → importa DOMAIN + INFRASTRUCTURE (wiring)
- **PRESENTATION** → importa APPLICATION (via containers) y CORE (store/router)
- **CORE** → NO importa ningún módulo. Solo recibe dependencias vía `serviceRegistry`
- **SHARED** → NO importa ningún módulo. Solo componentes/composables reutilizables

## Estructura de un módulo

```
modules/<feature>/
  domain/
    entities/           # Objetos de negocio (User, Role, Patient...)
    repositories/       # Interfaces abstractas (contratos)
    use-cases/          # Casos de uso (lógica de aplicación)
    services/           # Servicios de dominio (AuthService, etc.)
  infrastructure/
    Api*Repository.js   # Implementación con fetchClient
  application/
    containers/         # Fábricas provideX() para DI
  presentation/
    components/         # Componentes Vue del módulo
    composables/        # Estado reactivo local
    pages/              # Páginas/vistas (montadas en router)
```

## Flujo de datos

### Petición típica (ej: listar usuarios)

```
                    ┌─────────────┐
                    │  UsersPage  │  (presentation/page)
                    └──────┬──────┘
                           │ importa
                           ▼
                    ┌──────────────┐
                    │   useUsers   │  (presentation/composable)
                    └──────┬───────┘
                           │ llama
                           ▼
                    ┌──────────────────┐
                    │ usersContainer   │  (application/container)
                    │ provideX()       │
                    └──────┬───────────┘
                           │ crea
                           ▼
                    ┌──────────────────┐
                    │ GetAllUsers      │  (domain/use-case)
                    │ UseCase          │
                    └──────┬───────────┘
                           │ ejecuta
                           ▼
                    ┌──────────────────┐
                    │ ApiAdminUser     │  (infrastructure/repo)
                    │ Repository       │
                    └──────┬───────────┘
                           │ llama
                           ▼
                    ┌──────────────────┐
                    │   fetchClient    │  (core/api/httpClient)
                    │   GET /admin/    │
                    │   users          │
                    └──────┬───────────┘
                           │ fetch()
                           ▼
                       ┌─────────┐
                       │  API    │  (backend)
                       │  HTTP   │
                       └─────────┘
```

### Login

```
                    ┌──────────────┐
                    │  LoginView   │  (presentation/page)
                    └──────┬───────┘
                           │ llama
                           ▼
                    ┌──────────────────┐
                    │  authContainer   │  (application/container)
                    │  provideAuth     │
                    │  Service()       │
                    └──────┬───────────┘
                           │ crea
                           ▼
                    ┌──────────────────┐
                    │   AuthService    │  (domain/service)
                    │   login(creds)   │
                    └──────┬───────────┘
                           │ llama repo
                           ▼
                    ┌──────────────────┐
                    │  ApiUserRepo     │  (infrastructure)
                    │  .login()        │
                    └──────┬───────────┘
                           │ fetchClient
                           ▼
                    ┌──────────────┐
                    │  POST        │
                    │  /auth/login │
                    └──────────────┘
                           │
                           ▼ (response con access_token)
                    ┌──────────────────┐
                    │ AuthService      │
                    │ guarda token     │
                    │ via Storage      │
                    │ Gateway          │  (infrastructure)
                    └──────────────────┘
```

## Inyección de dependencias (DI)

```
                   ┌──────────┐
                   │ main.js  │  ← composition root
                   └────┬─────┘
                        │ crea e inyecta
          ┌─────────────┼─────────────────┐
          │             │                 │
          ▼             ▼                 ▼
   ┌────────────┐ ┌───────────┐ ┌──────────────────┐
   │ setToken   │ │ setAuth   │ │ setStorage        │
   │ Getter()   │ │ Service() │ │ Gateway()         │
   └────────────┘ └───────────┘ └──────────────────┘
          │             │                 │
          ▼             ▼                 ▼
   ┌────────────┐ ┌───────────┐ ┌──────────────────┐
   │ httpClient │ │ AppSidebar│ │ authStore        │
   │            │ │ (logout)  │ │ (user,           │
   │            │ │           │ │  fetchUser,       │
   │            │ │           │ │  clearUser)       │
   └────────────┘ └───────────┘ └──────────────────┘
```

`serviceRegistry.js` en `core/services/` provee setters/getters globales.
`main.js` registra los servicios. El resto del código los consume via getters.

## Mapa de módulos vs capas

| Módulo | Entities | Repo Interface | Use Cases | Infrastructure | Containers | Presentación |
|---|---|---|---|---|---|---|
| auth | User, Credentials | UserRepository | LoginUseCase, ForgotPasswordUseCase, ResetPasswordUseCase | ApiUserRepository | authContainer, loginContainer, forgotContainer, resetContainer | LoginView, ForgotPasswordPage, ResetPasswordPage, LandingPage |
| admin/users | User | UserRepository | GetAllUsersUseCase, CreateUserUseCase, UpdateUserUseCase, DeleteUserUseCase | ApiAdminUserRepository | usersContainer | UsersPage, EditUserModal, ChangePasswordModal, AddressesModal |
| admin/roles | Role | RoleRepository | GetRolesUseCase, GetRoleUseCase, CreateRoleUseCase, UpdateRoleUseCase, DeleteRoleUseCase | ApiRoleRepository | rolesContainer | RolesPage, RolePermissionsEditor, PermissionCategoryNode |
| admin/permissions | Permission | PermissionRepository | GetAllPermissionsUseCase | ApiPermissionRepository | permissionsContainer | PermissionsPage |
| patients | Patient | PatientRepository | SearchPatientsUseCase, CreatePatientUseCase, UpdatePatientUseCase | ApiPatientRepository | patientsContainer | PatientsPage |
| dashboard | — | — | — | — | — | DashboardPage, HeroCard, PatientList, ConsultationPanel, RightPanel |

## Alias `@`

```
@/  →  src/
```

Usar siempre `@/` en imports, nunca rutas relativas profundas.

## Core

| Archivo | Propósito |
|---|---|
| `core/api/httpClient.js` | fetchClient(), setTokenGetter(), setUnauthorizedHandler() |
| `core/config/env.js` | API_BASE desde VITE_API_BASE_URL |
| `core/router/index.js` | Rutas lazy-loaded + guards |
| `core/store/auth.js` | Pinia store: user, fetchUser, clearUser, hasPermission |
| `core/services/serviceRegistry.js` | DI container: setAuthService, getAuthService, setStorageGateway, getStorageGateway |

## Comandos

```bash
npm run dev       # dev server localhost:5173
npm run build     # build producción en dist/
npm run test      # vitest (79 tests)
npm run test:e2e  # playwright
npm run lint      # eslint
```
