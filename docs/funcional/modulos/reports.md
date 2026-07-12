# Módulo Funcional: Reports (Informes Clínicos)

## Propósito de Negocio

Permitir a los profesionales médicos crear, editar, firmar digitalmente e imprimir informes clínicos basados en plantillas configuradas por el administrador. Cada informe queda vinculado a un paciente y a un profesional autor, con un ciclo de vida de `borrador → firmado → archivado`.

## Actores

- **Médico / Profesional autor:** crea, edita, firma e imprime informes.
- **Administrador:** define las plantillas subyacentes (en otro módulo).

## Funcionalidades

| Funcionalidad | Estado |
|--------------|--------|
| Crear informe desde plantilla | ✅ Implementado |
| Edición con autoguardado de borrador | ✅ Implementado |
| Validación de campos obligatorios al firmar | ✅ Implementado |
| Firma digital (canvas o texto) | ✅ Implementado |
| Archivado de informes firmados | ✅ Implementado |
| Impresión mediante diálogo del navegador | ✅ Implementado (pagedjs, nueva pestaña) |
| Descarga directa de PDF | ❌ Eliminado (sustituido por impresión) |

## Criterios de Aceptación

- El médico puede crear un informe seleccionando una plantilla activa.
- El borrador se guarda automáticamente cada 2 segundos de inactividad.
- El botón "Firmar" solo está habilitado si todos los campos obligatorios están completos.
- La firma puede ser dibujada en canvas o tipeada.
- Una vez firmado, el informe no admite más ediciones.
- El botón "Imprimir" aparece para informes en estado `signed` o `archived` si el usuario tiene permiso `report.download-pdf`.
- Al pulsar "Imprimir" se abre una nueva pestaña del navegador con la previsualización del informe en formato A4.
- Mientras se cargan los datos del informe, se muestra un spinner con el texto "Cargando informe...".
- En la nueva pestaña aparece el botón "Imprimir" junto con la previsualización del documento.
- Al pulsar "Imprimir" se abre el diálogo nativo del navegador mostrando solo el contenido del informe (sin toolbar).
- Si ocurre un error de carga, se muestra un mensaje de error en la página con un botón "Volver" que cierra la pestaña.

## Reglas de Negocio

- Solo el autor del informe puede firmarlo.
- Solo informes en estado `signed` pueden archivarse.
- El archivado genera un PDF cliente y lo adjunta al informe en el backend.
- El informe impreso incluye cabecera, cuerpo con el layout de la plantilla, pie de página y firma digital, renderizado por `ReportPrintDocument` y paginado en formato A4 mediante las reglas CSS `@page` del navegador.
- Campos vacíos se omiten en la versión impresa.

## Flujo Principal (Impresión)

1. El médico abre un informe firmado o archivado.
2. Pulsa "Imprimir" (visible si tiene permiso `report.download-pdf` y el informe no es borrador).
3. Se abre una nueva pestaña del navegador con la página de impresión (`/reports/:id/print`).
4. Mientras se cargan los datos del informe, se muestra un spinner con el texto "Cargando informe...".
5. Una vez cargados, se renderiza la previsualización del informe en formato A4 con la barra de herramientas visible.
6. El médico pulsa "Imprimir" y se abre el diálogo nativo del navegador con el documento paginado.
7. El médico elige impresora, guarda como PDF o cancela.
8. Al cerrar el diálogo, la pestaña permanece abierta; el médico puede cerrarla manualmente.

## Flujos Alternativos

- **Logo no disponible:** el informe se imprime sin el logo de la clínica.
- **Logo no disponible:** el informe se imprime sin el logo de la clínica.
- **Error de carga del informe:** se muestra un mensaje de error en la página. El médico puede cerrar la pestaña y reintentar desde la vista del informe.
- **Cancelar impresión:** el diálogo del navegador se cierra y la pestaña permanece abierta; el médico puede volver a imprimir o cerrar la pestaña.

## Dependencias

- Módulo de pacientes (datos demográficos).
- Módulo de autenticación (usuario autor).
- Módulo de configuración de clínica (logo, dirección, teléfono).
- Módulo de plantillas de informes (`report-template`).

## Estado de Desarrollo

Implementado. El flujo de impresión abre una nueva pestaña del navegador con la previsualización del informe. Usa `ReportPrintDocument` para el renderizado y las reglas CSS `@page` para la paginación A4. La librería pagedjs se carga en la página pero su paginación activa se mantiene deshabilitada porque generaba páginas en blanco con el contenido del informe.

## Pendientes (Roadmap)

- Mejorar manejo de imágenes rotas (logo de clínica) mostrando placeholder.
- Revisar calidad del PDF generado para archivado (actualmente html2pdf.js).
