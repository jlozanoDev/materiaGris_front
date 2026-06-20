# Design: Edición de Informes — Puntos de Entrada + Readonly Render

## Technical Approach

Extensión aditiva: añadir botones "Editar" condicionados en 3 superficies + refactor del renderizado readonly de `DynamicField`. La ruta `/informes/:id/editar` y `ReportFillPage` ya soportan create+edit — no se tocan.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Renderizado readonly | `v-if="isDisabled"` al inicio del template de DynamicField | Evita duplicar 12 ramas `v-if`/`v-else` por tipo. Un solo `v-else` anida el template existente intacto. |
| Formateo de fechas | `toLocaleDateString('es-ES')` | Consistente con `ReportListPage.formatDate()`. |
| Formateo de select/radio | Buscar label en `field.options` | Muestra texto legible ("Masculino") no el value interno ("m"). |
| Formateo de multi_select/checkbox | `opciones.map(opt => opt.label).join(', ')` | Misma razón: legibilidad. |
| Campo vacío | Em dash `"—"` | Convención visual del proyecto. |
| Verificación de permisos | `authStore.hasPermission('report.edit')` computada local | Ya usado en `ReportViewPage` para `canDownloadPdf`. Mismo patrón. |
| `@click.stop` en PatientReportsTab | Sí, solo en el botón Editar | El `@click` del contenedor navega a vista. `@click.stop` evita doble navegación. |

## Data Flow

```
ReportListPage / ReportViewPage / PatientReportsTab
  │
  │  router.push({ name: 'ReportEdit', params: { id } })
  │  Solo si: status === 'draft' && hasPermission('report.edit')
  ▼
ReportFillPage (ya existente, sin cambios)
  │
  │  loadReport(id) → report (con valores guardados)
  ▼
DynamicFormRenderer (isEditable=true → DynamicField :disabled=false)
  │
  │  inputs interactivos
  ▼
  ┌── saveDraft → API PUT /reports/:id (auto-save 2s)
  ├── sign       → API POST /reports/:id/sign
  └── close      → API POST /reports/:id/close

ReportViewPage (isEditable=false → DynamicField :disabled=true)
  │
  │  DynamicField detecta isDisabled → rama <span> texto formateado
  ▼
  Vista previa limpia, sin inputs grises
```

## DynamicField Refactor

Template actual: 12 ramas `v-if="field.type === '...'"`, cada una con `:disabled="isDisabled"`.

**Cambio**: Envolver todo en un `v-if="isDisabled"` / `v-else`:

```
v-if="isDisabled" → rama <span> (ver tabla abajo)
v-else            → template existente intacto
```

| Field type | Readonly render (v-if="isDisabled") |
|-----------|-------------------------------------|
| text, textarea, number | `<span>{{ modelValue || '—' }}</span>` |
| date | `<span>{{ formatDate(modelValue) }}</span>` |
| select, radio | `<span>{{ optionLabel || modelValue || '—' }}</span>` |
| multi_select, checkbox | `<span>{{ labels.join(', ') || '—' }}</span>` |
| dynamic_table | `<DynamicTable :disabled="true" ...>` (sin cambio) |
| fixed_text, separators | Sin cambio (siempre readonly) |

Funciones helper en `<script>`:
- `formatDate(val)`: `new Date(val).toLocaleDateString('es-ES')`
- `optionLabel(val)`: busca en `field.options`, fallback a `val`
- `optionLabels(arr)`: mapea array a labels

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/.../ReportListPage.vue` | Modify | Añadir botón "Editar" en columna acciones (línea 88-96). Condicionado a `report.status === 'draft' && canEdit`. |
| `src/.../ReportViewPage.vue` | Modify | Añadir botón "Editar" en barra de acciones (línea 18-37). `canEdit` computada con `hasPermission('report.edit')`. Condición: `report.status === 'draft'`. |
| `src/.../PatientReportsTab.vue` | Modify | Añadir botón "Editar" por fila. Computed `canEdit`, `v-if="canEdit && report.status === 'draft'"`, `@click.stop` + `router.push({ name: 'ReportEdit', params: { id } })`. |
| `src/.../DynamicField.vue` | Modify | Envolver template en `v-if="isDisabled"` (spans) / `v-else` (inputs actuales). Añadir helpers `formatDate`, `optionLabel`, `optionLabels`. |
| `src/.../__tests__/DynamicField.test.ts` | Modify | Test "renders as disabled" → verificar `<span>` con valor, no `<input disabled>`. Añadir 3 tests nuevos: renderizado readonly de date, select, multi_select. |
| `tests/ReportListPage.spec.ts` | Modify | Añadir 2 tests: botón Editar visible para draft + permiso, oculto sin permiso. |
| `tests/ReportViewPage.spec.ts` | Modify | Añadir 2 tests: botón Editar visible para draft, oculto para signed. |
| `src/.../__tests__/PatientReportsTab.test.ts` | Modify | Añadir 2 tests: botón Editar visible + navegación, y `@click.stop` no dispara view. |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit — DynamicField | Readonly span muestra valor formateado por tipo (text, date, select, multi_select, vacío) | 5 tests existentes + 3 nuevos. Verificar `.find('span')` contiene texto esperado, `.find('input')` no existe. |
| Unit — ReportListPage | Botón Editar visible/oculto según permiso + status | 2 tests nuevos. Mockear `useAuthStore.hasPermission` con `report.edit` true/false. |
| Unit — ReportViewPage | Botón Editar visible/oculto según status | 2 tests nuevos. Mock report.status draft vs signed. |
| Unit — PatientReportsTab | Botón Editar visible, navega a ReportEdit, no dispara view | 2 tests nuevos. Verificar `router.push` llamado con `ReportEdit`. |
| Integration | `npm run build` exitoso | Build sin errores TS/Vite. |
| Regression | `npx vitest run --run` (27 suites) | Todos los tests existentes pasan. |

## Open Questions

- [ ] Confirmar con backend que `report.status` retorna exactamente `'draft'` (no `'Draft'` ni variantes) — el código actual usa string literal `'draft'` en `statusBadgeClass` y `statusLabel`, lo que sugiere consistencia.
