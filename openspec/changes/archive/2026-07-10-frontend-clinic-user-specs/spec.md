# Specs for frontend-clinic-user-specs

## Domain: clinic-admin (NEW)

### Purpose

Singleton admin page + Pinia store for clinic data. Fetch from API, display in reports, edit via form.

### Requirement: Clinic store MUST cache clinic data from API

The system MUST provide a Pinia clinic store (`useClinicStore`) that fetches `GET /admin/clinic` and caches the response. Store SHALL expose `clinic` (ref), `loading`, `error`, and `fetchClinic()`.

#### Scenario: Fetch on app init
- GIVEN app starts and user is authenticated
- WHEN `main.ts` calls `clinicStore.fetchClinic()`
- THEN `clinic` ref contains API response with `nombre`, `direccion`, `telefono`, etc.

#### Scenario: API returns 404 (no clinic)
- GIVEN no clinic exists in backend
- WHEN `fetchClinic()` receives 404
- THEN `clinic` is `null`, no error thrown, consumers fall back to empty defaults

#### Scenario: Unauthorized access (401)
- GIVEN token is expired
- WHEN `fetchClinic()` receives 401
- THEN `clinic` remains `null`, existing unauthorized handler triggers redirect

### Requirement: AuthUser MUST include medical professional fields

`AuthUser` interface SHALL include `apellido?`, `num_colegiado?`, `especialidad?`, `telefono?` as nullable fields.

#### Scenario: /me returns new fields
- GIVEN backend `/auth/me` includes `apellido` and `num_colegiado`
- WHEN user data is stored via `useAuthStore`
- THEN `apellido` and `num_colegiado` are accessible on `authStore.user`

#### Scenario: /me omits new fields (backward compat)
- GIVEN backend `/auth/me` does NOT include `apellido`
- WHEN user data is deserialized
- THEN `authStore.user.apellido` is `undefined` — no crash

### Requirement: Admin clinic page MUST allow editing via PUT

The system MUST provide `/admin/clinic` with an edit form for all clinic fields. On save, SHALL call `PUT /admin/clinic` with changed fields. Route MUST require `admin.clinic.update` permission.

#### Scenario: User with permission edits clinic
- GIVEN user has `admin.clinic.update` permission
- WHEN user navigates to `/admin/clinic` and submits modified fields
- THEN `PUT /admin/clinic` sends updated data, page reflects new values

#### Scenario: User without permission is blocked
- GIVEN user lacks `admin.clinic.update`
- WHEN user navigates to `/admin/clinic`
- THEN router guard redirects to dashboard

#### Scenario: Save with validation errors
- GIVEN user enters invalid email in `email` field
- WHEN `PUT /admin/clinic` returns 422
- THEN form displays inline validation errors, no save occurs, field values preserved

### Requirement: Sidebar MUST show "Clínica" entry for authorized users

`AppSidebar` SHALL display "Clínica" option in the Ajustes dropdown when user has `admin.clinic.update` permission. Router SHALL register route at `/admin/clinic`.

#### Scenario: Admin sees clinic entry
- GIVEN user has `admin.clinic.update` permission
- WHEN Ajustes dropdown opens
- THEN "Clínica" entry is visible with a building icon

#### Scenario: Non-admin does not see entry
- GIVEN user lacks `admin.clinic.update`
- WHEN Ajustes dropdown opens
- THEN "Clínica" entry is NOT rendered

---

## Domain: system-variables (MODIFIED)

### ADDED Requirements

### Requirement: Fallback registry MUST include extended medico.* and clinica.* variables

`registerFallbackVariables()` SHALL register 9 new metadata entries: `clinica.email`, `clinica.web`, `clinica.ciudad`, `clinica.provincia`, `clinica.codigo_postal`, `clinica.cuit`, `medico.num_colegiado`, `medico.telefono`, `medico.apellido`.

#### Scenario: Fallback registry includes new variables
- GIVEN backend `/admin/system-variables` returns empty or fails
- WHEN fallback initializes
- THEN `clinica.cuit`, `medico.num_colegiado`, and `medico.apellido` are available for template autocomplete

### Requirement: Shared composable MUST replace duplicated resolver logic

The system MUST provide `useReportVariableResolver(patient, user, clinic)` that registers runtime resolvers for all system variables and returns a `resolve(template: string): string` function. ReportFillPage and ReportPdfExport SHALL consume this composable, removing ~120 duplicated lines.

#### Scenario: Both report pages use shared resolver
- GIVEN composable accepts patient, user, and clinic refs
- WHEN ReportFillPage calls `resolve("{clinica.nombre}")`
- THEN returns clinic name from store data (not hardcoded)

#### Scenario: Null clinic falls back to empty string
- GIVEN clinic store returns `null` (404 or not fetched)
- WHEN resolver evaluates `{clinica.nombre}` or any `clinica.*` variable
- THEN returns `""` — no crash, no "Materia Gris" fallback

### Requirement: medico.matricula MUST resolve from num_colegiado

`medico.matricula` runtime resolver SHALL use `authStore.user.num_colegiado`, NOT `user.email`.

#### Scenario: num_colegiado available
- GIVEN `authStore.user.num_colegiado` is `"12345"`
- WHEN resolver evaluates `{medico.matricula}`
- THEN returns `"12345"`

#### Scenario: num_colegiado is null
- GIVEN `authStore.user.num_colegiado` is `null` or `undefined`
- WHEN resolver evaluates `{medico.matricula}`
- THEN returns `""`

### Requirement: Hardcoded clinic strings MUST be removed

ReportFillPage, ReportPdfExport, and ReportDocumentRenderer SHALL NOT contain hardcoded `"Materia Gris"` strings. Clinic name, address, and phone SHALL come from the clinic store.

#### Scenario: Report renders with live clinic name
- GIVEN clinic store has `nombre: "Clínica Ejemplo"`
- WHEN report displays `{clinica.nombre}`
- THEN "Clínica Ejemplo" appears (not "Materia Gris")

### REMOVED Requirements

### Requirement: Inline resolver blocks in report pages

(Reason: ~120 lines of duplicated resolver registration in ReportFillPage.vue (lines 451–510) and ReportPdfExport.vue (lines 74–134) replaced by shared `useReportVariableResolver` composable.)
(Migration: Import composable; pass patientData, authStore.user, and clinicStore.clinic as arguments.)
