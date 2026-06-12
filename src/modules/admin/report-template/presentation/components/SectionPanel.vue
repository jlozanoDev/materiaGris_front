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
  <div class="border border-slate-200 rounded-lg bg-white p-3 mb-3" data-section-panel>
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <i class="pi pi-th-large text-slate-400 text-sm" />
        <input
          :value="section.label"
          class="font-semibold text-sm border-0 bg-transparent focus:ring-0 p-0"
          aria-label="Título de sección"
          @input="updateLabel"
        />
        <select
          :value="section.display"
          class="text-xs border border-slate-200 rounded px-1 py-0.5"
          aria-label="Tipo de visualización"
          @change="updateDisplay"
        >
          <option value="default">Default</option>
          <option value="tabs">Tabs</option>
          <option value="accordion">Acordeón</option>
        </select>
      </div>
      <button
        class="text-red-400 hover:text-red-600 text-xs p-1"
        title="Eliminar sección"
        data-remove-section
        @click="builder.removeSection(section.id)"
      >
        <i class="pi pi-trash" />
      </button>
    </div>

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
      class="text-xs text-indigo-500 hover:text-indigo-700 mt-2"
      data-add-row
      @click="builder.addRow(section.id)"
    >
      + Añadir fila
    </button>
  </div>
</template>
