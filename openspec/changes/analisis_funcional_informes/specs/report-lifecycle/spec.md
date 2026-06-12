# Delta for report-lifecycle

## Purpose

State machine managing the report workflow: Draft → Signed → Closed. Progressive validation (draft allows partial saves, signing requires completeness), permission gates per state transition, and snapshot immutability upon initialization.

## MODIFIED Requirements

### Requirement: Report Initialization with Snapshot

The system MUST capture a template snapshot when a user with `report.create` initiates a new report.

#### Scenario: User with `report.create` initiates a new report

- GIVEN a user with permission `report.create` on a patient's profile
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

The DRAFT state MUST allow saving without validating required fields. Access requires `report.edit`.

#### Scenario: Author with `report.edit` saves draft with incomplete fields

- GIVEN a report in DRAFT with 10 fields, 5 marked as required
- AND the current user is the report author AND has `report.edit`
- WHEN the user fills only 3 fields and clicks "Guardar borrador"
- THEN the save succeeds without validation errors
- AND the `values` JSON is persisted with only the 3 filled fields
- AND the report remains in DRAFT status

#### Scenario: Auto-save during draft editing

- GIVEN a user with `report.edit` editing a draft report
- WHEN any field value changes
- THEN the system SHALL auto-save after 2 seconds of inactivity
- AND a visual indicator confirms "Guardado"

#### Scenario: Draft recovery after browser crash

- GIVEN a user with `report.edit` editing a draft with unsaved changes
- WHEN the browser crashes or tab is closed unexpectedly
- THEN upon reopening, the system SHALL attempt to recover the last auto-saved state
- AND the user can continue editing from that state

### Requirement: Signing State Transition

The system MUST validate all required fields and signature before allowing draft→signed transition. Requires `report.sign`.

#### Scenario: User WITHOUT `report.sign` cannot access signing action

- GIVEN a draft report with all required fields filled
- AND the current user has `report.edit` but NOT `report.sign`
- WHEN viewing the report
- THEN the "Firmar informe" button is hidden or disabled
- AND a tooltip reads: "No tiene permiso para firmar informes"

#### Scenario: User with `report.sign` attempts to sign incomplete report

- GIVEN a user with `report.sign` who is the report author
- AND a draft report with at least one required field empty OR signature not captured
- WHEN clicking "Firmar informe"
- THEN the system SHALL display validation errors for each missing required field
- AND highlight the missing signature canvas with a red border
- AND the report remains in DRAFT status

#### Scenario: User with `report.sign` signs complete report

- GIVEN a user with `report.sign` who is the report author
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

The CLOSED state MUST render the report as strictly read-only. Closing requires `report.close`.

#### Scenario: Author with `report.close` closes a signed report

- GIVEN a user with `report.close` who is the report author
- AND a signed report
- WHEN clicking "Cerrar informe"
- THEN status changes to `cerrado`
- AND ALL form inputs become disabled (read-only)
- AND the backend SHALL reject any further mutation (`PUT`) on the closed report

#### Scenario: User WITHOUT `report.close` cannot close

- GIVEN a signed report
- AND the current user has `report.sign` but NOT `report.close`
- WHEN viewing the report
- THEN the "Cerrar informe" button is hidden or disabled

#### Scenario: Closed report viewed by user with `report.view`

- GIVEN a user with `report.view` viewing a closed report
- WHEN navigating to the report viewer
- THEN the form renders read-only
- AND the PDF download button is available (gated by `report.download-pdf`)
- AND no edit, sign, or close controls are visible

## ADDED Requirements

### Requirement: Permission Gates Per State Transition

The system SHALL enforce granular permission checks for every lifecycle action. No action is allowed based on role alone — each action requires its corresponding permission slug. The report author has implicit `report.edit` on their own draft reports ONLY when they also hold the `report.edit` slug.

#### Scenario: Author check requires `report.edit` slug

- GIVEN a draft report authored by user A
- AND user A has permission `report.edit`
- WHEN user A accesses the report edit view
- THEN `authStore.hasPermission('report.edit')` returns true
- AND the author check (`report.user_id === authStore.user.id`) passes
- AND the form renders in editable mode

#### Scenario: Author WITHOUT `report.edit` cannot edit own draft

- GIVEN a draft report authored by user A
- AND user A does NOT have permission `report.edit`
- WHEN user A accesses the report edit view
- THEN `authStore.hasPermission('report.edit')` returns false
- AND the form renders in read-only mode
- AND no save, sign, or close buttons are visible

#### Scenario: Non-author cannot edit another's draft (permission check)

- GIVEN a draft report authored by user A
- WHEN user B (who has `report.edit`) attempts to access the edit URL
- THEN the author check fails (`report.user_id !== authStore.user.id`)
- AND the system SHALL return a 403 or render read-only with message "No tiene permisos para editar este informe"

#### Scenario: Signing requires `report.sign` IN ADDITION to being the author

- GIVEN a draft report authored by user A
- AND user A has `report.edit`
- WHEN user A views the report
- THEN the "Firmar informe" button is visible ONLY if `authStore.hasPermission('report.sign')` returns true
- AND if false, the button is hidden with tooltip "No tiene permiso para firmar informes"

#### Scenario: Closing requires `report.close` IN ADDITION to being the author

- GIVEN a signed report authored by user A
- AND user A has `report.sign`
- WHEN user A views the report
- THEN the "Cerrar informe" button is visible ONLY if `authStore.hasPermission('report.close')` returns true
- AND if false, the button is hidden with tooltip "No tiene permiso para cerrar informes"

#### Scenario: User with `report.view` but without `report.edit` sees read-only

- GIVEN a user with `report.view` but WITHOUT `report.edit`
- WHEN viewing any report (draft, signed, or closed)
- THEN the form renders as read-only
- AND no save, sign, or close buttons are visible
- AND the PDF download button is visible if `report.download-pdf` and report is signed/closed

#### Scenario: User with neither `report.view` nor `report.edit` is denied access

- GIVEN a user WITHOUT `report.view` and WITHOUT `report.edit`
- WHEN attempting to access the report viewer URL
- THEN the route guard checks `meta.permissions: ['report.view', 'report.edit']` with mode `any`
- AND since neither is held, redirects to Dashboard

#### Scenario: Each state transition checks the relevant permission

- GIVEN a DRAFT report
- WHEN the save button is clicked → `report.edit` is checked
- WHEN the sign button is clicked → `report.sign` is checked
- WHEN the close button is clicked → `report.close` is checked
- AND each action independently verifies the required slug via `authStore.hasPermission()`

#### Scenario: Permission check on route guard for report views

- GIVEN the router has report routes with `meta: { permissions: ['report.view', 'report.edit'], permissionsMode: 'any' }`
- WHEN a user without either permission navigates to the URL
- THEN the `beforeEach` guard evaluates both slugs
- AND redirects to Dashboard

## Acceptance Criteria

- Report initialization captures immutable snapshot from template
- Draft saves succeed without required field validation
- Signing rejects if any required field empty OR signature missing
- Signing transitions to read-only after confirmation (requires `report.sign`)
- Closed reports are immutable (no edits, backend-enforced, requires `report.close`)
- Auto-save debounce (2s) in draft mode
- `report.edit` + author match required for editing a draft
- `report.sign` required for signing (in addition to author match)
- `report.close` required for closing (in addition to author match)
- `report.view` allows read-only access to any report
- No role-based checks ("admin" / "physician") remain — all gated by permission slugs
