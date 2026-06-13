# fixed-text-field Specification

## Purpose

Read-only text field in dynamic forms. Content supports system-variable interpolation with `{category.key}` syntax.

## Requirements

### Requirement: Texto Fijo MUST render as read-only with variable interpolation

The field SHALL accept `text_content` containing plain text and optional variable placeholders. At render time, placeholders MUST be replaced with values from the `SystemVariableRegistry`. Unrecognized placeholders SHALL render as literal text — no error.

#### Scenario: Variable interpolation at render time

- GIVEN `text_content: "Paciente: {paciente.nombre}, Edad: {paciente.edad}"`
- AND `SystemVariableRegistry` resolves `paciente.nombre="Juan Pérez"`, `paciente.edad=34`
- WHEN form renders the Texto Fijo field
- THEN display shows "Paciente: Juan Pérez, Edad: 34" (read-only)

#### Scenario: Unknown variable renders as literal

- GIVEN `text_content: "Dato: {foo.bar}"`
- AND `foo.bar` is NOT registered in SystemVariableRegistry
- WHEN form renders
- THEN display shows "Dato: {foo.bar}" — no crash, no error toast

### Requirement: Texto Fijo SHALL support styling options

The field MAY receive `styling_options` (font weight, size, color, alignment). Default: regular weight, inherit size.

#### Scenario: Custom styling applied

- GIVEN `styling_options: {bold: true, color: "#c0392b"}`
- WHEN form renders
- THEN text displays bold and red
