# Tasks: Módulo de Informes Dinámicos

> **Change**: `analisis_funcional_informes`
> **Strategy**: `ask-on-risk` (C1)
> **Chained PRs**: YES — 8 batches, each ~250-450 lines. Each independently verifiable.

---

## Review Workload Forecast

| Metric | Value |
|---|---|
| Total estimated changed lines | ~3,200 impl + ~2,200 tests = ~5,400 total |
| Number of batches | 8 |
| Chained PRs recommended | **YES** — total far exceeds 400-line budget |
| 400-line budget risk | **High** |
| Decision needed before apply | **Yes** — confirm batching strategy and backend API contracts are available |

---

## Dependency Graph

```
[1] Foundation
      |
      v
[2] Router + Routes
      |
      +--------------------+
      |                    |
      v                    v
[3] Tipo-Informe Domain  [6] Reports Domain
      |                    |
      v                    |
[4] Tipo-Informe Listing  |
      |                    |
      v                    |
[5] Tipo-Informe Builder  |
                           v
                     [7] Dynamic Form Renderer
                           |
                           v
                     [8] Reports Pages + Integration
```

---

## Batch 1: Foundation — Types + Conditional Logic Engine

**Deps**: None
**Lines**: ~370 (190 impl + 180 tests)
**Verify**: `npx vitest run --run src/shared/plugins/__tests__/ConditionalLogicEngine`

### Task 1.1: Shared Types ✅
- **File**: `src/shared/types/index.ts` — modify (+70 lines)
- **What**: Add `FieldType`, `FieldConfig`, `FieldOption`, `ConditionalRule`, `Section`, `Row`, `Column`, `ReportTemplate`, `PatientReport`, `ReportStatus`
- **Specs**: template-builder (all), dynamic-form-renderer (all), report-lifecycle (all)

### Task 1.2: ConditionalLogicEngine ✅
- **File**: `src/shared/plugins/ConditionalLogicEngine.ts` — create (~150 lines)
- **What**: Pure functions `evaluateCondition(rule, scope) -> boolean` and `computeFieldVisibility(fields, allValues) -> Record<string, boolean>`. Whitelisted operators: `==`, `!=`, `contains`, `>`, `<`, `>=`, `<=`. No `eval()`, no `new Function()`. Circular dependency detector (fail-open). Missing field handler (fail-open).
- **Specs**: conditional-logic/spec.md — all scenarios
- **Tests** (~180 lines): All comparators, malicious input (`__proto__`, injection), circular deps, missing refs, performance (<100ms for 50+ rules), pure function verification

---

## Batch 2: Router + Sidebar + Package ✅

**Deps**: Batch 1 (types)
**Lines**: ~220 (100 impl + 120 tests)
**Verify**: `npx vitest run --run` (route guard tests pass + build succeeds)

### Task 2.1: npm dependency ✅
- **File**: `package.json` — modify (~1 line)
- **What**: Add `"vuedraggable@next": "^4.1.0"` to dependencies
- **Specs**: template-builder — drag-drop requirement

### Task 2.2: Report routes with permission guards ✅
- **File**: `src/core/router/index.ts` — modify (~55 lines)
- **What**: Add 7 routes:
  - `/admin/report-templates/nuevo` → `ReportTemplateBuilderPage`, `meta.permissions: 'admin.reporttemplate.create'`
  - `/admin/report-templates/:id/editar` → `ReportTemplateBuilderPage`, `meta.permissions: 'admin.reporttemplate.update'`
  - `/informes` → `ReportListPage`, `meta.permissions: 'report.view'`
  - `/informes/:id` → `ReportViewPage`, `meta.permissions: 'report.view'`
  - `/informes/:id/editar` → `ReportFillPage`, `meta.permissions: ['report.edit']`
  - `/pacientes/:id/informe/nuevo` → `ReportFillPage`, `meta.permissions: 'report.create'`
  - Update existing `/admin/tipo-informe` → rename to `ReportTemplateListPage`
- **Specs**: template-builder, report-lifecycle, report-admin — all route guard scenarios
- **Tests** (~120 lines): Route guard integration — mock `authStore.hasPermission` return values, verify redirect per route with/without required permission

