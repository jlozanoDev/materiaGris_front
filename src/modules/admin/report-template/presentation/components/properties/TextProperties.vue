<script setup lang="ts">
import type { TextField } from '@/shared/types'

interface Props {
  field: TextField
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [value: Partial<TextField>]
}>()

function emitUpdate(value: Partial<TextField>) {
  emit('update', value)
}
</script>

<template>
  <div class="space-y-4">
    <!-- max_chars -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">
        Máximo de caracteres
      </label>
      <input
        type="number"
        min="0"
        :value="props.field.max_chars ?? ''"
        class="form-input"
        placeholder="Sin límite"
        @input="emitUpdate({ max_chars: ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined })"
      />
    </div>

    <!-- placeholder -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Placeholder</label>
      <input
        :value="props.field.placeholder ?? ''"
        class="form-input"
        placeholder="Texto de ayuda"
        @input="emitUpdate({ placeholder: ($event.target as HTMLInputElement).value || undefined })"
      />
    </div>

    <!-- default_value -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Valor por defecto</label>
      <input
        :value="props.field.default_value ?? ''"
        class="form-input"
        placeholder="Valor inicial"
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
        placeholder="Ej: Registrar edad al momento del estudio"
        @input="emitUpdate({ ai_help_description: ($event.target as HTMLTextAreaElement).value || undefined })"
      />
    </div>
  </div>
</template>
