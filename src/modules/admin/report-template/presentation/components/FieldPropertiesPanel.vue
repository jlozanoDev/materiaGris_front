<script setup lang="ts">
import { inject, computed } from 'vue'
import { BUILDER_KEY } from '../composables/useTemplateBuilder'
import type { FieldConfig, FieldType } from '@/shared/types'
import type { UseTemplateBuilderReturn } from '../composables/useTemplateBuilder'
import CustomSelect from '@/shared/components/CustomSelect.vue'

const builder = inject(BUILDER_KEY) as UseTemplateBuilderReturn

const SYSTEM_VARIABLES = [
  { label: '— Ninguno —', value: '' },
  { label: '{{paciente.nombre_completo}}', value: '{{paciente.nombre_completo}}' },
  { label: '{{paciente.edad}}', value: '{{paciente.edad}}' },
  { label: '{{paciente.genero}}', value: '{{paciente.genero}}' },
  { label: '{{paciente.fecha_nacimiento}}', value: '{{paciente.fecha_nacimiento}}' },
  { label: '{{medico.nombre_completo}}', value: '{{medico.nombre_completo}}' },
  { label: '{{fecha_actual}}', value: '{{fecha_actual}}' },
]

const CONDITIONAL_OPS = [
  { label: 'Igual a (==)', value: '==' },
  { label: 'Distinto de (!=)', value: '!=' },
  { label: 'Contiene', value: 'contains' },
  { label: 'Mayor que (>)', value: '>' },
  { label: 'Menor que (<)', value: '<' },
  { label: 'Mayor o igual (>=)', value: '>=' },
  { label: 'Menor o igual (<=)', value: '<=' },
]

const selectedField = computed<FieldConfig | null>(() => {
  if (!builder.selectedFieldId) return null
  for (const section of builder.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        const field = column.fields.find((f) => f.id === builder.selectedFieldId)
        if (field) return field
      }
    }
  }
  return null
})

