<template>
  <v-data-table
    v-model:items-per-page="internalRowsPerPage"
    v-model:page="currentPage"
    v-model:sort-by="sortBy"
    :headers="vuetifyHeaders"
    :items="value"
    :items-per-page-options="paginator ? rowsPerPageOptions : []"
    :no-data-text="emptyText"
    :class="['app-vuetify-datatable', { 'striped-rows': stripedRows }]"
    density="compact"
    :search="globalFilterValue"
  >
    <!-- Dynamic slots for headers -->
    <template v-for="(header, idx) in headersWithKeys" :key="idx" #[`header.${header.key}`]="{ column }">
      <slot :name="`header-${header.key}`" :column="column">
        <div
          class="px-3 py-2 text-xs font-semibold tracking-wide uppercase flex items-center gap-2 w-full h-full"
          style="color: #7c3aed; background-color: #f5f3ff; border-bottom: 2px solid rgba(124, 58, 237, 0.12);"
        >
          <span>{{ column.title }}</span>
          <i
            v-if="column.sortable !== false"
            :class="[
              'v-icon notranslate mdi',
              colSortOrder(header.key) === 'asc'
                ? 'mdi-arrow-up'
                : colSortOrder(header.key) === 'desc'
                ? 'mdi-arrow-down'
                : 'mdi-swap-vertical',
            ]"
            aria-hidden="true"
            :style="{
              fontSize: '1rem',
              lineHeight: '1',
              color: colSortOrder(header.key) ? '#7c3aed' : '#c4b5e3',
            }"
          ></i>
        </div>
      </slot>
    </template>

    <!-- Dynamic slots for items -->
    <template v-for="(header, idx) in headersWithKeys" :key="`item-${idx}`" #[`item.${header.key}`]="{ item }">
      <slot :name="`body-${header.key}`" :data="item.raw ?? item">
        {{ getValue(item.raw ?? item, header.field, header.emptyText) }}
      </slot>
    </template>

    <!-- Fallback for no data -->
    <template #no-data>
      <slot name="empty">{{ emptyText }}</slot>
    </template>

    <!-- Custom pagination controls (if paginator is true or dataset exceeds page size) -->
    <template v-if="showPaginator" #bottom>
      <div
        class="flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-slate-600 mt-3"
      >
        <div class="flex items-center gap-3">
          <span aria-live="polite">
            Mostrando {{ paginationInfo.startIndex }} – {{ paginationInfo.endIndex }} de
            {{ paginationInfo.totalItems }}
          </span>
        </div>
        <v-pagination
          v-model="currentPage"
          :length="pageCount"
          :total-visible="5"
          density="compact"
          class="flex items-center gap-1"
        ></v-pagination>
        <div class="flex items-center gap-3">
          <label for="rowsPerPageSelect" class="sr-only">Filas por página</label>
          <select
            id="rowsPerPageSelect"
            v-model.number="internalRowsPerPage"
            class="form-input w-auto text-sm"
          >
            <option v-for="opt in rowsPerPageOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

interface ColumnDef {
  key?: string;
  field?: string;
  label: string;
  sortable?: boolean;
  align?: string;
  emptyText?: string;
  headerClass?: string;
  bodyClass?: string;
}

interface FilterDef {
  global?: { value: string | null; matchMode: string };
}

interface Props {
  value?: any[];
  columns?: ColumnDef[];
  dataKey?: string;
  filters?: FilterDef | null;
  globalFilterFields?: string[];
  sortMode?: string | null;
  paginator?: boolean;
  rows?: number;
  rowsPerPageOptions?: number[];
  emptyText?: string;
  stripedRows?: boolean;
  showGridlines?: boolean;
  rowHover?: boolean;
  rowClass?: ((row: unknown) => string) | null;
  tableStyle?: string | null;
}

interface SortEntry {
  key: string;
  order: "asc" | "desc";
}

const props = withDefaults(defineProps<Props>(), {
  value: () => [],
  columns: () => [],
  dataKey: "id",
  filters: null,
  globalFilterFields: () => [],
  sortMode: null,
  paginator: false,
  rows: 10,
  rowsPerPageOptions: () => [10, 25, 50],
  emptyText: "No hay datos.",
  stripedRows: true,
  showGridlines: false,
  rowHover: false,
  rowClass: null,
  tableStyle: null,
});

const emit = defineEmits<{
  (e: "update:rows", value: number): void;
}>();

// Declare slot types explicitly to work around Vuetify template inference limits
// Slot types declared loosely — Vue SFC cannot resolve template-literal slot names
// from consumer templates. Consumers should cast slot props as needed.
defineSlots<Record<string, (props: Record<string, any>) => any>>();

const currentPage = ref<number>(1);
const internalRowsPerPage = ref<number>(props.rows);
const sortBy = ref<SortEntry[]>([]);

watch(
  () => props.rows,
  (newRows) => {
    internalRowsPerPage.value = newRows;
  }
);

watch(internalRowsPerPage, (newVal) => {
  emit("update:rows", newVal);
  currentPage.value = 1;
});

