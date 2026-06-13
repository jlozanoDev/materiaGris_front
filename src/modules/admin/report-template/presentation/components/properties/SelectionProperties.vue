<script setup lang="ts">
import type { SelectionField, FieldOption } from '@/shared/types'

interface Props {
  field: SelectionField
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [value: Partial<SelectionField>]
}>()

function emitUpdate(value: Partial<SelectionField>) {
  emit('update', value)
}

function addOption() {
  const current = [...(props.field.options ?? [])]
  current.push({ label: `Opción ${current.length + 1}`, value: `opcion_${current.length + 1}` })
  emitUpdate({ options: current })
}

function removeOption(index: number) {
  const current = [...(props.field.options ?? [])]
  current.splice(index, 1)
  emitUpdate({ options: current })
}

function updateOptionLabel(index: number, val: string) {
  const current = [...(props.field.options ?? [])]
  current[index] = { ...current[index], label: val }
  emitUpdate({ options: current })
}

function updateOptionValue(index: number, val: string) {
  const current = [...(props.field.options ?? [])]
  current[index] = { ...current[index], value: val }
  emitUpdate({ options: current })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Options -->
    <div>
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
          v-for="(opt, idx) in props.field.options ?? []"
          :key="idx"
          class="flex gap-2 items-center"
        >
          <input
            :value="opt.label"
            class="form-input text-xs flex-1"
            placeholder="Etiqueta"
            @input="updateOptionLabel(idx, ($event.target as HTMLInputElement).value)"
          />
          <input
            :value="opt.value"
            class="form-input text-xs flex-1"
            placeholder="Valor"
            @input="updateOptionValue(idx, ($event.target as HTMLInputElement).value)"
          />
          <button
            class="inline-flex items-center justify-center h-7 w-7 rounded-md text-[#9690a8] hover:text-red-500 hover:bg-red-50 transition-all duration-150"
            @click="removeOption(idx)"
          >
            <i class="pi pi-times text-xs" />
          </button>
        </div>
        <div v-if="(!props.field.options || props.field.options.length === 0)" class="text-xs text-[#9690a8] italic">
          Sin opciones definidas
        </div>
      </div>
    </div>

    <!-- default_value -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Valor por defecto</label>
      <input
        :value="props.field.default_value ?? ''"
        class="form-input"
        placeholder="Valor por defecto"
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
        placeholder="Ej: Seleccionar tipo de estudio"
        @input="emitUpdate({ ai_help_description: ($event.target as HTMLTextAreaElement).value || undefined })"
      />
    </div>
  </div>
</template>
