# template-builder Specification

## Purpose

Visual drag-drop builder for report templates. 3-panel layout: type palette (left), canvas (center), type-specific properties (right). 10 field types supported. No conditional logic.

## Requirements

### Requirement: Builder MUST have 3-panel layout

Left panel: field type palette grouped by category (Text, Selection, Special). Center: drag-drop canvas with field cards. Right: properties panel showing type-specific fields based on selected card.

#### Scenario: Drag field from palette to canvas

- GIVEN builder is open with empty canvas
- WHEN admin drags "Texto Corto" from palette to canvas
- THEN a new field card appears in canvas with default label "Nuevo campo"
- AND properties panel shows `max_chars`, `placeholder`, `default_value`, `ai_help_description`

#### Scenario: Select field updates properties panel

- GIVEN canvas has "Texto Corto" and "Número" fields
- WHEN admin clicks "Número" field card
- THEN properties panel switches to show `decimals`, `min`, `max`, `ai_help_description`, `default_value`

### Requirement: Builder MUST NOT expose conditional logic

No conditional logic controls SHALL appear in any panel. The feature is removed from the system.

#### Scenario: Builder has no conditional logic UI

- GIVEN builder is fully loaded with 3 panels
- WHEN admin inspects all panels, toolbars, and context menus
- THEN no conditional logic toggles, rules, or visibility conditions are present

### Requirement: Builder MUST support field management operations

Canvas SHALL support reorder via drag-drop. Fields MAY be deleted with confirmation dialog. Undo is out of scope for v1.

#### Scenario: Delete field with confirmation

- GIVEN canvas contains 3 fields
- WHEN admin clicks delete icon on second field
- THEN confirmation dialog appears
- WHEN admin confirms
- THEN second field is removed, canvas shows 2 fields

### Requirement: Template save SHALL serialize all fields as JSON

Each field serializes with `id`, `type`, `label`, `order`, and type-specific properties. Order SHALL be preserved.

#### Scenario: Round-trip save and reload

- GIVEN builder has 3 fields in specific order
- WHEN admin saves template
- THEN API receives JSON array with fields in canvas order
- AND reloading the template restores same order and properties
