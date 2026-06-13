<script setup lang="ts">
import type { FixedTextField } from '@/shared/types'

interface Props {
  field: FixedTextField
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [value: Partial<FixedTextField>]
}>()

function emitUpdate(value: Partial<FixedTextField>) {
  emit('update', value)
}

function toggleBold() {
  emitUpdate({
    styling_options: {
      ...(props.field.styling_options ?? {}),
      bold: !props.field.styling_options?.bold,
    },
  })
}

function setSize(size: 'sm' | 'md' | 'lg') {
  emitUpdate({
    styling_options: {
      ...(props.field.styling_options ?? {}),
      size,
    },
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- text_content editor -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">
        Contenido del texto
        <span class="text-xs text-[#9690a8] font-normal">
          (usa <code class="text-[#7c3aed] bg-[#f5f3ff] px-1 rounded">{variable}</code> para insertar variables)
        </span>
      </label>
      <textarea
        :value="props.field.text_content"
        class="form-input font-mono text-sm"
        rows="5"
        placeholder="Escriba el texto fijo aquí... Use {paciente.nombre} para insertar variables"
        @input="emitUpdate({ text_content: ($event.target as HTMLTextAreaElement).value })"
      />
    </div>

    <!-- Styling options -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-2">Opciones de estilo</label>
      <div class="flex gap-3 items-center">
        <button
          type="button"
          class="text-sm px-3 py-1.5 rounded-md border transition-colors font-semibold"
          :class="props.field.styling_options?.bold
            ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
            : 'bg-white text-[#6b6b7b] border-gray-200 hover:border-[#7c3aed]'"
          @click="toggleBold"
        >
          <span class="font-bold">B</span>
        </button>

        <div class="flex gap-1">
          <button
            v-for="s in (['sm', 'md', 'lg'] as const)"
            :key="s"
            type="button"
            class="px-2.5 py-1.5 rounded-md border text-xs transition-colors"
            :class="(props.field.styling_options?.size ?? 'md') === s
              ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
              : 'bg-white text-[#6b6b7b] border-gray-200 hover:border-[#7c3aed]'"
            @click="setSize(s)"
          >
            {{ { sm: 'S', md: 'M', lg: 'L' }[s] }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
