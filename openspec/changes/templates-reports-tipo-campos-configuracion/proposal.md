# Proposal: Reemplazo del Configurador de Campos de Plantillas

## Intent

Reemplazar el módulo `admin/report-template` existente por un nuevo sistema de configuración de campos con control granular por tipo: cada tipo de campo expone sus propiedades específicas en el builder visual y el renderizador de formularios. Sin migración — se borra lo viejo.

## Scope

### In Scope
- **10 tipos de campo** con schemas de propiedades distintos por tipo (no genérico)
- **Texto Fijo** — nuevo tipo: texto estático con intercalación de variables de sistema
- **Tabla Dinámica** — modo híbrido: columnas libres + columnas calculadas + totales en footer
- **Variables de Sistema** — sistema extensible con autocompletado en builder (no hardcodeado)
- **AI Help Description** — metadata por campo, tooltip en builder, reservado para futuro autollenado
- Drag-drop builder 3-panel (paleta izquierda, canvas centro, propiedades derecha)
- Renderizador dinámico de formularios actualizado para los nuevos tipos
- Eliminación del módulo viejo (`admin/report-template`) y lógica condicional

### Out of Scope
- **Lógica condicional** — eliminada del sistema, reservada para futuro
- Integración con AI para autollenado desde transcripción
- Firma digital (el tipo `signature` se elimina del configurador; se maneja a nivel de informe)
- Migración de plantillas existentes
- Backend: contratos de API se mantienen, estructura JSON de campos se redefine

## Capabilities

### New Capabilities
- `field-type-registry`: Registro extensible de tipos de campo con schemas de propiedades por tipo
- `fixed-text-field`: Campo de texto estático con interpolación de variables (`{paciente.nombre}`)
- `system-variables`: Autocompletado de variables de sistema en builder, registro extensible
- `ai-help-metadata`: Metadata de ayuda por campo, tooltip en builder, contrato para futuro autollenado

### Modified Capabilities
- `template-builder`: Reescritura completa — nueva paleta de 10 tipos, panel de propiedades por tipo, sin conditional logic
- `dynamic-form-renderer`: Actualizado para renderizar los nuevos schemas de propiedades por tipo
- `report-admin`: Actualizado para reflejar nuevos tipos de campo

## Approach

**Arquitectura**: Mismo patrón hexagonal. Módulo `admin/report-template` se reescribe desde cero con la misma estructura de capas (domain/infra/app/presentation).

**Modelo de datos**: `FieldConfig` abandona la interfaz genérica actual. Cada tipo tiene un schema de propiedades distinto con tipado fuerte:

| Tipo | Propiedades específicas |
|------|------------------------|
| Texto Corto / Largo | `max_chars`, `ai_help_description`, `default_value`, `placeholder` |
| Número | `decimals`, `min`, `max`, `ai_help_description`, `default_value` |
| Fecha | `min_date`, `max_date`, `ai_help_description`, `default_value`, `placeholder` |
| Selección / Sel. Múltiple / Opción Única / Checkbox | `options`, `ai_help_description`, `default_value`, `placeholder` |
| Texto Fijo | `text_content` (con soporte de variables), `styling_options` |
| Tabla Dinámica | `columns` (name, type, required, calculated), `footer_totals` |

**Variables de sistema**: `SystemVariableRegistry` — mapa extensible con categorías (`paciente`, `clinica`, `fecha`, `usuario`). El builder ofrece autocompletado al escribir `{`. Las variables se interpolan en runtime.

## Affected Areas

| Area | Impact | Descripción |
|------|--------|-------------|
| `src/modules/admin/report-template/` | Reescrito | Eliminado → reconstruido desde cero |
| `src/modules/reports/presentation/components/DynamicField.vue` | Modificado | Nuevos tipos y schemas de renderizado |
| `src/modules/reports/presentation/components/DynamicFormRenderer.vue` | Modificado | Texto Fijo y Tabla Dinámica híbrida |
| `src/shared/types/index.ts` | Modificado | `FieldConfig` redefinido con schemas por tipo |
| `src/core/router/index.ts` | Sin cambios | Mismas rutas, mismas URLs |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Reescritura completa rompe contratos con `reports` | Medium | Mantener compatibilidad de estructura JSON serializada |
| Tabla Dinámica híbrida (libre + calculada) es compleja | High | Implementar en 2 fases: libre primero, calculada después |
| Auto-completado de variables de sistema puede quedar lento | Low | Debounce de 150ms, índice plano para búsqueda O(1) |
| Sin migración: pérdida de datos de plantillas existentes | None | Usuario confirmó: no hay informes existentes |

## Rollback Plan

- El módulo viejo se elimina en un commit atómico. Revertir ese commit restaura el estado anterior.
- Nuevas rutas y componentes no pisan rutas existentes. El router no cambia.
- No hay migraciones de BD — estructura JSON de campos se redefine pero es backward-compatible en serialización.
- PRs encadenados: cada tipo de campo es un slice independiente y reversible.

## Dependencies

- **API**: contratos existentes (`/admin/report-templates`, `/reports`) se mantienen. Cambia la estructura interna de `FieldConfig` en el JSON.
- **npm**: `vuedraggable@next` (ya instalado). Sin nuevas dependencias.

## Success Criteria

- [ ] Admin puede crear plantillas con los 10 tipos de campo, cada uno con su panel de propiedades específico
- [ ] Texto Fijo muestra contenido estático con variables de sistema interpoladas
- [ ] Tabla Dinámica permite columnas libres y muestra totales en footer
- [ ] Auto-completado de variables funciona al escribir `{` en campos de texto del builder
- [ ] AI Help Description se muestra como tooltip en el builder
- [ ] Lógica condicional está completamente eliminada del sistema
- [ ] Renderizador `DynamicField.vue` maneja los 10 tipos sin fallback "tipo no soportado"
- [ ] Build de producción pasa sin errores
