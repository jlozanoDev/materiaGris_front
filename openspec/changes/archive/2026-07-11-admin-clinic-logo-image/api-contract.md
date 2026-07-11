# API Contract: Admin Clinic Logo

## POST /admin/clinic/logo

Upload a logo image for the authenticated user's clinic.

### Request

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/admin/clinic/logo` |
| **Auth** | `Authorization: Bearer <token>` — requires `admin.clinic.update` permission |
| **Content-Type** | `multipart/form-data` |
| **Body field** | `logo` (File, required) |
| **Accepted MIME types** | `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp` |
| **Max file size** | 5 MB |

### Success Response (200)

```json
{
  "data": {
    "id": 1,
    "nombre": "Mi Clínica",
    "direccion": "Av. Central 123",
    "telefono": "123456789",
    "email": "contacto@miclinica.com",
    "ciudad": "Panamá",
    "provincia": "Panamá",
    "codigo_postal": "08001",
    "web": "https://miclinica.com",
    "cuit": "30-12345678-9",
    "logo": "https://materiagris.test/storage/logos/1_abc123.png",
    "created_at": "2026-01-01T00:00:00.000000Z",
    "updated_at": "2026-07-11T12:00:00.000000Z"
  }
}
```

Returns the full `Clinic` resource with the `logo` field set to the absolute URL of the uploaded file.

### Error Responses

| Code | Condition | Body |
|---|---|---|
| `401` | Missing or invalid Bearer token | `{ "message": "Unauthenticated." }` |
| `403` | User lacks `admin.clinic.update` permission | `{ "message": "This action is unauthorized." }` |
| `413` | File exceeds 5 MB | `{ "message": "File too large." }` |
| `415` | MIME type not in accepted list | `{ "message": "Unsupported media type." }` |
| `422` | Corrupt file or missing `logo` field | `{ "message": "...", "errors": { "logo": ["..."] } }` |

### Storage Rules

| Rule | Detail |
|---|---|
| **Base path** | `storage/app/public/logos/` |
| **File naming** | `{clinic_id}_{random}.{ext}` (prevent name collisions) |
| **URL generation** | Laravel `Storage::url('logos/{filename}')` — absolute URL |
| **Cleanup on replace** | Delete previous logo file BEFORE storing the new one |
| **CORS** | Logo URLs MUST include `Access-Control-Allow-Origin: *` header (needed for `html2pdf` with `useCORS: true` in PDF export) |
| **Public access** | No auth required for logo URLs (rendered in exported PDFs) |

## GET /admin/clinic (extended)

The existing `GET /admin/clinic` endpoint SHALL now include the `logo` field in its response.

### Response (200)

Same `Clinic` resource shape as POST success. When no logo has been uploaded, `logo` is `null`:

```json
{
  "data": {
    "id": 1,
    "nombre": "Mi Clínica",
    "logo": null,
    ...
  }
}
```

## API Client Usage (Frontend Reference)

```typescript
// Upload logo (from UploadClinicLogoUseCase or composable)
const formData = new FormData()
formData.append('logo', file) // file: File (image/png|jpeg|svg+xml|webp, <=5MB)

// Note: Do NOT set Content-Type header — browser auto-sets multipart boundary
const response = await fetchClient('/admin/clinic/logo', {
  method: 'POST',
  body: formData,
})
// response is the Clinic object with updated logo URL
```
