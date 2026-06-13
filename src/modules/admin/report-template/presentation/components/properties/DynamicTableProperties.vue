<script setup lang="ts">
import type { DynamicTableField, TableColumnDef } from '@/shared/types'

interface Props {
  field: DynamicTableField
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [value: Partial<DynamicTableField>]
}>()

const COLUMN_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Fecha' },
  { value: 'select', label: 'Selección' },
] as const

function emitUpdate(value: Partial<DynamicTableField>) {
  emit('update', value)
}

function addColumn() {
  const current = [...(props.field.columns ?? [])]
  current.push({
    key: `col_${current.length + 1}`,
    label: `Columna ${current.length + 1}`,
    type: 'text',
    required: false,
  })
  emitUpdate({ columns: current })
}

function removeColumn(index: number) {
  const current = [...(props.field.columns ?? [])]
  current.splice(index, 1)
  emitUpdate({ columns: current })
}

function updateColumn(index: number, partial: Partial<TableColumnDef>) {
  const current = [...(props.field.columns ?? [])]
  current[index] = { ...current[index], ...partial }
  emitUpdate({ columns: current })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Column definitions -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed]">Columnas</label>
        <button
          class="text-xs text-[#7c3aed] hover:text-[#6d28d9] font-medium px-2 py-1 rounded hover:bg-[#f5f3ff] transition-colors"
          @click="addColumn"
        >
          <i class="pi pi-plus mr-1" />
          Añadir
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="(col, idx) in props.field.columns ?? []"
          :key="idx"
          class="border border-[rgba(124,58,237,0.10)] rounded-lg p-2 space-y-2"
        >
          <div class="flex gap-2 items-center">
            <input
              :value="col.label"
              class="form-input text-xs flex-1"
              placeholder="Etiqueta"
              @input="updateColumn(idx, { label: ($event.target as HTMLInputElement).value })"
            />
            <button
              class="inline-flex items-center justify-center h-7 w-7 rounded-md text-[#9690a8] hover:text-red-500 hover:bg-red-50 transition-all duration-150 shrink-0"
              @click="removeColumn(idx)"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>

          <div class="flex gap-2 items-center">
            <div class="flex-1">
              <label class="text-[10px] text-[#9690a8]">Clave (key)</label>
              <input
                :value="col.key"
                class="form-input text-xs w-full font-mono"
                placeholder="clave_columna"
                @input="updateColumn(idx, { key: ($event.target as HTMLInputElement).value })"
              />
            </div>
            <div class="flex-1">
              <label class="text-[10px] text-[#9690a8]">Tipo</label>
              <select
                :value="col.type"
                class="form-input text-xs w-full"
                @change="updateColumn(idx, { type: ($event.target as HTMLSelectElement).value as 'text' | 'number' | 'date' | 'select' })"
              >
                <option
                  v-for="ct in COLUMN_TYPES"
                  :key="ct.value"
                  :value="ct.value"
                >
                  {{ ct.label }}
                </option>
              </select>
            </div>
          </div>

          <label class="flex items-center gap-2 text-xs text-[#6b6b7b] cursor-pointer">
            <input
              type="checkbox"
              :checked="col.required"
              class="h-3.5 w-3.5 rounded border-[rgba(124,58,237,0.25)] accent-[#7c3aed]"
              @change="updateColumn(idx, { required: ($event.target as HTMLInputElement).checked })"
            />
            Requerido
          </label>
        </div>

        <div v-if="(!props.field.columns || props.field.columns.length === 0)" class="text-xs text-[#9690a8] italic">
          Sin columnas definidas. Añada al menos una columna.
        </div>
      </div>
    </div>
  </div>
</template>
