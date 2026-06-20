<template>
  <div class="dynamic-field">
    <label v-if="field.label && field.showLabel !== false" class="dynamic-field__label">
      {{ field.label }}
      <span v-if="field.required" class="text-red-500">*</span>
    </label>

    <!-- ─── READONLY (disabled) ─────────────────────────────────── -->
    <template v-if="isDisabled">
      <!-- text, textarea, number -->
      <span v-if="field.type === 'text' || field.type === 'textarea' || field.type === 'number'" class="dynamic-field__readonly">
        {{ modelValue || '—' }}
      </span>

      <!-- date -->
      <span v-else-if="field.type === 'date'" class="dynamic-field__readonly">
        {{ formatDate(modelValue) }}
      </span>

      <!-- select, radio -->
      <span v-else-if="field.type === 'select' || field.type === 'radio'" class="dynamic-field__readonly">
        {{ optionLabel(modelValue) }}
      </span>

      <!-- multi_select, checkbox -->
      <span v-else-if="field.type === 'multi_select' || field.type === 'checkbox'" class="dynamic-field__readonly">
        {{ optionLabels(modelValue) }}
      </span>

      <!-- fixed_text, dynamic_table, separators — unchanged -->
      <FixedTextRenderer v-else-if="field.type === 'fixed_text'" :field="field" :variable-resolver="variableResolver" />
      <DynamicTable
        v-else-if="field.type === 'dynamic_table'"
        :columns="field.columns || []"
        :model-value="getArrayValue()"
        :disabled="true"
      />
      <div
        v-else-if="field.type === 'vertical_separator'"
        class="flex items-stretch"
        style="min-height: 60px;"
      >
        <div class="w-px bg-slate-300 rounded-full mx-auto" />
      </div>
      <div v-else-if="field.type === 'horizontal_separator'" class="py-2">
        <hr class="border-t border-slate-300" />
      </div>
      <div v-else class="dynamic-field__unsupported">
        Tipo de campo no soportado: {{ field.type }}
      </div>
    </template>

    <!-- ─── EDITABLE (enabled) ─────────────────────────────────── -->
    <template v-else>
      <!-- text -->
      <input
        v-if="field.type === 'text'"
        type="text"
        :value="modelValue"
        :placeholder="field.placeholder"
        class="form-input"
        @input="emitValue(($event.target as HTMLInputElement).value)"
      />

      <!-- number -->
      <div v-else-if="field.type === 'number'" class="flex items-stretch">
        <input
          type="number"
          :value="modelValue"
          class="form-input number-input"
          style="flex: 1 1 0%; min-width: 0; border-top-right-radius: 0; border-bottom-right-radius: 0; border-right: 0;"
          @input="emitValue(($event.target as HTMLInputElement).value)"
        />
        <div class="flex flex-col border border-l-0 border-[rgba(124,58,237,0.10)] rounded-r-xl overflow-hidden shrink-0">
          <button
            type="button"
            class="flex items-center justify-center w-7 flex-1 text-slate-400 hover:text-[#7c3aed] hover:bg-[#ede9fe] transition-colors"
            @click="emitValue(Number(modelValue || 0) + 1)"
          >
            <span class="text-[10px] leading-none select-none pointer-events-none">▲</span>
          </button>
          <div class="h-px bg-[rgba(124,58,237,0.10)]" />
          <button
            type="button"
            class="flex items-center justify-center w-7 flex-1 text-slate-400 hover:text-[#7c3aed] hover:bg-[#ede9fe] transition-colors"
            @click="emitValue(Number(modelValue || 0) - 1)"
          >
            <span class="text-[10px] leading-none select-none pointer-events-none">▼</span>
          </button>
        </div>
      </div>

      <!-- textarea -->
      <textarea
        v-else-if="field.type === 'textarea'"
        :value="modelValue as string"
        :placeholder="field.placeholder"
        class="form-input"
        rows="3"
        @input="emitValue(($event.target as HTMLTextAreaElement).value)"
      ></textarea>

      <!-- date -->
      <input
        v-else-if="field.type === 'date'"
        type="date"
        :value="modelValue"
        class="form-input"
        @input="emitValue(($event.target as HTMLInputElement).value)"
      />

      <!-- select -->
      <CustomSelect
        v-else-if="field.type === 'select'"
        :model-value="modelValue"
        :options="field.options || []"
        :placeholder="field.placeholder || 'Seleccione...'"
        @update:model-value="emitValue"
      />

      <!-- radio -->
      <div v-else-if="field.type === 'radio'" class="dynamic-field__options">
        <label
          v-for="opt in field.options || []"
          :key="opt.value"
          class="dynamic-field__option"
        >
          <input
            type="radio"
            :value="opt.value"
            :checked="modelValue === opt.value"
            @change="emitValue(opt.value)"
          />
          <span>{{ opt.label }}</span>
        </label>
      </div>

      <!-- multi_select -->
      <select
        v-else-if="field.type === 'multi_select'"
        multiple
        class="form-input"
        @change="emitMultiSelect(($event.target as HTMLSelectElement))"
      >
        <option
          v-for="opt in field.options || []"
          :key="opt.value"
          :value="opt.value"
          :selected="isChecked(opt.value)"
        >
          {{ opt.label }}
        </option>
      </select>

      <!-- checkbox -->
      <div v-else-if="field.type === 'checkbox'" class="dynamic-field__options">
        <label
          v-for="opt in field.options || []"
          :key="opt.value"
          class="dynamic-field__option"
        >
          <input
            type="checkbox"
            :value="opt.value"
            :checked="isChecked(opt.value)"
            @change="toggleCheckbox(opt.value, ($event.target as HTMLInputElement).checked)"
          />
          <span>{{ opt.label }}</span>
        </label>
      </div>

      <!-- fixed_text -->
      <FixedTextRenderer
        v-else-if="field.type === 'fixed_text'"
        :field="field"
        :variable-resolver="variableResolver"
      />

      <!-- dynamic_table -->
      <DynamicTable
        v-else-if="field.type === 'dynamic_table'"
        :columns="field.columns || []"
        :model-value="getArrayValue()"
        :disabled="false"
        @update:model-value="emitValue($event)"
      />

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

      <!-- unknown type fallback -->
      <div v-else class="dynamic-field__unsupported">
        Tipo de campo no soportado: {{ field.type }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FieldConfig } from '@/shared/types'
