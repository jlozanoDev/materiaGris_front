# Exploration: admin/clinic-logo-image

## Current State

### Admin Clinic Page (`/admin/clinic`)

**Route**: `src/core/router/index.ts:7` — `/admin/clinic` → `ClinicEditPage.vue`, requires `admin.clinic.update` permission.

**Page** (`ClinicEditPage.vue`): Wraps a 2-column form grid using `useClinicForm` composable. On mount, fetches clinic via `clinicStore.fetchClinic()` then calls `syncForm()` to populate reactive fields.

**Form fields** (all text/string):
| Key | Required | Max Length | Format |
|-----|----------|------------|--------|
| nombre | ✓ | 255 | — |
| direccion | ✓ | 255 | — |
| telefono | ✓ | 50 | — |
| email | ✓ | 255 | email |
| ciudad | ✓ | 255 | — |
| provincia | ✓ | 255 | — |
| codigo_postal | ✓ | 20 | — |
| web | | — | url |
| cuit | | 20 | — |

**NO image/logo field exists.** No file input, no preview area.

### Store Layer

**`useClinicStore`** (`src/core/store/clinic.ts`): Pinia setup store with `clinic` (Ref<Clinic | null>), `loading`, `error`, `fetchClinic()`. Fetched in `main.ts` on app init. Used by report pages and variable resolver.

### Clinic Entity (`src/shared/types/index.ts:20-33`)

```typescript
export interface Clinic {
  id: number | string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  web?: string | null;
  cuit?: string | null;
  created_at?: string;
  updated_at?: string;
}
```

**No `logo` field.** Adding one is a type change that cascades through the module.

### Repository Layer

**`ClinicRepository`** interface: `get(): Promise<Clinic>`, `update(data: Partial<Clinic>): Promise<Clinic>`.

**`ApiClinicRepository`**:
- `get()`: `GET /admin/clinic` via `fetchClient`, returns JSON
- `update()`: `PUT /admin/clinic` with `JSON.stringify(data)` body — always sends `application/json`

**Problem**: `update()` currently serializes everything as JSON. For a file upload, either we need a separate endpoint (e.g., `POST /admin/clinic/logo`) or change `update()` to use `FormData`/multipart when a file is present.

### HTTP Client (`src/core/api/httpClient.ts`)

Line 47-48: `if (!opts.headers["Content-Type"] && !(opts.body instanceof FormData))` — the client **already skips Content-Type when body is FormData**. This means `fetchClient` can handle multipart file uploads out of the box.

**Precedent**: `ApiReportRepository.transcribe()` (line 169-186) uses `fetchClient` with `FormData` body successfully.

### Report Previews (template builder + patient reports)

**Template preview** (`PrintPreviewModal.vue` + `ReportDocumentRenderer.vue`): Renders header, body, and footer sections. Variable interpolation via `variableResolver` prop. Header/footer zones are ideal locations for a clinic logo.

**Patient report view** (`ReportViewPage.vue`): Uses `DynamicFormRenderer` with read-only mode. Variables resolved via `useReportVariableResolver`.

**Patient report fill** (`ReportFillPage.vue`): Uses `DynamicFormRenderer` with editable mode. Same variable resolver.

**PDF export** (`ReportPdfExport.vue`): Renders to hidden div for html2pdf generation. Uses `clinicStore.clinic` via `useReportVariableResolver`.

### Variable Resolution System

**`useReportVariableResolver`** (`src/shared/composables/useReportVariableResolver.ts`): Registers `clinica.*` variables from `clinicStore.clinic`. Currently registered: nombre, direccion, telefono, email, ciudad, provincia, codigo_postal, web, cuit.

**NO `clinica.logo` variable.** Adding one requires registering in the resolver with a URL or base64 data URL value.

**`SystemVariableRegistry`** (`src/shared/types/SystemVariableRegistry.ts`): Maps `category.key` → resolver function. Adding `clinica.logo` means registering a new entry.

**`FixedTextRenderer.vue`**: Renders resolved content via `v-html`. If the resolved text contains `<img src="...">`, it renders as HTML. This means a logo could be injected into a `fixed_text` field by including `{clinica.logo}` — but only if it resolves to an `<img>` tag or a URL that can be rendered.

**`ReportDocumentRenderer.vue`**: Already has a `signatureUrl` prop that renders an `<img>` in the footer zone (lines 212-217). This is a strong precedent for rendering images in report documents.

### Existing Image/Upload Patterns

