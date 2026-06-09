# Delta for report-lifecycle

## Purpose

State machine managing the report workflow: Draft → Signed → Closed. Progressive validation (draft allows partial saves, signing requires completeness), permission gates per state transition, and snapshot immutability upon initialization.

## MODIFIED Requirements

### Requirement: Report Initialization with Snapshot

The system MUST capture a template snapshot when a user with `reports.create` initiates a new report.

#### Scenario: User with `reports.create` initiates a new report

- GIVEN a user with permission `reports.create` on a patient's profile
- AND an active template is available
- WHEN the user selects a template and clicks "Nuevo informe"
- THEN the backend creates a `patient_reports` record with `template_structure_snapshot` copied from the template
- AND the snapshot is immutable — subsequent template edits do not affect this report
- AND the report starts in DRAFT status

#### Scenario: Template deactivated after report initiation

- GIVEN a report was initiated from template T while T was active
- WHEN admin later deactivates template T
- THEN the existing report remains accessible and fully functional
- AND the snapshot is unaffected

### Requirement: Draft State (Partial Saves)

The DRAFT state MUST allow saving without validating required fields. Access requires `reports.edit`.

#### Scenario: Author with `reports.edit` saves draft with incomplete fields

- GIVEN a report in DRAFT with 10 fields, 5 marked as required
- AND the current user is the report author AND has `reports.edit`
- WHEN the user fills only 3 fields and clicks "Guardar borrador"
- THEN the save succeeds without validation errors
- AND the `values` JSON is persisted with only the 3 filled fields
- AND the report remains in DRAFT status

#### Scenario: Auto-save during draft editing

- GIVEN a user with `reports.edit` editing a draft report
- WHEN any field value changes
- THEN the system SHALL auto-save after 2 seconds of inactivity
- AND a visual indicator confirms "Guardado"

#### Scenario: Draft recovery after browser crash

- GIVEN a user with `reports.edit` editing a draft with unsaved changes
- WHEN the browser crashes or tab is closed unexpectedly
- THEN upon reopening, the system SHALL attempt to recover the last auto-saved state
- AND the user can continue editing from that state

### Requirement: Signing State Transition

The system MUST validate all required fields and signature before allowing draft→signed transition. Requires `reports.sign`.

#### Scenario: User WITHOUT `reports.sign` cannot access signing action

- GIVEN a draft report with all required fields filled
- AND the current user has `reports.edit` but NOT `reports.sign`
- WHEN viewing the report
- THEN the "Firmar informe" button is hidden or disabled
- AND a tooltip reads: "No tiene permiso para firmar informes"

#### Scenario: User with `reports.sign` attempts to sign incomplete report

- GIVEN a user with `reports.sign` who is the report author
- AND a draft report with at least one required field empty OR signature not captured
- WHEN clicking "Firmar informe"
- THEN the system SHALL display validation errors for each missing required field
- AND highlight the missing signature canvas with a red border
- AND the report remains in DRAFT status

#### Scenario: User with `reports.sign` signs complete report

- GIVEN a user with `reports.sign` who is the report author
- AND a draft report where ALL required fields are filled AND signature is captured
- WHEN clicking "Firmar informe"
- THEN the system SHALL display a confirmation dialog: "¿Confirmar firma? No podrá editar después."
- WHEN user confirms
- THEN the backend sets status to `firmado`
- AND the frontend transitions the form to read-only mode
- AND a success message displays: "Informe firmado correctamente"

#### Scenario: Signature validation before signing

- GIVEN a canvas with no strokes (empty signature)
- WHEN attempting to sign
- THEN the system SHALL reject: "La firma es obligatoria para firmar el informe"

### Requirement: Closed State (Immutable)

The CLOSED state MUST render the report as strictly read-only. Closing requires `reports.close`.

#### Scenario: Author with `reports.close` closes a signed report

- GIVEN a user with `reports.close` who is the report author
- AND a signed report
- WHEN clicking "Cerrar informe"
- THEN status changes to `cerrado`
- AND ALL form inputs become disabled (read-only)
- AND the backend SHALL reject any further mutation (`PUT`) on the closed report

#### Scenario: User WITHOUT `reports.close` cannot close

- GIVEN a signed report
- AND the current user has `reports.sign` but NOT `reports.close`
- WHEN viewing the report
- THEN the "Cerrar informe" button is hidden or disabled