function update(value: Partial<FieldConfig>) {
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

function addOption() {
  const field = selectedField.value
  if (!field) return
  const options = field.options || []
  options.push({ label: `Opción ${options.length + 1}`, value: `opcion_${options.length + 1}` })
  update({ options: [...options] })
}

function removeOption(index: number) {
  const field = selectedField.value
  if (!field || !field.options) return
  const options = field.options.filter((_, i) => i !== index)
  update({ options })
}

function addColumnDef() {
  const field = selectedField.value
  if (!field) return
  const cols = field.columns || []
  cols.push({ name: `col_${cols.length + 1}`, type: 'text' })
  update({ columns: [...cols] })
}

function removeColumnDef(index: number) {
  const field = selectedField.value
  if (!field || !field.columns) return
  const cols = field.columns.filter((_, i) => i !== index)
  update({ columns: cols })
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

      <!-- Type -->
      <div>
        <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Tipo</label>
        <CustomSelect
          :model-value="selectedField.type"
          :options="[
            { value: 'text', label: 'Texto Corto' },
            { value: 'textarea', label: 'Texto Largo' },
            { value: 'number', label: 'Número' },
            { value: 'date', label: 'Fecha' },
            { value: 'select', label: 'Selección única' },
            { value: 'multi_select', label: 'Selección múltiple' },
            { value: 'radio', label: 'Opción única' },
            { value: 'checkbox', label: 'Checkbox' },
            { value: 'dynamic_table', label: 'Tabla Dinámica' },
          ]"
          @update:model-value="update({ type: $event as FieldType })"
        />
      </div>

      <!-- Placeholder -->
      <div>
        <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Placeholder</label>
        <input
          :value="selectedField.placeholder || ''"
          class="form-input"
          placeholder="Texto de ayuda"
          @input="update({ placeholder: ($event.target as HTMLInputElement).value })"
        />
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

      <!-- System Variable -->
      <div>
        <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Variable del sistema</label>
        <CustomSelect
          :model-value="selectedField.systemVariable || ''"
          :options="SYSTEM_VARIABLES"
          @update:model-value="update({ systemVariable: ($event as string) || undefined })"
        />
      </div>

      <!-- Conditional Rule -->
      <div>
        <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Regla condicional</label>
        <div class="flex gap-2 items-center">
          <input
            :value="selectedField.conditionalRule?.field || ''"
            class="form-input text-xs flex-1"
            placeholder="Campo fuente"
            @input="update({ conditionalRule: { ...(selectedField.conditionalRule || { op: '==' as any, value: '' }), field: ($event.target as HTMLInputElement).value } })"
          />
          <CustomSelect
            :model-value="selectedField.conditionalRule?.op || '=='"
            :options="CONDITIONAL_OPS.map(op => ({ ...op, label: op.label.split(' ')[0] }))"
            size="sm"
            class="w-20"
            @update:model-value="update({ conditionalRule: { ...(selectedField.conditionalRule || { field: '', value: '' }), op: $event as '==' | '!=' | 'contains' | '>' | '<' | '>=' | '<=' } })"
          />
          <input
            :value="selectedField.conditionalRule?.value || ''"
            class="form-input text-xs flex-1"
            placeholder="Valor"
            @input="update({ conditionalRule: { ...(selectedField.conditionalRule || { field: '', op: '==' as any }), value: ($event.target as HTMLInputElement).value } })"
          />
        </div>
      </div>

      <hr class="border-[rgba(124,58,237,0.08)]" />

      <!-- Options (select/radio/checkbox) -->
      <div v-if="['select', 'multi_select', 'radio', 'checkbox'].includes(selectedField.type)">
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed]">Opciones</label>
          <button
            class="text-xs text-[#7c3aed] hover:text-[#6d28d9] font-medium px-2 py-1 rounded hover:bg-[#f5f3ff] transition-colors"
            @click="addOption"
          >
            <i class="pi pi-plus mr-1" />
            Añadir
          </button>
        </div>
        <div class="space-y-2">
          <div
            v-for="(opt, idx) in selectedField.options || []"
            :key="idx"
            class="flex gap-2 items-center"
          >
            <input
              :value="opt.label"
              class="form-input text-xs flex-1"
              placeholder="Etiqueta"
              @input="selectedField.options![idx] = { ...opt, label: ($event.target as HTMLInputElement).value }; update({ options: [...(selectedField.options || [])] })"
            />
            <input
              :value="opt.value"
              class="form-input text-xs flex-1"
              placeholder="Valor"
              @input="selectedField.options![idx] = { ...opt, value: ($event.target as HTMLInputElement).value }; update({ options: [...(selectedField.options || [])] })"
            />
            <button
              class="inline-flex items-center justify-center h-7 w-7 rounded-md text-[#9690a8] hover:text-red-500 hover:bg-red-50 transition-all duration-150"
              @click="removeOption(idx)"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>
        </div>
      </div>

      <!-- Column defs (dynamic_table) -->
      <div v-if="selectedField.type === 'dynamic_table'">
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed]">Columnas de la tabla</label>
          <button
            class="text-xs text-[#7c3aed] hover:text-[#6d28d9] font-medium px-2 py-1 rounded hover:bg-[#f5f3ff] transition-colors"
            @click="addColumnDef"
          >
            <i class="pi pi-plus mr-1" />
            Añadir columna
          </button>
        </div>
        <div class="space-y-2">
          <div
            v-for="(col, idx) in selectedField.columns || []"
            :key="idx"
            class="flex gap-2 items-center"
          >
            <input
              :value="col.name"
              class="form-input text-xs flex-1"
              placeholder="Nombre"
              @input="selectedField.columns![idx] = { ...col, name: ($event.target as HTMLInputElement).value }; update({ columns: [...(selectedField.columns || [])] })"
            />
            <CustomSelect
              :model-value="col.type"
              :options="[
                { value: 'text', label: 'Texto' },
                { value: 'number', label: 'Número' },
                { value: 'date', label: 'Fecha' },
                { value: 'select', label: 'Selección' },
              ]"
              size="sm"
              class="w-24"
              @update:model-value="selectedField.columns![idx] = { ...col, type: $event as FieldType }; update({ columns: [...(selectedField.columns || [])] })"
            />
            <button
              class="inline-flex items-center justify-center h-7 w-7 rounded-md text-[#9690a8] hover:text-red-500 hover:bg-red-50 transition-all duration-150"
              @click="removeColumnDef(idx)"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
