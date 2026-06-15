<script setup lang="ts">
import { inject, computed } from 'vue'
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
  select: 'pi pi-chevron-down',
  multi_select: 'pi pi-list',
  radio: 'pi pi-chevron-circle-down',
  checkbox: 'pi pi-check-square',
  dynamic_table: 'pi pi-table',
  fixed_text: 'pi pi-file',
  vertical_separator: 'pi pi-minus vertical-separator-icon',
  horizontal_separator: 'pi pi-minus',
}

const isSelected = computed(() => builder.selectedFieldId === props.field.id)

function handleSelect() {
  builder.selectedFieldId = props.field.id
}

function handleRemove() {
  builder.removeField(props.field.id)
}

function stripHtml(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}
</script>

<template>
  <div
    class="group relative rounded-lg border p-3 transition-all duration-150 cursor-pointer"
    :class="isSelected
      ? 'border-indigo-400 bg-indigo-50/40 shadow-sm shadow-indigo-200/30'
      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'"
    data-field-chip
    @click="handleSelect"
  >
    <!-- X button - top-right corner -->
    <button
      class="absolute top-1 right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white border border-slate-300 text-slate-500 shadow-sm opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-all duration-150 cursor-pointer"
      title="Eliminar campo"
      data-remove-field
      @click.stop="handleRemove"
    >
      <i class="pi pi-times" style="font-size: 10px; line-height: 1;" />
    </button>

    <!-- Label row -->
    <div class="flex items-center gap-1.5 mb-1.5">
      <i
        :class="FIELD_ICONS[field.type] || 'pi pi-question'"
        class="text-xs text-slate-400 shrink-0"
      />
      <label v-if="field.showLabel !== false" class="block text-sm font-medium text-slate-700 leading-tight">
        {{ field.label || field.key }}
        <span v-if="field.required && field.type !== 'fixed_text'" class="text-red-500 ml-0.5">*</span>
        <span
          v-if="field.ai_help_description"
          class="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#ede9fe] text-[#7c3aed] text-[10px] ml-1 cursor-help align-text-top"
          :title="field.ai_help_description"
        >?
        </span>
      </label>
    </div>

    <!-- text / textarea -->
    <div
      v-if="field.type === 'text' || field.type === 'textarea'"
      class="rounded-md border border-slate-200 bg-slate-50 px-3"
      :class="field.type === 'textarea' ? 'py-4' : 'py-2'"
    >
      <span v-if="field.placeholder" class="text-sm text-slate-400">{{ field.placeholder }}</span>
      <span v-else class="text-sm text-slate-300 italic">
        {{ field.type === 'textarea' ? 'Texto largo...' : 'Texto' }}
      </span>
    </div>

    <!-- number -->
    <div
      v-else-if="field.type === 'number'"
      class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
    >
      <span class="text-sm text-slate-400">
        <template v-if="field.min !== undefined && field.max !== undefined">{{ field.min }} – {{ field.max }}</template>
        <template v-else>0</template>
      </span>
    </div>

    <!-- date -->
    <div
      v-else-if="field.type === 'date'"
      class="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
    >
      <i class="pi pi-calendar text-xs text-slate-400" />
      <span class="text-sm text-slate-400">
        <template v-if="field.placeholder">{{ field.placeholder }}</template>
        <template v-else>Seleccionar fecha</template>
      </span>
    </div>

    <!-- select -->
    <div
      v-else-if="field.type === 'select'"
      class="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
    >
      <span class="text-sm text-slate-400">
        <template v-if="field.placeholder">{{ field.placeholder }}</template>
        <template v-else>Seleccione...</template>
      </span>
      <i class="pi pi-chevron-down text-xs text-slate-400" />
    </div>

    <!-- multi_select -->
    <div
      v-else-if="field.type === 'multi_select'"
      class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-sm text-slate-400">
          <template v-if="field.placeholder">{{ field.placeholder }}</template>
          <template v-else>Seleccione...</template>
        </span>
        <i class="pi pi-list text-xs text-slate-400" />
      </div>
      <div v-if="field.options && field.options.length > 0" class="mt-1.5 flex flex-wrap gap-1">
        <span
          v-for="opt in field.options"
          :key="opt.value"
          class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-slate-200 text-slate-600"
        >
          {{ opt.label }}
        </span>
      </div>
    </div>

    <!-- radio -->
    <div v-else-if="field.type === 'radio'" class="space-y-1.5">
      <div
        v-for="opt in field.options || []"
        :key="opt.value"
        class="flex items-center gap-2"
      >
        <span class="inline-flex items-center justify-center h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
        <span class="text-sm text-slate-600">{{ opt.label }}</span>
      </div>
      <div v-if="!field.options || field.options.length === 0" class="text-sm text-slate-400 italic">
        Sin opciones
      </div>
    </div>

    <!-- checkbox -->
    <div v-else-if="field.type === 'checkbox'" class="space-y-1.5">
      <div
        v-for="opt in field.options || []"
        :key="opt.value"
        class="flex items-center gap-2"
      >
        <span class="inline-flex items-center justify-center h-4 w-4 rounded border-2 border-slate-300 bg-white" />
        <span class="text-sm text-slate-600">{{ opt.label }}</span>
      </div>
      <div v-if="!field.options || field.options.length === 0" class="text-sm text-slate-400 italic">
        Sin opciones
      </div>
    </div>

    <!-- fixed_text -->
    <div v-else-if="field.type === 'fixed_text'" class="px-0.5">
      <div class="text-sm text-slate-500 line-clamp-3">
        {{ stripHtml(field.text_content) || 'Texto fijo...' }}
      </div>
    </div>

    <!-- dynamic_table -->
    <div v-else-if="field.type === 'dynamic_table'" class="overflow-hidden rounded-md border border-slate-200">
      <table class="w-full text-xs">
        <thead>
          <tr class="bg-slate-100">
            <th
              v-for="col in field.columns || []"
              :key="col.key"
              class="px-2 py-1.5 text-left font-medium text-slate-600"
            >
              {{ col.label || col.key }}
              <span v-if="col.required" class="text-red-500">*</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              v-for="col in field.columns || []"
              :key="col.key"
              class="px-2 py-3 text-slate-400"
            >
              —
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- vertical_separator -->
    <div
      v-else-if="field.type === 'vertical_separator'"
      class="flex items-stretch"
      style="min-height: 60px;"
    >
      <div class="w-px bg-slate-300 rounded-full mx-auto" />
    </div>

    <!-- horizontal_separator -->
    <div
      v-else-if="field.type === 'horizontal_separator'"
      class="py-2"
    >
      <hr class="border-t border-slate-300" />
    </div>

    <!-- unknown -->
    <div v-else class="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2">
      <span class="text-sm text-yellow-700">{{ field.type }} (no soportado)</span>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>
