# Proposal: Dashboard HeroCard Empty State

## Intent

New professionals land on a HeroCard showing "Visitas hoy: 0" with naked zeros and no guidance. It signals brokenness, not truth. Replace zeros with differentiated, informative content: onboarding tips for brand-new professionals, contextual reassurance for existing ones on slow days. Warmer tone than rest of app.

## Scope

### In Scope
- Two empty-state variants in HeroCard: **new professional** (`totalPatients === 0`) and **slow day** (`totalPatients > 0`, today all-zero)
- Fetch total patient count via existing `DashboardRepository.getPatientsCount()`
- Replace naked zeros with useful content (tips, insights, educational context per variant)
- Integrate QuickActions visually into or immediately adjacent to the HeroCard empty-state area
- Unit tests (Vitest) + visual regression tests (Playwright)

### Out of Scope
- Backend `/patients/find` endpoint changes
- New `is_first_login` flag or backend schema
- Appointments/agenda module
- Empty-state changes to PatientList, PendingReportsWidget, or RightPanel

## Capabilities

### New Capabilities
- `dashboard-onboarding`: Empty-state guidance rendered inside HeroCard when today's stats are all zero. Two variants differentiated by `totalPatients` count.

### Modified Capabilities
- `dashboard`: HeroCard spec must cover the empty-state variant branch. Existing stats rendering and loading/error states remain unchanged.

## Approach

1. **Data**: Extend `DashboardStats` entity with `totalPatients: number`. Modify `GetDashboardStatsUseCase` to also call `getPatientsCount()`. Update `useDashboard` to compute `isEmptyState` and `isNewProfessional` from result.
2. **Presentation**: Add a new `<template v-else-if="stats && isEmptyState">` block in `HeroCard.vue` with two sub-variants. Loading and error branches untouched.
3. **QuickActions proximity**: Move QuickActions rendering inside the HeroCard empty-state block, or place them in a shared container row with explicit visual connection.
4. **Tone**: Warmer, more guiding than other dashboard messages. "Nuevo profesional" variant: educational tips about patient registration, report workflows. "Slow day" variant: reassurance + current patient summary stats.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/dashboard/domain/entities/DashboardStats.ts` | Modified | Add `totalPatients` field |
| `src/modules/dashboard/domain/use-cases/GetDashboardStatsUseCase.ts` | Modified | Fetch total count alongside range query |
| `src/modules/dashboard/presentation/composables/useDashboard.ts` | Modified | Compute `isEmptyState`, `isNewProfessional` |
| `src/modules/dashboard/presentation/components/HeroCard.vue` | Modified | New template branch for empty-state variants |
| `src/modules/dashboard/presentation/pages/DashboardPage.vue` | Modified | Reposition QuickActions relative to HeroCard |
| `src/modules/dashboard/presentation/components/QuickActions.vue` | Potentially modified | If merged into HeroCard area |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Extra `getPatientsCount()` call adds latency | Low | Runs in parallel with existing `Promise.all` — negligible |
| Differentiation heuristic wrong for edge case (patient deleted after registration) | Low | `totalPatients > 0` is conservative; worst case shows "slow day" instead of "new pro" — acceptable |
| QuickActions repositioning breaks responsive layout | Medium | Test at mobile/tablet/desktop breakpoints with Playwright |

## Rollback Plan

Revert HeroCard template to the `v-else-if="stats"` branch only (remove `isEmptyState` block). Revert QuickActions to original position in `DashboardPage.vue`. `totalPatients` field in entity is additive — safe to leave.

## Dependencies

- None. `getPatientsCount()` already exists on repository.

## Success Criteria

- [ ] New professional (0 total patients) sees onboarding tips, not zeros, in HeroCard
- [ ] Existing professional on slow day sees "no activity today" with contextual content
- [ ] QuickActions rendered in or visually adjacent to HeroCard empty state
- [ ] Loading skeleton and error badge still work as before
- [ ] Vitest tests pass for use case and composable changes
- [ ] Playwright visual tests capture both empty-state variants
