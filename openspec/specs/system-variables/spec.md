# system-variables Specification

## Purpose

Extensible registry of system variables organized by category. Provides autocomplete in the template builder when typing `{`. Shared composable for runtime variable resolution in report pages.

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

### Requirement: Fallback registry MUST include extended medico.* and clinica.* variables

`registerFallbackVariables()` SHALL register 9 new metadata entries: `clinica.email`, `clinica.web`, `clinica.ciudad`, `clinica.provincia`, `clinica.codigo_postal`, `clinica.cuit`, `medico.num_colegiado`, `medico.telefono`, `medico.apellido`.

#### Scenario: Fallback registry includes new variables

- GIVEN backend `/admin/system-variables` returns empty or fails
- WHEN fallback initializes
- THEN `clinica.cuit`, `medico.num_colegiado`, and `medico.apellido` are available for template autocomplete

### Requirement: Shared composable MUST replace duplicated resolver logic

The system MUST provide `useReportVariableResolver(patient, user, clinic)` that registers runtime resolvers for all system variables and returns a `resolve(template: string): string` function. ReportFillPage and ReportPdfExport SHALL consume this composable, removing ~120 duplicated lines.

#### Scenario: Both report pages use shared resolver

- GIVEN composable accepts patient, user, and clinic refs
- WHEN ReportFillPage calls `resolve("{clinica.nombre}")`
- THEN returns clinic name from store data (not hardcoded)

#### Scenario: Null clinic falls back to empty string

- GIVEN clinic store returns `null` (404 or not fetched)
- WHEN resolver evaluates `{clinica.nombre}` or any `clinica.*` variable
- THEN returns `""` — no crash, no "Materia Gris" fallback

### Requirement: medico.matricula MUST resolve from num_colegiado

`medico.matricula` runtime resolver SHALL use `authStore.user.num_colegiado`, NOT `user.email`.

#### Scenario: num_colegiado available

- GIVEN `authStore.user.num_colegiado` is `"12345"`
- WHEN resolver evaluates `{medico.matricula}`
- THEN returns `"12345"`

#### Scenario: num_colegiado is null

- GIVEN `authStore.user.num_colegiado` is `null` or `undefined`
- WHEN resolver evaluates `{medico.matricula}`
- THEN returns `""`

### Requirement: Hardcoded clinic strings MUST be removed

ReportFillPage, ReportPdfExport, and ReportDocumentRenderer SHALL NOT contain hardcoded `"Materia Gris"` strings. Clinic name, address, and phone SHALL come from the clinic store.

#### Scenario: Report renders with live clinic name

- GIVEN clinic store has `nombre: "Clínica Ejemplo"`
- WHEN report displays `{clinica.nombre}`
- THEN "Clínica Ejemplo" appears (not "Materia Gris")
