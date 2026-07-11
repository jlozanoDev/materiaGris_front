# Módulo de Configuración de Plantillas de Informe

## Descripción

Sistema de diseño visual de plantillas de informe con tres zonas independientes: **cabecera**, **cuerpo** y **pie**. Cada zona comparte la misma infraestructura Section→Row→Column→Field con drag & drop, paleta de campos y panel de propiedades.

Sigue Clean Architecture con hexagonal: el dominio de tipos y registro de campos vive en `src/shared/types/`, los componentes de presentación en `src/modules/admin/report-template/presentation/`, y los renderizadores de informes en `src/modules/reports/presentation/components/`.

## Arquitectura de Zonas

```
┌─────────────────────────────────────┐
│           CABECERA (header)          │  ← HeaderFooterConfig
│  ┌─────────────────────────────────┐ │      enabled: boolean
│  │  Section → Row → Column → Field │ │      pageDisplay: 'all'|'first'|'last'
│  └─────────────────────────────────┘ │      sections: Section[]
├─────────────────────────────────────┤
│            CUERPO (body)             │  ← sections: Section[]
│  ┌─────────────────────────────────┐ │      (existente, sin cambios)
│  │  Section → Row → Column → Field │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│            PIE (footer)             │  ← HeaderFooterConfig
│  ┌─────────────────────────────────┐ │      enabled: boolean
│  │  Section → Row → Column → Field │ │      pageDisplay: 'all'|'first'|'last'
│  └─────────────────────────────────┘ │      sections: Section[]
└─────────────────────────────────────┘
```

### HeaderFooterConfig

```typescript
interface HeaderFooterConfig {
  enabled: boolean          // default: false
  pageDisplay: 'all' | 'first' | 'last'  // default: 'all'
  sections: Section[]
}
```

Se añade opcionalmente a `ReportTemplate.structure` y `PatientReport.templateStructureSnapshot`:

```typescript
interface ReportTemplate {
  structure: {
    sections: Section[]
    header?: HeaderFooterConfig
    footer?: HeaderFooterConfig
  }
}
```

### Almacenamiento

- `header`/`footer` se serializan solo cuando están configurados (tienen secciones o `enabled=true`)
- Templates legacy sin `header`/`footer` cargan con defaults: `{ enabled: false, pageDisplay: 'all', sections: [] }`
- El backend trata `structure` como JSON libre — no requiere migración

## Composable: useTemplateBuilder

### Nuevo estado

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `activeZone` | `'header' \| 'body' \| 'footer'` | `'body'` | Zona activa en el builder |
| `activeSections` | `Section[]` | computado | Secciones de la zona activa |
| `headerSections` | `Section[]` | `[]` | Secciones de cabecera |
| `footerSections` | `Section[]` | `[]` | Secciones de pie |
| `headerEnabled` | `boolean` | `false` | Toggle de cabecera |
| `footerEnabled` | `boolean` | `false` | Toggle de pie |
| `headerPageDisplay` | `string` | `'all'` | Visibilidad de cabecera |
| `footerPageDisplay` | `string` | `'all'` | Visibilidad de pie |

### Nuevos métodos

| Método | Descripción |
|--------|-------------|
| `switchZone(zone)` | Cambia zona activa y resetea selección de campo |

### Mutaciones multi-zona

`addSection`, `removeSection`, `addRow`, `removeRow`, `addColumn`, `removeColumn`, `addField`, `removeField`, `updateField`, `reorderSections` — todas operan sobre la zona activa mediante `currentSectionsRef()`.

`findFieldById`, `findSectionByRowId`, `isDuplicateKey` — buscan en las tres colecciones (header, body, footer).

### Persistencia

`saveTemplate()` serializa `{ sections, header?, footer? }` donde header/footer se incluyen solo si tienen contenido o están habilitados.

`loadTemplate()` restaura las tres zonas con defaults seguros para templates legacy.

## Componentes de UI

### HeaderFooterEditor.vue (NUEVO)

Panel de control por zona (header/footer) en el builder:
- Toggle `enabled` (switch accesible con `role="switch"` y `aria-checked`)
- Selector `pageDisplay` con 3 opciones: Todas, Primera, Última

Props: `enabled`, `pageDisplay`, `zone`
Emits: `update:enabled`, `update:pageDisplay`

### ReportTemplateBuilderPage.vue

- Añade pestañas de zona: Cabecera | Cuerpo | Pie
- Cabecera y Pie muestran `HeaderFooterEditor` cuando están activos
- `activeSections` reemplaza a `sections` en el renderizado del canvas
- Los botones de preview/print pasan `headerSections`/`footerSections` a los modales
- **Splitter redimensionable**: canvas ↔ panel de propiedades usa `<Splitpanes>` + `<Pane>`
  - Paleta izquierda: `w-56` fijo, fuera del Splitpanes
  - Canvas: `min-size="30"` (30% del espacio disponible)
  - Propiedades: `min-size="20"` (~200px), `size` persistido en localStorage
  - localStorage key: `report-template-builder-properties-width` (percentaje 20–50)
  - Fallback: 25% cuando no hay valor almacenado o es inválido
  - Barra divisora: 10px, transparente con hover púrpura (`rgba(124,58,237,0.2)`)

### ReportDocumentRenderer.vue

- Reemplaza header hardcodeado por render dinámico desde props `headerSections`/`footerSections`
- Props nuevas: `headerSections`, `footerSections`, `headerEnabled`, `footerEnabled`
- Condicional `hasHeader`/`hasFooter` computados desde props
- Compatible hacia atrás: props con defaults seguros

### DynamicFormRenderer.vue

- Props nuevas: `headerSections`/`footerSections` (opcionales)
- Renderiza zonas read-only con `DynamicField disabled=true` antes/después del cuerpo
- Si `undefined`: no renderiza nada (backward-compatible)

## Archivos

| Ruta | Acción | Propósito |
|------|--------|-----------|
| `src/shared/types/index.ts` | Modificado | + `HeaderFooterConfig` type, `structure` extendido |
| `src/modules/admin/report-template/presentation/composables/useTemplateBuilder.ts` | Modificado | Estado multi-zona, save/load extendido |
| `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue` | Modificado | Pestañas de zona y editor integrado |
| `src/modules/admin/report-template/presentation/components/HeaderFooterEditor.vue` | **Creado** | Toggle + pageDisplay por zona |
| `src/modules/admin/report-template/presentation/components/ReportDocumentRenderer.vue` | Modificado | Header/footer dinámico |
| `src/modules/reports/presentation/components/DynamicFormRenderer.vue` | Modificado | Zonas read-only |
| `src/modules/admin/report-template/presentation/components/PrintPreviewModal.vue` | Modificado | Pasa header/footer al render |
| `src/modules/admin/report-template/presentation/components/PreviewModal.vue` | Modificado | Pasa header/footer al render |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Modificado | Extrae header/footer del snapshot |
| `src/modules/reports/presentation/pages/ReportViewPage.vue` | Modificado | Extrae header/footer del snapshot |
