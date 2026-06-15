<script setup lang="ts">
import { ref, watch, inject } from 'vue'
import draggable from 'vuedraggable'
import { BUILDER_KEY } from '../composables/useTemplateBuilder'
import type { UseTemplateBuilderReturn } from '../composables/useTemplateBuilder'
import type { Column, FieldConfig, Section } from '@/shared/types'
import DroppableField from './DroppableField.vue'

const props = defineProps<{ column: Column }>()
const builder = inject(BUILDER_KEY) as UseTemplateBuilderReturn

const localFields = ref<FieldConfig[]>([])

watch(() => props.column.fields, (val) => {
  localFields.value = [...val]
}, { immediate: true, deep: true })

function findRowInfo(): { rowId: string; colIndex: number } | null {
  const allSections = [...(builder.sections as unknown as Section[]), ...(builder.headerSections as unknown as Section[]), ...(builder.footerSections as unknown as Section[])]
  for (const section of allSections) {
    for (const row of section.rows) {
      const colIndex = row.columns.findIndex((c: Column) => c.id === props.column.id)
      if (colIndex !== -1) return { rowId: row.id, colIndex }
    }
  }
  return null
}

const findRowId = (): string | null => findRowInfo()?.rowId ?? null

function syncToStore() {
  const allSections = [...(builder.sections as unknown as Section[]), ...(builder.headerSections as unknown as Section[]), ...(builder.footerSections as unknown as Section[])]
  for (const section of allSections) {
    for (const row of section.rows) {
      const col = row.columns.find((c: Column) => c.id === props.column.id)
      if (col) {
        col.fields = [...localFields.value]
        return
      }
    }
  }
}

function onChange(evt: any) {
  if (evt.moved) {
    syncToStore()
  }
  if (evt.added) {
    const { element, newIndex } = evt.added
    if (element && !element.id) {
      localFields.value.splice(newIndex, 1)
      if (element.type === 'vertical_separator') {
        const info = findRowInfo()
        if (info) builder.addSeparatorColumn(info.rowId, info.colIndex + 1)
      } else {
        builder.addField(props.column.id, element.type, {
          label: element.label,
        }, newIndex)
      }
    } else if (element && element.id) {
      syncToStore()
    }
  }
}

function onRemove(evt: any) {
  if (evt.element?.id) {
    syncToStore()
  }
}
</script>

<template>
  <div class="group relative rounded-lg border border-slate-200 bg-slate-50/30 p-2 min-h-[80px]" data-column-panel>
    <draggable
      :list="localFields"
      group="report-fields"
      item-key="id"
      tag="div"
      class="space-y-2 min-h-[40px]"
      @change="onChange"
      @remove="onRemove"
    >
      <template #item="{ element }">
        <DroppableField :field="element" />
      </template>
    </draggable>

    <button
      class="absolute -top-2 -right-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white border border-slate-300 text-slate-500 shadow-sm opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-all duration-150 cursor-pointer"
      title="Eliminar columna"
      data-remove-column
      @click="() => { const rowId = findRowId(); if (rowId) builder.removeColumn(rowId, column.id) }"
    >
      <i class="pi pi-times" style="font-size: 10px; line-height: 1;" />
    </button>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>
