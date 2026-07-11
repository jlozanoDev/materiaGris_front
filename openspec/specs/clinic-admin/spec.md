# clinic-admin Specification

## Purpose

Singleton admin page + Pinia store for clinic data. Fetch from API, display in reports, edit via form.

## Requirements

### Requirement: Clinic store MUST cache clinic data from API

The system MUST provide a Pinia clinic store (`useClinicStore`) that fetches `GET /admin/clinic` and caches the response. Store SHALL expose `clinic` (ref), `loading`, `error`, and `fetchClinic()`.

#### Scenario: Fetch on app init

- GIVEN app starts and user is authenticated
- WHEN `main.ts` calls `clinicStore.fetchClinic()`
- THEN `clinic` ref contains API response with `nombre`, `direccion`, `telefono`, etc.

#### Scenario: API returns 404 (no clinic)

- GIVEN no clinic exists in backend
- WHEN `fetchClinic()` receives 404
- THEN `clinic` is `null`, no error thrown, consumers fall back to empty defaults

#### Scenario: Unauthorized access (401)

- GIVEN token is expired
- WHEN `fetchClinic()` receives 401
- THEN `clinic` remains `null`, existing unauthorized handler triggers redirect

### Requirement: AuthUser MUST include medical professional fields

`AuthUser` interface SHALL include `apellido?`, `num_colegiado?`, `especialidad?`, `telefono?` as nullable fields.

#### Scenario: /me returns new fields

- GIVEN backend `/auth/me` includes `apellido` and `num_colegiado`
- WHEN user data is stored via `useAuthStore`
- THEN `apellido` and `num_colegiado` are accessible on `authStore.user`

#### Scenario: /me omits new fields (backward compat)

- GIVEN backend `/auth/me` does NOT include `apellido`
- WHEN user data is deserialized
- THEN `authStore.user.apellido` is `undefined` — no crash

### Requirement: Admin clinic page MUST allow editing via PUT

The system MUST provide `/admin/clinic` with an edit form for all clinic fields. On save, SHALL call `PUT /admin/clinic` with changed fields. Route MUST require `admin.clinic.update` permission.

#### Scenario: User with permission edits clinic

- GIVEN user has `admin.clinic.update` permission
- WHEN user navigates to `/admin/clinic` and submits modified fields
- THEN `PUT /admin/clinic` sends updated data, page reflects new values

#### Scenario: User without permission is blocked

- GIVEN user lacks `admin.clinic.update`
- WHEN user navigates to `/admin/clinic`
- THEN router guard redirects to dashboard

#### Scenario: Save with validation errors

- GIVEN user enters invalid email in `email` field
- WHEN `PUT /admin/clinic` returns 422
- THEN form displays inline validation errors, no save occurs, field values preserved

### Requirement: Sidebar MUST show "Clínica" entry for authorized users

`AppSidebar` SHALL display "Clínica" option in the Ajustes dropdown when user has `admin.clinic.update` permission. Router SHALL register route at `/admin/clinic`.

#### Scenario: Admin sees clinic entry

- GIVEN user has `admin.clinic.update` permission
- WHEN Ajustes dropdown opens
- THEN "Clínica" entry is visible with a building icon

#### Scenario: Non-admin does not see entry

- GIVEN user lacks `admin.clinic.update`
- WHEN Ajustes dropdown opens
- THEN "Clínica" entry is NOT rendered

### Requirement: Clinic store MUST include logo field

`Clinic` interface SHALL include `logo?: string | null`. Field stores absolute URL from backend or `null`.

#### Scenario: API returns logo

- GIVEN `GET /admin/clinic` returns `{ "logo": "https://..." }`
- WHEN `clinicStore.fetchClinic()` deserializes response
- THEN `clinicStore.clinic.logo` = `"https://..."`

### Requirement: ClinicRepository MUST expose uploadLogo method

Interface SHALL add `uploadLogo(file: File): Promise<Clinic>`. `ApiClinicRepository` SHALL implement using `fetchClient` with `FormData` (multipart, no Content-Type header — client auto-handles).

#### Scenario: Multipart upload via repository

- GIVEN `new FormData()` with `logo` field containing a `File`
- WHEN `uploadLogo(file)` is called
- THEN `fetchClient("/admin/clinic/logo", { method: "POST", body: formData })` is invoked

### Requirement: clinicContainer MUST provide UploadClinicLogoUseCase

`clinicContainer.ts` SHALL export `provideUploadClinicLogoUseCase()` that constructs `UploadClinicLogoUseCase` with `ApiClinicRepository` via DI.

#### Scenario: Use case callable from composable

- GIVEN `provideUploadClinicLogoUseCase()` returns use case
- WHEN composable calls `uploadClinicLogoUseCase.execute(file)`
- THEN repository method is invoked and `Clinic` with updated `logo` is returned

### Requirement: File input MUST accept drag-drop and click-to-browse

