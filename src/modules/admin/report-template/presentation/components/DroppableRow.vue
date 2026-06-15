<script setup lang="ts">
import { inject, computed, ref, watch, nextTick } from 'vue'
import draggable from 'vuedraggable'
import { BUILDER_KEY } from '../composables/useTemplateBuilder'
import type { Row, Section, Column } from '@/shared/types'
import type { UseTemplateBuilderReturn } from '../composables/useTemplateBuilder'
import DroppableColumn from './DroppableColumn.vue'

function isSeparatorColumn(col: Column): boolean {
  return col.fields.length === 1 && col.fields[0].type === 'vertical_separator'
}

const props = defineProps<{ row: Row }>()
const builder = inject(BUILDER_KEY) as UseTemplateBuilderReturn

const activeDropIndex = ref<number | null>(null)
const gridContainer = ref<HTMLElement | null>(null)
const ghostLeft = ref(0)
const ghostWidth = ref(0)

const localColumns = computed({
  get: () => props.row.columns,
  set: (val) => {
    const allSections = [...builder.sections, ...builder.headerSections, ...builder.footerSections]
    const section = allSections.find((s: Section) =>
      s.rows.some((r: Row) => r.id === props.row.id)
    )
    if (section) {
      const row = section.rows.find((r: Row) => r.id === props.row.id)
      if (row) row.columns = val
    }
  },
})

const columnGroup = computed(() => ({
  name: 'report-columns',
  put: (_to: any, from: any, item: HTMLElement) => {
    const fromGroup = from.options.group?.name
    if (fromGroup === 'report-fields') {
      return item.getAttribute('data-field-type') === 'vertical_separator'
    }
    return fromGroup === 'report-columns'
  },
}))

const gridStyle = computed(() => {
  const widths = props.row.columns.map((c) => {
    if (c.width) return `${c.width}px`
    return '1fr'
  })
  if (widths.length === 0) widths.push('1fr')
  return { gridTemplateColumns: widths.join(' ') }
})

watch(activeDropIndex, () => {
  if (activeDropIndex.value === null) return
  nextTick(() => {
    const container = gridContainer.value
    if (!container) return
    const items = container.querySelectorAll<HTMLElement>('[data-column-id]')
    const containerRect = container.getBoundingClientRect()
    const style = getComputedStyle(container)
    const gap = parseFloat(style.gap) || 0

    if (items.length === 0) {
      ghostLeft.value = 0
      ghostWidth.value = containerRect.width
      return
    }

    const rects = Array.from(items).map((el) => el.getBoundingClientRect())
    const idx = activeDropIndex.value!

    if (idx === 0) {
      ghostLeft.value = 0
      ghostWidth.value = rects[0].width
    } else if (idx >= rects.length) {
      const last = rects[rects.length - 1]
      ghostLeft.value = last.right - containerRect.left + gap
      ghostWidth.value = last.width
    } else {
      const prev = rects[idx - 1]
      const curr = rects[idx]
      ghostLeft.value = prev.right - containerRect.left + gap
      ghostWidth.value = curr.left - prev.right - gap
    }
  })
})

function onColumnMove(payload: any) {
  const evt = payload?.evt
  if (!evt) return
  const el = evt.dragged
  const isSeparator = el?.getAttribute?.('data-field-type') === 'vertical_separator'
  if (!isSeparator) {
    activeDropIndex.value = null
    return
  }
  const related = evt.related?.closest?.('[data-column-id]')
  if (related) {
    const targetColId = related.getAttribute('data-column-id')
    const idx = localColumns.value.findIndex((c: Column) => c.id === targetColId)
    if (idx !== -1) {
      activeDropIndex.value = evt.willInsertAfter ? idx + 1 : idx
      return
    }
  }
  const og = payload.originalEvent as MouseEvent
  const container = gridContainer.value
  if (og && container && localColumns.value.length > 0) {
    const rect = container.getBoundingClientRect()
    const x = og.clientX - rect.left
    const ratio = x / rect.width
    const idx = Math.floor(ratio * localColumns.value.length)
    activeDropIndex.value = Math.min(idx, localColumns.value.length)
  }
}

function onDragEnd() {
  activeDropIndex.value = null
}

function onColumnChange(evt: any) {
  activeDropIndex.value = null
  if (evt.added) {
    const { element, newIndex } = evt.added
    if (element && !element.fields && element.type === 'vertical_separator') {
      const allSections = [...builder.sections, ...builder.headerSections, ...builder.footerSections]
      for (const section of allSections) {
        for (const r of section.rows) {
          if (r.id === props.row.id) {
            r.columns.splice(newIndex, 1)
            builder.addSeparatorColumn(props.row.id, newIndex)
            return
          }
        }
      }
    }
  }
}
</script>

<template>
  <div class="group relative">
    <div ref="gridContainer" class="relative">
      <draggable
        v-model="localColumns"
        :group="columnGroup"
        item-key="id"
        tag="div"
        :style="gridStyle"
        class="grid gap-3 min-h-[60px]"
        @change="onColumnChange"
        @move="onColumnMove"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <div :data-column-id="element.id">
            <template v-if="isSeparatorColumn(element)">
              <div class="flex items-stretch min-h-[80px] relative group">
                <div class="w-px bg-slate-200 mx-auto rounded-full" />
                <button
                  class="absolute -top-2 -right-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white border border-slate-300 text-slate-500 shadow-sm opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-all duration-150 cursor-pointer"
                  title="Eliminar columna separadora"
                  @click="builder.removeColumn(row.id, element.id)"
                >
                  <i class="pi pi-times" style="font-size: 10px; line-height: 1;" />
                </button>
              </div>
            </template>
            <DroppableColumn v-else :column="element" />
          </div>
        </template>
      </draggable>

      <div
        v-if="activeDropIndex !== null"
        class="ghost-column"
        :style="{ left: ghostLeft + 'px', width: ghostWidth + 'px' }"
      />
    </div>

    <div class="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      <button
        class="text-xs text-[#7c3aed] hover:text-[#6d28d9] font-medium px-2 py-1 rounded hover:bg-[#f5f3ff] transition-colors"
        data-add-column
        @click="builder.addColumn(row.id)"
      >
        <i class="pi pi-plus mr-1" />
        Añadir columna
      </button>
      <button
        class="inline-flex items-center justify-center h-6 w-6 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
        title="Eliminar fila"
        data-remove-row
        @click="builder.removeRow(row.id)"
      >
        <i class="pi pi-trash text-xs" />
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.ghost-column {
  position: absolute;
  top: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
  border-radius: 6px;
  background: repeating-linear-gradient(
    -45deg,
    rgba(124, 58, 237, 0.12),
    rgba(124, 58, 237, 0.12) 4px,
    rgba(124, 58, 237, 0.06) 4px,
    rgba(124, 58, 237, 0.06) 8px
  );
  border: 2px dashed rgba(124, 58, 237, 0.5);
  animation: ghost-pulse 1s ease-in-out infinite;
}

@keyframes ghost-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
</style>
