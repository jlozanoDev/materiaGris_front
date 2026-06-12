# Delta for signature-capture

## Purpose

HTML5 canvas component for capturing handwritten signatures via stylus, touch, or mouse. Stores signature as base64-encoded PNG image. Compatible with touch devices and desktops. Accessible per WCAG 2.1 AA. Canvas editability is gated by granular permission slugs (`report.edit` for draft, `report.sign` for signing).

## MODIFIED Requirements

### Requirement: Canvas Drawing Input

The system MUST provide an HTML5 `<canvas>` that captures continuous drawing strokes from pointer input, but only when the current user holds the appropriate permission.

#### Scenario: User with `report.edit` draws signature during draft

- GIVEN the signature canvas is rendered in an editable report form
- AND the current user has `report.edit` permission
- WHEN user presses mouse button, moves cursor, and releases
- THEN a visible stroke follows the cursor path
- AND the stroke renders with configurable color (default: dark blue #1a1a2e) and width (default: 2px)
- AND the base64 data updates after each stroke

#### Scenario: User WITHOUT `report.edit` or `report.sign` — canvas read-only

- GIVEN the signature canvas is rendered
- AND the current user has `report.view` but NEITHER `report.edit` nor `report.sign`
- WHEN user attempts to draw on the canvas
- THEN pointer events are blocked (canvas is read-only)
- AND if a stored signature exists, it is displayed as a static image
- AND the "Limpiar firma" button is hidden

#### Scenario: User draws signature with touch/stylus

- GIVEN the signature canvas on a touch-enabled device
- AND the current user has `report.edit` or `report.sign`
- WHEN user presses finger/stylus on canvas, drags, and lifts
- THEN the signature captures as smooth continuous strokes
- AND multi-touch is prevented (only one stroke at a time)
- AND the canvas does NOT scroll the page during drawing

#### Scenario: Signature persists across window resize

- GIVEN a signature has been drawn on canvas
- WHEN the browser window is resized
- THEN the drawn signature is preserved and scaled proportionally
- AND no data loss occurs

### Requirement: Canvas Controls

The system MUST provide controls for the canvas: clear, and a visual indicator when signature exists. Controls respect permissions.

#### Scenario: User clears signature

- GIVEN a canvas with a drawn signature
- AND the current user has `report.edit` or `report.sign`
- WHEN user clicks "Limpiar firma"
- THEN the canvas is cleared (blank)
- AND the stored base64 value is set to `null`
- AND the clear button is disabled/hidden until a new signature is drawn

#### Scenario: Empty canvas indicator

- GIVEN a blank canvas
- THEN a placeholder text "Firme dentro del recuadro" appears as watermark
- AND the stored signature value is `null`

#### Scenario: Signature present indicator

- GIVEN a canvas with at least one stroke
- THEN the watermark text disappears
- AND the stored base64 is a non-empty string
- AND the clear button becomes visible (only if user has `report.edit` or `report.sign`)

### Requirement: Base64 Storage

The system MUST encode the signature as a base64 PNG string for storage and transmission.

#### Scenario: Signature encoded on save

- GIVEN a canvas with a drawn signature
- WHEN the form saves (or auto-saves)
- THEN the canvas content is exported via `canvas.toDataURL("image/png")`
- AND the resulting base64 string is stored in `values[signature_field_key]`
- AND the base64 includes the `data:image/png;base64,` prefix

#### Scenario: Load existing signature into canvas

- GIVEN a saved report with a base64 signature string
- AND the current user has `report.view` (no edit/sign permission)
- WHEN the form renders
- THEN the canvas displays the stored signature image as a static `<img>`
- AND drawing is disabled (read-only canvas)
- AND the clear button is hidden

### Requirement: Accessibility (WCAG 2.1 AA)

The system SHALL meet WCAG 2.1 AA for the signature component.

#### Scenario: Keyboard-accessible alternative

- GIVEN a user who cannot use pointer input
- WHEN the signature field is in focus
- THEN a text input alternative SHALL be available: "Firma mecanografiada (nombre completo)"
- AND the typed signature is stored as a separate field: `values[signature_field_key + "_typed"]`
- AND the typed signature counts as valid for the signing requirement
- AND the typed signature input follows the same permission rules as the canvas

#### Scenario: Screen reader support

- GIVEN a screen reader user
- WHEN the signature canvas receives focus
- THEN the canvas announces: "Campo de firma. Dibuje dentro del recuadro o use la firma mecanografiada."
- AND the clear button announces: "Limpiar firma"

### Requirement: Browser and Device Compatibility

The system MUST work on modern browsers and devices.

#### Scenario: Touch device compatibility

- GIVEN a tablet or smartphone (iOS Safari, Android Chrome)
- WHEN user draws on the signature canvas
- THEN touch events are handled without 300ms delay
- AND the canvas prevents default touch behaviors (scroll, zoom) during drawing
- AND the signature renders at full device pixel ratio (retina/crisp)

#### Scenario: Desktop browser compatibility

- GIVEN Chrome, Firefox, Edge, or Safari (latest 2 versions)
- WHEN user draws with mouse or stylus
- THEN the canvas captures strokes correctly
- AND the toDataURL export produces valid PNG data

## ADDED Requirements

### Requirement: Permission Enforcement

The signature canvas MUST render in editable mode only when the current user holds the appropriate permission for the current lifecycle action. It MUST render read-only otherwise.

#### Scenario: Canvas editable for user with `report.edit` on draft

- GIVEN a report in DRAFT status
- AND the current user has `report.edit`
- WHEN the signature canvas mounts
- THEN `authStore.hasPermission('report.edit')` returns true
- AND the canvas accepts pointer input (drawing enabled)
- AND the "Limpiar firma" button is visible

#### Scenario: Canvas editable for user with `report.sign` during signing step

- GIVEN a user with `report.sign` who has passed validation and is in the signing flow
- AND the current user has `report.sign`
- WHEN the signature canvas is rendered
- THEN `authStore.hasPermission('report.sign')` returns true
- AND the canvas accepts pointer input

#### Scenario: Canvas read-only for user with only `report.view`

- GIVEN a report in any status
- AND the current user has `report.view` but NEITHER `report.edit` nor `report.sign`
- WHEN the signature canvas mounts
- THEN `authStore.hasPermission('report.edit')` returns false AND `authStore.hasPermission('report.sign')` returns false
- AND the canvas is read-only (pointer events disabled)
- AND a stored signature image is displayed if present
- AND "Limpiar firma" is hidden

#### Scenario: Typed signature alternative follows same permission rules

- GIVEN the typed signature input field
- WHEN the current user has only `report.view`
- THEN the input is disabled (read-only)
- WHEN the current user has `report.edit` or `report.sign`
- THEN the input is enabled and accepts text

#### Scenario: Permission checked on mount and reactively

- GIVEN the signature component
- WHEN it is mounted
- THEN it evaluates `authStore.hasPermission('report.edit')` and `authStore.hasPermission('report.sign')`
- AND derives a reactive `isEditable` flag
- AND the canvas responds to changes in this flag

## Acceptance Criteria

- Mouse, touch, and stylus input all produce visible, continuous strokes
- Clear button resets canvas and nullifies base64 value
- Signature persists across resize and is preserved in base64 format
- Empty canvas shows watermark placeholder text
- Loading existing signature renders it read-only
- Typed signature alternative available for keyboard-only users
- Canvas announces correctly for screen readers
- Compatible with latest 2 versions of Chrome, Firefox, Safari, Edge
- Canvas editable only when `authStore.hasPermission('report.edit')` OR `authStore.hasPermission('report.sign')`
- Canvas read-only when both `report.edit` and `report.sign` permissions are absent
- Typed signature follows the same permission rules as the canvas
