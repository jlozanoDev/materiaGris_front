# Design: Patient Detail Tabs

## Technical Approach

Replace PatientsPage modal-based editing with a dedicated `/patients/:id` route. Extract the inline form (lines 609–919) into `PatientGeneralDataTab.vue` as a standalone component receiving the patient via props. Add a `PatientReportsTab.vue` that reuses the existing `useReportList()` composable filtered by `patient_id`. Wire a new `GetPatientUseCase` through the DI container to populate the detail page.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Form extraction | Copy-paste-as-is from PatientsPage.vue | Over-engineer with shared composable | Preserves validations; zero regression risk. Refactoring comes later as a separate change. |
| Stub response shape | Match full PatientFormData interface (23 fields) | Minimal Patient entity (11 fields) | Form expects 23 fields; partial stub breaks pre-fill on contact/address sections. |
| Tab component communication | Props-down, events-up | Provide/inject, Pinia store | Props are explicit. Two tabs share no mutable state. `v-model:activeTab` stays in the page. |
| Reports integration | `useReportList()` with `{ patient_id: id }` filter | New dedicated composable | ApiReportRepository.getAll() already supports arbitrary query params via URLSearchParams. Minimal code. |
| `getById()` return type | `Promise<Patient>` (re-exported from shared/types) | `Promise<any>` | Follows `PatientRepository` convention (search returns Patient[]). Consistency over strictness — existing methods return `any`. |
| Loading/error per tab | Each tab owns `loading`/`error` refs locally | Single page-level state | Each tab fetches independently. Isolates failure; avoids blocking one tab on another. |

## Data Flow

```
Route :id ──→ PatientDetailPage (onMounted)
                  │
                  ├─ usePatients().fetchPatientById(id) → GetPatientUseCase
                  │     └─ ApiPatientRepository.getById(id) → GET /patients/:id (stub)
                  │           └─ returns full patient object
                  │                 └─ patient ref populates PatientGeneralDataTab
                  │
                  └─ PatientReportsTab (mounted)
                        └─ useReportList().fetchReports({ patient_id: id })
                              └─ ApiReportRepository.getAll({ patient_id: id })
                                    └─ GET /reports?patient_id={id}
```

## Component Tree

```
PatientDetailPage
├─ AppSidebar
├─ Breadcrumb
├─ TopBarLayout
├─ v-tabs (v-model:activeTab)
│  ├─ v-tab(0): "Datos generales"
│  └─ v-tab(1): "Informes clínicos"
└─ v-tabs-window
   ├─ v-tabs-window-item(0)
   │  └─ PatientGeneralDataTab (:patient, @saved, @cancel)
   └─ v-tabs-window-item(1)
      └─ PatientReportsTab (:patient-id)
```

## Route Definition

```ts
// src/core/router/index.ts — new entry
{
  path: "/patients/:id",
  name: "PatientDetail",
  component: () => import("@/modules/patients/presentation/pages/PatientDetailPage.vue"),
  meta: { requiresAuth: true },
}
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/modules/patients/presentation/pages/PatientDetailPage.vue` | **Create** | Detail page shell: sidebar, breadcrumb, topbar, v-tabs + v-tabs-window |
| `src/modules/patients/presentation/components/PatientGeneralDataTab.vue` | **Create** | Extracted form (lines 609–919). Props: `patient: PatientFormData`, `loading: boolean`. Emits: `saved` |
| `src/modules/patients/presentation/components/PatientReportsTab.vue` | **Create** | Reports list filtered by patient. Props: `patientId: string \| number` |
| `src/modules/patients/domain/use-cases/GetPatientUseCase.ts` | **Create** | `constructor(repo: PatientRepository)`, `execute(id) → repo.getById(id)` |
| `src/modules/patients/domain/repositories/PatientRepository.ts` | **Modify** | Add `getById(id: number \| string): Promise<Patient>` to interface |
| `src/modules/patients/infrastructure/ApiPatientRepository.ts` | **Modify** | Implement `getById(id)` — returns stub Patient matching form fields |
| `src/modules/patients/application/containers/patientsContainer.ts` | **Modify** | Add `provideGetPatientUseCase()` |
| `src/modules/patients/presentation/composables/usePatients.ts` | **Modify** | Add `fetchPatientById(id)` + `patient` ref + `patientLoading` |
| `src/core/router/index.ts` | **Modify** | Add `/patients/:id` route (lazy-loaded, requiresAuth) |
| `src/modules/patients/presentation/pages/PatientsPage.vue` | **Modify** | Change `editPatient(data)` from modal to `router.push({ name: 'PatientDetail', params: { id: data.id } })` |

