# Proposal: Implementar Informes del Paciente

## Intent

Fixar 3 bugs que rompen el flujo del tab de informes clínicos y añadir un paso de selección de plantilla (modal) antes de crear un informe, para que los clínicos puedan navegar paciente → elegir plantilla → rellenar informe sin conocer IDs internos.

## Scope

### In Scope
- Items de informe clickeables → navegan a `/informes/:id` (ReportView)
- Botón "+ Nuevo informe" con guard `hasPermission('report.create')`
- `goToNewReport()` → abre modal de selección de plantilla; al seleccionar, navega a `ReportCreate` con `templateId` en query
- Fix `ReportFillPage.onMounted()`: detectar ruta `ReportCreate` y usar `query.patientId` + `query.templateId` (no `params.id` como report ID)
- Nuevo componente `TemplatePickerModal.vue` — modal con lista de templates activos (estados: loading, error, empty, list)
- Nuevo composable `useTemplateList` en módulo reports — consume endpoint de templates accesible para profesionales
- Navegación de vuelta desde `ReportFillPage` (create flow) → `/patients/:id?tab=reports`
- Sin templates → botón "Nuevo informe" visible pero deshabilitado

### Out of Scope
- Endpoint backend para templates (dependencia — flagged)
- Cambios en `DynamicFormRenderer`, `ReportViewPage`, `ReportListPage`, módulo admin
- Pinia store ni refactor completo del módulo reports
- Sincronización de tab activo con query param (deferred)

## Capabilities

### New Capabilities
- `report-template-picker`: Modal que lista plantillas activas y emite la plantilla seleccionada para el flujo de creación de informes

### Modified Capabilities
- `patient-detail`: Items del tab de informes SHALL navegar al hacer click; botón "+ Nuevo informe" SHALL tener guard de permiso y abrir template picker en lugar de navegar directamente

## Approach

| Archivo | Cambio | ~Líneas |
|---|---|---|
| `PatientReportsTab.vue` | `@click` por item → router.push ReportView; `v-if="canCreate"` en botones; wire modal | 30 |
| `TemplatePickerModal.vue` (NUEVO) | Modal en `reports/presentation/components/` — 4 estados, emite `select(template)` | 70 |
| `useTemplateList.ts` (NUEVO) | Composable en reports, envuelve `GET /templates/active` (stub hasta que backend exista) | 30 |
| `ReportFillPage.vue` | Fix `onMounted()`: `route.name === 'ReportCreate'` → usa `query.patientId + query.templateId`, ignora `params.id` | 10 |
| `ReportFillPage.vue` — back nav | Create flow: botón volver → `/patients/:patientId?tab=reports` | 10 |
| `PatientDetailPage.vue` | Leer `route.query.tab` para restaurar tab activo en navegación de vuelta | 10 |

**Total estimado: ~160 líneas** (dentro del budget de 200).

## User Flow

```
PatientDetailPage → Tab "Informes clínicos"
  ├─ [Lista] click item → /informes/:id (ReportView)
  └─ [Botón "+ Nuevo informe"] (visible si hasPermission('report.create'))
       └─ click → TemplatePickerModal
            ├─ [Loading] skeleton
            ├─ [Error] mensaje + reintentar
            ├─ [Empty] "No hay plantillas disponibles"
            └─ [List] click template → router.push({ name: 'ReportCreate',
                 params: { id: patientId }, query: { templateId } })
                 → ReportFillPage.onMounted() → init(patientId, templateId)
                 → DynamicFormRenderer con campos vacíos
                      └─ [Volver] → /patients/:id?tab=reports
```

## Dependencies

| Dependencia | Estado | Acción |
|---|---|---|
| `GET /templates/active` (patient-accessible) | ❌ No existe | Backend task — endpoint debe devolver plantillas activas para no-admin. Frontend usará stub hasta que esté disponible. |
| `useReportTemplate` (admin) | ⚠️ Admin-only | No se reutiliza. Nuevo composable `useTemplateList` en módulo reports evita acoplamiento. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Backend endpoint no listo antes del frontend | High | Composable con stub que devuelve mock data; firma estable independiente de URL |
| Regresión en edit flow (`/informes/:id/editar`) | Low | `onMounted()` chequea `route.name`: `ReportCreate` → init flow, resto → loadReport |
| Modal vacío si 0 templates | Low | Empty state claro + botón deshabilitado en tab |

## Success Criteria

- [ ] Click en item de informe → navega a `/informes/:id` con vista read-only
- [ ] Click en "+ Nuevo informe" → abre modal con lista de plantillas activas
- [ ] Seleccionar plantilla → navega a `ReportCreate?templateId=X` y formulario inicializa correctamente
- [ ] Botón oculto si usuario sin permiso `report.create`; deshabilitado si tiene permiso pero 0 templates
- [ ] Volver desde ReportFillPage (create) → tab de informes del paciente
- [ ] Edit flow existente sin regresión
