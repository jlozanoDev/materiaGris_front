# Tasks: Print Reports via pagedjs Modal

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~660 (532 added + 130 removed) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | pagedjs dep + print.css + main.ts import | PR 1 | `npm run build` | N/A (no runtime yet) | Revert package.json, delete print.css, revert main.ts |
| 2 | usePrintReport.ts composable + tests | PR 2 | `npx vitest run --run src/modules/reports/presentation/composables/__tests__/usePrintReport.test.ts` | N/A (test-only boundary) | Delete composable + tests; no wiring exists yet |
| 3 | ReportPrintModal.vue + tests | PR 3 | `npx vitest run --run src/modules/reports/presentation/components/__tests__/ReportPrintModal.test.ts` | N/A (test-only boundary) | Delete component + tests |
| 4 | Wire into useReportForm + pages + regr. check | PR 4 | `npx vitest run --run` (full suite) | `npm run dev` → open signed report, click Print, verify modal opens with content | Revert useReportFormPrint additions, restore `v-if="false"` on both pages |
| 5 | Project documentation update | PR 4 | `npm run build` | N/A (docs) | Revert docs changes |

## Phase 1: Dependency & Print CSS

- [x] 1.1 Install `pagedjs` via `npm install pagedjs` — added to `package.json`
- [x] 1.2 Create `src/assets/css/print.css` with `@media print { .app-sidebar, .topbar, .modal-backdrop, .modal-header, .modal-footer, [class*="breadcrumb"], .ds-modal-root { display: none !important; } .pagedjs_page { display: block !important; visibility: visible !important; } }`
- [x] 1.3 Import `@/assets/css/print.css` in `src/main.ts` after `./style.css`
- [x] 1.4 Run `npm run build` to verify CSS compiles and app bundles without errors

## Phase 2: usePrintReport Composable

- [x] 2.1 Create `src/modules/reports/presentation/composables/usePrintReport.ts` with `PrintState` type, expose `state`, `show` (computed), `error`, `pageCount`, `open(reportData)`, `close()`, `onRendered(flow)`, `onRenderError(err)`, `print()`, `reset()`, `retry()` — state machine: idle→rendering→ready→printing→done, error from rendering, afterprint listener for done transition
- [x] 2.2 Write `src/modules/reports/presentation/composables/__tests__/usePrintReport.test.ts` — 18 tests covering: initial state, open→rendering, open no-op when not idle, onRendered→ready + pageCount, onRenderError→error, print→printing, print only from ready, afterprint→done, close→idle, close while idle no-op, reset→idle, retry→rendering, full transition chain, error path, show computed
- [x] 2.3 Run tests: `npx vitest run --run usePrintReport` — 18/18 pass

## Phase 3: ReportPrintModal Component ✓

- [x] 3.1 Create `src/modules/reports/presentation/components/ReportPrintModal.vue` — wraps `Modal(size="xl", customClass="bg-[#f0f0f0]")`, body contains `div#pagedjs-content` with `ReportDocumentRenderer` (sections derived from `report.templateStructureSnapshot`, `:values`, `:variable-resolver`, `:signature-url`), `div#pagedjs-output` for pagedjs pages, skeleton overlay when `state === 'rendering'`, footer "Imprimir" button `:disabled="state !== 'ready'"` → `printState.print()`
- [x] 3.2 Compute `variableResolver` inside modal using `useReportVariableResolver` + `useClinicStore` (reuses pattern from `ReportPdfExport.vue`)
- [x] 3.3 Write `src/modules/reports/presentation/components/__tests__/ReportPrintModal.test.ts` — 10 tests covering rendering, skeleton, button states, error, close emit, print call, print-complete emit
- [x] 3.4 Run tests: `npx vitest run --run ReportPrintModal` — 10/10 pass

## Phase 4: Wire Into useReportForm + Page Components

