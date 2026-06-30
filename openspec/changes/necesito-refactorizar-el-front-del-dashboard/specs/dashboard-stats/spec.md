# Dashboard Stats

KPIs clínicos reales reemplazando los números mock de HeroCard. Consume `GET /patients/find` con filtro `last_visit_from/to` para el rango de hoy. Distingue pacientes nuevos (creados hoy, `created_at` dentro del rango) de recurrentes (creados antes de hoy).

## Requirements

### Requirement: Visit Count KPI

The dashboard SHALL display total patient visits for the current day. The system MUST query `GET /patients/find?last_visit_from={today_start}&last_visit_to={today_end}` and count results.

#### Scenario: Doctor views today's visit count

- GIVEN today is 2026-06-30 and 15 patients had `last_visit_at` within [2026-06-30T00:00:00, 2026-06-30T23:59:59]
- WHEN the dashboard loads
- THEN HeroCard MUST show "15" as today's visits

#### Scenario: No visits recorded today

- GIVEN no patients have `last_visit_at` within today's range
- WHEN the dashboard loads
- THEN HeroCard MUST show "0" for visits

### Requirement: New vs Recurring Patient Split

The dashboard SHALL categorize today's patients as new (created today) or recurring (created before today). The system MUST compare each patient's `created_at` against today's date range.

#### Scenario: Mixed new and recurring patients

- GIVEN 10 patients visited today (4 with `created_at` within today, 6 with `created_at` before today)
- WHEN the dashboard loads
- THEN HeroCard MUST show "4" for new patients and "6" for recurring patients

#### Scenario: All patients are new

- GIVEN all patients who visited today were created today
- WHEN the dashboard loads
- THEN HeroCard MUST show all visits as new and "0" for recurring

#### Scenario: API returns partial data (no created_at)

- GIVEN `GET /patients/find` response omits `created_at` for some patients
- WHEN computing new vs recurring
- THEN patients without `created_at` MUST be counted as recurring and MUST NOT crash the dashboard

### Requirement: Loading and Error States

The dashboard MUST indicate loading state while fetching and display an error message on failure without breaking the page layout.

#### Scenario: Data is loading

- GIVEN the API call is in flight
- WHEN the stats section renders
- THEN HeroCard stats SHALL show skeleton placeholders instead of numbers

#### Scenario: API call fails

- GIVEN `GET /patients/find` returns 500 or network error
- WHEN the dashboard finishes loading
- THEN HeroCard SHALL display an error badge and the previous mock MUST NOT be shown