The system SHALL provide a drop zone accepting PNG, JPG, SVG, WebP files. The zone MUST also trigger file picker on click.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Drop valid file | Admin drags a `.png` (1MB) onto drop zone | File is dropped | Preview renders; no error shown |
| Click opens picker | Admin clicks drop zone | File picker opens | Only `image/png,image/jpeg,image/webp,image/svg+xml` shown |
| Drop invalid type | Admin drags a `.pdf` | File is dropped | `typeError` shown: "Formatos: PNG, JPG, SVG, WebP" |
| File exceeds 5MB | Admin selects a 6MB image | File is selected | `sizeError` shown: "Máximo 5 MB" |

### Requirement: Upload MUST show progress and persist via repository

The system SHALL upload via `UploadClinicLogoUseCase` using `fetchClient` with `FormData`. Upload progress MUST be shown. On success, store refreshes `clinicStore.clinic`.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Successful upload | Valid file selected | Upload completes (200) | Progress indicator dismissed; preview updates; `clinicStore.clinic.logo` set |
| Upload fails (422) | Backend rejects corrupt image | Upload returns 422 | Error message displayed; file selection retained |
| Network error | Upload request times out | `fetchClient` throws | "Error de conexión" toast; retry available |
| Replace existing logo | Clinic has a logo | Admin uploads new file | Previous logo replaced; preview shows new image |

### Requirement: Current logo MUST show as preview

If `clinicStore.clinic.logo` has a URL, an `<img>` preview SHALL render. On successful re-upload, preview MUST update to new URL.

#### Scenario: No logo shows empty state

- GIVEN clinic has no logo (`clinicStore.clinic.logo` is null)
- WHEN page renders
- THEN drop zone shows placeholder icon, no `<img>` tag

### Requirement: POST /admin/clinic/logo MUST accept multipart upload

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/admin/clinic/logo` |
| **Auth** | `Authorization: Bearer <token>` |
| **Content-Type** | `multipart/form-data` |
| **Body field** | `logo` (File, required) |
| **Accepted MIME** | `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp` |
| **Max size** | 5 MB |

**Success (200)**:
```json
{ "data": { "id": 1, "nombre": "...", "logo": "https://materiagris.test/storage/logos/1_abc123.png", ... } }
```
Returns full `Clinic` resource with updated `logo` field (absolute URL string).

**Error responses**:

| Code | Condition | Body |
|---|---|---|
| `401` | Missing/invalid token | `{ "message": "Unauthenticated." }` |
| `403` | Lacks `admin.clinic.update` | `{ "message": "This action is unauthorized." }` |
| `413` | File > 5MB | `{ "message": "File too large." }` |
| `415` | Unsupported MIME | `{ "message": "Unsupported media type." }` |
| `422` | Corrupt file or missing `logo` field | `{ "message": "...", "errors": { "logo": ["..."] } }` |

### Requirement: GET /admin/clinic MUST include logo field

Response SHALL include `logo` (string URL or `null`). Example:

```json
{ "data": { "id": 1, "nombre": "...", "logo": "https://materiagris.test/storage/logos/1_abc123.png" } }
```

When no logo uploaded: `"logo": null`.

### Requirement: Backend MUST serve logos with CORS for PDF export

| Rule | Value |
|---|---|
| **Storage path** | `storage/app/public/logos/` |
| **File naming** | `{clinic_id}_{random}.{ext}` (prevent collisions) |
| **URL generation** | Laravel `Storage::url('logos/...')` — absolute URL |
| **Cleanup on replace** | Delete previous file BEFORE storing new one |
| **CORS** | Logo URLs MUST include `Access-Control-Allow-Origin: *` header (required for `html2pdf` with `useCORS: true`) |
| **Public access** | No auth required for logo URLs (rendered in PDF exports) |

### Requirement: clinica.logo MUST be registered in useReportVariableResolver

`useReportVariableResolver` SHALL register `clinica.logo` resolver. When `clinicStore.clinic.logo` is a URL, it SHALL return `<img src="URL" alt="Logo" style="max-width:100%">`. When null, SHALL return `""`.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Logo exists | `clinic.value.logo` = `"https://..."` | `resolve("{clinica.logo}")` | Returns `<img src="https://..." alt="Logo" style="max-width:100%">` |
| Logo is null | `clinic.value` is `null` or `logo` is `null` | `resolve("{clinica.logo}")` | Returns `""` — nothing rendered |

#### Scenario: Image renders in v-html

- GIVEN `fixed_text` field contains `{clinica.logo}`
- WHEN `variableResolver` resolves to `<img>` tag
- THEN `v-html` renders the image inline in the report

### Requirement: clinica.logo MUST appear in template builder autocomplete

`registerFallbackVariables()` in `useSystemVariableRegistry` SHALL add `clinica.logo` entry with label "Logo de la clínica".

#### Scenario: Autocomplete shows logo variable

- GIVEN user types `{clinica.log` in template builder
- WHEN 150ms debounce passes
- THEN dropdown lists `clinica.logo` with "Logo de la clínica" description

### Requirement: previewVars MUST include logo fallback for previews

`PrintPreviewModal` and `PreviewModal` SHALL receive `variableResolver`. When `clinicStore.clinic` is null (preview without data), `clinica.logo` SHALL resolve to empty string — no broken image.
