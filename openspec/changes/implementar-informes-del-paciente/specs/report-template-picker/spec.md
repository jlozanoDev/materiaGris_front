# report-template-picker Specification

## Purpose

Modal + composable for selecting an active report template before creating a new patient report.

## Requirements

### Requirement: TemplatePickerModal MUST display available templates

Modal SHALL fetch active templates via `useTemplateList` and render them selectable.

#### Scenario: Templates loaded

- GIVEN `GET /templates/active` returns 2 templates
- WHEN modal opens
- THEN template names display as clickable list items with cursor-pointer

#### Scenario: Loading state

- GIVEN fetch in progress
- WHEN modal opens
- THEN 3 skeleton rows with pulse animation display

#### Scenario: Error state

- GIVEN `GET /templates/active` fails
- WHEN modal opens
- THEN "Error al cargar las plantillas" + "Reintentar" button display

#### Scenario: Empty state

- GIVEN zero active templates
- WHEN modal opens
- THEN "No hay plantillas disponibles" message displays

### Requirement: Selecting a template MUST navigate to ReportCreate

Clicking a template SHALL navigate to `ReportCreate` with `patientId` as param and `templateId` as query param.

#### Scenario: Template selected

- GIVEN modal open for patient 42, template "Informe Radiológico" (id=7)
- WHEN user clicks it
- THEN navigation to `/pacientes/42/informe/nuevo?templateId=7`
- AND modal closes

### Requirement: useTemplateList MUST abstract template fetching

Composable SHALL expose reactive `templates`, `loading`, `error`, and `fetchTemplates()`.

#### Scenario: Fetch success

- GIVEN backend returns `[{ id, name, isActive }]`
- WHEN `fetchTemplates()` resolves
- THEN `templates.value` has entries and `loading` is false

**Dependency**: `GET /templates/active` does not exist yet. Frontend SHALL stub with mock data matching `{ id, name, isActive }`. Migration to real endpoint is a one-line URL change.

### Requirement: ReportFillPage MUST disambiguate create vs edit

`onMounted()` SHALL check `route.name`: `'ReportCreate'` → `init(query.patientId, query.templateId)`, all other routes → `loadReport(params.id)`.

#### Scenario: Create flow

- GIVEN route `/pacientes/42/informe/nuevo?templateId=7`, `route.name === 'ReportCreate'`
- WHEN page mounts
- THEN `init("42", "7")` is called, form renders empty

#### Scenario: Edit flow unchanged

- GIVEN route `/informes/15/editar`, `route.name !== 'ReportCreate'`
- WHEN page mounts
- THEN `loadReport("15")` is called, values pre-populated

### Requirement: Back navigation MUST return to patient reports tab

"Volver" button in create flow SHALL navigate to `/patients/:patientId?tab=reports`.

#### Scenario: Back from ReportCreate

- GIVEN user on ReportCreate for patient 42
- WHEN user clicks "Volver"
- THEN navigation to `/patients/42?tab=reports` with reports tab active

## External Dependencies

| Endpoint | Status | Fallback |
|----------|--------|----------|
| `GET /templates/active` | ❌ Backend pending | Stub returning `[{ id, name, isActive }]` |
