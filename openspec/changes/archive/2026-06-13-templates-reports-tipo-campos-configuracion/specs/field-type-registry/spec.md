# field-type-registry Specification

## Purpose

Extensible registry of field types. Each type defines a unique properties schema. The builder and renderer consult this registry to know what properties a field exposes.

## Requirements

### Requirement: Field type registration MUST define unique schemas

| Field Type | Properties Schema |
|------------|-------------------|
| Texto Corto, Texto Largo | `max_chars`, `ai_help_description`, `default_value`, `placeholder` |
| Número | `decimals`, `min`, `max`, `ai_help_description`, `default_value` |
| Fecha | `min_date`, `max_date`, `ai_help_description`, `default_value`, `placeholder` |
| Selección, Sel. Múltiple, Opción Única, Checkbox | `options`, `ai_help_description`, `default_value`, `placeholder` |
| Texto Fijo | `text_content`, `styling_options` |
| Tabla Dinámica | `columns`, `footer_totals` |

The registry MUST validate that a field config contains only properties declared in its type schema. Unknown properties SHALL be rejected.

#### Scenario: Valid field config passes validation

- GIVEN type `short_text` with schema `{max_chars, placeholder}`
- WHEN field config `{type: "short_text", max_chars: 100, placeholder: "Nombre"}` is registered
- THEN validation passes

#### Scenario: Unknown property is rejected

- GIVEN type `number` with schema `{decimals, min, max}`
- WHEN field config includes property `options` (not in schema)
- THEN registry MUST reject with validation error

### Requirement: Registry MUST be extensible at runtime

New types MAY be registered without modifying existing source code. The builder palette MUST reflect newly registered types.

#### Scenario: New type registered appears in palette

- GIVEN registry has 10 default types
- WHEN `registry.register({id: "email", schema: {allowed_domains, ai_help_description}})` is called
- THEN builder palette includes "Email" as selectable type
