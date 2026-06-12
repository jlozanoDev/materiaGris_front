# Delta for template-builder

## Purpose

Admin-facing drag-drop designer for creating report templates with nested section/row/column/field hierarchy. CRUD operations for templates stored as JSON structure in backend. Every action is gated by granular permission slugs — no role check is sufficient.

## MODIFIED Requirements

### Requirement: Template CRUD Operations

The system MUST provide CRUD operations for report templates, each gated by a specific permission slug. A user with role "admin" but without the corresponding slug SHALL be denied. A user with another role but WITH the slug SHALL be allowed.

(Previously: CRUD was described as "admin-only" without specifying per-action permission slugs.)

#### Scenario: User with `admin.reporttemplate.view` lists templates

- GIVEN a user with permission `admin.reporttemplate.view`
- WHEN navigating to `/admin/report-templates`
- THEN the system displays a table of templates with columns: name, description, active status, last modified date
- AND each row has edit and delete actions (visible/hidden per further permissions)

#### Scenario: User WITHOUT `admin.reporttemplate.view` is denied access

- GIVEN a user WITHOUT permission `admin.reporttemplate.view`
- WHEN navigating to `/admin/report-templates` (direct URL or sidebar link)
- THEN the route guard redirects to Dashboard
- AND the sidebar link is NOT rendered

#### Scenario: User with `admin.reporttemplate.create` can create templates

- GIVEN a user with permission `admin.reporttemplate.create`
- WHEN on the template listing page
- THEN the "Nueva plantilla de informe" button is visible
- AND clicking it opens the builder with an empty canvas and a component palette

#### Scenario: User WITHOUT `admin.reporttemplate.create` sees no create action

- GIVEN a user with `admin.reporttemplate.view` but WITHOUT `admin.reporttemplate.create`
- WHEN on the template listing page
- THEN the "Nueva plantilla de informe" button is hidden

#### Scenario: User with `admin.reporttemplate.update` can edit templates

- GIVEN a user with permission `admin.reporttemplate.update`
- WHEN clicking edit on a template row
- THEN the builder loads the existing template structure
- AND all fields and property panels are editable

#### Scenario: User WITHOUT `admin.reporttemplate.update` cannot edit

- GIVEN a user with `admin.reporttemplate.view` but WITHOUT `admin.reporttemplate.update`
- WHEN viewing the template listing
- THEN the edit action button is hidden or disabled

#### Scenario: User with `admin.reporttemplate.delete` can delete unused templates

- GIVEN a user with permission `admin.reporttemplate.delete`
- AND a template with zero associated patient reports
- WHEN clicking delete and confirming
- THEN the template is permanently removed

#### Scenario: User WITHOUT `admin.reporttemplate.delete` sees no delete action

- GIVEN a user with `admin.reporttemplate.view` but WITHOUT `admin.reporttemplate.delete`
- WHEN viewing the template listing
- THEN the delete action button is hidden

#### Scenario: Template with existing reports blocks deletion regardless of permission

- GIVEN a user WITH `admin.reporttemplate.delete`
- AND a template with at least one associated patient report
- WHEN attempting deletion
- THEN the system SHALL return an error
- AND the UI displays "No se puede eliminar: existen informes asociados"

#### Scenario: Admin deactivates a template

- GIVEN a user with `admin.reporttemplate.update` (deactivation is an edit operation)
- AND an active template with existing patient reports
- WHEN toggling `is_active` to false
- THEN the template is hidden from the "new report" selection for physicians
- AND existing reports remain accessible (snapshot isolation)

### Requirement: Drag-Drop Hierarchy Builder

The system MUST support a 4-level nested drag-drop hierarchy: Sections → Rows → Columns → Fields.

#### Scenario: User builds a multi-section template

- GIVEN a user with `admin.reporttemplate.create` (or `admin.reporttemplate.update`) and an empty template canvas
- WHEN dragging a Section component onto the canvas
- THEN a section container appears
- WHEN dragging a Row into that section
- THEN a row with default 1-column appears inside the section
- WHEN configuring the row to have 2 columns
- THEN two column drop zones appear inside the row
- WHEN dragging a Field into a column
- THEN the field renders with its type icon and label

#### Scenario: User reorders components via drag

- GIVEN a user with `admin.reporttemplate.update` and a template with multiple sections
- WHEN dragging section B above section A
- THEN the section order updates in real-time and in the JSON structure
- AND the same reordering works for rows within sections and fields within columns

#### Scenario: User removes a component

