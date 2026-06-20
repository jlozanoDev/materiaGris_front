# Tasks: Plantillas de Informes — Datos Semilla

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~300-400 (1 archivo .md nuevo) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | No aplica — archivo único de datos |
| Delivery strategy | ask-always |
| Chain strategy | not-applicable |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: not-applicable
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Archivo .md con 3 estructuras JSON + instrucciones seeder | Único | Sin cambios de código; es generación de datos semilla |

## Phase 1: Generación de Estructuras JSON

- [x] 1.1 Generar JSON de Historia Clínica General (`hcg_`) según design §Estructura JSON: HCG
  - Secciones: Header (4 fixed_text) → Anamnesis (5 rows) → Examen Físico (6 rows) → Diagnóstico y Plan (4 rows) → Footer (1 fixed_text)
  - Tipos usados: fixed_text, text, textarea, number, multi_select, dynamic_table, horizontal_separator
  - Verificar: `required: true` en `hcg_motivo_consulta`, `hcg_enfermedad_actual`, `hcg_ta`, `hcg_fc`, `hcg_fr`, `hcg_diagnostico_principal`, `hcg_plan_terapeutico`
  - Completar `ai_help_description` en cada campo editable (textos del design §HCG)

- [x] 1.2 Generar JSON de Informe de Alta (`ia_`) según design §Estructura JSON: Informe de Alta
  - Secciones: Header (4 fixed_text) → Ingreso (3 rows) → Evolución (3 rows) → Alta Médica (5 rows) → Footer (1 fixed_text)
  - Tipos usados: fixed_text, text, textarea, number, date, select, dynamic_table
  - Verificar: `required: true` en `ia_fecha_ingreso`, `ia_diagnostico_ingreso`, `ia_servicio`, `ia_resumen_evolucion`, `ia_diagnostico_egreso`, `ia_condicion_egreso`, `ia_medicacion_alta`, `ia_recomendaciones`
  - Completar `ai_help_description` en cada campo editable (textos del design §IA)

- [x] 1.3 Generar JSON de Consentimiento Informado (`ci_`) según design §Estructura JSON: Consentimiento Informado
  - Secciones: Header (3 fixed_text) → Información (7 rows, incluye `ci_titulo_procedimiento` fixed_text) → Autorización (7 rows) → Footer (2 fixed_text)
  - Tipos usados: fixed_text, text, textarea, radio, checkbox, select, date
  - Verificar: `required: true` en `ci_procedimiento`, `ci_descripcion`, `ci_beneficios`, `ci_riesgos_frecuentes`, `ci_preguntas_resueltas`, `ci_aceptacion`, `ci_nombre_paciente`, `ci_firma_paciente`, `ci_nombre_medico`
  - Completar `ai_help_description` en cada campo editable (textos del design §CI)

## Phase 2: Validación

- [x] 2.1 Validar JSON sintáctico — `JSON.parse()` sobre cada uno de los 3 bloques
- [x] 2.2 Validar contrato `ReportTemplate` — verificar `name`, `description`, `structure.sections[]`, `structure.header`, `structure.footer` con `enabled: true`, `pageDisplay: "all"`
- [x] 2.3 Validar propiedades por tipo contra `allowedProperties` del `FieldTypeRegistry` (sin `key` en Section/Row/Column, solo en Field)
- [x] 2.4 Validar unicidad global de keys — ninguna `key` duplicada dentro de cada plantilla
- [x] 2.5 Validar especificaciones por tipo: `number` con signos vitales → `min: 0`, `select`/`radio` con `options[]`, `dynamic_table` con `columns[]`, `fixed_text` con `text_content`

## Phase 3: Compilación y Documentación

- [x] 3.1 Ensamblar archivo `output/plantillas-informes-seeders.md` con:
  - Instrucciones para el desarrollador backend (cómo usar en `DatabaseSeeder.php`)
  - Nota sobre placeholders UUID (backend los reemplaza con `crypto.randomUUID()`)
  - Nota sobre `ai_help_description` (el backend debe aceptarlo; si no, se filtra sin romper)
  - Los 3 bloques JSON en secciones markdown (`## 1. HCG`, `## 2. IA`, `## 3. CI`)
