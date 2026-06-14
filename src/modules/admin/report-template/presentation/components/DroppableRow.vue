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
    const allSections = [...builder.sections, ...builder.headerSections, ...builder.footerSections]
    const section = allSections.find((s: Section) =>
      s.rows.some((r: Row) => r.id === props.row.id)
    )
    if (section) {
      const row = section.rows.find((r: Row) => r.id === props.row.id)
      if (row) row.columns = val
    }
  },
})

const gridStyle = computed(() => {
  const count = props.row.columns.length || 1
  return { gridTemplateColumns: `repeat(${count}, 1fr)` }
})
</script>

<template>
  <div class="group relative">
    <draggable
      v-model="localColumns"
      group="report-columns"
      item-key="id"
      tag="div"
      :style="gridStyle"
      class="grid gap-3 min-h-[60px]"
    >
      <template #item="{ element }">
        <DroppableColumn :column="element" />
      </template>
    </draggable>

    <div class="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      <button
        class="text-xs text-[#7c3aed] hover:text-[#6d28d9] font-medium px-2 py-1 rounded hover:bg-[#f5f3ff] transition-colors"
        data-add-column
        @click="builder.addColumn(row.id)"
      >
        <i class="pi pi-plus mr-1" />
        Añadir columna
      </button>
      <button
        class="inline-flex items-center justify-center h-6 w-6 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
        title="Eliminar fila"
        data-remove-row
        @click="builder.removeRow(row.id)"
      >
        <i class="pi pi-trash text-xs" />
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>
