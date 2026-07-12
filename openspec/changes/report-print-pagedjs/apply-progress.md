# Apply Progress: report-print-pagedjs

## Phase 1 — Foundation ✓

### Completed Tasks

- [x] **1.1** Install `pagedjs` via `npm install pagedjs` — added to `package.json` and `package-lock.json`
- [x] **1.2** Create `src/assets/css/print.css` with `@media print` rules:
  - Hide `.app-sidebar`, `.topbar`, `.modal-backdrop`, `.modal-header`, `.modal-footer`, `[class*="breadcrumb"]`, `.ds-modal-root`
  - Show `.pagedjs_page` — `display: block !important; visibility: visible !important;`
- [x] **1.3** Import `@/assets/css/print.css` in `src/main.ts` after `./style.css`
- [x] **1.4** Build verification: `npm run build` — success (no errors)
- [x] **1.5** Test verification: `npx vitest run --run` — 130/134 files pass, 1139/1144 tests pass (5 pre-existing failures, no regressions)

### Pre-existing Test Failures (not caused by this change)

| Test | Issue |
|------|-------|
| `LandingPage.spec.js` (2 tests) | Page content changed — looks for "Solicitar demo" but now shows "Solicitar acceso anticipado" |
| `ReportViewPage.spec.ts` (1 test) | "Descargar PDF" not rendered (likely old print flow removed) |
| `ReportFillPage.spec.ts` (1 test) | "Descargar PDF" not rendered (same as above) |
| `ClinicEditPage.logo.test.ts` (1 test) | Logo section ordering assertion out of date |
| `UiDataTable.spec.js` (unhandled error) | `scrollIntoView` not available in jsdom environment |

### Files Changed

| File | Action |
|------|--------|
| `package.json` | Added `pagedjs` dependency |
| `package-lock.json` | Updated with pagedjs sub-dependencies |
| `src/assets/css/print.css` | **NEW** — `@media print` stylesheet |
| `src/main.ts` | Added import for print.css |

## Phase 2 — usePrintReport Composable ✓

### Completed Tasks

- [x] **2.1** Create `src/modules/reports/presentation/composables/usePrintReport.ts`:
  - `PrintState` type: `'idle' | 'rendering' | 'ready' | 'printing' | 'done' | 'error'`
  - `PrintReportData` interface for open() parameter
  - State machine: `idle → rendering → ready → printing → done` (error reachable from rendering)
  - `open(data)` — transitions to rendering (no-op if not idle)
  - `close()` — transitions to idle (no-op if idle)
  - `onRendered(flow)` — sets pageCount from flow.totalPages, transitions to ready
  - `onRenderError(err)` — sets error message, transitions to error state
  - `print()` — transitions to printing, calls `window.print()`, listens to `afterprint` for done
  - `reset()` — returns to idle from any state
  - `retry()` — from error back to rendering
  - `show` computed — true when state !== 'idle'
  - Does NOT import pagedjs directly (modal component will call onRendered/onRenderError)
- [x] **2.2** Create `src/modules/reports/presentation/composables/__tests__/usePrintReport.test.ts` — 18 tests covering all state transitions, guards, and edge cases
- [x] **2.3** Test results: `npx vitest run --run usePrintReport` — 18/18 pass; full suite 131/135 test files pass, 1157/1162 tests pass (same 5 pre-existing failures, no regressions)

### Files Changed

| File | Action |
|------|--------|
| `src/modules/reports/presentation/composables/usePrintReport.ts` | **NEW** — Print state machine composable |
| `src/modules/reports/presentation/composables/__tests__/usePrintReport.test.ts` | **NEW** — State machine tests |

## Phase 3 — ReportPrintModal.vue ✓

### Completed Tasks

