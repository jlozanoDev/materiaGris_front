# Design: Fix Report Content Not Rendering

## Technical Approach

Three independent fixes, ordered by criticality: (1) API normalizer in repository, (2) error handling in composable, (3) variable resolver wire through component tree.

## Architecture Decisions

### Decision: Key normalization in ApiReportRepository

**Choice**: Private `normalizeReport(raw)` method in `ApiReportRepository`, applied in `initReport()` and `getById()`.

**Alternatives considered**: Shared utility in `shared/utils/` — rejected because key normalization is NOT a cross-cutting concern. Only the reports API returns snake_case at the top level (template editor serializes inner structure as camelCase). `fetchClient` must remain a generic HTTP client.

**Rationale**: Infrastructure layer responsibility — adapts external data to `PatientReport` domain type. No other module needs this.

### Decision: Props over provide/inject for variableResolver

**Choice**: Pass `variableResolver` via props: `ReportFillPage` → `DynamicFormRenderer` → `DynamicField` → `FixedTextRenderer`.

**Rationale**: 3-level depth, explicit contract, testable. Provide/inject obscures data flow and breaks component isolation.

### Decision: Hybrid resolver — SystemVariableRegistry + legacy map

**Choice**: `ReportFillPage` constructs a resolver that chains `SystemVariableRegistry.interpolate()` (for `{category.key}` patterns) with a simple `Record<string, string>` fallback for legacy `{patient_name}`, `{date}`, `{author_name}`.

**Rationale**: Current templates use ad-hoc variable names without category prefix. `SystemVariableRegistry.register(cat, key)` builds `category.key` — can't store raw keys. The fallback handles legacy names without modifying the shared registry class.

## Data Flow

```
GET /reports/:id → fetchClient → raw JSON { template_structure_snapshot: {...} }
                                     │
                                     ▼
                          ApiReportRepository.normalizeReport(raw)
                          ── maps snake_case → camelCase ──
                                     │
                                     ▼
                          InitReportUseCase / GetReportUseCase
                                     │
                                     ▼
                             useReportForm.report
                                     │
                     ┌───────────────┼──────────────────┐
                     ▼               ▼                  ▼
           DynamicFormRenderer  variableResolver()  errorMessage
               :sections          (interpolate      (rendered as
               :variableResolver   legacy vars)      error alert)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/reports/infrastructure/ApiReportRepository.ts` | Modify | Add `normalizeReport()` method; apply to `initReport()`, `getById()`, `saveDraft()`, `sign()`, `close()` |
| `src/modules/reports/presentation/composables/useReportForm.ts` | Modify | Add `errorMessage` and `isLoading` refs; wrap `init()`/`loadReport()` in try/catch |
| `src/modules/reports/presentation/components/DynamicFormRenderer.vue` | Modify | Add `variableResolver?: (text: string) => string` prop; pass to all `DynamicField` instances |
| `src/modules/reports/presentation/components/DynamicField.vue` | Modify | Add `variableResolver?: (text: string) => string` prop; pass to `FixedTextRenderer` |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Modify | Build resolver function; pass to `DynamicFormRenderer`; render `errorMessage` |

**No changes to** `FixedTextRenderer.vue` — already accepts `variableResolver` prop.

## Interfaces / Contracts

```typescript
// ApiReportRepository — new private method
private normalizeReport(raw: Record<string, any>): PatientReport {
  const KEY_MAP: Record<string, string> = {
    template_structure_snapshot: "templateStructureSnapshot",
    patient_id: "patientId",
    user_id: "userId",
    created_at: "createdAt",
    updated_at: "updatedAt",
  }
  const result: Record<string, any> = {}
  for (const [k, v] of Object.entries(raw)) {
    result[KEY_MAP[k] ?? k] = v
  }
  return result as PatientReport
}
```

```typescript
// DynamicFormRenderer — new prop
variableResolver?: (text: string) => string

// DynamicField — new prop
variableResolver?: (text: string) => string
```

```typescript
// useReportForm — new exposed refs
errorMessage: Ref<string | null>  // null = no error
isLoading: Ref<boolean>            // true while init/loadReport pending
```

## Error Handling Strategy

**Composable**: `init()` and `loadReport()` catch errors → set `errorMessage` and `report.value = null`. `isLoading` transitions: `true` before call → `false` in finally.

**Page**: Show loading skeleton while `isLoading && !report`. Show error banner when `errorMessage` is set (red background div, matching existing validation-error style). Show empty report shell when neither loading nor errored nor report loaded.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit: Repository | `normalizeReport` maps all 5 keys correctly; passes through unknown keys; handles null/missing values | Jest/Vitest, mock `fetchClient` |
| Unit: Composable | `errorMessage` set on API failure; `isLoading` transitions; `report` stays null on error | Existing mock pattern |
| Unit: DynamicFormRenderer | `variableResolver` prop passed to child `DynamicField`; header/footer zones also pass it | Mount with mock resolver, check child props |
| Unit: DynamicField | `variableResolver` forwarded to `FixedTextRenderer` for `fixed_text` type | Mount, verify `FixedTextRenderer` props |
| Integration: Page | Full render with mocked useReportForm returning error; error banner visible | Mount with mocked composable |

## Implementation Order

1. **Fix 1** — API normalizer (unblocks rendering)
2. **Fix 3** — Error handling (prevents infinite load on failure)
3. **Fix 2** — Variable resolver wire (cosmetic, independent)

## Open Questions

- [ ] Confirm backend returns `template_structure_snapshot` inner keys (sections/rows/fields) in camelCase (as serialized by template editor). If not, recursive normalization needed.
- [ ] Confirm `saveDraft()` response includes `template_structure_snapshot` — if yes, normalize it too to keep report state consistent after auto-save.
