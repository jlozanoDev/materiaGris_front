<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import type { Column } from '@/shared/types'
import DroppableField from './DroppableField.vue'

const props = defineProps<{ column: Column }>()

const localFields = computed({
  get: () => props.column.fields,
  set: (val) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.column.fields = val
  },
})
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
    >
      <template #item="{ element }">
        <DroppableField :field="element" />
      </template>
    </draggable>
  </div>
</template>
