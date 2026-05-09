---
name: materiagris-frontend
description: "Flujo de trabajo del frontend Vue para Materiagris. Úsalo al trabajar con la app frontend independiente, componentes Vue, configuración Vite, problemas de HMR, comportamiento de UI/UX cliente, estilos con Tailwind o al decidir si un cambio visual pertenece a frontend/ o a backend/resources/."
argument-hint: "Tarea de frontend en Vue, Vite, componentes, Tailwind o UI/UX cliente"
user-invocable: true
---

# Frontend de Materiagris

Usa esta skill para trabajo del lado cliente en la aplicación Vue independiente.

Tailwind debe tratarse como la opción preferente para estilos en tareas de frontend, siempre que la superficie afectada lo tenga integrado.

## Cuándo Usarla

- La tarea toca `frontend/src/`.
- El usuario pide trabajo sobre componentes Vue.
- El usuario pregunta por Vite, HMR o exposición de puertos del frontend.
- La tarea es visual o interactiva y pertenece a la app independiente.
- Necesitas distinguir entre la SPA independiente y los assets gestionados por Laravel.
- La tarea requiere estilos, layout o refinamiento visual con Tailwind.

## Archivos y Áreas Clave

- `frontend/src/App.vue`
- `frontend/src/main.js`
- `frontend/src/style.css`
- `frontend/vite.config.js`
- `frontend/package.json`

## Arquitectura: Módulos por Feature

El frontend usa una **arquitectura por feature** con tres zonas:

### `frontend/src/modules/` — Lógica de negocio por dominio

Cada módulo sigue la estructura interna:

```
modules/<feature>/
  domain/
    entities/          # Entidades de negocio
    repositories/      # Interfaces (contratos) de repositorio
    use-cases/         # Casos de uso (reciben repositorio por DI)
    services/          # Domain services (opcional)
  infrastructure/      # Implementaciones concretas de repositorios
  application/
    containers/        # Fábricas de dependencias (provideX())
  presentation/
    components/        # Componentes Vue específicos del módulo
    composables/       # Estado reactivo local del módulo
    pages/             # Páginas/vistas Vue (montadas en el router)
```

**Módulos actuales:**
- `modules/auth/` — login, forgot password, reset password, AuthService, ApiUserRepository
- `modules/patients/` — búsqueda y creación de pacientes
- `modules/admin/users/` — listado de usuarios y gestión (solo frontend, sin persistencia real)
- `modules/dashboard/` — AppSidebar, TopBar, DashboardPage y paneles

### `frontend/src/core/` — Infraestructura global

| Archivo | Propósito |
|---|---|
| `core/config/env.js` | `API_BASE` — URL base de la API |
| `core/api/httpClient.js` | `fetchClient()`, `setUnauthorizedHandler()` — cliente HTTP con JWT |
| `core/store/auth.js` | Store Pinia `useAuthStore` — reemplaza al antiguo `useUser` composable |
| `core/router/index.js` | Definición de rutas, guards de navegación |

### `frontend/src/shared/` — Código reutilizable sin lógica de negocio

| Ruta | Contenido |
|---|---|
| `shared/repositories/UserRepository.js` | Interfaz abstracta para el repositorio de usuario (usada por auth y admin/users) |
| `shared/types/index.js` | Tipos comunes (`Credentials`, etc.) |
| `shared/composables/useToast.js` | Estado reactivo del sistema de notificaciones |
| `shared/plugins/toastPlugin.js` | Plugin Vue para el toast global |
| `shared/components/` | `Breadcrumb.vue`, `Modal.vue`, `Toast.vue`, `ToggleSwitch.vue`, `UiDataTable.vue` |

## Alias `@`

El alias `@` apunta a `frontend/src/`. Está configurado en `vite.config.js` y `vitest.config.js`.  
**Usa siempre `@/...` en imports** en lugar de rutas relativas profundas.

```js
// ✅ Correcto
import { fetchClient } from '@/core/api/httpClient'
import Modal from '@/shared/components/Modal.vue'

// ❌ Evitar
import { fetchClient } from '../../../core/api/httpClient'
```

## Inventario de Contenedores

Cada módulo tiene sus propios contenedores en `application/containers/`:

| Contenedor | Función exportada |
|---|---|
| `modules/auth/application/containers/authContainer.js` | `provideAuthService()` |
| `modules/auth/application/containers/loginContainer.js` | `provideLoginUseCase()` |
| `modules/auth/application/containers/forgotContainer.js` | `provideForgotUseCase()` |
| `modules/auth/application/containers/resetContainer.js` | `provideResetPasswordUseCase()` |
| `modules/admin/users/application/containers/usersContainer.js` | `provideGetAllUsersUseCase()` |
| `modules/patients/application/containers/patientsContainer.js` | `provideSearchPatientsUseCase()`, `provideCreatePatientUseCase()` |

## Notas Actuales del Frontend

- El frontend es una aplicación Vue 3 + Pinia.
- Tailwind debe ser la primera opción para resolver estilos de interfaz cuando esté disponible.
- Vite está configurado para escuchar en `0.0.0.0` por el puerto `5173`.
- HMR está configurado con host `materiagris.local`.
- El servicio Docker `node` ejecuta `npm install` y arranca el servidor Vite.

## Componentes compartidos

Los componentes de interfaz reutilizables viven en `frontend/src/shared/components/`. Entre ellos se incluyen `AppSidebar.vue` y `TopBar.vue`, que deben importarse desde `@/shared/components/` cuando se usan en varias páginas o módulos.