#### Scenario: Closed report viewed by user with `reports.view`

- GIVEN a user with `reports.view` viewing a closed report
- WHEN navigating to the report viewer
- THEN the form renders read-only
- AND the PDF download button is available (gated by `reports.download-pdf`)
- AND no edit, sign, or close controls are visible

## ADDED Requirements

### Requirement: Permission Gates Per State Transition

The system SHALL enforce granular permission checks for every lifecycle action. No action is allowed based on role alone — each action requires its corresponding permission slug. The report author has implicit `reports.edit` on their own draft reports ONLY when they also hold the `reports.edit` slug.

#### Scenario: Author check requires `reports.edit` slug

- GIVEN a draft report authored by user A
- AND user A has permission `reports.edit`
- WHEN user A accesses the report edit view
- THEN `authStore.hasPermission('reports.edit')` returns true
- AND the author check (`report.user_id === authStore.user.id`) passes
- AND the form renders in editable mode

#### Scenario: Author WITHOUT `reports.edit` cannot edit own draft

- GIVEN a draft report authored by user A
- AND user A does NOT have permission `reports.edit`
- WHEN user A accesses the report edit view
- THEN `authStore.hasPermission('reports.edit')` returns false
- AND the form renders in read-only mode
- AND no save, sign, or close buttons are visible

#### Scenario: Non-author cannot edit another's draft (permission check)

- GIVEN a draft report authored by user A
- WHEN user B (who has `reports.edit`) attempts to access the edit URL
- THEN the author check fails (`report.user_id !== authStore.user.id`)
- AND the system SHALL return a 403 or render read-only with message "No tiene permisos para editar este informe"

#### Scenario: Signing requires `reports.sign` IN ADDITION to being the author

- GIVEN a draft report authored by user A
- AND user A has `reports.edit`
- WHEN user A views the report
- THEN the "Firmar informe" button is visible ONLY if `authStore.hasPermission('reports.sign')` returns true
- AND if false, the button is hidden with tooltip "No tiene permiso para firmar informes"

#### Scenario: Closing requires `reports.close` IN ADDITION to being the author

- GIVEN a signed report authored by user A
- AND user A has `reports.sign`
- WHEN user A views the report
- THEN the "Cerrar informe" button is visible ONLY if `authStore.hasPermission('reports.close')` returns true
- AND if false, the button is hidden with tooltip "No tiene permiso para cerrar informes"

#### Scenario: User with `reports.view` but without `reports.edit` sees read-only

- GIVEN a user with `reports.view` but WITHOUT `reports.edit`
- WHEN viewing any report (draft, signed, or closed)
- THEN the form renders as read-only
- AND no save, sign, or close buttons are visible
- AND the PDF download button is visible if `reports.download-pdf` and report is signed/closed

#### Scenario: User with neither `reports.view` nor `reports.edit` is denied access

- GIVEN a user WITHOUT `reports.view` and WITHOUT `reports.edit`
- WHEN attempting to access the report viewer URL
- THEN the route guard checks `meta.permissions: ['reports.view', 'reports.edit']` with mode `any`
- AND since neither is held, redirects to Dashboard

#### Scenario: Each state transition checks the relevant permission

- GIVEN a DRAFT report
- WHEN the save button is clicked → `reports.edit` is checked
- WHEN the sign button is clicked → `reports.sign` is checked
- WHEN the close button is clicked → `reports.close` is checked
- AND each action independently verifies the required slug via `authStore.hasPermission()`

#### Scenario: Permission check on route guard for report views

- GIVEN the router has report routes with `meta: { permissions: ['reports.view', 'reports.edit'], permissionsMode: 'any' }`
- WHEN a user without either permission navigates to the URL
- THEN the `beforeEach` guard evaluates both slugs
- AND redirects to Dashboard

## Acceptance Criteria

- Report initialization captures immutable snapshot from template
- Draft saves succeed without required field validation
- Signing rejects if any required field empty OR signature missing
- Signing transitions to read-only after confirmation (requires `reports.sign`)
- Closed reports are immutable (no edits, backend-enforced, requires `reports.close`)
- Auto-save debounce (2s) in draft mode
- `reports.edit` + author match required for editing a draft
- `reports.sign` required for signing (in addition to author match)
- `reports.close` required for closing (in addition to author match)
- `reports.view` allows read-only access to any report
- No role-based checks ("admin" / "physician") remain — all gated by permission slugs