| Pattern | Location | Mechanism | Body Format |
|---------|----------|-----------|-------------|
| Signature (canvas) | `SignaturePad.vue` | `canvas.toDataURL('image/png')` → stored as string in `values._signature` | JSON string |
| Audio upload (AI) | `useReportAI.ts` | `FormData` with `File` → `fetchClient` | multipart |
| PDF upload (archive) | `ApiReportRepository.archive()` | `FormData` with `Blob` → raw `fetch()` | multipart |

**No generic image upload component or composable exists.** The closest pattern is the audio upload flow.

**Key pattern for file input + preview**: Not found. The `SignaturePad` has preview (`<img :src="modelValue">`) but it's canvas-based, not file-based.

## API Contracts

### Current GET /admin/clinic

Expected response (inferred from `Clinic` type and `useClinicForm` usage):
```json
{
  "id": 1,
  "nombre": "Clínica Test",
  "direccion": "Calle 123",
  "telefono": "123456789",
  "email": "test@clinica.com",
  "ciudad": "Buenos Aires",
  "provincia": "CABA",
  "codigo_postal": "1000",
  "web": "https://clinica.com",
  "cuit": "30-12345678-9",
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z"
}
```

**No `logo` field in response.** Backend would need to add this field.

### Current PUT /admin/clinic

Body: `application/json` with `Partial<Clinic>` fields.

```json
{
  "nombre": "...",
  "direccion": "...",
  ...
}
```

### What the backend needs to support for logo upload

**Option A — Separate endpoint**: `POST /admin/clinic/logo` (multipart, single file). Simpler, doesn't change existing contract.

**Option B — Multipart PUT**: `PUT /admin/clinic` with `multipart/form-data` containing both JSON fields and the logo file. More complex but atomic.

**Unknown**: The actual backend implementation. This exploration can only document what the frontend expects — actual API changes must be coordinated with backend.

## Gap Analysis

| Gap | Severity | Description |
|-----|----------|-------------|
| No `logo` field in `Clinic` type | Blocker | Type definition must be extended before any UI work |
| No image/file upload component | High | Must build or adapt from scratch — no existing pattern |
| No `clinica.logo` variable in resolver | Medium | Must be registered for report variable interpolation |
| No image preview in ClinicEditPage | Medium | Upload needs preview confirmation |
| `ApiClinicRepository.update()` only sends JSON | High | Must handle multipart when file is present, OR use separate endpoint |
| No form field for file in `useClinicForm` | Medium | File validation differs from string validation |
| Header/footer renderers don't support image fields | Medium | Current fixed_text can embed `<img>` via HTML, but no dedicated image field type in report templates |

## Affected Files

### Must Change (Core)
| File | Change |
|------|--------|
| `src/shared/types/index.ts` | Add `logo?: string \| null` to `Clinic` interface |
| `src/modules/admin/clinic/domain/entities/Clinic.ts` | Re-exports from shared types — auto-updated |
| `src/modules/admin/clinic/domain/repositories/ClinicRepository.ts` | May need `uploadLogo(file): Promise<Clinic>` method if separate endpoint |
| `src/modules/admin/clinic/infrastructure/ApiClinicRepository.ts` | Add multipart handling for logo upload |
| `src/core/store/clinic.ts` | No changes needed (fetches whole clinic object) |

### Must Change (Presentation)
| File | Change |
|------|--------|
| `src/modules/admin/clinic/presentation/composables/useClinicForm.ts` | Add logo field to form, add upload logic, add file validation |
| `src/modules/admin/clinic/presentation/pages/ClinicEditPage.vue` | Add file input + image preview to form |
| `src/shared/composables/useReportVariableResolver.ts` | Register `clinica.logo` variable |
| `src/modules/admin/clinic/application/containers/clinicContainer.ts` | May need new `provideUploadLogoUseCase()` |

### Should Change (Report Previews)
| File | Change |
|------|--------|
| `src/modules/admin/report-template/presentation/components/ReportDocumentRenderer.vue` | Consider adding `clinicLogoUrl` prop for dedicated rendering |
| `src/modules/reports/presentation/components/ReportPdfExport.vue` | Pass clinic logo URL to renderer |
| `src/shared/types/SystemVariableRegistry.ts` | No changes needed — extensible by design |

### Must Change (Tests)
| File | Change |
|------|--------|
| `src/modules/admin/clinic/presentation/composables/__tests__/useClinicForm.spec.ts` | Add file upload test cases |
| `src/modules/admin/clinic/presentation/pages/__tests__/ClinicEditPage.spec.ts` | Add logo upload/render tests |

## Architecture Notes

### Hexagonal Layer Considerations

1. **Domain layer**: Add `logo?: string | null` to `Clinic` entity. If separate endpoint, add `uploadLogo(file: File): Promise<Clinic>` to `ClinicRepository` interface and `UploadClinicLogoUseCase`.