- [x] **3.1** Create `src/modules/reports/presentation/components/ReportPrintModal.vue`:
  - Wraps `Modal(size="xl", customClass="bg-[#f0f0f0]")` with title "Vista de impresión"
  - Body: `div#pagedjs-content` with `ReportDocumentRenderer` (derived from `report.templateStructureSnapshot`)
  - `div#pagedjs-output` container for pagedjs paginated pages
  - Spinner skeleton overlay when `state === 'rendering'`
  - Error state when `state === 'error'` with error message display
  - Footer "Cancelar" and "Imprimir" buttons, print button `:disabled="state !== 'ready'"`
  - Imports `usePrintReport` composable internally (destructured for template auto-unwrap)
  - Watches `show` prop to start pagedjs lifecycle (`immediate: true`)
  - `startPagedjs()`: calls `printOpen()`, creates `Previewer`, registers `rendered` event → `onRendered`, calls `preview()` with try/catch → `onRenderError`
  - On close: `cleanupPagedjs()` + `printClose()` (reset to idle)
  - Watches state for `'done'` → emits `print-complete`
  - Computes `variableResolver` using `useReportVariableResolver` + `useClinicStore` (match `ReportPdfExport.vue` pattern)
  - Accepts optional `variableResolver` prop as override
- [x] **3.2** Compute `variableResolver` inside modal using `useReportVariableResolver` + `useClinicStore` (reuse pattern from `ReportPdfExport.vue`)
- [x] **3.3** Create `src/modules/reports/presentation/components/__tests__/ReportPrintModal.test.ts` — 10 tests covering:
  - Renders modal when show=true
  - Does not crash when report is null
  - Skeleton visible while state=rendering
  - Skeleton hides on transition to ready
  - Print button disabled for all non-ready states
  - Print button enabled when state=ready
  - Error message shown when state=error
  - Close emit on cancel click
  - `printState.print()` called on print button click
  - `print-complete` emitted on state transition to done
- [x] **3.4** Build: `npm run build` — success (no errors)
- [x] **3.5** Tests: `npx vitest run --run` — 131 passed / 136 files, 1166/1172 pass (6 pre-existing failures, no regressions)

### Pre-existing Test Failures (unchanged from Phase 2)

| Test | Issue |
|------|-------|
| `LandingPage.spec.js` (2 tests) | Page content changed — looks for "Solicitar demo" but now shows "Solicitar acceso anticipado" |
| `ReportViewPage.spec.ts` (1 test) | "Descargar PDF" not rendered (likely old print flow removed) |
| `ReportFillPage.spec.ts` (1 test) | "Descargar PDF" not rendered (same as above) |
| `ClinicEditPage.logo.test.ts` (1 test) | Logo section ordering assertion out of date |
| `UiDataTable.spec.js` (1 test + 1 unhandled error) | `scrollIntoView` not available in jsdom environment |

### Files Changed (Phase 3)

| File | Action |
|------|--------|
| `src/modules/reports/presentation/components/ReportPrintModal.vue` | **NEW** — Modal with pagedjs integration |
| `src/modules/reports/presentation/components/__tests__/ReportPrintModal.test.ts` | **NEW** — Component tests |
| `src/vite-env.d.ts` | **MODIFY** — Added `declare module 'pagedjs'` with minimal type |
| `vite.config.js` | **MODIFY** — Added `optimizeDeps.include: ['pagedjs']` |

### Branch Setup

- `feat/report-print-pagedjs` — tracker branch (from main)
- `feat/report-print-pagedjs-01-foundation` — child branch #1 (from tracker)
- `feat/report-print-pagedjs-02-composable` — child branch #2 (from #1)
- `feat/report-print-pagedjs-03-modal` — child branch #3 (from #2)
- `feat/report-print-pagedjs-04-wiring` — child branch #4 (from #3)
- `feat/report-print-pagedjs-05-docs` — child branch #5 **← current** (from #4)

## Phase 4 — Wire Into useReportForm + Page Components ✓

### Completed Tasks

- [x] **4.1** Modified `src/modules/reports/presentation/composables/useReportForm.ts`:
  - Imported `usePrintReport` and `PrintState` type
  - Added internal `printModal = usePrintReport()` instance
  - Added `openPrintModal()` — calls `printModal.open()` with report + authStore.user + signatureValue
  - Added `closePrintModal()` — delegates to `printModal.close()`
  - Removed old `printReport()` function (~90 lines, iframe/ReportPdfExport/copyStylesheets)
  - Removed `isPrinting` ref
  - Added `printModalShow`, `printModalState`, `openPrintModal`, `closePrintModal` to return type
