<script setup lang="ts">
import { inject, computed, defineAsyncComponent, type Component } from 'vue'
import { BUILDER_KEY } from '../composables/useTemplateBuilder'
import type { FieldConfig } from '@/shared/types'
import type { UseTemplateBuilderReturn } from '../composables/useTemplateBuilder'
import CustomSelect from '@/shared/components/CustomSelect.vue'

// Dynamic property panel components
const PROPERTY_PANELS: Record<string, Component> = {
  text: defineAsyncComponent(() => import('./properties/TextProperties.vue')),
  textarea: defineAsyncComponent(() => import('./properties/TextProperties.vue')),
  number: defineAsyncComponent(() => import('./properties/NumberProperties.vue')),
  date: defineAsyncComponent(() => import('./properties/DateProperties.vue')),
  select: defineAsyncComponent(() => import('./properties/SelectionProperties.vue')),
  multi_select: defineAsyncComponent(() => import('./properties/SelectionProperties.vue')),
  radio: defineAsyncComponent(() => import('./properties/SelectionProperties.vue')),
  checkbox: defineAsyncComponent(() => import('./properties/SelectionProperties.vue')),
  fixed_text: defineAsyncComponent(() => import('./properties/FixedTextProperties.vue')),
  dynamic_table: defineAsyncComponent(() => import('./properties/DynamicTableProperties.vue')),
}

const builder = inject(BUILDER_KEY) as UseTemplateBuilderReturn

const selectedField = computed<FieldConfig | null>(() => {
  if (!builder.selectedFieldId) return null
  for (const section of builder.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        const field = column.fields.find((f: FieldConfig) => f.id === builder.selectedFieldId)
        if (field) return field
      }
    }
  }
  return null
})

const propertyComponent = computed<Component | null>(() => {
  if (!selectedField.value) return null
  return PROPERTY_PANELS[selectedField.value.type] ?? null
})

// Cast for dynamic component dispatch (type safety ensured by dispatch logic)
const fieldForPanel = computed(() => selectedField.value as any)

function update(value: Record<string, any>) {
  if (!selectedField.value) return
  builder.updateField(selectedField.value.id, value)
}

function slugifyKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function onLabelChange(e: Event) {
  const input = e.target as HTMLInputElement
  update({ label: input.value, key: slugifyKey(input.value) || input.value })
}
</script>

<template>
  <div v-if="selectedField" data-property-panel>
    <!-- Panel header -->
    <div class="flex items-center gap-2 px-4 py-3 bg-[#faf9ff] border-b border-[rgba(124,58,237,0.06)]">
      <i class="pi pi-cog text-[#7c3aed] text-xs" />
      <h3 class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed]">
        Propiedades del campo
      </h3>
    </div>

    <div class="p-4 space-y-5">
      <!-- Label -->
      <div>
        <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Etiqueta</label>
        <input
          :value="selectedField.label"
          class="form-input"
          placeholder="Etiqueta del campo"
          @input="onLabelChange"
        />
      </div>

      <!-- Key -->
      <div>
        <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Clave (key)</label>
        <input
          :value="selectedField.key"
          class="form-input font-mono"
          placeholder="clave_del_campo"
          @input="update({ key: ($event.target as HTMLInputElement).value })"
        />
      </div>

      <!-- Type (read-only info) -->
      <div>
        <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Tipo</label>
        <div class="text-sm text-[#0b0817] bg-[#f5f3ff] px-3 py-2 rounded-md">
          {{ selectedField.type }}
        </div>
      </div>

      <!-- Required -->
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          :checked="selectedField.required"
          class="h-4 w-4 rounded border-[rgba(124,58,237,0.25)] accent-[#7c3aed] focus:ring-[#7c3aed] focus:ring-offset-0 focus:ring-2 cursor-pointer"
          @change="update({ required: ($event.target as HTMLInputElement).checked })"
        />
        <label class="text-sm text-[#0b0817] font-medium cursor-pointer select-none">Requerido</label>
      </div>

      <hr class="border-[rgba(124,58,237,0.08)]" />

      <!-- Type-specific properties panel -->
      <div v-if="propertyComponent">
        <component
          :is="propertyComponent"
          :field="fieldForPanel"
          @update="update"
        />
      </div>

      <!-- Fallback for unknown types -->
      <div v-else class="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
        No hay panel de propiedades disponible para el tipo "{{ selectedField.type }}"
      </div>
    </div>
  </div>
</template>
