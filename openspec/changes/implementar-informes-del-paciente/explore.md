# Exploration: Informes del Paciente — Tab, Navegación y Flujo

## Current State

El tab "Informes clínicos" dentro de `PatientDetailPage.vue` funciona parcialmente. El componente `PatientReportsTab.vue` (137 líneas) lista los informes del paciente usando el composable `useReportList`, implementando correctamente los estados de loading (skeleton), error (con reintento), empty y list. Cada item muestra `template_name`, fecha y badge de estado (Borrador/Firmado/Cerrado).

Existe un módulo completo de informes (`src/modules/reports/`) con arquitectura hexagonal que incluye 7 casos de uso, repositorio API, 3 páginas y form renderer dinámico.

Sin embargo, el flujo de usuario desde el tab está **roto** en varios puntos críticos.

### Lo que SÍ funciona hoy

| Funcionalidad | Estado |
|---|---|
| Listar informes filtrados por `patient_id` | ✅ Funciona — `PatientReportsTab.vue:15` |
| Estados loading/error/empty/list | ✅ Todos cubiertos — `PatientReportsTab.vue:62-136` |
| Badge de estado (draft/signed/closed) con colores | ✅ Funciona — líneas 18-42 |
| Formato de fecha localizado (`es-ES`) | ✅ Funciona — líneas 48-56 |
| Botón "+ Nuevo informe" navega a `ReportCreate` | ⚠️ Navega, pero con parámetros incorrectos |
| Módulo reports completo (domain/infra/app/presentation) | ✅ Arquitectura hexagonal implementada |
| Permissions en rutas (`report.create`, `report.view`, etc.) | ✅ Router guard funciona — `index.ts:51-54` |
| useReportList con DI via contenedores | ✅ Patrón correcto — `useReportList.ts:21` |

### Lo que NO funciona / está roto

| Gap | Severidad | Archivo:línea |
|---|---|---|
| Items de informe no son clickeables (no navegan a report detail) | **CRÍTICO** | `PatientReportsTab.vue:115-134` — falta `@click` o `router-link` |
| `goToNewReport()` no pasa `templateId` → `init()` nunca se ejecuta en `ReportFillPage` | **CRÍTICO** | `PatientReportsTab.vue:44-46` + `ReportFillPage.vue:173-181` |
| No existe flujo de selección de plantilla antes de crear informe | **CRÍTICO** | No hay template picker en ninguna parte del flujo paciente→informe |
| Botón "Nuevo informe" sin check de permiso `report.create` | **ALTA** | `PatientReportsTab.vue:96-101`, `107-112` — sin `v-if` condicional |
| `ReportFillPage.onMounted()` interpreta mal `route.params.id` en ruta `ReportCreate` | **CRÍTICO** | `ReportFillPage.vue:174-176`: `route.params.id` en `/pacientes/:id/informe/nuevo` es el `patientId`, pero se usa como `loadReport(id)` (tratándolo como report ID) |
| El tab no preserva estado al navegar (sin query param/hash para tab activo) | **BAJA** | `PatientDetailPage.vue:22` — `activeTab = ref(0)` siempre |

## Affected Areas

### Archivos directamente en scope del cambio

| Archivo | Rol | Impacto esperado |
|---|---|---|
| `src/modules/patients/presentation/components/PatientReportsTab.vue` | Componente del tab de informes | Añadir navegación onclick, check de permisos, corregir `goToNewReport()` |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Página de creación/edición de informe | Corrección del `onMounted()` para distinguir create vs edit en ruta `ReportCreate` |
| `src/core/router/index.ts` | Definición de rutas | Posible ajuste de la ruta `ReportCreate` para pasar `templateId` como query param |
| `src/modules/patients/presentation/pages/PatientDetailPage.vue` | Página padre con tabs | Posiblemente añadir query param sync para tab activo |

### Archivos que pueden necesitar cambios secundarios

| Archivo | Rol | Impacto potencial |
|---|---|---|
| `src/modules/reports/presentation/composables/useReportForm.ts` | Estado del formulario de informe | Si se ajusta la firma de `init()` o el flujo |
| `src/modules/reports/application/containers/reportsContainer.ts` | DI container | Si se añade un nuevo caso de uso (ej. listar templates para picker) |
| `src/modules/admin/report-template/presentation/composables/useReportTemplate.ts` | Listado de templates (admin) | Si se reutiliza para el template picker |

### Fuera de scope (NO tocar)

