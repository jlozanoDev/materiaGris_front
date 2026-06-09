# Design: Módulo de Informes Dinámicos

## Technical Approach

Two new hexagonal modules extend the codebase, following the existing `domain/infrastructure/application/presentation` layer convention. `admin/tipo-informe` expands the existing skeleton with template CRUD + visual builder. `reports` is a new module for filling, signing, and closing reports. Shared drag-drop zones and a conditional logic engine live in `src/shared/`. The builder produces a JSON tree consumed by a runtime dynamic form renderer that maps field types to Vue components. Snapshot versioning ensures historical immutability.

**Every action, route, and UI element is gated by granular permission slugs** — checked via `authStore.hasPermission(slug)`, the `v-has-permission` directive, or route `meta.permissions`. No role-based checks anywhere.

## Permission Model (CRITICAL — supersedes any role-based approach)

### Slug Reference

| Permission Slug | Gates |
|---|---|
| `admin.report-template.view` | Template listing route + sidebar link |
| `admin.report-template.create` | "Nueva plantilla de informe" button |
| `admin.report-template.edit` | Edit button, builder write ops |
| `admin.report-template.delete` | Delete button, delete action |
| `reports.create` | "Nuevo informe" initiation |
| `reports.view` | Report listing route, viewer route, sidebar link |
| `reports.edit` | Draft fill/edit mode in DynamicFormRenderer |
| `reports.sign` | "Firmar" button + signing transition |
| `reports.close` | "Cerrar" button + closing transition |
| `reports.download-pdf` | "Descargar PDF" button |

### Permission Check Patterns (from existing codebase)

1. **Route guard** — `meta: { requiresAuth: true, permissions: 'slug' }` (string) or `permissions: ['a', 'b']` with `permissionsMode: 'any' | 'all'` (array). `beforeEach` calls `authStore.hasPermission()` / `authStore.hasPermissions()`.
2. **Template visibility** — `v-if="authStore.hasPermission('slug')"` (Vue reactivity) or `v-has-permission="'slug'"` (directive, sets `display:none`).
3. **Composable/store** — call `authStore.hasPermission(slug)` programmatically to gate logic.

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Drag-drop library | `vuedraggable@next` | Mature Vue 3 support, nested list capability. `vue-draggable-plus` is lighter but less battle-tested for 4-level nesting. |
| Signature capture | Vanilla Canvas API (`<canvas>`) | Direct Canvas 2D API is ~50 lines. `signature_pad` adds indirection without value. |
| Conditional logic engine | Custom AST parser/evaluator | No `eval()`, no `new Function()`. Whitelisted operators only. Scope is form values keyed by field `key`. |
| Form renderer strategy | Flat recursive component tree (`DynamicField` renders itself + children) | Simpler than nested recursion. Each field type maps to a concrete component via a lookup map. |
| Builder undo/redo | Pinia store with command stack | Pushing command objects with inverse is simpler than full state snapshots for large templates. |
| Auto-save | Debounced PUT via `watch` on form values | 2-second debounce in composable. Prevents excessive API calls during rapid typing. |
| **Permission enforcement** | `authStore.hasPermission(slug)` + `v-has-permission` + `meta.permissions` | Follows existing project patterns in `auth.ts`, `AppSidebar.vue`, router `beforeEach`, and `v-has-permission.ts` directive. Zero new infrastructure needed. |

## Domain Model

```typescript
// === shared/types/index.ts additions ===

export type FieldType =
  | 'text' | 'textarea' | 'date' | 'datetime' | 'select'
  | 'radio' | 'checkbox' | 'dynamic_table' | 'signature' | 'number';

export type ReportStatus = 'draft' | 'signed' | 'closed';

export interface FieldOption { label: string; value: string; }

export interface ConditionalRule {
  sourceFieldKey: string;
  operator: '==' | '!=' | 'contains' | '>' | '<' | '>=' | '<=';
  value: string | number | boolean;
}

export interface FieldConfig {
  key: string; label: string; type: FieldType;
  placeholder?: string; required: boolean;
  options?: FieldOption[]; columns?: FieldConfig[]; // dynamic_table sub-fields
  systemVariable?: string; conditionalRule?: ConditionalRule;
  defaultValue?: unknown;
}

export interface Column { id: string; width: number; fields: FieldConfig[]; }
export interface Row { id: string; columns: Column[]; }
export interface Section { id: string; title: string; type: 'tab' | 'accordion'; rows: Row[]; }
export interface ReportTemplate { id: string; name: string; description: string; is_active: boolean; structure: Section[]; }

export interface PatientReport {
  id: string; patient_id: string; user_id: string;
  status: ReportStatus; template_structure_snapshot: Section[];
  values: Record<string, unknown>; signature?: string; // base64 PNG
  template_name: string; created_at: string; updated_at: string;
}
```

