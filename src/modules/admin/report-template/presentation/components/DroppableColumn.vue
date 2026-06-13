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

function syncToStore() {
  const sections = (builder.sections as unknown) as Section[]
  for (const section of sections) {
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
    const { oldIndex, newIndex } = evt.moved
    const list = [...localFields.value]
    list.splice(newIndex, 0, list.splice(oldIndex, 1)[0])
    localFields.value = list
    syncToStore()
  }
  if (evt.added) {
    const { element, newIndex } = evt.added
    if (element && !element.id) {
      // Elemento de la paleta: eliminar fantasma y crear campo real
      localFields.value.splice(newIndex, 1)
      builder.addField(props.column.id, element.type, {
        label: element.label,
      })
    } else if (element && element.id) {
      // Elemento movido desde otra columna
      localFields.value.splice(newIndex, 0, element)
      syncToStore()
    }
  }
}

function onRemove(evt: any) {
  if (evt.element?.id) {
    const idx = localFields.value.findIndex((f) => f.id === evt.element.id)
    if (idx !== -1) {
      localFields.value.splice(idx, 1)
      syncToStore()
    }
  }
}
</script>

<template>
  <div class="border border-[rgba(124,58,237,0.15)] rounded-lg p-2 bg-white min-h-[80px]" data-column-panel>
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs text-[#7c3aed] font-medium">Columna</span>
    </div>

    <draggable
      :list="localFields"
      group="report-fields"
      item-key="id"
      tag="div"
      class="space-y-1 min-h-[40px]"
      @change="onChange"
      @remove="onRemove"
    >
      <template #item="{ element }">
        <DroppableField :field="element" />
      </template>
    </draggable>
  </div>
</template>
