## Exploration: Implementar Vista de Rellenar/Editar Informes

### Current State

El módulo de informes (`src/modules/reports/`) ya tiene una arquitectura completa con soporte para rellenar y editar informes. Existe un renderer dinámico único (`DynamicFormRenderer`) que maneja tanto el modo editable como el de solo lectura mediante la prop `isEditable`. La ruta de edición `/informes/:id/editar` ya está definida y apunta a `ReportFillPage`, que ya implementa la carga de un informe existente y su edición.

**Lo que YA funciona:**
- Crear informe nuevo desde ficha del paciente → `ReportFillPage` con `isEditable=true`
- Editar informe existente vía ruta directa `/informes/:id/editar` → `ReportFillPage` con `isEditable=true`
- Ver informe en modo solo lectura → `ReportViewPage` con `DynamicFormRenderer` + `isEditable=false`
- Guardar borrador, firmar, cerrar, descargar PDF
- Auto-guardado cada 2 segundos en modo draft
- Validación de campos obligatorios antes de firmar

**Lo que NO existe (gap):**
- No hay botón "Editar" en `ReportListPage` (solo "Ver")
- No hay botón "Editar" en `ReportViewPage` (solo "Descargar PDF" y "Volver")
- No hay botón "Editar" en `PatientReportsTab` (solo navega a "Ver")
- El `DynamicField` en modo `disabled=true` renderiza inputs deshabilitados (gris), no texto limpio tipo documento

### Affected Areas

| Archivo | Cómo se afecta |
|---------|---------------|
| `src/modules/reports/presentation/pages/ReportListPage.vue` | Añadir botón "Editar" para drafts; solo se puede editar si status=draft |
| `src/modules/reports/presentation/pages/ReportViewPage.vue` | Añadir botón "Editar" (si tiene permiso y status=draft) |
| `src/modules/patients/presentation/components/PatientReportsTab.vue` | Opcional: añadir acción "Editar" en cada fila de informe |
| `src/modules/reports/presentation/components/DynamicField.vue` | Opcional (si se quiere texto estático en vez de inputs disabled): añadir modo de renderizado alternativo cuando `disabled=true` |
| `src/modules/reports/presentation/composables/useReportForm.ts` | Sin cambios — ya soporta `loadReport()` para edición |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Sin cambios funcionales necesarios; la página ya maneja ambos flujos (create + edit) |

### Report Module Architecture

```
src/modules/reports/
├── domain/
│   ├── entities/PatientReport.ts          → re-exporta de shared/types
│   ├── repositories/ReportRepository.ts   → interfaz con 8 métodos
│   └── use-cases/                         → 7 casos de uso (Init, Get, GetAll, SaveDraft, Sign, Close, DownloadPdf)
│       └── __tests__/                     → tests de casos de uso
├── infrastructure/
│   └── ApiReportRepository.ts             → implementación con fetchClient (no axios)
├── application/
│   └── containers/reportsContainer.ts     → 8 funciones provide*() (DI)
└── presentation/
    ├── components/
    │   ├── DynamicFormRenderer.vue        → Renderer principal (editable + readonly)
    │   ├── DynamicField.vue               → Campo individual (10+ tipos)
    │   ├── DynamicTable.vue               → Tabla dinámica con filas editables
    │   ├── FixedTextRenderer.vue          → Texto fijo con interpolación HTML
    │   ├── SignaturePad.vue               → Canvas de firma + texto
    │   ├── TemplatePickerModal.vue        → Modal de selección de plantilla
    │   └── __tests__/                     → tests de componentes
    ├── composables/
    │   ├── useReportForm.ts               → Estado del formulario (valores, dirty, errores)
    │   ├── useReportList.ts               → Listado de informes con filtros
    │   ├── useTemplateList.ts             → Listado de plantillas activas
    │   └── __tests__/                     → tests de composables
    └── pages/
        ├── ReportListPage.vue             → Listado de informes
        ├── ReportViewPage.vue             → Vista de solo lectura
        └── ReportFillPage.vue             → Crear + Editar (misma página)
```

### Preview Component Analysis

El renderer **`DynamicFormRenderer`** es el componente central:

```
DynamicFormRenderer (props: sections, headerSections, footerSections, modelValue, isEditable)
├── Zona header (readonly siempre — campos disabled=true)
├── Sections (modo tabs | accordion | default, según section.display)
│   ├── Section title
│   └── Rows → Columns → DynamicField (por cada field config)
│       ├── isEditable=true  → :disabled="false" → inputs interactivos
│       └── isEditable=false → :disabled="true"  → inputs deshabilitados (gris)
├── Zona footer (readonly siempre — campos disabled=true)
└── Indicador de auto-guardado
```

**Data flow**: `useReportForm().values` → `DynamicFormRenderer` (modelValue) → `DynamicField` (modelValue) → `emit('update:modelValue')` → `ReportFillPage.handleUpdate()` → `useReportForm.setValue()` → auto-save tras 2s.

**Nota importante**: El header y footer SIEMPRE se renderizan en modo readonly (disabled=true), independientemente del valor de `isEditable`. Esto es intencional — los headers/footers contienen datos institucionales que no se editan por informe.

### Report Data Model