## Arquitectura y Convenciones

### HTTP client
- **Usa siempre `fetchClient` de `@/core/api/httpClient.js`** en los repositorios de infraestructura.
- **Nunca uses axios** en repositorios nuevos.
- **Nunca importes `fetchClient` directamente desde una página o componente Vue**; delega a través de un repositorio y su use case.

### Inversión de dependencias
- **Nunca instancies `new ApiXRepository()` directamente en un composable o componente**; obtén la dependencia a través del contenedor correspondiente (`provideX()`).

### Store de autenticación (Pinia)
- `@/core/store/auth.js` exporta `useAuthStore()` — store Pinia con `user`, `fetchUser()`, `clearUser()`.
- **Reemplaza completamente al antiguo `useUser` composable** (ya eliminado).
- En cualquier componente o página que necesite el usuario autenticado: `const authStore = useAuthStore()`.
- `main.js` registra Pinia con `app.use(createPinia())` antes de montar la app.

### AuthService (domain service)
- `@/modules/auth/domain/services/AuthService.js` coordina validación de token, refresco y logout.
- Recibe `userRepository` por constructor (DI pura).
- `main.js` lo instancia vía `provideAuthService()` y registra el handler de 401 en `setUnauthorizedHandler()`.

### Módulo patients
- Entidad: `modules/patients/domain/entities/Patient.js`
- Interfaz repositorio: `modules/patients/domain/repositories/PatientRepository.js`
- Use cases: `SearchPatientsUseCase`, `CreatePatientUseCase` en `modules/patients/domain/use-cases/`
- Implementación: `modules/patients/infrastructure/ApiPatientRepository.js`
- Composable: `modules/patients/presentation/composables/usePatients.js`

### Tests
- Los tests usan `vitest` y mockean `global.fetch` para simular respuestas de red.
- Los tests de use cases inyectan repositorios mock directamente (sin `global.fetch`).
- Los imports de tests usan el alias `@/` (configurado en `vitest.config.js`).
- Ejecuta `npx vitest run` para la suite completa (38 tests).

## Procedimiento

1. Confirma que la tarea pertenece a `frontend/` y no a `backend/resources/`.
2. Verifica si Tailwind está integrado en la superficie frontend que vas a tocar.
3. Inspecciona el punto de entrada y los componentes afectados antes de editar.
4. Mantén los cambios de componentes locales y mínimos salvo que haga falta un cambio más amplio.
5. Para estilos o layout, prioriza clases de Tailwind frente a CSS específico.
6. Valida con un build del frontend o ejecuta `npx vitest run`.
7. Si el frontend depende de endpoints backend, coordínalo con la skill de backend.

8. **Para añadir una nueva feature (ej. `reports`):**
   - Crea el directorio `modules/reports/` con la estructura estándar.
   - Define la entidad en `domain/entities/Report.js` si representa datos de negocio.
   - Define la interfaz de repositorio en `domain/repositories/ReportRepository.js`.
   - Implementa en `infrastructure/ApiReportRepository.js` usando **solo `fetchClient`** de `@/core/api/httpClient`.
   - Añade casos de uso en `domain/use-cases/`; reciben el repositorio por constructor.
   - Crea el contenedor `application/containers/reportsContainer.js` con funciones `provideX()`.
   - Crea el composable en `presentation/composables/useReports.js`.
   - Coloca páginas en `presentation/pages/` y componentes en `presentation/components/`.
   - Actualiza `@/core/router/index.js` si añades rutas.
   - Añade tests con los imports usando `@/modules/reports/...`.

## Regla de Estilos

- Usa Tailwind como opción principal para maquetación, espaciado, tipografía, color y estados visuales.
- Recurre a CSS en `frontend/src/style.css` solo cuando Tailwind no resuelva bien el caso.
- Si detectas que Tailwind no está instalado o configurado en `frontend/`, notifícalo antes de implementar.

### Reglas UX/Interactividad

- Todos los botones deben mostrar el cursor `pointer`. Esta regla global se mantiene en `frontend/src/style.css`.

## Comandos Útiles

Ejecuta estos comandos desde `frontend/`, salvo que el flujo actual use contenedores.

```bash
npm install
npm run dev
npm run build
npm run preview
npx vitest run
```

Nota importante: cuando ejecutes la suite de tests desde la raíz del repositorio, usa el siguiente comando recomendado (evita problemas de contexto de ruta):

```bash
cd frontend && npx vitest run --run
```

Usar siempre este comando al ejecutar tests localmente o en scripts/CI que partan desde la raíz del proyecto.

### Ejecutar tests dentro de Docker

Si trabajas normalmente usando Docker (el flujo por defecto del proyecto), ejecuta la suite de tests dentro del servicio `node` para garantizar el mismo entorno que en CI. Desde la raíz del repositorio usa:

```bash
docker compose run --rm node sh -c "npm ci --no-audit --no-fund || npm install --no-audit --no-fund && npx vitest run --run"
```

Si tu entorno usa la versión legacy de `docker-compose`, sustituye `docker compose` por `docker-compose` en el comando anterior.

## Guía de Validación

- Usa `npm run build` como verificación mínima para cambios en frontend.
- Ejecuta `npx vitest run` desde `frontend/` para correr la suite de tests completa (38 tests).
- Si el cambio fue principalmente visual, deja constancia de si la validación fue solo de build o también de revisión visual/manual.