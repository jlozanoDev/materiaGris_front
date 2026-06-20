# dynamic-form-renderer Specification

## Purpose

Renders report form fields based on template config. Maps each field type to its correct Vue component with type-specific rendering. Handles Texto Fijo (read-only) and Tabla Dinámica (editable rows with footer totals).

## Requirements

### Requirement: Renderer MUST dispatch to correct component by field type

`DynamicField.vue` SHALL map `field.type` to a dedicated component. Unknown types MUST render error message, not crash.

| Type | Component behavior |
|------|--------------------|
| Texto Corto | `<input>` text, maxlength from `max_chars` |
| Texto Largo | `<textarea>`, maxlength from `max_chars` |
| Número | `<input type="number">`, step from `decimals` |
| Fecha | `<input type="date">`, min/max from `min_date`/`max_date` |
| Selección | `<select>` single-choice from `options` |
| Sel. Múltiple | `<select multiple>` |
| Opción Única | Radio group from `options` |
| Checkbox | Checkbox group from `options` |
| Texto Fijo | Read-only text with variable interpolation |
| Tabla Dinámica | Editable table with columns, row add/remove, footer totals |

#### Scenario: Each type renders correctly

- GIVEN template with all 10 field types
- WHEN form renders
- THEN each field uses the correct input control per the mapping above

#### Scenario: Unknown type renders error

- GIVEN field config has `type: "legacy_signature"` (not in registry)
- WHEN form renders
- THEN field displays "Tipo no soportado: legacy_signature" — no crash

### Requirement: Tabla Dinámica MUST support editable rows and footer totals

Columns define `name`, `type`, `required`, `calculated`. Users MAY add/remove rows. Footer SHALL display totals for calculated columns.

#### Scenario: Add row and see footer update

- GIVEN table has columns: `item (text)`, `cantidad (number)`, `subtotal (calculated = cantidad * precio_unitario)`
- WHEN user fills row: item="Guantes", cantidad=5
- THEN footer shows cantidad total updated to 5
- AND new row button adds empty row below

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

### Requirement: REQ-001 — DynamicField MUST render text-only when disabled

When `DynamicField` receives `disabled=true`, editable field types (text, textarea, number, date, select, multi_select, radio, checkbox) SHALL render a static `<span>` with the formatted value instead of a disabled `<input>` or `<select>`. The field label, required asterisk, and overall layout MUST remain unchanged.

Types `fixed_text`, `dynamic_table`, `vertical_separator`, and `horizontal_separator` SHALL NOT change their disabled rendering — they already handle readonly naturally.

Formats per type:
| Type | Format |
|------|--------|
| `text`, `textarea`, `number` | Raw value as string. Empty → `—` |
| `date` | `toLocaleDateString('es-ES')`. Empty → `—` |
| `select`, `radio` | Selected option label from `field.options`. Empty → `—` |
| `multi_select`, `checkbox` | Comma-separated list of selected option labels. Empty → `—` |

The `<span>` MUST use the same visual styling as the current form text (text-gray-700, text-sm).

#### Scenario: Text field renders as static span

- GIVEN a DynamicField with `type="text"`, `disabled=true`, `modelValue="Hola"`
- WHEN the component renders
- THEN a `<span>` displays "Hola"
- AND no `<input>` element is present

#### Scenario: Date field renders locale-formatted

- GIVEN a DynamicField with `type="date"`, `disabled=true`, `modelValue="2026-06-19"`
- WHEN the component renders
- THEN a `<span>` displays "19/06/2026" (es-ES format)
- AND no `<input type="date">` element is present

#### Scenario: Multi-select renders comma-separated labels

- GIVEN a DynamicField with `type="multi_select"`, `disabled=true`, `modelValue=["a","c"]`, options `[{label:"Opción A",value:"a"},{label:"Opción B",value:"b"},{label:"Opción C",value:"c"}]`
- WHEN the component renders
- THEN a `<span>` displays "Opción A, Opción C"
- AND no `<select>` element is present

#### Scenario: Empty value renders em-dash

- GIVEN a DynamicField with `type="text"`, `disabled=true`, `modelValue=""`
- WHEN the component renders
- THEN a `<span>` displays "—"

#### Scenario: Fixed text and dynamic table are unchanged

- GIVEN a DynamicField with `type="fixed_text"` and `disabled=true`
- WHEN the component renders
- THEN `FixedTextRenderer` renders normally (no behavioral change)
- AND for `type="dynamic_table"` with `disabled=true`, `DynamicTable` receives `disabled` prop as before

#### Scenario: Vertical and horizontal separators still render

- GIVEN a DynamicField with `type="vertical_separator"` or `type="horizontal_separator"`, `disabled=true`
- WHEN the component renders
- THEN the separator renders identically to non-disabled mode

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
