## Exploration: Patient Detail Tabs — Replacing Edit Modal with Detail Page

### Current State

The patients module (`src/modules/patients/`) follows the Hexagonal/Clean Architecture pattern with four layers: domain, infrastructure, application, and presentation. The entire patient CRUD UI is contained in a single monolithic page (`PatientsPage.vue`, 924 lines) that renders the patient list AND an inline `<Modal>` component for creating/editing patients.

### 1. Current Architecture — Patients Module Structure

```
src/modules/patients/
├── domain/
│   ├── entities/Patient.ts              # Re-exports from @/shared/types
│   ├── repositories/PatientRepository.ts # Interface: search(), create(), update()
│   └── use-cases/
│       ├── SearchPatientsUseCase.ts      # search(filters) → Patient[]
│       ├── CreatePatientUseCase.ts       # create(payload) → Patient
│       └── UpdatePatientUseCase.ts       # update(id, payload) → Patient
├── infrastructure/
│   └── ApiPatientRepository.ts          # fetchClient-based implementation
├── application/
│   └── containers/patientsContainer.ts   # DI: provideSearchPatientsUseCase, provideCreatePatient, provideUpdatePatient
└── presentation/
    ├── composables/usePatients.ts        # fetchPatients, createPatient, updatePatient
    └── pages/PatientsPage.vue            # 924-line monolith: list + modal form
```

**Key observation**: There is **no `GetPatientUseCase`**, no `getById()` in the repository, and no single-patient-fetch method in the composable.

### 2. Current Edit Flow (Step by Step)

1. User sees patient list in `PatientsPage.vue` (rendered via `UiVuetifyDataTable`)
2. User clicks the edit button (pencil icon) → `editPatient(data)` is called
3. `editPatient()` populates `form.value` (a reactive `PatientFormData` object with 20+ fields) and sets `editing.value = true`
4. A `<Modal :show="editing" size="max-w-6xl">` becomes visible
5. The modal contains a `<form id="patient-form">` with four sections:
   - **Identificación**: NHC, DNI, Aseguradora ID
   - **Personal**: Nombre, Primer apellido, Segundo apellido, Género, Fecha de nacimiento, Última visita
   - **Contacto** (collapsible): Email, Teléfono, Móvil, Contacto emergencia, Teléfono contacto
   - **Dirección** (collapsible): Dirección L1, Dirección L2, Ciudad, Provincia, Código postal, Barrio, País
6. The form has an Activo toggle in the modal header
7. User clicks "Guardar" → `savePatient()` determines create vs update by checking `form.value?.id`
8. On success → toast notification, `editing = false` (modal closes), `fetchPatients()` refreshes list
9. The same modal handles both **create** (from "+ Nuevo Paciente" button) and **edit** flows

### 3. Patient Data Model

**Core fields** (from `src/shared/types/index.ts` — `Patient` interface):
```
id, medical_record_number, national_id, first_name, last_name,
second_last_name?, gender, date_of_birth, city, insurance_id?, is_active?
```

**Extended form fields** (in `PatientFormData` interface in `PatientsPage.vue`):
```
last_visit_at, email, phone, mobile, contact_name, contact_phone,
address_line1, address_line2, neighborhood, postal_code, state, country
```

**Important**: The `Patient` type in `shared/types` is a subset of what the form handles. Extended fields (contact, address) are passed as `Record<string, unknown>` payloads, trusting the API to handle them.

### 4. API Endpoints

From `ApiPatientRepository.ts`:

| Method | Endpoint | Used by |
|--------|----------|---------|
| `GET` | `/patients/find?q=&gender=...` | Search (list) |
| `POST` | `/patients` | Create |
| `PUT` | `/patients/:id` | Update |
| ❌ | `/patients/:id` (GET) | **MISSING** — no single-patient fetch |

**Reports API** (from `ApiReportRepository.ts`):

| Method | Endpoint | Used by |
|--------|----------|---------|
| `POST` | `/reports` | Init report |
| `GET` | `/reports?status=&patient=` | List all (supports filter params) |
| `GET` | `/reports/:id` | Get single |
| `PUT` | `/reports/:id` | Save draft |
| `POST` | `/reports/:id/sign` | Sign |
| `POST` | `/reports/:id/close` | Close |
| `GET` | `/reports/:id/pdf` | Download PDF |

### 5. Router Structure

From `src/core/router/index.ts`:

