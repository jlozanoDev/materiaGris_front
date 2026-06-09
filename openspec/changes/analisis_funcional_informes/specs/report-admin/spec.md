# Delta for report-admin

## Purpose

Interface for listing, filtering, and read-only viewing of patient reports. Displays report status, patient information, author, dates, and provides PDF download for finalized reports. All access gated by granular permission slugs — no role check is sufficient.

## MODIFIED Requirements

### Requirement: Report Listing with Filters

The system MUST display a paginated, filterable table of patient reports for users with `reports.view`.

(Previously: described as "admin users" without specifying the permission slug.)

#### Scenario: User with `reports.view` accesses report listing

- GIVEN a user with permission `reports.view`
- WHEN navigating to the reports listing section
- THEN a table displays all patient reports with columns: Patient Name, Author, Template Name, Status, Created Date, Last Modified
- AND each row includes a "Ver" action button
- AND the table is paginated (20 per page)

#### Scenario: Route guard denies user WITHOUT `reports.view`

- GIVEN a user WITHOUT permission `reports.view`
- WHEN navigating to the reports listing URL
- THEN the route guard checks `meta.permissions: 'reports.view'`
- AND `authStore.hasPermission('reports.view')` returns false
- AND redirects to Dashboard

#### Scenario: User with `reports.view` filters by status

- GIVEN the report listing with mixed statuses
- WHEN user selects filter "Firmado" from status dropdown
- THEN only reports with status `firmado` are displayed
- AND available filter options are: Todos, Borrador, Firmado, Cerrado

#### Scenario: User with `reports.view` filters by patient

- GIVEN a search input for patient name
- WHEN user types "García"
- THEN the table filters to reports where patient name contains "García"
- AND filtering is debounced (300ms after last keystroke)

#### Scenario: User with `reports.view` filters by date range

- GIVEN date range inputs for "Desde" and "Hasta"
- WHEN user selects a date range
- THEN only reports created within that range are displayed
- AND empty state shows "No se encontraron informes en este rango de fechas"

#### Scenario: User with `reports.view` filters by template

- GIVEN a template dropdown populated with active templates
- WHEN user selects "Informe de Cardiología"
- THEN only reports created from that template are displayed
- AND reports from deactivated templates still appear if they have existing reports

### Requirement: Read-Only Report Viewer

The system MUST render a read-only view of any report for users with `reports.view`, regardless of report status.

#### Scenario: User with `reports.view` views a draft report

- GIVEN a user with `reports.view` clicks "Ver" on a draft report
- WHEN the report viewer opens
- THEN the form renders as read-only (all inputs disabled)
- AND no save, sign, or close buttons are visible
- AND a "Volver al listado" button is available
- AND a PDF download button is disabled or hidden (report not finalized)

#### Scenario: User with `reports.view` views a signed or closed report

- GIVEN a user with `reports.view` clicks "Ver" on a signed or closed report
- WHEN the report viewer opens
- THEN the form renders as read-only
- AND the PDF download button is visible ONLY if user also has `reports.download-pdf`
- AND the signature canvas displays the stored signature image

#### Scenario: User WITHOUT `reports.view` cannot access report viewer

- GIVEN a user WITHOUT `reports.view`
- WHEN navigating to a report viewer URL directly (bypassing UI)
- THEN the route guard checks `meta.permissions: 'reports.view'`
- AND redirects to Dashboard
- AND the report data is never fetched

#### Scenario: User with `reports.view` cannot access edit URL

- GIVEN a user with `reports.view` but WITHOUT `reports.edit`
- WHEN navigating directly to a report edit URL
- THEN the route guard checks `meta.permissions` (which requires `reports.edit`)
- AND redirects to Dashboard or renders read-only

### Requirement: PDF Download

The system MUST provide PDF download for signed and closed reports, gated by `reports.download-pdf`.

#### Scenario: User with `reports.download-pdf` downloads PDF

- GIVEN a user with `reports.view` AND `reports.download-pdf`
- AND a signed or closed report in viewer mode
- WHEN clicking "Descargar PDF"
- THEN the frontend calls `GET /api/reports/{id}/pdf`
- AND the backend returns a PDF blob
- AND the browser triggers a file download with filename: `informe-{patient_name}-{date}.pdf`

#### Scenario: User WITHOUT `reports.download-pdf` sees no download action

- GIVEN a user with `reports.view` but WITHOUT `reports.download-pdf`
- AND a signed or closed report in viewer mode
- WHEN viewing the report
- THEN the "Descargar PDF" button is hidden or disabled with tooltip: "No tiene permiso para descargar PDF"

#### Scenario: PDF not available for draft reports

- GIVEN a draft report
- WHEN a user with `reports.download-pdf` views it
- THEN the "Descargar PDF" button is disabled with tooltip: "Disponible al firmar el informe"
- AND no PDF endpoint call is made

#### Scenario: PDF download error

- GIVEN a user with `reports.download-pdf` and a signed report
- WHEN clicking "Descargar PDF" and PDF generation fails on backend
- THEN the UI displays "Error al generar el PDF. Intente nuevamente."
- AND a retry mechanism is available

## ADDED Requirements

### Requirement: Permission Enforcement

The report admin listing and viewer MUST check the relevant permission slugs before rendering. The sidebar link, route guard, and all action buttons use `authStore.hasPermission()`.

#### Scenario: Route guard for report listing

- GIVEN the reports listing route with `meta: { requiresAuth: true, permissions: 'reports.view' }`
- WHEN a user WITHOUT `reports.view` navigates to the route
- THEN the `beforeEach` guard evaluates `authStore.hasPermission('reports.view')`
- AND redirects to Dashboard

#### Scenario: Route guard for report viewer

- GIVEN the report viewer route with `meta: { requiresAuth: true, permissions: 'reports.view' }`
- WHEN a user WITHOUT `reports.view` navigates to the route
- THEN redirects to Dashboard

#### Scenario: Sidebar link visibility

- GIVEN the AppSidebar renders the reports listing link
- WHEN the current user lacks `reports.view`
- THEN the link is not rendered (via `v-has-permission` or `authStore.hasPermission`)

#### Scenario: PDF download button visibility

- GIVEN the report viewer page
- WHEN the report is signed or closed
- THEN the "Descargar PDF" button renders only if `authStore.hasPermission('reports.download-pdf')`
- AND is hidden/disabled otherwise

#### Scenario: Report viewer checks permission on mount

- GIVEN the report viewer page is loaded
- WHEN the page component mounts
- THEN it verifies `authStore.hasPermission('reports.view')` as a defense-in-depth check
- AND if the check fails (unlikely due to route guard), it renders an error state

### Requirement: Empty and Edge States

#### Scenario: No reports exist

- GIVEN the system has zero patient reports
- WHEN a user with `reports.view` loads the report listing
- THEN an empty state displays: "No hay informes registrados"
- AND a call-to-action suggests: "Los médicos pueden iniciar informes desde la ficha del paciente"

#### Scenario: Network error on listing

- GIVEN the API returns a network error
- WHEN a user with `reports.view` loads the report listing
- THEN the UI displays "Error al cargar los informes"
- AND a "Reintentar" button is available

## Acceptance Criteria

- Route and sidebar gated by `reports.view` permission slug
- Table displays: patient, author, template, status, dates
- Filters work correctly: status, patient search, date range, template
- Pagination at 20 items per page
- All reports render read-only for users with `reports.view` (no edit controls)
- PDF download button visible only when `reports.download-pdf` is held AND report is signed/closed
- Empty state renders meaningful message
- Loading and error states are handled explicitly
- No role-based checks ("admin user" / "admin role") remain — all gated by permission slugs
