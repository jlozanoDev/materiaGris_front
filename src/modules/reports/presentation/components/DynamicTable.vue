<template>
  <div class="dynamic-table">
    <div v-if="columns.length === 0" class="dynamic-table__empty">
      Sin columnas definidas
    </div>

    <table v-else class="dynamic-table__table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="dynamic-table__th"
          >
            {{ col.label }}
            <span v-if="isCalculated(col)" class="text-[10px] text-indigo-500 ml-1">(calc)</span>
          </th>
          <th v-if="!disabled" class="dynamic-table__th dynamic-table__th--action">
            &nbsp;
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIdx) in rows" :key="rowIdx">
          <td v-for="col in columns" :key="col.key" class="dynamic-table__td">
            <!-- Calculated column — read-only display -->
            <div
              v-if="isCalculated(col)"
              class="dynamic-table__cell-calculated"
            >
              {{ getCellDisplay(col, rowIdx) }}
            </div>

            <!-- Editable columns -->
            <input
              v-else-if="col.type === 'text' || col.type === 'number'"
              :type="col.type"
              :value="row[col.key] ?? ''"
              :disabled="isCellReadOnly(col)"
              class="dynamic-table__cell-input"
              @input="updateCell(rowIdx, col.key, ($event.target as HTMLInputElement).value)"
            />
            <input
              v-else-if="col.type === 'date'"
              type="date"
              :value="row[col.key] ?? ''"
              :disabled="isCellReadOnly(col)"
              class="dynamic-table__cell-input"
              @input="updateCell(rowIdx, col.key, ($event.target as HTMLInputElement).value)"
            />
            <CustomSelect
              v-else-if="col.type === 'select'"
              :model-value="row[col.key] ?? ''"
              :options="[]"
              placeholder="Seleccione..."
              :disabled="isCellReadOnly(col)"
              @update:model-value="updateCell(rowIdx, col.key, $event)"
            />
            <textarea
              v-else-if="col.type === 'textarea'"
              :value="row[col.key] ?? ''"
              :disabled="isCellReadOnly(col)"
              class="dynamic-table__cell-input"
              rows="1"
              @input="updateCell(rowIdx, col.key, ($event.target as HTMLTextAreaElement).value)"
            ></textarea>
            <input
              v-else
              type="text"
              :value="row[col.key] ?? ''"
              :disabled="isCellReadOnly(col)"
              class="dynamic-table__cell-input"
              @input="updateCell(rowIdx, col.key, ($event.target as HTMLInputElement).value)"
            />
          </td>
          <td v-if="!disabled" class="dynamic-table__td dynamic-table__td--action">
            <button
              type="button"
              class="dynamic-table__delete-btn"
              :aria-label="'Eliminar fila ' + (rowIdx + 1)"
              title="Eliminar fila"
              @click="removeRow(rowIdx)"
            >
              &times;
            </button>
          </td>
        </tr>
      </tbody>
      <!-- Footer totals -->
      <tfoot v-if="footerTotals.length > 0">
        <tr v-for="(footer, ftIdx) in footerTotals" :key="ftIdx" class="dynamic-table__footer-row">
          <td
            v-for="(col, colIdx) in columns"
            :key="col.key"
            class="dynamic-table__footer-cell"
          >
            <span v-if="colIdx === 0" class="dynamic-table__footer-label">{{ footer.label }}</span>
            <span v-else-if="col.key === ('sourceKey' in footer.formula ? footer.formula.sourceKey : undefined) || ('expression' in footer.formula)" class="dynamic-table__footer-value">
              {{ getFooterValue(footer) }}
            </span>
          </td>
          <td v-if="!disabled" class="dynamic-table__td" />
        </tr>
      </tfoot>
    </table>

    <button
      v-if="!disabled"
      type="button"
      class="dynamic-table__add-btn"
      @click="addRow"
    >
      + Añadir fila
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumnDef, FooterTotal, CalculatedColumnDef } from '@/shared/types'
import { evaluateFormula } from '@/shared/utils/evaluateExpression'
import CustomSelect from '@/shared/components/CustomSelect.vue'

interface Props {
  columns: TableColumnDef[]
  footerTotals?: FooterTotal[]
  modelValue: Record<string, any>[]
  disabled: boolean
}

const props = withDefaults(defineProps<Props>(), {
  footerTotals: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>[]]
}>()

const rows = computed(() => props.modelValue)

/** Check if a column is a calculated column */
function isCalculated(col: TableColumnDef): col is CalculatedColumnDef {
  return 'calculated' in col && col.calculated === true
}

/** Check if a cell should be read-only (calculated columns) */
function isCellReadOnly(col: TableColumnDef): boolean {
  return isCalculated(col) || props.disabled
}

function createEmptyRow(): Record<string, any> {
  const row: Record<string, any> = {}
  for (const col of props.columns) {
    row[col.key] = isCalculated(col) ? 0 : ''
  }
  return row
}

function addRow(): void {
  if (props.disabled) return
  const newRows = [...props.modelValue, createEmptyRow()]
  emit('update:modelValue', newRows)
}

function removeRow(idx: number): void {
  if (props.disabled) return
  const newRows = props.modelValue.filter((_, i) => i !== idx)
  emit('update:modelValue', newRows)
}

function updateCell(rowIdx: number, colKey: string, value: any): void {
  const newRows = props.modelValue.map((row, i) => {
    if (i === rowIdx) {
      return { ...row, [colKey]: value }
    }
    return row
  })
  emit('update:modelValue', newRows)
}

/** Get calculated value for a cell */
function getCellDisplay(col: TableColumnDef, rowIdx: number): string | number {
  if (!isCalculated(col)) {
    return rows.value[rowIdx]?.[col.key] ?? ''
  }
  return evaluateFormula(col.formula, rows.value.slice(0, rowIdx + 1))
}

/** Compute footer total for a footer definition */
function getFooterValue(footer: FooterTotal): number {
  return evaluateFormula(footer.formula, rows.value)
}
</script>

<style scoped>
@reference "tailwindcss";
.dynamic-table {
  @apply overflow-x-auto;
}
.dynamic-table__table {
  @apply w-full border-collapse text-sm;
}
.dynamic-table__th {
  @apply border border-gray-300 bg-gray-50 px-3 py-2 text-left font-medium text-gray-700;
}
.dynamic-table__th--action {
  @apply w-10;
}
.dynamic-table__td {
  @apply border border-gray-300 px-1 py-1;
}
.dynamic-table__td--action {
  @apply text-center;
}
.dynamic-table__cell-input {
  @apply w-full border-0 bg-transparent px-2 py-1 text-sm
    focus:outline-none focus:ring-1 focus:ring-indigo-500
    disabled:cursor-not-allowed disabled:text-gray-400;
}
.dynamic-table__add-btn {
  @apply mt-2 inline-flex items-center gap-1 rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700
    hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500;
}
.dynamic-table__delete-btn {
  @apply inline-flex h-6 w-6 items-center justify-center rounded text-gray-500
    hover:bg-red-100 hover:text-red-600 focus:outline-none;
  font-size: 1.2rem;
  line-height: 1;
}
.dynamic-table__empty {
  @apply text-sm text-gray-500 italic;
}
</style>