| Elemento | Razón |
|---|---|
| Backend / API endpoints | Contrato frontend-only |
| `DynamicFormRenderer` y componentes hijos | Ya funcionan correctamente |
| `ReportListPage.vue` | Página independiente, no afectada |
| `ReportViewPage.vue` | Ya funciona, solo hay que enlazarla desde el tab |
| Módulo `admin/report-template` | Solo lectura de templates, no modificar |

## Approaches

### 1. Corrección mínima: arreglar los bugs + añadir navegación

Corregir los 3 bugs críticos sin añadir template picker ni features nuevas.

- **Qué incluye**:
  - Añadir `@click` a cada item de informe que navegue a `ReportView` (`/informes/:id`)
  - Corregir `goToNewReport()` → pasar `patientId` y `templateId` como query params
  - Corregir `ReportFillPage.onMounted()` → en ruta `ReportCreate`, detectar que `route.params.id` es `patientId` (no report ID) y esperar `templateId` del query
  - Añadir `v-if="authStore.hasPermission('report.create')"` al botón "Nuevo informe"
- **Pros**: Cambio mínimo (~30 líneas), bajo riesgo, arregla los flujos rotos inmediatamente
- **Cons**: El usuario sigue necesitando saber qué `templateId` pasar manualmente (¿cómo lo obtiene?). El flujo de creación sigue siendo incompleto sin template picker
- **Effort**: Bajo

### 2. Corrección + template picker: añadir selección de plantilla

Además de las correcciones del Approach 1, implementar un modal o paso intermedio para seleccionar la plantilla antes de crear el informe.

- **Qué incluye**:
  - Todo lo del Approach 1
  - Nuevo componente `TemplatePickerModal.vue` (o integrarlo inline en `PatientReportsTab`)
  - Consumir `useReportTemplate` (o un nuevo composable ligero `useTemplateList`) para listar templates disponibles
  - Flujo: botón "Nuevo informe" → modal con lista de templates → seleccionar → navegar a `ReportCreate` con `patientId` + `templateId` en query
  - El modal debe manejar loading/error/empty states
- **Pros**: Flujo completo y usable. El usuario no necesita conocer IDs de templates. UX coherente
- **Cons**: Más líneas (~150-200 adicionales). Necesita consumir el módulo `admin/report-template` o crear un endpoint/composable específico. Posible acoplamiento entre módulos
- **Effort**: Medio

### 3. Rediseño completo: refactor del flujo reports-from-patient

Refactorizar la arquitectura para que el flujo paciente→informes sea un sub-módulo propio con su estado y navegación independiente.

- **Qué incluye**:
  - Todo lo del Approach 2
  - Mover `PatientReportsTab` de `modules/patients/presentation/components/` a `modules/reports/presentation/components/` (o crear wrapper)
  - Añadir Pinia store `usePatientReportsStore` para cachear informes del paciente
  - Sincronizar tab activo con query param (`?tab=reports`)
  - Añadir navegación de vuelta desde `ReportFillPage` al tab de informes del paciente (en lugar de a `/informes`)
  - Posiblemente añadir `PatientReportListItem.vue` como componente separado
- **Pros**: Arquitectura más limpia, mejor separación de concerns, estado cacheado, experiencia de navegación completa
- **Cons**: Mucho código (~400+ líneas), riesgo de regresión en `PatientDetailPage`, rompe con el patrón actual de composables sin stores
- **Effort**: Alto

## Recommendation

**Approach 2 — Corrección + template picker.** Es el equilibrio correcto entre arreglar lo roto y ofrecer un flujo completo usable. Approach 1 deja el flujo de creación incompleto (el usuario no tiene forma de saber qué `templateId` usar). Approach 3 es excesivo para el alcance actual.

Puntos clave de implementación:
1. **El template picker debe ser un componente nuevo** dentro de `modules/reports/presentation/components/` (no en `patients/`), porque pertenece al dominio de reports
2. **Reutilizar `useReportTemplate`** del módulo admin para obtener la lista de templates, o crear un composable ligero `useTemplateList` en el módulo reports si se quiere evitar el acoplamiento
3. **No crear Pinia store** — mantener el patrón de composables que ya funciona
4. **No mover `PatientReportsTab`** de ubicación — ya está bien donde está como componente de presentación del módulo patients

## Risks