## Module Structure

```
src/modules/admin/report-template/
  domain/                            # Entities, repository interface, 5 use cases
  infrastructure/ApiReportTemplateRepository.ts  # fetchClient-based CRUD
  application/containers/reportTemplateContainer.ts
  presentation/
    composables/useReportTemplate.ts    # CRUD list + single
    composables/useTemplateBuilder.ts # Pinia store for builder state
    pages/ReportTemplateListPage.vue    # replaces current placeholder
    pages/ReportTemplateBuilderPage.vue # drag-drop builder
    components/TemplateBuilderToolbar.vue
    components/SectionPanel.vue, DroppableRow.vue, DroppableColumn.vue,
    components/DroppableField.vue, FieldPropertiesPanel.vue, ConditionalRuleEditor.vue

src/modules/reports/
  domain/                            # Entities, repository interface, 6 use cases
  infrastructure/ApiReportRepository.ts  # fetchClient (CRUD + sign + close + pdf)
  application/containers/reportsContainer.ts
  presentation/
    composables/useReportForm.ts     # Pinia store: form values, dirty, validation
    composables/useReportList.ts     # admin listing
    pages/ReportFillPage.vue, ReportViewPage.vue, ReportListPage.vue
    components/DynamicFormRenderer.vue, DynamicField.vue, DynamicTable.vue,
    components/SignaturePad.vue, ReportStatusBadge.vue

src/shared/components/
  plugins/ConditionalLogicEngine.ts  # parser + evaluator (no Vue dependency)
```

## Route Definitions with Permission Guards

| Route | Component | `meta.permissions` | Notes |
|---|---|---|---|
| `/admin/report-templates` | `ReportTemplateListPage` | `'admin.report-template.view'` | Template listing |
| `/admin/report-templates/nuevo` | `ReportTemplateBuilderPage` | `'admin.report-template.create'` | New template builder |
| `/admin/report-templates/:id/editar` | `ReportTemplateBuilderPage` | `'admin.report-template.edit'` | Edit existing template |
| `/informes` | `ReportListPage` | `'reports.view'` | Report admin listing |
| `/informes/:id` | `ReportViewPage` | `'reports.view'` | Read-only viewer |
| `/informes/:id/editar` | `ReportFillPage` | `['reports.edit']` | Draft fill/edit |
| `/pacientes/:id/informe/nuevo` | `ReportFillPage` | `'reports.create'` | Initiate new report |

All routes set `meta: { requiresAuth: true }`. The `beforeEach` guard (in `src/core/router/index.ts`) already evaluates `meta.permissions` per the existing pattern — no changes to the guard logic needed.

## Permission Enforcement Points

### 1. Route Guards

Every route uses the existing `meta.permissions` pattern (string or array). The router `beforeEach` calls `authStore.hasPermission()` / `authStore.hasPermissions()` automatically. On failure → redirect to Dashboard.

### 2. UI Element Visibility — Template Builder

| Element | Permission Check | Pattern |
|---|---|---|
| "Nueva plantilla de informe" button | `admin.report-template.create` | `v-if="authStore.hasPermission('admin.report-template.create')"` |
| Edit button (per row) | `admin.report-template.edit` | `v-if="authStore.hasPermission('admin.report-template.edit')"` |
| Delete button (per row) | `admin.report-template.delete` | `v-if="authStore.hasPermission('admin.report-template.delete')"` |

### 3. UI Element Visibility — Reports

| Element | Permission Check | Context |
|---|---|---|
| "Nuevo informe" button | `reports.create` | Patient profile page |
| "Guardar borrador" button | `reports.edit` | Draft fill page |
| "Firmar" button | `reports.sign` | Draft fill page (after validation passes) |
| "Cerrar" button | `reports.close` | Signed report |
| "Descargar PDF" button | `reports.download-pdf` | Signed/closed report (and status is not draft) |

### 4. DynamicFormRenderer — Permission Check on Mount

```typescript
// DynamicFormRenderer.vue — onMounted
const isEditable = ref(false);

onMounted(() => {
  const authStore = useAuthStore();
  isEditable.value = authStore.hasPermission('reports.edit');

  if (!authStore.hasPermission('reports.edit') && !authStore.hasPermission('reports.view')) {
    // Should not reach here due to route guard, but defense in depth
    router.push({ name: 'Dashboard' });
  }
});
```

- `isEditable = true` → all inputs enabled, action buttons visible (further gated individually)
- `isEditable = false` (only `reports.view`) → all inputs `:disabled`, no action buttons

### 5. Report Lifecycle State Machine — Transition Checks

Each transition checks **author match** (`report.user_id === authStore.user.id`) AND the **specific permission slug**:

