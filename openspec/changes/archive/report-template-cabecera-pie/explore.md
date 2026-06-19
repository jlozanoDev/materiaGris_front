## Exploration: Añadir cabecera y pie al módulo de plantillas de informe

### Current State

El módulo `admin/report-template` implementa un constructor drag-and-drop para plantillas de informes con una jerarquía: **Sections → Rows → Columns → Fields**. La estructura actual se guarda como:

```ts
// ReportTemplate (shared/types/index.ts)
ReportTemplate {
  id, name, description, isActive,
  structure: { sections: Section[] }
}
```

**No existe concepto de cabecera (header) ni pie (footer) en el modelo de datos ni en la UI del builder.** El componente `ReportDocumentRenderer.vue` (usado para vista previa de impresión) tiene un header hardcodeado con datos de ejemplo (nombre del informe, paciente ficticio, fecha) y no renderiza ningún footer. El componente `PreviewModal.vue` (vista previa normal) usa `DynamicFormRenderer` que tampoco tiene header/footer.

El builder actual (`useTemplateBuilder.ts`) maneja exclusivamente `sections`. Guarda `{ name, description, structure: { sections } }` hacia la API `/admin/report-templates`.

### Affected Areas

| Archivo | Impacto | Tipo |
|---------|---------|------|
| `src/shared/types/index.ts` | Añadir tipos `HeaderConfig`, `FooterConfig` y modificar `ReportTemplate.structure` | Core type |
| `src/modules/admin/report-template/presentation/composables/useTemplateBuilder.ts` | Añadir estado `header`, `footer`, métodos `updateHeader`/`updateFooter`, modificar `saveTemplate` y `loadTemplate` | Composable |
| `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue` | Añadir panel/sección UI para editar cabecera y pie en el builder | Page |
| `src/modules/admin/report-template/presentation/components/ReportDocumentRenderer.vue` | Reemplazar header hardcodeado por datos dinámicos del template; añadir renderizado del footer | Component |
| `src/modules/admin/report-template/presentation/components/PreviewModal.vue` | Pasar header/footer al DynamicFormRenderer o renderizarlos | Component |
| `src/modules/admin/report-template/presentation/components/PrintPreviewModal.vue` | Pasar header/footer config al ReportDocumentRenderer | Component |
| `src/modules/reports/presentation/components/DynamicFormRenderer.vue` | Añadir slots o props para header/footer en el formulario de llenado | Component |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Pasar header/footer desde templateStructureSnapshot | Page |
| `src/modules/reports/presentation/pages/ReportViewPage.vue` | Pasar header/footer desde templateStructureSnapshot | Page |
| `src/shared/types/SystemVariableRegistry.ts` | Posiblemente añadir variables de sistema para cabecera/pie | Variable registry |

### Data Model Analysis

#### Current structure
```ts
interface ReportTemplate {
  structure: { sections: Section[] }
}
```

#### Proposed structure (approach A)
```ts
interface HeaderConfig {
  enabled: boolean
  content: string          // Rich text / markdown with variable interpolation
  showLogo?: boolean
  showDate?: boolean
  showPatientInfo?: boolean
  showAuthorInfo?: boolean
  styling?: { alignment?: 'left' | 'center' | 'right' }
}

interface FooterConfig {
  enabled: boolean
  content: string          // Rich text with variable interpolation
  showPageNumbers?: boolean
  styling?: { alignment?: 'left' | 'center' | 'right' }
}

interface ReportTemplate {
  structure: {
    header?: HeaderConfig
    footer?: FooterConfig
    sections: Section[]
  }
}
```

#### Alternative: Header/footer as pseudo-sections (approach B)
Reutilizar el tipo `Section` existente con un `display` especial (`'header'` o `'footer'`). Esto minimiza cambios en tipos pero mezcla conceptos (header/footer no son secciones del formulario, son áreas de presentación estática).

### Current Renderer Hardcoded Header

`ReportDocumentRenderer.vue` (L3-10):
```html
<div class="report-document__header">
  <h1 class="report-document__title">Informe de Evaluación</h1>
  <div class="report-document__meta">
    <span>Paciente: Juan Pérez García</span>
    <span>Fecha: {{ today }}</span>
  </div>
</div>
```

Este header no usa datos reales del template ni variables del sistema — está completamente hardcodeado.

### Approaches

1. **Header/Footer como configuración de template (recomendado)**
   - Añadir `header?: HeaderConfig` y `footer?: FooterConfig` al `structure` del template
   - Cada uno con `enabled`, `content` (texto con variables), y opciones de estilo
   - El builder tiene un panel dedicado "Cabecera / Pie" con toggles y editor de texto
   - `ReportDocumentRenderer` renderiza header/footer desde props
   - Pros: Modelo limpio, semántica clara, extensible, no mezcla conceptos
   - Cons: Cambio de tipos en `shared/types`, más trabajo en UI
   - Effort: Medium

