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
            :key="col.name"
            class="dynamic-table__th"
          >
            {{ col.name }}
          </th>
          <th v-if="!disabled" class="dynamic-table__th dynamic-table__th--action">
            &nbsp;
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIdx) in rows" :key="rowIdx">
          <td v-for="col in columns" :key="col.name" class="dynamic-table__td">
            <input
              v-if="col.type === 'text' || col.type === 'number'"
              :type="col.type"
              :value="row[col.name] ?? ''"
              :disabled="disabled"
              class="dynamic-table__cell-input"
              @input="updateCell(rowIdx, col.name, ($event.target as HTMLInputElement).value)"
            />
            <input
              v-else-if="col.type === 'date'"
              type="date"
              :value="row[col.name] ?? ''"
              :disabled="disabled"
              class="dynamic-table__cell-input"
              @input="updateCell(rowIdx, col.name, ($event.target as HTMLInputElement).value)"
            />
            <CustomSelect
              v-else-if="col.type === 'select'"
              :model-value="row[col.name] ?? ''"
              :options="[]"
              placeholder="Seleccione..."
              :disabled="disabled"
              @update:model-value="updateCell(rowIdx, col.name, $event)"
            />
            <textarea
              v-else-if="col.type === 'textarea'"
              :value="row[col.name] ?? ''"
              :disabled="disabled"
              class="dynamic-table__cell-input"
              rows="1"
              @input="updateCell(rowIdx, col.name, ($event.target as HTMLTextAreaElement).value)"
            ></textarea>
            <input
              v-else
              type="text"
              :value="row[col.name] ?? ''"
              :disabled="disabled"
              class="dynamic-table__cell-input"
              @input="updateCell(rowIdx, col.name, ($event.target as HTMLInputElement).value)"
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
import type { FieldType } from '@/shared/types'
import CustomSelect from '@/shared/components/CustomSelect.vue'

export interface DynamicTableColumn {
  name: string
  type: FieldType
}

interface Props {
  columns: DynamicTableColumn[]
  modelValue: Record<string, any>[]
  disabled: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>[]]
}>()

const rows = computed(() => props.modelValue)

function createEmptyRow(): Record<string, any> {
  const row: Record<string, any> = {}
  for (const col of props.columns) {
    row[col.name] = ''
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

function updateCell(rowIdx: number, colName: string, value: any): void {
  const newRows = props.modelValue.map((row, i) => {
    if (i === rowIdx) {
      return { ...row, [colName]: value }
    }
    return row
  })
  emit('update:modelValue', newRows)
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
