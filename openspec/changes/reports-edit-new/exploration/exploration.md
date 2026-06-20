## Exploration: Reports Edit & Create Pages

**Date**: 2026-06-20
**Artifact store**: hybrid (engram + openspec)

---

### Current State

Las dos páginas solicitadas **ya existen y están implementadas** (commit `5060db8`). Ambas comparten el mismo componente: `ReportFillPage.vue`, que discierne el flujo por `route.name`.

| Page | Route | Route Name | Component | Cómo se activa |
|------|-------|------------|-----------|---------------|
| Edit report | `/reports/:id/edit` | `ReportEdit` | `ReportFillPage.vue` | `loadReport(id)` en `onMounted` |
| New report | `/patients/:id/report/new?templateId=x` | `ReportCreate` | `ReportFillPage.vue` | `init(patientId, templateId)` en `onMounted` |

### Affected Areas

#### 1. Router (`src/core/router/index.ts`)
- Línea 44-49: Ruta `/reports/:id/edit` definida con permiso `report.edit`
- Línea 50-55: Ruta `/patients/:id/report/new` definida con permiso `report.create`
- Ambas apuntan a `ReportFillPage.vue` con lazy import
- **Estado**: completo

#### 2. ReportFillPage (`src/modules/reports/presentation/pages/ReportFillPage.vue`)
- Template con: AppSidebar, TopBarLayout, Breadcrumb, DynamicFormRenderer
- Acciones: Guardar borrador, Firmar, Cerrar, Descargar PDF (controladas por permisos)
- Validation errors display
- Loading skeleton
- `onMounted`: discrimina `ReportCreate` vs `ReportEdit` por `route.name`
- Pasa `header-sections` y `footer-sections` al `DynamicFormRenderer`
- **Estado**: completo, funcional

#### 3. useReportForm composable (`src/modules/reports/presentation/composables/useReportForm.ts`)
- `init(patientId, templateId)`: llama a `InitReportUseCase` → POST `/reports`
- `loadReport(id)`: llama a `GetReportUseCase` → GET `/reports/:id`
- `setValue(key, value)`: actualiza valores reactivos, marca dirty, dispara auto-save
- `saveDraft()`: llama a `SaveReportDraftUseCase` → PUT `/reports/:id`
- `sign()`: valida campos requeridos + firma → POST `/reports/:id/sign`
- `close()`: cierra informe firmado → POST `/reports/:id/close`
- `downloadPdf()`: GET `/reports/:id/pdf` y trigger de descarga
- `validateForSignature()`: valida campos requeridos en todas las secciones + firma
- Auto-save con debounce de 2s en `setValue`
- **Estado**: completo, 12 tests

#### 4. DynamicFormRenderer (`src/modules/reports/presentation/components/DynamicFormRenderer.vue`)
- Renderiza 3 zonas:
  - **Header** (read-only): campos `fixed_text` con variables de sistema
  - **Body** (editable/read-only según `isEditable`): secciones con tabs/accordion/default
  - **Footer** (read-only): mismo comportamiento que header
- Soporta modos de display: `tabs`, `accordion`, `default`
- Grid responsive para columnas (1 col en móvil)
- Auto-save integrado (emite `auto-save`)
- **Estado**: completo

#### 5. DynamicField (`src/modules/reports/presentation/components/DynamicField.vue`)
- Renderiza los 12 tipos de campo en modo editable y read-only:
  - text, textarea, number, date
  - select (CustomSelect), radio, multi_select, checkbox
  - fixed_text (FixedTextRenderer), dynamic_table (DynamicTable)
  - vertical_separator, horizontal_separator
- **Estado**: completo

#### 6. PatientReportsTab (`src/modules/patients/presentation/components/PatientReportsTab.vue`)
- Botón "+ Nuevo informe" → abre `TemplatePickerModal`
- Selección de template → navega a `ReportCreate` con `templateId`
- Editar informe → navega a `ReportEdit`
- Ver informe → navega a `ReportView`
- Lista de informes del paciente con estados
- **Estado**: completo

#### 7. API Endpoints (ApiReportRepository)
| Método | Endpoint | Uso |
|--------|----------|-----|
| POST | `/reports` | initReport (patient_id, template_id) |
| GET | `/reports/:id` | getById |
| PUT | `/reports/:id` | saveDraft (values) |
| POST | `/reports/:id/sign` | sign |
| POST | `/reports/:id/close` | close |
| GET | `/reports/:id/pdf` | downloadPdf |
| GET | `/templates/active` | getActiveTemplates |

### Template/Field Configuration (Admin)

#### Domain Model (`src/shared/types/index.ts`)
- `ReportTemplate`: id, name, description, isActive, structure
- `structure`: `{ sections, header?, footer? }`
- `HeaderFooterConfig`: `{ enabled, pageDisplay, sections }`
- Jerarquía: Section → Row → Column → FieldConfig
- 12 `FieldType` variants (discriminated union):
  - `text`, `textarea`, `number`, `date`
  - `select`, `multi_select`, `radio`, `checkbox`
  - `fixed_text`, `dynamic_table`
  - `vertical_separator`, `horizontal_separator`