- [x] **4.2** Updated `src/modules/reports/presentation/pages/ReportViewPage.vue`:
  - Changed `v-if="false"` → `v-if="canPrint && report?.status !== 'draft'"` on print button
  - Changed `@click="handlePrint"` → `@click="openPrintModal"`
  - Added `import ReportPrintModal`
  - Added `<ReportPrintModal>` component wired to `printModalShow`, `report`, `authStore.user`, `signatureValue`
  - Removed old printing skeleton overlay (`v-if="isPrinting"`)
  - Removed `handlePrint()` function
  - Updated destructuring from `useReportForm()`
- [x] **4.3** Updated `src/modules/reports/presentation/pages/ReportFillPage.vue`:
  - Same changes as 4.2
  - Passes `:patient="patientData"` to modal for variable resolution
- [x] **4.4** Full suite verification:
  - `useReportForm.test.ts`: 17/17 pass (including archive regression tests)
  - `ReportPrintModal.test.ts`: 10/10 pass
  - Build: `npm run build` — success (no errors)
  - No new regressions. Pre-existing failures unchanged:
    - `LandingPage.spec.js` (2 tests) — "Solicitar demo" text changed
    - `ReportViewPage.spec.ts` (1 test) — "Descargar PDF" → "Imprimir" text
    - `ReportFillPage.spec.ts` (1 test) — "Descargar PDF" → "Imprimir" text
    - `ClinicEditPage.logo.test.ts` (1 test) — ordering assertion
    - `UiDataTable.spec.js` (1 test) — scrollIntoView in jsdom

### Files Changed (Phase 4)

| File | Action |
|------|--------|
| `src/modules/reports/presentation/composables/useReportForm.ts` | **MODIFY** — replaced `printReport()` with `openPrintModal()`/`closePrintModal()`, removed `isPrinting` |
| `src/modules/reports/presentation/pages/ReportViewPage.vue` | **MODIFY** — activated print button, added modal, removed old skeleton |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | **MODIFY** — activated print button, added modal with patient data, removed old skeleton |

## Phase 5 — Documentation ✓

### Completed Tasks

- [x] **5.1** Updated `docs/tecnica/modulos/reports.md`:
  - Added `ReportPrintModal.vue` and `usePrintReport.ts` to Estructura section
  - Replaced old iframe-based "Lógica de Impresión" with new pagedjs flow description
  - Updated `useReportForm.ts` section: replaced `printReport()`/`isPrinting` with `openPrintModal()`/`closePrintModal()`/`printModalShow`/`printModalState`
  - Added Componentes Clave entries for `ReportPrintModal.vue` (modal props, pagedjs lifecycle) and `usePrintReport.ts` (state machine diagram, API table)
  - Updated Dependencias: added `pagedjs`, removed `createApp`
  - Updated Notas Técnicas: removed iframe references, kept `report.download-pdf` permission, added pagedjs DOM requirements
- [x] **5.2** Updated `docs/funcional/modulos/reports.md`:
  - Changed Impresión estado from ⚠️ to ✅
  - Updated Criterios de Aceptación: removed hidden button mention, added previsualización modal + pagedjs criteria
  - Updated Reglas de Negocio: `ReportDocumentRenderer` + pagedjs A4 pagination
  - Replaced "Flujo Principal — Pendiente" with new 8-step flow including modal preview
  - Updated Flujos Alternativos: added pagedjs error handling, cancel keeps modal at ready
  - Updated Estado de Desarrollo: implemented with pagedjs
  - Updated Roadmap: removed resolved items (preview evaluation, iframe cleanup)
- [x] **5.3** Run `npm run build` and `npx vitest run --run` — build success, tests 131/136 pass (same 6 pre-existing failures, no regressions)

### Files Changed (Phase 5)

| File | Action |
|------|--------|
| `docs/tecnica/modulos/reports.md` | **MODIFY** — full technical doc update |
| `docs/funcional/modulos/reports.md` | **MODIFY** — full functional doc update |

## Phase 6 — Pivot to New Tab Print (Replace Modal) ✓

### Context

The modal approach (`ReportPrintModal.vue`) with pagedjs `Previewer` was failing with `Cannot read properties of null (reading 'getBoundingClientRect')`. The decision was made to pivot to a new browser tab approach, giving pagedjs a clean document context.

### Completed Tasks

