<template>
  <div class="space-y-1.5 p-2.5 bg-white rounded-lg border border-[rgba(124,58,237,0.08)] shrink-0">
    <div class="flex items-center justify-between">
      <span class="text-[11px] text-[#9690a8]">
        {{ zone === 'header' ? 'Cabecera' : 'Pie' }}
      </span>
      <button
        type="button"
        role="switch"
        :aria-checked="enabled"
        :class="[
          'relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none',
          enabled ? 'bg-[#7c3aed]' : 'bg-gray-200',
        ]"
        @click="$emit('update:enabled', !enabled)"
      >
        <span
          :class="[
            'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
            enabled ? 'translate-x-3.5' : 'translate-x-0.5',
          ]"
        />
      </button>
    </div>

    <div v-if="enabled" class="flex items-center gap-1.5">
      <label class="text-[10px] text-[#9690a8] shrink-0">Mostrar en páginas:</label>
      <CustomSelect
        :model-value="pageDisplay"
        :options="pageOptions"
        size="sm"
        class="w-auto"
        @update:model-value="$emit('update:pageDisplay', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomSelect from '@/shared/components/CustomSelect.vue'

defineProps<{
  enabled: boolean
  pageDisplay: string
  zone: 'header' | 'footer'
}>()

defineEmits<{
  'update:enabled': [value: boolean]
  'update:pageDisplay': [value: string]
}>()

const pageOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'first', label: 'Primera' },
  { value: 'last', label: 'Última' },
]
</script>
