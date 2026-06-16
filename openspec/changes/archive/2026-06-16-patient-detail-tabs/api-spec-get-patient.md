# API Specification: GET /patients/{id}

## Overview

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **Endpoint** | `/patients/{id}` |
| **Base URL** | `import.meta.env.VITE_API_BASE_URL` (prepended by `fetchClient`) |
| **Auth** | Bearer token (Authorization header) via `fetchClient` |
| **Content-Type** | `application/json` |
| **Timeout** | 30s (handled by `fetchClient` AbortController) |
| **Version** | v1 (no version prefix in URL) |
| **Status** | ❌ Not yet implemented in backend |

---

## Request

### Headers

```
Authorization: Bearer {token}
Accept: application/json
```

- `Authorization`: Always injected by `fetchClient` from token getter
- `Accept`: Implicit via `fetchClient` JSON parsing
- `Content-Type`: Not sent (no body in GET)

### Path Parameters

| Parameter | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| `id` | integer\|string | yes | Patient unique identifier | Must correspond to an existing patient record. Frontend receives it as `number\|string` from the patient list row. |

### Query Parameters

None.

### Request Body

None (GET request).

---

## Responses

### 200 OK — Patient Found

Returns the **complete** patient record. This MUST include all fields currently used by the patient form in `PatientFormData` (lines 44-68 of `PatientsPage.vue`). The `Patient` type in `src/shared/types/index.ts` is a **subset** — do not use it as the authoritative schema.

#### Response Body Schema

```typescript
{
  // ── Identificación ──────────────────────
  id: number | string;                    // Unique identifier
  medical_record_number: string;          // NHC (Número de Historia Clínica), e.g. "HC-00027"
  national_id: string;                    // DNI/NIF, e.g. "12345678A"
  insurance_id: number | null;            // FK to insurance provider. null if unassigned.

  // ── Personal ────────────────────────────
  first_name: string;                     // REQUIRED. Patient's given name.
  last_name: string;                      // REQUIRED. First surname.
  second_last_name: string | null;        // Second surname. null if not provided.
  gender: string;                         // "M" | "F" | "other" | "" (empty string = unset)
  date_of_birth: string;                  // ISO 8601 date (YYYY-MM-DD) or empty string
  last_visit_at: string | null;           // ISO 8601 date (YYYY-MM-DD) of last visit, or null

  // ── Contacto (collapsible section) ─────
  email: string | null;                   // Email address
  phone: string | null;                   // Landline phone
  mobile: string | null;                  // Mobile phone
  contact_name: string | null;            // Emergency contact name
  contact_phone: string | null;           // Emergency contact phone

  // ── Dirección (collapsible section) ────
  address_line1: string | null;           // Street, number
  address_line2: string | null;           // Floor, door, etc.
  city: string;                           // City name
  state: string | null;                   // Province/State
  postal_code: string | null;             // Postal code
  neighborhood: string | null;            // Neighborhood/district
  country: string | null;                 // Country

  // ── Status ─────────────────────────────
  is_active: boolean;                     // Patient active status. true = active, false = inactive
}
```

#### Field Constraints

| Field | Type | Nullable | Format / Validation | Notes |
|-------|------|----------|---------------------|-------|
| `id` | integer | no | > 0 | Same type as returned in `GET /patients/find` list |
| `medical_record_number` | string | no | Free text | Displayed as "NHC" label. May follow a pattern like "HC-XXXXX" |
| `national_id` | string | no | Free text | DNI/NIF. No format enforced by frontend. |
| `insurance_id` | number | yes | integer > 0 or null | FK. Frontend casts to string when null → `""` |
| `first_name` | string | no | Non-empty | REQUIRED. Form has `required` attribute. |
| `last_name` | string | no | Non-empty | REQUIRED. Form has `required` attribute. |
| `second_last_name` | string | yes | null or string | |
| `gender` | string | no | `"M"` \| `"F"` \| `"other"` \| `""` | Select dropdown. Values come from `CustomSelect` options. |
| `date_of_birth` | string | no | `YYYY-MM-DD` or `""` | HTML `type="date"` input |
| `last_visit_at` | string | yes | `YYYY-MM-DD` or null | HTML `type="date"` input |
| `email` | string | yes | email format or null | HTML `type="email"` input |
| `phone` | string | yes | free text or null | |
| `mobile` | string | yes | free text or null | |
| `contact_name` | string | yes | free text or null | Emergency contact person name |
| `contact_phone` | string | yes | free text or null | Emergency contact phone |
| `address_line1` | string | yes | free text or null | Street + number |
| `address_line2` | string | yes | free text or null | Floor, door, additional info |
| `city` | string | no | free text | |
| `state` | string | yes | free text or null | Province or state |
| `postal_code` | string | yes | free text or null | |
| `neighborhood` | string | yes | free text or null | |
| `country` | string | yes | free text or null | |
| `is_active` | boolean | no | `true` \| `false` | Rendered as toggle switch in form header |

