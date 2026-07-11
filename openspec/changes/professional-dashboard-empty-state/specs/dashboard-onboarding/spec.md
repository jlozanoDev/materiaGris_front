# Dashboard Onboarding Specification

## Purpose

Empty-state guidance rendered inside HeroCard when today's stats are all zero. Two variants: new professional (`totalPatients === 0`) and slow day (`totalPatients > 0`). Warmer tone than rest of app.

## Requirements

### Requirement: Empty-State Detection

| # | Requirement | Strength |
|---|-------------|----------|
| ONB-01 | `useDashboard` MUST expose `isEmptyState` and `isNewProfessional` computed refs | MUST |
| ONB-02 | `isEmptyState` is `true` when `stats` is non-null and `visits === 0 && newPatients === 0 && returningPatients === 0` | MUST |
| ONB-03 | `isEmptyState` is `false` when `stats` is `null` (loading) | MUST |
| ONB-04 | `isNewProfessional` is `true` when `isEmptyState && totalPatients === 0` | MUST |
| ONB-05 | `isNewProfessional` is `false` when `isEmptyState && totalPatients > 0` | MUST |

#### Scenario: All-zero stats, no patients

- GIVEN `stats = { visits: 0, newPatients: 0, returningPatients: 0 }` and `totalPatients = 0`
- WHEN computed refs evaluate
- THEN `isEmptyState` is `true` and `isNewProfessional` is `true`

#### Scenario: All-zero stats, has patients

- GIVEN `stats = { visits: 0, newPatients: 0, returningPatients: 0 }` and `totalPatients = 5`
- THEN `isEmptyState` is `true` and `isNewProfessional` is `false`

#### Scenario: Stats null (loading)

- GIVEN `stats = null`
- THEN `isEmptyState` is `false` — empty-state branch never activates before data arrives

### Requirement: New Professional Empty-State Variant

| # | Requirement | Strength |
|---|-------------|----------|
| ONB-10 | When `isEmptyState && isNewProfessional`, HeroCard SHALL render onboarding guidance instead of zero-valued stats | MUST |
| ONB-11 | Variant MUST include a welcome heading, ≥2 actionable tips (patient registration, report creation), and context about what the stats area shows once active | MUST |
| ONB-12 | Zero-valued stat cards ("Visitas hoy: 0", "Nuevos pacientes: 0") MUST NOT render | MUST |
| ONB-13 | Tone SHALL be warm and encouraging, warmer than standard dashboard messages | MUST |

#### Scenario: New professional sees onboarding tips

- GIVEN dashboard loads for a professional with `totalPatients = 0` and all-zero stats
- WHEN HeroCard renders
- THEN a welcome heading is displayed, ≥2 tips are shown, and zero-value stat cards are absent

#### Scenario: Onboarding content is actionable

- GIVEN the new-professional empty state is rendered
- THEN at least one tip links or guides to patient registration
- AND at least one tip links or guides to report creation

### Requirement: Slow Day Empty-State Variant

| # | Requirement | Strength |
|---|-------------|----------|
| ONB-20 | When `isEmptyState && !isNewProfessional`, HeroCard SHALL render contextual reassurance instead of zero-valued stats | MUST |
| ONB-21 | Variant MUST include: "no activity today" message (factual, not alarming), current patient count, prompt for next action | MUST |
| ONB-22 | Zero-valued stat cards MUST NOT render | MUST |
| ONB-23 | Tone SHALL be neutral and reassuring — not error-red, not warning-yellow | MUST |

#### Scenario: Existing professional on slow day

- GIVEN `totalPatients = 12` and all today's stats are zero
- WHEN HeroCard renders
- THEN "no activity today" message is shown, patient count displayed, and zero stat cards are absent

#### Scenario: Slow day edge — conservative heuristic holds

- GIVEN a patient was deleted after registration but `totalPatients` still reads > 0 from backend
- WHEN HeroCard renders
- THEN the slow-day variant appears (not new-professional)
- AND the worst case is an incorrect "slow day" instead of a misleading "new professional"

### Requirement: QuickActions Proximity in Empty State

| # | Requirement | Strength |
|---|-------------|----------|
| ONB-30 | When `isEmptyState`, QuickActions SHALL render inside or immediately adjacent to HeroCard empty-state area with clear visual connection | MUST |
| ONB-31 | When `!isEmptyState`, QuickActions SHALL render in its default original position | MUST |

#### Scenario: QuickActions adjacent to empty state

- GIVEN HeroCard renders the empty-state variant
- THEN QuickActions is visually connected to the empty-state area (not in a detached separate row)

#### Scenario: QuickActions returns to original position

- GIVEN HeroCard renders normal stats (no empty state)
- THEN QuickActions appears in its original row below HeroCard + PendingReportsWidget

### Requirement: totalPatients Fetching

| # | Requirement | Strength |
|---|-------------|----------|
| ONB-40 | `fetchDashboard()` MUST call `DashboardRepository.getPatientsCount()` in the same `Promise.all` as `getStats()` | MUST |
| ONB-41 | `DashboardStats` entity SHALL include `totalPatients: number` | MUST |
| ONB-42 | If `getPatientsCount()` fails, the error SHALL surface through the existing `error` ref (no separate error path) | MUST |

#### Scenario: totalPatients fetched in parallel

- GIVEN the doctor dashboard mounts
- WHEN `fetchDashboard()` executes
- THEN `getPatientsCount()` runs in `Promise.all` with `getStats()`, `getRecentPatients()`, and `getPendingReports()`

#### Scenario: totalPatients count failure handled

- GIVEN `getPatientsCount()` rejects with a network error
- WHEN `fetchDashboard()` catches the error
- THEN `dashboard.error.value` is set (same as any other fetch failure)
- AND HeroCard renders the error badge, not the empty state
