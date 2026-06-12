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
  <div class="border border-dashed border-[rgba(124,58,237,0.20)] rounded-lg p-2.5 bg-[#faf9ff]" data-row-panel>
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-[#9690a8] font-medium">Fila</span>
      <button
        class="inline-flex items-center justify-center h-6 w-6 rounded-md text-[#9690a8] hover:text-red-500 hover:bg-red-50 transition-all duration-150"
        title="Eliminar fila"
        data-remove-row
        @click="builder.removeRow(row.id)"
      >
        <i class="pi pi-trash text-xs" />
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
      class="text-xs text-[#7c3aed] hover:text-[#6d28d9] font-medium mt-2 px-2 py-1 rounded hover:bg-[#f5f3ff] transition-colors"
      data-add-column
      @click="builder.addColumn(row.id)"
    >
      <i class="pi pi-plus mr-1" />
      Añadir columna
    </button>
  </div>
</template>