import CustomSelect from '@/shared/components/CustomSelect.vue'
import DynamicTable from './DynamicTable.vue'
import FixedTextRenderer from './FixedTextRenderer.vue'

interface Props {
  field: FieldConfig
  modelValue: unknown
  disabled: boolean
  variableResolver?: (text: string) => string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const isDisabled = computed(() => {
  return props.disabled
})

function emitValue(val: unknown): void {
  emit('update:modelValue', val)
}

function emitMultiSelect(el: HTMLSelectElement): void {
  const values = Array.from(el.selectedOptions).map((opt) => opt.value)
  emitValue(values)
}

function isChecked(val: string): boolean {
  const arr = Array.isArray(props.modelValue) ? props.modelValue : []
  return arr.includes(val)
}

function toggleCheckbox(val: string, checked: boolean): void {
  const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  if (checked) {
    arr.push(val)
  } else {
    const idx = arr.indexOf(val)
    if (idx !== -1) arr.splice(idx, 1)
  }
  emitValue(arr)
}

function getArrayValue(): Record<string, any>[] {
  return Array.isArray(props.modelValue) ? (props.modelValue as Record<string, any>[]) : []
}

function formatDate(val: unknown): string {
  if (!val) return '—'
  try {
    return new Date(val as string).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function optionLabel(val: unknown): string {
  if (!val) return '—'
  const f = props.field as any
  const opts = f.options || []
  const match = opts.find((o: any) => o.value === val)
  return match ? String(match.label) : String(val)
}

function optionLabels(val: unknown): string {
  if (!val || !Array.isArray(val) || val.length === 0) return '—'
  const f = props.field as any
  const opts = f.options || []
  return val.map((v: unknown) => {
    const match = opts.find((o: any) => o.value === v)
    return match ? String(match.label) : String(v)
  }).join(', ')
}
</script>

<style scoped>
@reference "tailwindcss";
.dynamic-field {
  @apply mb-3;
}
.dynamic-field__label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.dynamic-field__options {
  @apply space-y-1;
}
.dynamic-field__option {
  @apply flex items-center gap-2 text-sm cursor-pointer;
}
.dynamic-field__option input {
  @apply h-4 w-4;
}
.dynamic-field__readonly {
  @apply block text-sm text-gray-700 py-1;
}
.dynamic-field__unsupported {
  @apply rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-700;
}
</style>