- [x] 4.1 Modify `src/modules/reports/presentation/composables/useReportForm.ts`: import `usePrintReport`, add internal instance `usePrintReport()`, add to return type `openPrintModal`, `printModalShow`, `printModalState`, `closePrintModal`; `openPrintModal()` delegates to `printModal.open({report, patient, user, signatureUrl})`; remove old `printReport()` method and its iframe/ReportPdfExport copy-stylesheet logic entirely
- [x] 4.2 Update `src/modules/reports/presentation/pages/ReportViewPage.vue`: change `v-if="false"` → `v-if="canPrint && report?.status !== 'draft'"`, add `@click="openPrintModal"`, import `ReportPrintModal`, add `<ReportPrintModal>` in template, remove old printing skeleton overlay
- [x] 4.3 Update `src/modules/reports/presentation/pages/ReportFillPage.vue`: same as 4.2 — passes `:patient="patientData"` to modal
- [x] 4.4 Run full suite: `npx vitest run --run` — all existing tests pass including `useReportForm.test.ts` archive tests (17/17 pass). No new regressions.
- [ ] 4.5 Runtime verification: `npm run dev`, navigate to a signed report → click Print → modal opens with paginated content → click "Imprimir" → browser print dialog shows only report pages

## Phase 5: Documentation

- [x] 5.1 Update `docs/tecnica/modulos/reports.md` — document `usePrintReport` composable, `ReportPrintModal` component, pagedjs integration
- [x] 5.2 Update `docs/funcional/modulos/reports.md` — describe print modal user flow
- [x] 5.3 Run `npm run build` and `npx vitest run --run` — build success, tests 131/136 pass (same 6 pre-existing failures, no regressions)

## Phase 6: Pivot to New Tab Print (replace modal)

- [x] 6.1 Create `src/modules/reports/presentation/pages/ReportPrintPage.vue` — standalone print page that:
  - Loads report via `provideGetReportUseCase()` and patient data via `provideGetPatientUseCase()`
  - Creates detached `ReportDocumentRenderer` app, strips Vue attributes, feeds to pagedjs `Previewer`
  - Shows spinner while pagedjs renders, enables "Imprimir" button on `rendered` event
  - `window.print()` opens native dialog; `.no-print` toolbar hidden during print
  - Variable resolver using `useReportVariableResolver` + `useClinicStore` + local patient vars
  - Cleanup on unmount
- [x] 6.2 Add route `{ path: '/reports/:id/print', name: 'ReportPrint', ... }` to `src/core/router/index.ts`
- [x] 6.3 Update `ReportViewPage.vue` and `ReportFillPage.vue`:
  - Replace `@click="openPrintModal"` → `@click="openPrintTab"`
  - `openPrintTab()` uses `router.resolve()` + `window.open()` with `noopener,noreferrer`
  - Remove imported `ReportPrintModal`, `<ReportPrintModal>` template usage
  - Remove `printModalShow`, `openPrintModal`, `closePrintModal` from composable destructure
- [x] 6.4 Clean up `useReportForm.ts`:
  - Remove `usePrintReport` import
  - Remove `printModal` instance, `openPrintModal()`, `closePrintModal()` functions
  - Remove `printModalShow`, `printModalState`, `openPrintModal`, `closePrintModal` from return type
- [x] 6.5 Delete obsolete files: `ReportPrintModal.vue`, `usePrintReport.ts`, their tests
- [x] 6.6 Update `src/assets/css/print.css`:
  - Add `@page { size: A4; margin: 20mm 20mm 25mm 20mm; }`
  - Add `.no-print` to `@media print { display: none !important; }`
- [x] 6.7 Update documentation in `docs/tecnica/modulos/reports.md` and `docs/funcional/modulos/reports.md`
  - Replace `ReportPrintModal`/`usePrintReport` references with `ReportPrintPage`
  - Update print flow: new tab instead of modal
- [x] 6.8 Build verification: `npm run build` — success (no errors)
