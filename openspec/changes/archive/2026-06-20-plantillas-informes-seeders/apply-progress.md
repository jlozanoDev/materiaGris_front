# Apply Progress: plantillas-informes-seeders

## Status: COMPLETED

## Completed Tasks

### Fase 1: Generación de Estructuras JSON
- [x] 1.1 HCG — 27 campos, 8 tipos (textarea, number, fixed_text, text, multi_select, dynamic_table, horizontal_separator, date)
- [x] 1.2 IA — 20 campos, 6 tipos (textarea, fixed_text, date, text, select, dynamic_table)
- [x] 1.3 CI — 24 campos, 7 tipos (fixed_text, text, textarea, select, radio, checkbox, date)

### Fase 2: Validación
- [x] 2.1 JSON parse — 3 bloques parseables sin error
- [x] 2.2 Contrato ReportTemplate — name, description, structure.sections[], header/footer con enabled:true, pageDisplay:"all"
- [x] 2.3 Unicidad de keys — 0 duplicadas en las 3 plantillas
- [x] 2.4 Propiedades por tipo — 0 errores de propiedades no permitidas
- [x] 2.5 ai_help_description — 51 campos editables tienen ai_help_description (0 missing)

### Fase 3: Compilación
- [x] 3.1 Archivo MD final en `output/plantillas-informes-seeders.md`

### Fixes post-verify (CRITICAL)
- [x] Fix 1 — HCG: Añadido `hcg_fecha_documento` (date, required) en header row-5
- [x] Fix 2 — CI: Añadido `ci_nro_historia` (text, required, default_value: `{paciente.nro_historia}`) en header row-4
- [x] Fix 3 — CI: `ci_alternativas` cambiado a `required: true`
- [x] Fix 4 — CI: `ci_fecha_firma` cambiado de fixed_text a date editable con `required: true`

## Files Changed
- `output/plantillas-informes-seeders.md` (UPDATED) — 3 fixes CRITICAL del verify report

## Summary
| Plantilla | Campos totales | Tipos usados | Editables con ai_help |
|-----------|---------------|--------------|----------------------|
| HCG | 27 | 8 | 21 |
| IA | 20 | 6 | 15 |
| CI | 24 | 7 | 16 |

## Notes
- Todos los UUIDs son placeholders descriptivos — el backend debe reemplazarlos con UUIDs reales
- `ai_help_description` presente en todos los campos editables
- Sin `key` en Section/Row/Column (solo en Field)
- Sin columnas `calculated` en dynamic_table
- Header y footer tienen `enabled: true`, `pageDisplay: "all"`
- CRITICAL issues del verify report corregidos: campos ausentes añadidos, required corregidos, fecha convertida a date editable
