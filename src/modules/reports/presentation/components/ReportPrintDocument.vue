<template>
  <div class="print-document">
    <!-- Dynamic Header -->
    <div v-if="hasHeader" class="print-header">
      <div
        v-for="section in headerSections"
        :key="section.id"
        class="print-section"
      >
        <template v-for="row in section.rows" :key="row.id">
          <div class="print-row">
            <div
              v-for="col in row.columns"
              :key="col.id"
              class="print-col"
              :style="getColumnStyle(col, row.columns)"
            >
              <template v-for="field in col.fields" :key="field.id">
                <div
                  v-if="field.type === 'fixed_text'"
                  class="print-fixed-text"
                  v-html="interpolateContent(field.text_content)"
                />
                <div
                  v-else-if="field.type === 'vertical_separator'"
                  class="print-separator"
                >
                  <div class="print-separator-line" />
                </div>
                <table
                  v-else-if="field.type === 'dynamic_table'"
                  class="print-table"
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
                      >
                        {{ ft.label }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                <div
                  v-else
                  class="print-field"
                >
                  <span class="print-label">{{ field.label }}:</span>
                  <span class="print-value">{{ getFieldDisplayValue(field) }}</span>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Body Sections -->
    <div
      v-if="!sections || sections.length === 0"
      class="print-empty"
    >
      No hay contenido para mostrar
    </div>

    <template v-else>
      <div
        v-for="section in sections"
        :key="section.id"
        class="print-section"
      >
        <h2 class="print-section-title">{{ section.label }}</h2>

        <template v-for="row in section.rows" :key="row.id">
          <div class="print-row">
            <div
              v-for="col in row.columns"
              :key="col.id"
              class="print-col"
              :style="getColumnStyle(col, row.columns)"
            >
              <template v-for="field in col.fields" :key="field.id">
                <!-- fixed_text -->
                <div
                  v-if="field.type === 'fixed_text'"
                  class="print-fixed-text"
                  v-html="interpolateContent(field.text_content)"
                />

                <!-- vertical_separator -->
                <div
                  v-else-if="field.type === 'vertical_separator'"
                  class="print-separator"
                >
                  <div class="print-separator-line" />
                </div>

                <!-- dynamic_table -->
                <table
                  v-else-if="field.type === 'dynamic_table'"
                  class="print-table"
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
                      >
                        {{ ft.label }}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <!-- All other field types -->
                <div v-else class="print-field">
                  <span class="print-label">{{ field.label }}:</span>
                  <span class="print-value">{{ getFieldDisplayValue(field) }}</span>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- Dynamic Footer -->
    <div v-if="hasFooter" class="print-footer">
      <div
        v-for="section in footerSections"
        :key="section.id"
        class="print-section"
      >
        <template v-for="row in section.rows" :key="row.id">
          <div class="print-row">
            <div
              v-for="col in row.columns"
              :key="col.id"
              class="print-col"
              :style="getColumnStyle(col, row.columns)"
            >
              <template v-for="field in col.fields" :key="field.id">
                <div
                  v-if="field.type === 'fixed_text'"
                  class="print-fixed-text"
                  v-html="interpolateContent(field.text_content)"
                />
                <div
                  v-else-if="field.type === 'vertical_separator'"
                  class="print-separator"
                >
                  <div class="print-separator-line" />
                </div>
                <table
                  v-else-if="field.type === 'dynamic_table'"
                  class="print-table"
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
                      >
                        {{ ft.label }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                <div v-else class="print-field">
                  <span class="print-label">{{ field.label }}:</span>
                  <span class="print-value">{{ getFieldDisplayValue(field) }}</span>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Signature image -->
    <div
      v-if="props.signatureUrl && hasFooter"
      class="print-signature-wrapper"
    >
      <img
        class="print-signature"
        :src="props.signatureUrl"
        alt="Firma"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Section, FieldConfig } from '@/shared/types'

interface Props {
  sections: Section[]
  headerSections?: Section[]
  footerSections?: Section[]
  headerEnabled?: boolean
  footerEnabled?: boolean
  values: Record<string, any>
  variableResolver?: (text: string) => string
  signatureUrl?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  headerSections: () => [],
  footerSections: () => [],
  headerEnabled: false,
  footerEnabled: false,
  signatureUrl: null,
})

// ── Computed ──────────────────────────────────────────────────────────────

const hasHeader = computed(() => props.headerEnabled && props.headerSections.length > 0)
const hasFooter = computed(() => props.footerEnabled && props.footerSections.length > 0)

// ── Column width ──────────────────────────────────────────────────────────