### Task 2.3: Reports sidebar link ✅
- **File**: `src/shared/components/AppSidebar.vue` — modify (~15 lines)
- **What**: Add "Informes" link gated by `authStore.hasPermission('report.view')`. Follow existing pattern (PrimeIcons `pi-file-check`, top-level icon or settings dropdown entry).
- **Specs**: report-admin — sidebar visibility scenario
- **Decision needed**: Top-level vs settings dropdown placement

---

## Batch 3: Tipo-Informe Domain Layer + Infrastructure

**Deps**: Batch 1 (types), Batch 2 (router)
**Lines**: ~380 (260 impl + 120 tests)
**Verify**: Use case tests pass with mock repository

### Task 3.1: Domain Entity
- **File**: `src/modules/admin/report-template/domain/entities/ReportTemplate.ts` — create (~30 lines)
- **What**: Entity implementing `ReportTemplate` type

### Task 3.2: Repository Interface
- **File**: `src/modules/admin/report-template/domain/repositories/ReportTemplateRepository.ts` — create (~45 lines)
- **What**: Interface: `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)`

### Task 3.3: Use Cases (5 files)
- **Files**: `src/modules/admin/report-template/domain/use-cases/` — create:
  - `GetReportTemplatesUseCase.ts` (~20 lines)
  - `GetReportTemplateUseCase.ts` (~20 lines)
  - `CreateReportTemplateUseCase.ts` (~25 lines)
  - `UpdateReportTemplateUseCase.ts` (~25 lines)
  - `DeleteReportTemplateUseCase.ts` (~25 lines)
- **What**: DI receives `ReportTemplateRepository`. `DeleteReportTemplateUseCase` handles backend 409 (reports exist).
- **Tests** (~120 lines): Mock repo — verify correct method calls, error propagation, delete rejection

### Task 3.4: API Repository
- **File**: `src/modules/admin/report-template/infrastructure/ApiReportTemplateRepository.ts` — create (~100 lines)
- **What**: Implements interface via `fetchClient`. Endpoints: `GET/POST/PUT/DELETE /api/admin/report-templates`
- **Specs**: template-builder — network error scenario

### Task 3.5: DI Container
- **File**: `src/modules/admin/report-template/application/containers/reportTemplateContainer.ts` — create (~35 lines)
- **What**: `provideGetReportTemplatesUseCase()`, etc. Follows existing `authContainer.ts` pattern.

---

## Batch 4: Tipo-Informe Presentation — Listing Page

**Deps**: Batch 3 (domain + infra + container)
**Lines**: ~380 (260 impl + 120 tests)
**Verify**: Mount `ReportTemplateListPage`, verify table + permission-gated buttons

### Task 4.1: Listing Composable
- **File**: `src/modules/admin/report-template/presentation/composables/useReportTemplate.ts` — create (~80 lines)
- **What**: `ref([])` for templates, `loading`, `error`. `fetchTemplates()`, `deleteTemplate(id)`. Uses DI containers.
- **Specs**: template-builder — listing + delete scenarios

### Task 4.2: ReportTemplateListPage
- **File**: `src/modules/admin/report-template/presentation/pages/ReportTemplateListPage.vue` — create (~180 lines)
- **What**: Replaces skeleton `ReportTemplatePage.vue`. Table: Name, Description, Active badge, Last Modified. Actions: Edit (`admin.reporttemplate.update`), Delete (`admin.reporttemplate.delete`). "Nuevo" button (`admin.reporttemplate.create`). Empty state. Loading/error states.
- **Permission**: Buttons gated via `v-if="authStore.hasPermission('slug')"`
- **Tests** (~120 lines): Mount with mocked `useAuthStore` — verify button visibility matrix, delete flow, error handling

### Task 4.3: Remove skeleton
- **File**: `src/modules/admin/report-template/presentation/pages/ReportTemplatePage.vue` — delete

---

## Batch 5: Tipo-Informe Builder — Store + Drag-Drop UI

**Deps**: Batch 4 (listing page)
**Lines**: ~550 (430 impl + 120 tests)
**Risk**: `high` — nested drag-drop is UX-complex. Spike/PoC before starting.
**Verify**: Mount builder, verify vuedraggable renders, drag ops modify store

