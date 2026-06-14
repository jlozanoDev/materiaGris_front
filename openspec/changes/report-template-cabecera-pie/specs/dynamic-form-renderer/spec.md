# Delta for dynamic-form-renderer

## ADDED Requirements

### Requirement: Renderer MUST accept and render header/footer sections

The renderer SHALL accept optional props `headerSections: Section[]` and `footerSections: Section[]`. When provided, header sections render above the editable form body and footer sections render below. Both zones SHALL render all fields as read-only (no inputs). Sections with no fields SHALL render nothing.

#### Scenario: Header and footer render around form body

- GIVEN `headerSections` has 1 fixed_text field, body has 3 editable fields, `footerSections` has 1 fixed_text field
- WHEN form renders
- THEN header text appears at top as static content
- AND body fields render as editable inputs in the middle
- AND footer text appears at bottom as static content

#### Scenario: No header/footer props — no header/footer rendered

- GIVEN `headerSections` and `footerSections` are both undefined
- WHEN form renders
- THEN only body fields render — no extra space or empty containers

#### Scenario: Header with multiple field types renders read-only

- GIVEN `headerSections` has one fixed_text and one text field
- WHEN form renders
- THEN both fields display as read-only static text — no input controls
