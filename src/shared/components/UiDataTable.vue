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
              :aria-sort="
                header.column.getIsSorted() === 'asc'
                  ? 'ascending'
                  : header.column.getIsSorted() === 'desc'
                  ? 'descending'
                  : undefined
              "
              :class="[showGridlines ? 'border border-slate-200' : '']"
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
              rowHover ? 'hover:bg-indigo-50/40 transition-colors' : '',
            ]"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="[showGridlines ? 'border border-slate-200' : '']"
            >
              <slot :name="'body-' + cell.column.columnDef.meta?.key" :data="row.original">
                <div :class="cell.column.columnDef.meta?.bodyClass || 'px-3 py-2 text-sm'">
                  {{
                    displayValue(
                      row.original,
                      cell.column.columnDef.meta?.field,
                      cell.column.columnDef.meta?.emptyText
                    )
                  }}
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginator -->
    <div
      v-if="paginator && table.getPageCount() > 0"
      class="flex flex-wrap items-center justify-between gap-3 mt-3 px-1 text-sm text-slate-600"
    >
      <div class="flex items-center gap-3">
        <label for="rowsPerPageSelect" class="sr-only">Filas por página</label>
        <CustomSelect
          v-if="rowsPerPageOptions && rowsPerPageOptions.length"
          v-model="pageSize"
          :options="rowsPerPageOptions"
          class="w-auto"
        />
        <span aria-live="polite">
          Mostrando {{ startIndex }} – {{ endIndex }} de {{ filteredTotal }}
        </span>
      </div>

      <nav class="flex items-center gap-1" role="navigation" aria-label="Paginación">
        <button
          class="btn btn-sm btn-ghost"
          :disabled="!table.getCanPreviousPage()"
          aria-label="Primera página"
          @click="table.setPageIndex(0)"
        >
          «
        </button>
        <button
          class="btn btn-sm btn-ghost"
          :disabled="!table.getCanPreviousPage()"
          aria-label="Página anterior"
          @click="table.previousPage()"
        >
          ‹
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          :class="[
            'btn btn-sm',
            page === currentPage
              ? 'btn-primary'
              : 'btn-ghost border border-slate-200 hover:bg-slate-100',
          ]"
          :aria-current="page === currentPage ? 'page' : undefined"
          :aria-label="'Ir a la página ' + page"
          @click="table.setPageIndex(page - 1)"
        >
          {{ page }}
        </button>

        <button
          class="btn btn-sm btn-ghost"
          :disabled="!table.getCanNextPage()"
          aria-label="Página siguiente"
          @click="table.nextPage()"
        >
          ›
        </button>
        <button
          class="btn btn-sm btn-ghost"
          :disabled="!table.getCanNextPage()"
          aria-label="Última página"
          @click="table.setPageIndex(table.getPageCount() - 1)"
        >
          »
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import CustomSelect from "@/shared/components/CustomSelect.vue";
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/vue-table";
import { ref } from "vue";

// Augment TanStack ColumnMeta with our custom fields used in templates
declare module "@tanstack/vue-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    key?: string;
    field?: string;
    bodyClass?: string;
    emptyText?: string;
  }
}

interface ColumnDef {
  key?: string;
  field?: string;
  label: string;
  sortable?: boolean;
  bodyClass?: string;
  emptyText?: string;
  align?: string;
  headerClass?: string;
}

interface FilterDef {
  global?: { value: string | null; matchMode: string };
}

interface Props {
  value?: unknown[];
  columns?: ColumnDef[];
  dataKey?: string;
  filters?: FilterDef | null;
  globalFilterFields?: string[];
  sortMode?: string | null;
  scrollable?: boolean;
  scrollHeight?: string | null;
  stripedRows?: boolean;
  showGridlines?: boolean;
  rowHover?: boolean;
  rowClass?: ((row: unknown) => string) | null;
  tableStyle?: string | null;
  paginator?: boolean;
  rows?: number;
  rowsPerPageOptions?: number[];
  paginatorTemplate?: string;
  currentPageReportTemplate?: string;
  emptyText?: string;
}

