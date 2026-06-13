<script setup lang="ts">
import type { NumberField } from '@/shared/types'

interface Props {
  field: NumberField
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [value: Partial<NumberField>]
}>()

function emitUpdate(value: Partial<NumberField>) {
  emit('update', value)
}

function numVal(el: EventTarget | null, fallback?: number): number | undefined {
  const v = (el as HTMLInputElement).value
  return v ? Number(v) : fallback
}
</script>

<template>
  <div class="space-y-4">
    <!-- decimals -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Decimales</label>
      <input
        type="number"
        min="0"
        max="10"
        :value="props.field.decimals ?? ''"
        class="form-input"
        placeholder="0"
        @input="emitUpdate({ decimals: numVal($event.target) })"
      />
    </div>

    <!-- min -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Valor mínimo</label>
      <input
        type="number"
        :value="props.field.min ?? ''"
        class="form-input"
        placeholder="Sin mínimo"
        @input="emitUpdate({ min: numVal($event.target) })"
      />
    </div>

    <!-- max -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Valor máximo</label>
      <input
        type="number"
        :value="props.field.max ?? ''"
        class="form-input"
        placeholder="Sin máximo"
        @input="emitUpdate({ max: numVal($event.target) })"
      />
    </div>

    <!-- default_value -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Valor por defecto</label>
      <input
        type="number"
        :value="props.field.default_value ?? ''"
        class="form-input"
        placeholder="Valor inicial"
        @input="emitUpdate({ default_value: numVal($event.target) })"
      />
    </div>

    <!-- ai_help_description -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">
        Descripción para IA
        <span class="text-xs text-[#9690a8] font-normal">(opcional)</span>
      </label>
      <textarea
        :value="props.field.ai_help_description ?? ''"
        class="form-input"
        rows="2"
        placeholder="Ej: Peso en kg"
        @input="emitUpdate({ ai_help_description: ($event.target as HTMLTextAreaElement).value || undefined })"
      />
    </div>
  </div>
</template>
