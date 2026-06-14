<script setup lang="ts">
import { ref, computed, inject, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import type { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import type { FixedTextField } from '@/shared/types'
import { SYSTEM_VARIABLES_KEY } from '@/shared/composables/useSystemVariableRegistry'
import type { UseSystemVariableRegistryReturn } from '@/shared/composables/useSystemVariableRegistry'
import type { SystemVarDef } from '@/shared/types/SystemVariableRegistry'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
} from 'lucide-vue-next'

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

// System variable registry
const systemVars = inject(SYSTEM_VARIABLES_KEY) as UseSystemVariableRegistryReturn | undefined
const searchFn = systemVars?.search ?? (() => [] as SystemVarDef[])

// Autocomplete state
const isOpen = ref(false)
const query = ref('')
const results = ref<SystemVarDef[]>([])
const activeIndex = ref(0)
const triggerPosition = ref<{ top: number; left: number } | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let triggerFromPos = -1
let lastEmittedHtml = ''

// Tiptap editor
const editor = useEditor({
  content: props.field.text_content,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Placeholder.configure({
      placeholder:
        'Escriba el texto fijo aquí... Use {paciente.nombre} para insertar variables',
    }),
  ],
  editorProps: {
    handleKeyDown: (_view, event) => {
      if (!isOpen.value) return false

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
        return true
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        activeIndex.value = Math.max(activeIndex.value - 1, 0)
        return true
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        if (activeIndex.value >= 0 && activeIndex.value < results.value.length) {
          event.preventDefault()
          selectVariable(activeIndex.value)
          return true
        }
        return false
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        closeAutocomplete()
        return true
      }
      return false
    },
  },
  onUpdate: ({ editor: ed }) => {
    const html = ed.getHTML()
    if (html !== lastEmittedHtml) {
      lastEmittedHtml = html
      emitUpdate({ text_content: html })
    }
    detectAutocompleteTrigger(ed)
  },
  onCreate: ({ editor: ed }) => {
    lastEmittedHtml = ed.getHTML()
  },
})

// Sync content when field changes externally (undo / template load)
watch(
  () => props.field.text_content,
  (newContent) => {
    const ed = editor.value
    if (!ed) return
    const current = ed.getHTML()
    if (current !== newContent && newContent !== lastEmittedHtml) {
      lastEmittedHtml = newContent
      ed.commands.setContent(newContent, { emitUpdate: false })
    }
  },
)

function detectAutocompleteTrigger(ed: Editor) {
  if (!ed) return

  const { from } = ed.state.selection
  const doc = ed.state.doc

  let bracePos = -1
  for (let pos = from - 1; pos >= 0; pos--) {
    const char = doc.textBetween(pos, pos + 1)
    if (char === '}') break
    if (char === '{') {
      bracePos = pos
      break
    }
  }

  if (bracePos >= 0) {
    triggerFromPos = bracePos
    const afterBrace = doc.textBetween(bracePos + 1, from)
    query.value = afterBrace

    const coords = ed.view.coordsAtPos(from)
    if (coords) {
      triggerPosition.value = { top: coords.bottom, left: coords.left }
    }

    debouncedSearch(afterBrace)
  } else {
    closeAutocomplete()
  }
}

function debouncedSearch(q: string) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    results.value = searchFn(q)
    isOpen.value = results.value.length > 0
    activeIndex.value = 0
  }, 150)
}

function closeAutocomplete() {
  isOpen.value = false
  query.value = ''
  results.value = []
  activeIndex.value = 0
  triggerPosition.value = null
  triggerFromPos = -1
}

function selectVariable(index: number) {
  const def = results.value[index]
  const ed = editor.value
  if (!def || !ed) return

  const fullKey = `${def.category}.${def.key}`
  const { from } = ed.state.selection
  const tr = ed.state.tr.replaceWith(
    triggerFromPos,
    from,
    ed.state.schema.text(`{${fullKey}}`),
  )
  ed.view.dispatch(tr)

  closeAutocomplete()
}

// Grouped results for display
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
  selectVariable(flatIndexOf(catIdx, itemIdx))
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

  if (left + DROPDOWN_WIDTH > window.innerWidth - 8) {
    left = pos.left - DROPDOWN_WIDTH
    if (left < 8) left = 8
  }

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

// Toolbar active states
const isBold = computed(() => editor.value?.isActive('bold') ?? false)
const isItalic = computed(() => editor.value?.isActive('italic') ?? false)
const isH1 = computed(() => editor.value?.isActive('heading', { level: 1 }) ?? false)
const isH2 = computed(() => editor.value?.isActive('heading', { level: 2 }) ?? false)
const isH3 = computed(() => editor.value?.isActive('heading', { level: 3 }) ?? false)
const isBullet = computed(() => editor.value?.isActive('bulletList') ?? false)
const isOrdered = computed(() => editor.value?.isActive('orderedList') ?? false)

