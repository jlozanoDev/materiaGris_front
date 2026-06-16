# patient-detail Specification

## Purpose

Dedicated patient detail page with tabbed navigation: general demographics and patient-scoped clinical reports.

## Requirements

### Requirement: Route `/patients/:id` MUST load detail page

Route `/patients/:id` SHALL lazy-load `PatientDetailPage.vue` with `requiresAuth` guard.

#### Scenario: Authenticated access

- GIVEN authenticated user
- WHEN navigating to `/patients/42`
- THEN `PatientDetailPage.vue` renders with patient header

#### Scenario: Unauthenticated redirect

- GIVEN no access token
- WHEN navigating to `/patients/42`
- THEN redirected to `/login?redirect=%2Fpatients%2F42`

### Requirement: Detail page MUST fetch patient by ID

On mount, page SHALL call `getPatient(id)` which calls `GET /patients/:id`.

#### Scenario: Patient loaded

- GIVEN patient 42 exists
- WHEN page mounts
- THEN name "Ana García" displays in header

#### Scenario: Patient not found

- GIVEN patient 999 does not exist
- WHEN page mounts
- THEN "Paciente no encontrado" error state displays with back-to-list link

#### Scenario: Loading state

- GIVEN fetch in progress
- THEN skeleton placeholders display in both tab panels

### Requirement: Two tabs with Vuetify

Page SHALL render `v-tabs` + `v-tabs-window`: "Datos generales" (index 0) and "Informes clínicos" (index 1).

#### Scenario: Default active tab

- GIVEN page renders
- THEN "Datos generales" tab is active

#### Scenario: Tab switch

- GIVEN "Datos generales" active
- WHEN user clicks "Informes clínicos"
- THEN reports tab becomes active with loaded reports

### Requirement: General data tab MUST render editable form

`PatientGeneralDataTab` SHALL render pre-filled form (Identificación, Personal, Contacto, Dirección) matching current modal fields. Save SHALL call `updatePatient(id, payload)` via `UpdatePatientUseCase`.

#### Scenario: Form pre-filled

- GIVEN patient `gender: "F"`, `city: "Madrid"`, `is_active: true`
- THEN fields show correct values and active toggle is ON

#### Scenario: Save success

- GIVEN user changes city to "Barcelona"
- WHEN user clicks "Guardar"
- THEN `updatePatient` is called, toast shows "Paciente actualizado correctamente", user stays on page

#### Scenario: Save validation error

- GIVEN `first_name` is empty
- WHEN user clicks "Guardar"
- THEN toast shows API error message, form remains open with current values

### Requirement: Reports tab MUST list patient-scoped reports

`PatientReportsTab` SHALL call `getAll({ patient_id })` and display only that patient's reports.

#### Scenario: Reports displayed

- GIVEN patient 42 has 3 reports
- WHEN reports tab activates
- THEN 3 reports appear in list

#### Scenario: Empty state

- GIVEN patient 42 has 0 reports
- WHEN reports tab activates
- THEN "No hay informes clínicos" empty state displays with "Nuevo informe" link visible

#### Scenario: New report link

- GIVEN user on reports tab for patient 42
- WHEN user clicks "Nuevo informe"
- THEN navigates to `/pacientes/42/informe/nuevo`

### Requirement: Edit button MUST navigate to detail

"Editar" button in `PatientsPage.vue` SHALL call `router.push({ name: 'PatientDetail', params: { id } })` instead of opening modal.

#### Scenario: Edit navigates

- GIVEN patient list shows patient 42
- WHEN user clicks the pencil icon
- THEN navigates to `/patients/42` with both tabs available

### Requirement: "+ Nuevo Paciente" modal MUST remain unchanged

The create modal in `PatientsPage.vue` SHALL retain identical behavior: open modal, render empty form, call `createPatient` on save.

## API Contract: GET /patients/:id (Stub)

Backend endpoint does NOT exist. `ApiPatientRepository.getById()` SHALL return:

```json
{
  "id": 42, "medical_record_number": "NHC-001", "national_id": "12345678A",
  "first_name": "Ana", "last_name": "García", "second_last_name": "López",
  "gender": "F", "date_of_birth": "1985-03-15", "city": "Madrid",
  "is_active": true, "insurance_id": "3", "email": "ana@email.test",
  "phone": "912345678", "mobile": "612345678", "contact_name": "Carlos",
  "contact_phone": "698765432", "address_line1": "Calle Mayor 1",
  "address_line2": "2º A", "neighborhood": "Centro", "postal_code": "28013",
  "state": "Madrid", "country": "España"
}
```

Stub returns same hardcoded data regardless of ID. Backend implementation flagged as launch blocker.

## Back-Navigation Contract

Browser back from detail page SHALL return to `/patients`. Filter state preservation is deferred — list reloads fresh.

## Validation Rules

Same as current form: `first_name` and `last_name` are required. Other fields are optional.
