# Tasks: Clinic Data + User Extensions for Reports

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~640 (522 adds + 121 deletions) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation: types, store, composable, fallback vars | PR 1 | ~178L adds; base for all other work |
| 2 | Report fixes: remove duplication, fix bugs, remove hardcodes | PR 2 | ~132L changed (mostly deletions); depends on PR 1 |
| 3 | Admin clinic module: hexagonal page, route, sidebar | PR 3 | ~333L adds; depends on PR 1, independent of PR 2 |

## Phase 1: Foundation (PR 1 — ~178L adds)

- [x] 1.1 Add `Clinic` interface and 4 optional fields (`apellido`, `num_colegiado`, `especialidad`, `telefono`) to `AuthUser` in `src/shared/types/index.ts`
  - **Spec**: clinic-admin/req-2 (scenarios: fields present, fields omitted)
- [x] 1.2 Create `src/core/store/clinic.ts` — Pinia store with `clinic`, `loading`, `error`, `fetchClinic()` using `GET /admin/clinic` via `fetchClient`
  - **Spec**: clinic-admin/req-1 (scenarios: fetch on init, 404→null, 401→handler)
- [x] 1.3 Register clinic store in `src/core/services/serviceRegistry.ts` (export `getClinicStore`/`setClinicStore` following auth store pattern)
- [x] 1.4 Call `clinicStore.fetchClinic()` in `src/main.ts` after `authService.validateToken()` and before store init
- [x] 1.5 Create `src/shared/composables/useReportVariableResolver.ts` — accepts `user`, `clinic` refs; registers resolvers for medico.*, clinica.*, usuario.*; returns `resolve(text)`
  - **Spec**: system-variables/req-shared-composable (scenarios: shared resolver, null clinic→empty string)
  - **Bug**: `medico.matricula` resolves from `num_colegiado`, NOT `email`
- [x] 1.6 Add 9 fallback vars to `registerFallbackVariables()` in `src/shared/composables/useSystemVariableRegistry.ts`: `clinica.email`, `clinica.web`, `clinica.ciudad`, `clinica.provincia`, `clinica.codigo_postal`, `clinica.cuit`, `medico.num_colegiado`, `medico.telefono`, `medico.apellido`
  - **Spec**: system-variables/req-fallback-registry

## Phase 2: Report Fixes (PR 2 — ~11L adds, ~121L deletes)

- [x] 2.1 Replace inline resolver (lines 451–510) in `src/modules/reports/presentation/pages/ReportFillPage.vue` with `useReportVariableResolver`
  - **Spec**: system-variables/req-shared-composable, req-hardcode-removal
  - **Changes**: Removed `SystemVariableRegistry` import, added `useClinicStore` + `useReportVariableResolver` imports. Replaced 60-line inline resolver with composable call + local fallbacks for `paciente.*`, `fecha.*`, and legacy flat keys. `clinic.nombre` now comes from `clinicStore.clinic` via composable.
- [x] 2.2 Replace inline resolver (lines 74–134) in `src/modules/reports/presentation/components/ReportPdfExport.vue` with `useReportVariableResolver`
  - **Spec**: system-variables/req-shared-composable, req-hardcode-removal, req-matricula-fix (scenarios: num_colegiado available, num_colegiado null)
  - **Changes**: Removed `SystemVariableRegistry` import, added `useClinicStore` + `useReportVariableResolver`. Replaced 61-line inline resolver with composable. `medico.matricula` now resolves from `num_colegiado` via composable.
- [x] 2.3 Replace hardcoded `'Clínica Materia Gris'` in `src/modules/admin/report-template/presentation/components/ReportDocumentRenderer.vue` line 303 with generic placeholder `'{clinica.nombre}'`
  - **Spec**: system-variables/req-hardcode-removal

## Phase 3: Admin Clinic Module (PR 3 — ~333L adds)

- [x] 3.1 Create `src/modules/admin/clinic/domain/entities/Clinic.ts` — type matching `Clinic` from shared types
- [x] 3.2 Create `src/modules/admin/clinic/domain/repositories/ClinicRepository.ts` — interface with `update(data: Partial<Clinic>): Promise<Clinic>`
- [x] 3.3 Create `src/modules/admin/clinic/infrastructure/ApiClinicRepository.ts` — `fetchClient` impl calling `PUT /admin/clinic`
- [x] 3.4 Create `src/modules/admin/clinic/domain/use-cases/UpdateClinicUseCase.ts` — receives `ClinicRepository` via constructor, validates fields, handles 422
  - **Spec**: clinic-admin/req-3 (scenarios: user with perm edits, 422 shows inline errors)
- [x] 3.5 Create `src/modules/admin/clinic/application/containers/clinicContainer.ts` — exports `provideUpdateClinicUseCase()`
- [x] 3.6 Create `src/modules/admin/clinic/presentation/composables/useClinicForm.ts` — wraps `clinicStore`, use case; exposes `form`, `errors`, `saving`, `save()`
- [x] 3.7 Create `src/modules/admin/clinic/presentation/pages/ClinicEditPage.vue` — form for all clinic fields; loads from store, saves via PUT, shows inline validation
  - **Spec**: clinic-admin/req-3 (3 scenarios) + req-4 (sidebar entry)
- [x] 3.8 Add `/admin/clinic` route in `src/core/router/index.ts` — lazy import, `requiresAuth: true`, `permissions: 'admin.clinic.update'`
  - **Spec**: clinic-admin/req-3 (scenario: perm blocked)
- [x] 3.9 Add "Clínica" entry (first) in AppSidebar Ajustes dropdown using `pi pi-building`, guarded by `admin.clinic.update`; add perm to `hasAnySettingsPermission`
  - **Spec**: clinic-admin/req-4 (scenarios: admin sees entry, non-admin hidden)

---

### Dependency Graph

```
PR 1 (Foundation)
 ├── 1.1 Types ──→ 1.2 Store ──→ 1.5 Composable
 │                               └──→ 1.6 Fallback vars
 └── 1.3 Service registry + 1.4 Main init
         │
    ┌────┴────────────┐
    ▼                 ▼
PR 2 (Report Fixes)  PR 3 (Admin Module)
2.1 FillPage         3.1-3.7 Clinic module
2.2 PdfExport        3.8 Router
2.3 Renderer         3.9 Sidebar
```