#### Response Body (200 OK)

```json
{
  "id": 27,
  "medical_record_number": "HC-00027",
  "national_id": "12345678A",
  "insurance_id": 3,
  "first_name": "María",
  "last_name": "García",
  "second_last_name": "López",
  "gender": "F",
  "date_of_birth": "1985-04-12",
  "last_visit_at": "2026-05-20",
  "email": "maria.garcia@email.test",
  "phone": "912345678",
  "mobile": "612345678",
  "contact_name": "Carlos García",
  "contact_phone": "698765432",
  "address_line1": "Calle Mayor 15",
  "address_line2": "2º B",
  "city": "Madrid",
  "state": "Madrid",
  "postal_code": "28013",
  "neighborhood": "Sol",
  "country": "España",
  "is_active": true
}
```

#### Notes on Response Envelope

- `fetchClient` returns the raw JSON body (line 74 of `httpClient.ts`)
- `ApiPatientRepository.search()` handles both wrapped (`{ data: [...] }`) and unwrapped (`[...]`) responses
- **This endpoint SHOULD return the object directly** (no `{ data: ... }` wrapper) for consistency with `PUT /patients/:id` and `POST /patients`, which return the object directly
- If backend wraps in `{ data: ... }`, the repository implementation will unwrap (as `search()` already does with `res?.data`)

---

### 404 Not Found — Patient Does Not Exist

Returned when the `id` parameter does not match any patient record, or the patient was soft-deleted.

#### Response Body

```json
{
  "message": "Paciente no encontrado"
}
```

#### Frontend Behavior
- `fetchClient` detects `!response.ok` (status 404) and rejects with `{ status: 404, body: { message: "Paciente no encontrado" } }`
- The `PatientDetailPage` composable catches this and shows a "patient not found" UI state
- No redirect — user stays on the detail page with an error display

#### HTTP Status Code

```
404 Not Found
```

---

### 401 Unauthorized — Missing or Invalid Token

Returned when the request lacks a valid Bearer token.

#### Response Body

```json
{
  "message": "No autenticado"
}
```

#### Frontend Behavior
- `fetchClient` intercepts 401 (line 62-70 of `httpClient.ts`)
- Calls `onUnauthorizedCallback` → redirects to `/login`
- The composable never sees this error

#### HTTP Status Code

```
401 Unauthorized
```

---

### 403 Forbidden — Insufficient Permissions

Returned when the authenticated user lacks permission to view patient details.

#### Response Body

```json
{
  "message": "No autorizado para ver este paciente"
}
```

#### Frontend Behavior
- `fetchClient` rejects with `{ status: 403, body }` 
- Composable sets error state
- UI shows "No tienes permisos para ver este paciente"

#### HTTP Status Code

```
403 Forbidden
```

---

### 500 Internal Server Error

#### Response Body

```json
{
  "message": "Error interno del servidor"
}
```

#### Frontend Behavior
- `fetchClient` rejects with `{ status: 500, body }`
- Composable sets error state
- UI shows generic error with retry option

#### HTTP Status Code

```
500 Internal Server Error
```

---

## Business Rules

