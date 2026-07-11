# Análisis Funcional: Módulo de Tipos de Informes Dinámicos

Este documento detalla la especificación funcional para el desarrollo del **Módulo de Configuración y Generación de Informes Dinámicos** en la plataforma clínica. El sistema se estructurará utilizando **Laravel (Backend)** y **Vue.js (Frontend)**, implementando un almacenamiento basado en estructuras de datos **JSON** para una máxima flexibilidad y fidelidad histórica.

---

## 1. Arquitectura de Datos y Almacenamiento

Para garantizar que los cambios futuros en las plantillas no afecten ni corrompan los informes clínicos que los médicos ya han cumplimentado en el pasado, el sistema implementará un modelo de **Versionado por Copia Estructural (*Snapshot*)**.

### 1.1 Entidades de Base de Datos

#### A. Tabla `report_templates` (Plantillas Maestras)
Almacena el diseño global creado por el administrador.
* `id` (UUID / Primary Key)
* `name` (String): Nombre del tipo de informe (ej: *Informe de Cardiología*).
* `description` (Text): Descripción interna de la utilidad del informe.
* `is_active` (Boolean): Estado de disponibilidad de la plantilla.
* `structure` (**JSON**): El árbol completo de maquetación (Secciones ➔ Filas ➔ Columnas ➔ Campos) junto con sus reglas de validación y condicionales.

#### B. Tabla `patient_reports` (Informes de Pacientes)
Almacena el documento real e inmutable cumplimentado para un paciente específico.
* `id` (UUID / Primary Key)
* `patient_id` (Foreign Key): Relación con el paciente.
* `user_id` (Foreign Key): Relación con el médico / profesional autor.
* `status` (Enum): `['borrador', 'firmado', 'archivado']`.
* `template_structure_snapshot` (**JSON**): **Copia idéntica** del campo `structure` de la plantilla maestra en el microsegundo exacto en que el médico inició el informe.
* `values` (**JSON**): Estructura llave-valor puramente con las respuestas dadas (`{"campo_id_1": "Valor", "campo_id_2": true}`).

---

## 2. Requisitos Funcionales (RF)

### RF1: Constructor de Plantillas (Panel de Control - Vue.js)
El administrador dispondrá de una interfaz visual avanzada basada en **Drag & Drop (Arrastrar y Soltar)** estructurada jerárquicamente:

1.  **Secciones:** Bloques contenedores principales. Permitirán agrupar campos en pestañas (Tabs) o bloques colapsables (Acordeones) para evitar formularios excesivamente largos.
2.  **Filas (Layout Grid):** Estructuras horizontales que se arrastran dentro de las secciones. Permitirán configurar el número de columnas (ej: dividir en 1, 2, 3 o 4 columnas) para poder posicionar **varios campos en la misma línea** (ej: *Peso* y *Talla* alineados horizontalmente).
3.  **Campos (Componentes):** Elementos atómicos de formulario arrastrables hacia las columnas de las filas.

#### Configuración de Propiedades por Campo:
* **Básicos:** Etiqueta (Label), Nombre de variable interno (Key), Marcador de posición (Placeholder).
* **Validación:** ¿Es obligatorio? (Required).
* **Variables de Sistema (Autocompletado):** Opción de vincular el campo a una variable del entorno para que aparezca rellena por defecto:
    * `{{paciente.nombre_completo}}`
    * `{{paciente.dni_nie}}`
    * `{{paciente.edad}}`
    * `{{medico.nombre_completo}}`
    * `{{medico.num_colegiado}}`
* **Lógica Condicional:** Reglas de visibilidad dinámicas en base a otros campos.
    * *Sintaxis:* `Mostrar este campo SI [Campo_Origen] [Operador: ==, !=, contiene] [Valor]`.

---

### RF2: Catálogo de Componentes Soportados

