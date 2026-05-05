<template>
  <div class="w-full card app-datatable">
    <!-- Table -->
    <div class="overflow-x-auto w-full">
      <table class="w-full border-collapse text-sm" :style="tableStyle">
        <thead>
          <tr>
            <th
              v-for="header in table.getFlatHeaders()"
              :key="header.id"
              :data-p-sortable-column="header.column.getCanSort() ? 'true' : 'false'"
              :aria-sort="header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : undefined"
              :class="[ showGridlines ? 'border border-slate-200' : '' ]"
              @click="header.column.getCanSort() ? header.column.toggleSorting() : null"
            >
              <slot :name="'header-' + header.column.columnDef.meta?.key">
                <div data-pc-section="columnheadercontent" class="flex items-center gap-1">
                  <span class="column-title">{{ header.column.columnDef.header }}</span>
                  <span v-if="header.column.getCanSort()" class="sorticon" aria-hidden="true">
                    <span v-if="header.column.getIsSorted() === 'asc'">▲</span>
                    <span v-else-if="header.column.getIsSorted() === 'desc'">▼</span>
                    <span v-else>⇅</span>
                  </span>
                </div>
              </slot>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="table.getRowModel().rows.length === 0">
            <tr>
              <td :colspan="columns.length" class="px-3 py-4 text-center text-slate-500">
                <slot name="empty">{{ emptyText }}</slot>
              </td>
            </tr>
          </template>
          <tr
            v-for="(row, rowIdx) in table.getRowModel().rows"
            :key="row.id"
            :class="[
              rowClass ? rowClass(row.original) : '',
              showGridlines ? '' : 'border-b border-slate-100 last:border-b-0',
              stripedRows && rowIdx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white',
              rowHover ? 'hover:bg-indigo-50/40 transition-colors' : ''
            ]"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="[showGridlines ? 'border border-slate-200' : '']"
            >
              <slot :name="'body-' + cell.column.columnDef.meta?.key" :data="row.original">
                <div :class="cell.column.columnDef.meta?.bodyClass || 'px-3 py-2 text-sm'">
                  {{ displayValue(row.original, cell.column.columnDef.meta?.field, cell.column.columnDef.meta?.emptyText) }}
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginator -->
    <div v-if="paginator && table.getPageCount() > 0" class="flex flex-wrap items-center justify-between gap-3 mt-3 px-1 text-sm text-slate-600">
      <div class="flex items-center gap-3">
        <label for="rowsPerPageSelect" class="sr-only">Filas por página</label>
        <select id="rowsPerPageSelect" v-if="rowsPerPageOptions && rowsPerPageOptions.length" v-model.number="pageSize" class="form-input w-auto text-sm">
          <option v-for="opt in rowsPerPageOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <span aria-live="polite">
          Mostrando {{ startIndex }} – {{ endIndex }} de {{ filteredTotal }}
        </span>
      </div>

      <nav class="flex items-center gap-1" role="navigation" aria-label="Paginación">
        <button class="btn btn-sm btn-ghost" :disabled="!table.getCanPreviousPage()" @click="table.setPageIndex(0)" aria-label="Primera página">«</button>
        <button class="btn btn-sm btn-ghost" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()" aria-label="Página anterior">‹</button>

        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          :class="['btn btn-sm', page === currentPage ? 'btn-primary' : 'btn-ghost border border-slate-200 hover:bg-slate-100']"
          @click="table.setPageIndex(page - 1)"
          :aria-current="page === currentPage ? 'page' : undefined"
          :aria-label="'Ir a la página ' + page"
        >
          {{ page }}
        </button>

        <button class="btn btn-sm btn-ghost" :disabled="!table.getCanNextPage()" @click="table.nextPage()" aria-label="Página siguiente">›</button>
        <button class="btn btn-sm btn-ghost" :disabled="!table.getCanNextPage()" @click="table.setPageIndex(table.getPageCount() - 1)" aria-label="Última página">»</button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/vue-table'
import { ref } from 'vue'

