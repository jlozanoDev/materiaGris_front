# Tasks: Resizable Splitter — Plantillas/Informes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 45–65 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: not_needed
400-line budget risk: Low

## Phase 1: Foundation (dependency + styles)

- [x] 1.1 Install `splitpanes`: `npm install splitpanes` — adds to `package.json` + `package-lock.json`
- [x] 1.2 Import splitpanes CSS in `src/main.ts`: `import 'splitpanes/dist/splitpanes.css'` — place after existing CSS imports

## Phase 2: Core Implementation (one file)

- [x] 2.1 Add imports in `ReportTemplateBuilderPage.vue` `<script setup>`: `import { Splitpanes, Pane } from 'splitpanes'` + `import { ref } from 'vue'`
- [x] 2.2 Add localStorage logic: `STORAGE_KEY`, `DEFAULT_RIGHT_WIDTH`, `rightSize` ref (read on init, clamp 20–50), `onRightResize` function (writes on @resize)
- [x] 2.3 Replace `<div class="flex flex-1 min-h-0 ...">` wrapper (lines 336–408) with `<Splitpanes class="flex-1 min-h-0">` wrapping `<Pane>` for canvas + `<Pane v-if>` for properties
- [x] 2.4 Append unscoped `<style>` block to SFC: transparent splitter with purple hover accent, col-resize cursor, 10px hit area

## Phase 3: Testing

- [x] 3.1 Unit test: `onRightResize` persists valid width to `localStorage.setItem` (Vitest — mock localStorage)
- [x] 3.2 Unit test: default 25% fallback when stored value is missing, NaN, negative, or >50 (Vitest — parameterized)
- [x] 3.3 E2E test: drag splitter right by 100px, assert properties pane width increased (Playwright)
- [x] 3.4 E2E test: no field selected → properties pane absent, canvas fills space (Playwright)
- [x] 3.5 Visual check: lint + typecheck + tests pass (`npm run quality && npm run test`)

## Phase 4: Cleanup / Documentation

- [x] 4.1 Update `docs/tecnica/modulos/admin-report-template.md` with splitter behavior
- [x] 4.2 Update `docs/funcional/modulos/admin-report-template.md` note about resizable panel
