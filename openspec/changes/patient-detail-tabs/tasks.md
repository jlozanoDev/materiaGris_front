# Tasks: Patient Detail Tabs

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~610 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation ~80) → PR 2 (UI ~450) → PR 3 (Tests ~80) |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

> **Note on ~300 of the ~610 lines**: PatientGeneralDataTab extraction is a copy-paste relocation from PatientsPage.vue (lines 609–919). Review burden on the moved form is "verify nothing changed in transit" — not new logic. Net new code under review is ~310 lines.

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation: interface + stub + use case + container + composable (~80 lines) | PR 1 | No behavior change; safe standalone merge |
| 2 | Core UI: tabs, page, form extraction, reports tab, route, edit-button (~450 lines, ~300 moved) | PR 2 | Feature deliverable; depends on PR 1 |
| 3 | Tests: use-case unit + composable unit + page integration (~80 lines) | PR 3 | Depends on PR 2 |

## Dependency Graph

```
1.1 → 1.2, 1.3 → 1.4 → 1.5 → 2.3 → 4.x
2.1 ────────────────→ 2.3 → 4.x
2.2 ────────────────→ 2.3 → 4.x
3.1 ────────────────→ 2.3
3.2 ────────────────→ 2.3 (navigation target)
```

## Phase 1: Foundation

- [x] 1.1 Add `getById(id: number | string): Promise<Patient>` to `PatientRepository` interface in `src/modules/patients/domain/repositories/PatientRepository.ts`
- [x] 1.2 Implement `getById(id)` stub in `src/modules/patients/infrastructure/ApiPatientRepository.ts` — returns hardcoded Patient with given ID, `console.warn("[STUB]")`, matches `api-spec-get-patient.md` stub contract
- [x] 1.3 Create `src/modules/patients/domain/use-cases/GetPatientUseCase.ts` — `constructor(repo)`, `execute(id)` → `repo.getById(id)`
- [x] 1.4 Add `provideGetPatientUseCase()` to `src/modules/patients/application/containers/patientsContainer.ts` — instantiates `ApiPatientRepository` + `GetPatientUseCase`
- [x] 1.5 Extend `src/modules/patients/presentation/composables/usePatients.ts` — add `patient` ref, `patientLoading` ref, `fetchPatientById(id)` calling `provideGetPatientUseCase().execute(id)`, error handling, export in `UsePatientsReturn`

## Phase 2: UI Components

- [x] 2.1 Extract `PatientGeneralDataTab.vue` from `PatientsPage.vue` lines 609–919 into `src/modules/patients/presentation/components/PatientGeneralDataTab.vue` — copy-paste-as-is: Modal body → component template, props: `patient: PatientFormData`, `saving: boolean`, emits: `save`. Preserve all validation, CustomSelect, collapsible sections, active-toggle
- [x] 2.2 Create `src/modules/patients/presentation/components/PatientReportsTab.vue` — props: `patientId`, uses `useReportList().fetchReports({ patient_id: patientId })`, renders report list with status badges, empty state "No hay informes clínicos", "Nuevo informe" link → `/pacientes/:patientId/informe/nuevo`
- [x] 2.3 Create `src/modules/patients/presentation/pages/PatientDetailPage.vue` — imports AppSidebar, Breadcrumb, TopBarLayout, `v-tabs`/`v-tabs-window`, `PatientGeneralDataTab`, `PatientReportsTab`. Calls `fetchPatientById(id)` on mount. Props-down patient data to tabs. Handles loading (skeleton), error ("Paciente no encontrado"), and save event → `updatePatient`

## Phase 3: Wiring

- [x] 3.1 Add `/patients/:id` route to `src/core/router/index.ts` — name: `PatientDetail`, lazy-load `PatientDetailPage.vue`, `meta: { requiresAuth: true }`
- [x] 3.2 Change `editPatient()` in `src/modules/patients/presentation/pages/PatientsPage.vue` — replace `editing.value = true` + form population with `router.push({ name: 'PatientDetail', params: { id: data.id } })`. Remove unused `editing` modal logic only if no other modal uses it

## Phase 4: Tests

- [ ] 4.1 Unit test `GetPatientUseCase` — inject mock `PatientRepository`, verify `getById(id)` called, verify return value
- [ ] 4.2 Unit test `fetchPatientById` composable — mock `provideGetPatientUseCase`, verify `patient` ref populated on success and `patientLoading` transitions
- [ ] 4.3 Integration test `PatientDetailPage` — mount with stubbed router + useCase, verify both tabs render, tab switching works, "Nuevo informe" link points to correct route

## Risks

| Task | Risk | Mitigation |
|------|------|------------|
| 1.2 | Stub diverges from future real endpoint shape | Follow `api-spec-get-patient.md` contract exactly; add `console.warn` for visibility |
| 2.1 | Form extraction breaks validations during copy | Copy verbatim first, then verify manually. Dedicated review PR for this task. |
| 2.2 | `useReportList().fetchReports({ patient_id })` filtering may not work if API doesn't support query param | Verify by tracing `ApiReportRepository.getAll()`→`URLSearchParams` chain |
| 3.2 | Removing `editing` state may break "+ Nuevo Paciente" modal | Check `editing` usage: create modal uses `creating`, not `editing`. Safe to keep `editing` ref if only edit removed. |
