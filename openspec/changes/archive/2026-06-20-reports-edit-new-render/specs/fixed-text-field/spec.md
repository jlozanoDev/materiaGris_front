# Delta for fixed-text-field

## MODIFIED Requirements

### Requirement: Texto Fijo MUST render as read-only with variable interpolation

The field SHALL accept `text_content` with optional `{category.key}` placeholders. At render time, placeholders MUST be replaced via the `variableResolver` function prop received from the parent rendering pipeline (`DynamicField`). Unresolved placeholders SHALL render as literal text — no error. If no resolver is provided, all placeholders SHALL render as literal text.
(Previously: `variableResolver` prop was declared but `DynamicField` never passed one — the resolver branch was dead code)

#### Scenario: Variable interpolation with resolver from pipeline

- GIVEN `text_content: "Paciente: {paciente.nombre}, Edad: {paciente.edad}"`
- AND `variableResolver` prop resolves `paciente.nombre="Juan Pérez"`, `paciente.edad=34`
- WHEN form renders
- THEN display shows "Paciente: Juan Pérez, Edad: 34" (read-only)

#### Scenario: No resolver passed — literals preserved

- GIVEN `text_content: "Paciente: {paciente.nombre}"`
- AND `variableResolver` prop is `undefined`
- WHEN form renders
- THEN display shows "Paciente: {paciente.nombre}" — no crash

#### Scenario: Unknown variable with resolver

- GIVEN `text_content: "Dato: {foo.bar}"`
- AND `variableResolver` does NOT resolve `{foo.bar}`
- WHEN form renders
- THEN display shows "Dato: {foo.bar}" — no crash, no error toast