### Task 5.1: Builder Pinia Store
- **File**: `src/modules/admin/report-template/presentation/composables/useTemplateBuilder.ts` — create (~130 lines)
- **What**: Setup store: `sections`, `selectedFieldId`, `undoStack`/`redoStack` (cap 50), `isDirty`, `templateId/Name/Description`. Methods: `loadTemplate(id)`, `addSection()`, `removeSection(id)`, `addRow(sectionId)`, `removeRow(rowId)`, `addColumn(rowId)`, `addField(columnId, type)`, `removeField(fieldId)`, `updateField(fieldId, config)`, `reorderSections(order)`, `moveField(from, to)`, `undo()`, `redo()`, `saveTemplate()`. All mutate methods push inverse command to undo stack. Duplicate key validation in `updateField`. Save checks `authStore.hasPermission('admin.reporttemplate.update')`. IDs via `crypto.randomUUID()`.
- **Specs**: template-builder — all drag-drop, field config, duplicate keys, undo/redo

### Task 5.2: Builder Sub-Components (6 files)
- **Files**: `src/modules/admin/report-template/presentation/components/` — create:
  - `TemplateBuilderToolbar.vue` (~50 lines) — Save/Undo/Redo + name/description inputs. Permission-gated.
  - `SectionPanel.vue` (~70 lines) — Section with title, type (tab/accordion), delete. Wraps `<draggable>` for rows.
  - `DroppableRow.vue` (~60 lines) — Row with column count (1-4). Wraps `<draggable>` for columns.
  - `DroppableColumn.vue` (~50 lines) — Column with width. Wraps `<draggable>` for fields.
  - `DroppableField.vue` (~50 lines) — Field chip (icon + label). Click selects → property panel. Delete button.
  - `FieldPropertiesPanel.vue` (~100 lines) — Label, Key (auto-slugified), Type, Placeholder, Required, System Variables, ConditionalRule editor, Options (select/radio/checkbox), Column defs (dynamic_table).
- **Pattern**: Each `<draggable>` uses distinct `group.name`. 4-level nesting via `:group`, `:list`, `@change` on vuedraggable.
- **Specs**: template-builder — all drag-drop, field config, conditional rule, dynamic table column scenarios

### Task 5.3: ReportTemplateBuilderPage
- **File**: `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue` — create (~140 lines)
- **What**: 3-panel layout: left palette (8 draggable field type chips as clone sources), center canvas (sections via vuedraggable), right panel (FieldPropertiesPanel when field selected). Detects create vs edit via route `:id`. Breadcrumb: "Tipos de informes > Nuevo/Editar".
- **Tests** (~120 lines): Mount with empty store — verify 8 palette items, drag section → store updates, field click → property panel

---

## Batch 6: Reports Domain Layer + Infrastructure

**Deps**: Batch 1 (types), Batch 2 (router)
**Lines**: ~370 (250 impl + 120 tests)
**Verify**: Use case tests pass with mock repository

### Task 6.1: Domain Entity
- **File**: `src/modules/reports/domain/entities/PatientReport.ts` — create (~25 lines)
- **What**: Entity with status enum: `draft | signed | closed`
- **Specs**: report-lifecycle — all status transitions

### Task 6.2: Repository Interface
- **File**: `src/modules/reports/domain/repositories/ReportRepository.ts` — create (~55 lines)
- **What**: Interface: `initReport(patientId, templateId)`, `getAll(filters?)`, `getById(id)`, `saveDraft(id, values)`, `sign(id, signature)`, `close(id)`, `downloadPdf(id)`
- **Specs**: report-lifecycle + report-admin

### Task 6.3: Use Cases (7 files)
- **Files**: `src/modules/reports/domain/use-cases/` — create:
  - `InitReportUseCase.ts` (~25 lines)
  - `GetReportsUseCase.ts` (~20 lines)
  - `GetReportUseCase.ts` (~20 lines)
  - `SaveReportDraftUseCase.ts` (~25 lines)
  - `SignReportUseCase.ts` (~30 lines) — validates signature non-empty
  - `CloseReportUseCase.ts` (~25 lines)
  - `DownloadReportPdfUseCase.ts` (~20 lines)
- **Tests** (~120 lines): Mock repo — verify status transition gates, signature validation, PDF download trigger

### Task 6.4: API Repository
- **File**: `src/modules/reports/infrastructure/ApiReportRepository.ts` — create (~110 lines)
- **What**: `fetchClient`-based: `GET/POST /reports`, `PUT /reports/{id}`, `POST /reports/{id}/sign`, `POST /reports/{id}/close`, `GET /reports/{id}/pdf` (blob → trigger download)
- **Specs**: report-lifecycle + report-admin — PDF download scenarios

