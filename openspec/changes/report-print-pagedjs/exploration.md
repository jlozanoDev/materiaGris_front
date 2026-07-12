## Exploration: report-print-pagedjs

### Current State

**Print button status:** El botón "Imprimir" está completamente deshabilitado en ambas páginas de informes:
- `ReportViewPage.vue` (línea 55): `v-if="false"`
- `ReportFillPage.vue` (línea 119): `v-if="false"`

Ambas páginas ya tienen un skeleton overlay con spinner para cuando `isPrinting === true`:
```html
<div v-if="isPrinting" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
  <div class="h-12 w-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
  <p class="mt-4 text-sm font-medium text-slate-700">Preparando impresión...</p>
</div>
```

**Flujo actual de impresión (`useReportForm.ts` printReport):**
1. Crea un iframe oculto (`position:fixed;left:-9999px`)
2. Monta `ReportPdfExport.vue` dentro con `createApp`
3. Copia stylesheets del documento principal al iframe
4. Espera 800ms + nextTick
5. `window.print()` en el iframe
6. Cleanup vía `onafterprint` + fallback 60s

**Flujo PDF/archive (`useReportPdf.ts`):**
1. Usa `html2pdf.js` para generar PDF
2. Clona DOM en iframe oculto, computa estilos inline
3. Convierte a `Blob` (usado en flujo `archive()`)

**`ReportPdfExport.vue`** wrappea `ReportDocumentRenderer` con datos reales del informe (`report`, `patient`, `user`, `signatureUrl`) y un `variableResolver` que interpola `{fecha.hoy}`, `{paciente.nombre}`, etc.

### Affected Areas

| Archivo | Por qué |
|---------|---------|
| `src/modules/reports/presentation/composables/useReportForm.ts` | Contiene `printReport()` y `isPrinting` — reemplazar con flujo pagedjs |
| `src/modules/reports/presentation/composables/useReportPdf.ts` | Actualmente usa html2pdf.js — se reemplaza con pagedjs |
| `src/modules/reports/presentation/components/ReportPdfExport.vue` | Componente usado en iframe; podría eliminarse o adaptarse |
| `src/modules/reports/presentation/pages/ReportViewPage.vue` | Cambiar `v-if="false"` a `v-if="canPrint"` y conectar nuevo flujo |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Igual que arriba |
| `src/modules/reports/domain/use-cases/DownloadReportPdfUseCase.ts` | Descarga PDF del backend — no afectado directamente pero relacionado |
| `src/modules/admin/report-template/presentation/components/PrintPreviewModal.vue` | **Referencia directa** — ya existe un modal de previsualización de impresión |
| `src/modules/admin/report-template/presentation/components/ReportDocumentRenderer.vue` | **Renderer central** — renderiza secciones/rows/columns/fields con dimensiones A4 (210mm) |
| `src/shared/components/Modal.vue` | Sistema modal compartido (size `xl`: max-w-4xl) |
| `package.json` | pagedjs NO instalado — solo html2pdf.js |

### Existing Template: PrintPreviewModal

Ya existe `PrintPreviewModal.vue` en admin que es exactamente lo que se necesita:
- Abre un `Modal` con title `"Vista impresión: {templateName}"`
- Muestra `ReportDocumentRenderer` con:
  - `:sections` (body)
  - `:header-sections` / `:footer-sections`
  - `:values` (exampleData)
  - `:variable-resolver`
- El renderer aplica CSS de A4: `width: 210mm, padding: 20mm, box-shadow, max-height: calc(100vh - 260px)`

Este es el molde casi exacto para el nuevo componente de impresión.

### pagedjs Analysis

**Estado de instalación:** NO instalado. Solo `html2pdf.js@0.14.0` está presente.

**Qué es pagedjs:** Librería JavaScript open-source que implementa la especificación CSS Paged Media. Renderiza contenido HTML en páginas paginadas para vista previa e impresión. Usa el DOM real del navegador (no canvas como html2pdf).

**Qué necesita:**
1. `npm install pagedjs` 
2. Un contenedor DOM donde pagedjs hace `Preview` → renderiza el contenido en páginas con dimensiones A4
3. Llamar a `new Preview()` sobre el contenedor DOM
4. Opcional pero típico: usar `window.print()` después del renderizado

**API típica:**
```typescript
import { Preview } from 'pagedjs'

const preview = new Preview()
const flow = await preview.preview(
  document.getElementById('print-content'),
  ['/path/to/pagedjs-interface.css'], // estilos pagedjs
  document.getElementById('preview-container')
)
// flow.total → número de páginas
// Luego: window.print()
```

