<script setup lang="ts">
import type { DateField } from '@/shared/types'

interface Props {
  field: DateField
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [value: Partial<DateField>]
}>()

function emitUpdate(value: Partial<DateField>) {
  emit('update', value)
}
</script>

<template>
  <div class="space-y-4">
    <!-- min_date -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Fecha mínima</label>
      <input
        type="date"
        :value="props.field.min_date ?? ''"
        class="form-input"
        @input="emitUpdate({ min_date: ($event.target as HTMLInputElement).value || undefined })"
      />
    </div>

    <!-- max_date -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Fecha máxima</label>
      <input
        type="date"
        :value="props.field.max_date ?? ''"
        class="form-input"
        @input="emitUpdate({ max_date: ($event.target as HTMLInputElement).value || undefined })"
      />
    </div>

    <!-- placeholder -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Placeholder</label>
      <input
        :value="props.field.placeholder ?? ''"
        class="form-input"
        placeholder="dd/mm/aaaa"
        @input="emitUpdate({ placeholder: ($event.target as HTMLInputElement).value || undefined })"
      />
    </div>

    <!-- default_value -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Valor por defecto</label>
      <input
        type="date"
        :value="props.field.default_value ?? ''"
        class="form-input"
        @input="emitUpdate({ default_value: ($event.target as HTMLInputElement).value || undefined })"
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
        placeholder="Ej: Fecha del estudio"
        @input="emitUpdate({ ai_help_description: ($event.target as HTMLTextAreaElement).value || undefined })"
      />
    </div>
  </div>
</template>
