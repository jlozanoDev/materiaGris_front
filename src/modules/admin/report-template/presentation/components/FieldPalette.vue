<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import type { FieldTypeMeta } from '@/shared/types/FieldTypeMeta'

interface Props {
  registry: FieldTypeMeta[]
}

const props = defineProps<Props>()

const GROUP_CONFIG = {
  name: 'report-fields',
  pull: 'clone' as const,
  put: false,
}

const grouped = computed(() => {
  const groups: Record<string, { label: string; items: FieldTypeMeta[] }> = {
    text: { label: 'Texto', items: [] },
    selection: { label: 'Selección', items: [] },
    special: { label: 'Especiales', items: [] },
  }

  for (const meta of props.registry) {
    const group = groups[meta.group]
    if (group) {
      group.items.push(meta)
    }
  }

  return Object.values(groups).filter((g) => g.items.length > 0)
})

function cloneItem(item: FieldTypeMeta): FieldTypeMeta {
  return { ...item }
}
</script>

<template>
  <div class="space-y-4">
    <h4 class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed]">
      Campos
    </h4>

    <div v-for="group in grouped" :key="group.label" class="space-y-1.5">
      <h5 class="text-[10px] font-semibold uppercase tracking-wider text-[#9690a8] px-1">
        {{ group.label }}
      </h5>

      <draggable
        :list="group.items"
        :group="GROUP_CONFIG"
        item-key="type"
        tag="div"
        class="space-y-1"
        :clone="cloneItem"
      >
        <template #item="{ element }">
          <div
            :data-palette-item="element.type"
            :data-field-type="element.type"
            :title="element.description"
            class="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm cursor-grab border border-[rgba(124,58,237,0.10)] bg-white text-[#0b0817] hover:border-[#7c3aed] hover:bg-[#f5f3ff] transition-all duration-150"
          >
            <i :class="element.icon" class="text-xs text-[#7c3aed]" />
            <span class="font-medium">{{ element.label }}</span>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>
