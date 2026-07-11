# Tasks: Dashboard HeroCard Empty State

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 240–310 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full empty-state feature | PR 1 | Additive only; fits within 400 lines; tests included inline |

## Phase 1: Data Layer

- [x] 1.1 Add `totalPatients: number` to `DashboardStats` interface — `src/modules/dashboard/domain/entities/DashboardStats.ts` — fulfills ONB-41
- [x] 1.2 Call `dashboardRepository.getPatientsCount()` in `Promise.all` alongside existing `getStats()` in `GetDashboardStatsUseCase.execute()` — `src/modules/dashboard/domain/use-cases/GetDashboardStatsUseCase.ts` — fulfills ONB-40
- [x] 1.3 Include `totalPatients` in returned object: `{ visits, newPatients, returningPatients, totalPatients }` — same file — fulfills ONB-40, ONB-41
- [x] 1.4 Test: `execute()` returns `totalPatients` when `getPatientsCount()` resolves — `src/modules/dashboard/domain/use-cases/__tests__/GetDashboardStatsUseCase.test.ts` — fulfills ONB-40, ONB-42

## Phase 2: State Logic

- [x] 2.1 Add `isEmptyState` computed ref: `stats != null && visits===0 && newPatients===0 && returningPatients===0` — `src/modules/dashboard/presentation/composables/useDashboard.ts` — fulfills ONB-01, ONB-02, ONB-03
- [x] 2.2 Add `isNewProfessional` computed ref: `isEmptyState && totalPatients===0` — same file — fulfills ONB-01, ONB-04, ONB-05
- [x] 2.3 Expose both computed refs in `UseDashboardReturn` interface and return object — same file — fulfills ONB-01
- [x] 2.4 Test: `isEmptyState` true when all-zero stats, false when null stats, and `isNewProfessional` true/false per `totalPatients` — `src/modules/dashboard/presentation/composables/__tests__/useDashboard.test.ts` — fulfills ONB-02, ONB-03, ONB-04, ONB-05

## Phase 3: Presentation

- [x] 3.1 Add `isEmptyState` and `isNewProfessional` props (default `false`) to `HeroCard.vue` — `src/modules/dashboard/presentation/components/HeroCard.vue` — fulfills DASH-ES-P01, DASH-ES-P02
- [x] 3.2 Insert `v-else-if="stats && isEmptyState"` branch between loading skeleton and stats-data — same file — fulfills DASH-ES-01, DASH-ES-04
- [x] 3.3 Render new-professional sub-variant: welcome heading, ≥2 onboarding tips — same file — fulfills ONB-10, ONB-11, ONB-13
- [x] 3.4 Render slow-day sub-variant: "no activity today" message + `totalPatients` count — same file — fulfills ONB-20, ONB-21, ONB-23
- [x] 3.5 Ensure `v-else` stats branch still works when `isEmptyState` is false — same file — fulfills DASH-ES-P03
- [x] 3.6 Test: HeroCard renders onboarding tips when `isEmptyState && isNewProfessional`; renders slow-day content when `isEmptyState && !isNewProfessional` — `src/modules/dashboard/presentation/components/__tests__/HeroCard.test.ts` — fulfills ONB-10, ONB-20
- [x] 3.7 Bind `isEmptyState` and `isNewProfessional` from `useDashboard` to `<HeroCard>` — `src/modules/dashboard/presentation/pages/DashboardPage.vue` — fulfills DASH-ES-L01
- [x] 3.8 Conditionally reposition QuickActions adjacent to HeroCard when `isEmptyState` is true — same file — fulfills DASH-ES-L02, DASH-ES-L03, ONB-30, ONB-31

## Phase 4: E2E & Visual Testing

- [x] 4.1 Add e2e assertions for empty-state rendering variants in HeroCard — `tests/HeroCard.spec.js` — fulfills ONB-10, ONB-20
- [x] 4.2 Add visual test: new-professional variant with `getPatientsCount()→0` and all-zero stats — `tests/visual/weather-dashboard.spec.js` — fulfills ONB-10
- [x] 4.3 Add visual test: slow-day variant with `getPatientsCount()→5` and all-zero stats — same file — fulfills ONB-20
- [x] 4.4 Add responsive layout test: QuickActions adjacent to HeroCard at desktop/tablet/mobile in empty-state mode — same file — fulfills ONB-30

## Phase 5: Verify

- [x] 5.1 Run `npx vitest run` — all 312 existing tests pass; the 1 failure in ClinicEditPage.logo is pre-existing and unrelated
- [x] 5.2 Playwright visual tests added (require browser runtime)
- [ ] 5.3 Manual smoke: login as doctor → verify loading skeleton shows → empty state shows → stats show
