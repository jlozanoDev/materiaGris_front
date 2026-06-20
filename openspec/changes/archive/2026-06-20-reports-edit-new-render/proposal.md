# Proposal: Fix Report Content Not Rendering on Edit/Create Pages

## Intent

`/reports/:id/edit` y `/patients/:id/report/new` cargan pero el contenido del informe (secciones, campos) no se renderiza. La causa raíz es una disparidad de formato entre la respuesta JSON del backend y los tipos del frontend. Adicionalmente, variables de sistema en `fixed_text` no se resuelven.

## Root Cause

**Primary — Snake/camel mismatch**: El backend Laravel devuelve `template_structure_snapshot` (snake_case). `fetchClient` retorna el JSON raw sin transformación. `ReportFillPage.vue` y `ReportViewPage.vue` acceden `report.templateStructureSnapshot` (camelCase) → `undefined` → `v-if` falla → `DynamicFormRenderer` nunca se monta → no se muestra contenido.

**Secondary — Variable resolver ausente**: `DynamicField` nunca pasa `variableResolver` a `FixedTextRenderer`. Variables `{patient_name}`, `{date}` en header/footer muestran texto sin resolver.

**Tertiary — Error handling nulo**: `useReportForm.loadReport()` e `init()` no tienen try/catch. Si la API falla, el loading skeleton queda congelado sin feedback.

## Scope

### In Scope
- Normalizador de respuesta API en `ApiReportRepository` (snake_case → camelCase)
- Wire del `variableResolver` desde `DynamicFormRenderer` → `DynamicField` → `FixedTextRenderer`
- Error handling en `useReportForm.loadReport()` e `init()`

### Out of Scope
- Cambios en backend
- Vista previa de impresión en fill page
- Hacer header/footer editables
- Transformación global de claves en `fetchClient`

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `dynamic-form-renderer`: `DynamicField` y `DynamicFormRenderer` aceptan y propagan `variableResolver`; `FixedTextRenderer` recibe el resolver vía props
- `fixed-text-field`: Recibe `variableResolver` desde el pipeline de renderizado (antes solo aceptaba el prop pero nunca se pasaba)

## Approach

1. **API response normalizer**: Añadir función `normalizeReport(raw)` en `ApiReportRepository` que mapea `template_structure_snapshot` → `templateStructureSnapshot`, `patient_id` → `patientId`, etc. Aplicar en `initReport()` y `getById()`. ~25 líneas.

2. **Variable resolver wire**: `DynamicFormRenderer` recibe nueva prop `variableResolver: (text: string) => string`. Lo pasa a `DynamicField`. `DynamicField` lo pasa a `FixedTextRenderer`. `ReportFillPage` instancia el resolver usando `SystemVariableRegistry` con datos del paciente. ~40 líneas.

3. **Error handling**: Envolver `loadReport()` e `init()` en try/catch, setear `report.value = null` y exponer `errorMessage` ref. `ReportFillPage` muestra mensaje de error. ~15 líneas.

## Affected Areas

| File | Impact | Lines |
|------|--------|-------|
| `src/modules/reports/infrastructure/ApiReportRepository.ts` | Modified | +25 |
| `src/modules/reports/presentation/components/DynamicFormRenderer.vue` | Modified | +8 |
| `src/modules/reports/presentation/components/DynamicField.vue` | Modified | +6 |
| `src/modules/reports/presentation/components/FixedTextRenderer.vue` | Modified | +2 |
| `src/modules/reports/presentation/composables/useReportForm.ts` | Modified | +15 |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Modified | +12 |
| `tests for ApiReportRepository` | New | +40 |

**Total**: ~110 lines changed/added across 6 existing + 1 new test file

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Normalizer asume estructura API que difiere del backend real | Medium | Consultar respuesta real o endpoint Swagger; validar con test de integración |
| Campo `header`/`footer` no incluido en `template_structure_snapshot` del backend | Medium | El normalizador usa `raw.header ?? { enabled: false, sections: [] }` como fallback |
| `SystemVariableRegistry` requiere datos de paciente no disponibles en `ReportFillPage` | Low | El endpoint `GET /reports/:id` ya incluye `patient_name`, `author_name`; usar esos datos |

## Rollback Plan

Revertir commits por archivo. El normalizador es aditivo; si la API ya devuelve camelCase, el normalizador es no-op. El wire del `variableResolver` es opcional (sin resolver, muestra texto crudo, no rompe).

## Dependencies

- Backend `GET /reports/:id` y `POST /reports` deben devolver `template_structure_snapshot` con `sections`, `header`, `footer`
- Backend debe incluir `patient_name`, `author_name` en la respuesta del reporte

## Success Criteria

- [ ] `DynamicFormRenderer` se monta en `/reports/:id/edit` — secciones y campos visibles
- [ ] `DynamicFormRenderer` se monta en `/patients/:id/report/new?templateId=x` tras `POST /reports`
- [ ] Campos `fixed_text` en header/footer muestran variables resueltas (`{patient_name}` → "Juan Pérez")
- [ ] Error de API muestra mensaje de error en vez de loading skeleton infinito
- [ ] `npx vitest run --run` sin regresiones (28 suites)
- [ ] `npm run build` exitoso