function tbBold() {
  editor.value?.chain().toggleBold().focus().run()
}
function tbItalic() {
  editor.value?.chain().toggleItalic().focus().run()
}
function tbH1() {
  editor.value?.chain().toggleHeading({ level: 1 }).focus().run()
}
function tbH2() {
  editor.value?.chain().toggleHeading({ level: 2 }).focus().run()
}
function tbH3() {
  editor.value?.chain().toggleHeading({ level: 3 }).focus().run()
}
function tbBullet() {
  editor.value?.chain().toggleBulletList().focus().run()
}
function tbOrdered() {
  editor.value?.chain().toggleOrderedList().focus().run()
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="space-y-4">
    <!-- WYSIWYG Editor -->
    <div>
      <label class="block text-sm font-medium text-[#6b6b7b] mb-1">
        Contenido del texto
        <span class="text-xs text-[#9690a8] font-normal">
          (usa
          <code class="text-[#7c3aed] bg-[#f5f3ff] px-1 rounded">{variable}</code>
          para insertar variables)
        </span>
      </label>

      <!-- Toolbar -->
      <div
        v-if="editor"
        class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border border-b-0 border-gray-200 rounded-t-lg bg-[#faf9ff]"
      >
        <button
          type="button"
          class="p-1.5 rounded transition-colors"
          :class="isBold ? 'bg-[#ede9fe] text-[#7c3aed]' : 'text-[#6b6b7b] hover:bg-gray-100'"
          title="Negrita"
          @click="tbBold"
        >
          <Bold :size="16" />
        </button>
        <button
          type="button"
          class="p-1.5 rounded transition-colors"
          :class="isItalic ? 'bg-[#ede9fe] text-[#7c3aed]' : 'text-[#6b6b7b] hover:bg-gray-100'"
          title="Cursiva"
          @click="tbItalic"
        >
          <Italic :size="16" />
        </button>

        <span class="w-px h-5 bg-gray-200 mx-0.5" />

        <button
          type="button"
          class="px-2 py-1 text-xs rounded transition-colors font-semibold"
          :class="isH1 ? 'bg-[#ede9fe] text-[#7c3aed]' : 'text-[#6b6b7b] hover:bg-gray-100'"
          title="Título 1"
          @click="tbH1"
        >
          H1
        </button>
        <button
          type="button"
          class="px-2 py-1 text-xs rounded transition-colors font-semibold"
          :class="isH2 ? 'bg-[#ede9fe] text-[#7c3aed]' : 'text-[#6b6b7b] hover:bg-gray-100'"
          title="Título 2"
          @click="tbH2"
        >
          H2
        </button>
        <button
          type="button"
          class="px-2 py-1 text-xs rounded transition-colors font-semibold"
          :class="isH3 ? 'bg-[#ede9fe] text-[#7c3aed]' : 'text-[#6b6b7b] hover:bg-gray-100'"
          title="Título 3"
          @click="tbH3"
        >
          H3
        </button>

        <span class="w-px h-5 bg-gray-200 mx-0.5" />

        <button
          type="button"
          class="p-1.5 rounded transition-colors"
          :class="isBullet ? 'bg-[#ede9fe] text-[#7c3aed]' : 'text-[#6b6b7b] hover:bg-gray-100'"
          title="Lista"
          @click="tbBullet"
        >
          <List :size="16" />
        </button>
        <button
          type="button"
          class="p-1.5 rounded transition-colors"
          :class="isOrdered ? 'bg-[#ede9fe] text-[#7c3aed]' : 'text-[#6b6b7b] hover:bg-gray-100'"
          title="Lista numerada"
          @click="tbOrdered"
        >
          <ListOrdered :size="16" />
        </button>
      </div>

      <!-- Editor content -->
      <div
        class="border border-gray-200 rounded-b-lg overflow-hidden"
        :class="{ 'rounded-t-lg': !editor }"
      >
        <EditorContent
          :editor="editor"
          class="prose prose-sm max-w-none min-h-[120px] px-3 py-2 focus:outline-none"
        />
      </div>
    </div>

    <!-- Autocomplete dropdown -->
    <Teleport to="body">
      <div
        v-if="isOpen && results.length > 0"
        :style="dropdownStyle"
        class="overflow-y-auto app-scrollbar bg-white border border-[#c4b5fd] rounded-lg shadow-lg shadow-[#7c3aed]/10"
      >
        <template v-for="(group, gIdx) in groupedResults" :key="group.category">
          <div
            class="px-2.5 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9690a8]"
          >
            {{ categoryLabel(group.category) }}
          </div>
          <button
            v-for="(def, iIdx) in group.items"
            :key="`${def.category}.${def.key}`"
            type="button"
            class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors"
            :class="
              flatIndexOf(gIdx, iIdx) === activeIndex
                ? 'bg-[#f5f3ff] text-[#7c3aed]'
                : 'text-[#0b0817] hover:bg-[#faf9ff]'
            "
            @click="onResultClick(gIdx, iIdx)"
          >
            <code
              class="text-[11px] text-[#7c3aed] bg-[#ede9fe] px-1.5 py-0.5 rounded font-mono shrink-0"
            >
              {{ '{' }}{{ def.category }}.{{ def.key }}{{ '}' }}
            </code>
            <span class="flex-1 truncate">{{ def.label }}</span>
          </button>
        </template>
      </div>

      <div
        v-if="isOpen && results.length === 0 && query.length > 0"
        :style="dropdownStyle"
        class="bg-white border border-[#c4b5fd] rounded-lg shadow-lg px-3 py-2 text-xs text-[#9690a8]"
      >
        Sin coincidencias para "{{ query }}"
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Tiptap editor styles */
:deep(.ProseMirror) {
  min-height: 120px;
  outline: none;
  font-size: 0.875rem;
  line-height: 1.625;
  color: #1f2937;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

:deep(.ProseMirror h1) {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0.5em 0 0.25em;
}

:deep(.ProseMirror h2) {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0.5em 0 0.25em;
}

:deep(.ProseMirror h3) {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0.5em 0 0.25em;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.5rem;
  margin: 0.25em 0;
}

:deep(.ProseMirror li) {
  margin: 0.125em 0;
}

:deep(.ProseMirror strong) {
  font-weight: 600;
}

:deep(.ProseMirror em) {
  font-style: italic;
}
</style>
