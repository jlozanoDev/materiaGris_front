# Design: Plantillas de Informes para Seeders

## Technical Approach

Generar 3 estructuras JSON completas que cumplen el contrato `ReportTemplate` del frontend. Cada plantilla contiene header (fixed_text con variables del sistema), 2-3 body sections, y footer. El output se serializa como archivo `.md` con 3 bloques JSON documentados. Sin cambios de código — solo datos semilla.

## Architecture Decisions

### Decision: Formato de salida

**Choice**: Archivo `.md` único con 3 bloques de código JSON, uno por plantilla.
**Alternatives**: Archivos JSON separados, seeder PHP directo.
**Rationale**: La propuesta define `.md` como deliverable único. Permite revisión humana antes de que backend lo convierta a seeders. Más portable que `.php`.

### Decision: Convenciones de naming

**Choice**: Prefijos globales `hcg_`, `ia_`, `ci_` para keys de campo. UUIDs descriptivos como `uuid-hcg-section-anamnesis`.
**Alternatives**: Nombres planos sin prefijo, hashes.
**Rationale**: Prefijos garantizan unicidad global (validación client-side). UUIDs descriptivos facilitan debug en logs y revisión de PR. La unicidad la exige el spec (§Scenario: JSON cumple contrato ReportTemplate).

### Decision: Estrategia ai_help_description

**Choice**: Descripción en español natural, 1-2 oraciones, orientada a LLM. Explica qué dato clínico se espera, formato, y contexto.
**Alternatives**: Inglés técnico, prompts estructurados tipo JSON Schema.
**Rationale**: El backend usa estos textos para guiar a la IA en el llenado automático. Español natural coincide con el dominio clínico hispanohablante. El spec exige ai_help_description en todo campo editable (Spec §ai_help_description presente).

### Decision: No key en Section

**Choice**: Seguir estrictamente la interfaz TypeScript — Section solo tiene `id`, `label`, `display`, `rows`. Sin `key`.
**Alternatives**: Agregar `key` a Section como extensión.
**Rationale**: `structure` es JSON column en backend — pero el frontend deserializa contra la interfaz `Section`. Campos extras serían ignorados o causarían warnings.

### Decision: Header/Footer sin showLogo/showDate/showPageNumbers

**Choice**: Usar solo `enabled` y `pageDisplay` en `HeaderFooterConfig`.
**Alternatives**: Agregar propiedades visuales extra.
**Rationale**: La interfaz `HeaderFooterConfig` del frontend no tiene esos campos. Agregarlos sería ruido que el frontend ignora.

## Data Flow