function getColumnStyle(col: { width?: number }, allColumns: { width?: number }[]): Record<string, string> {
  if (col.width) {
    return { width: col.width + '%' }
  }
  return { width: (100 / allColumns.length) + '%' }
}

// ── Value helpers ─────────────────────────────────────────────────────────

function getValue(key: string): string {
  const val = props.values[key]
  if (val === undefined || val === null) return ''
  return String(val)
}

function getArrayValue(key: string): Record<string, any>[] {
  const val = props.values[key]
  return Array.isArray(val) ? val : []
}

function formatCellValue(val: unknown, type: string): string {
  if (val === undefined || val === null) return '—'
  if (type === 'date' && typeof val === 'string') {
    return new Date(val).toLocaleDateString('es-ES')
  }
  return String(val)
}

function getFieldDisplayValue(field: FieldConfig): string {
  const key = field.key
  const val = props.values[key]

  if (field.type === 'checkbox' || field.type === 'multi_select') {
    if (Array.isArray(val)) return val.join(', ')
    return val ?? '—'
  }

  if (field.type === 'textarea') {
    return val ?? '—'
  }

  return val !== undefined && val !== null ? String(val) : '—'
}

// ── Variable interpolation ────────────────────────────────────────────────

function interpolateContent(text: string): string {
  let resolved: string

  if (props.variableResolver) {
    resolved = props.variableResolver(text)
  } else {
    resolved = text.replace(/\{([^}]+)\}/g, (_match: string, path: string) => {
      const value = props.values[path.trim()]
      return value !== undefined && value !== null ? String(value) : _match
    })
  }

  // If content contains HTML tags (WYSIWYG output), render as rich text
  if (/<[a-zA-Z][^>]*>/.test(resolved)) {
    return resolved
  }

  // Plain text fallback: escape HTML and convert newlines
  return resolved
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />')
}
</script>

<style>
/* ── Document container ─────────────────────────────────────────────────── */

.print-document {
  width: 210mm;
  margin: 0 auto;
  padding: 20mm;
  background: white;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #1a1a1a;
  line-height: 1.6;
  text-align: left;
}

/* ── Sections ───────────────────────────────────────────────────────────── */

.print-section {
  margin-bottom: 1.5rem;
  page-break-inside: avoid;
}

.print-section-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.25rem;
}

/* ── Rows & Columns ─────────────────────────────────────────────────────── */

.print-row {
  margin-bottom: 1rem;
  page-break-inside: avoid;
}

.print-col {
  display: inline-block;
  vertical-align: top;
  padding-right: 1rem;
  box-sizing: border-box;
}

.print-col:last-child {
  padding-right: 0;
}

/* ── Fields ─────────────────────────────────────────────────────────────── */

.print-field {
  margin-bottom: 0.5rem;
}

.print-label {
  font-weight: 600;
}

.print-value {
  color: #333;
}

/* ── Fixed text ─────────────────────────────────────────────────────────── */

.print-fixed-text {
  margin-bottom: 1rem;
}

.print-fixed-text h1 {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0.5em 0 0.25em;
}

.print-fixed-text h2 {
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0.5em 0 0.25em;
}

.print-fixed-text h3 {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0.5em 0 0.25em;
}

.print-fixed-text strong {
  font-weight: 600;
}

.print-fixed-text em {
  font-style: italic;
}

.print-fixed-text ul,
.print-fixed-text ol {
  padding-left: 1.5rem;
  margin: 0.25em 0;
}

.print-fixed-text li {
  margin: 0.125em 0;
}

/* ── Tables ─────────────────────────────────────────────────────────────── */

.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.print-table th,
.print-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}

.print-table th {
  background: #f5f5f5;
}

/* ── Separator ──────────────────────────────────────────────────────────── */

.print-separator {
  min-height: 60px;
  text-align: center;
  padding: 1rem 0;
}

.print-separator-line {
  display: inline-block;
  width: 1px;
  height: 60px;
  background: #ccc;
}

/* ── Signature ──────────────────────────────────────────────────────────── */

.print-signature-wrapper {
  margin-top: 1.5rem;
  text-align: right;
}

.print-signature {
  max-height: 80px;
  max-width: 200px;
}

/* ── Header / Footer zones ──────────────────────────────────────────────── */

.print-header {
  margin-bottom: 1rem;
}

.print-footer {
  margin-top: 1rem;
}

/* ── Empty state ────────────────────────────────────────────────────────── */

.print-empty {
  padding: 3rem 0;
  text-align: center;
  color: #999;
}
</style>
