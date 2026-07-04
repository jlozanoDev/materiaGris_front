# Dashboard Pending Reports

Widget visible para doctores que muestra un preview de los primeros N reportes pendientes de firma. Consume `GET /reports?status=draft`. Muestra información resumida: nombre del paciente, nombre del template, fecha de creación.

## Requirements

### Requirement: Pending Reports Widget

The dashboard SHALL display a widget listing up to N (default 5) pending reports when the user has `patient.view` permission. Each preview row MUST show: patient name, template name, and creation date. The widget MUST consume `GET /reports?status=draft`.

#### Scenario: Doctor has 3 pending reports

- GIVEN `GET /reports?status=draft` returns 3 reports
- WHEN the dashboard loads
- THEN the pending reports widget MUST show 3 rows with patient_name, template_name, and created_at

#### Scenario: Doctor has more than 5 pending reports

- GIVEN `GET /reports?status=draft` returns 12 reports
- WHEN the dashboard loads
- THEN the widget MUST show the first 5 rows and a "Ver todos (12)" link/button

#### Scenario: Doctor has zero pending reports

- GIVEN `GET /reports?status=draft` returns empty array
- WHEN the dashboard loads
- THEN the widget MUST show "Sin reportes pendientes" message

#### Scenario: Pending reports widget loading

- GIVEN the reports API call is in flight
- WHEN the widget renders
- THEN it SHALL show skeleton placeholders for N rows

### Requirement: Pending Reports Count Badge

The dashboard SHALL display a total count of pending reports as a badge, visible even when the preview is collapsed or scrolled away.

#### Scenario: Count badge with 8 pending reports

- GIVEN `GET /reports?status=draft` returns 8 reports
- WHEN the dashboard renders
- THEN a badge SHALL show "8" next to the "Reportes pendientes" label

#### Scenario: Count badge at zero

- GIVEN no pending reports exist
- WHEN the dashboard renders
- THEN the badge SHALL show "0" or be hidden

### Requirement: Report Click Navigation

The widget SHALL allow navigation to the full report detail when a preview row is clicked. The navigation target MUST be the existing reports module route.

#### Scenario: Doctor clicks a pending report row

- GIVEN the widget shows 3 report previews
- WHEN the doctor clicks the second row
- THEN the app MUST navigate to `/reports/{report.id}` or equivalent detail route
