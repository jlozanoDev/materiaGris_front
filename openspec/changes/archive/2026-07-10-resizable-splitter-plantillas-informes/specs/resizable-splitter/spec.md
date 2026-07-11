# resizable-splitter Specification

## Purpose

Draggable boundary between center canvas and right properties panel in the report template builder. Replaces fixed-width layout with resizable split panes, persisting user preference to localStorage.

## Requirements

### Requirement: Splitter MUST separate center canvas from properties panel

The system MUST render a draggable vertical splitter between the center canvas pane and the right properties panel pane when a field is selected. The left field-type palette MUST remain fixed width (224px) with no splitter.

#### Scenario: Drag splitter to resize panels

- GIVEN a field is selected and properties panel is visible at default width
- WHEN admin drags the splitter handle right by 100px
- THEN properties panel width increases by 100px
- AND center canvas width decreases by 100px
- AND left palette width remains unchanged

#### Scenario: Splitter hidden when panel is hidden

- GIVEN no field is currently selected
- WHEN admin views the template builder
- THEN properties panel is not rendered (v-if)
- AND the splitter handle is not visible
- AND center canvas fills the remaining space

#### Scenario: No splitter between palette and canvas

- GIVEN template builder is fully loaded
- WHEN admin inspects the boundary between left palette and center canvas
- THEN no draggable splitter exists at that boundary
- AND left palette width remains fixed at 224px regardless of window resize

### Requirement: Panel width MUST persist to localStorage

The system MUST save the properties panel width to localStorage on resize. On page load, the system MUST restore the persisted width. If no stored value exists or the stored value is invalid, the system SHALL use the default 288px.

#### Scenario: Width restored after page reload

- GIVEN admin resized properties panel to 400px in a previous session
- WHEN admin reloads the template builder page
- THEN properties panel opens at 400px

#### Scenario: Default width on first visit

- GIVEN no stored width in localStorage for this user
- WHEN admin selects a field for the first time
- THEN properties panel opens at default 288px

#### Scenario: Invalid stored value falls back to default

- GIVEN localStorage contains a corrupted or non-numeric width value
- WHEN admin opens the template builder
- THEN properties panel opens at default 288px
- AND no error is shown to the user

#### Scenario: Width remembered across hide/show

- GIVEN admin resized properties panel to 350px
- WHEN admin deselects the current field (panel hides)
- AND selects a different field (panel shows again)
- THEN properties panel reopens at 350px, not default width

### Requirement: Properties panel MUST enforce minimum 200px

The splitter MUST NOT allow the properties panel to shrink below 200px. The center canvas pane MUST have a minimum of 30% of available width.

#### Scenario: Splitter stops at minimum width

- GIVEN properties panel is at 300px
- WHEN admin drags splitter left past the 200px boundary
- THEN properties panel stops at exactly 200px
- AND canvas stops expanding at that point

#### Scenario: Canvas minimum also enforced

- GIVEN properties panel has been dragged to consume most of the viewport
- WHEN admin continues dragging splitter right
- THEN center canvas stops shrinking at 30% of available space
- AND the splitter cannot be dragged further right

### Requirement: Rapid resize SHOULD debounce persistence

The system SHOULD debounce localStorage writes during rapid resize to avoid excessive writes. Visual resize MUST remain real-time; only the persistence call is debounced.

#### Scenario: Debounce during rapid drag

- GIVEN admin drags the splitter continuously across 100px
- WHEN the drag ends
- THEN a single localStorage write occurs with the final width
- AND intermediate widths are not written

### Requirement: localStorage unavailability MUST NOT break resizing

If localStorage is unavailable (private browsing, quota exceeded), the splitter SHALL still function for the current session without persistence.

#### Scenario: Resize works without localStorage

- GIVEN localStorage is not available (private browsing mode)
- WHEN admin resizes the properties panel
- THEN the panel resizes normally during the session
- AND no console errors appear
- AND no user-facing error is shown
- AND width resets to default on next page load
