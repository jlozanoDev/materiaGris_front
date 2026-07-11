# Design: Dashboard HeroCard Empty State

## Technical Approach

Add `totalPatients` to `DashboardStats`, call `getPatientsCount()` alongside existing stats fetch in the use case, compute `isEmptyState`/`isNewProfessional` in `useDashboard`, add an empty-state template branch to `HeroCard` with two sub-variants, and reposition `QuickActions` adjacent to `HeroCard` in `DashboardPage` when the empty state is active.

## Architecture Decisions

| # | Option | Tradeoff | Decision |
|---|--------|----------|----------|
| 1a | Compute `isEmptyState` in `useDashboard` composable | Single source of truth; HeroCard stays pure presentation | **Chosen** |
| 1b | Compute in `HeroCard` component | Couples business logic to UI; harder to test in isolation | Rejected |
| 1c | Compute in `DashboardPage` and pass as props | Duplicates logic if reused elsewhere | Rejected |
| 2a | Swap QuickActions position in `DashboardPage` conditionally | QuickActions stays standalone; layout owned by page | **Chosen** |
| 2b | Pass QuickActions into HeroCard via slot | Tight coupling; HeroCard shouldn't own action buttons | Rejected |
| 2c | Wrap HeroCard+QuickActions in shared container | Adds unnecessary nesting component | Rejected |
| 3a | Call `getPatientsCount()` inside `GetDashboardStatsUseCase.execute()` | Single use case = single result shape; non-breaking addition | **Chosen** |
| 3b | Call from `useDashboard` as separate async call | Extra network round trip; complicates loading state | Rejected |

## Data Flow

```
DashboardPage.onMounted()
  └─ useDashboard.fetchDashboard()
       └─ GetDashboardStatsUseCase.execute(range)
            ├─ DashboardRepository.getStats(range) → visits/day stats
            └─ DashboardRepository.getPatientsCount() → total patients
       └─ returns { visits, newPatients, returningPatients, totalPatients }

useDashboard exposes:
  stats (ref<DashboardStats | null>)
  isEmptyState (computed: stats != null && all today-zero)
  isNewProfessional (computed: isEmptyState && totalPatients === 0)

DashboardPage (template)
  ┌─ v-if="isEmptyState" ────────────────────────────┐
  │  Row 1: [HeroCard(empty-state)] [QuickActions]    │
  │  Row 2: [PendingReportsWidget]  [PatientList]     │
  └───────────────────────────────────────────────────┘
  ┌─ v-else ──────────────────────────────────────────┐
  │  Row 1: [HeroCard(stats)]        [PendingReports]  │
  │  Row 2: [QuickActions]           [PatientList]     │
  └───────────────────────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/dashboard/domain/entities/DashboardStats.ts` | Modify | Add `totalPatients: number` field |
| `src/modules/dashboard/domain/use-cases/GetDashboardStatsUseCase.ts` | Modify | Call `getPatientsCount()` and include in returned object |
| `src/modules/dashboard/domain/use-cases/__tests__/GetDashboardStatsUseCase.test.ts` | Modify | Add tests for `totalPatients` in result |
| `src/modules/dashboard/presentation/composables/useDashboard.ts` | Modify | Add `isEmptyState`, `isNewProfessional` computed refs and `totalPatients` field |
| `src/modules/dashboard/presentation/composables/__tests__/useDashboard.test.ts` | Modify | Add tests for empty-state computed values |
| `src/modules/dashboard/presentation/components/HeroCard.vue` | Modify | Add empty-state template branch with two sub-variants |
| `src/modules/dashboard/presentation/components/__tests__/HeroCard.test.ts` | Modify | Add tests for empty-state rendering variants |
| `src/modules/dashboard/presentation/pages/DashboardPage.vue` | Modify | Conditional layout: swap QuickActions row position when empty state |
| `tests/HeroCard.spec.js` | Modify | Add empty-state rendering assertions |
| `tests/visual/weather-dashboard.spec.js` | Modify | Add empty-state variant visual tests |

## Interfaces / Contracts

```typescript
// DashboardStats (modified — additive only)
interface DashboardStats {
  visits: number;
  newPatients: number;
  returningPatients: number;
  totalPatients: number;  // NEW: all-time patient count
}

// HeroCard Props (modified — additive only)
interface Props {
  // ...existing props unchanged...
  isEmptyState?: boolean;       // NEW: false by default
  isNewProfessional?: boolean;  // NEW: false by default
}

// useDashboard return (modified — additive only)
interface UseDashboardReturn {
  // ...existing fields unchanged...
  isEmptyState: ComputedRef<boolean>;   // NEW
  isNewProfessional: ComputedRef<boolean>; // NEW
}
```

## Template Structure for Empty-State Variants

**Branch ordering** (HeroCard template): `v-if="error"` → `v-else-if="loading"` → `v-else-if="isEmptyState"` (new) → `v-else-if="stats"` (existing)

**New professional** (`isEmptyState && isNewProfessional`):
- Icon/illustration + "Comienza a construir tu consulta"
- Bulleted onboarding tips: "Registra tu primer paciente", "Crea una plantilla de informe", "Explora el panel de administración"
- Warmer, more educational tone than other dashboard messages

**Slow day** (`isEmptyState && !isNewProfessional`):
- "Hoy no hay actividad registrada"
- Contextual stats: "Tienes X pacientes registrados" (from `totalPatients`)
- Gentle reassurance message

## Responsive Layout

| Breakpoint | Empty-state layout | Normal layout |
|------------|-------------------|---------------|
| Desktop (≥1024px) | HeroCard (flex-1) + QuickActions (w-80) side by side; PendingReports + PatientList below | Unchanged |
| Tablet (768–1023px) | HeroCard full width; QuickActions below as 2-column grid | Unchanged |
| Mobile (<768px) | Stacked vertically; QuickActions renders last | Unchanged |

QuickActions already uses `grid grid-cols-2` which adapts to narrow containers. The `w-80` class constrains it to 320px max on desktop; on mobile, `flex-col` stacking via Vuetify/Tailwind responsive utilities handles it.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit — UseCase | `execute()` returns `totalPatients` when `getPatientsCount()` resolves | Extend existing test suite; mock repo |
| Unit — Composable | `isEmptyState` true when all today-zero; `isNewProfessional` true when `totalPatients===0` | Vitest + mocked DI container |
| Unit — Component | HeroCard renders onboarding tips when `isEmptyState && isNewProfessional`; renders slow-day content when `isEmptyState && !isNewProfessional` | `@vue/test-utils` mount with props |
| Visual — E2E | Both empty-state variants render correctly; QuickActions appears adjacent to HeroCard | Playwright with route mocking: mock `getPatientsCount()→0` (new pro) and `getPatientsCount()→5` with zero-stats (slow day) |
| Visual — Responsive | QuickActions wraps properly at tablet/mobile breakpoints in empty-state layout | Playwright with viewport sizes: 375px, 768px, 1280px |

## Migration / Rollout

No migration required. All changes are additive to the existing interface. Rollback: remove `v-else-if="isEmptyState"` branch from HeroCard, revert DashboardPage to original layout, keep `totalPatients` field (additive — harmless).

## Open Questions

- [ ] Copy text for onboarding tips and slow-day messages — content team or product owner should review
- [ ] Illustration/icon for new-professional variant — design system asset needed or use PrimeIcons fallback