| Tipo de Campo | Comportamiento en el Formulario |
| :--- | :--- |
| **Texto Corto** | Campo estándar `input type="text"` para cadenas breves. |
| **Texto Largo** | Área de texto `textarea` para conclusiones, evoluciones y anamnesis. |
| **Fecha / Hora** | Selectores nativos o componentes de calendario con validación de rangos. |
| **Selección Única** | Desplegables (`select`) o botones de radio (`radio buttons`). |
| **Selección Múltiple** | Cajas de selección estructuradas (`checkboxes`). |
| **Tablas Dinámicas** | **Componente Especial:** El administrador define las columnas en la plantilla (ej: *Medicamento \| Dosis \| Frecuencia*). Al rellenar el informe, el médico visualiza una rejilla con un botón **"[+] Añadir Fila"**, permitiéndole insertar N filas de datos de forma interactiva. |
| **Firma Digital** | Elemento `canvas` HTML5 que habilita al profesional médico a plasmar su rúbrica directamente mediante periféricos táctiles, tabletas digitalizadoras o ratón. La firma se digitaliza y se almacena codificada de forma segura. |

---

### RF3: Ciclo de Vida y Estados del Informe

El flujo de edición y bloqueo del informe clínico consta de tres etapas bien diferenciadas y controladas por permisos de usuario ya existentes en la plataforma:

```
[ Creación del Informe ]
           │
           ▼
(Snapshot de la estructura JSON de la plantilla)
           │
           ▼
 ┌────────────────────────────────────────┐
 │            Estado: BORRADOR            │ ◄─── Guardado continuo parcial
 └───────────────────┬────────────────────┘
                     │
                     ▼
 ┌────────────────────────────────────────┐
 │            Estado: FIRMADO             │ ◄─── Obliga a capturar Firma Digital
 └───────────────────┬────────────────────┘
                     │
                     ▼
 ┌────────────────────────────────────────┐
 │            Estado: CERRADO             │ ◄─── Formulario Read-Only / Inmutable
 └────────────────────────────────────────┘
```

1.  **Inicialización:** Al pulsar "Nuevo Informe de Paciente", el sistema genera el *snapshot* de la plantilla, abstrayendo el informe de cualquier cambio administrativo futuro sobre el diseño global.
2.  **Estado: Borrador:**
    * Permite guardar el progreso sin validar la obligatoriedad de los campos.
    * Ejecuta en tiempo real la reactividad de Vue.js para ocultar o mostrar campos según las reglas condicionales definidas.
3.  **Estado: Firmado:**
    * El sistema realiza una validación estricta de datos (campos obligatorios vacíos bloquean la firma).
    * Se requiere de forma mandatoria la cumplimentación del campo **Firma Digital**.
4.  **Estado: Cerrado:**
    * El informe pasa a ser estrictamente de **Solo Lectura (Read-Only)**.
    * Los inputs en el front-end se deshabilitan por completo.
    * El back-end en Laravel rechazará cualquier petición de mutación (`UPDATE`) sobre los valores guardados de este registro para garantizar la seguridad legal del historial clínico.

---

### RF4: Motor de Impresión

* **Generación Cliente:** El frontend renderiza el informe en un iframe oculto utilizando el componente `ReportPdfExport`, reutilizando el `template_structure_snapshot` y los `values` del informe firmado/archivado.
* **Diálogo de Impresión del Navegador:** Al pulsar "Imprimir", el sistema muestra un skeleton de carga mientras prepara el documento y luego invoca `window.print()` sobre el iframe, delegando la gestión de PDF al navegador del usuario.
* **Diseño Fluido y Adaptable:** Se utilizan reglas CSS fluidas (Tailwind + estilos scoped del componente de impresión) para que las secciones y párrafos fluyan orgánicamente. Los campos opcionales vacíos se omiten del documento impreso.
* **Estructura Visual del Informe:**
    * **Cabecera:** Inserción automatizada del logotipo oficial de la clínica, información de contacto de la entidad y un bloque estructurado con los datos demográficos del paciente.
    * **Cuerpo del Documento:** Secciones ordenadas cronológica y visualmente imitando el layout de columnas diseñado.
    * **Pie de Página:** Área de validación con la **imagen de la firma digital** incrustada de forma clara y visible.