Definido en `src/shared/types/index.ts`:

```typescript
// Entidad principal
interface PatientReport {
  id: string
  patientId: string
  userId: string
  status: 'draft' | 'signed' | 'closed'
  templateStructureSnapshot: {
    sections: Section[]
    header?: HeaderFooterConfig
    footer?: HeaderFooterConfig
  }
  values: Record<string, any>  // { [fieldKey]: value }
  createdAt?: string
  updatedAt?: string
  patient_name?: string
  author_name?: string
  template_name?: string
}

// Field types (discriminated union)
type FieldConfig = TextField | NumberField | DateField | SelectionField
                 | FixedTextField | DynamicTableField
                 | VerticalSeparatorField | HorizontalSeparatorField

type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select'
               | 'multi_select' | 'radio' | 'checkbox' | 'dynamic_table'
               | 'fixed_text' | 'vertical_separator' | 'horizontal_separator'
```

### API Dependencies (endpoints usados)

| Método | Endpoint | Use Case | Usado en |
|--------|----------|----------|----------|
| POST | `/reports` | InitReportUseCase | Crear informe nuevo |
| GET | `/reports` | GetReportsUseCase | Listado con filtros |
| GET | `/reports/:id` | GetReportUseCase | Cargar para vista/edición |
| PUT | `/reports/:id` | SaveReportDraftUseCase | Guardar borrador + auto-save |
| POST | `/reports/:id/sign` | SignReportUseCase | Firmar informe |
| POST | `/reports/:id/close` | CloseReportUseCase | Cerrar informe |
| GET | `/reports/:id/pdf` | DownloadReportPdfUseCase | Descargar PDF |
| GET | `/templates/active` | GetActiveTemplatesUseCase | Listar plantillas activas |

Todos los endpoints ya existen y están implementados en el backend.

### Approaches

#### 1. **Mínimo viable: solo añadir navegación a edición**

Añadir botones "Editar" en `ReportListPage`, `ReportViewPage` y opcionalmente `PatientReportsTab`. La funcionalidad de edición ya existe y funciona. Solo faltan los puntos de entrada.

- **Pros**: Mínimo esfuerzo, nada de lógica nueva, todo probado
- **Cons**: Los campos en modo disabled se ven como inputs grises, no como texto limpio tipo "vista previa"
- **Effort**: Bajo (1-2 horas)

#### 2. **Mejorar renderizado readonly: texto estático en vez de inputs disabled**

Además de añadir navegación, modificar `DynamicField.vue` para que cuando `disabled=true` renderice texto estático (span/div con formato) en lugar de inputs deshabilitados. Esto hace que la vista de solo lectura sea visualmente idéntica a una "vista previa de documento".

- **Pros**: Experiencia visual superior, la vista previa y la edición comparten el mismo layout pero con renderizado diferente
- **Cons**: Más código en `DynamicField`, hay que manejar formatos (fechas, números, arrays para multi_select/checkbox)
- **Effort**: Medio (3-4 horas)

#### 3. **Unificar vista previa y edición en una sola página con toggle**

Crear una sola página que alterne entre modo "vista previa" (documento estático) y "edición" (formulario interactivo) con un toggle/botón. Ambas vistas comparten el mismo `DynamicFormRenderer` o usan dos renderers distintos (`ReportDocumentRenderer` para preview, `DynamicFormRenderer` para edición).

- **Pros**: Flujo unificado, experiencia "WYSIWYG" completa
- **Cons**: Mayor complejidad, el `ReportDocumentRenderer` está en el módulo admin (acoplamiento), requeriría refactor
- **Effort**: Alto (6-8 horas)

### Recommendation

**Approach 1 + Approach 2 combinados**: La solución más efectiva es añadir la navegación faltante (Approach 1) y mejorar el renderizado readonly (Approach 2) para que los campos en modo disabled se vean como texto limpio, no como inputs deshabilitados. Esto cumple exactamente con el requerimiento: "visualmente igual a la vista previa, pero editable".

Razones:
1. La infraestructura de edición ya existe y funciona — no reinventar
2. Añadir navegación es trivial (3 archivos, ~15 líneas de template cada uno)
3. El `DynamicField` ya tiene lógica condicional por tipo; añadir un modo "text display" para disabled es incremental
4. No requiere tocar backend ni API
5. No requiere nuevos componentes, solo extender los existentes

### Risks

- **Riesgo bajo**: La edición ya funciona; solo se añaden puntos de entrada. Si falla, se revierte fácil.
- **Riesgo medio-bajo**: Modificar `DynamicField` para renderizar texto en vez de inputs disabled podría romper tests existentes. Hay 5 tests de componente que deben verificarse.
- **Dependencia de permisos**: Los botones "Editar" deben respetar `report.edit` y verificarse que el informe esté en status `draft`. Esto ya está implementado en `ReportFillPage` via `canEdit`.

### Ready for Proposal

**Sí**. El código base está en excelente estado. La funcionalidad core ya existe. Solo faltan:
1. Puntos de entrada de navegación (botones "Editar")
2. Mejora visual del modo readonly en `DynamicField` (opcional pero recomendado)

Se puede proceder a proposal y spec inmediatamente.
