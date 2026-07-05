# Proposal: Refactorizar Dashboard — De Datos Mock a Datos Reales (Fase 1)

## Intent

El dashboard muestra datos inventados: 104 visitas, 40 pacientes nuevos, clima falso, nombres falsos, citas falsas. Los doctores no pueden confiar en su propio panel de control. Necesitamos que el dashboard refleje la realidad clínica consumiendo endpoints del backend que YA existen.

Por qué ahora: los endpoints (`/patients/find`, `/reports?status=draft`, `/auth/me`, `/admin/users`) ya están operativos. No hay que esperar a backend. El módulo dashboard solo tiene capa de presentación — debe completarse con las otras 3 capas (domain, infrastructure, application) como el resto del sistema.

## Scope

### In Scope (Fase 1)

1. **Capas hexagonales completas** para el módulo dashboard: domain entities (`DashboardStats`, `PatientSummary`, `PendingReport`), interfaz de repositorio, implementación API con `fetchClient`, use cases (`GetDashboardStats`, `GetRecentPatients`), contenedor DI, composable Pinia `useDashboard` y un store.
2. **KPIs reales** reemplazando números mock de HeroCard: visitas de hoy, pacientes nuevos vs recurrentes desde `GET /patients/find?last_visit_from/to=`.
3. **PatientList con datos reales** desde `/patients/find` (últimos pacientes atendidos hoy), mostrando nombre real, tipo de consulta y hora.
4. **Dashboard consciente del rol**: admin ve conteo de usuarios desde `GET /admin/users`; doctor ve estadísticas de pacientes y Informes pendientes desde `GET /reports?status=draft`.
5. **Tests unitarios TDD** para todos los use cases con repositorio mock (0 tests actuales).

### Out of Scope

- Backend: endpoint agregado `/dashboard/stats` (Fase 2)
- Gráficos, tendencias, comparativas históricas
- Widget de clima real (requiere API externa)
- Calendario con citas reales (depende de endpoint de appointments)
- Panel de consulta con datos reales de paciente seleccionado (depende de endpoint de historia clínica)
- Real-time updates (WebSocket/SSE)

## Capabilities

### New Capabilities

- `dashboard-stats`: KPIs del dashboard (visitas hoy, pacientes nuevos/recurrentes, Informes pendientes) — nuevos dominios, repositorios y use cases para el módulo dashboard.
- `dashboard-patient-list`: Lista de pacientes recientes consumiendo `/patients/find` — entidad `PatientSummary`, repositorio y use case.
- `dashboard-role-aware`: Conmutación de datos del dashboard según el rol del usuario (admin vs doctor) — use case `GetDashboardStats` consulta diferentes endpoints.

### Modified Capabilities

None (el dashboard no tiene specs previos).

## Approach

**Estrategia**: Híbrida por fases. Fase 1 consume endpoints existentes con arquitectura hexagonal completa. Fase 2 (futura) cambia a endpoint agregado `/dashboard/stats` cuando backend lo exponga.

**Arquitectura Fase 1**:

```
modules/dashboard/
├── domain/
│   ├── entities/           # DashboardStats, PatientSummary, PendingReport
│   ├── repositories/       # DashboardRepository (interfaz)
│   └── use-cases/          # GetDashboardStats, GetRecentPatients
├── infrastructure/
│   └── ApiDashboardRepository.ts  # fetchClient a /patients/find, /reports, /admin/users
├── application/
│   └── containers/         # provideGetDashboardStats(), provideGetRecentPatients()
└── presentation/
    ├── composables/        # useDashboard.ts (estado reactivo + llamadas a use cases)
    ├── store/              # useDashboardStore (Pinia, opcional si el composable basta)
    ├── components/         # HeroCard, PatientList (actualizados), ConsultationPanel (aplazado), RightPanel (aplazado)
    └── pages/              # DashboardPage.vue (actualizado)
```

**Flujo de datos**: `DashboardPage` → `useDashboard` composable → `GetDashboardStats` use case → `ApiDashboardRepository` → `fetchClient` → backend.

