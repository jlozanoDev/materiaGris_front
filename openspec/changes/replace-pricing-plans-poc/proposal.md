# Proposal: Replace Pricing Plans with PoC Content

## Intent

MateriaGris is a PoC — no billing, no tiers, no payment infra needed. The fake pricing section (`LandingPricing.vue`) adds zero value and misleads visitors. Replace it with honest, useful content: a visual workflow, a FAQ, and an early-access email form.

## Scope

### In Scope
- Replace `LandingPricing.vue` with `LandingWorkflow.vue` (6-step visual flow)
- Add `LandingFaq.vue` (accordion FAQ, auto-generated questions)
- Repurpose `LandingCta.vue` into an early-access email form (email only)
- Update `LandingHeader.vue` nav: "Precios" → "Cómo funciona", anchor `#workflow`
- Remove `selectPlan` and `goSales` no-op handlers from `LandingPage.vue`
- Clean up pricing CSS from `src/style.css`
- Update `tests/LandingPage.spec.js` — 2 test cases

### Out of Scope
- Backend endpoints, auth, database
- Other landing sections (Hero, Modules, Metrics, Security, Footer)
- Lead storage/CRM integration (form action is a placeholder)
- GDPR/consent management (out of PoC scope)

## Capabilities

### New Capabilities
None — purely a UI content swap within the existing landing module.

### Modified Capabilities
None — no spec-level behavior changes. Existing landing page capabilities unchanged.

## Approach

Combine three patterns into one section flow:

1. **Workflow** (replaces Pricing): 6-step sequence — Buscar Paciente → Elegir Plantilla → Grabar Consulta → IA Rellena Informe → Revisar → Firmar. Each step: icon + title + one-line description.
2. **FAQ** (new, between Workflow and CTA): Accordion with 5–6 questions covering "What is MateriaGris?", data security, specialties, HCE integration, and PoC limitations. Generated inline — no external data source.
3. **Early Access** (repurposes CTA): Single email input + "Solicitar acceso" button. No name, no institution fields. Form submits to a placeholder (no backend).

**Nav update**: `LandingHeader` link text "Precios" → "Cómo funciona", scrolls to `#workflow`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/landing/.../LandingPricing.vue` | Removed | Delete entire file |
| `src/modules/landing/.../LandingWorkflow.vue` | New | 6-step visual flow component |
| `src/modules/landing/.../LandingFaq.vue` | New | Accordion FAQ component |
| `src/modules/landing/.../LandingHeader.vue` | Modified | Nav link text + anchor |
| `src/modules/landing/.../LandingPage.vue` | Modified | Swap imports, remove no-ops |
| `src/modules/landing/.../LandingCta.vue` | Modified | Email-only early access form |
| `src/style.css` | Modified | Remove pricing-only CSS rules |
| `tests/LandingPage.spec.js` | Modified | Replace pricing assertions |

Zero cross-module impact. Zero backend dependency.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Content quality — rushed copy feels unpolished | Medium | Draft workflow steps and FAQ answers as plain text first; iterate with stakeholder |
| Test breakage — 2 assertions reference removed pricing cards | High | Update assertions in same commit as component swap |
| Nav anchor change — `#precios` becomes `#workflow`, bookmarks break | Low | Acceptable for PoC; no production traffic |

## Rollback Plan

1. Delete `LandingWorkflow.vue` and `LandingFaq.vue`
2. Restore `LandingPricing.vue` from git history
3. Revert `LandingPage.vue` imports and handlers
4. Revert `LandingHeader.vue` nav text to "Precios" / `#precios`
5. Revert `LandingCta.vue` to empty button state
6. Revert `src/style.css` pricing rules
7. Revert `tests/LandingPage.spec.js` assertions
8. Run `npx vitest run --run` to confirm

Simple git revert — no data migration, no backend rollback needed.

## Dependencies

None. Pure frontend UI change within the landing module.

## Success Criteria

- [ ] `/welcome` page renders Workflow + FAQ + Early Access form where Pricing was
- [ ] Nav link says "Cómo funciona" and scrolls to `#workflow`
- [ ] Early access form accepts email input
- [ ] `npx vitest run --run` passes (28 spec files)
- [ ] No pricing-related strings or components remain in the codebase