- `PatientReport`: id, patientId, userId, status, templateStructureSnapshot, values

#### FieldTypeRegistry (`src/shared/types/FieldTypeRegistry.ts`)
- Registry pattern: registrable/queryable by type string
- `FieldTypeMeta`: type, label, icon, group, description, defaultFactory, propertyComponent?, renderComponent?, allowedProperties
- `createDefaultFieldTypeRegistry()`: registra los 12 tipos
- `validateConfig()`: verifica que un FieldConfig solo tenga propiedades permitidas
- Tests: 7 tests

#### Admin Template Builder (`src/modules/admin/report-template/`)
- `ReportTemplateBuilderPage.vue`: builder con 3 paneles (paleta, canvas, propiedades)
- 3 zonas (header, body, footer) con tabs
- Drag-and-drop con vuedraggable
- Undo/redo stack (max 50)
- HeaderFooterEditor: enable/disable + pageDisplay (all/first/last)
- FieldPalette, FieldPropertiesPanel, SectionPanel
- Vista previa (PreviewModal) y vista impresión (PrintPreviewModal)
- `useTemplateBuilder.ts`: ~740 líneas, toda la lógica de estado
- **Estado**: completo

#### Admin API Endpoints (ApiReportTemplateRepository)
| Método | Endpoint |
|--------|----------|
| GET | `/admin/report-templates` |
| GET | `/admin/report-templates/:id` |
| POST | `/admin/report-templates` |
| PUT | `/admin/report-templates/:id` |
| DELETE | `/admin/report-templates/:id` |

### Componentes de soporte
| Componente | Ubicación | Propósito |
|-----------|-----------|-----------|
| FixedTextRenderer | reports/presentation/components/ | Renderiza texto fijo con interpolación de variables |
| DynamicTable | reports/presentation/components/ | Tabla editable con columnas configurables y cálculos |
| SignaturePad | reports/presentation/components/ | Canvas de firma + firma mecanografiada |
| TemplatePickerModal | reports/presentation/components/ | Modal para seleccionar plantilla activa |
| CustomSelect | shared/components/ | Select personalizado usado en DynamicField |
| Modal | shared/components/ | Modal genérico |
| Breadcrumb | shared/components/ | Navegación por migas |

### Gaps Identified

1. **Header/Footer son read-only en el fill page**: El `DynamicFormRenderer` renderiza header y footer con `disabled: true`. Esto es por diseño — contienen `fixed_text` con variables de sistema (nombre paciente, fecha, etc.), no campos que el usuario deba llenar. Si el requisito es que sean editables, hay que cambiar `DynamicFormRenderer`.

2. **No hay vista previa de impresión en el fill page**: Solo existe en el admin builder (`PrintPreviewModal` + `ReportDocumentRenderer`). El `ReportDocumentRenderer` renderiza header/footer repitiendo por página A4 simulada, lo cual NO está disponible en la página de llenado.

3. **Validación limitada al body**: `validateForSignature()` solo itera sobre `snapshot.sections` (body), no header ni footer. Esto es correcto si header/footer son read-only.

4. **Falta el componente ReportDocumentRenderer en el módulo reports**: Solo existe en `admin/report-template/presentation/components/`. Si se quisiera vista previa de impresión en el fill page, habría que moverlo a shared o reports.

### Work Estimates

| Tarea | Esfuerzo | Descripción |
|-------|----------|-------------|
| Verificar funcionalidad | Bajo | Probar que ambos flujos funcionan end-to-end |
| Hacer header/footer editables | Medio | Modificar DynamicFormRenderer para permitir edición en header/footer |
| Integrar vista previa impresión | Medio | Mover ReportDocumentRenderer a shared/reports, añadir botón en ReportFillPage |
| Mejorar validación multi-zona | Bajo | Extender validateForSignature a header/footer si se vuelven editables |
| Tests e2e | Medio | Playwright tests para flujos edit/create |

### Riesgos / Dependencies

- **Backend debe devolver `templateStructureSnapshot` con `header` y `footer`**: Si el backend no incluye estas propiedades en la respuesta del reporte, `DynamicFormRenderer` no las renderizará. Verificar que el endpoint `GET /reports/:id` y `POST /reports` las devuelven.
- **El backend debe aceptar `template_id` en `POST /reports`**: El `InitReportUseCase` envía `patient_id` y `template_id` al backend.
- **Permisos**: Asegurar que los roles tengan `report.edit`, `report.create`, `report.sign`, `report.close`, `report.download-pdf`.
- **Variables de sistema**: `FixedTextRenderer` tiene un `variableResolver` prop que actualmente no se pasa desde `DynamicFormRenderer`. Las variables de sistema (nombre paciente, fecha, etc.) podrían no estar resolviéndose en el fill page.