const vuetifyHeaders = computed(() => {
  return props.columns.map((col) => {
    const key = col.key || col.field || col.label;
    return {
      title: col.label,
      value: key,
      key: key,
      sortable: !!col.sortable,
      align: (col.align || "start") as "start" | "end" | "center",
      field: col.field,
      emptyText: col.emptyText,
      class: col.headerClass,
      cellClass: col.bodyClass,
    };
  });
});

const headersWithKeys = computed(() => {
  return props.columns.map((col) => ({
    key: col.key || col.field || col.label,
    field: col.field,
    emptyText: col.emptyText,
  }));
});

const globalFilterValue = computed(() => props.filters?.global?.value ?? "");

function getValue(obj: unknown, path: string | undefined, emptyText: string | undefined): string {
  if (!path) return "";
  const parts = path.split(".");
  let v: unknown = obj;
  for (const p of parts) {
    if (v == null) return emptyText ?? "";
    v = (v as Record<string, unknown>)[p];
  }
  return v == null ? (emptyText ?? "") : String(v);
}

const totalFilteredItems = computed(() => {
  if (!globalFilterValue.value) return props.value.length;

  const q = String(globalFilterValue.value).toLowerCase();
  const fields = props.globalFilterFields.length
    ? props.globalFilterFields
    : props.columns.map((c) => c.field).filter(Boolean) as string[];

  return props.value.filter((item: unknown) =>
    fields.some((f) => {
      const v = getValue(item, f, "");
      return v != null && String(v).toLowerCase().includes(q);
    })
  ).length;
});

const paginationInfo = computed(() => {
  const totalItems = totalFilteredItems.value;
  const startIndex = (currentPage.value - 1) * internalRowsPerPage.value + 1;
  const endIndex = Math.min(currentPage.value * internalRowsPerPage.value, totalItems);

  return { startIndex: totalItems === 0 ? 0 : startIndex, endIndex, totalItems };
});

const pageCount = computed(() => {
  const totalItems = totalFilteredItems.value;
  return totalItems === 0 ? 1 : Math.ceil(totalItems / internalRowsPerPage.value);
});

const showPaginator = computed(() => {
  try {
    const totalItems = totalFilteredItems.value;
    return props.paginator || totalItems > internalRowsPerPage.value;
  } catch (e) {
    return !!props.paginator;
  }
});

function colSortOrder(key: string): "asc" | "desc" | null {
  if (!key) return null;
  const entry = sortBy.value.find((s) => s.key === key) ?? null;
  if (!entry) return null;
  return entry.order ?? "asc";
}
</script>

<style scoped>
.app-vuetify-datatable :deep(.v-data-table__td) {
  padding: 8px 12px;
}

.app-vuetify-datatable :deep(.v-data-table__th) {
  padding: 0 !important;
}

/* Custom styles for pagination to match existing design if needed */
.app-vuetify-datatable :deep(.v-data-table-footer) {
  display: none; /* Hide default footer as we have a custom one */
}

/* Force light/surface colors to avoid dark theme leaking into table */
.app-vuetify-datatable :deep(.v-data-table),
.app-vuetify-datatable :deep(.v-data-table__wrapper),
.app-vuetify-datatable :deep(.v-data-table__thead),
.app-vuetify-datatable :deep(.v-data-table__tbody),
.app-vuetify-datatable :deep(.v-data-table__tr),
.app-vuetify-datatable :deep(.v-data-table__th),
.app-vuetify-datatable :deep(.v-data-table__th) {
  /* header styling handled in header slot */
}

/* Ensure Vuetify icons inside table are visible and aligned */
.app-vuetify-datatable :deep(.v-data-table__th .v-icon),
.app-vuetify-datatable :deep(.v-data-table__th .v-data-table__sort-icon),
.app-vuetify-datatable :deep(.v-data-table__th svg) {
  color: inherit !important;
  width: 1rem;
  height: 1rem;
  display: inline-block;
  vertical-align: middle;
}

