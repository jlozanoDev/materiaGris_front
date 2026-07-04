## Exploration: Refactorización del Dashboard Frontend

### Current State

El dashboard opera completamente con **datos dummy/hardcoded**. No hay conexión a la API real, ni capas de dominio/infraestructura/aplicación definidas para este módulo.

**Componentes existentes (solo `presentation/`):**
- `DashboardPage.vue` — Layout principal. Sidebar + TopBar + HeroCard + PatientList + ConsultationPanel + RightPanel. Maneja edición de usuario/cambio de contraseña/direcciones solo vía localStorage.
- `HeroCard.vue` — Tarjeta de bienvenida. Muestra "104 visitas hoy", "40 nuevos (+51%)", "64 antiguos (-20%)", clima "22°C Soleado". Todo hardcoded.
- `PatientList.vue` — Lista de 5 pacientes ficticios (Denzel White, Stacy Mitchell, Amy Dunham, Demi Joan, Susan Myers) con horas y tipos inventados. Emite evento `select` pero no se usa.
- `ConsultationPanel.vue` — Panel de consulta con paciente hardcoded (Denzel White, 28 años). Síntomas, observación y prescripción inventados.
- `RightPanel.vue` — Calendario mensual con dots hardcoded [1, 8, 14, 21]. Sección "Próximos" y "Lectura diaria" con datos ficticios.

**Capas faltantes del dashboard:**
- ❌ `domain/entities/` — No existe
- ❌ `domain/repositories/` — No hay interfaz de repositorio
- ❌ `domain/use-cases/` — Sin casos de uso
- ❌ `infrastructure/` — Sin implementación de repositorio
- ❌ `application/containers/` — Sin contenedor DI
- ✅ `presentation/` — Solo componentes visuales con datos mock

### Affected Areas

| Archivo/Ruta | Por qué |
|---|---|
| `src/modules/dashboard/` (todo el módulo) | Necesita las 4 capas faltantes: domain, infrastructure, application, presentation |
| `src/core/router/index.ts` | La ruta `/` ya apunta a DashboardPage, sin cambios necesarios |
| `src/core/api/httpClient.ts` | Ya configurado con JWT, sin cambios necesarios |
| `src/core/store/auth.ts` | Proporciona `user` con `permissions` útil para dashboard role-aware |
| `src/modules/patients/infrastructure/ApiPatientRepository.ts` | `GET /patients/find` con filtros de fecha ya existe — utilizable para conteos del dashboard |
| `src/modules/reports/infrastructure/ApiReportRepository.ts` | `GET /reports` con filtros ya existe — utilizable para informes pendientes |
| `src/shared/types/index.ts` | Tipos `AuthUser`, `Patient` ya definidos. Posiblemente necesite `DashboardStats` |
| `docs/tecnica/modules/dashboard/panel-principal.md` | Documenta el roadmap pendiente, debe actualizarse |
| `docs/funcional/modules/dashboard.md` | Documenta criterios de aceptación y reglas de negocio |

### API Surface: Endpoints Reales Disponibles

Endpoints confirmados vía los repositorios de infraestructura existentes:

| Endpoint | Módulo | Utilidad para Dashboard |
|---|---|---|
| `GET /auth/me` | auth | Datos del usuario autenticado (nombre, rol, permisos) |
| `GET /patients/find?q=&registered_from=&registered_to=&last_visit_from=&last_visit_to=` | patients | **Clave**: conteo de pacientes del día, nuevos vs antiguos, búsqueda por fecha |
| `GET /patients/:id` | patients | Detalle de paciente individual |
| `GET /reports?status=` | reports | **Clave**: informes pendientes, firmados, cerrados — con filtros |
| `GET /admin/users` | admin/users | Conteo de usuarios activos (para admin dashboard) |
| `GET /admin/report-templates` | admin/report-template | Conteo de plantillas activas (para admin dashboard) |
| `GET /templates/active` | reports | Plantillas disponibles para nuevos informes |

**Endpoints que NO existen pero serían necesarios:**
- `GET /dashboard/stats` — Endpoint agregado que devuelva KPIs en una sola llamada (recomendado para eficiencia)
- `GET /appointments` o `GET /agenda` — Módulo de citas/agenda (no existe aún)
- `GET /activity` o feed de actividad reciente — No existe

### Approaches

#### 1. Endpoint Agregado `/dashboard/stats` (Recomendado)

Crear un endpoint backend dedicado que devuelva todas las estadísticas del dashboard en una sola llamada HTTP. El frontend crea `DashboardStats` entity, `DashboardRepository`, `ApiDashboardRepository`, `GetDashboardStatsUseCase`.

- **Pros:** Una sola petición = rápido. Backend orquesta consultas complejas. Clara separación de responsabilidades. Fácil de cachear. Escalable para añadir más KPIs.
- **Cons:** Requiere trabajo en backend (fuera del alcance del frontend). Dependencia de que el equipo backend implemente el endpoint.
- **Effort:** Medium (frontend) + Backend work

#### 2. Múltiples Llamadas a Endpoints Existentes

Usar los endpoints ya disponibles (`/patients/find`, `/reports`, `/auth/me`) desde el frontend, haciendo varias llamadas en paralelo para componer los datos del dashboard.

- **Pros:** No requiere cambios en backend. Se puede implementar 100% en frontend. Iteración rápida.
- **Cons:** Múltiples round-trips HTTP (aunque en paralelo con Promise.all). Lógica de agregación en el frontend (frágil). Cada endpoint puede devolver más datos de los necesarios (over-fetching). No escala bien si se añaden más widgets.
- **Effort:** Low-Medium

#### 3. Enfoque Híbrido (Faseado)

