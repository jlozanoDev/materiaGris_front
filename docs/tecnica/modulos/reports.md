# Módulo Técnico: Reports

## Descripción

Gestión del ciclo de vida de los informes clínicos: creación, edición, firma digital, archivado e impresión. El módulo vive en `src/modules/reports/` y sigue la arquitectura por features del frontend.

## Estructura

```
src/modules/reports/
├── application/containers/reportsContainer.ts   # Inyección de dependencias
├── domain/use-cases/                            # Casos de uso (Sign, Archive, etc.)
├── infrastructure/ApiReportRepository.ts        # Implementación HTTP con fetchClient
├── presentation/
│   ├── components/ReportPdfExport.vue           # Renderizador de impresión/PDF
│   ├── components/DynamicFormRenderer.vue       # Renderizado editable/lectura del formulario
│   ├── composables/useReportForm.ts             # Estado y lógica del formulario de informe
│   ├── pages/ReportViewPage.vue                 # Vista de informe firmado/archivado
│   ├── pages/ReportFillPage.vue                 # Edición y firma del informe
│   └── pages/ReportListPage.vue                 # Listado de informes
```

## Componentes Clave

### `ReportPdfExport.vue`

Componente puro de renderizado para impresión/PDF. Recibe:

- `report: PatientReport` — datos del informe incluyendo `templateStructureSnapshot` y `values`
- `signatureUrl?: string` — firma en base64/data URL
- `patient?`, `user?` — contexto adicional para variables de sistema

Expone `generatePdf(): Promise<Blob>` para el flujo de archivado, delegando en `useReportPdf.ts`.

### `useReportForm.ts`

Composable central del formulario. expone:

| Ref/Fn | Propósito |
|--------|-----------|
| `report` | Informe cargado |
| `values` | Valores editables de los campos |
| `isLoading` | Carga inicial del informe |
| `isSaving` | Guardando borrador o archivando |
| `isPrinting` | Preparando impresión (skeleton) |
| `errorMessage` | Errores de carga/operaciones |
| `loadReport(id)` | Carga informe existente |
| `saveDraft()` | Guarda borrador |
| `sign()` | Valida y firma el informe |
| `archive()` | Genera PDF cliente y sube blob al backend |
| `printReport()` | Renderiza en iframe y abre diálogo de impresión (deshabilitado en UI) |

## Lógica de Impresión

> **Nota:** La funcionalidad de impresión está deshabilitada en la UI para la entrega del TFM. El código base (`printReport`) existe en `useReportForm.ts` pero requiere más trabajo de pulido.

La impresión se resuelve completamente en el cliente:

1. `printReport()` crea un `iframe` oculto.
2. Copia las hojas de estilo del documento principal al iframe.
3. Monta `ReportPdfExport` en el body del iframe.
4. Resetea la posición off-screen del contenedor `.report-pdf-export`.
5. Muestra `isPrinting = false` y llama a `iframe.contentWindow.print()`.
6. `onafterprint` + fallback de 60s limpian el iframe y desmontan la app.

## Archivado

El flujo de archivado sigue generando un PDF cliente con `html2pdf.js` a través de `useReportPdf.ts` y subiendo el blob al endpoint `/reports/{id}/archive`. Este path no ha cambiado.

## Permisos

- `report.edit` — editar borradores
- `report.sign` — firmar informes
- `report.archive` — archivar informes firmados
- `report.download-pdf` — imprimir informes firmados/archivados (permiso reutilizado para impresión)

## Dependencias

- `html2pdf.js` — usado únicamente por `archive()` para generar el blob PDF
- Vue 3 `createApp` — renderizado dinámico del componente de impresión
- `useReportVariableResolver` — resolución de variables de sistema (`{clinica.logo}`, `{paciente.nombre}`, etc.)

## Notas Técnicas

- El botón de impresión solo aparece para informes en estado `signed` o `archived`.
- El skeleton de impresión se renderiza en `ReportViewPage.vue` y `ReportFillPage.vue` usando `isPrinting`.
- La URL del logo de clínica puede venir rota del backend; el flujo de impresión la tolera mostrando el documento sin logo.
