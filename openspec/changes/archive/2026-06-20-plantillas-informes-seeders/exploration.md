## Exploration: Catálogo de tipos, estructuras y contrato API para seeders de plantillas de informe

### Current State

El sistema de plantillas de informe en MateriaGris permite al administrador construir formularios clínicos mediante drag & drop. La jerarquía es: **Section → Row → Column → Field**. El backend persiste la plantilla con campos: `name`, `description` y `structure` (JSON libre). El frontend construye, visualiza y rellena informes basados en estas plantillas.

La estructura `ReportTemplate` incluye 3 zonas desde el cambio de cabecera/pie: **header** (cabecera), **body** (cuerpo, `sections`) y **footer** (pie). Cada zona comparte la misma infraestructura de Section/Row/Column/Field.

### Affected Areas

| Archivo | Rol |
|---------|-----|
| `src/shared/types/index.ts` (L109-274) | Definición canónica de TODOS los tipos: `ReportTemplate`, `FieldConfig`, `Section`, `Row`, `Column`, `HeaderFooterConfig`, etc. |
| `src/shared/types/defaultFieldTypeRegistry.ts` | 12 tipos de campo registrados con factories por defecto y `allowedProperties` |
| `src/shared/types/FieldTypeMeta.ts` | Metadatos de cada tipo de campo (label, icon, group, defaultFactory, allowedProperties) |
| `src/shared/types/SystemVariableRegistry.ts` | Registro de variables del sistema para interpolación `{categoria.clave}` |
| `src/shared/composables/useSystemVariableRegistry.ts` | 14 variables fallback registradas: paciente(4), clinica(3), fecha(2), usuario(2), medico(3) |
| `src/modules/admin/report-template/presentation/composables/useTemplateBuilder.ts` | Lógica del builder: genera estructura, serializa/deserializa, valida claves duplicadas |
| `src/modules/admin/report-template/infrastructure/ApiReportTemplateRepository.ts` | Cliente HTTP: `POST /admin/report-templates` (create), `PUT /admin/report-templates/{id}` (update) |
| `src/modules/admin/report-template/presentation/utils/generateExampleData.ts` | Generador de datos de ejemplo por tipo de campo |
| `docs/tecnica/modulos/admin-report-template.md` | Documentación técnica del módulo multi-zona |
| `docs/funcional/modulos/admin-report-template.md` | Documentación funcional con criterios de aceptación |

### 1. Estructura JSON completa de un ReportTemplate

```typescript
// Tipo raíz — lo que espera el backend
interface ReportTemplate {
  id: string
  name: string                          // obligatorio, validado client-side
  description: string                   // libre, orientado a IA
  isActive: boolean                     // backend-managed, default true
  structure: {
    sections: Section[]                 // CUERPO — siempre presente
    header?: HeaderFooterConfig         // CABECERA — opcional, solo si tiene contenido
    footer?: HeaderFooterConfig         // PIE — opcional, solo si tiene contenido
  }
  createdAt?: string
  updatedAt?: string
}

interface HeaderFooterConfig {
  enabled: boolean                      // default: false
  pageDisplay: 'all' | 'first' | 'last'  // default: 'all'
  sections: Section[]                   // misma estructura que el cuerpo
}

interface Section {
  id: string                            // UUID, ej: "550e8400-e29b-41d4-a716-446655440000"
  label: string                         // Nombre visible, ej: "Datos del Paciente"
  display?: string                      // 'default' | 'tabs' — controla renderizado
  rows: Row[]
}

interface Row {
  id: string                            // UUID
  columns: Column[]
}

interface Column {
  id: string                            // UUID
  label: string                         // Etiqueta (a veces vacía)
  width?: number                        // Ancho en px (opcional), ej: 40 para separadores
  fields: FieldConfig[]                 // Campos dentro de la columna
}

// Discriminated union — 12 variantes
type FieldConfig =
  | TextField | NumberField | DateField
  | SelectionField  // select | multi_select | radio | checkbox
  | FixedTextField
  | DynamicTableField
  | VerticalSeparatorField
  | HorizontalSeparatorField
```

### 2. Catálogo completo de tipos de campo

