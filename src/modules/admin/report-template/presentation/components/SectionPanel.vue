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
  <div class="border border-[rgba(124,58,237,0.10)] rounded-xl overflow-hidden bg-white shadow-sm" data-section-panel>
    <!-- Section header -->
    <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#faf9ff] to-[#f5f3ff] border-b border-[rgba(124,58,237,0.08)]">
      <div class="flex items-center gap-2.5 flex-1 min-w-0">
        <div class="h-7 w-7 rounded-lg bg-[#ede9fe] flex items-center justify-center shrink-0">
          <i class="pi pi-th-large text-[#7c3aed] text-xs" />
        </div>
        <div class="relative flex-1 min-w-0">
          <input
            :value="section.label"
            class="w-full text-sm font-semibold text-[#0b0817] bg-white/60 border border-[rgba(124,58,237,0.12)] rounded-lg px-2.5 py-1.5 placeholder:text-[#b4afc8] hover:border-[rgba(124,58,237,0.25)] focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 focus:outline-none focus:bg-white transition-all duration-150"
            aria-label="Título de sección"
            placeholder="Nombre de la sección"
            @input="updateLabel"
          />
          <i class="pi pi-pencil absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#b4afc8] pointer-events-none" />
        </div>
        <span class="text-[10px] font-medium text-[#9690a8] uppercase tracking-wider bg-[#ede9fe]/60 rounded-md px-2 py-1 shrink-0 select-none">
          {{ section.display === 'tabs' ? 'Tabs' : section.display === 'accordion' ? 'Acordeón' : 'Default' }}
        </span>
        <select
          :value="section.display"
          class="text-xs border border-[rgba(124,58,237,0.15)] rounded-lg px-2.5 py-1.5 text-[#6b6b7b] bg-white hover:border-[#7c3aed] focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 focus:outline-none cursor-pointer transition-colors shrink-0"
          aria-label="Tipo de visualización"
          @change="updateDisplay"
        >
          <option value="default">Default</option>
          <option value="tabs">Tabs</option>
          <option value="accordion">Acordeón</option>
        </select>
      </div>
      <button
        class="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#b4afc8] hover:text-red-500 hover:bg-red-50 transition-all duration-150 ml-2 shrink-0"
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
        class="w-full text-xs text-[#7c3aed] font-semibold mt-3 px-3 py-2.5 rounded-xl border border-dashed border-[rgba(124,58,237,0.15)] hover:border-[#7c3aed] hover:bg-[#f5f3ff] hover:-translate-y-0.5 transition-all duration-200 group"
        data-add-row
        @click="builder.addRow(section.id)"
      >
        <span class="inline-flex items-center gap-1.5">
          <i class="pi pi-plus text-[10px] transition-transform duration-200 group-hover:scale-110" />
          Añadir fila
        </span>
      </button>
    </div>
  </div>
</template>
