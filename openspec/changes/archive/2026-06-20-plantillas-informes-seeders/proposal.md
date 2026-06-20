# Proposal: Plantillas de Informes para Seeders

## Intent

Generar 3 plantillas de informes clínicos completas como datos semilla para el backend (Laravel). El output es un archivo `.md` con estructuras JSON listas para seeders. No hay cambios de código frontend ni backend.

## Scope

### In Scope
- Plantilla 1: **Historia Clínica General** — anamnesis, antecedentes, examen físico, diagnóstico, plan (~28 campos, 3 sections)
- Plantilla 2: **Informe de Alta** — hospitalización, evolución, medicación al alta, recomendaciones (~22 campos, 3 sections)
- Plantilla 3: **Consentimiento Informado** — procedimiento, riesgos, alternativas, firmas (~18 campos, 3 sections)
- Archivo `plantillas-informes-seeders.md` con las 3 estructuras JSON completas
- Cada campo incluye `ai_help_description` descriptivo

### Out of Scope
- Generar `DatabaseSeeder.php` o migraciones de Laravel
- Plantillas adicionales
- Modificar el frontend, la API, o el schema de base de datos

## Capabilities

### New Capabilities
None — this is data generation, not a code change.

### Modified Capabilities
None — no spec-level requirements change.

## Approach

1. Diseñar cada plantilla con 2–3 sections, header (fixed_text con variables del sistema), footer, y variedad de tipos de campo
2. Usar 7+ tipos de campo por plantilla (text, textarea, number, date, select, radio, checkbox, fixed_text, dynamic_table)
3. Incluir `ai_help_description` en cada campo — descriptivo y orientado a IA
4. Generar UUIDs válidos (`crypto.randomUUID()`) para todos los IDs
5. Claves snake_case únicas globalmente (slugify de labels)
6. Header usa `{clinica.nombre}`, `{medico.nombre}`, `{fecha.formato_largo}`
7. Footer usa `{usuario.nombre}`, `{usuario.matricula}`, `{fecha.actual}`
8. Dynamic table en Informe de Alta (medicación) con footer_totals
9. Output: un archivo `.md` con 3 bloques de código JSON documentados

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `openspec/changes/plantillas-informes-seeders/proposal.md` | New | Este documento |
| `openspec/changes/plantillas-informes-seeders/plantillas-informes-seeders.md` | New | Output final — 3 plantillas JSON |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend valida campos extra no conocidos | Low | structure es JSON column libre; todos los campos usan `allowedProperties` del frontend |
| Claves duplicadas entre header/body/footer | Low | Validación de unicidad global antes de entrega |
| UUIDs no aceptados por backend | Low | Frontend ya usa `crypto.randomUUID()` — backend los acepta |
| Fórmulas `calculated` en dynamic_table no soportadas | Medium | Usar solo columnas estándar; evitar `calculated: true` hasta confirmar soporte backend |

## Rollback Plan

No aplica — no hay deploys ni migraciones. El archivo `.md` se descarta sin consecuencias.

## Dependencies

- Confirmación de que el backend acepta el campo `ai_help_description` en el payload (el frontend lo serializa, pero el backend debe aceptarlo)

## Success Criteria

- [ ] Las 3 plantillas se entregan en un solo archivo `.md`
- [ ] Cada plantilla usa 7+ tipos de campo diferentes
- [ ] Cada plantilla tiene header, footer y 2–3 sections
- [ ] Todas las claves (`key`) son únicas dentro de cada plantilla
- [ ] Cada campo tiene `ai_help_description` no vacío
- [ ] El JSON generado es sintácticamente válido
- [ ] Las estructuras coinciden con el contrato `ReportTemplate` del frontend
