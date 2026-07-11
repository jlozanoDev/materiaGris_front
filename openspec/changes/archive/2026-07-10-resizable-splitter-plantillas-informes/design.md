# Design: Resizable Splitter — Plantillas/Informes

## Technical Approach

Install `splitpanes` (Vue 3, zero deps, ~5KB gzipped). Restructure the 3-panel flex layout in `ReportTemplateBuilderPage.vue` (lines 336–408) so the left palette stays fixed `w-56` outside `<Splitpanes>`, while center canvas and right properties panel become resizable `<Pane>` children. Persist right-pane width to `localStorage`; enforce 200px minimum via `:min-size="20"` (percentage). No changes to composable, preview modals, or other components.

## Architecture Decisions

### Decision: splitpanes over custom composable

**Choice**: `splitpanes` library  
**Alternatives considered**: Custom `useResizableSplitter` composable, CSS-only `resize` property  
**Rationale**: Custom composable adds 100+ lines, needs touch/edge-case handling, and reinvents solved problems. CSS-only `resize` drags from corner — wrong UX. `splitpanes` is battle-tested (14k stars), handles all edge cases, tiny bundle.

### Decision: Left palette stays OUTSIDE Splitpanes

**Choice**: Fix `w-56` as sibling of `<Splitpanes>`, not as a `<Pane>`  
**Alternatives considered**: Make all 3 panels resizable  
**Rationale**: Proposal explicitly scopes splitter to canvas↔properties only. Palette is a fixed tool panel; resizing it adds no value and risks layout complexity.

### Decision: v-if over always-visible placeholder

**Choice**: Keep conditional `v-if="builder.selectedFieldId"` on right pane  
**Alternatives considered**: Always render with "Select a field" placeholder  
**Rationale**: Canvas needs maximum space when no field is selected. `splitpanes` handles dynamic pane removal natively — center expands to fill. If users complain about layout jump, iterate to option B later.

### Decision: localStorage persistence with percentage fallback

**Choice**: Store pane width as `Number` (percentage), read on mount, write on `@resize`. Fallback to 25% (≈288px on typical viewport).  
**Alternatives considered**: Pinia store, URL query param, pixel-based storage  
**Rationale**: Pinia is overkill — single key, no reactivity requirements. Pixels fail across viewport sizes; percentages are viewport-relative and match splitpanes API. Fallback matches current `w-72`.

## Data Flow

```
localStorage ──read──► rightSize ref (25% default)
                            │
   Splitpanes ──@resize──► onRightResize(e.size)
                            │
              localStorage.setItem('report-template-builder-properties-width', size)
```

```
┌──────────┐     ┌────────────────────────────────┐
│ Palette  │     │  Splitpanes (flex-1)            │
│ w-56     │     │  ┌──────────────┬─────────────┐│
│ fixed    │     │  │ Canvas       │ Properties  ││
│          │     │  │ auto or 75%  │ 25% or 0%   ││
│          │     │  │ (min 30%)    │ (min 20%)   ││
└──────────┘     │  └──────────────┴─────────────┘│
                 └────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue` | Modify | Replace lines 336–408 flex container with `<Splitpanes>` + localStorage logic; add unscoped `<style>` for splitter bar |
| `package.json` | Modify | Add `splitpanes` dependency |
| `src/main.ts` | Modify | Import `splitpanes/dist/splitpanes.css` |

## Interfaces / Contracts

**localStorage key**: `report-template-builder-properties-width`  
**Value**: Number string representing percentage (e.g., `"25"`)  
**Default**: `25` (when key is absent, `NaN`, or parse error)

```typescript
// Added to <script setup> in ReportTemplateBuilderPage.vue
import { Splitpanes, Pane } from 'splitpanes'

const STORAGE_KEY = 'report-template-builder-properties-width'
const DEFAULT_RIGHT_WIDTH = 25

const rightSize = ref(
  Number(localStorage.getItem(STORAGE_KEY)) || DEFAULT_RIGHT_WIDTH
)

// Guard: clamp to valid range
rightSize.value = Math.max(20, Math.min(rightSize.value, 50))

function onRightResize(size: number) {
  rightSize.value = size
  localStorage.setItem(STORAGE_KEY, String(size))
}
```

**Template change** (replaces lines 336–408):
```html
<div class="flex flex-1 min-h-0 overflow-hidden gap-4">
  <!-- Left: palette (unchanged) -->
  <aside class="w-56 border ... shrink-0 app-scrollbar">
    <FieldPalette ... />
  </aside>

  <Splitpanes class="flex-1 min-h-0">
    <Pane :min-size="30">
      <main class="h-full ...">
        <!-- canvas (unchanged) -->
      </main>
    </Pane>
    <Pane
      v-if="builder.selectedFieldId"
      :size="rightSize"
      :min-size="20"
      @resize="(e: { size: number }) => onRightResize(e.size)"
    >
      <aside class="h-full ...">
        <FieldPropertiesPanel />
      </aside>
    </Pane>
  </Splitpanes>
</div>
```

**Splitter CSS** (unscoped block, appended to SFC):
```css
.splitpanes__splitter {
  background: transparent;
  position: relative;
}
.splitpanes__splitter::before {
  content: '';
  position: absolute;
  left: 5px; right: 5px; top: 0; bottom: 0;
  background: rgba(124, 58, 237, 0.08);
  border-radius: 4px;
  transition: background-color 0.15s;
}
.splitpanes__splitter:hover::before {
  background: rgba(124, 58, 237, 0.2);
  cursor: col-resize;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `onRightResize` persists to localStorage | Vitest — mock localStorage, simulate resize event |
| Unit | Default fallback on missing/invalid stored value | Vitest — parameterized tests |
| E2E | Splitter drag resizes panels | Playwright — drag splitter, assert pane widths change |
| E2E | Panel not rendered when no field selected | Playwright — verify properties absent, canvas fills space |
| Visual | Splitter bar matches design system | Playwright screenshot comparison |

## Migration / Rollout

No migration required. Rollback: remove `<Splitpanes>`, restore original `<div class="flex ...">` (lines 336–408), uninstall `splitpanes`. `localStorage` entry is inert when unused.

## Open Questions

- None. All decisions resolved in exploration phase.