2. **Infrastructure layer**: `ApiClinicRepository` needs to handle file upload. Two patterns exist in the codebase:
   - `fetchClient` with `FormData` (used by `ApiReportRepository.transcribe()`) — works because `httpClient.ts` skips Content-Type for FormData
   - Raw `fetch()` with FormData (used by `ApiReportRepository.archive()`) — for when `fetchClient` abstraction is insufficient

   **Recommendation**: Use `fetchClient` with FormData — it already supports it and keeps the architecture clean.

3. **Application layer**: Container `clinicContainer.ts` may need a new `provideUploadClinicLogoUseCase()`.

4. **Presentation layer**: `useClinicForm` needs file handling. The existing form uses `reactive` with string fields — adding a `File | null` ref for the logo is the simplest approach.

### Separate vs Combined Update

**Question**: Should logo upload be part of the existing PUT or a separate endpoint?

**Analysis**:
- Combined approach (multipart PUT): Atomic (no partial state), but changes the contract of `update()` and requires backend changes
- Separate endpoint (`POST /admin/clinic/logo`): No contract change to existing endpoints, easier to implement incrementally, simpler error handling

**Recommendation**: Start with a **separate endpoint** approach. This is the path of least resistance and matches existing patterns in the codebase (sign reports is separate from save draft, transcribe is separate). Can be refactored later if needed.

## Risks & Unknowns

1. **Backend API is unknown**: This exploration can only infer from frontend usage. Actual API changes (new endpoints, new fields in responses) must be confirmed with backend team. The `logo` field path in GET response (e.g., `logo`, `logo_url`, `imagen`) is unknown.

2. **Logo rendering mechanism in reports**: Currently `fixed_text` fields support HTML via `v-html`, so `{clinica.logo}` could resolve to `<img src="...">`. However, this is fragile — the logo URL would need to be an absolute URL. Better: dedicated `<img>` rendering in `ReportDocumentRenderer` header zone, similar to how signature works in footer.

3. **File size limits**: Unknown. Backend may impose restrictions. Frontend should add client-side size validation (e.g., max 2MB).

4. **Image format support**: Should accept common formats (PNG, JPEG, WebP, SVG). SVG may need special handling for PDF export (html2pdf compatibility).

5. **PDF export compatibility**: `html2pdf` with `useCORS: true` (already configured in `useReportPdf.ts`) should handle external image URLs. However, data: URIs and relative paths may fail. The logo URL must be an absolute URL or a data: URI.

6. **Cache invalidation**: If the logo URL changes on update, the `clinicStore` must reflect the new URL immediately. The current `fetchClinic()` pattern handles this.

7. **No existing image file input component**: A new UI pattern must be created. Should follow existing Tailwind styling and form component conventions.

## Recommendations

### Architecture Decision: Separate endpoint for logo upload

**Rationale**:
- Does not change the existing `PUT /admin/clinic` contract (backward compatible)
- Matches existing patterns (signing is separate from saving, transcribing is separate)
- Simpler error handling — text fields and file uploads fail independently
- Easier to test in isolation

**Implementation path**:
1. Add `POST /admin/clinic/logo` (or `PUT`, depending on backend decision)
2. Body: `multipart/form-data` with single file field (e.g., `logo`)
3. Response: updated `Clinic` object with new `logo` URL

### Phase Plan

**Phase 1 — Core (clinic module)**
- Add `logo` field to `Clinic` type
- Add `uploadLogo(file: File)` to `ClinicRepository` interface
- Implement in `ApiClinicRepository` using `fetchClient` + `FormData`
- Create `UploadClinicLogoUseCase` and container provider
- Update `useClinicForm`: add logo file state, upload logic, file validation
- Update `ClinicEditPage.vue`: add file input with preview

**Phase 2 — Variable Registration**
- Register `clinica.logo` in `useReportVariableResolver`
- Ensure it resolves to the logo URL stored in `clinicStore.clinic`

**Phase 3 — Report Rendering**
- Add logo rendering to `ReportDocumentRenderer` header zone (similar to signature in footer)
- Pass `clinicLogoUrl` prop through `ReportPdfExport` → `ReportDocumentRenderer`
- Ensure compatibility with `html2pdf` via `useCORS: true`

**Phase 4 — Tests**
- Unit tests for `useClinicForm` with file upload
- Unit tests for `UploadClinicLogoUseCase`
- Component tests for `ClinicEditPage` with logo preview
- Verify variable resolution in report renderer tests

### Rollback Plan
- The `Clinic` type change is additive (optional `logo?`), so rollback is safe
- If logo upload fails, clinic text fields are unaffected
- Remove the file input + preview from `ClinicEditPage` to revert UI
