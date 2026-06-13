# report-admin Specification

## Purpose

Admin views for managing report templates. List, create, edit, preview, and delete. Delegates building to `template-builder` and rendering to `dynamic-form-renderer`.

## Requirements

### Requirement: Template list MUST show name and field count

List view SHALL display template name, number of fields, and last-modified date. Actions: edit, preview, delete.

#### Scenario: List shows existing templates

- GIVEN 2 templates exist: "Informe Radiológico" (8 fields), "Eco Doppler" (5 fields)
- WHEN admin navigates to template list
- THEN "Informe Radiológico" shows field count 8, "Eco Doppler" shows 5

### Requirement: Create/Edit MUST launch template-builder

Create opens empty builder. Edit loads existing field config and pre-populates builder. Save serializes all fields and persists via API.

#### Scenario: Create new template

- GIVEN admin clicks "Nueva Plantilla"
- WHEN builder opens with empty canvas
- AND admin adds 3 fields and saves
- THEN template appears in list with field count 3

#### Scenario: Edit existing template

- GIVEN template has 2 fields: "Texto Corto" and "Número"
- WHEN admin opens edit
- THEN builder canvas shows both fields with their saved properties

### Requirement: Preview MUST render with dynamic-form-renderer

Preview mode SHALL use the renderer to display form as end-user would see it. No editing allowed.

#### Scenario: Preview shows all field types

- GIVEN template includes Texto Fijo, Texto Corto, and Tabla Dinámica
- WHEN admin clicks preview
- THEN Texto Fijo shows interpolated text, Texto Corto shows input, Tabla Dinámica shows editable table

### Requirement: Delete MUST confirm and cascade-clean

Delete requires confirmation. No cascade concerns — reports reference templates by snapshot copy.

#### Scenario: Delete confirmed removes template

- GIVEN admin clicks delete on a template
- WHEN confirmation dialog appears and admin confirms
- THEN template is removed from list