#### 2.1 Propiedades base (FieldBase — compartidas por todos)
```typescript
interface FieldBase {
  id: string                  // UUID único en toda la plantilla
  key: string                 // Clave única global (header+body+footer), snake_case
  label: string               // Etiqueta visible
  required: boolean           // Obligatorio en formulario
  showLabel?: boolean         // Mostrar label (default: true; false para separadores)
  ai_help_description?: string // Descripción para ayudar a la IA a rellenar el campo
}
```

#### 2.2 Grupo "Texto" (text group en la paleta)

| Tipo | Discriminante | Propiedades específicas | defaultFactory |
|------|---------------|------------------------|----------------|
| **Texto Corto** | `"text"` | `max_chars?: number`, `placeholder?: string`, `default_value?: string` | `{ type:'text', label:'Nuevo campo', key:'nuevo_campo', required:false }` |
| **Texto Largo** | `"textarea"` | `max_chars?: number`, `placeholder?: string`, `default_value?: string` | `{ type:'textarea', label:'Nuevo campo', key:'nuevo_campo', required:false }` |
| **Número** | `"number"` | `decimals?: number`, `min?: number`, `max?: number`, `default_value?: number` | `{ type:'number', label:'Nuevo campo', key:'nuevo_campo', required:false }` |
| **Fecha** | `"date"` | `min_date?: string`, `max_date?: string`, `placeholder?: string`, `default_value?: string` | `{ type:'date', label:'Nuevo campo', key:'nuevo_campo', required:false }` |

**allowedProperties (text, textarea):** `id, type, label, key, required, ai_help_description, showLabel, max_chars, placeholder, default_value`
**allowedProperties (number):** `id, type, label, key, required, ai_help_description, showLabel, decimals, min, max, default_value`
**allowedProperties (date):** `id, type, label, key, required, ai_help_description, showLabel, min_date, max_date, placeholder, default_value`

#### 2.3 Grupo "Selección" (selection group)

| Tipo | Discriminante | Propiedades específicas | defaultFactory |
|------|---------------|------------------------|----------------|
| **Selección** | `"select"` | `options: FieldOption[]`, `placeholder?: string`, `default_value?: string \| string[]` | `{ type:'select', label:'Nuevo campo', key:'nuevo_campo', required:false, options:[] }` |
| **Selección Múltiple** | `"multi_select"` | Igual que select | Misma factory que select |
| **Opción Única** | `"radio"` | Igual que select | Misma factory que select |
| **Checkbox** | `"checkbox"` | Igual que select | Misma factory que select |

```typescript
interface FieldOption {
  label: string   // Texto visible, ej: "Sí"
  value: string   // Valor almacenado, ej: "si"
}
```

**allowedProperties (select, multi_select, radio, checkbox):** `id, type, label, key, required, ai_help_description, showLabel, options, placeholder, default_value`

#### 2.4 Grupo "Especiales" (special group)

| Tipo | Discriminante | Propiedades específicas | defaultFactory |
|------|---------------|------------------------|----------------|
| **Texto Fijo** | `"fixed_text"` | `text_content: string`, `styling_options?: { bold?: boolean, size?: 'sm' \| 'md' \| 'lg' }` | `{ type:'fixed_text', label:'Texto Fijo', key:'texto_fijo', required:false, text_content:'' }` |
| **Tabla Dinámica** | `"dynamic_table"` | `columns: TableColumnDef[]`, `footer_totals?: FooterTotal[]` | `{ type:'dynamic_table', label:'Nuevo campo', key:'nuevo_campo', required:false, columns:[] }` |
| **Separador Vertical** | `"vertical_separator"` | Sin props extra, showLabel=false | `{ type:'vertical_separator', label:'', key:'separador', required:false, showLabel:false }` |
| **Separador Horizontal** | `"horizontal_separator"` | Sin props extra, showLabel=false | `{ type:'horizontal_separator', label:'', key:'separador_horizontal', required:false, showLabel:false }` |

**allowedProperties (fixed_text):** `id, type, label, key, required, ai_help_description, showLabel, text_content, styling_options`
**allowedProperties (dynamic_table):** `id, type, label, key, required, ai_help_description, showLabel, columns, footer_totals`
**allowedProperties (separators):** `id, type, label, key` (mínimo)

#### 2.5 Subtipos de DynamicTable

