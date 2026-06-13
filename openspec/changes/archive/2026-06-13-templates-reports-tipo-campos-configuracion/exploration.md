## Exploration: templates-reports-tipo-campos-configuracion

### Current State

The codebase has **both modules fully implemented** with complete hexagonal architecture:

**1. Report Templates (admin config)** — `src/modules/admin/report-template/` (23 files)
- Template CRUD via `/admin/report-templates` endpoints
- Visual drag-and-drop builder with 3-panel layout (palette → canvas → properties)
- Undo/redo stack (50-command history)
- Section/Row/Column/Field hierarchy
- 9 field types supported in the palette: text, textarea, number, date, select, multi_select, radio, checkbox, dynamic_table
- Field properties: label, key, type, placeholder, required, systemVariable, conditionalRule, options, columns
- Conditional visibility engine (`src/shared/plugins/ConditionalLogicEngine.ts`) with cycle detection

**2. Patient Reports (runtime filling)** — `src/modules/reports/` (27 files)
- Report lifecycle: draft → signed → closed (immutable)
- Snapshot-based template versioning (template structure frozen at report creation)
- DynamicFormRenderer with 3 display modes: tabs, accordion, default
- 9 field types rendered by DynamicField.vue: text, textarea, number, date, select, radio, multi_select, checkbox, dynamic_table, signature
- Autosave (2s debounce) for drafts
- PDF download via `/reports/:id/pdf`
- Signature capture: canvas-based (SignaturePad) + typed text fallback

**3. Shared types** — `src/shared/types/index.ts` (180 lines)
- `FieldType` union (10 values), `FieldConfig`, `FieldOption`, `ConditionalRule`
- `Section`, `Row`, `Column` — template structure
- `ReportTemplate`, `PatientReport`, `ReportStatus`

**4. Router** — `src/core/router/index.ts` — 7 routes for both modules, permission-gated

### Affected Areas

Already built and working — no files need creation for the core features. Relevant files for understanding:

| Path | Role |
|------|------|
| `src/shared/types/index.ts` | All domain types (FieldType, FieldConfig, Section, etc.) |
| `src/shared/plugins/ConditionalLogicEngine.ts` | Conditional field visibility + cycle detection |
| `src/modules/admin/report-template/domain/entities/ReportTemplate.ts` | Re-exports shared types |
| `src/modules/admin/report-template/domain/repositories/ReportTemplateRepository.ts` | Repository contract (5 methods) |
| `src/modules/admin/report-template/infrastructure/ApiReportTemplateRepository.ts` | API impl → `/admin/report-templates` |
| `src/modules/admin/report-template/application/containers/reportTemplateContainer.ts` | DI container (5 provide functions) |
| `src/modules/admin/report-template/presentation/composables/useTemplateBuilder.ts` | Builder state machine (472 lines, undo/redo) |
| `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue` | Visual builder (229 lines) |
| `src/modules/admin/report-template/presentation/components/FieldPropertiesPanel.vue` | Field type config UI (293 lines) |
| `src/modules/reports/domain/repositories/ReportRepository.ts` | Repository contract (7 methods) |
| `src/modules/reports/infrastructure/ApiReportRepository.ts` | API impl → `/reports` |
| `src/modules/reports/application/containers/reportsContainer.ts` | DI container (7 provide functions) |
| `src/modules/reports/presentation/components/DynamicField.vue` | Renders all 9 field types (223 lines) |
| `src/modules/reports/presentation/components/DynamicFormRenderer.vue` | Layout engine (tabs/accordion/default, 270 lines) |
| `src/modules/reports/presentation/composables/useReportForm.ts` | Form state + autosave + validation (188 lines) |
| `src/core/router/index.ts` | 7 routes for both modules |

### Approaches

**1. No action needed — codebase already has both modules**
- Pros: All functional requirements from the spec doc are already implemented
- Cons: Documentation gaps exist
- Effort: N/A

**2. Fill documentation gaps**
- Pros: Completes the project documentation, follows the project's doc update rules
- Cons: Pure documentation work, no code changes
- Effort: Low

**3. Add missing field types or enhancements**
- Pros: Could add "image/file upload", "time" field, or "richtext" for medical reports
- Cons: Requires backend support for new field types
- Effort: Medium

### Recommendation

The codebase already has a mature, well-architected implementation covering both report template configuration and report filling. The hexagonal architecture is followed consistently across both modules.

**What SHOULD be done**: Fill the documentation gaps:
- Create `docs/tecnica/modulos/reports.md` and `docs/tecnica/modulos/report-templates.md`
- Create `docs/funcional/modulos/informes.md` 
- Update `docs/INDICE.md`, `docs/tecnica/INDICE.md`, `docs/funcional/INDICE.md`

### Risks

- Documentation-only changes have zero regression risk
- The existing code is well-tested (7+4 test files across both modules)
- No backend changes required — all API contracts are already defined and consumed

### Ready for Proposal

**Yes** — the exploration confirms the system already has the full feature set described in the functional analysis document. The next phase should be a documentation-focused proposal to fill the identified gaps, or a specific enhancement proposal if the user wants new field types.

### Skill Resolution

Loaded: `materiagris-architecture`, `materiagris-frontend`
