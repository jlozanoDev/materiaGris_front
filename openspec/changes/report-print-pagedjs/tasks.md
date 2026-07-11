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

- [ ] 2.1 Create `src/modules/reports/presentation/composables/usePrintReport.ts` with `PrintState = 'idle' | 'rendering' | 'ready' | 'printing' | 'done' | 'error'`, expose `state`, `show` (computed), `error`, `open(report, signatureUrl)`, `close()`, `retry()` — use pagedjs `Previewer` on `nextTick` after mount, listen to `rendered` event + 300ms safety timeout, skeleton pattern, try/catch sets error state
- [ ] 2.2 Write `src/modules/reports/presentation/composables/__tests__/usePrintReport.test.ts` — verify state transitions: idle→rendering on open, rendered→ready, close→idle, error→error state, retry resets to rendering (mock pagedjs `Previewer`)
- [ ] 2.3 Run tests: `npx vitest run --run usePrintReport` — all pass

## Phase 3: ReportPrintModal Component

- [ ] 3.1 Create `src/modules/reports/presentation/components/ReportPrintModal.vue` — wrap `AppModal(size="xl", customClass="bg-[#f0f0f0]")`, body contains `div#pagedjs-content` with `ReportDocumentRenderer` (receiving `:sections`, `:values`, `:variable-resolver`, `:signature-url`) and `div#pagedjs-output` for pagedjs pages, skeleton overlay when `state === 'rendering'`, footer "Imprimir" button `:disabled="state !== 'ready'"` → `window.print()`
- [ ] 3.2 Compute `variableResolver` inside modal using `useReportVariableResolver` + `useClinicStore` (reuse pattern from `ReportPdfExport.vue`)
- [ ] 3.3 Write `src/modules/reports/presentation/components/__tests__/ReportPrintModal.test.ts` — stub `AppModal` + `ReportDocumentRenderer`; verify skeleton visible when `state=rendering`, button disabled, error UI with retry/close, modal emits `close` and `retry`
- [ ] 3.4 Run tests: `npx vitest run --run ReportPrintModal` — all pass

## Phase 4: Wire Into useReportForm + Page Components

- [ ] 4.1 Modify `src/modules/reports/presentation/composables/useReportForm.ts`: import `usePrintReport`, add internal instance `usePrintReport()`, add to return type `openPrintModal`, `printModalShow`, `printModalState`, `closePrintModal`; `openPrintModal()` delegates to `printReport.open(report.value, signatureValue.value)`; remove old `printReport()` method and its iframe/ReportPdfExport copy-stylesheet logic entirely
- [ ] 4.2 Update `src/modules/reports/presentation/pages/ReportViewPage.vue`: change `v-if="false"` → `v-if="canPrint && report?.status !== 'draft'"`, add `@click="openPrintModal"`, import `ReportPrintModal`, add `<ReportPrintModal>` in template (after skeleton overlay), remove old printing skeleton overlay
- [ ] 4.3 Update `src/modules/reports/presentation/pages/ReportFillPage.vue`: same as 4.2
- [ ] 4.4 Run full suite: `npx vitest run --run` — all existing tests pass including `useReportForm.test.ts` archive tests (regression check)
- [ ] 4.5 Runtime verification: `npm run dev`, navigate to a signed report → click Print → modal opens with paginated content → click "Imprimir" → browser print dialog shows only report pages

## Phase 5: Documentation

- [ ] 5.1 Update `docs/tecnica/modulos/reports.md` — document `usePrintReport` composable, `ReportPrintModal` component, pagedjs integration
- [ ] 5.2 Update `docs/funcional/modulos/reports.md` — describe print modal user flow
- [ ] 5.3 Run `npm run build` to ensure final state compiles
