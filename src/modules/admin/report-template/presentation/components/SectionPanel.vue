<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { inject, computed } from 'vue'
import draggable from 'vuedraggable'
import { BUILDER_KEY } from '../composables/useTemplateBuilder'
import type { UseTemplateBuilderReturn } from '../composables/useTemplateBuilder'
import type { Section } from '@/shared/types'
import DroppableRow from './DroppableRow.vue'

const props = defineProps<{ section: Section }>()
const builder = inject(BUILDER_KEY) as UseTemplateBuilderReturn

const localRows = computed({
  get: () => props.section.rows,
  set: (val) => {
    const section = builder.sections.find((s: Section) => s.id === props.section.id)
    if (section) section.rows = val
  },
})

function updateLabel(e: Event) {
  props.section.label = (e.target as HTMLInputElement).value
  builder.isDirty = true
}
</script>

<template>
  <div class="rounded-lg border border-[rgba(124,58,237,0.10)] overflow-hidden" data-section-panel>
    <!-- Section header -->
    <div class="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <input
          :value="section.label"
          class="form-input text-sm font-semibold"
          aria-label="Título de sección"
          placeholder="Nombre de la sección"
          @input="updateLabel"
        />
      </div>
      <button
        class="inline-flex items-center justify-center h-7 w-7 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 ml-2 shrink-0"
        title="Eliminar sección"
        data-remove-section
        @click="builder.removeSection(section.id)"
      >
        <i class="pi pi-trash text-xs" />
      </button>
    </div>

    <!-- Section body -->
    <div class="p-3">
      <draggable
        v-model="localRows"
        group="report-rows"
        item-key="id"
        tag="div"
        class="space-y-2"
      >
        <template #item="{ element }">
          <DroppableRow :row="element" />
        </template>
      </draggable>

      <button
        class="w-full text-xs text-[#7c3aed] font-medium mt-2 px-3 py-2 rounded-lg border border-dashed border-[rgba(124,58,237,0.15)] hover:border-[#7c3aed] hover:bg-[#f5f3ff] transition-colors"
        data-add-row
        @click="builder.addRow(section.id)"
      >
        <i class="pi pi-plus mr-1 text-[10px]" />
        Añadir fila
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>