- GIVEN a user with `admin.reporttemplate.update` and a field inside a column
- WHEN clicking the delete icon on the field
- THEN the field is removed from the structure
- AND any conditional rules referencing this field MUST be flagged

### Requirement: Field Property Configuration

The system MUST provide a property panel for configuring field attributes when a field is selected.

#### Scenario: User configures a text field

- GIVEN a user with `admin.reporttemplate.update` selects a "Texto Corto" field in the builder
- WHEN the property panel opens
- THEN it shows inputs for: Label, Key (auto-generated slug), Placeholder, Required toggle, System Variable selector
- AND changes reflect in the canvas preview in real-time

#### Scenario: User sets a system variable for auto-fill

- GIVEN a user with `admin.reporttemplate.update` and a field property panel with the system variable selector
- WHEN selecting `{{paciente.nombre_completo}}`
- THEN the field key is flagged as system-variable-bound
- AND when rendered in a report form, the field pre-fills with patient data

#### Scenario: User sets conditional visibility

- GIVEN a user with `admin.reporttemplate.update` and a field that should only appear when `campo_genero == "Femenino"`
- WHEN configuring the rule in the property panel: Source=genero, Operator=`==`, Value="Femenino"
- THEN the rule is stored in the field's JSON config as `{visible_when: {field: "genero", op: "==", value: "Femenino"}}`

#### Scenario: User configures a dynamic table field

- GIVEN a user with `admin.reporttemplate.update` selects "Tabla Dinámica" from the component catalog
- WHEN the property panel opens
- THEN it prompts for: table label, column definitions (name + type), and minimum rows
- AND columns can be added/removed/reordered

## ADDED Requirements

### Requirement: Permission Enforcement

The template builder and its CRUD operations MUST check the relevant permission slug before granting access or rendering actions. Use `authStore.hasPermission(slug)` for UI visibility and `meta.permissions` for route-level guards.

#### Scenario: Route guard for template listing

- GIVEN the router has route `/admin/report-templates` with `meta: { requiresAuth: true, permissions: 'admin.reporttemplate.view' }`
- WHEN a user WITHOUT `admin.reporttemplate.view` navigates to the URL
- THEN the `beforeEach` guard calls `authStore.hasPermission('admin.reporttemplate.view')` → false
- AND redirects to Dashboard

#### Scenario: Sidebar link visibility

- GIVEN the AppSidebar renders the template-builder link
- WHEN the current user lacks `admin.reporttemplate.view`
- THEN `v-has-permission` or `authStore.hasPermission('admin.reporttemplate.view')` evaluates to false
- AND the link is not rendered

#### Scenario: Create/edit/delete buttons visibility matrix

- GIVEN the template listing page
- THEN the "Nueva plantilla de informe" button renders only if `authStore.hasPermission('admin.reporttemplate.create')`
- AND the edit button per row renders only if `authStore.hasPermission('admin.reporttemplate.update')`
- AND the delete button per row renders only if `authStore.hasPermission('admin.reporttemplate.delete')`

### Requirement: Error States and Edge Cases

The system SHALL handle edge cases gracefully.

#### Scenario: Browser loses connection during template save

- GIVEN a user with `admin.reporttemplate.update` has unsaved changes
- WHEN network connectivity is lost during save
- THEN the UI displays "Error al guardar. Verifique su conexión."
- AND unsaved changes remain in local state (not lost)

#### Scenario: Duplicate field key validation

- GIVEN a user with `admin.reporttemplate.update` and a template with a field key `presion_arterial`
- WHEN creating another field with the same key
- THEN the UI SHALL display a validation error before save
- AND save is blocked until the key is unique

#### Scenario: Large template performance

- GIVEN a template with 100+ fields across 10+ sections
- WHEN a user with `admin.reporttemplate.update` loads the builder
- THEN the canvas MUST render within 2 seconds
- AND drag-drop operations remain responsive (no frame drops)
- AND property panel updates apply within 200ms

## Acceptance Criteria

- Permission `admin.reporttemplate.view` gates route and sidebar visibility
- Permission `admin.reporttemplate.create` gates the "Nueva plantilla de informe" button
- Permission `admin.reporttemplate.update` gates edit actions and builder write operations
- Permission `admin.reporttemplate.delete` gates delete actions
- No role check ("admin" / "admin-only") appears in any scenario — only slug checks
- Drag-drop supports 4 hierarchy levels with smooth reordering
- Field property panel updates JSON structure in real-time
- Duplicate field keys are rejected at the UI level before save
- Template with existing reports cannot be deleted (backend-enforced)
- All system variables (`{{paciente.*}}`, `{{medico.*}}`) are available in the selector
