# Tasks: Admin Clinic Logo Upload

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~403 code + ~85 docs/contract = ~488 total |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation + API Contract (~165 lines) → PR 2: Core Upload (~295 lines) → PR 3: Integration Wiring (~108 lines) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | API contract + foundation (types, repo, container, store, resolver/registry) | PR 1 | base=feature-branch; docs + tests included; ~165 lines |
| 2 | Core upload (use case, composable, component) + unit tests | PR 2 | depends on PR 1; ~295 lines |
| 3 | Integration (pages, modals wiring) + integration tests | PR 3 | depends on PR 2; ~108 lines |

## Phase 1: API Contract + Foundation

- [x] 1.1 Create `openspec/changes/admin/clinic-logo-image/api-contract.md` — full endpoint spec for backend team
- [x] 1.2 Add `logo?: string \| null` to `Clinic` interface in `src/shared/types/index.ts`
- [x] 1.3 Add `uploadLogo(file: File): Promise<Clinic>` to `ClinicRepository` interface
- [x] 1.4 Add `updateLogo(url: string)` action to `src/core/store/clinic.ts`
- [x] 1.5 Add `provideUploadClinicLogoUseCase()` to `clinicContainer.ts`
- [x] 1.6 Register `clinica.logo` resolver in `useReportVariableResolver.ts` — returns `<img>` HTML or `""`
- [ ] 1.7 Add `clinica.logo` to `registerFallbackVariables()` in `useSystemVariableRegistry.ts`

## Phase 2: Core Implementation

- [ ] 2.1 Create `UploadClinicLogoUseCase.ts` — wraps `repository.uploadLogo(file)`
- [ ] 2.2 Implement `uploadLogo()` in `ApiClinicRepository.ts` — multipart FormData via `fetchClient`
- [ ] 2.3 Create `useClinicLogo.ts` composable — file validation (MIME: png/jpeg/webp/svg+xml, max 5MB), upload, reactive state
- [ ] 2.4 Create `ClinicLogoUpload.vue` — drop zone, file picker, `<img>` preview, inline errors, progress bar

## Phase 3: Integration

- [ ] 3.1 Add `<ClinicLogoUpload>` section above form in `ClinicEditPage.vue`
- [ ] 3.2 Add `variableResolver` prop to `PreviewModal.vue` and pass to `DynamicFormRenderer`
- [ ] 3.3 Add `variableResolver` prop to `PrintPreviewModal.vue` and pass to `ReportDocumentRenderer`
- [x] 3.4 Add `clinica.logo` entry to `previewVars` in `ReportDocumentRenderer.vue`
- [ ] 3.5 Wire `useClinicStore` + `useReportVariableResolver` in `ReportTemplateBuilderPage.vue`; pass to previews

## Phase 4: Tests

- [ ] 4.1 Unit test `UploadClinicLogoUseCase` — delegates to mock repository
- [ ] 4.2 Unit test `useClinicLogo` — valid/invalid MIME, size limits, error states, upload success
- [x] 4.3 Unit test `useReportVariableResolver` — `clinica.logo` null returns `""`, URL returns `<img>` HTML
- [ ] 4.4 Integration test `ClinicEditPage` — logo section renders, file selection triggers upload

## Phase 5: Cleanup

- [ ] 5.1 Update `docs/tecnica/modulos/clinic.md` with logo upload documentation
- [ ] 5.2 Update `docs/funcional/modulos/clinic.md` with logo upload feature description
