# Spec: Plantillas Informes Seeders

## Purpose
Requisitos funcionales y técnicos de 3 plantillas de informe médico para datos semilla backend. Output: archivo `.md` con estructuras JSON completas. No hay cambios de código.

## Requisitos funcionales

### HCG: Historia Clínica General

| # | Campo | Tipo | Required | Variables | ai_help_description |
|---|-------|------|----------|-----------|---------------------|
| 1 | Header institucional | fixed_text | No | `{clinica.nombre}`, `{medico.nombre}` | No aplica (fixed) |
| 2 | Fecha documento | date | Sí | `{fecha.actual}` | "Fecha de realización de la historia clínica" |
| 3 | Motivo de consulta | textarea | Sí | — | "Razón principal por la que el paciente acude a consulta" |
| 4 | Enfermedad actual | textarea | Sí | — | "Descripción cronológica de síntomas actuales, inicio y evolución" |
| 5 | Antecedentes patológicos | textarea | No | — | "Enfermedades crónicas, hospitalizaciones previas, condiciones relevantes" |
| 6 | Antecedentes quirúrgicos | textarea | No | — | "Cirugías previas con fechas aproximadas" |
| 7 | Antecedentes farmacológicos | textarea | No | — | "Medicación habitual, dosis, alergias medicamentosas" |
| 7b | Alergias conocidas | text | No | — | "Lista de alergias medicamentosas, alimentos u otras sustancias" |
| 8 | Grupo sanguíneo | select | No | options: A+, A-, B+, B-, AB+, AB-, O+, O- | "Grupo y factor Rh del paciente" |
| 9 | Tabaco | radio | No | — | "Hábito tabáquico actual o pasado" |
| 10 | Alcohol | radio | No | — | "Consumo de alcohol: frecuencia y cantidad" |
| 11 | TA sistólica | number | Sí | — | "Presión arterial sistólica en mmHg" |
| 12 | TA diastólica | number | Sí | — | "Presión arterial diastólica en mmHg" |
| 13 | Frecuencia cardíaca | number | Sí | — | "Frecuencia cardíaca en latidos por minuto" |
| 14 | Frecuencia respiratoria | number | No | — | "Frecuencia respiratoria en respiraciones por minuto" |
| 15 | Temperatura | number | No | — | "Temperatura corporal en grados Celsius" |
| 16 | Saturación O2 | number | No | — | "Saturación de oxígeno en porcentaje" |
| 17 | Cabeza y cuello | textarea | No | — | "Hallazgos del examen físico en cabeza y cuello" |
| 18 | Tórax | textarea | No | — | "Hallazgos del examen físico en tórax y cardiovascular" |
| 19 | Abdomen | textarea | No | — | "Hallazgos del examen físico abdominal" |
| 20 | Neurológico | textarea | No | — | "Hallazgos del examen neurológico básico" |
| 21 | Diagnóstico principal | textarea | Sí | — | "Diagnóstico presuntivo o definitivo según CIE-10" |
| 22 | Plan de tratamiento | textarea | Sí | — | "Indicaciones terapéuticas, estudios complementarios y derivaciones" |
| 23 | Footer médico | fixed_text | No | `{medico.nombre}`, `{medico.matricula}` | No aplica (fixed) |
| 24 | Separador secciones | horizontal_separator | No | — | No aplica (decorativo) |

**Secciones**: Header → Anamnesis → Examen Físico → Diagnóstico y Plan → Footer
**Tipos usados (8)**: fixed_text, date, textarea, text, select, radio, number, horizontal_separator

#### Scenario: Estructura jerárquica completa
- GIVEN plantilla HCG con 5 secciones
- WHEN se serializa a JSON
- THEN cada sección tiene Section→Row→Column→Field con IDs UUID
- AND header contiene fixed_text con `{clinica.nombre}` y `{medico.nombre}`
- AND footer contiene datos del médico y fecha interpolados

#### Scenario: Campos críticos bloquean envío vacío
- GIVEN plantilla con `required: true` en motivo de consulta, enfermedad actual, TA, FC y diagnóstico
- WHEN formulario se envía con esos campos vacíos
- THEN sistema rechaza envío con error de validación por campo

### IA: Informe de Alta

| # | Campo | Tipo | Required | Variables / Config | ai_help_description |
|---|-------|------|----------|---------------------|---------------------|
| 25 | Header institucional | fixed_text | No | `{clinica.nombre}`, `{medico.nombre}` | No aplica (fixed) |
| 26 | Fecha de ingreso | date | Sí | — | "Fecha en que el paciente ingresó al centro asistencial" |
| 27 | Diagnóstico de ingreso | textarea | Sí | — | "Diagnóstico con el que el paciente fue internado" |
| 28 | Servicio de internación | select | Sí | options: Clínica Médica, Cirugía, Pediatría, UTI, Obstetricia | "Servicio hospitalario responsable de la internación" |
| 29 | Días de internación | number | No | — | "Cantidad total de días que el paciente permaneció internado" |
| 30 | Resumen de evolución | textarea | Sí | — | "Resumen clínico de la evolución del paciente durante la internación" |
| 31 | Procedimientos realizados | textarea | No | — | "Procedimientos diagnósticos o terapéuticos realizados durante la internación" |
| 32 | Complicaciones | textarea | No | — | "Complicaciones ocurridas durante la internación, si las hubo" |
| 33 | Diagnóstico de egreso | textarea | Sí | — | "Diagnóstico principal al momento del alta hospitalaria" |
| 34 | Medicación al alta | dynamic_table | Sí | columns: medicamento(text), dosis(text), frecuencia(select), duración_dias(number) | "Tabla de medicamentos indicados al alta con dosis y frecuencia" |
| 35 | Recomendaciones | textarea | Sí | — | "Indicaciones y cuidados que el paciente debe seguir tras el alta" |
| 36 | Controles posteriores | text | No | — | "Fechas o plazos para controles ambulatorios posteriores al alta" |
| 37 | Footer fecha | date | Sí | `{fecha.actual}` | No aplica (fixed) |

