<template>
  <div class="report-document">
    <!-- Dynamic Header -->
    <div v-if="hasHeader" class="report-document__zone report-document__zone--header">
      <div
        v-for="section in headerSections"
        :key="section.id"
        class="report-document__section"
      >
        <template
          v-for="row in section.rows"
          :key="row.id"
        >
          <div
            class="report-document__row"
            :style="rowStyle(row)"
          >
            <div
              v-for="col in row.columns"
              :key="col.id"
              class="report-document__col"
            >
              <template
                v-for="field in col.fields"
                :key="field.id"
              >
                <div
                  v-if="field.type === 'fixed_text'"
                  class="report-document__fixed-text"
                  v-html="interpolateContent(field.text_content)"
                />
                <div v-else class="report-document__preview-field">
                  <span class="report-document__preview-label">{{ field.label }}:</span>
                  <span class="report-document__preview-value">{{ getPreviewValue(field) }}</span>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="report-document__body">
      <div
        v-if="!sections || sections.length === 0"
        class="report-document__empty"
      >
        No hay contenido para mostrar
      </div>

      <template v-else>
      <div
        v-for="section in sections"
        :key="section.id"
        class="report-document__section"
      >
        <h2 class="report-document__section-title">{{ section.label }}</h2>

        <template
          v-for="row in section.rows"
          :key="row.id"
        >
          <div
            class="report-document__row"
            :style="rowStyle(row)"
          >
            <div
              v-for="col in row.columns"
              :key="col.id"
              class="report-document__col"
            >
              <template
                v-for="field in col.fields"
                :key="field.id"
              >
                <!-- fixed_text -->
                <div
                  v-if="field.type === 'fixed_text'"
                  class="report-document__fixed-text"
                  v-html="interpolateContent(field.text_content)"
                />

                <!-- dynamic_table -->
                <table
                  v-else-if="field.type === 'dynamic_table'"
                  class="report-document__table"
                >
                  <thead>
                    <tr>
                      <th
                        v-for="colDef in field.columns"
                        :key="colDef.key"
                      >
                        {{ colDef.label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(dataRow, drIdx) in getArrayValue(field.key)"
                      :key="drIdx"
                    >
                      <td
                        v-for="colDef in field.columns"
                        :key="colDef.key"
                      >
                        {{ formatCellValue(dataRow[colDef.key], colDef.type) }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot v-if="field.footer_totals && field.footer_totals.length">
                    <tr>
                      <td
                        v-for="(ft, ftIdx) in field.footer_totals"
                        :key="ftIdx"
                        :colspan="ftIdx === 0 ? field.columns.length - field.footer_totals.length + 1 : undefined"
                      >
                        <span class="font-semibold">{{ ft.label }}</span>
                      </td>
                      <td
                        v-for="_ in Math.max(0, field.columns.length - field.footer_totals.length - 1)"
                        :key="'empty-'+_"
                      />
                    </tr>
                  </tfoot>
                </table>

                <!-- All other field types -->
                <div v-else class="report-document__field">
                  <span class="report-document__field-label">{{ field.label }}:</span>
                  <span class="report-document__field-value">
                    <template v-if="field.type === 'checkbox' || field.type === 'multi_select'">
                      {{ formatMultiValue(field.key) }}
                    </template>
                    <template v-else-if="field.type === 'textarea'">
                      <div class="whitespace-pre-wrap">{{ getValue(field.key) || '—' }}</div>
                    </template>
                    <template v-else>
                      {{ getValue(field.key) || '—' }}
                    </template>
                  </span>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>
    </div>

    <!-- Dynamic Footer -->
    <div v-if="hasFooter" class="report-document__zone report-document__zone--footer">
      <div
        v-for="section in footerSections"
        :key="section.id"
        class="report-document__section"
      >
        <template
          v-for="row in section.rows"
          :key="row.id"
        >
          <div
            class="report-document__row"
            :style="rowStyle(row)"
          >
            <div
              v-for="col in row.columns"
              :key="col.id"
              class="report-document__col"
            >
              <template
                v-for="field in col.fields"
                :key="field.id"
              >
                <div
                  v-if="field.type === 'fixed_text'"
                  class="report-document__fixed-text"
                  v-html="interpolateContent(field.text_content)"
                />
                <div v-else class="report-document__preview-field">
                  <span class="report-document__preview-label">{{ field.label }}:</span>
                  <span class="report-document__preview-value">{{ getPreviewValue(field) }}</span>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Section } from '@/shared/types'

interface Props {
  sections: Section[]
  headerSections?: Section[]
  footerSections?: Section[]
  headerEnabled?: boolean
  footerEnabled?: boolean
  values: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  headerSections: () => [],
  footerSections: () => [],
  headerEnabled: false,
  footerEnabled: false,
})

const today = new Date().toLocaleDateString('es-ES', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const hasHeader = computed(() => props.headerEnabled && props.headerSections.length > 0)
const hasFooter = computed(() => props.footerEnabled && props.footerSections.length > 0)

function getValue(key: string): string {
  const val = props.values[key]
  if (val === undefined || val === null) return ''
  return String(val)
}

function getArrayValue(key: string): Record<string, any>[] {
  const val = props.values[key]
  return Array.isArray(val) ? val : []
}

function formatMultiValue(key: string): string {
  const val = props.values[key]
  if (Array.isArray(val)) return val.join(', ')
  return val ?? '—'
}

function formatCellValue(val: unknown, type: string): string {
  if (val === undefined || val === null) return '—'
  if (type === 'date' && typeof val === 'string') {
    return new Date(val).toLocaleDateString('es-ES')
  }
  return String(val)
}

function interpolateContent(text: string): string {
  // First substitute variables
  const resolved = text.replace(/\{([^}]+)\}/g, (_match, path: string) => {
    const value = previewResolve(path.trim())
    return value ?? `{${path}}`
  })

  // If content contains HTML tags (WYSIWYG output), render as rich text
  if (/<[a-zA-Z][^>]*>/.test(resolved)) {
    return resolved
  }

  // Plain text fallback (backward compat)
  return resolved
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />')
}

function getPreviewValue(field: any): string {
  if (field.type === 'fixed_text') return ''
  if (field.default_value !== undefined) return String(field.default_value)
  return `[${field.label}]`
}

const previewVars: Record<string, string> = {
  'paciente.nombre': 'Juan Pérez García',
  'paciente.edad': '42',
  'paciente.genero': 'Masculino',
  'paciente.identificacion': '8-888-888',
  'clinica.nombre': 'Clínica Materia Gris',
  'clinica.direccion': 'Av. Central 123, Panamá',
  'fecha.hoy': new Date().toLocaleDateString('es-ES'),
  'fecha.actual': new Date().toLocaleDateString('es-ES'),
  'usuario.nombre': 'Dr. Carlos Rodríguez',
  'usuario.especialidad': 'Psicología Clínica',
}

function previewResolve(fullKey: string): string | undefined {
  return previewVars[fullKey]
}

function rowStyle(row: { columns: any[] }): Record<string, string> {
  const count = row.columns.length || 1
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${count}, 1fr)`,
    gap: '1.5rem',
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.report-document {
  @apply bg-white mx-auto flex flex-col;
  width: 210mm;
  padding: 20mm 20mm 25mm 20mm;
  min-height: 270mm;
  max-height: calc(100vh - 260px);
  overflow-y: auto;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: #1a1a1a;
  line-height: 1.6;
}

.report-document__body {
  @apply flex-1;
}

.report-document__header {
  @apply mb-6;
}

.report-document__title {
  @apply text-2xl font-bold mb-2;
  color: #1a1a1a;
}

.report-document__meta {
  @apply flex gap-6 text-sm;
  color: #555;
}

.report-document__divider {
  @apply mb-6;
  border: none;
  border-top: 2px solid #1a1a1a;
}

.report-document__empty {
  @apply py-12 text-center;
  color: #999;
}

.report-document__section {
  @apply mb-8;
}

.report-document__section-title {
  @apply text-lg font-bold mb-4 pb-1.5;
  color: #1a1a1a;
}

.report-document__row {
  gap: 1.5rem;
  page-break-inside: avoid;
}

@media (max-width: 768px) {
  .report-document__row {
    grid-template-columns: 1fr !important;
  }
}

.report-document__col {
  @apply min-w-0;
}

.report-document__field {
  @apply mb-2.5;
}

.report-document__field-label {
  @apply font-semibold mr-1;
}

.report-document__field-value {
  color: #333;
}

.report-document__fixed-text {
  @apply mb-4;
  line-height: 1.7;
}

.report-document__table {
  @apply w-full mb-4 border-collapse;
}

.report-document__table th,
.report-document__table td {
  @apply border border-gray-300 px-3 py-2 text-sm text-left;
}

.report-document__table th {
  @apply bg-gray-100 font-semibold;
  color: #1a1a1a;
}

.report-document__table tfoot td {
  @apply bg-gray-50;
}

.report-document__preview-field {
  @apply mb-2;
}

.report-document__preview-label {
  @apply font-semibold text-sm mr-1;
}

.report-document__preview-value {
  @apply text-sm italic;
  color: #666;
}

.report-document__zone--header {
  @apply mb-2;
}

.report-document__zone--footer {
  @apply mt-4;
}

</style>
