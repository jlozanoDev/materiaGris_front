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

No input control. Variables resolved at render time via `SystemVariableRegistry`.

#### Scenario: Texto Fijo renders read-only

- GIVEN field type is `fixed_text` with `text_content: "Médico: {usuario.nombre_completo}"`
- WHEN form renders
- THEN field shows static text "Médico: Dr. García" — no input, no border
