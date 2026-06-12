# Delta for dynamic-form-renderer

## Purpose

Runtime form engine that reads a JSON `structure` (from template snapshot) and renders a reactive Vue form. Supports all component types: text, textarea, date, select, radio, checkbox, dynamic tables, and signature canvas. Two-way reactive binding to a `values` object. Form editability is gated by granular permission slugs.

## MODIFIED Requirements

### Requirement: JSON-to-Form Rendering

The system MUST recursively parse the template JSON tree and render corresponding Vue form components.

#### Scenario: Render a simple form from snapshot

- GIVEN a `template_structure_snapshot` JSON with 1 section, 1 row, 1 column, and 2 fields (text + date)
- WHEN the DynamicForm component receives the snapshot prop
- THEN it renders a section heading, a single-row layout, and two input fields (text + date picker)
- AND each field displays its configured label and placeholder

#### Scenario: Render multi-column layout

- GIVEN a snapshot where a row has `columns: 2` with field A in column 1 and field B in column 2
- WHEN the form renders
- THEN field A and field B appear side-by-side in a 2-column grid
- AND on mobile viewport (<768px), fields stack vertically

#### Scenario: Render sections as tabs

- GIVEN a snapshot with 3 sections configured with `display: "tabs"`
- WHEN the form renders
- THEN a tab bar displays the 3 section names
- AND only the active tab's fields are visible
- AND switching tabs preserves entered values

#### Scenario: Render sections as accordions

- GIVEN a snapshot with sections configured with `display: "accordion"`
- WHEN the form renders
- THEN each section renders as a collapsible panel
- AND expanding one panel collapses others (accordion behavior) by default

### Requirement: Component Type Support

The system MUST render all 8 supported component types with correct behavior.

#### Scenario: Each component type renders correctly

- GIVEN a template structure with one field of each supported type
- WHEN the DynamicForm renders
- THEN the following components appear:
  - `text` → `<input type="text">`
  - `textarea` → `<textarea>` with configurable rows
  - `date` → `<input type="date">` or date picker component
  - `select` → `<select>` with configured options
  - `radio` → radio button group with configured options
  - `checkbox` → checkbox group with configured options
  - `dynamic_table` → table with defined columns and "Añadir fila" button
  - `signature` → HTML5 canvas component

#### Scenario: Dynamic table add/remove rows

- GIVEN a dynamic table field with columns: [Medicamento, Dosis, Frecuencia]
- WHEN user clicks "Añadir fila"
- THEN a new editable row appears
- WHEN user clicks delete on a row
- THEN that row is removed
- AND table data is stored as array in `values[key]`

#### Scenario: System variable fields are pre-filled and read-only

- GIVEN a field configured with system variable `{{paciente.nombre_completo}}`
- WHEN the form renders
- THEN the field displays the patient's full name pre-filled
- AND the field is visually distinct (read-only or disabled)
- AND the value is automatically included in `values` payload

### Requirement: Reactive Value Binding

The system MUST bind form inputs to a reactive `values` object that updates in real-time.

#### Scenario: Two-way binding updates values object

- GIVEN a form with 3 fields: nombre (text), fecha_nac (date), motivo (textarea)
- WHEN user types in the nombre field
- THEN `values.nombre` updates on each keystroke
- AND conditional logic can react to the change immediately

#### Scenario: Auto-save on change (debounced)

- GIVEN the form is in DRAFT state
- WHEN user modifies any field
- THEN the system SHALL debounce and auto-save to backend after 2 seconds of inactivity
- AND the save indicator shows "Guardando..." then "Guardado"

## ADDED Requirements

### Requirement: Permission Enforcement

The DynamicFormRenderer MUST determine its edit mode based on the current user's permissions, checked on mount. It does NOT rely on user role.

#### Scenario: User with `report.edit` sees editable form in draft state

- GIVEN a report in DRAFT status
- AND the current user has permission `report.edit`
- WHEN the DynamicForm mounts
- THEN `authStore.hasPermission('report.edit')` returns true
- AND all form inputs render as editable
- AND save/sign/close action buttons appear (further gated by lifecycle-specific permissions)

#### Scenario: User with `report.view` but WITHOUT `report.edit` sees read-only form

- GIVEN a report in any status
- AND the current user has permission `report.view` but NOT `report.edit`
- WHEN the DynamicForm mounts
- THEN `authStore.hasPermission('report.edit')` returns false
- AND all form inputs render read-only (disabled)
- AND no edit/save/sign/close action buttons are visible

#### Scenario: User with `report.create` can initiate a new report

- GIVEN a patient profile page with "Nuevo informe" action available
- AND the current user has permission `report.create`
- WHEN clicking "Nuevo informe"
- THEN a report is initialized with snapshot
- AND the DynamicForm renders in editable mode

#### Scenario: Permission check runs on mount

- GIVEN any report form page loads
- WHEN the DynamicForm component's `onMounted` runs
- THEN it calls `authStore.hasPermission('report.edit')` to determine edit mode
- AND sets a reactive `isEditable` flag that controls input `:disabled` bindings

#### Scenario: User with neither `report.view` nor `report.edit` is denied

- GIVEN a user WITHOUT `report.view` and WITHOUT `report.edit`
- WHEN attempting to access the report form URL directly
- THEN the route guard checks `meta.permissions` and redirects to Dashboard
- AND the DynamicForm never mounts

### Requirement: Edge Cases

#### Scenario: Form renders with empty snapshot

- GIVEN a template_structure_snapshot with `sections: []`
- WHEN DynamicForm renders
- THEN it displays "Este informe no tiene campos configurados"

#### Scenario: Unknown component type in JSON

- GIVEN a field with `type: "unknown_type"`
- WHEN DynamicForm encounters it
- THEN it renders a placeholder with "Tipo de campo no soportado" and logs a warning
- AND other valid fields still render normally

#### Scenario: Load existing report values

- GIVEN a saved report with existing `values: {campo_1: "Hola", campo_2: "2025-06-01"}`
- WHEN DynamicForm loads the report
- THEN all fields display their saved values
- AND the form editability is determined by user permissions (not the report status alone)

## Acceptance Criteria

- Recursively renders complete JSON structure (sections→rows→columns→fields)
- All 8 component types render and function correctly
- Two-way reactive binding to `values` with no lost keystrokes
- System variable fields are pre-filled and read-only
- Multi-column layouts collapse to single column on mobile
- Empty snapshot renders a meaningful empty state, not a crash
- `report.edit` permission gates editable vs read-only mode
- `report.view` permission allows read-only access without edit rights
- `report.create` permission gates report initiation
- Form checks `authStore.hasPermission()` on mount, not role