| Transition | Permission | Author Check | Additional |
|---|---|---|---|
| `init → draft` | `reports.create` | Yes (creator becomes author) | Snapshot captured |
| `draft → save` (draft) | `reports.edit` | Yes | No required-field validation |
| `draft → signed` | `reports.sign` | Yes | All required + signature validated |
| `signed → closed` | `reports.close` | Yes | Immutable after |
| Any status → read-only | `reports.view` | No | View-only mode |

If author check fails but user has permission: display read-only with toast "No tiene permisos para editar este informe".

### 6. Pinia Store Actions

`useReportForm` store actions call `authStore.hasPermission()` before mutating:

```typescript
function autoSave(): Promise<void> {
  const authStore = useAuthStore();
  if (!authStore.hasPermission('reports.edit')) return; // silently skip
  // ... save logic
}

function sign(): Promise<void> {
  const authStore = useAuthStore();
  if (!authStore.hasPermission('reports.sign')) {
    throw new Error('No tiene permiso para firmar informes');
  }
  if (report.value?.user_id !== authStore.user?.id) {
    throw new Error('Solo el autor puede firmar');
  }
  // ... sign logic
}
```

`useTemplateBuilder` store: save operation checks `admin.report-template.edit` before calling API.

### 7. Sidebar/Navigation Entries

In `AppSidebar.vue`, inside the settings dropdown (following the existing pattern for `admin.report-template.view`):

```html
<!-- Already exists: -->
<li v-if="authStore.hasPermission('admin.report-template.view')">
  <!-- Plantillas de informes link -->
</li>

<!-- NEW — Reports listing (separate from admin settings, may go in main nav or patient context): -->
<li v-if="authStore.hasPermission('reports.view')">
  <!-- Informes link -->
</li>
```

### 8. Error Handling on Permission Denial

| Context | Failure Behavior |
|---|---|
| Route guard denies access | Redirect to Dashboard (existing `beforeEach` behavior) |
| Action button hidden via `v-if` | Element not in DOM — no user confusion |
| Action button disabled + tooltip | Button renders `disabled` with `title="No tiene permiso para X"` |
| Store action denied (defense in depth) | Throw error caught by composable → toast "No tiene permisos suficientes" |
| Author mismatch on edit | Toast "No tiene permisos para editar este informe" + form renders read-only |

## Component Architecture — Dynamic Form Rendering

Flat recursive strategy: `DynamicFormRenderer` receives `Section[]`, iterates sections → rows → columns → fields. Each field delegates to `DynamicField` which uses a type→component map:

```
ReportFillPage
  └─ DynamicFormRenderer  (props: sections, modelValue: values, isEditable)
       ├─ v-for="section in visibleSections"
       │    └─ section wrapper (Tab/Accordion)
       │         └─ v-for="row in section.rows"
       │              └─ v-for="col in row.columns"
       │                   └─ DynamicField (:disabled="!isEditable")
       │                        ├─ TextField / SelectField / ...
       │                        └─ DynamicTable (special case)
       └─ SignaturePad (:disabled="!canEditSignature")
```

Data flow: `v-model` binds `values: Record<string, unknown>` deeply. Conditional rules emit field visibility computed per field via `ConditionalLogicEngine.evaluate(rule, allValues)`. `isEditable` prop flows down from permission check on mount.

## State Management — Pinia Stores

### useTemplateBuilder (admin/tipo-informe)

Setup store with `sections`, `selectedFieldId`, `undoStack`, `redoStack`, `isDirty`. All mutation functions (`addSection`, `removeSection`, etc.) are called only when the user has `admin.report-template.edit` (UI already hides controls if not). Save action double-checks `authStore.hasPermission('admin.report-template.edit')`.

### useReportForm (reports)

Setup store with `report`, `values`, `dirtyFields`, `errors`, `isSaving`, `autoSaveEnabled`. `init()` loads values from snapshot. `setValue()` marks field dirty. `validateForSignature()` checks required fields + signature presence. `autoSave()` debounced 2s, internally checks `reports.edit`. Sign and close actions check `reports.sign` / `reports.close` respectively.

### useReportList (reports admin listing)

Follows `useUsers` pattern: `ref([])` + `fetch()` with `loading`/`error`. Fetches only if the page component is allowed to mount (route guard already verified `reports.view`).

## API Integration

Repository interfaces in domain layer, implementations in infrastructure. Follows `fetchClient` pattern from `@/core/api/httpClient.ts`. Error handling: `fetchClient` rejects with `{ status, body }`. Composables catch and set `error.value`. Components display via toast or inline error.

## Conditional Logic Engine

Purely functional module in `src/shared/plugins/ConditionalLogicEngine.ts`. No Vue dependency. No permission checks — permissions are enforced by the parent `DynamicFormRenderer`.