Fase 1: Usar endpoints existentes para lo que ya está disponible (pacientes del día, conteos básicos). Fase 2: Cuando el backend exponga `/dashboard/stats`, migrar a ese endpoint.

- **Pros:** Entrega valor rápido sin bloquearse en backend. El caso de uso `GetDashboardStatsUseCase` abstrae el origen de datos — solo cambia el repositorio. Arquitectura limpia desde el inicio.
- **Cons:** Dos implementaciones de repositorio (una temporal con múltiples llamadas, una final con endpoint agregado).
- **Effort:** Low inicial, Medium final

### Recommendation

**Enfoque 3: Híbrido Faseado.** Razones:

1. El módulo patients ya tiene endpoints funcionales con filtros de fecha (`registered_from/to`, `last_visit_from/to`). Podemos mostrar datos reales **hoy mismo** sin tocar backend.
2. La arquitectura hexagonal permite empezar con `ApiDashboardRepository` que haga múltiples llamadas, y luego reemplazar por un repositorio que use `/dashboard/stats` sin tocar componentes ni use cases.
3. El dashboard es la pantalla más visible — entregar valor incremental es crítico.

**Arquitectura propuesta para el módulo dashboard:**

```
src/modules/dashboard/
├── domain/
│   ├── entities/
│   │   └── DashboardStats.ts        # Entidad: visitas hoy, nuevos, antiguos, pendientes
│   ├── repositories/
│   │   └── DashboardRepository.ts   # Interfaz: getStats(): Promise<DashboardStats>
│   └── use-cases/
│       └── GetDashboardStatsUseCase.ts
├── infrastructure/
│   └── ApiDashboardRepository.ts    # Implementación con fetchClient (múltiples endpoints en fase 1)
├── application/
│   └── containers/
│       └── dashboardContainer.ts    # provideGetDashboardStatsUseCase()
└── presentation/
    ├── composables/
    │   └── useDashboard.ts          # Estado reactivo: stats, loading, error
    ├── components/
    │   ├── HeroCard.vue             # (refactorizado: recibe stats como prop)
    │   ├── PatientList.vue          # (refactorizado: recibe pacientes reales)
    │   ├── ConsultationPanel.vue    # (conectado a flujo real)
    │   └── RightPanel.vue           # (calendario con dots reales futuros)
    └── pages/
        └── DashboardPage.vue        # (usa useDashboard composable)
```

### Feature Opportunities — Ranked by Priority

| # | Funcionalidad | Valor | Esfuerzo | Dependencia Backend | Recomendación |
|---|---|---|---|---|---|
| 1 | **KPIs reales en HeroCard** (visitas hoy, nuevos vs antiguos) | 🔴 Crítico | Bajo | Ninguna (usa `/patients/find`) | **Fase 1 inmediata** |
| 2 | **PatientList con datos reales** (pacientes del día desde API) | 🔴 Crítico | Bajo | Ninguna (usa `/patients/find?last_visit_from=today`) | **Fase 1 inmediata** |
| 3 | **Dashboard role-aware** (métricas distintas por rol) | 🟠 Alto | Bajo | Ninguna (authStore.user.permissions) | **Fase 1** |
| 4 | **Informes pendientes widget** (reports en draft/sin firmar) | 🟠 Alto | Bajo | Ninguna (usa `/reports?status=draft`) | **Fase 2** |
| 5 | **Estadísticas admin** (total usuarios, roles, plantillas activas) | 🟡 Medio | Bajo-Medio | Ninguna (usa `/admin/users`, `/admin/report-templates`) | **Fase 2** (solo si rol=admin) |
| 6 | **Gráfico de actividad semanal** (consultas por día) | 🟡 Medio | Medio | Necesita endpoint agregado o múltiples queries | **Fase 3** |
| 7 | **Quick actions** (nuevo paciente, nuevo informe, buscar) | 🟡 Medio | Bajo | Ninguna | **Fase 2** |
| 8 | **Notificaciones/alertas** (informes sin firmar > 24h, pacientes sin seguimiento) | 🟢 Nice-to-have | Medio | Necesita endpoint de notificaciones | **Fase 4** |
| 9 | **Calendario con citas reales** | 🟢 Nice-to-have | Alto | Necesita módulo de citas/agenda completo | **Fase 4+ (depende de backend)** |
| 10 | **Activity feed** (últimas acciones: paciente creado, informe firmado) | 🟢 Nice-to-have | Medio | Necesita endpoint de activity log | **Fase 4** |

### Riesgos

- **El backend puede no soportar filtros de fecha en `/patients/find`**: Verificar que `last_visit_from`/`last_visit_to` y `registered_from`/`registered_to` funcionan. Si no, se necesita coordinación con backend.
- **El endpoint `/reports` puede no soportar filtro `?status=draft`**: Verificar antes de implementar widget de informes pendientes.
- **Sin endpoint `/dashboard/stats`**, la fase 1 usa múltiples llamadas. Esto es aceptable temporalmente pero debe migrarse para eficiencia.
- **El módulo dashboard actual NO tiene tests**: Hay que añadir tests unitarios para el use case y tests de integración para el repositorio.

### Ready for Proposal

**Sí.** La exploración confirma que:

1. El dashboard es 100% mock — necesita capas de dominio/infraestructura/aplicación completas
2. Hay endpoints suficientes para empezar con KPIs reales y lista de pacientes sin tocar backend
3. La arquitectura hexagonal del proyecto es ideal para empezar con endpoints existentes y migrar a uno agregado después
4. Las features están priorizadas por valor/esfuerzo, con las 3 primeras implementables en una sola iteración

**Siguiente paso:** Pasar a `sdd-propose` con el scope: Fase 1 — KPIs reales + PatientList real + estructura del módulo dashboard.
