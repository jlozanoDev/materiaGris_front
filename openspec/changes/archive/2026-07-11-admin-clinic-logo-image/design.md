# Design: Admin Clinic Logo Upload

## Technical Approach

Separate multipart endpoint (`POST /admin/clinic/logo`) with dedicated `useClinicLogo` composable — not mixed into the existing JSON form submit. Logo renders via `{clinica.logo}` variable in `fixed_text` fields using existing `v-html` pipeline. Preview modals accept `variableResolver` prop (pattern already established by `ReportFillPage` → `DynamicFormRenderer` → `FixedTextRenderer`).

## Architecture Decisions

| # | Option | Tradeoff | Decision |
|---|--------|----------|----------|
| 1 | Extend `useClinicForm` vs new `useClinicLogo` composable | Mixed concerns: JSON form validation vs FormData upload with file-specific errors; different error handling (422 field-level vs 413/415 file-level) | **Separate composable `useClinicLogo`** — file validation, upload state, progress, logo-specific errors |
| 2 | Prop drilling `variableResolver` through preview modals vs provide/inject | Props already dominant in modal chain; injection requires setup in parent that currently lacks context | **Prop drilling** — `PrintPreviewModal` and `PreviewModal` both gain `variableResolver?: (text: string) => string` prop |
| 3 | `clinica.logo` returns raw URL vs `<img>` HTML | URL would require template author to add `<img>` manually; `FixedTextRenderer` already detects HTML and renders via `v-html` | **Return `<img>` HTML** — `<img src="URL" alt="Logo" style="max-width:100%">` when set, `""` when null |

## Data Flow

```
Upload: file → validate(MIME,5MB) → useClinicLogo.upload()
  → UploadClinicLogoUseCase(ApiClinicRepository)
    → fetchClient(POST /admin/clinic/logo, FormData)
      → clinicStore.updateLogo(url) → preview updates

Variable resolution:
{clinica.logo} → useReportVariableResolver.resolve()
  → clinicRef.value.logo ? "<img src=...>" : ""
    → FixedTextRenderer.v-html → rendered logo or empty
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/types/index.ts` | Modify | Add `logo?: string \| null` to Clinic |
| `src/modules/admin/clinic/domain/repositories/ClinicRepository.ts` | Modify | Add `uploadLogo(file: File): Promise<Clinic>` |
| `src/modules/admin/clinic/infrastructure/ApiClinicRepository.ts` | Modify | Implement multipart upload via `fetchClient` + `FormData` |
| `src/modules/admin/clinic/domain/use-cases/UploadClinicLogoUseCase.ts` | Create | Wraps `repository.uploadLogo(file)` |
| `src/modules/admin/clinic/application/containers/clinicContainer.ts` | Modify | Add `provideUploadClinicLogoUseCase()` |
| `src/modules/admin/clinic/presentation/composables/useClinicLogo.ts` | Create | File validation (MIME: png/jpeg/webp/svg+xml, max 5MB), upload, reactive state |
| `src/modules/admin/clinic/presentation/components/ClinicLogoUpload.vue` | Create | Drop zone + file picker, preview `<img>`, inline errors, upload progress, loading state |
| `src/modules/admin/clinic/presentation/pages/ClinicEditPage.vue` | Modify | Add `<ClinicLogoUpload>` section above form |
| `src/core/store/clinic.ts` | Modify | Add `updateLogo(url: string)` action |
| `src/shared/composables/useReportVariableResolver.ts` | Modify | Register `clinica.logo` resolver returning `<img>` HTML or `""` |
| `src/shared/composables/useSystemVariableRegistry.ts` | Modify | Add `clinica.logo` to `registerFallbackVariables()` |
| `src/modules/admin/report-template/presentation/components/PrintPreviewModal.vue` | Modify | Add `variableResolver` prop, pass to `ReportDocumentRenderer` |
| `src/modules/admin/report-template/presentation/components/PreviewModal.vue` | Modify | Add `variableResolver` prop, pass to `DynamicFormRenderer` |
| `src/modules/admin/report-template/presentation/components/ReportDocumentRenderer.vue` | Modify | Add `clinica.logo` to `previewVars` fallback |
| `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue` | Modify | Compute resolver with `useReportVariableResolver(clinicStore, authStore)`; pass to both previews |

## Interfaces / Contracts

```typescript
// ClinicRepository extension
uploadLogo(file: File): Promise<Clinic>

// useClinicLogo return shape
{
  selectedFile: Ref<File | null>,
  previewUrl: Ref<string | null>,
  uploading: Ref<boolean>,
  uploadError: Ref<string | null>,
  typeError: Ref<string | null>,
  sizeError: Ref<string | null>,
  validate(file: File): boolean,
  upload(file: File): Promise<void>,
  removeLogo(): void,
}

// ClinicLogoUpload props
{ logoUrl?: string | null }

// ClinicLogoUpload emits
{ upload: [file: File], remove: [] }

// Preview modals gain: variableResolver?: (text: string) => string
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `useClinicLogo` — validation (valid/invalid MIME, size), upload success/error paths | Mock `provideUploadClinicLogoUseCase`; test error messages per scenario (typeError, sizeError, uploadError) |
| Unit | `UploadClinicLogoUseCase` — delegates to mock repository | Inject mock `ClinicRepository`, verify `uploadLogo(file)` called |
| Unit | `ApiClinicRepository.uploadLogo` — FormData construction | Mock `fetchClient`, verify POST URL, body is FormData with `logo` field |
| Unit | `useReportVariableResolver` — `clinica.logo` resolution | Test with `clinic.logo = null` returns `""`, with URL returns `<img>` HTML |
| Integration | `ClinicEditPage` — logo section render + upload flow | Mount with store, simulate file selection, verify upload called |
| E2E | Upload via Playwright — drag-drop, validation errors, preview update | `page.setInputFiles` on file input; verify error messages visible; mock `/admin/clinic/logo` response |

## States & Edge Cases

| State | Behavior |
|-------|----------|
| Empty (no logo) | Drop zone with placeholder icon, no `<img>` |
| Has logo | `<img>` preview with "replace" drop zone below |
| Uploading | Progress bar, submit buttons disabled |
| Upload error (422) | Server message displayed, file retained for retry |
| Network error | "Error de conexión" toast, retry available |
| Invalid file (pre-validate) | `typeError` or `sizeError` shown inline BEFORE upload |
| Logo URL 404 (deleted from storage) | `<img>` shows broken image; admin can replace |
| SVG via `v-html` | Allowed — `FixedTextRenderer` passes through HTML; SVG has no script execution risk in `<img>` tag context |
| PDF export with logo | Backend must serve `Access-Control-Allow-Origin: *` on logo URLs (spec requirement) |

## Migration / Rollout

No migration required. All changes are additive. Rollback: remove `logo` from `Clinic` type, remove `clinica.logo` resolver, revert `clinicContainer.ts` addition.

## Open Questions

- [ ] Should `clinica.logo` `<img>` include `max-height` constraint for PDF compatibility? (spec says `max-width:100%` only)
