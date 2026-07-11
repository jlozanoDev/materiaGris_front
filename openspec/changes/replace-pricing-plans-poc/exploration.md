# Exploration: Replace Pricing Plans Section (PoC)

## Topic

MateriaGris is a proof of concept (PoC). It does NOT need pricing plans. The current pricing/plans section must be replaced with content that adds value without any payment infrastructure.

## Current State

The landing page (`LandingPage.vue`) at route `/welcome` is composed of 9 sections assembled sequentially:

| Order | Component | Route anchor |
|-------|-----------|-------------|
| 1 | `LandingHeader` | — |
| 2 | `LandingHero` | `#hero` |
| 3 | `LandingTagline` | — |
| 4 | `LandingModules` | `#modulos` |
| 5 | `LandingMetrics` | — |
| 6 | `LandingSecurity` | — |
| **7** | **`LandingPricing`** | **`#precios`** |
| 8 | `LandingCta` | — |
| 9 | `LandingFooter` | — |

The pricing section (`LandingPricing.vue`) is a **pure UI mockup** — no API calls, no store, no backend dependency. It renders 3 styled cards:

1. **Básico** — free tier (0 €/mes), 8 features with 3 missing
2. **Avanzado** — 149 €/mes, highlighted as "Recomendado"
3. **Hospital** — "A medida", contact sales, 8 features

Each card has a button that emits `selectPlan`, but the landing page handler (`selectPlan`) is a no-op placeholder: `const selectPlan = (_plan: string) => {} // placeholder`.

## Affected Areas

All changes are contained within the `landing` module — **zero backend impact, zero cross-module coupling**.

| File | How affected |
|------|-------------|
| `src/modules/landing/presentation/components/LandingPricing.vue` | **REPLACE ENTIRELY** — this is the pricing component to swap out |
| `src/modules/landing/presentation/components/LandingHeader.vue` | Line 25: change nav link text from "Precios" to new label, or remove entirely. Anchor `#precios` must match new section's `id`. |
| `src/modules/landing/presentation/pages/LandingPage.vue` | Line 18: remove `selectPlan` handler. Line 29: replace `<LandingPricing>` import and usage with new component. Line 17: `goSales` can also be removed if no longer needed. |
| `src/modules/landing/presentation/components/LandingCta.vue` | Currently has empty CTA buttons (lines 20-23). Opportunity to repurpose alongside replacement. |
| `src/style.css` | Lines 568-571: "Checkmark mask for pricing lists" — cosmetic CSS used by pricing cards. Remove or repurpose. |
| `tests/LandingPage.spec.js` | Lines 114-128: Pricing section tests need updating. Replace assertions for "Básico/Avanzado/Hospital" and `.pricing-highlight` with assertions for the new section. |

**Not affected:**
- Router (`/welcome` route unchanged)
- All other landing sections (Hero, Modules, Metrics, Security, CTA, Footer)
- All authenticated routes and modules (patients, reports, templates, admin)
- No API/backend dependency exists to remove

## Approaches

### 1. "How It Works" — Visual Workflow Section

Replace pricing cards with a 3-step or 4-step visual workflow showing the product journey:
Patient Search → Template Selection → AI Generation → Review & Emit.

Each step has an icon, title, and brief description. The section already has all the pieces demonstrated (patients, templates, reports).

- **Pros**: Educates visitors about the product, no placeholder content, fits PoC nature, reuses existing asset imagery
- **Cons**: Requires designing a new visual layout, needs decent copywriting
- **Effort**: Medium

### 2. Feature Showcase — "Everything Included"

Replace the 3-tier grid with a single, unified feature list. Since there are no plans, show all features as included. Keep the card aesthetic but frame them as capability areas (Reports, Diagnosis, Dictation, Security, Integration) with checkmarks.

- **Pros**: Simplest to implement, preserves the list/checkmark visual pattern, communicates product value directly, zero fake content
- **Cons**: Less engaging than a workflow, may feel redundant with the Modules section already on the page
- **Effort**: Low

### 3. Early Access / Beta Waitlist

Replace pricing with an honest "Early Access" section. Add a simple email/name form that posts to a lightweight endpoint (or even just a Google Form / webhook). Acknowledge the PoC stage openly.

- **Pros**: Honest about product stage, collects real leads, builds community, replaces "Precios" nav with "Acceso temprano"
- **Cons**: Requires a small backend endpoint or external service for form collection, needs GDPR/privacy consideration for email storage
- **Effort**: Medium

### 4. FAQ / Common Questions

Replace pricing cards with an accordion-style FAQ section answering: What is MateriaGris? How does the AI work? Is my data secure? What specialties are supported? Can I integrate with my existing HCE?

- **Pros**: Genuinely useful for visitors, no fake content needed, reduces support burden when product launches, easy to maintain
- **Cons**: Needs well-thought-out questions and answers, may feel less "marketing-like" than a visual section
- **Effort**: Low

### 5. Testimonials / Social Proof

Replace with quote cards from healthcare professionals describing their experience. For a PoC without real users yet, use anonymized feedback from design partners or aspirational testimonials labeled as "Lo que dicen los médicos."

- **Pros**: Builds trust and credibility, effective marketing pattern, visually appealing card layout
- **Cons**: Content doesn't exist yet — requires either fabrication or waiting for early feedback, fragile credibility
- **Effort**: Low (implementation) / High (content creation)

## Recommendation

**Combine Approach 1 (Workflow) + Approach 3 (Early Access)**, leaning toward Approach 1 as the primary replacement and Approach 3 as a CTA enhancement.

**Why**: The workflow section ("How It Works") replaces the pricing grid directly — same visual weight, same position in the page, better educational value. Meanwhile, repurpose the existing `LandingCta` section (currently has empty buttons) with a simple waitlist email form. This gives the PoC a purpose: collect interest while demonstrating the product journey.

**If effort must be minimized**: Use Approach 2 (Feature Showcase) — it preserves the existing card grid layout, the checkmark-list CSS, and requires the least code change. Just reframe from "tiers with different features" to "everything included."

### Suggested Implementation Plan (for Approach 1)

1. Create `LandingWorkflow.vue` — 4-step visual flow (Patient → Template → AI → Review)
2. Remove `LandingPricing.vue` entirely
3. Update `LandingPage.vue` — swap imports, remove `selectPlan` and `goSales` no-ops
4. Update `LandingHeader.vue` — change "Precios" to "Cómo funciona", anchor to `#workflow`
5. Update `LandingCta.vue` — add a simple email input + "Solicitar acceso" button (form action can be a no-op or Google Form for now)
6. Update `tests/LandingPage.spec.js` — replace pricing assertions with workflow assertions
7. Clean up CSS — remove `.pricing-card`, `.pricing-highlight`, `.mask-check` if no longer used

## Risks

- **Content quality risk**: The workflow section needs decent copywriting and clear visual design. A rushed implementation may look worse than the current polished (but fake) pricing cards.
- **Nav anchor change**: Changing `/welcome#precios` to `/welcome#workflow` means any bookmarked links break. Mitigation: keep `#precios` as an alias anchor or use a redirect.
- **Test breakage**: 2 test cases in `LandingPage.spec.js` directly assert pricing content. These will fail until updated.
- **No backend dependency exists** — this is purely a frontend refactor.

## Ready for Proposal

**Yes**. The exploration is complete. All affected files are identified, all approaches have been evaluated, and a clear recommendation exists. The next phase (`sdd-propose`) should formalize the chosen approach into a scoped proposal with rollback plan.
