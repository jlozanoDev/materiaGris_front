# Tasks: Cabecera y pie configurables en plantillas de informe

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~480 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Delivery strategy | ask-always |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Types + composable + builder UI + renderers | PR 1 (~258 lines) | Base: `feature/report-template-cabecera-pie`; establishes API contract |
| 2 | Page integration + modals + tests + docs | PR 2 (~222 lines) | Base: PR 1 branch; wiring + verification; depends on PR 1 |

## Phase 1: Types and Data Model

- [x] 1.1 Add `HeaderFooterConfig` interface to `src/shared/types/index.ts`
- [x] 1.2 Update `ReportTemplate.structure` type: add optional `header?`/`footer?`
- [x] 1.3 Update `PatientReport.templateStructureSnapshot` type to same shape

## Phase 2: Composable (`useTemplateBuilder.ts`)

- [x] 2.1 Add refs: `headerSections`, `footerSections`, `headerEnabled`, `footerEnabled`, `headerPageDisplay`, `footerPageDisplay`, `activeZone`
- [x] 2.2 Add `activeSections` computed + `switchZone(zone)` method + `currentSections()` helper
- [x] 2.3 Extend `findFieldById` to search header, body, and footer collections
- [x] 2.4 Extend `isDuplicateKey` to validate across all three zones
- [x] 2.5 Extend `saveTemplate`: serialize `{ sections, header?, footer? }`
- [x] 2.6 Extend `loadTemplate`: extract header/footer with defaults (`enabled: false, sections: []`)
- [x] 2.7 Update `UseTemplateBuilderReturn` interface with new exports

## Phase 3: Builder UI

- [x] 3.1 Create `HeaderFooterEditor.vue` — toggle `enabled` + `pageDisplay` selector (all/first/last)
- [x] 3.2 Add zone tabs (Cabecera | Cuerpo | Pie) to `ReportTemplateBuilderPage.vue`, bind `activeZone`, integrate `HeaderFooterEditor`

## Phase 4: Renderers

- [x] 4.1 `ReportDocumentRenderer.vue`: remove hardcoded header lines, add `headerSections`/`footerSections` props, render dynamic header/footer
- [x] 4.2 `DynamicFormRenderer.vue`: add `headerSections`/`footerSections` props, render read-only zones via `DynamicField` with `disabled=true`

## Phase 5: Page Integration and Modals

- [x] 5.1 `PrintPreviewModal.vue`: pass `headerSections`/`footerSections` to `ReportDocumentRenderer`
- [x] 5.2 `PreviewModal.vue`: pass `headerSections`/`footerSections` to `DynamicFormRenderer`
- [x] 5.3 `ReportFillPage.vue`: extract `header`/`footer` from `templateStructureSnapshot`, pass to renderer
- [x] 5.4 `ReportViewPage.vue`: extract `header`/`footer` from `templateStructureSnapshot`, pass to renderer

## Phase 6: Tests and Docs

- [x] 6.1 Extend `useTemplateBuilder.spec.ts`: header/footer save/load round-trip, legacy template defaults, `activeSections` computed, `switchZone`, cross-zone `findFieldById`
- [x] 6.2 Extend `DynamicFormRenderer.test.ts`: header/footer read-only rendering, undefined props omit zones
- [x] 6.3 Extend `ReportTemplateBuilderPage.spec.ts`: tab switching preserves state independently
- [x] 6.4 Verify: `cd frontend && npx vitest run` — no regressions
- [x] 6.5 Verify: `cd frontend && npm run build` — no build errors
- [x] 6.6 Update `docs/tecnica/modulos/admin-report-template.md` with header/footer architecture
- [x] 6.7 Update `docs/funcional/modulos/admin-report-template.md` with header/footer user flow
