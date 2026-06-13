# Design: Reemplazo del Configurador de Campos de Plantillas

## Technical Approach

Reescribir el módulo `admin/report-template` desde cero sobre la misma estructura hexagonal, reemplazando la interfaz genérica `FieldConfig` por un **discriminated union** de 10 variantes. Cada variante expone solo sus propiedades relevantes — TypeScript estrecha por `type`. Se mantiene `vuedraggable`, el patrón undo/redo por comandos, y la jerarquía Section→Row→Column→Field.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| FieldConfig modelado | Discriminated union sobre `FieldType` | Elimina comprobaciones `v-if` masivas; cada variante solo expone sus props. Already idiomatic TypeScript. |
| Type registry | `Map<FieldType, FieldTypeMeta>` con factory | Extensibilidad sin tocar el core. Nuevos tipos registran icono, label, defaultFactory, propertyComponent y renderComponent. |
| System vars | Fuente dinámica desde API (`/api/admin/system-variables`) + flat index client-side | Backend define el catálogo extensible de variables. Frontend consulta al montar el builder y cachea en `Map<string, SystemVarDef>`. Autocompletado con debounce 150ms sobre entrada `{`. |
| Variable interpolation | Regex `/\\{([^}]+)\\}/g` contra registry | Simple, predecible. Sin dependencia externa. Los unresolved quedan como literales. |
| Serialization | JSON incluye metadata del type registry (`FieldTypeMeta` completo) + discriminated union | Facilita reconstrucción futura, debugging, y que el renderizador no necesite el registry cargado. |
| Properties panel | Componente dinámico por `field.type` (no `v-if` en cadena) | Cada tipo tiene su propio componente de propiedades. Facilita añadir tipos sin tocar código central. |
| DynamicField dispatch | Igual estrategia: `v-if/else-if` con componente por tipo | El actual ya funciona. Sólo se añaden `fixed_text` y la variante híbrida de `dynamic_table`. |
| Undo/redo | Mantener comando pattern en composable | Ya funciona. Sólo adaptar payloads a las nuevas variantes. |

## Data Model — TypeScript Discriminated Union

```ts
type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select'
  | 'multi_select' | 'radio' | 'checkbox' | 'dynamic_table' | 'fixed_text'

interface FieldBase { id: string; key: string; label: string; required: boolean; ai_help_description?: string }

interface TextField extends FieldBase { type: 'text' | 'textarea'; max_chars?: number; placeholder?: string; default_value?: string }
interface NumberField extends FieldBase { type: 'number'; decimals?: number; min?: number; max?: number; default_value?: number }
interface DateField extends FieldBase { type: 'date'; min_date?: string; max_date?: string; placeholder?: string; default_value?: string }
interface SelectionField extends FieldBase { type: 'select' | 'multi_select' | 'radio' | 'checkbox'; options: FieldOption[]; placeholder?: string; default_value?: string | string[] }
interface FixedTextField extends FieldBase { type: 'fixed_text'; text_content: string; styling_options?: { bold?: boolean; size?: 'sm'|'md'|'lg' } }
interface DynamicTableField extends FieldBase { type: 'dynamic_table'; columns: TableColumnDef[]; footer_totals?: FooterTotal[] }

// Column definition for dynamic table
interface TableColumnDef { key: string; label: string; type: 'text' | 'number' | 'date' | 'select'; required: boolean; options?: FieldOption[] }
interface CalculatedColumnDef extends TableColumnDef { calculated: true; formula: CalculatedFormula }
type CalculatedFormula = { op: 'sum' | 'avg' | 'count'; sourceKey: string } | { expression: string } // expresión libre: "column_a * column_b"
interface FooterTotal { label: string; formula: CalculatedFormula }

type FieldConfig = TextField | NumberField | DateField | SelectionField | FixedTextField | DynamicTableField
```

`Section`, `Row`, `Column` se mantienen sin cambios estructurales. `ConditionalRule` y `systemVariable` se eliminan del namespace.

## System Variables

```ts
interface SystemVariableDef { category: string; key: string; label: string; resolver: () => string }

// Registry: extensible via register(cat, key, label, resolver)
// Flat index: Map<string, SystemVariableDef> keyed by "category.key"
// Autocomplete endpoint: /api/admin/system-variables (server-driven, extensible)
// Interpolation: replace(/\{([^}]+)\}/g, (_, path) => registry.get(path)?.resolver() ?? `{${path}}`)
```

Categorías iniciales: `paciente`, `clinica`, `fecha`, `usuario`.

## Component Tree

```
ReportTemplateBuilderPage
├── TemplateBuilderToolbar         (name, description, undo/redo, save)
├── [Left] FieldPalette            (draggable lista de FieldTypeMeta)
├── [Center] BuilderCanvas
│   └── SectionPanel[]             (draggable sections)
│       └── DroppableRow[]         (draggable rows)
│           └── DroppableColumn[]  (draggable columns)
│               └── DroppableField[] (field chips, draggable)
└── [Right] FieldPropertiesPanel
    └── [dynamic component por field.type]
        ├── TextProperties.vue
        ├── NumberProperties.vue
        ├── DateProperties.vue
        ├── SelectionProperties.vue
        ├── FixedTextProperties.vue  (editor texto + inserción variables)
        └── DynamicTableProperties.vue
```