### Task 6.5: DI Container
- **File**: `src/modules/reports/application/containers/reportsContainer.ts` — create (~50 lines)
- **What**: `provideInitReportUseCase()`, `provideGetReportsUseCase()`, etc.

---

## Batch 7: Dynamic Form Renderer + Signature + Dynamic Table

**Deps**: Batch 6 (domain types), Batch 1 (ConditionalLogicEngine)
**Lines**: ~520 (400 impl + 120 tests)
**Verify**: Mount `DynamicFormRenderer` with snapshot fixture, verify all 8 field types render

### Task 7.1: DynamicField — Type Dispatcher
- **File**: `src/modules/reports/presentation/components/DynamicField.vue` — create (~120 lines)
- **What**: Maps `field.type` → component: `text→input`, `textarea→textarea`, `date→input[type=date]`, `select→select`, `radio→radio group`, `checkbox→checkbox group`, `dynamic_table→DynamicTable`, `signature→SignaturePad`, `number→input[type=number]`. Emits `update:modelValue`. Unknown types → "Tipo no soportado" placeholder. System variable fields → read-only + pre-filled.
- **Specs**: dynamic-form-renderer — component type scenarios, unknown type edge case

### Task 7.2: DynamicTable
- **File**: `src/modules/reports/presentation/components/DynamicTable.vue` — create (~80 lines)
- **What**: Table with column headers from `field.columns`. "Añadir fila" button. Each cell via nested `DynamicField`. Delete row button. Respects `disabled` prop.
- **Specs**: dynamic-form-renderer — dynamic table add/remove rows

### Task 7.3: SignaturePad
- **File**: `src/modules/reports/presentation/components/SignaturePad.vue` — create (~130 lines)
- **What**: Canvas-based signature. Props: `modelValue` (base64|null), `disabled`. Drawing via `pointerdown/move/up`. `preventDefault()` on touch for no-scroll. Clear button (gated by `!disabled`). Watermark "Firme dentro del recuadro". Export via `canvas.toDataURL("image/png")`. Load existing: render as `<img>` when read-only. Typed signature alternative `<input>` with `aria-label`. WCAG 2.1 AA: `role="img"`, `aria-label`, keyboard alternative.
- **Permission**: `disabled` computed from `!authStore.hasPermission('report.edit') && !authStore.hasPermission('report.sign')`
- **Specs**: signature-capture/spec.md — all scenarios

### Task 7.4: DynamicFormRenderer
- **File**: `src/modules/reports/presentation/components/DynamicFormRenderer.vue` — create (~150 lines)
- **What**: Receives `sections: Section[]`, `modelValue: values`, `isEditable: boolean`. Iterates: sections → rows → columns → `DynamicField`. Section display mode: tabs (active tab shown) or accordion (one open at a time). Conditional visibility: calls `computeFieldVisibility(fields, allValues)` per section. Auto-save: `watch` on values with 2s debounce emits `@auto-save`. On mount: `isEditable` determined by `authStore.hasPermission('report.edit')`. Defense-in-depth: if neither edit nor view permission → redirect.
- **Specs**: dynamic-form-renderer/spec.md — all rendering, layout, permission enforcement scenarios

---

## Batch 8: Reports Pages + Pinia Stores + Integration

**Deps**: Batch 7 (form renderer components), Batch 6 (domain)
**Lines**: ~470 (350 impl + 120 tests)
**Verify**: Mount `ReportFillPage`, simulate draft→sign→close flow with mocked stores

### Task 8.1: useReportForm Store
- **File**: `src/modules/reports/presentation/composables/useReportForm.ts` — create (~140 lines)
- **What**: Setup store: `report`, `values`, `dirtyFields`, `errors`, `isSaving`, `autoSaveEnabled`. Methods: `init(patientId, templateId)`, `loadReport(id)`, `setValue(key, value)`, `validateForSignature()` (checks required + signature), `saveDraft()` (calls `saveDraft` use case, no required validation), `sign()` (checks `authStore.hasPermission('report.sign')` AND `report.user_id === authStore.user.id`, validates, calls sign use case), `close()` (checks `authStore.hasPermission('report.close')` AND author match, validates status=signed). Auto-save: watch `values` with 2s debounce → `saveDraft()`.
- **Specs**: report-lifecycle/spec.md — all state transition + permission scenarios

