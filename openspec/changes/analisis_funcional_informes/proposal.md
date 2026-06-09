# Proposal: Módulo de Informes Dinámicos

## Intent

Permitir que administradores clínicos diseñen plantillas de informes mediante drag-drop, que médicos completen sobre pacientes, con firma digital simple y exportación PDF. Versionado por snapshot para inmutabilidad histórica.

## Scope

### In Scope
- Template builder (drag-drop jerárquico: secciones → filas → columnas → campos)
- Component catalog: text, textarea, date, select, radio, checkbox, dynamic tables, signature canvas
- Dynamic form renderer (lee JSON de estructura, renderiza formulario reactivo en runtime)
- Conditional logic engine (visibilidad de campos evaluada en frontend, sin `eval()`)
- Report lifecycle: draft → signed → closed con validaciones progresivas
- Signature capture vía HTML5 canvas (stylus/mouse — sin criptografía)
- PDF download button (generación server-side, DomPDF en Laravel)
- Admin CRUD para templates (extiende esqueleto existente `admin/report-template`)
- Admin listing/viewing de informes de pacientes
- Snapshot versioning (frontend recibe snapshot del backend, nunca lo genera)

### Out of Scope
- Generación PDF server-side (DomPDF en Laravel — backend team)
- Validación server-side de snapshots y firmas
- Firma criptográfica avanzada (certificados digitales)
- PDF preview engine en frontend
- Analytics de informes
- Exportación a formatos distintos de PDF

## Capabilities

### New Capabilities
- `template-builder`: Drag-drop designer for admin-created report templates with nested section/row/column/field hierarchy
- `dynamic-form-renderer`: Runtime form engine that reads JSON structure and renders reactive Vue forms
- `report-lifecycle`: State machine (draft→signed→closed) with progressive validation and permission gates
- `signature-capture`: HTML5 canvas component for stylus/mouse rubric input, stored as base64 image
- `conditional-logic`: Safe runtime expression evaluator for field visibility rules (no `eval`)
- `report-admin`: Admin listing, filtering, and read-only viewing of patient reports

### Modified Capabilities
None — all existing specs remain unchanged.

## Approach

**Arquitectura**: Extiende patrón hexagonal existente. Dos módulos nuevos:

1. **`src/modules/admin/report-template/`** — extiende skeleton actual. Template CRUD + builder visual.
2. **`src/modules/reports/`** — módulo nuevo. Dynamic form renderer, ciclo de vida, firma, admin listing.

**Dependencias npm nuevas**: `vuedraggable@next` (~18KB, drag-drop anidado), `signature_pad` (~7KB, captura firma).

**Template structure**: Árbol JSON recursivo (sections→rows→columns→fields) almacenado en backend. Frontend lo consume y renderiza.

**Conditional logic**: Evaluador custom con scope controlado. Comparadores: `==`, `!=`, `contains`, `>`, `<`. Sin `eval()` ni `new Function()`.

**Snapshot**: Backend copia `structure` → `template_structure_snapshot` al iniciar informe. Frontend solo recibe y renderiza el snapshot.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/admin/report-template/` | Expanded | Domain + infra + builder UI (extiende skeleton) |
| `src/modules/reports/` | New | Módulo completo (domain/infra/app/presentation) |
| `src/core/router/index.ts` | Modified | Nuevas rutas: report builder, report fill, report list |
| `src/shared/components/` | New | DragDropZone, ConditionEditor (shared) |
| `package.json` | Modified | +vuedraggable, +signature_pad |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Drag-drop anidado 4 niveles es UX complejo | High | Spike/PoC antes de PR3. Validar affordances visuales con diseño |
| Conditional logic evaluador inseguro | Medium | Whitelist de operadores. No `eval()`. Scope inmutable por render |
| Scope excede 400 líneas (~6600 estimado) | High | Chained PRs (6). Orchestrator pregunta al exceder budget |
| Snapshot race condition (admin edita mientras médico inicia) | Low | Backend atómico al crear `patient_reports`. Frontend solo consume |

## Rollback Plan

- Cada PR es independiente y reversible. Rollback = revertir merge del PR.
- Migraciones de BD son append-only (nuevas tablas). No alteran datos existentes.
- Nuevas rutas no pisan rutas existentes. Remover entradas del router revierte navegación.

## Dependencies

- **Backend API endpoints** (frontend necesita estos contratos):
  - `GET/POST/PUT/DELETE /api/admin/report-templates` — CRUD templates
  - `POST /api/reports` — iniciar informe (genera snapshot)
  - `GET /api/reports` — listar informes (admin)
  - `GET /api/reports/{id}` — obtener informe con snapshot + values
  - `PUT /api/reports/{id}` — guardar borrador
  - `POST /api/reports/{id}/sign` — firmar (recibe signature base64)
  - `POST /api/reports/{id}/close` — cerrar
  - `GET /api/reports/{id}/pdf` — descargar PDF generado
- **npm**: `vuedraggable@next`, `signature_pad`
- **Permisos backend**: `admin.report-template.*`, `reports.*`, `reports.sign`, `reports.close`

## Success Criteria

- [ ] Admin puede crear/editar/eliminar templates con drag-drop jerárquico
- [ ] Médico puede iniciar informe desde template, ver formulario dinámico renderizado
- [ ] Conditional logic oculta/muestra campos en tiempo real sin recarga
- [ ] Flujo completo: draft → validación → firma canvas → cerrado (read-only)
- [ ] Botón "Descargar PDF" obtiene blob del backend y dispara descarga
- [ ] Admin puede listar y ver informes de pacientes (read-only)
- [ ] Templates editados no corrompen informes ya iniciados (snapshot)
