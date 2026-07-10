# Design: Clinic Data + User Extensions

## Technical Approach

Two-tier data strategy: **Pinia store** (`useClinicStore`) for reactive cache + **hexagonal module** for admin editing. Extract 120 duplicated resolver lines into shared `useReportVariableResolver` composable. Fix `medico.matricula` to use `num_colegiado` instead of `email`. Replace 3 "Materia Gris" hardcodes with store-driven data.

## Architecture Decisions

### Decision: Pinia store for clinic cache, hexagonal module for admin CRUD

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Pinia-only (direct fetchClient in page) | Fast, but violates DI pattern | **Reject** — inconsistent with rest of codebase |
| Full hexagonal (no Pinia) | Consistent, but no reactive shared state | **Reject** — pages need reactive clinic refs |
| Pinia store + hexagonal admin page | Cache in store, DI for updates — best of both | **Choose** |

**Rationale**: The clinic store provides reactive state to all consumers (reports, sidebar, dashboard). The admin edit page follows the established `admin/users` module pattern for consistency.

### Decision: Composable over shared class for variable resolver

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Shared class (new `SystemVariableRegistry` per instance) | OOP, follows existing registry pattern | **Reject** — overengineered for a resolver that's just a factory function |
| Composable (`useReportVariableResolver`) | Lightweight, Vue-idiomatic, accepts refs | **Choose** |

**Rationale**: The resolver creates a temporary `SystemVariableRegistry`, registers runtime resolvers, and returns a `resolve(text) => string` function. No state management needed — just ref-based inputs. Matches the codebase's composable convention.

## Data Flow

```
main.ts ──→ clinicStore.fetchClinic() ──→ GET /admin/clinic ──→ clinic store (ref)
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
ReportFillPage  PdfExport  ClinicEditPage
     │           │           │
     ▼           ▼           ▼
useReportVariableResolver   useClinicForm
(patient, user, clinic) →   → UpdateClinicUseCase
resolve("{clinica.nombre}")  → PUT /admin/clinic
     │
     ▼
DynamicFormRenderer
```

Sidebar → `useClinicStore().clinic` (display only)
Router guard → checks `authStore.hasPermission('admin.clinic.update')` for route `/admin/clinic`

## Module Structure

```
src/
├── core/store/clinic.ts                          # NEW ~50L: Pinia store (setup syntax)
├── shared/types/index.ts                         # MODIFIED: +Clinic type, +4 AuthUser fields
├── shared/composables/
│   ├── useReportVariableResolver.ts              # NEW ~80L: shared resolver composable
│   └── useSystemVariableRegistry.ts              # MODIFIED: +9 fallback variables
├── modules/admin/clinic/
│   ├── domain/
│   │   ├── entities/Clinic.ts                    # NEW ~15L
│   │   ├── repositories/ClinicRepository.ts      # NEW ~10L: interface (get, update)
│   │   └── use-cases/UpdateClinicUseCase.ts       # NEW ~10L
│   ├── infrastructure/
│   │   └── ApiClinicRepository.ts                # NEW ~30L: fetchClient GET/PUT
│   ├── application/containers/
│   │   └── clinicContainer.ts                    # NEW ~10L: provideUpdateClinicUseCase
│   └── presentation/
│       ├── composables/useClinicForm.ts           # NEW ~40L: reactive form state
│       └── pages/ClinicEditPage.vue              # NEW ~180L: edit form
├── modules/reports/presentation/
│   ├── pages/ReportFillPage.vue                  # MODIFIED: -60L resolver, +5L import
│   └── components/ReportPdfExport.vue            # MODIFIED: -60L resolver, +5L import
├── modules/admin/report-template/presentation/components/
│   └── ReportDocumentRenderer.vue                # MODIFIED: -1 hardcoded preview
├── core/router/index.ts                          # MODIFIED: +6L route /admin/clinic
├── shared/components/AppSidebar.vue              # MODIFIED: +12L clinic entry
└── main.ts                                       # MODIFIED: +5L clinic store init
```

