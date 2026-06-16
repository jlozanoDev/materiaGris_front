# Proposal: Patient Detail Tabs

## Intent

Replace the inline patient edit modal with a dedicated detail page featuring tabbed navigation. Doctors need a single patient view to manage both demographics and clinical reports — currently scattered across separate pages and a modal.

## Scope

### In Scope
- New `/patients/:id` route with lazy-loaded `PatientDetailPage.vue`
- Extract current modal form (lines 609-919) into `PatientGeneralDataTab.vue`
- New `PatientReportsTab.vue` — patient-scoped clinical reports list with creation link
- `getById()` in repository interface, infra implementation, use case, container, and composable
- Vuetify `v-tabs` + `v-tabs-window` for tab navigation

### Out of Scope
- "+ Nuevo Paciente" modal — stays in list page, unchanged
- Report editing/viewing — navigates to existing `/informes` routes
- Backend implementation of `GET /patients/:id`
- Spanish route unification beyond `/patients/:id`

## Capabilities

### New Capabilities
- `patient-detail`: Full patient detail view with two tabs — general data and clinical reports

### Modified Capabilities
- None — existing patient list, create modal, and report modules retain identical behavior

## Approach

1. Add `getById(id)` to `PatientRepository` interface → `ApiPatientRepository` → `GetPatientUseCase` → container → `usePatients` composable
2. Create `PatientDetailPage.vue` with `v-tabs` + `v-tabs-window` (2 tabs)
3. Extract form (lines 609-919 of `PatientsPage.vue`) into `PatientGeneralDataTab.vue`; reuse validations, `updatePatient`, and form schema
4. Create `PatientReportsTab.vue` — filtered report list via `GetReportsUseCase`, "Nuevo informe" links to existing `/pacientes/:id/informe/nuevo`
5. Change "editar" button: `editPatient()` → `router.push({ name: 'PatientDetail', params: { id } })`
6. Add route `/patients/:id` → `PatientDetailPage.vue` (lazy-loaded, `requiresAuth`)

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `GET /patients/:id` missing in backend | **High** | Stub in `ApiPatientRepository.getById()`; flag as launch blocker |
| Monolith split breaks form validations | Medium | Extract inline form as-is; validate manually before refactoring |
| Vuetify `v-tabs` never used in codebase | Low | POC with 2 static tabs first; follow Vuetify 4 docs |

## Dependencies

- **CRITICAL BLOCKER**: Backend `GET /patients/:id` endpoint does not exist. `ApiPatientRepository.getById()` will return a stubbed response until backend delivers the endpoint. Specs will define stub contract.

## Success Criteria

- [ ] "Editar" button navigates to `/patients/:id` instead of opening modal
- [ ] Patient detail renders two tabs: "Datos generales" and "Informes clínicos"
- [ ] General data tab shows pre-filled form from `GET /patients/:id` (or stub)
- [ ] Reports tab lists only that patient's reports; "Nuevo informe" links to existing route
- [ ] "+ Nuevo Paciente" modal still works in list page
- [ ] All existing tests pass; new tests cover `GetPatientUseCase` and route

## Estimated Effort

| Artifact | Files | Est. Lines |
|----------|-------|------------|
| `GetPatientUseCase` + repo + container + composable | 4 | ~80 |
| `PatientDetailPage.vue` | 1 | ~60 |
| `PatientGeneralDataTab.vue` (extracted) | 1 | ~300 |
| `PatientReportsTab.vue` | 1 | ~80 |
| Route + PatientsPage edit-button change | 2 | ~10 |
| Tests | 2 | ~80 |
| **Total** | **11** | **~610** |
