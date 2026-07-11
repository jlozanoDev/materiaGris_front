# Archive Report: Resizable Splitter — Plantillas/Informes

**Change**: `resizable-splitter-plantillas-informes`
**Archived**: 2026-07-10
**Mode**: hybrid (openspec + engram)
**Status**: PASS WITH WARNINGS (2 non-blocking)

---

## Summary

Added a draggable resizable splitter (splitpanes library) between the center canvas and right properties panel in the report template builder. Replaced fixed-width 288px flex layout with `<Splitpanes>` + `<Pane>` components. Panel width persists to localStorage with percentage-based storage, 200px minimum enforcement, and fallback to default 25%.

---

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Proposal | `proposal.md` | ✅ Complete |
| Exploration | `exploration.md` | ✅ Complete |
| Specs | `specs/resizable-splitter/spec.md` | ✅ 5 requirements, 11 scenarios |
| Design | `design.md` | ✅ 5 architecture decisions |
| Tasks | `tasks.md` | ✅ 13/13 tasks complete |
| Verify Report | `verify-report.md` | ✅ PASS WITH WARNINGS |
| Apply Progress | Engram obs #357 | ✅ Full TDD cycle evidence |

## Engram Observation IDs

| Artifact | Observation ID | Topic Key |
|----------|---------------|-----------|
| Apply Progress | #357 | `sdd/resizable-splitter-plantillas-informes/apply-progress` |
| Verify Report | #360 | `sdd/resizable-splitter-plantillas-informes/verify-report` |
| Archive Report | (this save) | `sdd/resizable-splitter-plantillas-informes/archive-report` |

---

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| resizable-splitter | Created | 5 requirements added (no prior main spec existed) |

Delta spec copied directly to `openspec/specs/resizable-splitter/spec.md` — this was a new domain with no pre-existing main spec.

---

## Verification Summary

| Check | Result |
|-------|--------|
| All 13 tasks complete | ✅ |
| No CRITICAL issues | ✅ |
| Tests pass (16 Vitest + 3 E2E) | ✅ |
| Lint clean (changed file) | ✅ |
| Type check clean | ✅ |

### Non-blocking Warnings (intentional partial archive)

| # | Issue | Severity | Rationale |
|---|-------|----------|-----------|
| W1 | No debounce on localStorage writes | WARNING (SHOULD-level) | Spec R4 says "SHOULD debounce" — not MUST. Visual resize is real-time. |
| W2 | CSS pseudo-element margin 3px vs design 5px | WARNING (cosmetic) | Functionally correct hit area; minor visual deviation. |

---

## Files Changed

| File | Action |
|------|--------|
| `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue` | Modified — Splitpanes + localStorage |
| `src/main.ts` | Modified — CSS import |
| `package.json` | Modified — splitpanes dependency |
| `docs/tecnica/modulos/admin-report-template.md` | Updated |
| `docs/funcional/modulos/admin-report-template.md` | Updated |
| `tests/visual/report-template-builder.spec.js` | E2E drag test added |

---

## Archive Contents

```
openspec/changes/archive/2026-07-10-resizable-splitter-plantillas-informes/
├── proposal.md
├── exploration.md
├── design.md
├── tasks.md
├── verify-report.md
├── archive-report.md
└── specs/resizable-splitter/spec.md
```

---

## SDD Cycle Complete

The change has been fully planned, implemented, verified, and archived.
Ready for the next change.
