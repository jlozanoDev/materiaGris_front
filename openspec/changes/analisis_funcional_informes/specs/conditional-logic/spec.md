# Delta for conditional-logic

## Purpose

Safe runtime expression evaluator for field visibility rules. Evaluates conditions in real-time as form values change. Uses no `eval()`, no `new Function()`. Supports comparators: `==`, `!=`, `contains`, `>`, `<`. Operates on a controlled scope of current form values only.

**Permission note**: This capability has no direct permission requirements. It operates within the DynamicFormRenderer, which already enforces permissions at the form level (`report.edit`, `report.view`, etc.). The conditional logic evaluator is a pure function that returns booleans — it does not gate access, mutate data, or handle user authorization.

## Requirements

### Requirement: Safe Expression Evaluation

The system MUST evaluate conditional expressions without executing arbitrary code.

#### Scenario: Equality comparator hides/shows a field

- GIVEN field "notas_embarazo" has rule: `visible_when: {field: "genero", op: "==", value: "Femenino"}`
- AND the form value `genero` is "Masculino"
- WHEN the form renders
- THEN "notas_embarazo" is hidden
- WHEN user changes `genero` to "Femenino"
- THEN "notas_embarazo" becomes visible in real-time (under 100ms)

#### Scenario: Inequality comparator

- GIVEN field "especificar_otro" has rule: `visible_when: {field: "tipo_documento", op: "!=", value: "DNI"}`
- WHEN `tipo_documento` is "DNI"
- THEN "especificar_otro" is hidden
- WHEN `tipo_documento` changes to "Pasaporte"
- THEN "especificar_otro" becomes visible

#### Scenario: Contains comparator

- GIVEN field "detalle_alergia" has rule: `visible_when: {field: "antecedentes", op: "contains", value: "alergias"}`
- WHEN `antecedentes` value is "sin antecedentes relevantes"
- THEN "detalle_alergia" is hidden
- WHEN `antecedentes` changes to "hipertensión, alergias, diabetes"
- THEN "detalle_alergia" becomes visible

#### Scenario: Numeric comparators (>, <)

- GIVEN field "ajuste_dosis" has rule: `visible_when: {field: "edad", op: ">=", value: "65"}`
- AND `edad` value is "42"
- WHEN the form renders
- THEN "ajuste_dosis" is hidden
- WHEN `edad` changes to "70"
- THEN "ajuste_dosis" becomes visible

### Requirement: Security Constraints

The evaluator MUST never execute arbitrary code.

#### Scenario: Malicious input in field value

- GIVEN a conditional rule on field "injected"
- WHEN a malicious value like `"; alert(1); //` or `__proto__` or `constructor` is present in any form field
- THEN the evaluator treats it as a plain string for comparison
- AND no code execution occurs
- AND the evaluator SHALL NOT use `eval()`, `new Function()`, or `setTimeout(string)`

#### Scenario: Circular dependency detection

- GIVEN field A has rule depending on field B, and field B has rule depending on field A
- WHEN the evaluator detects the cycle
- THEN both fields remain visible (fail-open)
- AND a console warning is logged: "Circular dependency detected between fields: A, B"

#### Scenario: Missing referenced field

- GIVEN a rule referencing field "campo_inexistente" which does not exist in the form
- WHEN the evaluator processes the rule
- THEN it MUST default to showing the dependent field (fail-open)
- AND log a console warning: "Referenced field 'campo_inexistente' not found"

### Requirement: Real-Time Reactivity

The system SHALL react to value changes within 100ms to hide/show dependent fields.

#### Scenario: Rapid value changes

- GIVEN a form with 5 conditionally-visible fields, each depending on a radio group
- WHEN user rapidly switches radio options (clicking different options within 500ms)
- THEN each dependent field shows/hides correctly
- AND no visual flickering or stale state occurs
- AND the evaluator debounces rule evaluation to at most once per animation frame

#### Scenario: Performance with many conditional rules

- GIVEN a form with 50+ fields where 20 fields have conditional rules
- WHEN user changes a field value that triggers re-evaluation
- THEN all conditional visibility updates complete within 100ms
- AND scrolling position is preserved (no layout shift jumps)

### Requirement: Expression Parser Design

The evaluator SHALL be built as a pure function with controlled scope.

#### Scenario: Evaluator architecture

- GIVEN the expression: `{field: "edad", op: ">=", value: "65"}`
- WHEN `evaluateCondition(rule, formValues)` is called
- THEN it extracts `formValues["edad"]`, coerces both to numbers, and returns boolean
- AND the function has no access to `window`, `document`, or any global scope
- AND only the operators `==`, `!=`, `contains`, `>`, `<`, `>=`, `<=` are supported

## Acceptance Criteria

- All comparators (`==`, `!=`, `contains`, `>`, `<`, `>=`, `<=`) evaluate correctly
- No usage of `eval()` or `new Function()` anywhere in the evaluator
- Real-time: field visibility updates within 100ms of value change
- Circular dependencies are detected and handled (fail-open)
- Missing referenced fields default to showing the dependent field (fail-open)
- Malicious payloads in field values are treated as plain strings
- Evaluator is a pure function — no global scope access
- No permission checks inside the evaluator — permissions are enforced by the parent DynamicFormRenderer