| Rule | Enforcement |
|------|------------|
| **Patient must exist** | Backend returns 404 if `id` is invalid or deleted |
| **Auth required** | Backend rejects unauthenticated requests with 401 |
| **Soft-deleted patients** | Should return 404 (not 200 with deleted flag) |
| **Response completeness** | ALL form fields must be present. Missing fields cause `undefined` in `PatientFormData` and break the form. |
| **Null vs empty string** | Fields that are not set must return `null`, NOT empty string `""`. Frontend `editPatient()` already handles `null → ""` conversion (lines 298-309 of `PatientsPage.vue`). |
| **Date format** | Dates must be `YYYY-MM-DD` strings. `last_visit_at` can be `null`. |
| **Gender values** | Must match one of: `"M"`, `"F"`, `"other"`, `""`. These are the exact values used by `CustomSelect` in the form (lines 709-714). |
| **insurance_id** | Integer or `null`. Frontend converts `null` to `""` and deletes empty string on save (line 38 of `ApiPatientRepository.ts`). |

---

## Consistency with Existing Endpoints

| Aspect | `GET /patients/:id` | `GET /patients/find` | `PUT /patients/:id` | `POST /patients` |
|--------|---------------------|----------------------|---------------------|------------------|
| Auth | Bearer token | Bearer token | Bearer token | Bearer token |
| Response shape | Single object | Array or `{ data: [...] }` | Single object | Single object |
| Field set | **Complete** (all form fields) | May be subset (list view) | All form fields (body) | All form fields (body) |
| `id` field | Present | Present | In URL param | Not in body |

---

## Frontend Integration

### Repository Interface Addition

```typescript
// src/modules/patients/domain/repositories/PatientRepository.ts
export interface PatientRepository {
  search(filters: PatientSearchFilters): Promise<Patient[]>;
  getById(id: number | string): Promise<Patient>;  // ← NEW
  create(payload: Record<string, unknown>): Promise<Patient>;
  update(id: number | string, payload: Record<string, unknown>): Promise<Patient>;
}
```

### Repository Implementation

```typescript
// src/modules/patients/infrastructure/ApiPatientRepository.ts
async getById(id: number | string): Promise<any> {
  return fetchClient(`/patients/${id}`);
}
```

### Stub Contract (until backend is ready)

```typescript
async getById(id: number | string): Promise<any> {
  // STUB — remove when GET /patients/:id is implemented in backend
  console.warn(`[STUB] GET /patients/${id} — endpoint not yet implemented`);
  return {
    id,
    medical_record_number: `HC-${String(id).padStart(5, "0")}`,
    national_id: "",
    insurance_id: null,
    first_name: "",
    last_name: "",
    second_last_name: null,
    gender: "",
    date_of_birth: "",
    last_visit_at: null,
    email: null,
    phone: null,
    mobile: null,
    contact_name: null,
    contact_phone: null,
    address_line1: null,
    address_line2: null,
    city: "",
    state: null,
    postal_code: null,
    neighborhood: null,
    country: null,
    is_active: true,
  };
}
```

---

## Testing Notes

### Stub Behavior
- Returns a minimally-viable patient object with the given `id`
- All optional fields are `null`
- `is_active` defaults to `true`
- MRN follows `HC-XXXXX` pattern

### What to Test in Frontend
- [ ] `getById(id)` calls `GET /patients/{id}` with correct URL
- [ ] Response populates `PatientFormData` with all fields correctly mapped
- [ ] `null` fields render as empty inputs (not "null" text)
- [ ] 404 response shows "patient not found" UI
- [ ] 403 response shows "no permissions" UI
- [ ] Stub returns valid object for any ID

### Backend Contract Verification Checklist
- [ ] Returns 200 with all fields for valid patient ID
- [ ] Returns 404 for non-existent ID
- [ ] Returns 404 for soft-deleted patient
- [ ] Returns 401 when no/invalid token
- [ ] Returns 403 when user lacks permission
- [ ] `insurance_id` is integer or `null`, not string
- [ ] `last_visit_at` is `YYYY-MM-DD` or `null`
- [ ] `gender` is one of `"M"`, `"F"`, `"other"`, `""`
- [ ] `is_active` is boolean, not integer (0/1)
