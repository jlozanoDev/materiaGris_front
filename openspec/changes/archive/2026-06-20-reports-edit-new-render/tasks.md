# Tasks: Fix Report Content Not Rendering

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~185 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |
| Chain strategy | Not needed |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: not-needed
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | All three fixes + tests | Single PR | ~185 lines, well under 400 budget |

## Phase 1: API Response Normalization (TDD)

- [x] 1.1 **RED**: Write `ApiReportRepository.test.ts` — test `normalizeReport()` maps `template_structure_snapshot`→`templateStructureSnapshot`, `patient_id`→`patientId`, `template_id`→`templateId`, `user_id`→`userId`, `created_at`→`createdAt`, `updated_at`→`updatedAt`; unknown keys pass through; handles null/missing values. Mock `fetchClient`.
- [x] 1.2 **GREEN**: Add private `normalizeReport(raw)` method in `src/modules/reports/infrastructure/ApiReportRepository.ts`. Apply to return values of `initReport()`, `getById()`, `saveDraft()`, `sign()`, `close()`.
- [x] 1.3 **GREEN**: Run `cd frontend && npx vitest run --run` — all existing + new tests pass.

## Phase 2: Error Handling in useReportForm (TDD)

- [x] 2.1 **RED**: Extend `src/modules/reports/presentation/composables/__tests__/useReportForm.test.ts` — test `errorMessage` ref set on `init()`/`loadReport()` rejection, `isLoading` transitions true→false, `report` stays null on error.
- [x] 2.2 **GREEN**: Add `errorMessage: Ref<string | null>` and `isLoading: Ref<boolean>` to `useReportForm` return interface + implementation. Wrap `init()` and `loadReport()` in try/catch → set `errorMessage` on failure, clear on success, toggle `isLoading` in finally.
- [x] 2.3 **GREEN**: Add error banner to `ReportFillPage.vue` — when `errorMessage` is set, show red banner (`bg-red-50 rounded-2xl p-4`) with message + "Reintentar" button that retries `init()` or `loadReport()`. Replace `v-if="!report"` with `v-if="isLoading"` for skeleton. Destructure `errorMessage` and `isLoading` from `useReportForm()`.
- [x] 2.4 **GREEN**: Run `npx vitest run --run` — all tests pass.

## Phase 3: Variable Resolver Wiring (TDD)

- [x] 3.1 **RED**: Extend `DynamicFormRenderer.test.ts` — test that `variableResolver` prop is passed to child `DynamicField` components in header, body, and footer zones. Mount with mock resolver `(t) => t.replace('{x}', 'Y')`.
- [x] 3.2 **RED**: Extend `DynamicField.test.ts` — test that `variableResolver` prop is forwarded to `FixedTextRenderer` for `fixed_text` type fields. Verify `FixedTextRenderer` receives the prop.
- [x] 3.3 **GREEN**: Add optional `variableResolver?: (text: string) => string` prop to `DynamicFormRenderer.vue`. Pass it to every `DynamicField` instance in header, body, and footer zones (3 template locations).
- [x] 3.4 **GREEN**: Add optional `variableResolver?: (text: string) => string` prop to `DynamicField.vue`. Pass it to `FixedTextRenderer` in both readonly (line 31) and editable (line 173) branches.
- [x] 3.5 **GREEN**: In `ReportFillPage.vue`, build a resolver function that chains `SystemVariableRegistry.interpolate()` (for `{category.key}` patterns) with a legacy `Record<string,string>` fallback for ad-hoc keys like `{patient_name}`, `{date}`, `{author_name}`. Pass resolver as `variableResolver` prop to `<DynamicFormRenderer>`. Import `SystemVariableRegistry` from `@/shared/types/SystemVariableRegistry`.
- [x] 3.6 **GREEN**: Run `npx vitest run --run` — all tests pass, including resolver wiring assertions.