Los componentes existentes (`HeroCard`, `PatientList`) pasan de props hardcodeadas a props reactivas vinculadas al composable.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/dashboard/` | New layers | Crear domain/, infrastructure/, application/, presentation/composables/ |
| `src/modules/dashboard/presentation/components/HeroCard.vue` | Modified | Reemplazar números mock con props reactivas del composable |
| `src/modules/dashboard/presentation/components/PatientList.vue` | Modified | Consumir array reactivo del composable en lugar de array estático |
| `src/modules/dashboard/presentation/pages/DashboardPage.vue` | Modified | Inyectar `useDashboard`, eliminar lógica mock, pasar props reales |
| `src/modules/dashboard/presentation/components/ConsultationPanel.vue` | Unchanged | Se aplaza a fase futura (requiere endpoint de historia clínica) |
| `src/modules/dashboard/presentation/components/RightPanel.vue` | Unchanged | Calendario y próximos se aplazan (requieren endpoints de appointments) |
| `src/core/router/index.ts` | Unchanged | Ruta `/` ya apunta a DashboardPage |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `GET /patients/find?last_visit_from/to=` no permite distinguir nuevos vs recurrentes directamente | Medium | La API devuelve `created_at`; comparar con rango del día vs anterior. Si no es viable, simplificar a "visitas hoy" como primer KPI y añadir "nuevos" en iteración posterior |
| `GET /admin/users` devuelve datos con paginación que requieren permisos admin | Low | Verificar respuesta en entorno real; usar `total` o contar resultados si la API lo devuelve |
| `GET /reports?status=draft` solo devuelve conteo sin desglose por doctor | Low | Aceptable para Fase 1: mostrar número total de Informes pendientes |
| El composable `useDashboard` podría duplicar lógica con `useAuthStore` | Low | Mantener `useAuthStore` como fuente única de auth/permisos; `useDashboard` solo consulta datos de negocio |
| Test coverage gap: 0 tests en módulo dashboard | High | TDD estricto: tests de use cases antes de implementación. Mínimo 8 tests para Fase 1 |

## Rollback Plan

Si los endpoints fallan o devuelven datos inesperados:
1. El composable `useDashboard` tiene estado de error y estado de carga.
2. Los componentes muestran skeleton/placeholder mientras cargan y mensaje de error si falla.
3. Rollback a datos mock: descomentar arrays hardcodeados en componentes — los componentes ya tienen esa lógica actualmente.
4. Si la refactorización rompe el build: revertir cambios en `DashboardPage.vue` que es el único punto de integración.

## Dependencies

- `GET /patients/find?last_visit_from/to=` — operativo en backend, sin cambios necesarios
- `GET /reports?status=draft` — operativo (usado por módulo reports)
- `GET /auth/me` — operativo (usado por `useAuthStore`)
- `GET /admin/users` — operativo (usado por módulo admin/users)
- `fetchClient` de `@/core/api/httpClient.ts` — sin cambios

## Success Criteria

- [ ] HeroCard muestra KPIs reales del día (visitas, pacientes nuevos/recurrentes) desde el backend, no números hardcodeados
- [ ] PatientList muestra pacientes reales del día desde `/patients/find`
- [ ] Admin ve conteo de usuarios; doctor ve estadísticas de pacientes y Informes pendientes
- [ ] Arquitectura hexagonal completa para el módulo dashboard (domain → infra → app → presentation)
- [ ] 8+ tests unitarios (use cases con repositorio mock) pasan con `npx vitest run`
- [ ] Build de producción exitoso (`npm run build`)
- [ ] Cero datos mock en KPIs y PatientList (ConsultationPanel y RightPanel aceptan permanecer mock para Fase 1)

## Alternatives Considered

| Alternativa | Decisión | Razón |
|-------------|----------|-------|
| Construir todo de golpe (KPIs, calendario, clima, consulta) | Rechazada | Backend no expone endpoints para calendario/clima/consulta; hacer todo a la vez aumentaría riesgo, complejidad y acoplamiento sin valor entregable inmediato |
| Esperar a que backend cree endpoint agregado `/dashboard/stats` | Rechazada | Sin ETA de backend; los endpoints individuales YA funcionan. La arquitectura hexagonal permite cambiar a endpoint agregado en Fase 2 con cambios mínimos (solo `ApiDashboardRepository`) |
| Usar solo Pinia store sin use cases | Rechazada | Rompe la arquitectura hexagonal del proyecto; el resto de módulos usa repositorios + use cases + DI |
