# report-header-footer Specification

## Purpose

Configurable header and footer zones for report templates. Each zone shares the same Section→Row→Column→Field drag-drop system as the body. Controlled via `enabled` toggle and `pageDisplay` selector. Renders in print preview and form fill views.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | Header/footer enable toggle per template | MUST |
| R2 | Page display selector (all/first/last) | MUST |
| R3 | Header/footer builder with drag-drop | MUST |
| R4 | Save/load includes header/footer sections | MUST |
| R5 | Print preview renders header and footer | MUST |
| R6 | Form fill renders header/footer read-only | MUST |
| R7 | Templates without header/footer default disabled | MUST |
| R8 | System variable interpolation in fixed_text fields | MUST |

### Requirement: Header/footer enable toggle per template

The system MUST provide a boolean `enabled` toggle per zone (header, footer). When disabled, the zone SHALL NOT render in any view.

#### Scenario: Enable header for a template

- GIVEN a template with header `enabled: false`
- WHEN admin toggles header to `enabled: true`
- THEN header sections render in print preview and form fill
- AND `structure.header.enabled` serializes as `true`

#### Scenario: Disabled footer omits rendering

- GIVEN a template with footer `enabled: false`
- WHEN print preview renders
- THEN no footer content appears

### Requirement: Page display selector

The system MUST provide a `pageDisplay` selector per zone with values `all`, `first`, `last`. This controls on which pages the zone renders.

#### Scenario: Header on first page only

- GIVEN header `pageDisplay: "first"`
- WHEN a multi-page report renders in print preview
- THEN header appears on page 1 only, not on subsequent pages

#### Scenario: Footer on all pages

- GIVEN footer `pageDisplay: "all"`
- WHEN a multi-page report renders
- THEN footer repeats on every page

### Requirement: Header/footer builder with drag-drop

The header and footer zones MUST support the same Section→Row→Column→Field builder operations as the body: add section, add row, add column, add field (all 10 types), reorder via drag-drop, delete with confirmation, and field property editing.

#### Scenario: Build header with text fields

- GIVEN builder is on Cabecera tab with empty canvas
- WHEN admin adds a section, row, column, and "Texto Corto" field
- THEN field card appears in header canvas with default label
- AND properties panel shows Texto Corto options

#### Scenario: Drag reorder in footer

- GIVEN footer has two fields: "Teléfono" above "Dirección"
- WHEN admin drags "Dirección" above "Teléfono" in footer canvas
- THEN field order updates and serializes correctly

### Requirement: Save/load includes header/footer sections

`saveTemplate` MUST serialize `header` and `footer` into `structure`. `loadTemplate` MUST restore both zones when present, with `enabled: false` defaults when absent.

#### Scenario: Round-trip save/load with header and footer

- GIVEN template has header with 2 fields, body with 3 fields, footer with 1 field
- WHEN admin saves and reloads template
- THEN all three zones restore with correct fields, order, and properties

#### Scenario: Load legacy template without header/footer

- GIVEN template structure has only `sections: [...]` (no `header` or `footer`)
- WHEN builder loads the template
- THEN header defaults to `enabled: false, sections: []`
- AND footer defaults to `enabled: false, sections: []`

### Requirement: Print preview renders header and footer

`ReportDocumentRenderer` MUST render header sections above the body and footer sections below the body. Each SHALL use `position: fixed` within `@page` for per-page repetition.

#### Scenario: Print preview shows header and footer

- GIVEN template with header and footer both `enabled: true`
- WHEN admin opens print preview
- THEN header content appears at top, footer at bottom, body in center

### Requirement: Form fill renders header/footer read-only

`DynamicFormRenderer` MUST render `headerSections` and `footerSections` as read-only fixed-text content above and below the editable form body. No input controls SHALL appear in these zones.

#### Scenario: Form fill shows readonly header

- GIVEN report has header with a fixed_text field "Hospital Central"
- WHEN user fills the report form
- THEN "Hospital Central" displays as static text above form fields
- AND no edit cursor or input border appears on the header text

### Requirement: System variable interpolation in header/footer fixed_text

`fixed_text` fields in header and footer MUST resolve system variables (e.g., `{usuario.nombre_completo}`, `{plantilla.nombre}`) via `SystemVariableRegistry`, identical to body fixed_text behavior.

#### Scenario: Header resolves user name variable

- GIVEN header has fixed_text with `"Médico: {usuario.nombre_completo}"` and logged-in user is "Dr. García"
- WHEN report renders in any view
- THEN header text displays "Médico: Dr. García"
