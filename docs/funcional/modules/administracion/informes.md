# Módulo Funcional: Administración — Configuración de Campos de Informes

## Propósito de Negocio

Permitir al administrador diseñar visualmente los formularios clínicos que los médicos usarán al generar informes de pacientes. Cada plantilla define qué campos debe rellenar el médico, su tipo, validaciones, valores calculados y variables de sistema precargadas.

## Actores

- Administrador (diseña las plantillas)
- Médico (rellena informes basados en las plantillas)

## Funcionalidades

| Funcionalidad | Estado |
|--------------|--------|
| Catálogo de tipos de campo (texto, número, fecha, selección) | ✅ Implementado |
| Campo de texto fijo con variables de sistema | ✅ Implementado |
| Tabla dinámica con columnas editables y calculadas | ✅ Implementado |
| Paleta de campos arrastrables | ✅ Implementado |
| Panel de propiedades por tipo de campo | ✅ Implementado |
| Tooltip de ayuda IA (`ai_help_description`) | ✅ Implementado |
| Columnas calculadas (sum/avg/count) en tablas dinámicas | ✅ Implementado |
| Totales de pie en tablas dinámicas | ✅ Implementado |
| Variables de sistema con autocompletado | ✅ Implementado |
| Lógica condicional entre campos | ❌ Eliminado (no implementado) |
| Campos de firma digital en plantilla | ❌ No disponible (solo a nivel reporte) |

## Tipos de Campo Soportados

| Tipo | Comportamiento |
|------|---------------|
| **Texto** | Input text/textarea, configurable con maxLength y placeholder |
| **Número** | Input number, configurable con min/max/step y unidad |
| **Fecha** | Input date/datetime, configurable con rango y valor por defecto |
| **Selección** | Select/radio/checkbox, configurable con opciones personalizadas |
| **Texto Fijo** | Bloque de texto read-only con interpolación de variables del sistema |
| **Tabla Dinámica** | Grid de N filas con columnas editables, calculadas y totales |

## Criterios de Aceptación

- El administrador puede arrastrar un tipo de campo desde la paleta al canvas
- El administrador puede editar las propiedades del campo seleccionado
- El administrador puede eliminar campos del canvas
- El campo de texto fijo interpola variables del sistema en tiempo real
- Las tablas dinámicas permiten columnas calculadas con operaciones sum/avg/count
- Las tablas dinámicas muestran fila de totales configurable
- El administrador puede guardar la plantilla completa como JSON

## Reglas de Negocio

- Cada campo debe tener una `key` única dentro de la plantilla
- Los campos de tipo `fixed_text` no se incluyen en los datos de entrada del médico (son decorativos)
- Las columnas calculadas son read-only en el formulario de reporte
- Las variables de sistema se precargan automáticamente si el contexto del paciente está disponible
- La validación de campos requeridos ocurre al firmar el informe, no al guardar borrador

## Flujo Principal

1. Administrador navega a `Configuración > Plantillas > [Plantilla] > Editar Campos`
2. Ve la interfaz de 3 paneles: paleta | canvas | propiedades
3. Arrastra un tipo de campo desde la paleta al canvas
4. Selecciona el campo en el canvas para ver/editar sus propiedades
5. Configura label, key, validaciones, y opciones específicas del tipo
6. Opcionalmente configura variables de sistema (autocompletado con `{`)
7. Opcionalmente configura columnas calculadas o totales en tablas dinámicas
8. Guarda la plantilla

## Flujo de Reporte (Médico)

1. Médico abre un informe de paciente basado en la plantilla
2. Ve los campos según el diseño configurado por el administrador
3. Los campos `fixed_text` se muestran como texto decorativo con variables ya resueltas
4. Las tablas dinámicas permiten añadir/quitar filas
5. Las columnas calculadas se actualizan automáticamente
6. Los totales de pie se recalculan al modificar datos

## Dependencias

- API: `GET /api/report-templates`, `POST /api/report-templates`, `PUT /api/report-templates/{id}`
- Variables de sistema: expuestas por API `/api/system-variables` (o embebidas en configuración)
- Evaluación de expresiones: cliente-side con parser aritmético seguro
