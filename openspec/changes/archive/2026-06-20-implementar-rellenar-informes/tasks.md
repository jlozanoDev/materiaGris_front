# Tasks: Puntos de Entrada para Edición de Informes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~235 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | DynamicField readonly refactor + all 4 button additions + all tests | Single PR | Under 400-line budget; no chaining needed |

## Phase 1: DynamicField Readonly Refactor (Core)

- [x] 1.1 DynamicField.vue: Wrap template in `v-if="isDisabled"` / `v-else`. Types text/textarea/number render `<span>{{ modelValue || '—' }}</span>`. Date renders `formatDate()`. Select/radio render `optionLabel()`. Multi_select/checkbox render `optionLabels().join(', ')`. Keep existing input branches inside `v-else` intact.
  Depends on: nothing.
  Files: `src/modules/reports/presentation/components/DynamicField.vue`
- [x] 1.2 DynamicField.vue: Add script helpers `formatDate(val)`, `optionLabel(val)`, `optionLabels(arr)`.
  Depends on: 1.1
  Files: `src/modules/reports/presentation/components/DynamicField.vue`
- [x] 1.3 DynamicField.vue: Ensure fixed_text, dynamic_table, separators render identically in both disabled modes.
  Depends on: 1.1
  Files: `src/modules/reports/presentation/components/DynamicField.vue`

## Phase 2: DynamicField Tests

- [x] 2.1 Update "renders as disabled" test: verify `<span>` element exists with value, no `<input>` present.
  Depends on: 1.1-1.3
  Files: `src/modules/reports/presentation/components/__tests__/DynamicField.test.ts`
- [x] 2.2 Add test: date field when disabled renders locale-formatted span "19/06/2026".
  Depends on: 2.1
  Files: `src/modules/reports/presentation/components/__tests__/DynamicField.test.ts`
- [x] 2.3 Add test: select field when disabled renders option label, not CustomSelect trigger.
  Depends on: 2.1
  Files: `src/modules/reports/presentation/components/__tests__/DynamicField.test.ts`
- [x] 2.4 Add test: multi_select when disabled renders comma-separated labels.
  Depends on: 2.1
  Files: `src/modules/reports/presentation/components/__tests__/DynamicField.test.ts`

## Phase 3: ReportListPage Edit Button

- [x] 3.1 Add computed `canEdit` using `authStore.hasPermission('report.edit')`. Add "Editar" button in actions column (alongside "Ver"), with `v-if="report.status === 'draft' && canEdit"`, `@click` → `router.push({ name: 'ReportEdit', params: { id } })`.
  Depends on: nothing (independent UI addition).
  Files: `src/modules/reports/presentation/pages/ReportListPage.vue`
- [ ] 3.2 Add test: "Editar" button visible for draft report + permission `report.edit`.
  Depends on: 3.1
  Files: `tests/ReportListPage.spec.ts`
- [ ] 3.3 Add test: "Editar" button hidden when user lacks `report.edit` permission.
  Depends on: 3.1
  Files: `tests/ReportListPage.spec.ts`

## Phase 4: ReportViewPage Edit Button

- [x] 4.1 Add computed `canEdit` using `authStore.hasPermission('report.edit')`. Add "Editar" button in action bar, `v-if="canEdit && report.status === 'draft'"`, navigates to `ReportEdit`.
  Depends on: nothing (independent UI addition).
  Files: `src/modules/reports/presentation/pages/ReportViewPage.vue`
- [ ] 4.2 Add test: "Editar" button visible for draft report + permission.
  Depends on: 4.1
  Files: `tests/ReportViewPage.spec.ts`
- [ ] 4.3 Add test: "Editar" button hidden for signed report.
  Depends on: 4.1
  Files: `tests/ReportViewPage.spec.ts`

## Phase 5: PatientReportsTab Edit Button

- [x] 5.1 Add computed `canEdit` using `authStore.hasPermission('report.edit')`. Add "Editar" button per row, `v-if="canEdit && report.status === 'draft'"`, `@click.stop` + `router.push({ name: 'ReportEdit', params: { id } })`. The `@click.stop` prevents the row's `@click` (navigate to view) from firing.
  Depends on: nothing (independent UI addition).
  Files: `src/modules/patients/presentation/components/PatientReportsTab.vue`
- [x] 5.2 Add test: "Editar" button visible, navigates to ReportEdit route.
  Depends on: 5.1
  Files: `src/modules/patients/presentation/components/__tests__/PatientReportsTab.test.ts`
- [x] 5.3 Add test: `@click.stop` on Edit button prevents row view navigation.
  Depends on: 5.1
  Files: `src/modules/patients/presentation/components/__tests__/PatientReportsTab.test.ts`

## Verification

- [x] Run `cd frontend && npx vitest run --run` — all 27+ suites pass, no regressions
- [x] Run `cd frontend && npm run build` — no TS/Vite errors
- [ ] Manual: draft report shows "Editar" button in all 3 surfaces, navigates to `/informes/:id/editar`
- [ ] Manual: signed/closed reports do NOT show "Editar" button
- [ ] Manual: `ReportViewPage` readonly view shows clean `<span>` text, no greyed-out inputs
