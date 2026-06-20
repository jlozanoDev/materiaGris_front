# Delta for dynamic-form-renderer

## ADDED Requirements

### Requirement: REQ-001 — DynamicField MUST render text-only when disabled

When `DynamicField` receives `disabled=true`, editable field types (text, textarea, number, date, select, multi_select, radio, checkbox) SHALL render a static `<span>` with the formatted value instead of a disabled `<input>` or `<select>`. The field label, required asterisk, and overall layout MUST remain unchanged.

Types `fixed_text`, `dynamic_table`, `vertical_separator`, and `horizontal_separator` SHALL NOT change their disabled rendering — they already handle readonly naturally.

Formats per type:
| Type | Format |
|------|--------|
| `text`, `textarea`, `number` | Raw value as string. Empty → `—` |
| `date` | `toLocaleDateString('es-ES')`. Empty → `—` |
| `select`, `radio` | Selected option label from `field.options`. Empty → `—` |
| `multi_select`, `checkbox` | Comma-separated list of selected option labels. Empty → `—` |

The `<span>` MUST use the same visual styling as the current form text (text-gray-700, text-sm).

#### Scenario: Text field renders as static span

- GIVEN a DynamicField with `type="text"`, `disabled=true`, `modelValue="Hola"`
- WHEN the component renders
- THEN a `<span>` displays "Hola"
- AND no `<input>` element is present

#### Scenario: Date field renders locale-formatted

- GIVEN a DynamicField with `type="date"`, `disabled=true`, `modelValue="2026-06-19"`
- WHEN the component renders
- THEN a `<span>` displays "19/06/2026" (es-ES format)
- AND no `<input type="date">` element is present

#### Scenario: Multi-select renders comma-separated labels

- GIVEN a DynamicField with `type="multi_select"`, `disabled=true`, `modelValue=["a","c"]`, options `[{label:"Opción A",value:"a"},{label:"Opción B",value:"b"},{label:"Opción C",value:"c"}]`
- WHEN the component renders
- THEN a `<span>` displays "Opción A, Opción C"
- AND no `<select>` element is present

#### Scenario: Empty value renders em-dash

- GIVEN a DynamicField with `type="text"`, `disabled=true`, `modelValue=""`
- WHEN the component renders
- THEN a `<span>` displays "—"

#### Scenario: Fixed text and dynamic table are unchanged

- GIVEN a DynamicField with `type="fixed_text"` and `disabled=true`
- WHEN the component renders
- THEN `FixedTextRenderer` renders normally (no behavioral change)
- AND for `type="dynamic_table"` with `disabled=true`, `DynamicTable` receives `disabled` prop as before

#### Scenario: Vertical and horizontal separators still render

- GIVEN a DynamicField with `type="vertical_separator"` or `type="horizontal_separator"`, `disabled=true`
- WHEN the component renders
- THEN the separator renders identically to non-disabled mode
