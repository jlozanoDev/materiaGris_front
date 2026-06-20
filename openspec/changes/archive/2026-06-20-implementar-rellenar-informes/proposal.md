# Proposal: Puntos de Entrada para Edición de Informes

## Intent

Permitir que usuarios con permiso `report.edit` accedan a la edición de informes en borrador desde los puntos de navegación existentes. La funcionalidad de edición ya está implementada en `ReportFillPage` y la ruta `/informes/:id/editar` ya existe. Solo faltan los botones "Editar" y una mejora visual del modo solo lectura para que muestre texto limpio en vez de inputs deshabilitados.

## Scope

### In Scope
- Botón "Editar" en `ReportListPage` (visible solo en informes `draft` + permiso `report.edit`)
- Botón "Editar" en `ReportViewPage` (visible solo en informes `draft` + permiso `report.edit`)
- Acción "Editar" en `PatientReportsTab` por fila de informe (mismas condiciones)
- `DynamicField` en modo `disabled=true` renderiza `<span>` texto formateado, no `<input disabled>`

### Out of Scope
- Cambios en `ReportFillPage` (ya funciona para create + edit)
- Nuevas rutas o endpoints de API
- Edición de informes firmados/cerrados
- Unificar vista previa y edición en una sola página

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `dynamic-form-renderer`: DynamicField ahora renderiza texto estático (`<span>`) cuando `disabled=true` en lugar de inputs deshabilitados. El mapeo de tipos de campo y el dispatch a componentes se mantiene igual; solo cambia la presentación en modo readonly.

## Approach

1. **Navegación**: Añadir botones con `router.push({ name: 'ReportEdit', params: { id } })` condicionados por `report.status === 'draft'` y `authStore.hasPermission('report.edit')`. En `PatientReportsTab`, usar `@click.stop` en el botón Editar para no disparar el click-to-view de la fila.

2. **Readonly rendering**: En `DynamicField.vue`, cuando `disabled=true`, reemplazar inputs por `<span>` con valor formateado. Formatos: fechas → `toLocaleDateString('es-ES')`, multi_select/checkbox → lista separada por comas, vacío → "—". Tipos `dynamic_table` y `fixed_text` ya tienen su propio manejo readonly; no se modifican.

## Affected Areas

| File | Impact | Description |
|------|--------|-------------|
| `src/modules/reports/presentation/pages/ReportListPage.vue` | Modified | Añadir botón "Editar" junto a "Ver" en columna de acciones |
| `src/modules/reports/presentation/pages/ReportViewPage.vue` | Modified | Añadir botón "Editar" en barra de acciones superior |
| `src/modules/patients/presentation/components/PatientReportsTab.vue` | Modified | Añadir botón "Editar" por fila; requiere `@click.stop` para no disparar navegación a vista |
| `src/modules/reports/presentation/components/DynamicField.vue` | Modified | Rama `v-if="isDisabled"` con `<span>` por tipo de campo |
| `src/modules/reports/presentation/components/__tests__/DynamicField.test.ts` | Modified | Actualizar test "renders as disabled" para verificar `<span>` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Tests de DynamicField rompen al cambiar renderizado disabled | Medium | Actualizar el test "renders as disabled" para verificar `<span>` en vez de atributo `disabled` |
| Click-to-view en PatientReportsTab se dispara junto con Editar | Low | `@click.stop` en el botón Editar; el resto de la fila mantiene navegación a vista |
| Formateo de fechas difiere del backend | Low | Usar `toLocaleDateString('es-ES')` consistente con el listado existente |

## Rollback Plan

Revertir commits por archivo. El cambio en `DynamicField` es el de mayor riesgo; si causa problemas visuales, restaurar la versión actual (el comportamiento `disabled` sigue funcionando, solo cambia presentación). Los botones de navegación son aditivos y no rompen flujos existentes.

## Dependencies

Ninguna. No requiere cambios en backend, API, rutas ni librerías.

## Success Criteria

- [ ] Botón "Editar" visible en `ReportListPage` para informes draft, navega a `/informes/:id/editar`
- [ ] Botón "Editar" visible en `ReportViewPage` para informes draft, navega a `/informes/:id/editar`
- [ ] Acción "Editar" en `PatientReportsTab` para informes draft, navega a `/informes/:id/editar`
- [ ] Vista readonly (`ReportViewPage`) muestra texto limpio — sin inputs grises
- [ ] `cd frontend && npx vitest run --run` pasa sin regresiones (27 suites)
- [ ] `npm run build` exitoso
- [ ] Botones "Editar" no visibles para informes signed/closed
