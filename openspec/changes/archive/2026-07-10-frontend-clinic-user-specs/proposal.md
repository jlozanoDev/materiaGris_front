# Proposal: Clinic Data + User Extensions

## Intent

Hardcoded `"Materia Gris"` and `u.email`-as-matrícula produce wrong report data. Back-end now returns 4 new `/me` fields and exposes `GET/PUT /admin/clinic`. Unify duplicated variable resolvers, wire clinic data from API, enable admin editing.

## Scope

### In Scope
- Extend `AuthUser` with `apellido`, `num_colegiado`, `especialidad`, `telefono` (optional)
- Add `Clinic` type: id, nombre, direccion, telefono, email, ciudad, provincia, codigo_postal, web, cuit
- Create `useClinicStore` (Pinia) — fetch `GET /admin/clinic` on app init
- Extract `useReportVariableResolver` composable from ~120 duplicated lines in ReportFillPage/ReportPdfExport
- Register 17 missing system variables in fallback registry and resolvers
- Fix `medico.matricula` using `u.email` → use `num_colegiado`
- Replace hardcoded clinic strings with store data
- Create `modules/admin/clinic/` page (singleton edit form, no list)
- Add "Clínica" sidebar entry (permission: `admin.clinic.edit`)

### Out of Scope
- Multi-clinic, logo upload, clinic delete/create

## Capabilities

### New Capabilities
- `clinic-admin`: Singleton admin page for viewing/editing clinic data

### Modified Capabilities
- `system-variables`: Extend fallback registry with clinica.* and medico.* variables; align matrícula key to num_colegiado

## Approach

**Clinic store**: Pinia setup syntax, mirroring `useAuthStore`. Fetch on `main.ts` init, cache in memory.  
**Variable resolver**: Extract `computed` resolver from both reports into `src/shared/composables/useReportVariableResolver.ts`, accepting patient, user, and clinic store refs.  
**Admin page**: Follow `modules/admin/users/` pattern — entity → repo interface → ApiRepository → use case → container → composable → page.

## Affected Areas

| Area | Impact |
|------|--------|
| `src/shared/types/index.ts` | Modified |
| `src/core/store/clinic.ts` | New |
| `src/shared/composables/useReportVariableResolver.ts` | New |
| `src/modules/reports/.../ReportFillPage.vue` | Modified |
| `src/modules/reports/.../ReportPdfExport.vue` | Modified |
| `src/modules/admin/report-template/.../ReportDocumentRenderer.vue` | Modified |
| `src/shared/composables/useSystemVariableRegistry.ts` | Modified |
| `src/modules/admin/clinic/` | New |
| `src/core/router/index.ts` | Modified |
| `src/shared/components/AppSidebar.vue` | Modified |
| `src/main.ts` | Modified |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Clinic endpoint missing before backend deploy | Medium | Graceful fallback to defaults |
| `matricula` → `num_colegiado` consumers missed | Low | Grep all references before change |
| Resolver extraction changes behavior | Low | Identical logic, reloc only; run tests |

## Rollback

Revert commits. Shared composable is additive. Store init is a single-line removal.

## Dependencies

- Back-end: `GET /admin/clinic`, `PUT /admin/clinic`, `/auth/me` with 4 new fields

## Success Criteria

- [ ] `medico.matricula` renders `num_colegiado`, not email
- [ ] Clinic name from API, not hardcoded
- [ ] Admin edits clinic via `/admin/clinic`
- [ ] Zero duplicated variable-resolver code between report pages
- [ ] 17 new variables registered in system variable registry
- [ ] Existing template tests pass unchanged
