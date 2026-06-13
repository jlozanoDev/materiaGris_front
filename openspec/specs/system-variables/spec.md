# system-variables Specification

## Purpose

Extensible registry of system variables organized by category. Provides autocomplete in the template builder when typing `{`.

## Requirements

### Requirement: SystemVariableRegistry MUST organize variables by category

Default categories: `paciente`, `clinica`, `fecha`, `usuario`. Each category SHALL expose named variables with optional description. Registry MUST be extensible at runtime.

| Category | Variables |
|----------|-----------|
| `paciente` | `nombre`, `edad`, `genero`, `dni` |
| `clinica` | `nombre`, `direccion`, `telefono` |
| `fecha` | `hoy`, `formato_corto`, `formato_largo` |
| `usuario` | `nombre_completo`, `rol` |

#### Scenario: Variable lookup by category

- GIVEN registry has `paciente.nombre` with description "Nombre completo del paciente"
- WHEN `registry.resolve("paciente.nombre")` is called
- THEN returns `{key: "paciente.nombre", description: "Nombre completo del paciente"}`

### Requirement: Builder MUST show autocomplete on `{` trigger

When user types `{` in any text property editor, autocomplete dropdown MUST appear listing matching variables. Search MUST be debounced at 150ms. Index SHALL be O(1) flat map.

#### Scenario: Autocomplete filters by partial key

- GIVEN user types `{pac`
- WHEN 150ms debounce passes
- THEN dropdown shows `paciente.nombre`, `paciente.edad`, `paciente.genero`, `paciente.dni`

#### Scenario: No matches shows empty state

- GIVEN user types `{xyz`
- WHEN no variable key starts with `xyz`
- THEN dropdown shows "Sin resultados"
