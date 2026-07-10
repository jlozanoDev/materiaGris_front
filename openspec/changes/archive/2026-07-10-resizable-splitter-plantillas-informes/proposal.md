# Proposal: Resizable Splitter — Plantillas/Informes

## Intent

The report template builder's right properties panel has a fixed width (288px, `w-72`). Field labels, AI metadata, and system variable settings overflow or truncate, forcing horizontal scroll. Admins need to resize the panel to see full content without constraining the canvas.

## Scope

### In Scope
- Install `splitpanes` (Vue 3 native, zero deps, ~5KB gzipped)
- Replace center+right flex container with `<Splitpanes>` + `<Pane>` in `ReportTemplateBuilderPage.vue`
- Persist right-pane width to `localStorage` per user (survives refresh/session)
- Enforce 200px minimum for properties panel (never collapses to zero)
- Left palette stays fixed `w-56` — no splitter there

### Out of Scope
- Splitter between left palette and center canvas
- Global splitter component (page-local only)
- Persistence across different machines/browsers
- Preview modal (unchanged)

## Capabilities

### New Capabilities
- `resizable-splitter`: Draggable boundary between center canvas and right properties panel, with localStorage persistence and configurable minimum size

### Modified Capabilities
- None — existing `template-builder` 3-panel layout requirement is preserved; only the implementation changes from fixed-width CSS to resizable split panes

## Approach

1. `npm install splitpanes` — add dependency
2. In `ReportTemplateBuilderPage.vue` (lines 336–408): Replace `<div class="flex flex-1 ...">` wrapper with:
   ```vue
   <Splitpanes class="flex-1 min-h-0">
     <Pane :size="centerSize" :min-size="30">
       <main><!-- existing canvas --></main>
     </Pane>
     <Pane v-if="builder.selectedFieldId" :size="rightSize" :min-size="20" @resize="saveRightWidth">
       <aside><!-- existing properties panel --></aside>
     </Pane>
   </Splitpanes>
   ```
3. Add Pinia/localStorage logic to save/restore right pane width
4. Import splitpanes CSS once in the component or `main.js`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `ReportTemplateBuilderPage.vue` | Modified | Flex container → Splitpanes + localStorage logic |
| `package.json` | New dep | `splitpanes` added |
| `FieldPropertiesPanel.vue` | Verified | Confirm min-width 200px works; may adjust internal overflow |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Splitpanes conflicts with Tailwind/Vuetify styles | Low | Isolated to one component; can scope CSS |
| localStorage corruption on resize | Low | Fallback to default 288px (`w-72`) if stored value invalid |

## Rollback Plan

Remove `<Splitpanes>`, restore original `<div class="flex ...">` wrapper, uninstall `splitpanes`. No data migration needed — localStorage entry is inert.

## Dependencies

- None (zero-dep package, no backend changes)

## Success Criteria

- [ ] Properties panel resizes by dragging the boundary handle
- [ ] Width persists across page reloads within same browser
- [ ] Panel never collapses below ~200px
- [ ] Left palette remains fixed 224px
- [ ] Preview modal unaffected
- [ ] No visual regressions in empty state, sections, or drag-drop behavior
