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
| Impresión mediante diálogo del navegador | ⚠️ Implementación parcial — deshabilitada para entrega TFM |
| Descarga directa de PDF | ❌ Eliminado (sustituido por impresión pendiente) |

## Criterios de Aceptación

- El médico puede crear un informe seleccionando una plantilla activa.
- El borrador se guarda automáticamente cada 2 segundos de inactividad.
- El botón "Firmar" solo está habilitado si todos los campos obligatorios están completos.
- La firma puede ser dibujada en canvas o tipeada.
- Una vez firmado, el informe no admite más ediciones.
- El botón "Imprimir" está oculto temporalmente; se implementará de forma completa en una versión posterior.
- ~Al pulsar "Imprimir" se muestra un skeleton con el texto "Preparando impresión...".~
- ~El navegador abre su diálogo de impresión con el documento renderizado.~

## Reglas de Negocio

- Solo el autor del informe puede firmarlo.
- Solo informes en estado `signed` pueden archivarse.
- El archivado genera un PDF cliente y lo adjunta al informe en el backend.
- El informe impreso incluye cabecera, cuerpo con el layout de la plantilla y firma digital.
- Campos vacíos se omiten en la versión impresa.

## Flujo Principal (Impresión) — Pendiente

> **Nota:** La impresión está deshabilitada para la entrega del TFM. El código base (`printReport` en `useReportForm.ts`) existe pero necesita pulir edge cases de renderizado, paginación y carga de imágenes.

1. El médico abre un informe firmado o archivado.
2. Pulsa "Imprimir" (botón oculto actualmente).
3. El sistema muestra un skeleton mientras renderiza el documento en un iframe oculto.
4. Aparece el diálogo de impresión del navegador.
5. El médico elige impresora, guarda como PDF o cancela.
6. El iframe se destruye automáticamente al cerrar el diálogo.

## Flujos Alternativos

- **Logo no disponible:** el informe se imprime sin el logo de la clínica.
- **Error de renderizado:** se muestra alerta genérica y se oculta el skeleton.
- **Cancelar impresión:** el diálogo se cierra y el iframe se limpia igualmente.

## Dependencias

- Módulo de pacientes (datos demográficos).
- Módulo de autenticación (usuario autor).
- Módulo de configuración de clínica (logo, dirección, teléfono).
- Módulo de plantillas de informes (`report-template`).

## Estado de Desarrollo

Implementado. El flujo de impresión reemplazó a la descarga directa de PDF.

## Pendientes (Roadmap)

- Evaluar si se requiere vista previa de impresión antes de abrir el diálogo.
- Mejorar manejo de imágenes rotas (logo de clínica) mostrando placeholder.
- Revisar calidad del PDF generado para archivado (actualmente html2pdf.js).