**Totals**: 9 new files (~425 lines), 8 modified files (~-150 lines net)

## Store Design: `useClinicStore`

```ts
// API: store = useClinicStore()
store.clinic       // Ref<Clinic | null>
store.loading      // Ref<boolean>
store.error        // Ref<string | null>
store.fetchClinic()// () => Promise<Clinic | null>
```

Pattern: mirrors `useAuthStore` (setup syntax, `defineStore`). No localStorage caching — singleton data, always fresh from API on init. On 404, `clinic` = `null`, no error thrown.

## Composable Design: `useReportVariableResolver`

```ts
function useReportVariableResolver(
  patient: Ref<Patient | null>,
  user: Ref<AuthUser | null>,
  clinic: Ref<Clinic | null>
): { resolve: (text: string) => string }
```

Registers resolvers for ~20 variables across categories: `fecha.*`, `paciente.*`, `clinica.*`, `medico.*`, `usuario.*`. Falls back to legacy flat variables. Replaces 128 duplicated lines (including duplicated `calcAge`).

## Key Changes

### 1. AuthUser extension (types/index.ts)
```ts
export interface AuthUser {
  // ... existing fields ...
  apellido?: string | null
  num_colegiado?: string | null
  especialidad?: string | null
  telefono?: string | null
}
```

### 2. Bug fix: medico.matricula
```diff
- if (u?.email) registry.register("medico", "matricula", ..., () => String(u.email))
+ if (u?.num_colegiado) registry.register("medico", "matricula", ..., () => String(u.num_colegiado))
```

### 3. Hardcoded "Materia Gris" removal
- ReportFillPage:483 → remove, resolver now uses `clinic.value?.nombre ?? ""`
- ReportPdfExport:107 → remove, same
- ReportDocumentRenderer:303 → change preview to `'Clínica [variable]'`

### 4. Sidebar integration
AppSidebar changes:
- `hasAnySettingsPermission` computed: add `'admin.clinic.update'` to the array
- Insert clinic entry as FIRST item in Ajustes dropdown (before Usuarios), guarded by `v-if="authStore.hasPermission('admin.clinic.update')"`. Icon: `pi pi-building`.

## Route Design

```ts
{
  path: "/admin/clinic",
  name: "AdminClinic",
  component: () => import("@/modules/admin/clinic/presentation/pages/ClinicEditPage.vue"),
  meta: { requiresAuth: true, permissions: 'admin.clinic.update' }
}
```

## Implementation Order

1. **Types** — `Clinic` type + `AuthUser` extension (~20 lines, zero-risk)
2. **Clinic store** — `core/store/clinic.ts` + `main.ts` init (~55 lines, standalone)
3. **Shared composable** — `useReportVariableResolver.ts` (~80 lines, additive)
4. **Fallback registry** — extend `useSystemVariableRegistry.ts` (~9 lines)
5. **ReportFillPage + ReportPdfExport** — import composable, delete duplicated blocks (~-115 lines net)
6. **ReportDocumentRenderer** — remove hardcode preview (~1 line)
7. **Clinic admin module** — full hexagonal stack: entity → repo → use case → container → composable → page (~295 lines)
8. **Router** — add `/admin/clinic` route (~6 lines)
9. **Sidebar** — add "Clínica" entry (~12 lines)

Dependency chain: 1 → 2 → 3 → 4+5+6 (parallel) → 7 → 8+9 (parallel)

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| GET /admin/clinic returns 404 | `clinic` = `null`; `clinica.*` variables resolve to `""` |
| User lacks `admin.clinic.update` | Router guard blocks `/admin/clinic`; sidebar entry not rendered |
| PUT returns 422 | Form shows inline validation errors, preserves field values |
| `num_colegiado` is null | `medico.matricula` resolves to `""`, not crash |
| Backend omits new /me fields | `authStore.user.apellido` = `undefined` — optional fields, no crash |
| Empty clinic after save | After PUT, `fetchClinic()` refreshes store; page re-renders |
