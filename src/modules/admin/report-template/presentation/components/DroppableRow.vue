<script setup lang="ts">
import { inject, computed } from 'vue'
import draggable from 'vuedraggable'
import { BUILDER_KEY } from '../composables/useTemplateBuilder'
import type { Row, Section } from '@/shared/types'
import type { UseTemplateBuilderReturn } from '../composables/useTemplateBuilder'
import DroppableColumn from './DroppableColumn.vue'

const props = defineProps<{ row: Row }>()
const builder = inject(BUILDER_KEY) as UseTemplateBuilderReturn

const localColumns = computed({
  get: () => props.row.columns,
  set: (val) => {
    const section = builder.sections.find((s: Section) =>
      s.rows.some((r: Row) => r.id === props.row.id)
    )
    if (section) {
      const row = section.rows.find((r: Row) => r.id === props.row.id)
      if (row) row.columns = val
    }
  },
})
</script>

<template>
  <div class="border border-dashed border-slate-300 rounded-md p-2 bg-slate-50" data-row-panel>
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs text-slate-400">Fila</span>
      <button
        class="text-red-400 hover:text-red-600 text-xs p-1"
        title="Eliminar fila"
        data-remove-row
        @click="builder.removeRow(row.id)"
      >
        <i class="pi pi-trash" />
      </button>
    </div>

    <draggable
      v-model="localColumns"
      group="report-columns"
      item-key="id"
      tag="div"
      class="flex gap-2 min-h-[60px]"
    >
      <template #item="{ element }">
        <DroppableColumn :column="element" class="flex-1" />
      </template>
    </draggable>

    <button
      class="text-xs text-indigo-500 hover:text-indigo-700 mt-1"
      data-add-column
      @click="builder.addColumn(row.id)"
    >
      + Añadir columna
    </button>
  </div>
</template>
