# Design: Replace Pricing Plans with PoC Content

## Technical Approach

Replace the fake pricing grid with three honest PoC sections: a 6-step visual workflow, an accordion FAQ, and an email-only early-access CTA. Pure UI swap within the landing module — zero backend, zero new dependencies. Follow existing component patterns (inline SVG icons, Tailwind utilities, `<script setup>`, scoped styles).

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|----------|--------|----------|-----------|
| Workflow layout | 3×2 card grid (desktop), 1-col (mobile) | Horizontal timeline with connectors | Existing module cards use grid; connectors add CSS complexity for no benefit |
| FAQ accordion | `details`/`summary` HTML elements | Vuetify `v-expansion-panels` | No landing component imports Vuetify; native elements need zero deps and match simplicity |
| CTA form action | `console.log` + `v-model` | Axios POST to backend | No backend exists; placeholder form is honest about PoC stage |
| Icons | Inline SVG paths (stroke 1.8, 24×24 viewBox) | Iconify/lucide-vue-next package | All existing landing icons use inline SVGs; adding a package is unnecessary |

## Component Tree & Data Flow

```
LandingPage.vue
├── LandingHeader.vue          [modified: nav text + anchor]
├── LandingHero.vue
├── LandingTagline.vue
├── LandingModules.vue
├── LandingMetrics.vue
├── LandingSecurity.vue
├── LandingWorkflow.vue  [NEW — replaces LandingPricing]
│   (static inline data: 6-step array)
├── LandingFaq.vue       [NEW — between workflow and CTA]
│   (static inline data: 6 question/answer pairs)
├── LandingCta.vue       [modified: email form]
│   (v-model email, @submit.prevent → console.log)
└── LandingFooter.vue
```

No props, no emits, no store. All content is static inline constants. No cross-component communication.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/landing/presentation/components/LandingWorkflow.vue` | **Create** | 6-step grid: number badge + icon + title + description. Section id `workflow`. |
| `src/modules/landing/presentation/components/LandingFaq.vue` | **Create** | Accordion FAQ using `<details>`/`<summary>`. 6 Q&A pairs. |
| `src/modules/landing/presentation/pages/LandingPage.vue` | **Modify** | Swap `LandingPricing` → `LandingWorkflow` + `LandingFaq`. Remove `selectPlan`, `goSales` handlers. |
| `src/modules/landing/presentation/components/LandingHeader.vue` | **Modify** | Line 25: text "Precios" → "Cómo funciona", anchor `#precios` → `#workflow` |
| `src/modules/landing/presentation/components/LandingCta.vue` | **Modify** | Empty buttons → email input + "Solicitar acceso" button. Basic `type="email"` validation. |
| `src/modules/landing/presentation/components/LandingPricing.vue` | **Delete** | Entire file removed |
| `src/style.css` | **Modify** | Remove `.mask-check` block (lines 568-572) — no other consumer |
| `tests/LandingPage.spec.js` | **Modify** | Update 3 test areas (see Testing Strategy) |

## Workflow Icons (inline SVG, all stroke=1.8, viewBox 0 0 24 24)

| Step | Title | SVG |
|------|-------|-----|
| 1 | Buscar Paciente | `circle cx=11 cy=11 r=8` + `path d="m21 21-4.3-4.3"` |
| 2 | Elegir Plantilla | `path d="M14 2H6a2 2 0 0 0-2 2v16"` + `line x1=12 y1=18 x2=12 y2=12"` + `line x1=9 y1=15 h6"` |
| 3 | Grabar Consulta | `path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5"` + `path d="M19 10v2a7 7 0 0 1-14 0v-2"` + `line x1=12 y1=19 x2=12 y2=22"` |
| 4 | IA Rellena Informe | `path d="M12 20h9"` + `path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"` + `circle cx=12 cy=12 r=3"` (sparkles) → simplified to `path M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0"` |
| 5 | Revisar | `path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"` + `circle cx=12 cy=12 r=3"` |
| 6 | Firmar | `path d="M12 20h9"` + `path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"` |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `LandingWorkflow` renders 6 steps with correct titles | Mount component, assert text content for each step label |
| Unit | `LandingFaq` renders 6 questions, expands on click | Mount, assert all `<summary>` texts, test open/close via `open` attribute |
| Unit | `LandingCta` email validation | Mount, assert `<input type="email">` renders, test `v-model` binding |
| Integration | `LandingPage` renders new sections in correct order | Mount, assert workflow text before FAQ, FAQ before CTA |
| E2E | Nav link "Cómo funciona" scrolls to `#workflow` | Click nav link, assert `window.location.hash === '#workflow'` |

**Test file updates in `tests/LandingPage.spec.js`:**

1. **Line 46** ("all 9 child components"): replaces 9 → 10 child count (Pricing removed, Workflow + FAQ added = +1). Replace assertion `'Escala con tus necesidades'` with `'Cómo funciona'`.
2. **Lines 66-70** (navigation): `'Precios'` → `'Cómo funciona'`.
3. **Lines 113-128** (pricing section): Remove entire `describe('pricing section')` block. Add new `describe('workflow section')` asserting 6 step titles and `describe('faq section')` asserting 6 questions.

## Migration / Rollout

No migration required. Rollback: revert 8 files to git HEAD, run `npx vitest run --run`.

## Open Questions

- [ ] FAQ copy: exact Q&A text needs stakeholder review (placeholder draft included in implementation)
- [ ] CTA email: store to localStorage now, or leave as pure `console.log`? (recommend `console.log` for PoC)