```typescript
// Existing patients route — NO child routes, NO :id param
{ path: "/patients", name: "Patients", component: PatientsPage, meta: { requiresAuth: true } }

// Already exists: patient-scoped report creation
{ path: "/pacientes/:id/informe/nuevo", name: "ReportCreate", component: ReportFillPage, meta: { requiresAuth: true, permissions: 'report.create' } }

// Global reports routes
{ path: "/informes", name: "ReportList", component: ReportListPage, meta: { requiresAuth: true, permissions: 'report.view' } }
{ path: "/informes/:id", name: "ReportView", component: ReportViewPage, meta: { requiresAuth: true, permissions: 'report.view' } }
{ path: "/informes/:id/editar", name: "ReportEdit", component: ReportFillPage, meta: { requiresAuth: true, permissions: ['report.edit'] } }
```

**Key finding**: Route `/pacientes/:id/informe/nuevo` already exists for creating a report scoped to a patient. This confirms the backend supports a patient-report relationship. However, there's no `/patients/:id` route for viewing/editing a patient.

### 6. Clinical Reports Status

The `src/modules/reports/` module exists and is **fully formed**:

```
reports/
├── domain/
│   ├── entities/PatientReport.ts
│   ├── repositories/ReportRepository.ts
│   └── use-cases/ (7 use cases)
├── infrastructure/ApiReportRepository.ts
├── application/containers/reportsContainer.ts  (7 providers)
└── presentation/
    ├── composables/useReportList.ts, useReportForm.ts
    ├── components/ (DynamicFormRenderer, DynamicField, DynamicTable, SignaturePad, FixedText)
    └── pages/ (ReportListPage, ReportViewPage, ReportFillPage)
```

**What exists that we can reuse:**
- `useReportList` composable: fetches all reports with optional filters. **It accepts `filters` parameter** — we can pass `{ patient: patientId }` to scope to one patient.
- `useReportForm` composable: `init(patientId, templateId)` method to start a new report for a patient.
- `ReportListPage`: global list, NOT patient-scoped. We need a patient-scoped variant.
- `GET /reports?patient=X` endpoint is supported by the API.

**What's missing for patient-scoped reports:**
- A patient-scoped reports list component (to sit inside a tab)
- A "New Report" flow that's contextualized to the current patient (though the route `/pacientes/:id/informe/nuevo` already handles this)
- The `ReportRepository.getAll()` already supports filters, so filtering by patient is just a matter of passing the right parameters

### 7. Tab Patterns in the Codebase

**Vuetify v-tabs**: Not used anywhere in the codebase. However, Vuetify IS fully available (all components imported in `src/plugins/vuetify.ts` with `import * as components from "vuetify/components"`). `v-tabs`, `v-tab`, `v-tabs-window`, `v-tabs-window-item` are all available.

**Custom button tabs**: Used in `ReportTemplateBuilderPage.vue` (zoneTabs: Cabecera/Cuerpo/Pie). Pattern:
```vue
<div class="flex gap-1">
  <button v-for="tab in zoneTabs" :key="tab.key"
    :class="activeZone === tab.key ? 'bg-[#ede9fe] text-[#7c3aed]' : 'text-[#9690a8]'"
    @click="switchZone(tab.key)"
  >
    <i :class="tab.icon" /> {{ tab.label }}
  </button>
</div>
```

**Recommendation**: Use Vuetify's `v-tabs` for the patient detail page. It provides proper ARIA roles, keyboard navigation, and slide transitions out of the box. The project already has Vuetify installed and configured.

### 8. Key Files Inventory

**Files that will be modified:**

| File | Change |
|------|--------|
| `src/modules/patients/domain/repositories/PatientRepository.ts` | Add `getById(id)` method to interface |
| `src/modules/patients/infrastructure/ApiPatientRepository.ts` | Implement `getById(id)` → `GET /patients/:id` |
| `src/modules/patients/domain/use-cases/` | **NEW**: `GetPatientUseCase.ts` |
| `src/modules/patients/application/containers/patientsContainer.ts` | Add `provideGetPatientUseCase()` |
| `src/modules/patients/presentation/composables/usePatients.ts` | Add `getPatient(id)` method |
| `src/modules/patients/presentation/pages/PatientsPage.vue` | **Refactor**: Remove modal form (lines 609-919), extract list-only. Repurpose edit button to navigate instead of open modal. |
| `src/core/router/index.ts` | Add `/patients/:id` route with tab query support |
| `tests/patientsContainer.spec.js` | Add test for new container provider |

**Files that will be created:**

| File | Purpose |
|------|---------|
| `src/modules/patients/presentation/pages/PatientDetailPage.vue` | New page: patient detail with tabs |
| `src/modules/patients/presentation/components/PatientGeneralDataTab.vue` | Extracted form from the modal → "Datos generales" tab |
| `src/modules/patients/presentation/components/PatientReportsTab.vue` | Patient-scoped reports list + "New Report" button |

**Files potentially affected:**

