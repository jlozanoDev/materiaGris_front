# Tasks: Replace Pricing Plans with PoC Content

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 400–430 (255 additions + 175 deletions) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

## Phase 1: New Components (independent, no deps)

- [x] 1.1 Create `src/modules/landing/presentation/components/LandingWorkflow.vue` — `<section id="workflow">` with 6-step 3×2 grid. Each step: number badge + inline SVG icon (24×24, stroke=1.8) + title + one-line description. Follow existing landing section pattern (no script needed — static data). Six steps: Buscar Paciente → Elegir Plantilla → Grabar Consulta → IA Rellena Informe → Revisar → Firmar. Tailwind classes for grid, colors match existing glass-card style. ~90 lines.
- [x] 1.2 Create `src/modules/landing/presentation/components/LandingFaq.vue` — `<section>` with 6 `<details>`/`<summary>` accordion Q&A pairs. Static inline data. FAQ covers: qué es MateriaGris, seguridad de datos, especialidades soportadas, integración HCE, limitaciones PoC, cómo solicitar acceso. Tailwind styling consistent with landing sections. ~80 lines.

## Phase 2: Modify Existing Components (can run parallel with Phase 1)

- [x] 2.1 Modify `src/modules/landing/presentation/components/LandingHeader.vue` line 25 — change link text `"Precios"` → `"Cómo funciona"`, anchor `"/welcome#precios"` → `"/welcome#workflow"`. ~2 lines.
- [x] 2.2 Modify `src/modules/landing/presentation/components/LandingCta.vue` — replace empty button div (lines 20-23) with `<form @submit.prevent>` containing `<input v-model="email" type="email" placeholder="tu@email.com">` and `<button type="submit">Solicitar acceso</button>`. Add `const email = ref('')` import. Submit handler: `console.log('early access:', email.value)`. Remove `demo` and `sales` emits no longer used. ~20 lines changed.

## Phase 3: Wiring (depends on Phase 1)

- [x] 3.1 Modify `src/modules/landing/presentation/pages/LandingPage.vue` — swap import: remove `LandingPricing`, add `LandingWorkflow` + `LandingFaq`. Remove `selectPlan` and `goSales` handlers (lines 17-18). In template: replace `<LandingPricing @select-plan="selectPlan" />` (line 29) with `<LandingWorkflow />` + `<LandingFaq />`. Remove `@sales="goSales"` from LandingCta (line 30). Order: Workflow → FAQ → CTA → Footer. ~18 lines changed.

## Phase 4: Cleanup (depends on Phase 3)

- [x] 4.1 Delete `src/modules/landing/presentation/components/LandingPricing.vue`. ~165 lines removed.
- [x] 4.2 Remove `.mask-check` block from `src/style.css` (lines 568-572). ~5 lines removed.

## Phase 5: Testing (depends on Phase 3, 4)

- [x] 5.1 Update `tests/LandingPage.spec.js` — three areas: (a) line 46: change child component count assertion to match new sections; replace `'Escala con tus necesidades'` with `'Cómo funciona'`; (b) lines 66-70: replace `'Precios'` → `'Cómo funciona'` in nav link test; (c) lines 113-128: remove `describe('pricing section')` block, add `describe('workflow section')` asserting 6 step titles, add `describe('faq section')` asserting 6 questions. ~40 lines changed.
- [x] 5.2 Run full test suite: `cd frontend && npx vitest run --run`. Fix any regressions.
