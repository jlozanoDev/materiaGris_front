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

function updateDisplay(e: Event) {
  props.section.display = (e.target as HTMLSelectElement).value as 'tabs' | 'accordion' | 'default'
  builder.isDirty = true
}
</script>

<template>
  <div class="border border-[rgba(124,58,237,0.10)] rounded-lg overflow-hidden bg-white" data-section-panel>
    <!-- Section header -->
    <div class="flex items-center justify-between px-3 py-2.5 bg-[#faf9ff] border-b border-[rgba(124,58,237,0.06)]">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <i class="pi pi-th-large text-[#7c3aed] text-xs" />
        <input
          :value="section.label"
          class="text-sm font-semibold text-[#0b0817] border-0 bg-transparent focus:ring-0 p-0 flex-1 min-w-0"
          aria-label="Título de sección"
          @input="updateLabel"
        />
        <select
          :value="section.display"
          class="text-xs border border-[rgba(124,58,237,0.10)] rounded-md px-2 py-1 text-[#6b6b7b] focus:border-[#7c3aed] focus:ring-[#7c3aed]"
          aria-label="Tipo de visualización"
          @change="updateDisplay"
        >
          <option value="default">Default</option>
          <option value="tabs">Tabs</option>
          <option value="accordion">Acordeón</option>
        </select>
      </div>
      <button
        class="inline-flex items-center justify-center h-7 w-7 rounded-md text-[#9690a8] hover:text-red-500 hover:bg-red-50 transition-all duration-150"
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
        class="min-h-[40px] space-y-2"
      >
        <template #item="{ element }">
          <DroppableRow :row="element" />
        </template>
      </draggable>

      <button
        class="text-xs text-[#7c3aed] hover:text-[#6d28d9] font-medium mt-2 px-2 py-1 rounded hover:bg-[#f5f3ff] transition-colors"
        data-add-row
        @click="builder.addRow(section.id)"
      >
        <i class="pi pi-plus mr-1" />
        Añadir fila
      </button>
    </div>
  </div>
</template>