```
Diseño JSON → design.md → Backend dev lee → DatabaseSeeder.php → POST /admin/report-templates
                                                                          ↓
                                                              Frontend carga plantilla → Builder UI → Formulario paciente
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `openspec/changes/plantillas-informes-seeders/plantillas-informes-seeders.md` | Create | Output final con 3 estructuras JSON listas para seeders |

## Interfaces / Contracts

Cada estructura cumple `ReportTemplate`:

```typescript
{
  name: string,
  description: string,       // orientado a IA
  structure: {
    sections: Section[],     // body
    header?: HeaderFooterConfig,
    footer?: HeaderFooterConfig
  }
}
```

Variables disponibles: `{paciente.nombre}`, `{paciente.edad}`, `{paciente.sexo}`, `{paciente.nro_historia}`, `{clinica.nombre}`, `{clinica.direccion}`, `{clinica.telefono}`, `{fecha.actual}`, `{fecha.formato_largo}`, `{usuario.nombre}`, `{usuario.matricula}`, `{medico.nombre}`, `{medico.matricula}`, `{medico.especialidad}`.

## Estructura JSON: Historia Clínica General

**Campos editables**: 16 | **Tipos**: text, textarea, number, date, multi_select, dynamic_table, fixed_text, horizontal_separator (8)

### Header

Section `uuid-hcg-section-header` con 3 fixed_text:
- `hcg_header_clinica`: `"{clinica.nombre}"` (bold, lg)
- `hcg_header_titulo`: `"Historia Clínica General"` (bold, md)
- `hcg_header_datos`: `"Paciente: {paciente.nombre} | HC N°: {paciente.nro_historia} | Edad: {paciente.edad} | Sexo: {paciente.sexo} | Fecha: {fecha.formato_largo}"`
- `hcg_header_medico`: `"Médico tratante: {medico.nombre} — Mat. {medico.matricula} | Especialidad: {medico.especialidad}"`

### Section 1: Anamnesis (`uuid-hcg-section-anamnesis`)

| Row | Cols | Field Key | Type | Required | ai_help_description |
|-----|------|-----------|------|----------|---------------------|
| 1 | 12 | `hcg_motivo_consulta` | text | ✓ | "Razón principal por la que el paciente acude a consulta. Describir en una frase el síntoma o preocupación principal." |
| 2 | 12 | `hcg_enfermedad_actual` | textarea | ✓ | "Descripción cronológica detallada de los síntomas actuales: fecha de inicio, modo de instauración, evolución, características, factores agravantes y atenuantes." |
| 3 | 6+6 | `hcg_antecedentes_personales` | textarea | — | "Enfermedades crónicas diagnosticadas, hospitalizaciones previas con fechas aproximadas, cirugías, traumatismos, transfusiones." |
| 3 | 6+6 | `hcg_antecedentes_familiares` | textarea | — | "Enfermedades hereditarias o relevantes en familiares de primer grado (padres, hermanos, hijos)." |
| 4 | 6+6 | `hcg_habitos` | multi_select | — | "Hábitos del paciente. Opciones: tabaco, alcohol, ejercicio, otros. Seleccionar todos los que apliquen." |
| 4 | 6+6 | `hcg_alergias` | multi_select | — | "Alergias conocidas del paciente. Opciones: Penicilina, Sulfamidas, AINEs, Látex, Alimentos, Otros." |
| 5 | 12 | `hcg_medicacion_habitual` | dynamic_table | — | "Tabla de medicación que el paciente toma habitualmente. Columnas: nombre del medicamento, dosis, frecuencia (c/8h, c/12h, c/24h, S.O.S.)." |

**hcg_habitos options**: `[{label:"Tabaco",value:"tabaco"},{label:"Alcohol",value:"alcohol"},{label:"Ejercicio",value:"ejercicio"},{label:"Otros",value:"otros"}]`
**hcg_alergias options**: `[{label:"Penicilina",value:"penicilina"},{label:"Sulfamidas",value:"sulfamidas"},{label:"AINEs",value:"aines"},{label:"Látex",value:"latex"},{label:"Alimentos",value:"alimentos"},{label:"Otros",value:"otros"}]`
**hcg_medicacion_habitual columns**: `[{key:"medicamento",label:"Medicamento",type:"text",required:true},{key:"dosis",label:"Dosis",type:"text",required:true},{key:"frecuencia",label:"Frecuencia",type:"select",required:true,options:[{label:"c/8h",value:"c8h"},{label:"c/12h",value:"c12h"},{label:"c/24h",value:"c24h"},{label:"S.O.S.",value:"sos"}]}]`

### Section 2: Examen Físico (`uuid-hcg-section-examen-fisico`)

| Row | Cols | Field Key | Type | Required | Props | ai_help_description |
|-----|------|-----------|------|----------|-------|---------------------|
| 1 | 4+4+4 | `hcg_ta` | text | ✓ | max_chars:10, placeholder:"120/80" | "Presión arterial en formato sistólica/diastólica (ej: 120/80 mmHg)." |
| 1 | 4+4+4 | `hcg_fc` | number | ✓ | min:0 | "Frecuencia cardíaca en latidos por minuto (lpm). Valor normal adulto: 60-100 lpm." |
| 1 | 4+4+4 | `hcg_fr` | number | ✓ | min:0 | "Frecuencia respiratoria en respiraciones por minuto (rpm). Valor normal adulto: 12-20 rpm." |
| 2 | 4+4+4 | `hcg_temperatura` | number | — | min:30, max:45, decimals:1 | "Temperatura corporal en grados Celsius (°C). Valor normal: 36.0-37.5 °C." |
| 2 | 4+4+4 | `hcg_peso` | number | — | min:0, decimals:1 | "Peso corporal en kilogramos (kg)." |
| 2 | 4+4+4 | `hcg_talla` | number | — | min:0, decimals:2 | "Talla en metros (ej: 1.70)." |
| 3 | 12 | `hcg_imc` | number | — | min:0, decimals:1 | "Índice de Masa Corporal calculado como peso(kg) / talla²(m). Debe calcularse a partir de los campos peso y talla." |
| 4 | 12 | `hcg_exploracion_general` | textarea | — | — | "Hallazgos del examen físico general: estado general, piel y mucosas, tejido celular subcutáneo, marcha, actitud." |
| 5 | 12 | `hcg_separador_sistemas` | horizontal_separator | — | showLabel:false | Decorativo |
| 6 | 12 | `hcg_exploracion_sistemas` | textarea | — | — | "Hallazgos del examen físico por sistemas: cabeza y cuello, tórax, cardiovascular, abdomen, neurológico, osteoarticular." |

### Section 3: Diagnóstico y Plan (`uuid-hcg-section-diagnostico-plan`)

| Row | Cols | Field Key | Type | Required | ai_help_description |
|-----|------|-----------|------|----------|---------------------|
| 1 | 12 | `hcg_diagnostico_principal` | text | ✓ | "Diagnóstico presuntivo o definitivo principal, preferentemente codificado según CIE-10." |
| 2 | 12 | `hcg_diagnosticos_secundarios` | textarea | — | "Diagnósticos secundarios o comorbilidades relevantes, uno por línea." |
| 3 | 12 | `hcg_plan_estudios` | multi_select | — | "Estudios complementarios solicitados. Opciones: Laboratorio, Radiografía, Ecografía, Tomografía, Resonancia Magnética, Electrocardiograma, Otros." |
| 4 | 12 | `hcg_plan_terapeutico` | textarea | ✓ | "Plan terapéutico: indicaciones farmacológicas (medicamento, dosis, duración), no farmacológicas, derivaciones a especialistas, y pautas de seguimiento." |

**hcg_plan_estudios options**: `[{label:"Laboratorio",value:"laboratorio"},{label:"Radiografía",value:"radiografia"},{label:"Ecografía",value:"ecografia"},{label:"Tomografía",value:"tomografia"},{label:"Resonancia Magnética",value:"resonancia"},{label:"Electrocardiograma",value:"ecg"},{label:"Otros",value:"otros"}]`

### Footer

Section `uuid-hcg-section-footer` con 1 fixed_text:
- `hcg_footer_firma`: `"Documento generado el {fecha.actual}. {medico.nombre} — Mat. {medico.matricula}"`

**Tipos usados (8)**: fixed_text, text, textarea, number, multi_select, dynamic_table, horizontal_separator, date ✗

Total fields: 16 editables + 5 fixed_text + 1 separador = 22 campos

---

## Estructura JSON: Informe de Alta

**Campos editables**: 14 | **Tipos**: text, textarea, number, date, select, dynamic_table, fixed_text (7)

### Header

Section `uuid-ia-section-header` con 3 fixed_text:
- `ia_header_clinica`: `"{clinica.nombre}"` (bold, lg)
- `ia_header_direccion`: `"{clinica.direccion} | Tel: {clinica.telefono}"`
- `ia_header_titulo`: `"Informe de Alta Médica"` (bold, md)
- `ia_header_paciente`: `"Paciente: {paciente.nombre} | HC N°: {paciente.nro_historia}"`

### Section 1: Datos de Ingreso (`uuid-ia-section-ingreso`)

| Row | Cols | Field Key | Type | Required | Props | ai_help_description |
|-----|------|-----------|------|----------|-------|---------------------|
| 1 | 6+6 | `ia_fecha_ingreso` | date | ✓ | — | "Fecha en que el paciente ingresó a la institución." |
| 1 | 6+6 | `ia_fecha_egreso` | date | — | — | "Fecha en que el paciente egresó de la institución." |
| 2 | 12 | `ia_diagnostico_ingreso` | text | ✓ | — | "Diagnóstico con el que el paciente fue internado, preferentemente codificado según CIE-10." |
| 3 | 6+6 | `ia_servicio` | select | ✓ | — | "Servicio hospitalario responsable de la internación." |
| 3 | 6+6 | `ia_medico_tratante` | text | — | default_value:"{medico.nombre}" | "Nombre del médico tratante responsable de la internación." |

**ia_servicio options**: `[{label:"Clínica Médica",value:"clinica_medica"},{label:"Cirugía",value:"cirugia"},{label:"Pediatría",value:"pediatria"},{label:"UTI",value:"uti"},{label:"Obstetricia",value:"obstetricia"}]`

### Section 2: Evolución (`uuid-ia-section-evolucion`)

| Row | Cols | Field Key | Type | Required | ai_help_description |
|-----|------|-----------|------|----------|---------------------|
| 1 | 12 | `ia_resumen_evolucion` | textarea | ✓ | "Resumen cronológico de la evolución clínica del paciente durante la internación. Incluir eventos relevantes, respuesta al tratamiento y cambios en el estado clínico." |
| 2 | 12 | `ia_procedimientos` | textarea | — | "Procedimientos diagnósticos y/o terapéuticos realizados durante la internación, con fechas." |
| 3 | 6+6 | `ia_complicaciones` | textarea | — | "Complicaciones ocurridas durante la internación. Si no las hubo, indicar 'Sin complicaciones'." |
| 3 | 6+6 | `ia_interconsultas` | textarea | — | "Interconsultas realizadas a otras especialidades durante la internación, con hallazgos relevantes." |

### Section 3: Alta Médica (`uuid-ia-section-alta`)

| Row | Cols | Field Key | Type | Required | Props | ai_help_description |
|-----|------|-----------|------|----------|-------|---------------------|
| 1 | 12 | `ia_diagnostico_egreso` | text | ✓ | — | "Diagnóstico principal al momento del alta hospitalaria, codificado según CIE-10." |
| 2 | 6 | `ia_condicion_egreso` | select | ✓ | — | "Condición clínica del paciente al momento del egreso." |
| 3 | 12 | `ia_medicacion_alta` | dynamic_table | ✓ | — | "Tabla de medicamentos indicados al alta. Columnas: medicamento, dosis, frecuencia, duración (días), indicación." |
| 4 | 12 | `ia_recomendaciones` | textarea | ✓ | — | "Recomendaciones y cuidados que el paciente debe seguir tras el alta: dieta, actividad física, cuidados de heridas, signos de alarma." |
| 5 | 6+6 | `ia_controles_posteriores` | textarea | — | — | "Indicaciones para controles ambulatorios posteriores al alta: especialidad, plazos, estudios a realizar." |
| 5 | 6+6 | `ia_fecha_proximo_control` | date | — | — | "Fecha sugerida para el próximo control ambulatorio." |

**ia_condicion_egreso options**: `[{label:"Mejorado",value:"mejorado"},{label:"Curado",value:"curado"},{label:"Derivado",value:"derivado"},{label:"Fallecido",value:"fallecido"}]`
**ia_medicacion_alta columns**: `[{key:"medicamento",label:"Medicamento",type:"text",required:true},{key:"dosis",label:"Dosis",type:"text",required:true},{key:"frecuencia",label:"Frecuencia",type:"select",required:true,options:[{label:"c/8h",value:"c8h"},{label:"c/12h",value:"c12h"},{label:"c/24h",value:"c24h"},{label:"S.O.S.",value:"sos"}]},{key:"duracion",label:"Duración (días)",type:"number",required:true},{key:"indicacion",label:"Indicación",type:"text",required:false}]`

### Footer

Section `uuid-ia-section-footer` con 1 fixed_text:
- `ia_footer_firma`: `"Fecha de emisión: {fecha.actual} | Médico: {medico.nombre} — Mat. {medico.matricula}"`

Total fields: 14 editables + 5 fixed_text = 19 campos

---

## Estructura JSON: Consentimiento Informado

**Campos editables**: 14 | **Tipos**: text, textarea, radio, checkbox, select, date, fixed_text (7)

### Header

Section `uuid-ci-section-header` con 3 fixed_text:
- `ci_header_clinica`: `"{clinica.nombre}"` (bold, lg)
- `ci_header_direccion`: `"{clinica.direccion} | Tel: {clinica.telefono}"`
- `ci_header_titulo`: `"Consentimiento Informado"` (bold, md)

### Section 1: Información del Procedimiento (`uuid-ci-section-informacion`)

| Row | Cols | Field Key | Type | Required | ai_help_description |
|-----|------|-----------|------|----------|---------------------|
| 1 | 12 | `ci_titulo_procedimiento` | fixed_text | — | `"Procedimiento: {paciente.nombre}"` — texto fijo informativo |
| 2 | 12 | `ci_procedimiento` | text | ✓ | "Nombre del procedimiento médico o quirúrgico propuesto." |
| 3 | 12 | `ci_descripcion` | textarea | ✓ | "Descripción detallada del procedimiento en lenguaje claro y comprensible para el paciente, sin tecnicismos innecesarios." |
| 4 | 6 | `ci_tipo_anestesia` | select | — | "Tipo de anestesia prevista para el procedimiento." |
| 5 | 12 | `ci_beneficios` | textarea | ✓ | "Beneficios esperados del procedimiento: qué se espera lograr y cómo mejorará la condición del paciente." |
| 6 | 6+6 | `ci_riesgos_frecuentes` | textarea | ✓ | "Riesgos y complicaciones frecuentes asociadas al procedimiento (incidencia >1%)." |
| 6 | 6+6 | `ci_riesgos_graves` | textarea | — | "Riesgos graves o potencialmente mortales, aunque sean poco frecuentes." |
| 7 | 12 | `ci_alternativas` | textarea | — | "Opciones terapéuticas alternativas al procedimiento propuesto, incluyendo la opción de no realizar el procedimiento y sus consecuencias." |

**ci_tipo_anestesia options**: `[{label:"Local",value:"local"},{label:"Regional",value:"regional"},{label:"General",value:"general"},{label:"Sedación",value:"sedacion"}]`

### Section 2: Autorización (`uuid-ci-section-autorizacion`)

| Row | Cols | Field Key | Type | Required | Props | ai_help_description |
|-----|------|-----------|------|----------|-------|---------------------|
| 1 | 12 | `ci_declaracion_comprension` | fixed_text | — | text_content con texto legal | "He comprendido la información proporcionada sobre el procedimiento, sus beneficios, riesgos y alternativas. He tenido la oportunidad de formular preguntas y todas han sido respondidas satisfactoriamente." |
| 2 | 12 | `ci_preguntas_resueltas` | radio | ✓ | options: Sí/No | "¿El médico respondió todas sus preguntas sobre el procedimiento?" |
| 3 | 12 | `ci_aceptacion` | checkbox | ✓ | options: "Acepto el procedimiento descrito" | "Confirmación de que el paciente acepta voluntariamente el procedimiento descrito." |
| 4 | 6+6 | `ci_nombre_paciente` | text | ✓ | default_value:"{paciente.nombre}" | "Nombre completo del paciente que otorga el consentimiento." |
| 4 | 6+6 | `ci_firma_paciente` | text | ✓ | — | "Firma del paciente. En formato digital, escribir nombre completo. En papel, firma manuscrita." |
| 5 | 6+6 | `ci_nombre_medico` | text | ✓ | default_value:"{medico.nombre}" | "Nombre completo del médico responsable que realiza el procedimiento." |
| 5 | 6+6 | `ci_firma_medico` | text | — | — | "Firma del médico responsable. En formato digital, escribir nombre completo." |
| 6 | 6+6 | `ci_nombre_testigo` | text | — | — | "Nombre completo del testigo presente en la firma del consentimiento." |
| 6 | 6+6 | `ci_firma_testigo` | text | — | — | "Firma del testigo. En formato digital, escribir nombre completo." |
| 7 | 12 | `ci_fecha_firma` | fixed_text | — | text_content:"Fecha de firma: {fecha.formato_largo}" | — |

**ci_preguntas_resueltas options**: `[{label:"Sí",value:"si"},{label:"No",value:"no"}]`
**ci_aceptacion options**: `[{label:"Acepto el procedimiento descrito y autorizo su realización",value:"acepto"}]`

### Footer

Section `uuid-ci-section-footer` con 2 fixed_text:
- `ci_footer_fecha`: `"Fecha de firma: {fecha.actual}"`
- `ci_footer_legal`: `"Este documento forma parte de la historia clínica del paciente. Se entrega copia al paciente y otra queda archivada en la institución."` (styling_options: size sm)

Total fields: 14 editables + 7 fixed_text = 21 campos

---

## Plan de Serialización

El archivo `plantillas-informes-seeders.md` se estructura así:

```markdown
# Plantillas de Informes — Datos Semilla