type Updater<T> = T | ((prev: T) => T);

type SortingState = { id: string; desc: boolean }[];

const props = withDefaults(defineProps<Props>(), {
  value: () => [],
  columns: () => [],
  dataKey: "id",
  filters: null,
  globalFilterFields: () => [],
  sortMode: null,
  scrollable: false,
  scrollHeight: null,
  stripedRows: false,
  showGridlines: false,
  rowHover: false,
  rowClass: null,
  tableStyle: null,
  paginator: false,
  rows: 10,
  rowsPerPageOptions: () => [10, 25, 50],
  paginatorTemplate: "",
  currentPageReportTemplate: "",
  emptyText: "No hay datos.",
});

const sorting = ref<SortingState>([]);
const pagination = ref({ pageIndex: 0, pageSize: props.rows });

watch(
  () => props.rows,
  (val) => {
    pagination.value = { pageIndex: 0, pageSize: val };
  }
);

const globalFilterValue = computed(() => props.filters?.global?.value ?? "");

const columnDefs = computed(() =>
  props.columns.map((col) => ({
    id: col.key || col.field || col.label,
    accessorFn: col.field ? (row: unknown) => getValue(row, col.field!) : () => "",
    header: col.label,
    enableSorting: !!col.sortable,
    meta: {
      key: col.key || col.field,
      field: col.field,
      bodyClass: col.bodyClass,
      emptyText: col.emptyText,
    },
  }))
);

function globalFilterFn(row: { original: unknown }, _columnId: string, filterValue: string): boolean {
  if (!filterValue) return true;
  const q = String(filterValue).toLowerCase();
  const fields = props.globalFilterFields.length
    ? props.globalFilterFields
    : props.columns.map((c) => c.field).filter(Boolean) as string[];
  return fields.some((f) => {
    const v = getValue(row.original, f);
    return v != null && String(v).toLowerCase().includes(q);
  });
}

const table = useVueTable({
  get data() {
    return props.value ?? [];
  },
  get columns() {
    return columnDefs.value;
  },
  state: {
    get sorting() {
      return sorting.value;
    },
    get pagination() {
      return pagination.value;
    },
    get globalFilter() {
      return globalFilterValue.value;
    },
  },
  onSortingChange: (updater: Updater<SortingState>) => {
    sorting.value = typeof updater === "function" ? updater(sorting.value) : updater;
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === "function" ? updater(pagination.value) : updater;
  },
  enableMultiSort: false,
  globalFilterFn,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

const filteredTotal = computed(() => table.getFilteredRowModel().rows.length);

const visiblePages = computed(() => {
  const total = table.getPageCount();
  const current = table.getState().pagination.pageIndex + 1;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current]);
  for (let d = 1; d <= 2; d++) {
    if (current - d >= 1) pages.add(current - d);
    if (current + d <= total) pages.add(current + d);
  }
  return Array.from(pages).sort((a, b) => a - b);
});

const currentPage = computed(() => table.getState().pagination.pageIndex + 1);
const pageSize = computed({
  get: () => table.getState().pagination.pageSize,
  set: (val) => {
    pagination.value = { pageIndex: 0, pageSize: Number(val) };
  },
});

const startIndex = computed(() => {
  if (filteredTotal.value === 0) return 0;
  return table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
});

const endIndex = computed(() => {
  return Math.min(
    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
    filteredTotal.value
  );
});

function getValue(obj: unknown, path: string): unknown {
  if (!path) return undefined;
  const parts = path.split(".");
  let v: unknown = obj;
  for (const p of parts) {
    if (v == null) return undefined;
    v = (v as Record<string, unknown>)[p];
  }
  return v;
}

function displayValue(data: unknown, field: string | undefined, emptyText?: string): string {
  if (!field) return "";
  const val = getValue(data, field);
  return val == null ? (emptyText ?? "") : String(val);
}
</script>
