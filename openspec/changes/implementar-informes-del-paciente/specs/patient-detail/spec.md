# Delta for patient-detail

## ADDED Requirements

### Requirement: Report items MUST be clickable (→ ReportView)

Each report in `PatientReportsTab` SHALL navigate to `/informes/:reportId` on click with `cursor-pointer` hover.

#### Scenario: Click navigates

- GIVEN patient 42 has report 101
- WHEN user clicks report 101
- THEN navigation to `/informes/101` occurs

### Requirement: "+ Nuevo informe" MUST check permission + template availability

Button SHALL hide when `!hasPermission('report.create')`. With permission but zero templates, button SHALL be visible but disabled (no tooltip).

#### Scenario: Permission + templates

- GIVEN `report.create` granted, templates available
- THEN button is visible and enabled

#### Scenario: No permission

- GIVEN no `report.create`
- THEN button is hidden

#### Scenario: Permission but no templates

- GIVEN `report.create` granted, templates empty
- THEN button is visible, disabled, no tooltip

### Requirement: PatientDetailPage MUST restore active tab from query

`activeTab` SHALL be set from `route.query.tab`: `tab=reports` → 1, else → 0.

#### Scenario: Back from create flow

- GIVEN URL `/patients/42?tab=reports`
- WHEN page mounts
- THEN "Informes clínicos" tab is active

#### Scenario: Direct navigation

- GIVEN URL `/patients/42` (no query)
- WHEN page mounts
- THEN "Datos generales" tab is active

## MODIFIED Requirements

### Requirement: Reports tab MUST list patient-scoped reports

`PatientReportsTab` SHALL list reports with click navigation to ReportView. "+ Nuevo informe" SHALL be permission-guarded and open `TemplatePickerModal`.

(Previously: static divs; button navigated directly without permission or template selection.)

#### Scenario: Reports displayed (clickable)

- GIVEN patient has 3 reports
- WHEN tab activates
- THEN 3 clickable items with cursor-pointer render

#### Scenario: Empty state

- GIVEN 0 reports, user has permission
- WHEN tab activates
- THEN "No hay informes clínicos para este paciente" + enabled button

#### Scenario: New report opens picker

- GIVEN `report.create` permission
- WHEN user clicks "+ Nuevo informe"
- THEN `TemplatePickerModal` opens

### Requirement: Two tabs with Vuetify

Page SHALL render tabs "Datos generales" (0) and "Informes clínicos" (1), with `activeTab` from `route.query.tab`.

(Previously: activeTab always 0.)

#### Scenario: Tab restored from query

- GIVEN URL `/patients/42?tab=reports`
- WHEN page mounts
- THEN "Informes clínicos" tab is active

#### Scenario: Default tab

- GIVEN no query
- THEN "Datos generales" is active
