# Proposal: Cabecera y pie configurables en plantillas de informe

## Intent

El builder de plantillas actual solo permite diseñar el cuerpo del informe. La cabecera del documento impreso está hardcodeada (`ReportDocumentRenderer.vue` L3-10, datos ficticios). El pie no existe. El usuario necesita un header y footer configurables que usen el mismo sistema drag-and-drop de secciones/filas/columnas/campos que ya conoce del cuerpo, para que cada plantilla tenga identidad visual y metadatos institucionales reales.

## Scope

### In Scope
- Header y footer cada uno con su propia lista de `Section[]` reutilizando el mismo sistema builder (drag-drop, Section→Row→Column→Field, 10 tipos de campo)
- Toggle `enabled` para activar/desactivar cabecera y pie por plantilla
- Selector `pageDisplay`: `all` | `first` | `last` (visibilidad por página)
- Renderizado dinámico en `ReportDocumentRenderer` (vista previa de impresión)
- Renderizado en `PreviewModal` / `ReportFillPage` / `ReportViewPage` usando el `DynamicFormRenderer` con props nuevas
- Persistencia en el campo `structure` del JSON (sin cambios en API backend)

### Out of Scope
- Editor de texto enriquecido separado (usa campos `fixed_text` existentes)
- Logos/imágenes como tipo de campo nuevo
- Reglas condicionales para header/footer
- Numeración de página automática (se logra con `fixed_text` + `{pagina.actual}`)
- Vista previa A4 multi-página real (cambio posterior)

## Capabilities

### New Capabilities
- `report-header-footer`: Configuración, builder, renderizado y persistencia de cabecera y pie en plantillas de informe

### Modified Capabilities
- `template-builder`: Añade pestañas de cabecera/pie en el builder, métodos `loadTemplate`/`saveTemplate` incluyen header y footer
- `dynamic-form-renderer`: Acepta props `headerSections` y `footerSections` para renderizar áreas de solo lectura arriba y abajo del formulario

## Approach

1. **Tipos**: Añadir `HeaderFooterConfig { enabled, pageDisplay, sections: Section[] }` a `shared/types`. `ReportTemplate.structure` gana `header?` y `footer?`.
2. **Builder UI**: `ReportTemplateBuilderPage` añade tabs "Cabecera | Cuerpo | Pie". Cada tab comparte el mismo `BuilderCanvas`, `FieldPalette`, `FieldPropertiesPanel`. El composable `useTemplateBuilder` duplica el pattern de `sections` para `headerSections` y `footerSections`.
3. **Composable**: `useTemplateBuilder` gana `headerSections`, `footerSections`, `headerEnabled`, `footerEnabled`, `headerPageDisplay`, `footerPageDisplay`. `saveTemplate` serializa los tres grupos en `structure`.
4. **Renderizado impresión**: `ReportDocumentRenderer` reemplaza header hardcodeado por render dinámico de `headerSections`. Añade bloque footer renderizando `footerSections`.
5. **Renderizado formulario**: `DynamicFormRenderer` añade slots/props para header y footer. `ReportFillPage` y `ReportViewPage` pasan `headerSections`/`footerSections` desde `templateStructureSnapshot`.
6. **Compatibilidad**: Templates existentes sin `header`/`footer` en structure — `enabled=false` por defecto, sin migración.

## Data Model

```ts
interface HeaderFooterConfig {
  enabled: boolean
  pageDisplay: 'all' | 'first' | 'last'
  sections: Section[]
}

// ReportTemplate.structure cambia de:
{ sections: Section[] }
// a:
{
  sections: Section[],       // cuerpo (existente)
  header?: HeaderFooterConfig,
  footer?: HeaderFooterConfig,
}
```

`PatientReport.templateStructureSnapshot` hereda la misma forma.

## UI Changes

| Componente | Cambio |
|---|---|
| `ReportTemplateBuilderPage` | Tabs: Cabecera / Cuerpo / Pie. Cada tab comparte canvas + palette + properties. |
| `PrintPreviewModal` | Pasa `headerSections`/`footerSections` a `ReportDocumentRenderer` |
| `PreviewModal` | Pasa header/footer sections como área de solo lectura |
| `ReportFillPage` | Extrae `header`/`footer` del snapshot y los renderiza arriba/abajo |
| `ReportViewPage` | Idem |

## Component Impact

| Archivo | Impacto |
|---|---|
| `shared/types/index.ts` | + `HeaderFooterConfig`, mod `ReportTemplate.structure`, mod `PatientReport.templateStructureSnapshot` |
| `useTemplateBuilder.ts` | + estado y métodos header/footer, + serialización en `saveTemplate`/`loadTemplate` |
| `ReportTemplateBuilderPage.vue` | + tabs selector (cabecera/cuerpo/pie) |
| `ReportDocumentRenderer.vue` | + props `headerSections`/`footerSections`, reemplaza header hardcodeado |
| `DynamicFormRenderer.vue` | + props `headerSections`/`footerSections` (solo lectura) |
| `PrintPreviewModal.vue` | + pasa header/footer props |
| `PreviewModal.vue` | + pasa header/footer props |
| `ReportFillPage.vue` | + extrae y pasa header/footer del snapshot |
| `ReportViewPage.vue` | + idem |

**Archivo nuevo**: `HeaderFooterEditor.vue` (panel de toggle + pageDisplay para cabecera/pie).

## API Contract

Sin cambios. El backend recibe `structure` como JSON blob. Los endpoints `POST|PUT /admin/report-templates` ya aceptan `structure: object`. Añadir `header`/`footer` no requiere migración de API.

Payload enviado:
```json
{
  "name": "...",
  "description": "...",
  "structure": {
    "sections": [...],
    "header": { "enabled": true, "pageDisplay": "first", "sections": [...] },
    "footer": { "enabled": true, "pageDisplay": "all", "sections": [...] }
  }
}
```

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Backend valida estructura y rechaza `header`/`footer` | Low | Exploración confirma que backend acepta JSON arbitrario en `structure`. Si ocurre, coordinar con backend para relajar validación. |
| Templates existentes sin header/footer rompen al cargar | Low | `enabled: false` por defecto. `loadTemplate` mergea con defaults. |
| `DynamicFormRenderer` renderiza header/footer como campos editables | Medium | Usar prop condicional — si `headerSections`, renderizar como `fixed_text` readonly, no como inputs. |
| Print CSS se rompe al añadir header/footer dinámico | Medium | Mantener dimensiones A4 existentes. Header/footer usan `position: fixed` en `@page` para repetir por página. Test visual con Playwright. |
| Duplicación de lógica builder para 3 zonas | Low | Extraer builder core a un composable genérico (`useSectionBuilder`) reutilizado por header/body/footer. |

## Non-goals

- NO nuevo tipo de campo para logos o imágenes
- NO editor WYSIWYG separado (usar `fixed_text` con markdown + interpolación de variables)
- NO multi-page renderer real (sigue siendo mock A4 single-page)
- NO reglas condicionales para header/footer
- NO cambios en backend (migraciones, endpoints, validación)

## Recommendation for Specs Phase

Crear spec `report-header-footer` con:
- Configuración de header/footer (tipos, defaults, pageDisplay)
- Comportamiento del builder con 3 tabs
- Renderizado en `ReportDocumentRenderer` (print) y `DynamicFormRenderer` (form fill)
- Compatibilidad con templates existentes (sin header/footer)
- Escenarios de variables de sistema en header/footer (`fixed_text` interpolation)
