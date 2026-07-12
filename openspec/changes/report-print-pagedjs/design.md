# Design: Print Reports via pagedjs Modal

## Technical Approach

Replace the hidden-iframe `printReport()` flow with a modal that uses pagedjs to paginate `ReportDocumentRenderer` output, then triggers `window.print()`. A new composable `usePrintReport.ts` manages the pagedjs `Previewer` lifecycle. `useReportForm.ts` wraps it via `openPrintModal()`. Both page components activate their disabled Print buttons and wire `@click` to the new modal flow.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| pagedjs source | npm `pagedjs` | CDN/UMD, jsPDF | Vite-native ESM, no external network dep, same bundler pipeline as html2pdf.js |
| Modal | Reuse `AppModal` (size=xl, customClass=bg-[#f0f0f0]) | New standalone modal | Same pattern as `PrintPreviewModal` in admin module, proven integration with `ReportDocumentRenderer` |
| Print CSS | Global `src/assets/css/print.css`, imported in `main.ts` | Scoped `<style>` in modal component | `@media print` must apply to full DOM, not just component scope. Follows existing CSS import pattern. |
| State management | `usePrintReport.ts` (standalone), consumed via `useReportForm.openPrintModal()` | Inline in page components, inside useReportForm | Keeps pagedjs lifecycle isolated; `useReportForm` stays focused on form/report operations. Pages get one method call: `openPrintModal()`. |
| Skeleton | Modal-internal overlay (`isPrinting` pattern) | Full-page overlay (existing behavior) | Spec requires skeleton inside modal body only. Existing page-level skeletons become dead code, safe to remove. |
| Error handling | try/catch in composable + `error` ref + retry/close UI in modal | Error swallowing, modal auto-close | Spec requires explicit error display with retry; user must see and control recovery. |

## Data Flow

```
ReportViewPage/FillPage
  │  @click → openPrintModal()
  ▼
useReportForm.openPrintModal()
  │  delegates to printReport.open(report, signatureUrl)
  ▼
usePrintReport.ts
  │  state='rendering' → show=true → nextTick → pagedjs.preview()
  ▼
ReportPrintModal (mounted via v-if)
  └── AppModal(size=xl, bg-[#f0f0f0])
        ├── [body] div#pagedjs-content
        │     └── ReportDocumentRenderer (:sections, :values, :variableResolver, :signatureUrl)
        ├── [body] div#pagedjs-output  ← pagedjs renders pages here
        └── [footer] "Imprimir" button (:disabled="state !== 'ready'")
                           click → window.print()
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/reports/presentation/components/ReportPrintModal.vue` | Create | Modal wrapping `ReportDocumentRenderer` + pagedjs output container + skeleton + footer |
| `src/modules/reports/presentation/composables/usePrintReport.ts` | Create | State machine: idle→rendering→ready→printing→done, pagedjs `Previewer` lifecycle, safety timeout |
| `src/modules/reports/presentation/composables/useReportForm.ts` | Modify | Add `openPrintModal()`, `printModalState`, `printModalShow`, `closePrintModal` via internal `usePrintReport()` instance |
| `src/modules/reports/presentation/pages/ReportViewPage.vue` | Modify | `v-if="false"` → `v-if="canPrint && report?.status !== 'draft'"`, `@click` → `openPrintModal`, add `ReportPrintModal` in template, remove page skeleton |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Modify | Same as above |
| `src/assets/css/print.css` | Create | `@media print` — hide `.app-sidebar`, `.topbar`, `.modal-backdrop`, `.modal-header`, `.modal-footer`, show only `.pagedjs_page` |
| `src/main.ts` | Modify | `import '@/assets/css/print.css'` after `./style.css` |
| `package.json` | Modify | Add `"pagedjs": "^0.4.3"` |

## Interfaces / Contracts

**usePrintReport.ts API:**
```ts
type PrintState = 'idle' | 'rendering' | 'ready' | 'printing' | 'done' | 'error'

export function usePrintReport(): {
  state: Ref<PrintState>
  show: ComputedRef<boolean>
  error: Ref<string | null>
  open(report: PatientReport, signatureUrl?: string | null): void
  close(): void
  retry(): void
}
```

**ReportPrintModal.vue props/emits:**
```ts
props: { show: boolean; report: PatientReport; patient?: Patient | null; user?: AuthUser | null; signatureUrl?: string | null; state: PrintState; error: string | null }
emits: { close: []; retry: [] }
```

**useReportForm.ts additions to return type:**
```ts
openPrintModal: () => void
printModalShow: ComputedRef<boolean>
printModalState: Ref<PrintState>
closePrintModal: () => void
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `usePrintReport` state machine | Vitest — mock pagedjs `Previewer`, verify state transitions (open → rendering, rendered event → ready, close → idle, error → error state) |
| Unit | `ReportPrintModal` rendering | Vue Test Utils — stub `AppModal`, `ReportDocumentRenderer`; verify skeleton when `state=rendering`, button disabled states, error UI |
| Unit | Page button visibility | Vitest — verify `v-if` logic: draft=hidden, signed+permission=visible, archived+permission=visible, no-permission=hidden |
| Integration | Print CSS isolation | Playwright — open modal, verify `@media print` hides chrome elements via snapshot comparison |
| Integration | archive() unchanged | Existing tests for `archive()` must pass; verify no regression in `useReportForm.test.ts` |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Rollback: restore `v-if="false"` on both page buttons. Keep `pagedjs` installed — harmless if unused.

## Open Questions

- [ ] Exact pagedjs `Previewer` event API must be verified against the installed version during implementation
- [ ] `signatureUrl` value type: `ReportFillPage` passes base64 canvas data; must verify pagedjs handles inline data URIs without breaking pagination