**Secciones**: Header → Ingreso → Evolución → Alta → Footer
**Tipos usados (8)**: fixed_text, date, textarea, select, number, dynamic_table, text, horizontal_separator

#### Scenario: Tabla dinámica de medicación
- GIVEN sección Alta con campo dynamic_table
- WHEN médico agrega filas
- THEN tabla tiene columnas: nombre medicamento, dosis, frecuencia (c/8h, c/12h, c/24h, S.O.S), duración en días
- AND cada fila es un registro independiente de medicación

### CI: Consentimiento Informado

| # | Campo | Tipo | Required | Variables / Config | ai_help_description |
|---|-------|------|----------|---------------------|---------------------|
| 38 | Header institucional | fixed_text | No | `{clinica.nombre}`, `{clinica.direccion}` | No aplica (fixed) |
| 39 | Nombre del paciente | text | Sí | `{paciente.nombre}` | "Nombre completo del paciente que otorga el consentimiento" |
| 40 | Nro. historia clínica | text | Sí | `{paciente.nro_historia}` | "Número de historia clínica del paciente" |
| 41 | Procedimiento propuesto | text | Sí | — | "Nombre del procedimiento médico o quirúrgico a realizar" |
| 42 | Descripción del procedimiento | textarea | Sí | — | "Descripción detallada del procedimiento en lenguaje comprensible para el paciente" |
| 43 | Beneficios esperados | textarea | Sí | — | "Beneficios que se espera obtener con la realización del procedimiento" |
| 44 | Riesgos potenciales | textarea | Sí | — | "Riesgos, complicaciones y efectos adversos posibles del procedimiento" |
| 45 | Alternativas disponibles | textarea | Sí | — | "Opciones terapéuticas alternativas al procedimiento propuesto, incluyendo no tratar" |
| 46 | Recibió explicación verbal | radio | Sí | options: Sí/No | "Confirmación de que el médico explicó verbalmente el procedimiento" |
| 47 | Parentesco del testigo | select | No | options: Familiar directo, Cónyuge, Tutor legal, Otro | "Relación del testigo con el paciente que firma el consentimiento" |
| 48 | Declaración del paciente | fixed_text | No | Texto legal fijo | No aplica (fixed) |
| 49 | Revocabilidad del consentimiento | fixed_text | No | Texto legal fijo | No aplica (fixed) |
| 50 | Nombre del médico | text | Sí | `{medico.nombre}` | "Nombre completo del médico responsable que realiza el procedimiento" |
| 51 | Matrícula del médico | text | No | `{medico.matricula}` | "Número de matrícula profesional del médico responsable" |
| 52 | Firma del paciente | text | Sí | — | "Nombre y firma del paciente que otorga el consentimiento" |
| 53 | Firma del testigo | text | No | — | "Nombre y firma del testigo presente en la firma del consentimiento" |
| 54 | Footer fecha de firma | date | Sí | `{fecha.actual}` | "Fecha en que se firma el consentimiento informado" |

**Secciones**: Header → Información → Autorización y Firmas → Footer
**Tipos usados (7)**: fixed_text, text, date, textarea, radio, select, horizontal_separator

#### Scenario: Cláusulas legales no editables
- GIVEN plantilla CI con fixed_text para declaración del paciente y revocabilidad
- WHEN paciente visualiza el formulario
- THEN fixed_text muestra texto legal predefinido sin opción de edición
- AND campos editables (nombre, procedimiento, riesgos) requieren confirmación activa

## Requisitos técnicos

#### Scenario: JSON cumple contrato ReportTemplate
- GIVEN cualquier plantilla generada
- WHEN se valida contra la interfaz `ReportTemplate`
- THEN existe `structure.sections[]` con jerarquía completa Section→Row→Column→Field
- AND todos los IDs son strings UUID
- AND todas las keys son snake_case únicas globalmente (header + body + footer)
- AND header y footer tienen `enabled: true` y `pageDisplay`

#### Scenario: ai_help_description presente en campos editables
- GIVEN campo de tipo text, textarea, number, date, select, radio, checkbox o dynamic_table
- WHEN se inspecciona el campo
- THEN `ai_help_description` existe y no está vacío
- AND su contenido orienta a un LLM sobre qué información clínica rellenar

#### Scenario: Propiedades específicas por tipo de campo
- GIVEN campo number de signos vitales → THEN incluye `min: 0`
- GIVEN campo select → THEN tiene `options[]` con `{label, value}`
- GIVEN campo dynamic_table → THEN `columns[]` define columnas con `key`, `label`, `type`
- GIVEN campo radio (tabaco/alcohol) → THEN options son `[{label:"Sí",value:"si"},{label:"No",value:"no"}]`