const props = defineProps({
  value: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  dataKey: { type: String, default: 'id' },
  filters: { type: Object, default: null },
  globalFilterFields: { type: Array, default: () => [] },
  sortMode: { type: String, default: null },
  scrollable: { type: Boolean, default: false },
  scrollHeight: { type: String, default: null },
  stripedRows: { type: Boolean, default: false },
  showGridlines: { type: Boolean, default: false },
  rowHover: { type: Boolean, default: false },
  rowClass: { type: Function, default: null },
  tableStyle: { type: String, default: null },
  paginator: { type: Boolean, default: false },
  rows: { type: Number, default: 10 },
  rowsPerPageOptions: { type: Array, default: () => [10, 25, 50] },
  paginatorTemplate: { type: String, default: '' },
  currentPageReportTemplate: { type: String, default: '' },
  emptyText: { type: String, default: 'No hay datos.' }
})

// Sorting state
const sorting = ref([])
// Pagination state
const pagination = ref({ pageIndex: 0, pageSize: props.rows })

// Sync rows prop → pageSize
watch(() => props.rows, (val) => {
  pagination.value = { pageIndex: 0, pageSize: val }
})

// Global filter value extracted from PrimeVue-style filters prop
const globalFilterValue = computed(() => props.filters?.global?.value ?? '')

// Build TanStack column defs from columns prop
const columnDefs = computed(() =>
  props.columns.map((col) => ({
    id: col.key || col.field || col.label,
    accessorFn: col.field ? (row) => getValue(row, col.field) : () => '',
    header: col.label,
    enableSorting: !!col.sortable,
    meta: {
      key: col.key || col.field,
      field: col.field,
      bodyClass: col.bodyClass,
      emptyText: col.emptyText,
    },
  }))
)

// Custom global filter: checks if any of the globalFilterFields contains the search string
function globalFilterFn(row, _columnId, filterValue) {
  if (!filterValue) return true
  const q = String(filterValue).toLowerCase()
  const fields = props.globalFilterFields.length ? props.globalFilterFields : props.columns.map(c => c.field).filter(Boolean)
  return fields.some((f) => {
    const v = getValue(row.original, f)
    return v != null && String(v).toLowerCase().includes(q)
  })
}

const table = useVueTable({
  get data() { return props.value },
  get columns() { return columnDefs.value },
  state: {
    get sorting() { return sorting.value },
    get pagination() { return pagination.value },
    get globalFilter() { return globalFilterValue.value },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater
  },
  enableMultiSort: false,
  globalFilterFn,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})

const filteredTotal = computed(() => table.getFilteredRowModel().rows.length)

// Visible page numbers (max 5 around current)
const visiblePages = computed(() => {
  const total = table.getPageCount()
  const current = table.getState().pagination.pageIndex + 1
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current])
  for (let d = 1; d <= 2; d++) {
    if (current - d >= 1) pages.add(current - d)
    if (current + d <= total) pages.add(current + d)
  }
  return Array.from(pages).sort((a, b) => a - b)
})

// Pagination helpers: current page, start/end indices and pageSize control
const currentPage = computed(() => table.getState().pagination.pageIndex + 1)
const pageSize = computed({
  get: () => table.getState().pagination.pageSize,
  set: (val) => { pagination.value = { pageIndex: 0, pageSize: Number(val) } }
})

function onRowsPerPageChange(val) {
  pagination.value = { pageIndex: 0, pageSize: Number(val) }
}

const startIndex = computed(() => {
  if (filteredTotal.value === 0) return 0
  return table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
})

const endIndex = computed(() => {
  return Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredTotal.value)
})

function getValue(obj, path) {
  if (!path) return undefined
  const parts = path.split('.')
  let v = obj
  for (const p of parts) {
    if (v == null) return undefined
    v = v[p]
  }
  return v
}

function displayValue(data, field, emptyText) {
  if (!field) return ''
  const val = getValue(data, field)
  return val == null ? (emptyText ?? '') : val
}
</script>