## Component Contracts

### PatientGeneralDataTab

```ts
// Props
interface Props {
  patient: PatientFormData;      // pre-filled form data (shallow copy)
  saving: boolean;               // disables save button
}

// Emits
interface Emits {
  (e: 'save', payload: Record<string, unknown>): void;  // id + form fields
}

// Internal: keeps local deep copy of patient to avoid mutating prop.
// Uses same PatientFormData interface & CustomSelect for gender.
// Collapsible sections (contact, address) lifted as-is from PatientsPage.
```

### PatientReportsTab

```ts
// Props
interface Props {
  patientId: string | number;
}

// Internal: const { reports, loading, error, fetchReports } = useReportList()
// onMounted → fetchReports({ patient_id: patientId })
// Links to existing /pacientes/:patientId/informe/nuevo route
```

### usePatients (extended)

```ts
// New members
const patient: Ref<Patient | null> = ref(null);
const patientLoading: Ref<boolean> = ref(false);

async function fetchPatientById(id: string | number): Promise<void> {
  patientLoading.value = true;
  try {
    patient.value = await provideGetPatientUseCase().execute(id);
  } catch (e) {
    error.value = e;
  } finally {
    patientLoading.value = false;
  }
}
```

### ApiPatientRepository.getById() — Stub Contract

```ts
async getById(id: number | string): Promise<any> {
  // STUB — backend GET /patients/:id does not exist yet.
  // Returns a realistic Patient object matching PatientFormData shape.
  // Launch blocker: replace with fetchClient(`/patients/${id}`) when endpoint is ready.
  return {
    id,
    medical_record_number: "STUB-NHC-0001",
    national_id: "00000000T",
    first_name: "Paciente",
    last_name: "Stub",
    second_last_name: "",
    gender: "",
    date_of_birth: "",
    last_visit_at: "",
    city: "",
    is_active: true,
    insurance_id: "",
    email: "",
    phone: "",
    mobile: "",
    contact_name: "",
    contact_phone: "",
    address_line1: "",
    address_line2: "",
    neighborhood: "",
    postal_code: "",
    state: "",
    country: "",
  };
}
```

## DI Container Update

```ts
// patientsContainer.ts — addition
export function provideGetPatientUseCase(): GetPatientUseCase {
  return new GetPatientUseCase(new ApiPatientRepository());
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | `GetPatientUseCase` | Inject mock `PatientRepository`, verify `getById(id)` called |
| Unit | `usePatients.fetchPatientById` | Mock `provideGetPatientUseCase`, verify `patient` ref populated |
| Integration | `PatientDetailPage` route render | Mount with router mock, verify both tabs render |
| Integration | `PatientReportsTab` filter | Mock `useReportList`, verify `fetchReports({ patient_id })` called |
| E2E | Edit button → detail page | Click "Editar" → assert navigation to `/patients/:id` |
| E2E | Tab switching | Click "Informes clínicos" tab → assert reports list visible |

## Error & Loading States

- **Detail page**: Full-page skeleton while `patientLoading` is true; error banner if fetch fails.
- **GeneralDataTab**: Form fields disabled + overlay spinner while `saving`; toast on success/failure.
- **ReportsTab**: Skeleton table or spinner while `loading`; "No hay informes" if `reports.length === 0`; "Error al cargar informes" if `error`.

## Migration / Rollout

No migration required. The "+ Nuevo Paciente" modal stays unchanged in PatientsPage. "Editar" button changes from modal-open to router push — zero data migration, purely client-side navigation shift.

## Open Questions

- [ ] Backend `GET /patients/:id` delivery timeline — stub returns fake data until ready
- [ ] Should `PatientReportsTab` show report status badges (draft/signed/closed)? (Design asks for list only)
- [ ] Form fields marked `required` in PatientsPage (`first_name`, `last_name`) — keep same validation in tab?
