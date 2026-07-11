# Exploration: Resizable Splitter — Plantillas de Informes

## Current State

The report template builder is a **3-panel layout** inside `ReportTemplateBuilderPage.vue` (line 336-408), implemented as a Tailwind flex container:

```
┌─────────────────────────────────────────────────────────┐
│  Left Panel (FieldPalette)    │  Center (Canvas)        │  Right (Properties)
│  `w-56` (224px) shrink-0    │  `flex-1`               │  `w-72` (288px) shrink-0
│  Always visible              │  Overflow-y-auto         │  Conditional: v-if selectedFieldId
└─────────────────────────────────────────────────────────┘
```

**Current CSS (lines 336-408)**:
```html
<div class="flex flex-1 min-h-0 overflow-hidden gap-4">
  <aside class="w-56 ... shrink-0"><FieldPalette /></aside>
  <main class="flex-1 overflow-y-auto ..."><!-- sections --></main>
  <aside v-if="builder.selectedFieldId" class="w-72 ... shrink-0">
    <FieldPropertiesPanel />
  </aside>
</div>
```

The right properties panel is **conditionally rendered** — it only appears when a field is selected (`builder.selectedFieldId`). Both side panels have fixed widths (`w-56` and `w-72`) with `shrink-0`, meaning they never resize and the canvas fills the remaining space.

## Affected Areas

| File | Role | Impact |
|------|------|--------|
| `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue` | Template builder page — lines 336-408 contain the 3-panel flex layout | **PRIMARY** — replace fixed-width flex with resizable split panes |
| `src/modules/admin/report-template/presentation/components/FieldPropertiesPanel.vue` | Properties panel (161 lines) — no layout logic, purely content | **INDIRECT** — may need min-width constraint to prevent collapse |
| `package.json` | Dependencies | **ADD** — new splitter library (e.g., `splitpanes`) |

## Component Hierarchy

```
ReportTemplateBuilderPage.vue  (461 lines)
├── AppSidebar (global sidebar)
├── TopBarLayout
├── Breadcrumb
├── HeaderFooterEditor (shrink-0, conditional)
├── [3-PANEL FLEX LAYOUT ← THE TARGET] (lines 336-408)
│   ├── aside.left → FieldPalette (w-56 fixed)
│   ├── main.center → draggable sections
│   │   └── SectionPanel → DroppableRow → DroppableColumn → DroppableField
│   └── aside.right → FieldPropertiesPanel (w-72 fixed, v-if)
├── PreviewModal
├── PrintPreviewModal
└── Modal (unsaved changes)
```

**State management**: `useTemplateBuilder` composable (746 lines, `BUILDER_KEY` symbol). `selectedFieldId` (ref) controls properties panel visibility. The composable is fully reactive and injected via provide/inject — no changes needed there for this feature.

## Dependencies Available

| Source | Has Split Panel? | Notes |
|--------|------------------|-------|
| Vuetify 4.0.1 | **NO** | Vuetify removed `v-split-panel` in v3+. No replacement exists. |
| Tailwind CSS 4 | **NO** | No built-in splitter. `resize-x` utility exists but only works on bottom-right corner of a `textarea`-like element — not a vertical splitter bar. |
| `vuedraggable` 4.1.0 | **NO** | Only handles drag-to-reorder; no resizing. |
| `splitpanes` (npm) | **YES** | Popular Vue 3 library. ~14k stars, zero dependencies, lightweight (~5KB gzipped). Ideal candidate. |
| `vue-split-panel` (npm) | Partial | Less maintained, fewer features. |

**No existing splitter component** anywhere in the codebase. Zero matches for `*Split*.vue` or `*resize*.vue`.

## Approaches

### 1. Install `splitpanes` + wrap canvas+properties (RECOMMENDED)

Install `splitpanes` (Vue 3 native, zero deps) and replace the flex container with `<Splitpanes>` / `<Pane>`.

