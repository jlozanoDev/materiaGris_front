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