```typescript
interface TableColumnDef {
  key: string                    // Clave de columna
  label: string                  // Encabezado visible
  type: 'text' | 'number' | 'date' | 'select'  // Tipo de celda
  required: boolean
  options?: FieldOption[]        // Solo para type='select'
}

interface CalculatedColumnDef extends TableColumnDef {
  calculated: true
  formula: CalculatedFormula
}

type CalculatedFormula =
  | { op: 'sum' | 'avg' | 'count'; sourceKey: string }
  | { expression: string }

interface FooterTotal {
  label: string
  formula: CalculatedFormula
}
```

### 3. Variables del sistema disponibles

El `SystemVariableRegistry` se precarga con 14 variables fallback en `registerFallbackVariables()` (L68-83):

| Categoría | Clave | Label | Descripción | Sintaxis de uso |
|-----------|-------|-------|-------------|-----------------|
| `paciente` | `nombre` | Nombre del paciente | Nombre completo del paciente | `{paciente.nombre}` |
| `paciente` | `edad` | Edad | Edad del paciente en años | `{paciente.edad}` |
| `paciente` | `sexo` | Sexo | Sexo del paciente | `{paciente.sexo}` |
| `paciente` | `nro_historia` | Nro. Historia Clínica | Número de historia clínica | `{paciente.nro_historia}` |
| `clinica` | `nombre` | Nombre de la clínica | Nombre de la clínica o institución | `{clinica.nombre}` |
| `clinica` | `direccion` | Dirección | Dirección de la clínica | `{clinica.direccion}` |
| `clinica` | `telefono` | Teléfono | Teléfono de contacto | `{clinica.telefono}` |
| `fecha` | `actual` | Fecha actual | Fecha del día de hoy | `{fecha.actual}` |
| `fecha` | `formato_largo` | Fecha formato largo | Fecha en formato largo (ej: 14 de junio de 2026) | `{fecha.formato_largo}` |
| `usuario` | `nombre` | Nombre del usuario | Nombre del profesional que genera el informe | `{usuario.nombre}` |
| `usuario` | `matricula` | Matrícula | Número de matrícula profesional | `{usuario.matricula}` |
| `medico` | `nombre` | Nombre del médico | Nombre completo del médico tratante | `{medico.nombre}` |
| `medico` | `matricula` | Matrícula | Número de matrícula del médico | `{medico.matricula}` |
| `medico` | `especialidad` | Especialidad | Especialidad del médico | `{medico.especialidad}` |

**Nota**: La API del backend (`GET /admin/system-variables`) puede extender estas variables. Si la API responde con datos válidos, el frontend usa esos datos en lugar de los fallback.

**Categorías predefinidas** (siempre existen aunque estén vacías): `paciente`, `clinica`, `fecha`, `usuario` (y `medico` que se añade vía fallback).

### 4. Contrato API

#### 4.1 Create (POST)
```
POST /admin/report-templates
Content-Type: application/json

Payload:
{
  "name": string,           // REQUERIDO, no vacío
  "description": string,    // Texto libre
  "structure": {
    "sections": Section[],  // REQUERIDO
    "header"?: { enabled: boolean, pageDisplay: "all"|"first"|"last", sections: Section[] },
    "footer"?: { enabled: boolean, pageDisplay: "all"|"first"|"last", sections: Section[] }
  }
}
```

Respuesta esperada: `{ id, name, description, structure, ... }`
- Status 422: error de validación (se propaga al cliente)
- Status 2xx: éxito

#### 4.2 Update (PUT)
```
PUT /admin/report-templates/{id}
Content-Type: application/json

Payload: mismo que create
```
- Status 422: error de validación
- Status 2xx: éxito

#### 4.3 Validaciones client-side (useTemplateBuilder)
- `name` no puede estar vacío (L678-679)
- Las claves (`key`) deben ser únicas en toda la plantilla (header + body + footer), validación en L129-150 y L521-524
- Si el usuario no tiene permiso `admin.reporttemplate.update`, se lanza error (L646-648)
- El backend puede devolver 409 al intentar eliminar una plantilla con informes asociados

#### 4.4 Permisos requeridos
| Operación | Permiso |
|-----------|---------|
| Ver lista | `admin.reporttemplate.view` |
| Crear | `admin.reporttemplate.create` |
| Editar | `admin.reporttemplate.update` |
| Eliminar | `admin.reporttemplate.update` (implícito en frontend) |
| Guardar | `admin.reporttemplate.update` |

### 5. Ejemplos reales encontrados en tests

