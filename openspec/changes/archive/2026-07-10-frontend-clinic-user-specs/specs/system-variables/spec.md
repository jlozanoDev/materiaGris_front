# Delta for system-variables

## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Inline resolver blocks in report pages

(Reason: ~120 lines of duplicated resolver registration in ReportFillPage.vue (lines 451–510) and ReportPdfExport.vue (lines 74–134) replaced by shared `useReportVariableResolver` composable.)
(Migration: Import composable; pass patientData, authStore.user, and clinicStore.clinic as arguments.)
