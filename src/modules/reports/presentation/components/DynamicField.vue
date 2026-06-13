<template>
  <div class="dynamic-field">
    <label v-if="field.label" class="dynamic-field__label">
      {{ field.label }}
      <span v-if="field.required" class="text-red-500">*</span>
    </label>

    <!-- text -->
    <input
      v-if="field.type === 'text'"
      type="text"
      :value="modelValue"
      :placeholder="field.placeholder"
      :disabled="isDisabled"
      class="dynamic-field__input"
      @input="emitValue(($event.target as HTMLInputElement).value)"
    />

    <!-- number -->
    <input
      v-else-if="field.type === 'number'"
      type="number"
      :value="modelValue"
      :placeholder="field.placeholder"
      :disabled="isDisabled"
      class="dynamic-field__input"
      @input="emitValue(($event.target as HTMLInputElement).value)"
    />

    <!-- textarea -->
    <textarea
      v-else-if="field.type === 'textarea'"
      :value="modelValue as string"
      :placeholder="field.placeholder"
      :disabled="isDisabled"
      class="dynamic-field__input"
      rows="3"
      @input="emitValue(($event.target as HTMLTextAreaElement).value)"
    ></textarea>

    <!-- date -->
    <input
      v-else-if="field.type === 'date'"
      type="date"
      :value="modelValue"
      :disabled="isDisabled"
      class="dynamic-field__input"
      @input="emitValue(($event.target as HTMLInputElement).value)"
    />

    <!-- select -->
    <select
      v-else-if="field.type === 'select'"
      :value="modelValue"
      :disabled="isDisabled"
      class="dynamic-field__input"
      @change="emitValue(($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>{{ field.placeholder || 'Seleccione...' }}</option>
      <option
        v-for="opt in field.options || []"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>

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
          :disabled="isDisabled"
          @change="emitValue(opt.value)"
        />
        <span>{{ opt.label }}</span>
      </label>
    </div>

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
          :disabled="isDisabled"
          @change="toggleCheckbox(opt.value, ($event.target as HTMLInputElement).checked)"
        />
        <span>{{ opt.label }}</span>
      </label>
    </div>

    <!-- dynamic_table -->
    <DynamicTable
      v-else-if="field.type === 'dynamic_table'"
      :columns="field.columns || []"
      :model-value="getArrayValue()"
      :disabled="isDisabled"
      @update:model-value="emitValue($event)"
    />

    <!-- signature -->
    <SignaturePad
      v-else-if="field.type === 'signature'"
      :model-value="signatureModelValue"
      :disabled="isDisabled"
      @update:model-value="emitValue($event)"
      @update:typed-signature="emitTypedSignature($event)"
    />

    <!-- unknown type fallback -->
    <div v-else class="dynamic-field__unsupported">
      Tipo de campo no soportado: {{ field.type }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FieldConfig } from '@/shared/types'
import DynamicTable from './DynamicTable.vue'
import SignaturePad from './SignaturePad.vue'

interface Props {
  field: FieldConfig
  modelValue: unknown
  disabled: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  'update:typedSignature': [value: string]
}>()

const isDisabled = computed(() => {
  return props.disabled || !!props.field.systemVariable
})

const signatureModelValue = computed((): string | null => {
  return (props.modelValue as string) ?? null
})

function emitValue(val: unknown): void {
  emit('update:modelValue', val)
}

function emitTypedSignature(val: string): void {
  emit('update:typedSignature', val)
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
</script>

<style scoped>
@reference "tailwindcss";
.dynamic-field {
  @apply mb-3;
}
.dynamic-field__label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.dynamic-field__input {
  @apply block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm
    focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
    disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500;
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
.dynamic-field__unsupported {
  @apply rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-700;
}
</style>