#### 5.1 Template mínimo con un campo text en el cuerpo
```json
{
  "name": "Template A",
  "description": "",
  "structure": {
    "sections": [
      {
        "id": "s1",
        "label": "Datos",
        "display": "default",
        "rows": [
          {
            "id": "r1",
            "columns": [
              {
                "id": "c1",
                "fields": [
                  {
                    "id": "f1",
                    "key": "nombre",
                    "type": "text",
                    "label": "Nombre",
                    "required": true
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```
Fuente: `useReportForm.test.ts`, `useTemplateBuilder.spec.ts`

#### 5.2 Template con header y footer
```json
{
  "id": 1,
  "name": "With Header",
  "description": "",
  "structure": {
    "sections": [],
    "header": {
      "enabled": true,
      "pageDisplay": "first",
      "sections": [
        {
          "id": "h1",
          "label": "Header",
          "display": "default",
          "rows": []
        }
      ]
    },
    "footer": {
      "enabled": true,
      "pageDisplay": "last",
      "sections": [
        {
          "id": "f1",
          "label": "Footer",
          "display": "default",
          "rows": []
        }
      ]
    }
  }
}
```
Fuente: `useTemplateBuilder.spec.ts` L546-565

#### 5.3 Section con `display: "tabs"`
```json
{
  "sections": [
    { "id": "s1", "label": "Section 1", "display": "default", "rows": [] },
    { "id": "s2", "label": "Section 2", "display": "tabs", "rows": [] }
  ]
}
```
Fuente: `ReportTemplateBuilderPage.spec.ts` L184-191. El valor `"default"` se usa universalmente; `"tabs"` aparece en tests pero no está documentado formalmente.

### 6. Hallazgos clave para diseñar plantillas completas

1. **IDs deben ser UUIDs**: El frontend usa `crypto.randomUUID()` para generar IDs. El backend debe aceptar strings UUID.

2. **Claves (`key`) únicas globales**: Todas las claves de campo (header + body + footer) deben ser únicas. Usar snake_case descriptivo. La función `slugify()` convierte labels a keys: minúsculas, solo `[a-z0-9_]`, sin guiones bajos al inicio/final.

3. **`display` en Section**: El valor canónico es `"default"`. El valor `"tabs"` aparece en tests pero no está documentado oficialmente. Usar `"default"` para seeders.

4. **Header/footer son opcionales**: Solo se serializan si `enabled=true` o tienen secciones con contenido. Templates legacy sin header/footer funcionan perfectamente — el frontend carga defaults seguros.

5. **`ai_help_description` es el campo clave para IA**: Descripciones orientadas a ayudar a un LLM a rellenar el campo correctamente. Debe ser descriptivo y contextual.

6. **`styling_options` en fixed_text**: Solo soporta `bold` (boolean) y `size` (`'sm'|'md'|'lg'`). No soporta italic, color, alignment, font-size arbitrario (a pesar de lo que dice la doc antigua).

7. **`TextField` cubre `'text'` y `'textarea'`**: Comparten la misma interfaz TypeScript. La diferencia es semántica (multilínea vs single-line).

8. **`width` en Column**: Opcional. Se usa principalmente en separadores verticales (width: 40). Para columnas normales, se omite o se deja que el layout lo calcule.

9. **Separadores**: `vertical_separator` y `horizontal_separator` son campos decorativos sin interacción. `showLabel=false` por defecto.

10. **El backend recibe `structure` como JSON libre**: No hay migraciones en el backend para cambios de estructura. El campo `structure` es un JSON column en la base de datos.

### Recommendation

Para los 3 seeders de plantillas, recomiendo diseñar:

1. **Historia Clínica General** — formulario completo de datos del paciente, motivo de consulta, exploración física, diagnóstico
2. **Informe de Alta** — resumen de hospitalización, evolución, tratamiento, recomendaciones al alta
3. **Consentimiento Informado** — texto legal con fixed_text + campos de datos personales + firma

Cada seeder debe incluir:
- Header con datos de clínica/médico (fixed_text con variables del sistema)
- Footer con fecha, matrícula y página (fixed_text con variables)
- Multi-sección con display: "default"
- Variedad de tipos de campo (text, textarea, number, date, select, radio, checkbox, fixed_text)
- Descripciones `ai_help_description` y `description` orientadas a IA
- Al menos un campo `required: true` por sección

### Ready for Proposal
Sí. Se tiene toda la información de tipos, estructura, API y validaciones necesaria para generar seeders de backend con plantillas realistas y completas.
