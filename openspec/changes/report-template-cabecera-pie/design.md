# Design: Cabecera y Pie Configurables en Plantillas de Informe

## Technical Approach

Extender el builder existente reutilizando la infraestructura Section→Row→Column→Field para tres zonas independientes: header, body, footer. Se añade una capa de selección de zona activa (`activeZone`) en el composable, y pestañas en la UI. No se crean nuevos componentes de builder — el mismo `FieldPalette`, `BuilderCanvas` y `FieldPropertiesPanel` sirven para las tres zonas.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Navegación entre zonas | Tabs dentro de misma página | Rutas separadas, accordion horizontal | Reutiliza palette, properties panel y undo/redo sin props extra. Evita 3 rutas que duplican layout. |
| Estado del builder | `activeZone` ref + computed `activeSections` | 3 composables independientes, `useSectionBuilder` genérico | La complejidad de 3 composables no se justifica para 400 líneas extra. Una ref de zona + getters es más directo. |
| Undo/redo por zona | Pila única compartida | Pilas separadas por zona | Las operaciones son secuenciales en el tiempo. Una pila unificada captura el orden natural de edición. |
| Renderizado header/footer en DynamicFormRenderer | Props opcionales `headerSections`/`footerSections` | Slots nombrados, componente wrapper | Las props son el patrón existente. Backward-compatible: callers sin props no rompen. |
| pageDisplay en print CSS | `position: fixed` dentro de `@page` (futuro) | CSS condicional por página, JS | MVP renderiza top/bottom estático. `pageDisplay` se serializa pero el render A4 multi-página real es out-of-scope. |

## Data Model

```ts
interface HeaderFooterConfig {
  enabled: boolean          // default: false
  pageDisplay: 'all' | 'first' | 'last'  // default: 'all'
  sections: Section[]
}

// ReportTemplate.structure
type TemplateStructure = {
  sections: Section[]       // body (existente, sin cambios)
  header?: HeaderFooterConfig
  footer?: HeaderFooterConfig
}

// PatientReport.templateStructureSnapshot hereda misma forma
```

`Section`, `Row`, `Column`, `FieldConfig` — sin cambios. `HeaderFooterConfig` no introduce nuevos tipos de campo.

## Builder Composable Changes (`useTemplateBuilder`)

| Adición | Detalle |
|---------|---------|
| `activeZone: Ref<'header' \| 'body' \| 'footer'>` | Zona activa en el canvas |
| `headerSections: Ref<Section[]>` | Secciones de cabecera |
| `footerSections: Ref<Section[]>` | Secciones de pie |
| `headerEnabled: Ref<boolean>` | Toggle cabecera |
| `footerEnabled: Ref<boolean>` | Toggle pie |
| `headerPageDisplay: Ref<'all'\|'first'\|'last'>` | Visibilidad cabecera |
| `footerPageDisplay: Ref<'all'\|'first'\|'last'>` | Visibilidad pie |
| `activeSections` (computed) | `Section[]` de la zona activa — apunta a `headerSections`, `sections` o `footerSections` |
| `switchZone(zone)` | Cambia `activeZone` y `selectedFieldId=null` |
| `saveTemplate()` | Serializa `{ sections, header?, footer? }` en payload |
| `loadTemplate()` | `header ??= { enabled:false, pageDisplay:'all', sections:[] }`, idem footer |

Las mutaciones existentes (`addSection`, `addRow`, `addField`, etc.) operan sobre `activeSections` en lugar de `sections`. Se añade una indirección interna: `function currentSections(): Section[]` que resuelve según `activeZone`. `findFieldById` se extiende para buscar en las tres colecciones.

## Component API Contracts

```ts
// ReportDocumentRenderer.vue — props nuevos
headerSections?: Section[]
footerSections?: Section[]
headerEnabled?: boolean      // default: false
footerEnabled?: boolean      // default: false

// DynamicFormRenderer.vue — props nuevos
headerSections?: Section[]   // undefined → no renderiza zona
footerSections?: Section[]   // undefined → no renderiza zona
// Rendering: ambos como read-only, usando FixedTextRenderer internamente

// PrintPreviewModal.vue — pasa al renderer
:header-sections="builder.headerEnabled ? builder.headerSections : []"
:footer-sections="builder.footerEnabled ? builder.footerSections : []"

// PreviewModal.vue — pasa al DynamicFormRenderer
:header-sections="builder.headerEnabled ? builder.headerSections : undefined"
:footer-sections="builder.footerEnabled ? builder.footerSections : undefined"

// HeaderFooterEditor.vue (nuevo)
props: { enabled: boolean; pageDisplay: string; zone: 'header' | 'footer' }
emits: { 'update:enabled': [boolean]; 'update:pageDisplay': [string] }
```

