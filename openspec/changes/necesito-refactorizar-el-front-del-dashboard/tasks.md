# Tasks: Refactorizar Dashboard — Datos Mock a Datos Reales (Fase 1)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~710 (406 new + 205 tests + 105 modified) |
| 400-line budget risk | **High** |
| Chained PRs recommended | **Yes** |
| Suggested split | 3 chained PRs: Domain → Infra+Composable → Presentation |
| Delivery strategy | ask-always (blocked — needs user decision) |
| Chain strategy | pending |

Decision needed before apply: **Yes**
Chained PRs recommended: **Yes**
Chain strategy: **pending**
400-line budget risk: **High**

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Domain entities + interfaces + 2 use cases RED/GREEN | PR 1 | base: feature-tracker; ~220 lines |
| 2 | Infra repo + remaining use cases + container + composable | PR 2 | base: PR 1 branch; ~210 lines |
| 3 | Components refactor + PendingReportsWidget + page wiring | PR 3 | base: PR 2 branch; ~280 lines |

---

## Phase 1: Domain Foundation (PR 1 — RED → GREEN)

- [x] 1.1 Create `domain/entities/DashboardStats.ts` — `{ visits, newPatients, returningPatients }`
- [x] 1.2 Create `domain/entities/PatientSummary.ts` — `{ id, name, visitTime, initials }`
- [x] 1.3 Create `domain/entities/PendingReport.ts` — `{ id, patientName, templateName, createdAt }`
- [x] 1.4 Create `domain/entities/types.ts` — `DashboardRole`, `DateRange` value object
- [x] 1.5 Create `domain/repositories/DashboardRepository.ts` — 4‑method interface
- [x] 1.6 RED: Write `GetDashboardStatsUseCase` tests (3 scenarios: normal split, empty, missing `created_at` → defensive fallback)
- [x] 1.7 GREEN: Implement `GetDashboardStatsUseCase.ts` — query, count, classify new vs returning
- [x] 1.8 RED: Write `GetRecentPatientsUseCase` test (maps patients to `PatientSummary[]`)
- [x] 1.9 GREEN: Implement `GetRecentPatientsUseCase.ts` — map API response to `PatientSummary[]`

## Phase 2: Infrastructure + Remaining Logic (PR 2 — extend)

- [x] 2.1 RED: Write `GetPendingReportsUseCase` tests (under limit returns all, over 5 returns 5, empty → [])
- [x] 2.2 GREEN: Implement `GetPendingReportsUseCase.ts` — cap at `limit` items
- [x] 2.3 RED: Write `GetSystemMetricsUseCase` test (extracts `total` from `/admin/users`)
- [x] 2.4 GREEN: Implement `GetSystemMetricsUseCase.ts` — call repo, return `{ totalUsers }`
- [x] 2.5 Implement `infrastructure/ApiDashboardRepository.ts` — 4 methods via `fetchClient`
- [x] 2.6 Create `application/containers/dashboardContainer.ts` — 4 `provide*()` factories
- [x] 2.7 RED: Write `useDashboard` composable tests (doctor role path, admin role path, no‑permission state)
- [x] 2.8 GREEN: Implement `presentation/composables/useDashboard.ts` — role detection via `hasPermission()`, lazy use‑case dispatch, `loading`/`error` refs

## Phase 3: Presentation Integration (PR 3 — wire UI) ✅

- [x] 3.1 Modify `components/HeroCard.vue` — accept `stats`, `loading`, `error` props; remove hardcoded numbers; add skeleton placeholder + error badge
- [x] 3.2 Modify `components/PatientList.vue` — accept `patients` array prop; remove static array; add skeleton rows + empty state ("No hay pacientes hoy") + `select` emit
- [x] 3.3 Create `components/PendingReportsWidget.vue` — preview first 5 reports with patient/template/date; count badge; "Ver todos (N)" link → `/reports`
- [x] 3.4 Modify `pages/DashboardPage.vue` — inject `useDashboard`; conditionally render admin vs doctor layout; pass reactive props to HeroCard, PatientList, PendingReportsWidget; remove mock logic

## Phase 4: Verification ✅

- [x] 4.1 Run `cd frontend && npx vitest run` — all new use‑case + composable tests pass (minimum 10)
- [x] 4.2 Run `npm run build` — production build succeeds with zero errors
- [ ] 4.3 Visual check: admin sees user count; doctor sees real KPIs + patient list + pending reports
