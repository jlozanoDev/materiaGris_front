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
│   ├── components/ReportPrintDocument.vue       # Renderizador pagedjs-compatible para impresión
│   ├── components/DynamicFormRenderer.vue       # Renderizado editable/lectura del formulario
│   ├── composables/useReportForm.ts             # Estado y lógica del formulario de informe
│   ├── pages/ReportViewPage.vue                 # Vista de informe firmado/archivado
│   ├── pages/ReportFillPage.vue                 # Edición y firma del informe
│   ├── pages/ReportPrintPage.vue                # Página independiente de impresión con pagedjs
│   └── pages/ReportListPage.vue                 # Listado de informes
```

## Componentes Clave

### `ReportPdfExport.vue`

Componente puro de renderizado para impresión/PDF. Recibe:

- `report: PatientReport` — datos del informe incluyendo `templateStructureSnapshot` y `values`
- `signatureUrl?: string` — firma en base64/data URL
- `patient?`, `user?` — contexto adicional para variables de sistema

Expone `generatePdf(): Promise<Blob>` para el flujo de archivado, delegando en `useReportPdf.ts`.

### `ReportPrintDocument.vue`

Renderizador pagedjs-compatible para la página de impresión. Reemplaza a `ReportDocumentRenderer` en el flujo de impresión porque el original usa Tailwind grid y `v-html` que rompen la paginación de pagedjs.

Recibe las mismas props que `ReportDocumentRenderer`:

- `sections`, `headerSections`, `footerSections` — secciones del template
- `headerEnabled`, `footerEnabled` — flags de activación
- `values` — valores del informe
- `variableResolver` — resolución de variables `{...}`
- `signatureUrl` — imagen de firma

**Reglas de renderizado:**
- Usa HTML plano con CSS basado en clases (NO Tailwind, NO CSS grid)
- Columnas con `display: inline-block` + porcentajes de ancho
- `v-html` seguro para `fixed_text` (el contenido viene del WYSIWYG)
- Tablas HTML nativas para `dynamic_table`
- `page-break-inside: avoid` en secciones y filas para mejorar la salida nativa de impresión

### `ReportPrintPage.vue`

Página independiente (nueva pestaña del navegador) para impresión con pagedjs. Recibe el `id` del informe por ruta (`/reports/:id/print`).

Internamente:
- Carga el informe mediante `provideGetReportUseCase()` y datos del paciente mediante `provideGetPatientUseCase()`.
- Renderiza `ReportPrintDocument.vue` con HTML/CSS optimizado para impresión.
- Carga el polyfill de pagedjs con `PagedConfig.auto: false`; la paginación activa de pagedjs se desactivó porque generaba páginas en blanco con el contenido del informe.
- La paginación A4 final la gestionan las reglas CSS `@page` y la impresora del navegador.
- `window.print()` abre el diálogo nativo del navegador.
- La barra de herramientas tiene clase `.no-print` para ocultarse durante la impresión.
- El botón "Cerrar" ejecuta `window.close()`.

### `useReportForm.ts`

Composable central del formulario. Expone:

| Ref/Fn | Propósito |
|--------|-----------|
| `report` | Informe cargado |
| `values` | Valores editables de los campos |
| `isLoading` | Carga inicial del informe |
| `isSaving` | Guardando borrador o archivando |
| `errorMessage` | Errores de carga/operaciones |
| `loadReport(id)` | Carga informe existente |
| `saveDraft()` | Guarda borrador |
| `sign()` | Valida y firma el informe |
| `archive()` | Genera PDF cliente y sube blob al backend |

## Lógica de Impresión

La impresión se resuelve completamente en el cliente abriendo una nueva pestaña del navegador:

1. El usuario pulsa "Imprimir" en la vista del informe firmado/archivado.
2. `openPrintTab()` resuelve la ruta `/reports/:id/print` mediante `router.resolve()` y abre una nueva pestaña con `window.open(href, '_blank', 'noopener,noreferrer')`.
3. `ReportPrintPage.vue` carga el informe y los datos del paciente, renderiza `ReportPrintDocument.vue` con HTML/CSS optimizado para impresión A4.
4. El polyfill de pagedjs se carga con `PagedConfig.auto: false`; la librería está disponible pero su paginación activa se desactivó por incompatibilidad con el contenido del informe.
5. La paginación final la gestionan las reglas CSS `@page` y el diálogo de impresión nativo del navegador.
6. Al pulsar "Imprimir", se llama a `window.print()`.
7. Las reglas CSS `@page` (definidas en `src/assets/css/print.css` y en el scoped style de `ReportPrintPage.vue`) definen tamaño A4 y márgenes.
8. El CSS `@media print` oculta la barra de herramientas (clase `.no-print`).
9. Al cerrar el diálogo nativo, la pestaña permanece abierta; el usuario puede cerrarla manualmente.

En caso de error durante la carga de datos, se muestra un mensaje de error en la página con un botón "Volver".

## Archivado

El flujo de archivado sigue generando un PDF cliente con `html2pdf.js` a través de `useReportPdf.ts` y subiendo el blob al endpoint `/reports/{id}/archive`. Este path no ha cambiado.

## Permisos

- `report.edit` — editar borradores
- `report.sign` — firmar informes
- `report.archive` — archivar informes firmados
- `report.download-pdf` — imprimir informes firmados/archivados (permiso reutilizado para impresión)

## Dependencias

- `html2pdf.js` — usado únicamente por `archive()` para generar el blob PDF
- `pagedjs` — librería cargada en la página de impresión (paginación activa deshabilitada por incompatibilidad con el contenido)
- `useReportVariableResolver` — resolución de variables de sistema (`{clinica.logo}`, `{paciente.nombre}`, etc.)

## Notas Técnicas

- El botón de impresión solo aparece para informes en estado `signed` o `archived`.
- El permiso `report.download-pdf` controla la visibilidad del botón "Imprimir" (reutilizado del flujo anterior).
- La URL del logo de clínica puede venir rota del backend; el flujo de impresión la tolera mostrando el documento sin logo.
- La nueva pestaña se abre con `noopener,noreferrer` por seguridad.
- pagedjs está incluido como dependencia y se carga en la página de impresión, pero su paginación activa se mantiene desactivada (`auto: false`) porque generaba páginas en blanco con el contenido del informe. La paginación A4 se resuelve con CSS `@page` y el motor de impresión del navegador.
