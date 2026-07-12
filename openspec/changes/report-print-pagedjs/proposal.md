# Proposal: Print Reports via pagedjs Modal

## Intent

Replace the abandoned hidden-iframe print flow with a **modal preview** using pagedjs that renders the actual report content (ReportDocumentRenderer) and triggers `window.print()`. The user sees exactly what prints before the browser dialog opens.

## Scope

### In Scope
- Install `pagedjs` dependency
- Create `ReportPrintModal.vue` — wraps `ReportDocumentRenderer` inside shared `Modal` (size `xl`, `bg-[#f0f0f0]`)
- Create composable `usePrintReport.ts` — manages modal open/close, pagedjs lifecycle, error states
- Reactivate Print buttons on `ReportViewPage` and `ReportFillPage` (`v-if="false"` → `v-if="canPrint"`)
- Wire new flow: button → modal → pagedjs render → window.print()
- Reuse existing skeleton overlay (`isPrinting`) during render wait
- CSS `@media print` rule to hide sidebar/topbar/breadcrumbs

### Out of Scope
- `archive()` flow and html2pdf.js — both remain untouched
- Backend changes (PDF generation, API endpoints)
- PrintPreviewModal in admin/report-template — reused as reference, not modified
- ReportPdfExport.vue — may be deprecated later, unchanged for now

## Capabilities

### New Capabilities
- `report-print`: browser print flow with pagedjs modal preview; reuses `ReportDocumentRenderer` for content and `Modal` for UI shell

### Modified Capabilities
None — `dynamic-form-renderer`, `template-builder`, and `report-admin` are consumed without spec changes.

## Approach

Follow `PrintPreviewModal.vue` as the mold:

1. `ReportPrintModal.vue` opens `Modal(xl)` with `ReportDocumentRenderer` receiving real report data
2. On modal `@ready`, pagedjs `Preview` renders DOM into paginated A4 pages inside the modal container
3. Footer button calls `window.print()` after pagedjs emits `rendered`
4. `usePrintReport.ts` exposes `open`, `close`, `isPrinting`, `error` state
5. `useReportForm.ts` vends the composable; page components consume `openPrintModal()` via existing `isPrinting` flow

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/reports/presentation/components/ReportPrintModal.vue` | New | Modal preview with pagedjs + ReportDocumentRenderer |
| `src/modules/reports/presentation/composables/usePrintReport.ts` | New | State machine: idle → rendering → ready → printing |
| `src/modules/reports/presentation/composables/useReportForm.ts` | Modified | Wire `openPrintModal()` into existing `isPrinting` flow |
| `src/modules/reports/presentation/pages/ReportViewPage.vue` | Modified | `v-if="false"` → `v-if="canPrint"`, button opens modal |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Modified | Same as above |
| `src/assets/css/print.css` | New | `@media print` — hide chrome, show only report pages |
| `package.json` | Modified | Add `pagedjs` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| pagedjs + Tailwind 4 CSS layer conflicts | Medium | Print-specific stylesheet scoped to `@media print` and pagedjs container |
| Async render timing (pagedjs emits `rendered` late) | Low | Wait on `rendered` event + 300ms safety timeout before `window.print()` |
| Modal overflow clips print content | Low | `@media print` targets full DOM, not just modal viewport |
| Logo/signature images unavailable in pagedjs DOM | Low | Verify base64/URL resolution before render; fallback placeholder |

## Rollback Plan

1. Restore `v-if="false"` on both page buttons
2. Set `canPrint` gate to `false` in composable
3. Keep `pagedjs` installed — harmless if unused
4. No data loss — print is read-only, no backend writes

## Dependencies

- `npm install pagedjs` (no peer deps)
- `Modal.vue` shared component (already exists)
- `ReportDocumentRenderer.vue` from admin module (exists, no changes needed)

## Success Criteria

- [ ] User clicks Print → modal opens with paginated A4 preview matching the report template
- [ ] Modal "Imprimir" button triggers native `window.print()` dialog
- [ ] Printed output matches the preview (visual parity with report view page)
- [ ] `html2pdf.js` archive flow continues working unchanged
- [ ] Print buttons visible and functional on both ReportViewPage and ReportFillPage
- [ ] Non-print UI (sidebar, topbar, breadcrumbs) hidden in printed output
