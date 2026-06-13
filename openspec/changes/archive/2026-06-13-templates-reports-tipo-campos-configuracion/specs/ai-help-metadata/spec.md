# ai-help-metadata Specification

## Purpose

Metadata field for AI-assisted help descriptions on each form field. Displayed as tooltip in the builder, reserved for future AI auto-fill.

## Requirements

### Requirement: Every field type MUST include `ai_help_description`

The property SHALL be optional (empty string = valid). Serialized in JSON field config. Builder MUST render as tooltip icon on field cards.

#### Scenario: Tooltip visible when description is set

- GIVEN field has `ai_help_description: "Registrar edad al momento del estudio"`
- WHEN admin hovers over the field in builder canvas
- THEN tooltip displays "Registrar edad al momento del estudio"

#### Scenario: No tooltip when description is empty

- GIVEN field has `ai_help_description: ""`
- WHEN admin views field in builder
- THEN no tooltip icon is rendered

### Requirement: Serialization MUST preserve `ai_help_description`

Field config JSON SHALL include `ai_help_description` on save. Reloading SHALL restore its value.

#### Scenario: Round-trip persistence

- GIVEN admin sets `ai_help_description: "Peso en kg"`
- WHEN template is saved and reloaded
- THEN field still shows "Peso en kg" as ai_help_description