## 1. Historia Clínica General
\`\`\`json
{ ... estructura completa ... }
\`\`\`

## 2. Informe de Alta
\`\`\`json
{ ... estructura completa ... }
\`\`\`

## 3. Consentimiento Informado
\`\`\`json
{ ... estructura completa ... }
\`\`\`
```

**Reglas de serialización**:
1. Cada bloque JSON es un objeto completo con `name`, `description`, `structure`
2. `structure` contiene `sections` (body) + `header` + `footer`
3. Header y footer tienen `enabled: true`, `pageDisplay: "all"`, y sus propias `sections`
4. IDs usan placeholders descriptivos (`"uuid-hcg-section-anamnesis"`) — el backend los reemplazará con `crypto.randomUUID()` en el seeder
5. `showLabel: false` en fixed_text y separadores; `showLabel: true` (default, omitido) en el resto
6. Sin `key` en Section/Row/Column — solo en Field
7. Sin columnas `calculated` en dynamic_table

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Validación | JSON sintácticamente válido | `JSON.parse()` sobre cada bloque |
| Contrato | Coincidencia con interfaz `ReportTemplate` | Validación manual de propiedades requeridas |
| Unicidad | Keys no duplicadas en cada plantilla | Script de verificación de keys únicas globalmente |
| Tipos | Propiedades según `allowedProperties` | Chequeo contra el registro de tipos del frontend |

## Open Questions

- [ ] ¿El backend acepta `ai_help_description`? El frontend lo serializa en el payload de create/update, pero el backend debe aceptarlo. Si no, se filtrará sin romper.
- [ ] ¿Los UUIDs descriptivos deben reemplazarse por `crypto.randomUUID()` reales en el seeder, o los acepta el backend como strings arbitrarios? El frontend usa `crypto.randomUUID()` al crear campos nuevos, pero el backend recibe strings y no valida formato UUID.