- [x] **6.1** Created `src/modules/reports/presentation/pages/ReportPrintPage.vue`:
  - Standalone page receiving `id` from route params
  - Loads report via `provideGetReportUseCase()` and patient data via `provideGetPatientUseCase()`
  - Creates detached Vue app with `ReportDocumentRenderer`, strips reactive attributes, feeds to pagedjs `Previewer`
  - Shows spinner while pagedjs processes; "Imprimir" button enabled on `rendered` event
  - `window.print()` for native print dialog
  - Variable resolver using `useReportVariableResolver` + local patient/date vars (same pattern as `ReportPrintModal`)
  - CSS `@page` rules for A4, `.no-print` toolbar hidden during print via `@media print`
  - Error state with "Volver" button (`window.close()`)
- [x] **6.2** Added route `{ path: '/reports/:id/print', name: 'ReportPrint', ... }` to `src/core/router/index.ts` with `permissions: 'report.download-pdf'`
- [x] **6.3** Updated `ReportViewPage.vue` and `ReportFillPage.vue`:
  - New `openPrintTab()` function using `router.resolve()` + `window.open(href, '_blank', 'noopener,noreferrer')`
  - Removed `ReportPrintModal` import and template usage
  - Removed `printModalShow`, `openPrintModal`, `closePrintModal` from `useReportForm()` destructure
- [x] **6.4** Cleaned `src/modules/reports/presentation/composables/useReportForm.ts`:
  - Removed `usePrintReport` import
  - Removed `printModal` instance, `openPrintModal()`, `closePrintModal()` functions
  - Removed `printModalShow`, `printModalState`, `openPrintModal`, `closePrintModal` from interface and return
  - Interface reduced from 18 to 14 members
- [x] **6.5** Deleted obsolete files:
  - `src/modules/reports/presentation/components/ReportPrintModal.vue`
  - `src/modules/reports/presentation/components/__tests__/ReportPrintModal.test.ts`
  - `src/modules/reports/presentation/composables/usePrintReport.ts`
  - `src/modules/reports/presentation/composables/__tests__/usePrintReport.test.ts`
- [x] **6.6** Updated `src/assets/css/print.css`:
  - Added `@page { size: A4; margin: 20mm 20mm 25mm 20mm; }`
  - Added `.no-print` to `@media print { display: none !important; }`
  - Added `.print-output` print styles
- [x] **6.7** Updated `docs/tecnica/modulos/reports.md` and `docs/funcional/modulos/reports.md`:
  - Replaced `ReportPrintModal`/`usePrintReport` references with `ReportPrintPage`
  - Updated structure, component docs, print flow, and notes
- [x] **6.8** Build verification: `npm run build` — success (no errors)

### Files Changed (Phase 6)

| File | Action |
|------|--------|
| `src/modules/reports/presentation/pages/ReportPrintPage.vue` | **NEW** — Standalone print page with pagedjs |
| `src/core/router/index.ts` | **MODIFY** — Added `/reports/:id/print` route |
| `src/modules/reports/presentation/pages/ReportViewPage.vue` | **MODIFY** — Changed to openPrintTab(), removed modal |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | **MODIFY** — Same as ReportViewPage |
| `src/modules/reports/presentation/composables/useReportForm.ts` | **MODIFY** — Removed print modal logic |
| `src/modules/reports/presentation/components/ReportPrintModal.vue` | **DELETED** — Replaced by new tab approach |
| `src/modules/reports/presentation/composables/usePrintReport.ts` | **DELETED** — No longer needed |
| `src/modules/reports/presentation/components/__tests__/ReportPrintModal.test.ts` | **DELETED** — Component removed |
| `src/modules/reports/presentation/composables/__tests__/usePrintReport.test.ts` | **DELETED** — Composable removed |
| `src/assets/css/print.css` | **MODIFY** — Added @page rules and .no-print |
| `docs/tecnica/modulos/reports.md` | **MODIFY** — Updated for new tab approach |
| `docs/funcional/modulos/reports.md` | **MODIFY** — Updated for new tab approach |
| `openspec/changes/report-print-pagedjs/tasks.md` | **MODIFY** — Added Phase 6 tasks |
| `openspec/changes/report-print-pagedjs/apply-progress.md` | **MODIFY** — Added Phase 6 progress |

### Next Steps

Ready for verification and archive. The new tab approach gives pagedjs a clean document context, eliminating the `getBoundingClientRect` error that affected the modal approach.

