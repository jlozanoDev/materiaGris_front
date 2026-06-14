# Delta for template-builder

## ADDED Requirements

### Requirement: Builder MUST have zone tabs (Cabecera/Cuerpo/Pie)

The builder canvas SHALL switch between three zones via tab controls: Cabecera (header), Cuerpo (body), and Pie (footer). Each tab shares the same FieldPalette, BuilderCanvas, and FieldPropertiesPanel components. Only one zone is active at a time.

#### Scenario: Switch from body to header tab

- GIVEN admin is editing body with 3 fields
- WHEN admin clicks "Cabecera" tab
- THEN canvas clears and shows header sections (empty or existing)
- AND palette and properties panels remain unchanged

#### Scenario: Each tab preserves independent state

- GIVEN header has 1 field, body has 2 fields, footer has 0 fields
- WHEN admin cycles through all three tabs and returns to body
- THEN body shows its 2 fields unchanged

### Requirement: Load MUST restore header/footer from structure

When `loadTemplate` deserializes `structure`, it SHALL extract `header?: HeaderFooterConfig` and `footer?: HeaderFooterConfig`. Missing zones default to `{ enabled: false, pageDisplay: "all", sections: [] }`.

#### Scenario: Template with full structure loads all zones

- GIVEN API returns structure with `header`, `sections` (body), and `footer`
- WHEN builder loads the template
- THEN `headerSections`, `bodySections`, and `footerSections` are populated
- AND `headerEnabled`/`footerEnabled` reflect the saved values

## MODIFIED Requirements

### Requirement: Template save SHALL serialize header, body, and footer as JSON

Each zone serializes its `Section[]` plus `enabled` and `pageDisplay`. Body sections serialize under `sections` (unchanged key). Header serializes under `header`, footer under `footer`. Field order SHALL be preserved per zone.
(Previously: saved only body `sections` array)

#### Scenario: Round-trip save and reload

- GIVEN builder has 3 body fields in specific order
- WHEN admin saves template
- THEN API receives JSON with `sections` array in canvas order
- AND reloading the template restores same order and properties

#### Scenario: Save includes header and footer

- GIVEN header has 2 fields (enabled, pageDisplay=first), footer has 1 field (enabled, pageDisplay=all)
- WHEN admin saves template
- THEN `structure.header` contains `{ enabled: true, pageDisplay: "first", sections: [...] }`
- AND `structure.footer` contains `{ enabled: true, pageDisplay: "all", sections: [...] }`
