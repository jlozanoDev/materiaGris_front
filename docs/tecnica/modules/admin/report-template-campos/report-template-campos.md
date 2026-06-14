# Módulo de Configuración de Campos — Plantillas de Informes

## Descripción

Sistema de configuración visual de campos para plantillas de informes dinámicos. Permite al administrador diseñar formularios clínicos mediante drag & drop: seleccionar tipo de campo, editar propiedades y previsualizar el resultado.

Sigue Clean Architecture con hexygonal: el dominio de tipos y registro de campos vive en `src/shared/types/`, los componentes de presentación en `src/modules/admin/report-template/presentation/`, y los renderizadores de informes en `src/modules/reports/presentation/components/`.

## Tipos de Datos (Domain Layer)

### `FieldConfig` — Union Discriminada

`src/shared/types/index.ts`

Seis variantes que extienden `FieldBase`:

| Variante | Discriminante `type` | Propiedades específicas |
|----------|----------------------|------------------------|
| `TextField` | `'text'` | `maxLength`, `placeholder`, `defaultValue` |
| `NumberField` | `'number'` | `min`, `max`, `step`, `defaultValue`, `unit` |
| `DateField` | `'date'` | `hasTime`, `minDate`, `maxDate`, `defaultSource` |
| `SelectionField` | `'select'` | `options[]`, `multiple`, `allowCustom`, `selectionsFrom` |
| `FixedTextField` | `'fixed_text'` | `textContent`, `styleOptions` |
| `DynamicTableField` | `'dynamic_table'` | `columns[]`, `calculatedFrom`, `footerTotals[]` |

Todas las variantes comparten desde `FieldBase`: `key`, `label`, `type`, `required`, `aiHelpDescription`.

### `FieldType` — literal union

```ts
type FieldType = 'text' | 'number' | 'date' | 'select' | 'fixed_text' | 'dynamic_table'
```

### Tipos auxiliares

- `TableColumnDef`: define columna de tabla dinámica (`key`, `label`, `type`, `required`, `options[]`, `calculated`, `formula`)
- `CalculatedColumnDef`: extensión de `TableColumnDef` con `calculated: true` + `formula: CalculatedFormula`
- `CalculatedFormula`: `{ op: 'sum' | 'avg' | 'count', sourceKey }` o `{ expression: string }`
- `FooterTotal`: `{ label: string, formula: CalculatedFormula }`

## Registry Pattern

### `FieldTypeRegistry` (`src/shared/types/FieldTypeRegistry.ts`)

Registro central de metadatos de tipos de campo. API:

| Método | Descripción |
|--------|-------------|
| `register(meta)` | Añade un nuevo tipo de campo |
| `get(type): FieldTypeMeta` | Obtiene metadatos de un tipo |
| `validateConfig(config): ValidationError[]` | Valida un FieldConfig contra el tipo |
| `getGrouped(): Record<string, FieldTypeMeta[]>` | Tipos agrupados para el palette |
| `types(): FieldType[]` | Lista de tipos registrados |

### `FieldTypeMeta` (`src/shared/types/FieldTypeMeta.ts`)

```ts
interface FieldTypeMeta {
  type: FieldType
  label: string
  group: 'basic' | 'layout'
  icon: string
  defaultFactory(): FieldConfig
  propertyComponent: string  // nombre del componente de propiedades
  renderComponent: string   // nombre del componente de renderizado
}
```

El registro se precarga con 6 tipos via `defaultFieldTypeRegistry()`:
- **Básicos**: text, number, date, select
- **Layout**: fixed_text, dynamic_table

### `SystemVariableRegistry` (`src/shared/types/SystemVariableRegistry.ts`)

Registro de variables de sistema para autocompletado en campos. API:

| Método | Descripción |
|--------|-------------|
| `register(sysVarDef)` | Añade variable |
| `get(key): SystemVarDef` | Obtiene por `cat.key` |
| `resolve(key): any` | Evalúa variable contra contexto |
| `interpolate(template, context)` | Reemplaza `{cat.key}` en string |
| `search(query): SystemVarDef[]` | Búsqueda fuzzy por key/label |
| `categories(): string[]` | Categorías registradas |

Categorías precargadas: `paciente`, `medico`, `consulta`, `centro`, `sistema`.

## Utilities

### `evaluateExpression` (`src/shared/utils/evaluateExpression.ts`)

Evaluador aritmético seguro para columnas calculadas y totales:

- `evaluateExpression(expr, rowContext): number` — parser recursivo descendente, no usa eval()/new Function()
- `evaluateFormula(formula, rows): number` — ejecuta sum/avg/count o expression libre sobre array de filas

Operadores: `+`, `-`, `*`, `/`, `(`, `)`. Variables resueltas desde el contexto de fila.

### `generateId` (`src/shared/utils/id.ts`)

Genera IDs únicos via `crypto.randomUUID()` con fallback a Math.random.

## Composable