### Task 8.2: useReportList Composable
- **File**: `src/modules/reports/presentation/composables/useReportList.ts` — create (~60 lines)
- **What**: `ref([])` for reports, `loading`, `error`. `fetchReports(filters?)`. Follow `useUsers` pattern. Filters: status, patient name, date range, template.
- **Specs**: report-admin/spec.md — listing with filters

### Task 8.3: ReportFillPage
- **File**: `src/modules/reports/presentation/pages/ReportFillPage.vue` — create (~100 lines)
- **What**: Wraps `DynamicFormRenderer`. Detects create vs edit via route. Create: calls `useReportForm.init(patientId, templateId)`. Edit: calls `useReportForm.loadReport(id)`. Action buttons: "Guardar borrador" (`report.edit`), "Firmar" (`report.sign`), "Cerrar" (`report.close`), "Descargar PDF" (`report.download-pdf` + status signed/closed). Each button gated by `authStore.hasPermission()` AND author match. Validation error display for failed sign attempt (highlight missing required fields + missing signature). Confirmation dialog before sign/close.
- **Specs**: report-lifecycle/spec.md — all lifecycle scenarios

### Task 8.4: ReportViewPage
- **File**: `src/modules/reports/presentation/pages/ReportViewPage.vue` — create (~60 lines)
- **What**: Read-only wrapper. Loads report, renders `DynamicFormRenderer` with `isEditable=false`. "Descargar PDF" button (gated by `report.download-pdf` AND signed/closed). "Volver" button.
- **Specs**: report-admin/spec.md — read-only viewer scenarios

### Task 8.5: ReportListPage
- **File**: `src/modules/reports/presentation/pages/ReportListPage.vue` — create (~120 lines)
- **What**: Table: Patient Name, Author, Template, Status (badge: draft/signed/closed), Created Date, Last Modified. Filters: status dropdown (Todos/Borrador/Firmado/Cerrado), patient search (300ms debounce), date range, template dropdown. Pagination (20/page). "Ver" action per row → ReportViewPage. Empty state: "No hay informes registrados". Error state with retry.
- **Specs**: report-admin/spec.md — all listing + filtering scenarios

### Task 8.6: Integration tests
- **Tests** (~150 lines): Mount `ReportFillPage` with mocked stores — verify draft→sign→close flow, permission matrix (edit/sign/close buttons visible/hidden), author check, required field validation on sign, signature requirement on sign

---

## Test Coverage Summary

| Batch | Tests | Coverage Target |
|---|---|---|
| 1 | ConditionalLogicEngine unit | 100% branches |
| 2 | Route guards integration | All 7 routes + redirects |
| 3 | Use cases unit (mock repos) | 100% method calls |
| 4 | Listing page mount | Permission matrix + error states |
| 5 | Builder store + mount | Drag ops + undo/redo |
| 6 | Use cases unit (mock repos) | Status transitions + validation |
| 7 | Form renderer mount | All 8 field types + permission modes |
| 8 | Pages mount + lifecycle flow | Full draft→sign→close + permission matrix |

---

## Open Decisions (must resolve before apply)

1. **Backend API contracts**: Exact JSON shapes for `GET /api/reports`, `GET /api/reports/{id}` — needed for infra implementation in batches 6-8
2. **PDF download**: Blob response or URL redirect? Affects `ApiReportRepository.downloadPdf()` in batch 6
3. **Reports sidebar placement**: Top-level main nav icon vs settings dropdown entry — affects batch 2
4. **`signature_pad` npm**: Design decision says vanilla Canvas API (no `signature_pad`). Confirm removing from dependencies.
5. **Template builder delete+routing**: When deleting a template that has reports, backend returns 409 — UI must display error not crash. Handled in batch 4.

---

## Risk Matrix

| Risk | Batch | Mitigation |
|---|---|---|
| Nested drag-drop UX breaks | 5 | Spike/PoC before starting. Validate 4-level vuedraggable nesting works. |
| Permission checks missed | All | Each batch's tests include permission matrix. Review checklist before merge. |
| Backend API not ready | 6-8 | Mock API responses in tests. Frontend infra calls real endpoints only in E2E. |
| Signature canvas cross-browser | 7 | Use pointer events (not mouse+touch separately). Test Chrome/Firefox/Safari. |
| Auto-save data loss | 8 | Debounce 2s. Recover last auto-saved state on mount. Test browser crash scenario. |
| 400-line budget exceeded | All | Chained PRs confirmed. Each batch self-contained. Ask before merging >450 lines. |
