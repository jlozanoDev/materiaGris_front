<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { FixedTextField } from '@/shared/types'
import { useSystemVariableAutocomplete } from '@/shared/composables/useSystemVariableAutocomplete'
import { SYSTEM_VARIABLES_KEY } from '@/shared/composables/useSystemVariableRegistry'
import type { UseSystemVariableRegistryReturn } from '@/shared/composables/useSystemVariableRegistry'
import type { SystemVarDef } from '@/shared/types/SystemVariableRegistry'

interface Props {
  field: FixedTextField
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [value: Partial<FixedTextField>]
}>()

const systemVars = inject(SYSTEM_VARIABLES_KEY) as UseSystemVariableRegistryReturn | undefined
const searchFn = systemVars?.search ?? (() => [] as SystemVarDef[])

const {
  isOpen,
  query,
  results,
  activeIndex,
  triggerPosition,
  handleInput,
  handleKeydown,
  select,
} = useSystemVariableAutocomplete(searchFn)

const textareaRef = ref<HTMLTextAreaElement | null>(null)

function emitUpdate(value: Partial<FixedTextField>) {
  emit('update', value)
}

function onTextareaInput(e: Event) {
  const el = e.target as HTMLTextAreaElement
  emitUpdate({ text_content: el.value })
  handleInput(el)
}

function onTextareaKeydown(e: KeyboardEvent) {
  const consumed = handleKeydown(e)
  if (consumed) return
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

const groupedResults = computed(() => {
  const groups = new Map<string, SystemVarDef[]>()
  for (const def of results.value) {
    const existing = groups.get(def.category)
    if (existing) {
      existing.push(def)
    } else {
      groups.set(def.category, [def])
    }
  }
  return Array.from(groups.entries()).map(([category, items]) => ({ category, items }))
})

function flatIndexOf(catIdx: number, itemIdx: number): number {
  let count = 0
  for (let i = 0; i < catIdx; i++) {
    count += groupedResults.value[i].items.length
  }
  return count + itemIdx
}

function onResultClick(catIdx: number, itemIdx: number) {
  select(flatIndexOf(catIdx, itemIdx))
}

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    paciente: 'Paciente',
    clinica: 'Clínica',
    fecha: 'Fecha',
    usuario: 'Usuario',
    medico: 'Médico',
  }
  return labels[cat] ?? cat
}

const DROPDOWN_WIDTH = 240
const DROPDOWN_MAX_HEIGHT = 192

const dropdownStyle = computed(() => {
  const pos = triggerPosition.value
  if (!pos) return { display: 'none' }

  let left = pos.left
  let top = pos.top

  // Flip left if it overflows right edge
  if (left + DROPDOWN_WIDTH > window.innerWidth - 8) {
    left = pos.left - DROPDOWN_WIDTH
    if (left < 8) left = 8
  }

  // Flip up if it overflows bottom edge
  if (top + DROPDOWN_MAX_HEIGHT > window.innerHeight - 8) {
    top = pos.top - DROPDOWN_MAX_HEIGHT - 24
    if (top < 8) top = 8
  }

  return {
    position: 'fixed' as const,
    top: `${top}px`,
    left: `${left}px`,
    width: `${DROPDOWN_WIDTH}px`,
    maxHeight: `${DROPDOWN_MAX_HEIGHT}px`,
    zIndex: 9999,
  }
})
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
        ref="textareaRef"
        :value="props.field.text_content"
        class="form-input font-mono text-sm"
        rows="5"
        placeholder="Escriba el texto fijo aquí... Use {paciente.nombre} para insertar variables"
        @input="onTextareaInput"
        @keydown="onTextareaKeydown"
      />
    </div>

    <!-- Autocomplete dropdown (fixed position at cursor) -->
    <Teleport to="body">
      <div
        v-if="isOpen && results.length > 0"
        :style="dropdownStyle"
        class="overflow-y-auto app-scrollbar bg-white border border-[#c4b5fd] rounded-lg shadow-lg shadow-[#7c3aed]/10"
      >
        <template v-for="(group, gIdx) in groupedResults" :key="group.category">
          <div class="px-2.5 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9690a8]">
            {{ categoryLabel(group.category) }}
          </div>
          <button
            v-for="(def, iIdx) in group.items"
            :key="`${def.category}.${def.key}`"
            type="button"
            class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors"
            :class="flatIndexOf(gIdx, iIdx) === activeIndex
              ? 'bg-[#f5f3ff] text-[#7c3aed]'
              : 'text-[#0b0817] hover:bg-[#faf9ff]'"
            @click="onResultClick(gIdx, iIdx)"
          >
            <code class="text-[11px] text-[#7c3aed] bg-[#ede9fe] px-1.5 py-0.5 rounded font-mono shrink-0">
              {{ '{' }}{{ def.category }}.{{ def.key }}{{ '}' }}
            </code>
            <span class="flex-1 truncate">{{ def.label }}</span>
          </button>
        </template>
      </div>

      <!-- No results -->
      <div
        v-if="isOpen && results.length === 0 && query.length > 0"
        :style="dropdownStyle"
        class="bg-white border border-[#c4b5fd] rounded-lg shadow-lg px-3 py-2 text-xs text-[#9690a8]"
      >
        Sin coincidencias para "{{ query }}"
      </div>
    </Teleport>

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