## Drag-Drop Design

vuedraggable wraps each nesting level. 4 independent `<draggable>` lists with distinct `group` names. Undo/redo via command pattern (stack capped at 50).

## SignaturePad Component

Vanilla Canvas API. Props: `modelValue` (base64), `width`, `height`, `disabled`. `disabled` prop is wired to `!authStore.hasPermission('reports.edit') && !authStore.hasPermission('reports.sign')`. Editable only when user holds `reports.edit` (draft) or `reports.sign` (signing step).

## DynamicTable Component

Field type `dynamic_table` renders as grid with add/remove row buttons. Sub-fields can be text, select, date — max 1 level nesting. Disabled state respects parent's `isEditable`.

## File Changes Summary

| File | Action | Description |
|---|---|---|
| `src/shared/types/index.ts` | Modify | Add ReportTemplate, PatientReport, FieldConfig, Section, Row, Column, ConditionalRule, FieldType, ReportStatus types |
| `src/modules/admin/report-template/domain/**` | Create | Entities, repository interface, 5 use cases |
| `src/modules/admin/report-template/infrastructure/ApiReportTemplateRepository.ts` | Create | fetchClient-based CRUD |
| `src/modules/admin/report-template/application/containers/reportTemplateContainer.ts` | Create | provide functions |
| `src/modules/admin/report-template/presentation/composables/useReportTemplate.ts` | Create | List CRUD composable |
| `src/modules/admin/report-template/presentation/composables/useTemplateBuilder.ts` | Create | Pinia store |
| `src/modules/admin/report-template/presentation/pages/ReportTemplateListPage.vue` | Replace | List with table + permission-gated create/edit/delete |
| `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue` | Create | Full drag-drop builder (permission-gated save) |
| `src/modules/admin/report-template/presentation/components/*` | Create | Builder sub-components (~6 files) |
| `src/modules/reports/domain/**` | Create | Entities, repository interface, 6 use cases |
| `src/modules/reports/infrastructure/ApiReportRepository.ts` | Create | fetchClient-based (CRUD + sign + close + pdf) |
| `src/modules/reports/application/containers/reportsContainer.ts` | Create | All provide functions |
| `src/modules/reports/presentation/composables/useReportForm.ts` | Create | Pinia store with permission checks |
| `src/modules/reports/presentation/composables/useReportList.ts` | Create | Admin listing composable |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Create | Dynamic form + permission-gated lifecycle buttons |
| `src/modules/reports/presentation/pages/ReportViewPage.vue` | Create | Read-only closed report |
| `src/modules/reports/presentation/pages/ReportListPage.vue` | Create | Admin reports list (permission-filtered) |
| `src/modules/reports/presentation/components/DynamicFormRenderer.vue` | Create | Section/row/col iterator with permission check on mount |
| `src/modules/reports/presentation/components/DynamicField.vue` | Create | Type→component dispatcher |
| `src/modules/reports/presentation/components/DynamicTable.vue` | Create | Dynamic rows grid |
| `src/modules/reports/presentation/components/SignaturePad.vue` | Create | Canvas signature (permission-gated) |
| `src/shared/plugins/ConditionalLogicEngine.ts` | Create | Parser + evaluator |
| `src/core/router/index.ts` | Modify | Add routes with `meta.permissions` |
| `src/shared/components/AppSidebar.vue` | Modify | Add reports listing link gated by `reports.view` |
| `package.json` | Modify | Add `vuedraggable@next` |

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit — ConditionalLogicEngine | parse(), evaluate(), computeFieldVisibility() | Pure functions, table-driven tests |
| Unit — Domain entities | FieldConfig validation, status transitions | Vitest, no mocks |
| Unit — Use cases | Mock repository, verify correct method calls | DI mock repos |
| Unit — Permission checks | `hasPermission()` gates in stores/composables | Mock `useAuthStore` |
| Integration — DynamicFormRenderer | Mount with Section[] fixture, verify editable/read-only per permission mock | `@vue/test-utils` mount + jsdom, mock `useAuthStore` |
| Integration — DynamicField | Each FieldType renders correct component | Snapshot per type |
| Integration — SignaturePad | Mouse events produce base64; permissions gate editability | jsdom canvas mock |
| Integration — TemplateBuilder | drag-drop mutations update store | Pinia test plugin |
| E2E — Report lifecycle | draft → sign → close flow with permission matrix | Playwright, mock API + permission responses |

## Open Questions

- [ ] Backend API contract: exact response shapes for `GET /api/reports` and `GET /api/reports/{id}` (need to confirm before infra implementation)
- [ ] PDF download: is it a blob response or a URL redirect? Affects `downloadPdf()` implementation
- [ ] Reports sidebar placement: co-located with admin settings or separate main nav entry?