### Recommendation

**Las páginas ya están implementadas.** No se requiere desarrollo nuevo para los entry points básicos. Recomiendo:

1. **Verificar funcionalidad end-to-end**: Probar con backend real ambos flujos (crear desde paciente, editar existente).
2. **Validar el `variableResolver` en header/footer**: `FixedTextRenderer` acepta un `variableResolver` prop, pero `DynamicFormRenderer` no lo pasa. Las variables de sistema en `fixed_text` del header/footer podrían no estar resolviéndose.
3. **Si el usuario quiere editar header/footer**: Modificar `DynamicFormRenderer` para que acepte una prop `isEditable` por zona (o hacer todo editable).
4. **Si el usuario quiere vista previa de impresión**: Mover `ReportDocumentRenderer` a shared y añadir botón en `ReportFillPage`.

### Ready for Proposal
**Sí** — si se requiere alguna de las mejoras listadas. Si el objetivo es solo confirmar que los entry points existen, la exploración está completa.

### Key Files

| File | Description |
|------|-------------|
| `src/core/router/index.ts` | Definición de rutas, guards de auth y permisos |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Página unificada para edit y create |
| `src/modules/reports/presentation/pages/ReportViewPage.vue` | Vista de solo lectura del reporte |
| `src/modules/reports/presentation/pages/ReportListPage.vue` | Listado de informes con filtros |
| `src/modules/reports/presentation/composables/useReportForm.ts` | Estado reactivo del formulario (init, load, save, sign, close, auto-save) |
| `src/modules/reports/presentation/composables/useReportList.ts` | Listado de informes con filtros |
| `src/modules/reports/presentation/composables/useTemplateList.ts` | Listado de plantillas activas |
| `src/modules/reports/presentation/components/DynamicFormRenderer.vue` | Renderizador de secciones header/body/footer |
| `src/modules/reports/presentation/components/DynamicField.vue` | Renderizador individual de campo (12 tipos) |
| `src/modules/reports/presentation/components/DynamicTable.vue` | Tabla editable con columnas configurables |
| `src/modules/reports/presentation/components/FixedTextRenderer.vue` | Texto fijo con interpolación de variables |
| `src/modules/reports/presentation/components/SignaturePad.vue` | Canvas de firma + firma mecanografiada |
| `src/modules/reports/presentation/components/TemplatePickerModal.vue` | Modal de selección de plantilla |
| `src/modules/reports/domain/entities/PatientReport.ts` | Re-export de PatientReport desde shared/types |
| `src/modules/reports/domain/repositories/ReportRepository.ts` | Interfaz del repositorio (7 métodos) |
| `src/modules/reports/domain/use-cases/InitReportUseCase.ts` | Caso de uso: iniciar reporte desde template |
| `src/modules/reports/domain/use-cases/GetReportUseCase.ts` | Caso de uso: obtener reporte por ID |
| `src/modules/reports/domain/use-cases/SaveReportDraftUseCase.ts` | Caso de uso: guardar borrador |
| `src/modules/reports/domain/use-cases/SignReportUseCase.ts` | Caso de uso: firmar reporte |
| `src/modules/reports/domain/use-cases/CloseReportUseCase.ts` | Caso de uso: cerrar reporte |
| `src/modules/reports/domain/use-cases/DownloadReportPdfUseCase.ts` | Caso de uso: descargar PDF |
| `src/modules/reports/domain/use-cases/GetActiveTemplatesUseCase.ts` | Caso de uso: obtener plantillas activas |
| `src/modules/reports/infrastructure/ApiReportRepository.ts` | Implementación HTTP del repositorio |
| `src/modules/reports/application/containers/reportsContainer.ts` | Fábrica de dependencias (provideX) |
| `src/modules/patients/presentation/components/PatientReportsTab.vue` | Tab de informes en detalle de paciente |
| `src/modules/patients/presentation/pages/PatientDetailPage.vue` | Página de detalle de paciente con tabs |
| `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue` | Builder de plantillas (admin) |
| `src/modules/admin/report-template/presentation/composables/useTemplateBuilder.ts` | Estado del builder (~740 líneas) |
| `src/modules/admin/report-template/presentation/components/PrintPreviewModal.vue` | Vista previa de impresión (admin) |
| `src/modules/admin/report-template/presentation/components/ReportDocumentRenderer.vue` | Renderizador de documento con header/footer por página |
| `src/modules/admin/report-template/infrastructure/ApiReportTemplateRepository.ts` | API de templates (admin) |
| `src/shared/types/index.ts` | Todos los tipos: PatientReport, ReportTemplate, FieldConfig, Section, Row, Column, etc. |
| `src/shared/types/FieldTypeRegistry.ts` | Registry pattern para tipos de campo |
| `src/shared/types/FieldTypeMeta.ts` | Metadata de tipo de campo |
| `src/shared/types/defaultFieldTypeRegistry.ts` | Factory que registra los 12 tipos por defecto |
