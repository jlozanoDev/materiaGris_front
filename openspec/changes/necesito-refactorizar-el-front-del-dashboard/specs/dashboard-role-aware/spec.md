# Dashboard Role-Aware

Comportamiento distinto del dashboard según permisos del usuario. Un doctor ve KPIs de pacientes y Informes pendientes. Un admin ve métricas de sistema (usuarios totales, actividad). El sistema determina el rol por permisos: `admin.user.view` identifica admin; `patient.view` identifica doctor.

## Requirements

### Requirement: Doctor Dashboard

When the authenticated user has `patient.view` permission but NOT `admin.user.view`, the dashboard SHALL display patient KPIs (visits, new/recurring split), today's patient list, and pending reports widget.

#### Scenario: Doctor logs in

- GIVEN `useAuthStore().user` has `patient.view` but lacks `admin.user.view`
- WHEN the dashboard loads
- THEN it MUST call `GET /patients/find` for stats + list and `GET /reports?status=draft` for pending reports

#### Scenario: Doctor sees no admin widgets

- GIVEN the user is a doctor
- WHEN the dashboard renders
- THEN it MUST NOT display user count, admin activity, or any admin-only widget

### Requirement: Admin Dashboard

When the authenticated user has `admin.user.view` permission, the dashboard SHALL display system metrics: total registered users from `GET /admin/users`, recent activity summary. Admin MUST NOT see patient KPIs or pending reports.

#### Scenario: Admin logs in

- GIVEN `useAuthStore().user` has `admin.user.view`
- WHEN the dashboard loads
- THEN it MUST call `GET /admin/users` and display total user count as the primary metric

#### Scenario: Admin sees no clinical data

- GIVEN the user is an admin
- WHEN the dashboard renders
- THEN it MUST NOT call `GET /patients/find` or `GET /reports`

### Requirement: Role Detection

The dashboard SHALL determine the active role by checking permissions from `useAuthStore().hasPermission()`. Role check MUST happen once on mount and drive which use cases execute.

#### Scenario: User has both admin and doctor permissions

- GIVEN `useAuthStore().user` has both `admin.user.view` and `patient.view`
- WHEN the dashboard loads
- THEN it SHALL prefer the admin layout (admin supersedes doctor)

#### Scenario: User permissions change mid-session

- GIVEN the dashboard is already rendered for a doctor
- WHEN `fetchUser()` refreshes and permissions now include `admin.user.view`
- THEN the dashboard SHALL recompute and switch to admin layout on the next data refresh

#### Scenario: User has no recognized permissions

- GIVEN `useAuthStore().user` lacks both `patient.view` and `admin.user.view`
- WHEN the dashboard loads
- THEN it SHALL display "Panel no disponible" message and MUST NOT call any data endpoint