```html
<Splitpanes class="flex-1 min-h-0">
  <Pane :size="30" :min-size="20"><!-- LEFT: palette --></Pane>
  <Pane :size="50" :min-size="30"><!-- CENTER: canvas --></Pane>
  <Pane v-if="builder.selectedFieldId" :size="20" :min-size="20"><!-- RIGHT: properties --></Pane>
</Splitpanes>
```

- **Pros**: Battle-tested library, horizontal+vertical support, min/max sizing, accessibility, touch support, clean API, tiny bundle (~5KB)
- **Cons**: Adds 1 new dependency, left panel also becomes resizable (can be configured as non-resizable if needed), conditional pane may cause layout jitter
- **Effort**: Low (30-40 lines changed)

### 2. Custom composable `useResizableSplitter` + mouse events

Build a custom Vue composable that tracks `mousedown`/`mousemove`/`mouseup` on a splitter bar and adjusts CSS widths.

- **Pros**: Zero dependencies, full control over behavior, fits the Clean Architecture ethos
- **Cons**: Must handle edge cases (drag out of viewport, touch events, SSR, iframe interference), reinventing the wheel, ~100+ lines of new code, needs tests
- **Effort**: Medium-High (80-120 new lines, plus tests)

### 3. CSS-only `resize` property (NOT VIABLE)

Use `resize: horizontal; overflow: auto` on the properties panel `<aside>`.

- **Pros**: No JS, zero dependencies, 2 lines of CSS
- **Cons**: Only resizes from bottom-right corner — **not a vertical splitter bar between panels**. The user drags the corner of the panel itself, not a bar between content areas. Bad UX for this use case.
- **Effort**: Trivial but wrong UX

## Recommendation

**Approach 1: Install `splitpanes`.**

- The library is mature (14k+ stars, actively maintained), tiny, and zero-dependency.
- It handles all the hard problems (mouse tracking, touch, min/max constraints, resize events).
- The layout change is localized to `ReportTemplateBuilderPage.vue` lines 336-408 — no other files need logic changes.
- `FieldPropertiesPanel.vue` may need a `min-width` constraint (~250px) to prevent the content from collapsing when the panel is resized too small.

### Conditional Panel Handling

The properties panel is conditionally visible (`v-if="builder.selectedFieldId"`). Two sub-approaches:

**A. Keep conditional** — Splitpanes handles dynamic pane removal gracefully. The canvas will expand to fill the space when the panel is hidden. Minimal disruption to existing behavior.

**B. Always render with empty state** — Show a "Selecciona un campo para editar" placeholder when no field is selected. More consistent layout (no jump), but permanently reduces canvas space.

**Recommendation: Start with (A)** — it's the smallest change. If users complain about the layout jump, iterate to (B) later.

## Risks

- **Layout jitter**: When selecting/deselecting a field, the canvas width changes abruptly. This can be mitigated with CSS transitions on the split panes.
- **Min-width on properties panel**: If the user drags the splitter to collapse the properties panel to 0px, the content becomes unusable but the panel stays open. Set `:min-size="18"` (~250px) to prevent this.
- **Mobile/touch**: The builder page is not currently optimized for mobile. Adding a splitter doesn't change this. `splitpanes` supports touch natively.
- **Left panel resize**: With `splitpanes`, the left palette panel would also become resizable by default. This is actually a bonus — users can expand the palette to see field types better. Can be locked with `:size` as a fixed pane if undesired.
- **Test impact**: Existing Playwright e2e tests or Vitest tests that depend on specific layout widths may break. Check for hardcoded viewport assumptions.
- **Build size**: `splitpanes` adds ~15KB bundled (~5KB gzipped). Negligible.

## Complexity Estimate

| Metric | Value |
|--------|-------|
| Files touched | 3 (builder page, properties panel, package.json) |
| Lines changed | ~30-50 (page layout refactor) + 1 dependency |
| New code | 0 (library handles the logic) |
| Tests needed | Visual regression test for splitter bar; verify properties panel still functions |
| Risk level | **LOW** — localized change, no logic modification |

## Ready for Proposal

**Yes.** All necessary information gathered. Proceed to proposal phase.