### `useSystemVariableAutocomplete` (`src/shared/composables/useSystemVariableAutocomplete.ts`)

Autocompletado para variables de sistema con:
- Trigger `{` para mostrar sugerencias
- Debounce de 150ms en búsqueda
- Navegación por teclado (↑↓Enter)
- Integración con `SystemVariableRegistry.search()`

## Componentes de Presentación (Admin)

### `FieldPalette.vue`

Paleta izquierda del builder. Muestra tipos de campo agrupados por categoría (Básicos, Layout). Cada ítem es arrastrable con `draggable="true"`.

Props: `registry: FieldTypeRegistry`

### `FieldPropertiesPanel.vue`

Panel derecho que muestra propiedades del campo seleccionado. Usa `component :is` para cargar dinámicamente:

| `field.type` | Componente cargado |
|---|---|
| `text` | `TextProperties.vue` |
| `number` | `NumberProperties.vue` |
| `date` | `DateProperties.vue` |
| `select` | `SelectionProperties.vue` |
| `fixed_text` | `FixedTextProperties.vue` |
| `dynamic_table` | `DynamicTableProperties.vue` |

Properties components emiten `update:modelValue` con el FieldConfig modificado.

### `DroppableField.vue`

Card de campo dentro del canvas del builder. Muestra label, tipo, y un tooltip si `aiHelpDescription` está configurado.

### `useTemplateBuilder.ts`

Composable central del builder. Gestiona el canvas (`ref<FieldConfig[]>`), CRUD de campos, validación de claves duplicadas.

## Componentes de Renderizado (Reportes)

### `DynamicField.vue`

Dispatcher: dado un `FieldConfig`, renderiza el componente adecuado:

| `field.type` | Componente |
|---|---|
| `text` | Input text/textarea |
| `number` | Input number |
| `date` | Input date/datetime |
| `select` | CustomSelect |
| `fixed_text` | `FixedTextRenderer.vue` |
| `dynamic_table` | `DynamicTable.vue` |

### `FixedTextRenderer.vue`

Renderiza texto fijo con interpolación de variables (`{paciente.nombre}`). Soporta opciones de estilo (bold, italic, fontSize, alignment, color).

### `DynamicTable.vue`

Renderiza tabla dinámica con:
- Columnas editables según su tipo (text/number/date/select/textarea)
- Columnas calculadas (read-only) con badge `(calc)`
- Footer totals configurable
- Botón [+ Añadir Fila] y botón de eliminar fila
- Usa `evaluateFormula` para computed cells y footers

## Flujo de Datos

```
Admin arrastra campo del palette
  → FieldPalette emite evento dragstart con field.type
  → ReportTemplateBuilderPage onDrop → useTemplateBuilder.addField(type)
  → createField(type) genera FieldConfig con valores por defecto
  → Canvas re-renderiza DroppableField cards
  → Click en card → propiedades se muestran en FieldPropertiesPanel
  → Edición → emit update → canvas re-renderiza
  → Guardado → estructura JSON → API POST/PUT /report-templates
```

## UI y Diseño

- Builder: layout de 3 columnas (Palette | Canvas | Properties)
- Palette: fondo gris claro, ítems con hover violeta
- Canvas: área blanca con drop zone, border dashed
- Properties: panel derecho, scroll, inputs estándar
- Tooltip `ai_help_description`: icono de información violeta

## Archivos

| Ruta | Propósito |
|------|-----------|
| `src/shared/types/index.ts` | Discriminated union FieldConfig |
| `src/shared/types/FieldTypeMeta.ts` | Interfaz de metadatos de tipo |
| `src/shared/types/FieldTypeRegistry.ts` | Registry de tipos |
| `src/shared/types/SystemVariableRegistry.ts` | Registry de vars de sistema |
| `src/shared/types/defaultFieldTypeRegistry.ts` | Precarga de tipos |
| `src/shared/utils/evaluateExpression.ts` | Evaluador aritmético |
| `src/shared/utils/id.ts` | Generador de IDs |
| `src/shared/composables/useSystemVariableAutocomplete.ts` | Autocomplete composable |
| `src/modules/admin/report-template/presentation/components/FieldPalette.vue` | Paleta de campos |
| `src/modules/admin/report-template/presentation/components/FieldPropertiesPanel.vue` | Panel de propiedades |
| `src/modules/admin/report-template/presentation/components/DroppableField.vue` | Card de campo en canvas |
| `src/modules/admin/report-template/presentation/components/properties/*.vue` | 6 paneles de propiedades por tipo |
| `src/modules/admin/report-template/presentation/composables/useTemplateBuilder.ts` | Lógica del builder |
| `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue` | Página del builder |
| `src/modules/reports/presentation/components/DynamicField.vue` | Dispatcher de renderizado |
| `src/modules/reports/presentation/components/FixedTextRenderer.vue` | Render de texto fijo |
| `src/modules/reports/presentation/components/DynamicTable.vue` | Render de tabla dinámica |
