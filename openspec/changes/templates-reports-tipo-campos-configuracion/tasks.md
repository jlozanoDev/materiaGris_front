# Tasks: Reemplazo del Configurador de Campos de Plantillas

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

| # | Slice | ~lines | Base |
|---|-------|--------|------|
| 1 | Cleanup + registries | 350 | main |
| 2 | Property panels A (4 types) | 210 | PR1 |
| 3 | Property panels B + dispatch | 260 | PR2 |
| 4 | Builder + renderer | 420 | PR3 |
| 5 | Calculated columns | 180 | PR4 |

## P1: Cleanup + Infrastructure

- [x] 1.1 Delete `ConditionalLogicEngine.ts` + test. Remove `signature` from FieldType, delete `ConditionalRule`, `systemVariable`/`conditionalRule` from shared types. REQ: TB-005, DFR-005
- [x] 1.2 Rewrite `FieldType` + `FieldConfig` as discriminated union in `src/shared/types/index.ts`. REQ: FTR-001
- [x] 1.3 Create `FieldTypeMeta.ts` + `FieldTypeRegistry.ts` — Map with `register()`, `validateConfig()`. REQ: FTR-001/002/003
- [x] 1.4 Create `SystemVariableRegistry.ts` — categories, flat Map, `resolve()`. REQ: SVR-001/002
- [x] 1.5 Autocomplete composable — 150ms debounce, `{` trigger. REQ: SVR-003/004

## P2: Property Panels A

- [x] 2.1 `TextProperties.vue` — max_chars, placeholder, default_value, ai_help_description. REQ: TB-004, AIM-001
- [x] 2.2 `NumberProperties.vue` — decimals, min, max, default_value, ai_help_description. REQ: TB-004
- [x] 2.3 `DateProperties.vue` — min_date, max_date, placeholder, ai_help_description. REQ: TB-004
- [x] 2.4 `SelectionProperties.vue` — options add/remove, default_value, ai_help_description. REQ: TB-004

## P3: Property Panels B + Dispatch

- [x] 3.1 `FixedTextProperties.vue` — text_content editor with `{` autocomplete, styling_options. REQ: FTF-002, SVR-003
- [x] 3.2 `DynamicTableProperties.vue` — column defs (name, type, required). REQ: TB-004
- [x] 3.3 Rewrite `FieldPropertiesPanel.vue` — dispatch by `field.type` via component map. REQ: TB-004

## P4: Builder + Renderer

- [x] 4.1 `FieldPalette.vue` — grouped list from registry, draggable clones. REQ: TB-002/003
- [x] 4.2 Update `ReportTemplateBuilderPage.vue` — replace inline PALETTE. REQ: TB-002
- [x] 4.3 Adapt `useTemplateBuilder.ts` — createField to discriminated union. REQ: TB-008
- [x] 4.4 Add `ai_help_description` tooltip to canvas field cards. REQ: AIM-002
- [x] 4.5 Remove conditional logic from `DynamicFormRenderer.vue`. REQ: TB-005
- [x] 4.6 `FixedTextRenderer.vue` — read-only div, variable interpolation. REQ: DFR-003, FTF-001/003
- [x] 4.7 Update `DynamicField.vue` — remove signature, add fixed_text, unknown-type fallback. REQ: DFR-001/005
- [x] 4.8 Update `DynamicTable.vue` — adapt to `TableColumnDef[]` (libre columns). REQ: DFR-004

## P5: Calculated Columns

- [x] 5.1 Add `CalculatedFormula`, `CalculatedColumnDef`, `FooterTotal` to types. REQ: DFR-004
- [x] 5.2 Extend `DynamicTable.vue` — read-only calculated cells, sum/avg/count. REQ: DFR-004
- [x] 5.3 Add free-form expression evaluator. REQ: DFR-004
- [x] 5.4 Add footer totals row + update `DynamicTableProperties.vue` (toggle, formula editor). REQ: DFR-004, TB-004

## P6: Tests + Docs

- [x] 6.1 FieldTypeRegistry + SystemVariableRegistry unit tests. REQ: FTR-002, SVR-001, FTF-003
- [x] 6.2 Update `useTemplateBuilder.spec.ts` + `DynamicField.test.ts` + `DynamicFormRenderer.test.ts`. REQ: TB-008, DFR-001/005
- [x] 6.3 DynamicTable calculated eval + footer totals unit test. REQ: DFR-004
- [x] 6.4 Update `docs/tecnica/modulos/report-template-campos.md` and `docs/funcional/modulos/administracion/informes.md`. REQ: RA-001