## Component Tree (actualizado)

```
ReportTemplateBuilderPage
├── TemplateBuilderToolbar
├── [Tabs] Cabecera | Cuerpo | Pie
├── [Tab content]
│   ├── HeaderFooterEditor  (toggle + pageDisplay, solo en tabs header/footer)
│   ├── [Left] FieldPalette
│   ├── [Center] BuilderCanvas
│   │   └── SectionPanel[] → DroppableRow[] → DroppableColumn[] → DroppableField[]
│   └── [Right] FieldPropertiesPanel
└── PreviewModal / PrintPreviewModal  (pasan las 3 zonas)
```

## Renderer Changes

**ReportDocumentRenderer**: Elimina header hardcodeado (L3-10). Renderiza condicionalmente bloque header si `headerSections` tiene contenido, bloque footer abajo. Ambos usan el mismo sistema de renderizado de fields que el body (sin `values` reales — los `fixed_text` interpola con `previewVars`). La tabla de fields del body no cambia.

**DynamicFormRenderer**: Añade secciones `readonly-header` y `readonly-footer` antes/después del bloque `sections` principal. Cada una itera `headerSections`/`footerSections` con `DynamicField` en modo `disabled=true` forzado. Si `headerSections` es `undefined` o array vacío, no renderiza nada (sin espacio extra).

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `shared/types/index.ts` | Modify | + `HeaderFooterConfig`, actualiza `ReportTemplate.structure` y `PatientReport.templateStructureSnapshot` |
| `useTemplateBuilder.ts` | Modify | + estado header/footer, `activeZone`, `switchZone`, `activeSections` computed, `saveTemplate`/`loadTemplate` extendidos |
| `ReportTemplateBuilderPage.vue` | Modify | + pestañas Cabecera/Cuerpo/Pie, integra `HeaderFooterEditor` |
| `HeaderFooterEditor.vue` | **Create** | Panel toggle habilitar + selector pageDisplay |
| `ReportDocumentRenderer.vue` | Modify | Reemplaza header hardcodeado, añade footer dinámico |
| `DynamicFormRenderer.vue` | Modify | + props `headerSections`/`footerSections`, render read-only |
| `PrintPreviewModal.vue` | Modify | Pasa `headerSections`/`footerSections` al renderer |
| `PreviewModal.vue` | Modify | Pasa `headerSections`/`footerSections` al renderer |
| `ReportFillPage.vue` | Modify | Extrae `header`/`footer` del snapshot, pasa al renderer |
| `ReportViewPage.vue` | Modify | Ídem |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `HeaderFooterConfig` type narrowing, `activeSections` computed | Vitest, datos puros |
| Unit | `saveTemplate` serializa las 3 zonas, `loadTemplate` mergea defaults | Extender `useTemplateBuilder.spec.ts` |
| Integration | Cambio de pestañas preserva estado independiente | Montaje con store mock, clic en tabs |
| Integration | `DynamicFormRenderer` con header/footer renderiza read-only | Montaje con secciones de prueba |
| Integration | `ReportDocumentRenderer` renderiza header/footer dinámico | Snapshot con ejemplo de 3 zonas |
| E2E | Flujo: crear header+body+footer → guardar → recargar → verificar | Playwright, extender test existente del builder |

## Migration / Rollout

Templates existentes sin `header`/`footer` en `structure` — `loadTemplate` aplica defaults (`enabled: false, sections: []`). Sin migración de datos. Backend acepta el JSON blob sin cambios. Rollback: revertir commit; templates con header/footer serializado degradan gracefully (el backend ignora claves extra en `structure`).

## Open Questions

- [x] ¿Separar undo/redo por zona? → No, pila unificada. Suficiente para MVP.
- [x] ¿El backend necesita migración? → No, `structure` es JSON libre.
- [ ] ¿Añadir `template_name` a `SystemVariableRegistry` para interpolación en header/footer? → Out-of-scope inicial, se logra con `fixed_text` + string literal.