- **Acoplamiento modules/patients → modules/admin/report-template**: `useReportTemplate` vive en el módulo admin. Usarlo desde reports/patients crea una dependencia entre módulos. Mitigación: crear un endpoint/composable ligero en el módulo reports que solo liste templates activos (sin las operaciones admin de CRUD)
- **El backend puede no tener endpoint para listar templates públicos**: Si `GET /report-templates` requiere permisos admin, el flujo de template picker fallará para usuarios con rol `professional`. Necesita verificación — posiblemente se necesite un endpoint público como `GET /templates/active`
- **Romper el `onMounted()` de `ReportFillPage`**: El fix del create-flow debe ser backward-compatible con el edit-flow existente (`/informes/:id/editar`). Hay que distinguir las dos rutas claramente
- **Cambio de comportamiento en navegación**: Actualmente `goToNewReport()` usa `router.push()` con params. Si se pasa a query params, hay que verificar que `ReportFillPage` lo maneje correctamente

## Dependencies

### Templates
- **Existe**: `useReportTemplate` en `modules/admin/report-template/presentation/composables/` — lista templates, pero está en el módulo admin
- **Endpoint**: `GET /report-templates` — probablemente requiere permisos admin. Necesita verificación
- **Tipo**: `ReportTemplate` definido en `src/shared/types/index.ts:248-258` con campos: `id, name, description, is_active, structure, createdAt, updatedAt`

### Permissions
- `report.create` — requerido para crear informes (ruta `ReportCreate`)
- `report.view` — requerido para ver listado y detalle
- `report.edit` — requerido para editar/guardar borradores
- `report.sign` — requerido para firmar
- `report.close` — requerido para cerrar
- `report.download-pdf` — requerido para descargar PDF
- El auth store (`useAuthStore`) expone `hasPermission(slug)` y `hasPermissions(slugs, mode)`
- Los permisos vienen en `user.permissions` (objeto `{ "report.create": 1 }` o array)

### Router
- `ReportCreate`: `/pacientes/:id/informe/nuevo` → `ReportFillPage` (perm: `report.create`)
- `ReportView`: `/informes/:id` → `ReportViewPage` (perm: `report.view`)
- `ReportEdit`: `/informes/:id/editar` → `ReportFillPage` (perm: `report.edit`)
- `ReportList`: `/informes` → `ReportListPage` (perm: `report.view`)

## Testing Coverage (actual)

| Suite | Archivo | Tests | Cobertura |
|---|---|---|---|
| `useReportList` | `useReportList.test.ts` | 4 | Fetch, filtros, error, loading |
| `useReportForm` | `useReportForm.test.ts` | 12+ | init, load, setValue, validate, sign, save, close, auto-save |
| `PatientDetailPage` | `PatientDetailPage.test.ts` | 8 | Tabs, loading, error, header, navigation |
| `ReportFillPage` | `ReportFillPage.spec.ts` | 12+ | Create/edit modes, permissions, lifecycle |
| `ReportViewPage` | `ReportViewPage.spec.ts` | 5 | Load, PDF button visibility, navigation |
| `PatientReportsTab` | ❌ **NO TIENE TESTS** | 0 | — |

## User Journey (end-to-end ideal)

```
PatientDetailPage
  └─ Tab "Informes clínicos" (activo)
       ├─ [Loading] → skeleton cards (3)
       ├─ [Error] → mensaje + botón Reintentar
       ├─ [Empty] → "No hay informes" + botón "+ Nuevo informe"
       │              └─ click → check permiso report.create
       │                        → abrir TemplatePickerModal
       │                           ├─ [Loading] → skeleton
       │                           ├─ [Error] → mensaje
       │                           ├─ [Empty] → "No hay plantillas disponibles"
       │                           └─ [List] → lista de templates activos
       │                              └─ click en template
       │                                 → navegar a /pacientes/:id/informe/nuevo?templateId=X
       │                                    → ReportFillPage.onMounted()
       │                                       → init(patientId, templateId)
       │                                       → DynamicFormRenderer con campos vacíos
       └─ [List] → lista de informes del paciente
            └─ click en item → navegar a /informes/:id (ReportViewPage)
                               → read-only DynamicFormRenderer
                               → botones: Volver, Descargar PDF (si signed/closed)
```

## Ready for Proposal

**Sí.** Todos los hallazgos están documentados y los approaches están claros. Recomiendo proceder con Approach 2.

El orchestrator debe decir al usuario:
- Hay 3 bugs críticos que rompen la experiencia (items no clickeables, `goToNewReport()` roto, sin template picker)
- El approach recomendado es corrección + template picker (~200 líneas estimadas)
- La dependencia clave a resolver es el acceso a la lista de templates desde el rol `professional` (verificar endpoint)
- Una vez confirmado el approach, se procede a la fase `propose`