## DynamicFormRenderer Changes

| Change | Detail |
|--------|--------|
| Eliminar `computeFieldVisibility` | Se borra `ConditionalLogicEngine` entero |
| Añadir `fixed_text` render | `<div>` con HTML interpolado de variables |
| `dynamic_table` híbrido | Columnas libres editables + columnas `calculated` (predefinidas `sum`/`avg`/`count` o expresión libre) + footer totals |
| Quitar `signature` | Se elimina el bloque `v-else-if` y el import de `SignaturePad` |

## File Changes — Deletion Plan

| File | Action | Reason |
|------|--------|--------|
| `shared/types/index.ts` L101-136 | Rewrite | `FieldType`, `FieldConfig`, `ConditionalRule` redefinidos |
| `shared/plugins/ConditionalLogicEngine.ts` | **Delete** | Conditional logic removed |
| `shared/plugins/__tests__/ConditionalLogicEngine.test.ts` | **Delete** | |
| `admin/report-template/domain/entities/ReportTemplate.ts` | Rewrite | New entity types |
| `admin/report-template/presentation/composables/useTemplateBuilder.ts` | Rewrite | Adapted to discriminated union |
| `admin/report-template/presentation/components/FieldPropertiesPanel.vue` | Rewrite | Dynamic component dispatch |
| `admin/report-template/presentation/components/SectionPanel.vue` | Keep | Minimal changes (label editing) |
| `admin/report-template/presentation/components/DroppableRow.vue` | Keep | No structural changes |
| `admin/report-template/presentation/components/DroppableColumn.vue` | Modify | Adapt to new FieldConfig union |
| `admin/report-template/presentation/components/DroppableField.vue` | Keep | Icon-only, self-contained |
| `admin/report-template/presentation/components/TemplateBuilderToolbar.vue` | Keep | No functional changes |
| `admin/report-template/domain/repositories/ReportTemplateRepository.ts` | Keep | Contract unchanged |
| `admin/report-template/infrastructure/ApiReportTemplateRepository.ts` | Keep | Endpoint contracts unchanged |
| `admin/report-template/application/containers/reportTemplateContainer.ts` | Keep | |
| `admin/report-template/domain/use-cases/*.ts` | Keep | |
| `reports/presentation/components/DynamicField.vue` | Modify | Add fixed_text renderer, remove signature |
| `reports/presentation/components/DynamicFormRenderer.vue` | Modify | Remove conditional logic integration |
| `reports/presentation/components/SignaturePad.vue` | Keep | Stays for report-level signature |

## Component API Contracts

```ts
// FieldPalette.vue
props: { registry: FieldTypeMeta[] }
emits: {} // uses vuedraggable clone

// BuilderCanvas.vue
props: { sections: Section[] }
emits: { 'update:sections': [] }

// FieldPropertiesPanel.vue
props: { field: FieldConfig | null }
emits: { 'update:field': [partial: DeepPartial<FieldConfig>] }

// DynamicField.vue (unchanged surface, new internal branches)
props: { field: FieldConfig; modelValue: unknown; disabled: boolean }
emits: { 'update:modelValue': [value: unknown] }

// FixedTextRenderer.vue (new, internal to DynamicField)
props: { content: string; variables: Map<string, SystemVariableDef> }

// DynamicTable.vue (enhanced)
props: { columns: TableColumnDef[]; footerTotals: FooterTotal[]; modelValue: Record<string,any>[]; disabled: boolean }
emits: { 'update:modelValue': [value: Record<string,any>[]] }
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | FieldConfig type narrowing, variable interpolation, type registry | Vitest con datos puros, sin DOM |
| Unit | Undo/redo commands con nueva estructura | Adaptar `useTemplateBuilder.spec.ts` |
| Unit | Repository use cases | Sin cambios, ya existen |
| Integration | Builder page: drag-drop, property panel switching | Montaje de componente con store mock |
| Integration | DynamicFormRenderer: renderizado de 10 tipos | Montaje con secciones de prueba |
| E2E | Flujo completo: crear plantilla → guardar → rellenar informe | Playwright existente, adaptar selectores |

## Migration / Rollout

No migration — se borra lo viejo. PR único con el commit que elimina el módulo antiguo y construye el nuevo. Rollback: revertir commit.

## Resolved Questions

- [x] Columnas calculadas de Tabla Dinámica: operaciones predefinidas (`sum`, `avg`, `count`) + expresión libre (`"column_a * column_b"`).
- [x] Autocompletado de variables: fuente dinámica desde backend (`/api/admin/system-variables`). Prompt de implementación backend se entregará al usuario cuando corresponda.
- [x] JSON serializado: incluye metadata del type registry (`FieldTypeMeta`) + discriminated union completo.