### Approaches

#### 1. Modal con ReportDocumentRenderer + pagedjs + window.print()

Crear un nuevo componente `ReportPrintModal.vue` que:
- Abra un `Modal` (size: xl, customClass: bg-[#f0f0f0])
- Renderice `ReportDocumentRenderer` con datos reales del informe
- Use pagedjs `Preview` para paginar el contenido dentro del modal
- Muestre un preview de las páginas renderizadas
- Al hacer clic en "Imprimir" dentro del modal → `window.print()`

**Pros:**
- UX excelente: el usuario ve EXACTAMENTE lo que se va a imprimir
- Reutiliza `ReportDocumentRenderer` existente
- Reutiliza `Modal` existente
- pagedjs maneja saltos de página, headers/footers de página correctamente
- Similar en espíritu al `PrintPreviewModal` ya implementado
- Limpio: no necesita iframes ocultos

**Cons:**
- pagedjs es una nueva dependencia (~140KB)
- Complejidad adicional de esperar a que pagedjs termine de renderizar antes de imprimir
- Posibles conflictos con Tailwind/CSS global

**Effort:** Medium

#### 2. Rehabilitar flujo actual (iframe + window.print) sin pagedjs

Simplemente cambiar `v-if="false"` → `v-if="canPrint"` y arreglar bugs del flujo existente.

**Pros:**
- Sin nueva dependencia
- Código ya existe
- Menos esfuerzo inicial

**Cons:**
- El usuario pidió explícitamente pagedjs y modal preview
- El flujo actual ya fue abandonado ("deje aparcada la impresion por varios motivos")
- Sin preview visual — el usuario no ve qué imprime hasta que sale el diálogo del navegador
- El enfoque de iframe es frágil (estilos, imágenes, renderizado asíncrono)

**Effort:** Low

### Recommendation

**Approach 1** — Modal con ReportDocumentRenderer + pagedjs + window.print(). Es lo que el usuario pidió explícitamente y hay un molde casi exacto (`PrintPreviewModal.vue`) que demuestra que funciona. La estructura sería:

1. **Nuevo componente:** `ReportPrintModal.vue` (en `src/modules/reports/presentation/components/`)
   - Props: `show`, `report` (PatientReport), `patient`, `user`, `signatureUrl`
   - Body: `ReportDocumentRenderer` con los datos reales
   - Footer: botón "Imprimir" que dispara pagedjs → window.print()
   - Usa el `Modal` compartido con size `xl`

2. **Nuevo composable:** `usePrintReport.ts` (o extender `useReportForm.ts`)
   - Estado: `showPrintModal`, `isRendering`
   - Método: `openPrintModal()` que carga los datos si hace falta
   - Método: `doPrint()` que ejecuta pagedjs y luego window.print()

3. **Reactivar botones:** Cambiar `v-if="false"` → `v-if="canPrint"` en ambas páginas
   - El botón abre el modal en lugar de llamar al iframe

4. **CSS print:** Añadir media query `@media print` que oculte sidebar, topbar, breadcrumbs, etc.

### Risks

- **pagedjs + Tailwind 4**: Tailwind 4 usa `@reference` y CSS layers; pagedjs espera CSS estándar. Puede haber conflictos de estilo en el output impreso.
- **Rendering asíncrono**: pagedjs renderiza progresivamente; esperar a que termine requiere polling o eventos — documentar bien el patrón.
- **Imágenes/Assets**: El logo de la clínica y firmas (base64/URLs) deben ser accesibles desde el DOM del modal para que pagedjs las capture.
- **Modal scroll vs print**: El modal tiene `overflow-y-auto` pero la impresión debe capturar todo el contenido, no solo lo visible.
- **html2pdf.js sigue en dependencias**: No se debe eliminar porque `useReportPdf.ts` lo usa en el flujo de `archive()`. Solo se reemplaza el flujo de impresión directa.

### Ready for Proposal

**Yes.** El análisis revela que:
1. Ya existe un `PrintPreviewModal` funcional en admin como referencia directa
2. `ReportDocumentRenderer` es el componente de renderizado que funciona para ambas vistas
3. El `Modal` compartido tiene el tamaño necesario (`xl`)
4. La estructura de datos (`PatientReport`, `Section[]`, etc.) es conocida
5. Los componentes de página ya tienen el permiso `canPrint` y el skeleton overlay
6. Solo falta: instalar pagedjs, crear el modal con datos reales, y conectar los botones

**Next phase:** `propose`
