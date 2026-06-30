# Design: Refactorizar Dashboard — Datos Mock a Datos Reales (Fase 1)

## Technical Approach

Apply hexagonal architecture to the dashboard module (currently presentation-only). Build domain, infrastructure, and application layers following the patterns established by `patients/` and `admin/users/` modules. The dashboard becomes role-aware at the application layer: admin sees system metrics (user count from `GET /admin/users`), doctor sees patient KPIs (from `GET /patients/find`) and pending reports (from `GET /reports?status=draft`). Components consume a single `useDashboard` composable, removing all hardcoded data.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Composable vs Pinia store | `useDashboard` composable with `ref` | Matches `useUsers` pattern in admin/users. No cross-component sharing. Simpler test surface. |
| New vs returning patients | Compare `created_at` against today's date range | User requirement. Patients without `created_at` → counted as returning (defensive). |
| Role detection | `useAuthStore().hasPermission()` in composable | Single source of truth for permissions. `admin.user.view` → admin, `patient.view` → doctor. |
| PendingReportsWidget | New standalone component | Separate concern from PatientList. Conditionally rendered by role. |
| Deferred components | `ConsultationPanel`, `RightPanel` unchanged | Require backend endpoints not yet available. Out of scope per proposal. |
| Entity location | `domain/entities/` as named type exports | Existing modules re-export from shared, but new types (`DashboardStats`, `PatientSummary`) don't exist there yet. Create locally. |
| Repository granularity | Single `DashboardRepository` | Four focused methods (`getStats`, `getRecentPatients`, `getPendingReports`, `getSystemMetrics`). Fewer files without losing cohesion. |

## Data Flow

```
DashboardPage ──uses──→ useDashboard() composable
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
  hasPermission check    ┌─── role? ───┐     error/loading refs
         │               │             │
    doctor path     admin path    no-permission path
         │               │             │
  GetDashboardStats  GetSystemMetrics   "No disponible"
  GetRecentPatients       │
  GetPendingReports       │
         │               │
    ApiDashboardRepository ──fetchClient──→ /patients/find
                           ──fetchClient──→ /reports?status=draft
                           ──fetchClient──→ /admin/users
```

The composable lazily instantiates use cases via container on first call. Data flows as reactive refs into component props.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/dashboard/domain/entities/DashboardStats.ts` | Create | `visits: number, newPatients: number, returningPatients: number` |
| `src/modules/dashboard/domain/entities/PatientSummary.ts` | Create | `id, name: string, visitTime: string, initials: string` |
| `src/modules/dashboard/domain/entities/PendingReport.ts` | Create | `id, patientName: string, templateName: string, createdAt: string` |
| `src/modules/dashboard/domain/entities/types.ts` | Create | `DashboardRole = 'admin' \| 'doctor' \| 'none'`, `DateRange` value object |
| `src/modules/dashboard/domain/repositories/DashboardRepository.ts` | Create | Interface with 4 methods |
| `src/modules/dashboard/domain/use-cases/GetDashboardStatsUseCase.ts` | Create | Queries patients, computes new vs returning split |
| `src/modules/dashboard/domain/use-cases/GetRecentPatientsUseCase.ts` | Create | Queries patients, maps to `PatientSummary[]` |
| `src/modules/dashboard/domain/use-cases/GetPendingReportsUseCase.ts` | Create | Queries reports with limit, maps to `PendingReport[]` |
| `src/modules/dashboard/domain/use-cases/GetSystemMetricsUseCase.ts` | Create | Queries `/admin/users`, extracts total count |
| `src/modules/dashboard/infrastructure/ApiDashboardRepository.ts` | Create | Implements interface via `fetchClient` |
| `src/modules/dashboard/application/containers/dashboardContainer.ts` | Create | `provideGetDashboardStats()` etc. |
| `src/modules/dashboard/presentation/composables/useDashboard.ts` | Create | Reactive state, role detection, lazy use case dispatch |
| `src/modules/dashboard/presentation/components/PendingReportsWidget.vue` | Create | Preview of first 5 pending reports + badge + "Ver todos" link |
| `src/modules/dashboard/presentation/components/HeroCard.vue` | Modify | Replace hardcoded numbers with props: `stats`, `loading`, `error` |
| `src/modules/dashboard/presentation/components/PatientList.vue` | Modify | Accept `patients` array prop, remove hardcoded array, add skeleton/empty states |
| `src/modules/dashboard/presentation/pages/DashboardPage.vue` | Modify | Use `useDashboard`, conditionally render admin vs doctor layout, remove mock logic |
| `__tests__/` corresponding paths | Create | Unit tests for all use cases + composable |

## Interfaces / Contracts

```ts
// DashboardRepository (domain)
interface DashboardRepository {
  getStats(range: DateRange): Promise<{ data: any[] }>;
  getRecentPatients(range: DateRange): Promise<any[]>;
  getPendingReports(limit: number): Promise<any[]>;
  getSystemMetrics(): Promise<{ total: number }>;
}

// DateRange (value object)
interface DateRange {
  from: string; // ISO 8601
  to: string;   // ISO 8601
}

// Composable returns
interface UseDashboardReturn {
  role: Ref<DashboardRole>;
  stats: Ref<DashboardStats | null>;
  recentPatients: Ref<PatientSummary[]>;
  pendingReports: Ref<PendingReport[]>;
  systemMetrics: Ref<{ totalUsers: number } | null>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  refresh: () => Promise<void>;
}
```

**Mapper (infrastructure, private)**: `toPatientSummary(apiPatient)`, `toPendingReport(apiReport)`, `computeStats(patients, todayRange)`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Domain — use cases | `GetDashboardStats` (new/returning split), `GetPendingReports` (limit), `GetSystemMetrics` (count extraction) | Mock repository injected via constructor. Test edge: empty data, missing `created_at`, >5 reports. |
| Domain — entities | `DashboardStats`, `PatientSummary`, `PendingReport` type correctness | TypeScript compilation + value object construction in use case tests. |
| Infrastructure — repository | URL construction, response unwrapping | Mock `fetchClient` (vitest mock on `@/core/api/httpClient`). Verify called with correct query params. |
| Presentation — composable | Role detection, loading/error state transitions, data refresh | Mock use cases via container. Test `role` computed from `hasPermission`. |
| Presentation — components | HeroCard renders props, PatientList emits select, PendingReportsWidget shows N rows | Shallow mount with test props. No API mocking needed (pure presentational). |

**Minimum 8 tests**: 3 for `GetDashboardStats` (normal, empty, missing `created_at`), 2 for `GetPendingReports` (under limit, over limit), 1 for `GetSystemMetrics`, 2 for `useDashboard` composable (doctor role path, admin role path).

## Migration / Rollout

No data migration required. Components degrade gracefully via `loading`/`error` states. If endpoints fail, users see error messages instead of fake data. Rollback: revert `DashboardPage.vue` to current version — all other files are new and don't affect existing behavior.

## Open Questions

- [ ] Does `GET /reports?status=draft` return `patient_name` and `template_name` fields? (Assume yes per `PatientReport` type in shared.)
- [ ] Does `GET /admin/users` return total count directly or require client-side counting from paginated response? (Assume `meta.total` or array length if unpaginated.)
