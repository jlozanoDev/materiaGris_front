# Dashboard Patient List

Lista de pacientes recientes con datos reales desde `GET /patients/find`, reemplazando el array estático hardcodeado en `PatientList.vue`.

## Requirements

### Requirement: Real Patient Data

The dashboard SHALL display today's patients fetched from `GET /patients/find?last_visit_from={today_start}&last_visit_to={today_end}`. Each row MUST show: patient full name (computed from `first_name` + `last_name`), visit time (from `last_visit_at`), and patient initials (extracted from `first_name` + `last_name`).

#### Scenario: Doctor views today's patient list

- GIVEN 5 patients visited today
- WHEN the dashboard loads
- THEN PatientList MUST render 5 rows with real names, times, and initials

#### Scenario: Patient list is empty

- GIVEN no patients visited today
- WHEN the dashboard loads
- THEN PatientList MUST show an empty state message ("No hay pacientes hoy") without hardcoded rows

#### Scenario: Patient name is incomplete

- GIVEN a patient has `first_name: "María"` but `last_name` is `null` or empty
- WHEN the patient row renders
- THEN the row MUST display "María" as name and "M" as initials without crashing

### Requirement: Patient Selection

The dashboard SHALL emit the selected patient object when a user clicks a row, preserving the existing `select` event contract.

#### Scenario: Doctor clicks a patient row

- GIVEN the patient list has 5 rows
- WHEN the doctor clicks row index 2
- THEN PatientList MUST emit `select` event with the full patient object and highlight the selected row

#### Scenario: Doctor clicks the same row twice

- GIVEN row 2 is already selected
- WHEN the doctor clicks row 2 again
- THEN PatientList MUST keep row 2 selected and MUST NOT emit duplicate event

### Requirement: Loading and Error States

The dashboard MUST indicate loading state and handle API errors for the patient list independently from the stats section.

#### Scenario: Patient list is loading

- GIVEN the API call for patients is in flight
- WHEN PatientList renders
- THEN PatientList SHALL show 3 skeleton placeholder rows

#### Scenario: Patient API returns 403

- GIVEN the current user lacks permission to list patients
- WHEN the dashboard loads
- THEN PatientList SHALL hide its section or show "Sin acceso" message