/* Small spacing for header title and icon */
.app-vuetify-datatable :deep(.v-data-table__th) > * {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Slightly emphasize sorted icon */
.app-vuetify-datatable :deep(.v-data-table__th) .mdi-arrow-up,
.app-vuetify-datatable :deep(.v-data-table__th) .mdi-arrow-down {
  font-weight: 700 !important;
  color: #1f2937 !important;
}

/* Strong overrides to counteract global dark theme classes such as .v-theme--dark */
.v-theme--dark .app-vuetify-datatable :deep(.v-data-table__wrapper),
.v-theme--dark .app-vuetify-datatable :deep(.v-data-table__thead),
.v-theme--dark .app-vuetify-datatable :deep(.v-data-table__tbody),
.v-theme--dark .app-vuetify-datatable :deep(.v-data-table__tr),
.v-theme--dark .app-vuetify-datatable :deep(.v-data-table__th),
.v-theme--dark .app-vuetify-datatable :deep(.v-data-table__td) {
  background-color: #ffffff !important;
  color: #0f172a !important;
}

/* Also handle other potential theme tokens that set background on immediate table */
.v-theme--dark .app-vuetify-datatable,
.v-theme--dark .app-vuetify-datatable :deep(.v-data-table) {
  background-color: transparent !important;
}

/* Subtle border between rows — on td because table uses border-collapse: separate */
.app-vuetify-datatable :deep(.v-data-table__td) {
  border-bottom: 1px solid rgba(15, 23, 42, 0.06) !important;
}

.app-vuetify-datatable :deep(.v-data-table__tr:last-child .v-data-table__td) {
  border-bottom: none !important;
}

/* Force Vuetify theme variables locally to light values to counter dark themes */
.app-vuetify-datatable {
  --v-theme-surface: #ffffff !important;
  --v-theme-background: #ffffff !important;
  --v-theme-on-surface: #0f172a !important;
  --v-theme-surface-variant: #f8fafc !important;
}

/* Strongly force background/color on common Vuetify wrappers used by v-data-table */
.app-vuetify-datatable :deep(.v-sheet),
.app-vuetify-datatable :deep(.v-data-table),
.app-vuetify-datatable :deep(.v-data-table__wrapper),
.app-vuetify-datatable :deep(.v-data-table__thead),
.app-vuetify-datatable :deep(.v-data-table__tbody),
.app-vuetify-datatable :deep(.v-data-table__th),
.app-vuetify-datatable :deep(.v-data-table__td) {
  background-color: #ffffff !important;
  color: #0f172a !important;
  box-shadow: none !important;
  background-image: none !important;
}

/* Alternating row backgrounds for striped mode */
.app-vuetify-datatable.striped-rows :deep(.v-data-table__tr:nth-child(even) .v-data-table__td) {
  background-color: #f8fafc !important;
}

/* Ensure SVG/icon fills are visible */
.app-vuetify-datatable :deep(svg),
.app-vuetify-datatable :deep(path) {
  fill: currentColor !important;
  color: inherit !important;
}

/* If dark theme class persists on ancestor, target it specifically */
.v-theme--dark .app-vuetify-datatable,
.v-theme--dark .app-vuetify-datatable :deep(.v-data-table) {
  --v-theme-surface: #ffffff !important;
  --v-theme-background: #ffffff !important;
}

/* Ensure Vuetify font icons and svg icons are visible and correctly sized */
.app-vuetify-datatable :deep(.v-icon) {
  font-size: 1rem !important;
  line-height: 1 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  vertical-align: middle !important;
  color: inherit !important;
}

.app-vuetify-datatable :deep(.v-icon)::before {
  color: inherit !important;
  font-size: 1rem !important;
}

.app-vuetify-datatable :deep(.v-icon svg),
.app-vuetify-datatable :deep(.v-icon path) {
  width: 1em !important;
  height: 1em !important;
  fill: currentColor !important;
}

/* Paginador — alineado al diseño purple/violet del header */
.app-vuetify-datatable :deep(.v-pagination) {
  display: flex;
  align-items: center;
  gap: 1px;
}

.app-vuetify-datatable :deep(.v-pagination .v-btn) {
  min-width: 32px !important;
  height: 32px !important;
  padding: 0 4px !important;
  border-radius: 6px !important;
  font-size: 0.8125rem !important;
  font-weight: 500 !important;
  color: #475569 !important;
  background: transparent !important;
  box-shadow: none !important;
  transition: all 0.15s ease !important;
}

.app-vuetify-datatable :deep(.v-pagination .v-btn:hover) {
  background: #f5f3ff !important;
  color: #7c3aed !important;
}

.app-vuetify-datatable :deep(.v-pagination .v-btn--disabled) {
  opacity: 0.3 !important;
  pointer-events: none !important;
}

.app-vuetify-datatable :deep(.v-pagination .v-btn--disabled:hover) {
  background: transparent !important;
  color: #475569 !important;
}

.app-vuetify-datatable :deep(.v-pagination .v-btn--active),
.app-vuetify-datatable :deep(.v-pagination .v-btn.v-btn--density-compact--active) {
  background: #7c3aed !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  box-shadow: 0 1px 3px rgba(124, 58, 237, 0.3) !important;
}

.app-vuetify-datatable :deep(.v-pagination .v-btn--active:hover) {
  background: #6d28d9 !important;
}

.app-vuetify-datatable :deep(.v-pagination .v-btn .v-btn__content) {
  font-size: 0.8125rem !important;
}

.app-vuetify-datatable :deep(.v-pagination .v-btn .v-icon),
.app-vuetify-datatable :deep(.v-pagination .v-btn svg) {
  font-size: 1rem !important;
  color: inherit !important;
}

/* Selector de filas por página */
.app-vuetify-datatable :deep(select#rowsPerPageSelect) {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 28px 4px 10px;
  font-size: 0.8125rem;
  color: #475569;
  background: #ffffff url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23475569' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") no-repeat right 8px center/12px;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.app-vuetify-datatable :deep(select#rowsPerPageSelect:hover) {
  border-color: #7c3aed;
}

.app-vuetify-datatable :deep(select#rowsPerPageSelect:focus) {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
}

/* Texto informativo "Mostrando X – Y de Z" */
.app-vuetify-datatable :deep(.v-pagination__info),
.app-vuetify-datatable .text-slate-600 {
  font-size: 0.8125rem;
}
</style>
