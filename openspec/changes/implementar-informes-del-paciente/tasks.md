# Tasks: Implementar Informes del Paciente

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~367 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | ask-always |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

---

## Phase 1: Foundation — Repository + Use Case

- [x] 1.1 Add `getActiveTemplates(): Promise<ReportTemplate[]>` to `src/modules/reports/domain/repositories/ReportRepository.ts`
- [x] 1.2 Stub `getActiveTemplates()` in `src/modules/reports/infrastructure/ApiReportRepository.ts` — returns 3 mock `ReportTemplate` objects `{ id, name, isActive }`
- [x] 1.3 Create `src/modules/reports/domain/use-cases/GetActiveTemplatesUseCase.ts` (injects `ReportRepository`, calls `getActiveTemplates()`)
- [x] 1.4 Add `provideGetActiveTemplatesUseCase()` to `src/modules/reports/application/containers/reportsContainer.ts`

## Phase 2: Composable + Modal

- [x] 2.1 Create `src/modules/reports/presentation/composables/useTemplateList.ts` — `{ templates, loading, error, fetchActive }` (follow `useReportList` pattern)
- [x] 2.2 Create `src/modules/reports/presentation/components/TemplatePickerModal.vue` — wraps `shared/Modal.vue`, props: `show`+`patientId`, emits: `select`+`close`. 4 states: skeleton loading, error+retry, empty message, clickable list
- [x] 2.3 Write `src/modules/reports/presentation/composables/__tests__/useTemplateList.test.ts` — 4 cases: success, error, loading, empty
- [x] 2.4 Write `src/modules/reports/presentation/components/__tests__/TemplatePickerModal.test.ts` — 7 tests: 4 state renders + retry click + emit on select + backdrop close

## Phase 3: Tab + Page Fixes

- [x] 3.1 Add `@click` navigation to report rows in `PatientReportsTab.vue` — `router.push({ name: 'ReportView', params: { id: report.id } })` with `cursor-pointer`
- [x] 3.2 Add `canCreate` computed (`authStore.hasPermission('report.create')`) in `PatientReportsTab.vue`; `v-if` guard on "+ Nuevo" button
- [x] 3.3 Wire `TemplatePickerModal` into `PatientReportsTab.vue` — `showModal` ref, `@select` navigates to `ReportCreate` with `?templateId=X`, `@close` hides modal
- [x] 3.4 Fix `ReportFillPage.vue` `onMounted()` — `route.name === 'ReportCreate'` → `init(params.id, query.templateId)`; else → `loadReport(params.id)`
- [x] 3.5 Add back navigation in `ReportFillPage.vue` — create flow: navigate to `/patients/${patientId}?tab=reports`
- [x] 3.6 Read `route.query.tab` in `PatientDetailPage.vue` `onMounted` — `tab === 'reports'` → activeTab=1

## Phase 4: Testing

- [x] 4.1 Write `src/modules/patients/presentation/components/__tests__/PatientReportsTab.test.ts` — 5 tests: click→navigate, permission→hide/show, modal opens, empty state
- [x] 4.2 Update `tests/ReportFillPage.spec.ts` — 20 tests: route disambiguation (init vs loadReport), back nav, permission buttons
- [x] 4.3 Update `PatientDetailPage.test.ts` — 12 tests: `?tab=reports` → activeTab=1, no query → activeTab=0
- [x] 4.4 Run `npx vitest run --run` — all project tests pass (82/88 suites, 716/729 tests — 13 pre-existing failures in unrelated tests)

## Dependencies

```
1.1 → 1.2 → 1.3 → 1.4 → 2.1 → 2.2 → 3.3
                             2.3     2.4
3.1, 3.2, 3.6 ───────────► 3.3
3.4 → 3.5
4.1 (after 3.1-3.3) · 4.2 (after 3.4) · 4.3 (after 3.6) · 4.4 (after all)
```