| File | Impact |
|------|--------|
| `src/modules/reports/presentation/composables/useReportList.ts` | Minor: may need a patient-filtered variant or the existing `fetchReports({ patient: id })` pattern is sufficient |
| `src/shared/components/Modal.vue` | No changes needed, but PatientsPage.vue will stop using it for patient edit |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Already works for creating reports per patient — no change needed |

### 9. Dependencies

**Stores:**
- `useAuthStore` (`@/core/store/auth`) — user/permissions

**Composables:**
- `usePatients` (`@/modules/patients/presentation/composables/usePatients`) — patient CRUD
- `useReportList` (`@/modules/reports/presentation/composables/useReportList`) — reports list (reusable with patient filter)
- `useReportForm` (`@/modules/reports/presentation/composables/useReportForm`) — report init/edit
- `useToast` (`@/shared/composables/useToast`) — notifications
- `useLogout` (`@/shared/composables/useLogout`)

**Shared components:**
- `AppSidebar`, `TopBarLayout`, `Breadcrumb` — layout
- `Modal` — currently used for edit, will be removed from patient page
- `UiVuetifyDataTable` — patient list (stays unchanged)
- `CustomSelect` — form selects

**Services:**
- `fetchClient` (`@/core/api/httpClient`) — HTTP calls (only in infrastructure layer)

### 10. Gap Analysis — What's Missing vs What's Needed

| Need | Status | Action |
|------|--------|--------|
| Fetch single patient by ID | ❌ Missing | Add `getById` to PatientRepository interface + ApiPatientRepository implementation |
| `GetPatientUseCase` | ❌ Missing | Create new use case class |
| `provideGetPatientUseCase()` | ❌ Missing | Add to patientsContainer |
| `getPatient(id)` in composable | ❌ Missing | Add to usePatients |
| Route `/patients/:id` | ❌ Missing | Add to router |
| PatientDetailPage with tabs | ❌ Missing | Create new page |
| PatientGeneralDataTab | ❌ Missing | Extract form from modal into component |
| PatientReportsTab (scoped list) | ❌ Missing | Create patient-filtered reports list component |
| Edit button → navigation | ❌ Needs change | Replace `editPatient()` modal trigger with `router.push()` |
| Modal removed from PatientsPage | ❌ Needs change | Delete modal-related code, keep create button with modal or navigate to /patients/new |
| "Create patient" flow | ⚠️ Needs decision | Option A: Keep modal for create only. Option B: Navigate to new detail page (`/patients/nuevo`). Option C: Add "Nuevo" as just a special case of the detail page. |
| Patient-scoped report creation | ✅ Already exists | Route `/pacientes/:id/informe/nuevo` already handles this |
| Reports API with patient filter | ✅ Already exists | `GET /reports?patient=X` |
| Tab component | ✅ Available | Vuetify `v-tabs` available (not used yet in codebase, but library is fully loaded) |
| Form validation | ✅ Already exists | Current form has `required` attributes on first_name and last_name; toast for API errors |
| Patient list (unchanged) | ✅ No change | UiVuetifyDataTable stays as-is |

### Recommendation

1. **Add `getById` to the patients module** (repo + use case + container + composable) — small, self-contained change
2. **Create `PatientDetailPage.vue`** as a new page at route `/patients/:id` with two Vuetify `v-tabs`:
   - Tab "Datos generales" — the extracted patient form (read/edit)
   - Tab "Informes clínicos" — patient-scoped reports list with a "Nuevo informe" button
3. **Refactor `PatientsPage.vue`** — remove the modal form code, change the edit button from `editPatient()` to a router navigation
4. **Keep "Nuevo paciente" as a modal** (simplest approach) OR navigate to `/patients/nuevo` (cleaner but more work). Recommend keeping modal for create for now to minimize scope.
5. **Patient-scoped reports list**: The `useReportList` composable already supports filters. Create a `PatientReportsTab.vue` that calls `fetchReports({ patient: id })` on mount.
6. **New report button**: Navigate to the existing `/pacientes/:id/informe/nuevo` route.

### Risks

- **API compatibility risk**: The backend must support `GET /patients/:id`. If it doesn't, this endpoint needs to be added first.
- **Monolith split risk**: Splitting the 924-line PatientsPage.vue is the right move but must be done carefully — the form state management, validation, and save logic need to be preserved.
- **Report list performance**: If a patient has many reports, the patient-scoped list should use pagination (the reports API needs to support this, or we accept client-side pagination).
- **Tab state on navigation**: Should the active tab be reflected in the URL (e.g., `/patients/:id?tab=reports`) or managed in component state? URL-based is more RESTful and allows deep-linking.

### Ready for Proposal

Yes. The exploration reveals a clean refactoring path with minimal API additions (one endpoint: `GET /patients/:id`). The reports module is already well-structured and supports patient-scoped filtering. The main work is extracting the form from the modal into a tab, creating the patient detail page, and wiring navigation.
