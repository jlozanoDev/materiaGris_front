# report-print Specification

Browser print flow with pagedjs modal preview; reuses `ReportDocumentRenderer` for content and `Modal` for UI shell.

## Requirements

### Requirement: Print Modal Lifecycle

The system MUST open a modal preview when the user clicks a Print button on `ReportViewPage` or `ReportFillPage`. The modal SHALL render report content via `ReportDocumentRenderer` inside `AppModal(size="xl")` with `bg-[#f0f0f0]`. The composable `usePrintReport` SHALL expose `open(report, signatureUrl)`, `close()`, `isPrinting`, and `error` state. Both page components MUST consume `openPrintModal()` from `useReportForm`.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| **Open from ReportViewPage** | report loaded, `canPrint=true` | user clicks "Imprimir" | modal opens with report content in `ReportDocumentRenderer` |
| **Open from ReportFillPage** | signed report, `canPrint=true` | user clicks "Imprimir" | modal opens; same renderer receives fill-page data |
| **Close modal** | modal open | user clicks close button or backdrop | modal closes, `isPrinting=false` |
| **Re-open** | modal closed | user clicks Print again | modal reopens with fresh renderer instance |

### Requirement: pagedjs Pagination

The `usePrintReport` composable MUST instantiate pagedjs `Preview` on modal `@ready`, targeting the renderer's root element. It SHALL paginate content into A4-sized pages (`size: '210mm 297mm'`, `margin: 15mm`). A skeleton overlay (`isPrinting`) MUST display while pagedjs renders. The `rendered` event SHALL signal completion and hide the overlay.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| **Render success** | modal opened, DOM mounted | pagedjs finishes layout | skeleton hides, paginated A4 pages visible, footer "Imprimir" enabled |
| **Render in progress** | modal opened, pagedjs busy | user looks at modal | skeleton overlay visible, content hidden behind it |
| **Multi-page report** | report yields >1 A4 page | pagedjs `rendered` fires | all pages visible in scrollable container, page breaks respected |

### Requirement: Browser Print Trigger

When pagedjs has emitted `rendered`, the modal footer MUST show an "Imprimir" button. On click, the system SHALL call `window.print()`. The `@media print` CSS rule SHALL hide the modal shell, app chrome, and skeleton — only report `.pagedjs_page` elements print. The system SHOULD wait 300ms after `rendered` before enabling the button.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| **Trigger print** | modal ready, pagedjs rendered | user clicks "Imprimir" | browser print dialog opens; preview shows only report pages |
| **Print CSS isolation** | print triggered | browser renders print preview | sidebar, topbar, breadcrumbs, modal chrome not visible; report pages fill output |
| **Button disabled during render** | modal open, pagedjs rendering | user looks at footer | "Imprimir" button disabled or hidden |

### Requirement: Print Button Visibility

The Print button on `ReportViewPage` and `ReportFillPage` MUST replace `v-if="false"` with `v-if="canPrint"`. `canPrint` SHALL evaluate to `true` when the user has `report.download-pdf` permission AND the report is in a printable state (signed or archived). The button MUST remain hidden for draft reports.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| **Signed report** | `status=signed`, user has permission | page loads | Print button visible |
| **Archived report** | `status=archived`, user has permission | page loads | Print button visible |
| **Draft report** | `status=draft` | page loads | Print button hidden |
| **No permission** | user lacks `report.download-pdf` | page loads | Print button hidden |

### Requirement: Error Handling

If pagedjs instantiation, rendering, or the `rendered` event fails, the composable MUST set an `error` state. The modal SHALL display an error message with options to close or retry. Retry SHALL re-run the pagedjs flow from scratch. The error state MUST NOT block `window.print()` if already triggered.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| **Render failure** | pagedjs throws or times out | composable catches error | modal shows error UI; "Reintentar" and "Cerrar" buttons available |
| **Retry after error** | error state shown | user clicks "Reintentar" | pagedjs reinitializes; skeleton reappears; fresh render attempt |
| **Close after error** | error state shown | user clicks "Cerrar" | modal closes; error state cleared |

### Requirement: archive() Flow Unchanged

The existing `archive()` method in `useReportForm` and `useReportPdf.ts` (html2pdf.js) MUST continue working without modification. Print changes SHALL NOT alter `ReportPdfExport.vue`, its iframe-based flow, or the html2pdf.js dependency. `isPrinting` state SHALL NOT be shared between print and archive flows.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| **Archive after print** | report printed via modal | user archives via existing button | archive flow works; html2pdf.js generates PDF; no interference |
| **Print after archive** | report archived | user clicks Print | modal opens; pagedjs flow independent of archive state |
| **Concurrent guard** | archive running | user clicks Print | print blocked or queued; no DOM conflict between html2pdf and pagedjs |

### Requirement: Print CSS

A new `src/assets/css/print.css` stylesheet SHALL define `@media print` rules. It MUST hide sidebar (`.app-sidebar`), topbar (`.topbar`), breadcrumbs, modal backdrop/header/footer, and the skeleton overlay. It SHALL reveal only `.pagedjs_pages` content styled for A4 output. This stylesheet MUST be loaded globally in `index.html` or `main.ts`.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| **Browser print** | `window.print()` triggered | print rendering | only report pages visible; no sidebar, topbar, breadcrumbs |
| **Screen view unaffected** | normal browsing | user views page | sidebar, topbar, breadcrumbs visible as before |
| **Modal chrome hidden** | print triggered from modal | `@media print` active | modal backdrop, header, footer, close button not in print output |