2. **Header/Footer como secciones especiales (vía `display`)**
   - Añadir valores `'header'` y `'footer'` al enum `display` de Section
   - Reutilizar la infraestructura existente de sections/rows/fields
   - Los campos `fixed_text` dentro de estas secciones especiales forman el header/footer
   - Pros: Menos cambios en tipos, reutiliza drag-drop y properties existentes
   - Cons: Mezcla conceptos (el header no es una sección de formulario), confuso para el usuario, requiere filtrar header/footer en DynamicFormRenderer
   - Effort: Low-Medium

3. **Header/Footer como fixed_text global en el template**
   - Añadir arrays `header_fields: FieldConfig[]` y `footer_fields: FieldConfig[]` al template
   - Solo permitir `fixed_text` en estos arrays
   - Editor simplificado (sin drag-drop de campos)
   - Pros: Simple, no requiere nuevo UI complejo
   - Cons: Limitado, no soporta layout multi-columna, no reutiliza componentes existentes
   - Effort: Low

### Recommendation

**Approach 1 — Header/Footer como configuración de template** es la opción correcta arquitectónicamente. Razones:
- Separación clara de responsabilidades: header/footer son áreas de presentación, no campos de formulario
- `ReportDocumentRenderer` ya tiene estructura visual de header (solo le falta consumir datos reales)
- La interpolación de variables de sistema (`{paciente.nombre}`, `{fecha.hoy}`, etc.) ya existe en `SystemVariableRegistry` y se usa en `fixed_text`
- Extensible: futuro soporte para logos, firmas automáticas, numeración de páginas

Si el esfuerzo es una restricción, el **Approach 2** es una alternativa viable que minimiza nuevos tipos pero requiere disciplina para filtrar secciones especiales en el renderer de formularios.

### Backend Contract Unknowns

- **¿El backend ya soporta header/footer?** Los endpoints actuales (`/admin/report-templates`) aceptan `structure: { sections }`. No hay evidencia de que acepten header/footer. Si el backend valida el payload estrictamente, añadir `header`/`footer` rompería la API. **Se necesita confirmación del backend team.**
- **¿El PDF server-side renderiza header/footer?** El PDF se genera en Laravel (DomPDF). Si el backend ya espera un header/footer en la estructura, el frontend debe enviarlo. Si no, el cambio debe ser coordinado.
- **Contrato API**: Los repositorios envían `Record<string, unknown>` (payload genérico), así que añadir campos nuevos al payload no rompe el tipado del frontend, pero puede ser rechazado por el backend.

### Risks

1. **Coordinación backend**: Si el backend valida la estructura del template, añadir `header`/`footer` puede causar errores 422. Requiere sincronización con el equipo backend.
2. **Migración de templates existentes**: Templates creados sin header/footer deben seguir funcionando. `header.enabled = false` por defecto.
3. **Impacto en report fill**: `DynamicFormRenderer` actualmente solo renderiza sections como formulario. Header/footer no deben aparecer como campos editables — deben ser áreas de solo lectura en el formulario de llenado.
4. **Print CSS**: El `ReportDocumentRenderer` usa dimensiones A4 fijas (210mm × 297mm). Añadir header/footer debe respetar los márgenes de impresión (`@page` CSS).
5. **Variable interpolation cross-module**: `SystemVariableRegistry` vive en `shared/`. Header/footer necesitarán las mismas variables que `fixed_text` ya usa — no debería ser un problema pero debe verificarse.

### Existing Patterns to Follow

- **SystemVariableRegistry**: `src/shared/composables/useSystemVariableRegistry.ts` — ya resuelve variables como `{paciente.nombre}`, `{fecha.hoy}`, `{usuario.nombre}`. Reutilizar para header/footer.
- **fixed_text interpolation**: El patrón `{variable.path}` ya existe en `FixedTextRenderer.vue` y `ReportDocumentRenderer.vue`. Header/footer deben usar el mismo mecanismo.
- **Toggle pattern**: `ToggleSwitch.vue` en shared/components — puede usarse para el toggle `enabled` de header/footer.
- **Modal pattern**: `Modal.vue` en shared — ya usado en PreviewModal y PrintPreviewModal.

### Files to Create (likely)

- `src/modules/admin/report-template/presentation/components/HeaderFooterEditor.vue` — Panel de edición de cabecera y pie en el builder

### Ready for Proposal

**Sí**, pero con una condición previa: **verificar si el backend acepta o aceptará `header`/`footer` en la estructura del template**. Sin esa confirmación, el proposal quedaría incompleto en la sección de API contract.
