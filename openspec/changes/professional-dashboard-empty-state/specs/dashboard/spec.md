# Delta for Dashboard

## ADDED Requirements

### Requirement: HeroCard Empty-State Template Branch

HeroCard MUST render a dedicated empty-state template branch when stats are loaded but all today's values are zero.

Template branch order (no existing branches are removed or reordered):
1. Error: `v-if="error"`
2. Loading skeleton: `v-else-if="loading"`
3. **Empty state** (NEW): `v-else-if="stats && isEmptyState"`
4. Stats data: `v-else-if="stats"` (unchanged)

| # | Requirement | Strength |
|---|-------------|----------|
| DASH-ES-01 | Render empty-state variant when stats loaded and all values are zero | MUST |
| DASH-ES-02 | Loading skeleton behavior unchanged | MUST |
| DASH-ES-03 | Error badge behavior unchanged | MUST |
| DASH-ES-04 | Empty-state inserted between loading and stats-data in v-if chain | MUST |

#### Scenario: Empty state renders instead of zeros

- GIVEN `stats = { visits: 0, newPatients: 0, returningPatients: 0, totalPatients: 0 }`, `loading = false`, `error = null`
- WHEN HeroCard renders
- THEN onboarding or slow-day content is displayed
- AND "Visitas hoy" heading and zero stat cards are NOT rendered

#### Scenario: Loading skeleton still works

- GIVEN `loading = true`
- WHEN HeroCard renders
- THEN pulsing skeleton placeholders appear — neither empty state nor stats view

#### Scenario: Error badge still works

- GIVEN `error = "Error al cargar"`, `loading = false`
- THEN red error badge with message renders — neither empty state nor stats view

### Requirement: HeroCard Empty-State Props

| # | Requirement | Strength |
|---|-------------|----------|
| DASH-ES-P01 | Accept `isEmptyState: boolean` prop (default `false`) | MUST |
| DASH-ES-P02 | Accept `isNewProfessional: boolean` prop (default `false`) | MUST |
| DASH-ES-P03 | Existing props (`stats`, `loading`, `error`, `userName`, `weatherData`, `weatherLoading`, `weatherError`, `showCitySelector`) unchanged | MUST |

#### Scenario: HeroCard receives empty-state flags

- GIVEN `useDashboard` computes `isEmptyState = true`, `isNewProfessional = true`
- WHEN `DashboardPage` binds both props to `<HeroCard>`
- THEN HeroCard renders the new-professional onboarding variant

#### Scenario: Backward-compatible without empty-state props

- GIVEN `isEmptyState` and `isNewProfessional` are omitted (default `false`)
- WHEN HeroCard renders with valid stats
- THEN the stats view renders exactly as before this change

### Requirement: DashboardPage Passes Empty-State Data

| # | Requirement | Strength |
|---|-------------|----------|
| DASH-ES-L01 | `DashboardPage` MUST bind `isEmptyState` and `isNewProfessional` from `useDashboard` to `HeroCard` | MUST |
| DASH-ES-L02 | When `isEmptyState` is `true`, `QuickActions` SHALL render inside or immediately adjacent to HeroCard | MUST |
| DASH-ES-L03 | When `isEmptyState` is `false`, `QuickActions` SHALL render in its original row position | MUST |

#### Scenario: Empty-state QuickActions positioning

- GIVEN `isEmptyState` is `true`
- THEN `QuickActions` renders adjacent to HeroCard (not in its separate default row below)

#### Scenario: Normal QuickActions positioning

- GIVEN `isEmptyState` is `false`
- THEN `QuickActions` renders in its original row between `PendingReportsWidget` and `PatientList`
