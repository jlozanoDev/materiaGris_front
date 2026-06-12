<script setup lang="ts">
import { inject, computed } from 'vue'
import { BUILDER_KEY } from '../composables/useTemplateBuilder'
import type { FieldConfig, FieldType } from '@/shared/types'
import type { UseTemplateBuilderReturn } from '../composables/useTemplateBuilder'

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
  <div v-if="selectedField" class="p-4 space-y-4" data-property-panel>
    <h3 class="text-sm font-semibold text-slate-700 border-b pb-2">
      Propiedades del campo
    </h3>

    <!-- Label -->
    <div>
      <label class="text-xs text-slate-500 block mb-0.5">Etiqueta</label>
      <input
        :value="selectedField.label"
        class="form-input text-sm w-full"
        placeholder="Etiqueta del campo"
        @input="onLabelChange"
      />
    </div>

    <!-- Key -->
    <div>
      <label class="text-xs text-slate-500 block mb-0.5">Clave (key)</label>
      <input
        :value="selectedField.key"
        class="form-input text-sm w-full font-mono"
        placeholder="clave_del_campo"
        @input="update({ key: ($event.target as HTMLInputElement).value })"
      />
    </div>

    <!-- Type -->
    <div>
      <label class="text-xs text-slate-500 block mb-0.5">Tipo</label>
      <select
        :value="selectedField.type"
        class="form-input text-sm w-full"
        @change="update({ type: ($event.target as HTMLSelectElement).value as FieldType })"
      >
        <option value="text">Texto Corto</option>
        <option value="textarea">Texto Largo</option>
        <option value="number">Número</option>
        <option value="date">Fecha</option>
        <option value="select">Selección única</option>
        <option value="radio">Opción única</option>
        <option value="checkbox">Checkbox</option>
        <option value="dynamic_table">Tabla Dinámica</option>
      </select>
    </div>

    <!-- Placeholder -->
    <div>
      <label class="text-xs text-slate-500 block mb-0.5">Placeholder</label>
      <input
        :value="selectedField.placeholder || ''"
        class="form-input text-sm w-full"
        placeholder="Texto de ayuda"
        @input="update({ placeholder: ($event.target as HTMLInputElement).value })"
      />
    </div>

    <!-- Required -->
    <div class="flex items-center gap-2">
      <input
        type="checkbox"
        :checked="selectedField.required"
        class="rounded"
        @change="update({ required: ($event.target as HTMLInputElement).checked })"
      />
      <label class="text-sm text-slate-600">Requerido</label>
    </div>

    <!-- System Variable -->
    <div>
      <label class="text-xs text-slate-500 block mb-0.5">Variable del sistema</label>
      <select
        :value="selectedField.systemVariable || ''"
        class="form-input text-sm w-full"
        @change="update({ systemVariable: ($event.target as HTMLSelectElement).value || undefined })"
      >
        <option
          v-for="sv in SYSTEM_VARIABLES"
          :key="sv.value"
          :value="sv.value"
        >
          {{ sv.label }}
        </option>
      </select>
    </div>

    <!-- Conditional Rule -->
    <div>
      <label class="text-xs text-slate-500 block mb-0.5">Regla condicional</label>
      <div class="flex gap-1 items-center">
        <input
          :value="selectedField.conditionalRule?.field || ''"
          class="form-input text-xs flex-1"
          placeholder="Campo fuente"
          @input="update({ conditionalRule: { ...(selectedField.conditionalRule || { op: '==' as any, value: '' }), field: ($event.target as HTMLInputElement).value } })"
        />
        <select
          :value="selectedField.conditionalRule?.op || '=='"
          class="form-input text-xs w-16"
          @change="update({ conditionalRule: { ...(selectedField.conditionalRule || { field: '', value: '' }), op: ($event.target as HTMLSelectElement).value as any } })"
        >
          <option v-for="op in CONDITIONAL_OPS" :key="op.value" :value="op.value">
            {{ op.label.split(' ')[0] }}
          </option>
        </select>
        <input
          :value="selectedField.conditionalRule?.value || ''"
          class="form-input text-xs flex-1"
          placeholder="Valor"
          @input="update({ conditionalRule: { ...(selectedField.conditionalRule || { field: '', op: '==' as any }), value: ($event.target as HTMLInputElement).value } })"
        />
      </div>
    </div>

    <!-- Options (select/radio/checkbox) -->
    <div v-if="['select', 'radio', 'checkbox'].includes(selectedField.type)">
      <div class="flex items-center justify-between mb-1">
        <label class="text-xs text-slate-500">Opciones</label>
        <button
          class="text-xs text-indigo-500 hover:text-indigo-700"
          @click="addOption"
        >
          + Añadir
        </button>
      </div>
      <div class="space-y-1">
        <div
          v-for="(opt, idx) in selectedField.options || []"
          :key="idx"
          class="flex gap-1 items-center"
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
            class="text-red-400 hover:text-red-600"
            @click="removeOption(idx)"
          >
            <i class="pi pi-times text-xs" />
          </button>
        </div>
      </div>
    </div>

    <!-- Column defs (dynamic_table) -->
    <div v-if="selectedField.type === 'dynamic_table'">
      <div class="flex items-center justify-between mb-1">
        <label class="text-xs text-slate-500">Columnas de la tabla</label>
        <button
          class="text-xs text-indigo-500 hover:text-indigo-700"
          @click="addColumnDef"
        >
          + Añadir columna
        </button>
      </div>
      <div class="space-y-1">
        <div
          v-for="(col, idx) in selectedField.columns || []"
          :key="idx"
          class="flex gap-1 items-center"
        >
          <input
            :value="col.name"
            class="form-input text-xs flex-1"
            placeholder="Nombre"
            @input="selectedField.columns![idx] = { ...col, name: ($event.target as HTMLInputElement).value }; update({ columns: [...(selectedField.columns || [])] })"
          />
          <select
            :value="col.type"
            class="form-input text-xs w-24"
            @change="selectedField.columns![idx] = { ...col, type: ($event.target as HTMLSelectElement).value as FieldType }; update({ columns: [...(selectedField.columns || [])] })"
          >
            <option value="text">Texto</option>
            <option value="number">Número</option>
            <option value="date">Fecha</option>
            <option value="select">Selección</option>
          </select>
          <button
            class="text-red-400 hover:text-red-600"
            @click="removeColumnDef(idx)"
          >
            <i class="pi pi-times text-xs" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
