# Delta for dynamic-form-renderer

## ADDED Requirements

### Requirement: ApiReportRepository MUST normalize API response keys

`ApiReportRepository.getById()` and `initReport()` SHALL transform backend snake_case to camelCase before returning. Mapping: `template_structure_snapshot`→`templateStructureSnapshot`, `patient_id`→`patientId`, `template_id`→`templateId`, `user_id`→`userId`, `created_at`→`createdAt`, `updated_at`→`updatedAt`. Unknown keys SHALL pass through unchanged. Normalization MUST be a dedicated function applied to the raw JSON response before any consumer receives it.

#### Scenario: getById normalizes keys

- GIVEN backend returns `{ template_structure_snapshot: { sections: [...] }, patient_id: 42, created_at: "2026-01-01" }`
- WHEN `getById(1)` resolves
- THEN returned object has keys `templateStructureSnapshot`, `patientId`, `createdAt`
- AND nested `sections` array is preserved unchanged

#### Scenario: initReport normalizes keys

- GIVEN `POST /reports` returns `{ id: 1, template_structure_snapshot: {...} }`
- WHEN `initReport("42", "7")` resolves
- THEN returned object has property `templateStructureSnapshot` (not `template_structure_snapshot`)

### Requirement: DynamicFormRenderer MUST accept and propagate variableResolver

The component SHALL accept an optional `variableResolver: (text: string) => string` prop. When provided, it MUST be passed to every `DynamicField` instance — in editable body sections AND read-only header/footer zones. Omitting the prop SHALL NOT break rendering; `fixed_text` fields shall render unresolved placeholder text.

#### Scenario: Header fixed_text resolves with resolver

- GIVEN header contains a `fixed_text` field with `text_content: "Paciente: {paciente.nombre}"`
- AND `variableResolver` replaces `{paciente.nombre}` → "Juan Pérez"
- WHEN form mounts
- THEN header displays "Paciente: Juan Pérez"

#### Scenario: No resolver — unresolved text OK

- GIVEN `variableResolver` is not passed
- WHEN a `fixed_text` field renders containing `{paciente.nombre}`
- THEN literal text `{paciente.nombre}` displays — no crash

### Requirement: ReportFillPage MUST display error on load failure

`useReportForm.loadReport()` and `init()` SHALL catch errors and expose `loadingError: Ref<string | null>`. `ReportFillPage` MUST render an error banner when `loadingError` is set, replacing the loading skeleton. The banner SHALL show the message and a "Reintentar" button.

#### Scenario: Edit load fails

- GIVEN `GET /reports/:id` returns 500
- WHEN `ReportFillPage` mounts in edit mode
- THEN page displays "Error al cargar el informe" and a "Reintentar" button
- AND loading skeleton is NOT visible

#### Scenario: Create init fails

- GIVEN `POST /reports` returns 500
- WHEN `ReportFillPage` mounts in create mode with valid patientId and templateId
- THEN page displays error message and retry button

## MODIFIED Requirements

### Requirement: Texto Fijo MUST render as static interpolated text

No input control. Variables resolved at render time via `variableResolver` wired through `DynamicFormRenderer` → `DynamicField` → `FixedTextRenderer`. If no resolver is provided, placeholder text SHALL render as literal text.
(Previously: `FixedTextRenderer` declared `variableResolver` prop but `DynamicField` never passed one — variables always rendered unresolved)

#### Scenario: Texto Fijo renders read-only with resolved variable

- GIVEN `fixed_text` field with `text_content: "Médico: {usuario.nombre_completo}"`
- AND `variableResolver` replaces `{usuario.nombre_completo}` → "Dr. García"
- WHEN form renders
- THEN field shows "Médico: Dr. García" — no input, no border

#### Scenario: Texto Fijo without resolver shows raw

- GIVEN `fixed_text` field with `text_content: "Médico: {usuario.nombre_completo}"`
- AND no `variableResolver` is provided
- WHEN form renders
- THEN field shows literal "Médico: {usuario.nombre_completo}" — no error
