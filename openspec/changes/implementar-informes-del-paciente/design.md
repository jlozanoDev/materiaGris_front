# Design: Implementar Informes del Paciente

## Technical Approach

Fix 3 bugs in `PatientReportsTab` (items not clickable, no permission guard, `goToNewReport` skips template selection) and add a `TemplatePickerModal` with 4 states. Total ~160 lines. Follows hexagonal architecture — new component + composable in `reports/`, stub in `ApiReportRepository` until backend delivers `GET /templates/active`.

## Architecture Decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | Modal location | `src/modules/reports/presentation/components/TemplatePickerModal.vue` | Template selection belongs to reports flow, not patients module |
| 2 | Template fetching | New composable `useTemplateList.ts` in reports — does NOT reuse `useReportTemplate` (admin) | Admin endpoint is admin-only; different auth context and consumer |
| 3 | Permission check | `authStore.hasPermission('report.create')` inline in `PatientReportsTab` | Same pattern used in `ReportFillPage.vue` for `canEdit`/`canSign` |
| 4 | Route params vs query | `ReportCreate` route stays `/pacientes/:id/informe/nuevo` (patientId in path). `templateId` via `?templateId=X` query param | PatientId is structural (route param), templateId is transient selection (query param). Fix `onMounted()` by checking `route.name === 'ReportCreate'` |
| 5 | Tab preservation | Query param `?tab=1` on back-navigation. `PatientDetailPage` reads `route.query.tab` on mount | Lightweight, bookmarkable, no Pinia needed |
| 6 | API stub | New method `getActiveTemplates()` on `ReportRepository` interface + `ApiReportRepository` implementation | Stays within reports bounded context. Returns mock `ReportTemplate[]` until backend endpoint exists |

## Component Tree

```
PatientDetailPage (reads ?tab= query to restore activeTab)
 └─ PatientReportsTab (imports useAuthStore, controls modal visibility)
      ├─ [List items] @click → router.push ReportView(:id)
      ├─ [+ Nuevo informe] v-if="canCreate", opens modal
      └─ TemplatePickerModal (receives show, emits select/close)
           └─ useTemplateList (fetchActive → GetActiveTemplatesUseCase → ApiReportRepository stub)
```

## Data Flow

```
PatientReportsTab: click "+ Nuevo" → showModal = true
  TemplatePickerModal.onMounted → useTemplateList.fetchActive()
    → GetActiveTemplatesUseCase → ApiReportRepository.getActiveTemplates()
    → fetchClient('/templates/active')   [STUB: returns mock ReportTemplate[]]
  Loading → Error → Empty → List (4 states)
  User clicks template → emit('select', template)
PatientReportsTab: router.push({
  name: 'ReportCreate',
  params: { id: patientId },
  query: { templateId: template.id }
})
ReportFillPage.onMounted():
  if (route.name === 'ReportCreate')
    → init(route.params.id, route.query.templateId)
    → InitReportUseCase → POST /reports { patient_id, template_id }
  else → loadReport(route.params.id)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/reports/presentation/components/TemplatePickerModal.vue` | **Create** | Modal wrapping shared `Modal.vue`. Props: `show`, `patientId`. Emits: `select(template)`, `close`. 4 states: loading skeleton, error+retry, empty message, template list with click-to-select. |
| `src/modules/reports/presentation/composables/useTemplateList.ts` | **Create** | Wraps `GetActiveTemplatesUseCase`. Exposes `templates`, `loading`, `error`, `fetchActive()`. |
| `src/modules/reports/domain/use-cases/GetActiveTemplatesUseCase.ts` | **Create** | Receives `ReportRepository`, calls `getActiveTemplates()`. |
| `src/modules/reports/domain/repositories/ReportRepository.ts` | Modify | Add `getActiveTemplates(): Promise<ReportTemplate[]>` to interface |
| `src/modules/reports/infrastructure/ApiReportRepository.ts` | Modify | Add `getActiveTemplates()` method — stub returning mock `ReportTemplate[]` (3 templates). Replace with `fetchClient('/templates/active')` when backend ready |
| `src/modules/reports/application/containers/reportsContainer.ts` | Modify | Add `provideGetActiveTemplatesUseCase()` |
| `src/modules/patients/presentation/components/PatientReportsTab.vue` | Modify | Add `@click` to report items → `router.push({ name: 'ReportView', params: { id: report.id } })`. Add `canCreate` computed from `authStore.hasPermission('report.create')`. Wire modal: `showModal` ref, open on button click, handle `select` to navigate. Disable button when `canCreate` but 0 templates. |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Modify | Fix `onMounted()`: check `route.name === 'ReportCreate'` → use `route.params.id` as patientId, `route.query.templateId` as templateId. Add back button in create flow → `router.push(/patients/${patientId}?tab=1)`. |
| `src/modules/patients/presentation/pages/PatientDetailPage.vue` | Modify | Read `route.query.tab` on mount to restore `activeTab`. `onMounted`: `const tab = Number(route.query.tab); if (!isNaN(tab)) activeTab.value = tab`. |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `useTemplateList` | Mock `GetActiveTemplatesUseCase` — test loading→data, loading→error, empty array |
| Unit | `ReportFillPage.onMounted()` routing | Test `route.name === 'ReportCreate'` branch calls `init`, not `loadReport` |
| Component | `TemplatePickerModal` | Test 4 states render correctly; `emit('select')` fires with template on click; `emit('close')` on backdrop |
| Component | `PatientReportsTab` | Test `@click` navigates; `canCreate` hides/shows button; modal opens on click |
| E2E | Full flow | Patient detail → tab "Informes" → "+ Nuevo" → modal → select template → fill → back to patient tab |

## Rollout

No migration required. Backend dependency flagged: `GET /templates/active` endpoint must be implemented separately. Frontend stub allows independent deployment.

## Open Questions

- [ ] Backend endpoint `GET /templates/active` — timeline? Until ready, stub returns mock data
- [ ] `ReportViewPage.goBack()` currently goes to `ReportList`, not patient detail — deferred (ReportViewPage out of scope)
- [ ] What fields does the `GET /templates/active` response include? Assume `id`, `name`, `description`, `isActive` for now
