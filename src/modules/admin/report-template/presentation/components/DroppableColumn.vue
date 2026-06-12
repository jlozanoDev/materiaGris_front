<script setup lang="ts">
import { computed, inject } from 'vue'
import draggable from 'vuedraggable'
import { BUILDER_KEY } from '../composables/useTemplateBuilder'
import type { UseTemplateBuilderReturn } from '../composables/useTemplateBuilder'
import type { Column } from '@/shared/types'
import DroppableField from './DroppableField.vue'

const props = defineProps<{ column: Column }>()
const builder = inject(BUILDER_KEY) as UseTemplateBuilderReturn

const localFields = computed({
  get: () => props.column.fields,
  set: (val) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.column.fields = val
  },
})

function onFieldAdd(evt: any) {
  const paletteItem = evt.element
  if (paletteItem && paletteItem.type) {
    // Remove the palette item that was just added
    const index = localFields.value.findIndex((f) => f === paletteItem)
    if (index !== -1) {
      localFields.value.splice(index, 1)
    }
    // Open field configuration dialog
    builder.openFieldDialog(props.column.id, paletteItem.type)
  }
}
</script>

<template>
  <div class="border border-[rgba(124,58,237,0.15)] rounded-lg p-2 bg-white min-h-[80px]" data-column-panel>
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs text-[#7c3aed] font-medium">Columna</span>
    </div>

    <draggable
      v-model="localFields"
      group="report-fields"
      item-key="id"
      tag="div"
      class="space-y-1 min-h-[40px]"
      @add="onFieldAdd"
    >
      <template #item="{ element }">
        <DroppableField :field="element" />
      </template>
    </draggable>
  </div>
</template>
