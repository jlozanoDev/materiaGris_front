# Proposal: Admin Clinic Logo Upload

## Intent

Admins need to upload a clinic logo for reports. Without it, branded headers/footers require external tools. The logo resolves via `{clinica.logo}` in `fixed_text` fields — template authors control placement.

## Scope

### In Scope
- Logo upload (file input, drag-drop, preview) in `/admin/clinic`
- Client-side validation: PNG, JPG, SVG, WebP; max 5MB
- `clinica.logo` variable in `useReportVariableResolver`
- `logo` field in `Clinic` type and store
- Multipart upload via `POST /admin/clinic/logo`
- Variable resolver wired into `PrintPreviewModal` and `PreviewModal`
- Complete API contract + backend implementation specs

### Out of Scope
- Dedicated header-logo zone (template author controls via `fixed_text`)
- Cropping/resizing UI
- Multiple logos or per-template uploads
- Backend implementation (this proposal specifies the contract)

## Capabilities

### New Capabilities
- `clinic-logo-upload`: File upload UI with preview, drag-drop, client-side validation. Multipart upload via separate endpoint. New `UploadClinicLogoUseCase`.

### Modified Capabilities
- `clinic-admin`: Extends `Clinic` type with `logo?: string | null`. Adds `uploadLogo()` to repository interface.
- `system-variables`: Adds `clinica.logo` resolver. Registers fallback entry for autocomplete.
- `fixed-text-field`: Passes `variableResolver` through `PreviewModal` → `DynamicFormRenderer` (currently uses dummy data only).

## API Contract

**`POST /admin/clinic/logo`**
- Headers: `Authorization: Bearer <token>`, `Accept: application/json`
- Body: `multipart/form-data` — single field `logo` (File)
- Responses:
  - `200`: `{ "data": { <Clinic object with updated logo URL> } }`
  - `401`: Unauthorized
  - `403`: Missing `admin.clinic.update` permission
  - `413`: File exceeds max size
  - `415`: Unsupported media type
  - `422`: Validation errors (invalid format, corrupt file)

**Modified `GET /admin/clinic`**: Response MUST include `logo` (string URL or null).

## Backend Specs

- New `logo` column on `clinics` table (nullable string — stores relative path or null)
- `POST /admin/clinic/logo` endpoint (Auth: `auth:api`, Permission: `admin.clinic.update`)
- Store uploaded file in `storage/app/public/logos/`, generate public URL via Laravel Storage facade
- Validate: mime types `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`; max 5MB
- Return full `Clinic` resource with updated `logo` URL in `GET /admin/clinic` and `POST /admin/clinic/logo` responses
- On re-upload, delete previous logo file before storing new one

## Approach

Separate endpoint (`POST /admin/clinic/logo`, multipart FormData via `fetchClient`). Add `logo` to `Clinic` interface. New `UploadClinicLogoUseCase` + `uploadLogo()` in repository. Wire `clinica.logo` into `useReportVariableResolver` (resolves to empty string when null). Pass `variableResolver` to both preview modals.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/types/index.ts` | Modified | Add `logo?: string \| null` to Clinic |
| `src/modules/admin/clinic/domain/repositories/ClinicRepository.ts` | Modified | Add `uploadLogo(file: File): Promise<Clinic>` |
| `src/modules/admin/clinic/infrastructure/ApiClinicRepository.ts` | Modified | Implement multipart upload |
| `src/modules/admin/clinic/domain/use-cases/` | New | `UploadClinicLogoUseCase` |
| `src/modules/admin/clinic/application/containers/clinicContainer.ts` | Modified | Add `provideUploadClinicLogoUseCase()` |
| `src/modules/admin/clinic/presentation/composables/useClinicForm.ts` | Modified | Add logo state, upload logic, file validation |
| `src/modules/admin/clinic/presentation/pages/ClinicEditPage.vue` | Modified | File input, drag-drop, preview |
| `src/shared/composables/useReportVariableResolver.ts` | Modified | Register `clinica.logo` resolver |
| `src/shared/composables/useSystemVariableRegistry.ts` | Modified | Add `clinica.logo` to fallback |
| Preview modals (`PreviewModal`, `PrintPreviewModal`, `ReportDocumentRenderer`) | Modified | Accept and pass `variableResolver` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend contract mismatch (field name, URL format) | Medium | Mock API with contract defined here; validate early |
| SVG breaks html2pdf export | Low | Document SVG limitations; test before release |
| Large file payload blocks PUT endpoint (if combined) | — | Avoided: separate endpoint for logo |
| Logo URL stale after storage migration | Low | Clinic store refreshes on fetch; CDN/invalidation TBD |

## Rollback Plan

Remove `logo` field from `ClinicEditPage` form template. Revert `Clinic` type change. Remove `clinica.logo` resolver registration. All changes are additive — no data loss on rollback.

## Dependencies

- Backend: `POST /admin/clinic/logo` endpoint + `logo` field in GET response
- No external services required

## Success Criteria

- [ ] Admin uploads logo via file picker or drag-drop, sees preview
- [ ] Invalid file type/size shows inline error before upload
- [ ] Upload persists; logo URL available in `clinicStore.clinic.logo`
- [ ] `{clinica.logo}` in `fixed_text` resolves to logo in template previews
- [ ] Variable appears in autocomplete dropdown in template builder
- [ ] Existing clinic form fields unaffected by logo changes
