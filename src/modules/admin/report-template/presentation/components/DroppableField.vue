<script setup lang="ts">
import { inject } from 'vue'
import { BUILDER_KEY } from '../composables/useTemplateBuilder'
import type { FieldConfig } from '@/shared/types'
import type { UseTemplateBuilderReturn } from '../composables/useTemplateBuilder'

const props = defineProps<{ field: FieldConfig }>()
const builder = inject(BUILDER_KEY) as UseTemplateBuilderReturn

const FIELD_ICONS: Record<string, string> = {
  text: 'pi pi-pencil',
  textarea: 'pi pi-align-left',
  number: 'pi pi-hashtag',
  date: 'pi pi-calendar',
  select: 'pi pi-check',
  multi_select: 'pi pi-list',
  radio: 'pi pi-chevron-circle-down',
  checkbox: 'pi pi-check-square',
  dynamic_table: 'pi pi-table',
  signature: 'pi pi-pencil',
}

function isSelected(): boolean {
  return builder.selectedFieldId === props.field.id
}

function handleSelect() {
  builder.selectedFieldId = props.field.id
}

function handleRemove() {
  builder.removeField(props.field.id)
}
</script>

<template>
  <div
    class="flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer border transition-colors"
    :class="isSelected()
      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'"
    data-field-chip
    @click="handleSelect"
  >
    <i :class="FIELD_ICONS[field.type] || 'pi pi-question'" class="text-xs" />
    <span class="flex-1 truncate">{{ field.label || field.key }}</span>
    <button
      class="text-red-400 hover:text-red-600 ml-1"
      title="Eliminar campo"
      data-remove-field
      @click.stop="handleRemove"
    >
      <i class="pi pi-times text-xs" />
    </button>
  </div>
</template>
