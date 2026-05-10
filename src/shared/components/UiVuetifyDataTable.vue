<template>
  <v-data-table
    v-model:items-per-page="internalRowsPerPage"
    v-model:page="currentPage"
    v-model:sort-by="sortBy"
    :headers="vuetifyHeaders"
    :items="value"
    :items-per-page-options="paginator ? rowsPerPageOptions : []"
    :no-data-text="emptyText"
    class="app-vuetify-datatable"
    density="compact"
    :search="globalFilterValue"
  >
    <!-- Dynamic slots for headers -->
    <template v-for="(header, idx) in headersWithKeys" :key="idx" #[`header.${header.key}`]="{ column }">
      <slot :name="`header-${header.key}`" :column="column">
        <div
          class="px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 inline-flex items-center gap-2"
        >
          <span>{{ column.title }}</span>
          <i
            v-if="column.sortable !== false"
            :class="[
              'v-icon notranslate mdi',
              colSortOrder(header.key) === 'asc'
                ? 'mdi-arrow-up text-indigo-600'
                : colSortOrder(header.key) === 'desc'
                ? 'mdi-arrow-down text-indigo-600'
                : 'mdi-swap-vertical text-slate-400',
            ]"
            aria-hidden="true"
            style="font-size: 1rem; line-height: 1"
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

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  value: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  dataKey: { type: String, default: "id" },
  filters: { type: Object, default: null },
  globalFilterFields: { type: Array, default: () => [] },
  sortMode: { type: String, default: null }, // Not directly used by v-data-table but kept for API compatibility
  paginator: { type: Boolean, default: false },
  rows: { type: Number, default: 10 },
  rowsPerPageOptions: { type: Array, default: () => [10, 25, 50] },
  emptyText: { type: String, default: "No hay datos." },
  // Additional props from UiDataTable for styling, not directly mapped to v-data-table but good to keep in mind
  stripedRows: { type: Boolean, default: false },
  showGridlines: { type: Boolean, default: false },
  rowHover: { type: Boolean, default: false },
  rowClass: { type: Function, default: null },
  tableStyle: { type: String, default: null },
});

const emit = defineEmits(["update:rows"]);

// Internal state for pagination and sorting
const currentPage = ref(1);
const internalRowsPerPage = ref(props.rows);
const sortBy = ref([]); // For v-data-table sort-by prop. In Vuetify 4 each entry is { key, order: 'asc'|'desc' }

// Watch for changes in props.rows and update internalRowsPerPage
watch(
  () => props.rows,
  (newRows) => {
    internalRowsPerPage.value = newRows;
  }
);

// Emit update:rows when internalRowsPerPage changes
watch(internalRowsPerPage, (newVal) => {
  emit("update:rows", newVal);
  // Reset to first page when items per page changes
  currentPage.value = 1;
});

// Mapear las columnas a un formato compatible con v-data-table
const vuetifyHeaders = computed(() => {
  return props.columns.map((col) => {
    const key = col.key || col.field || col.label;
    return {
      title: col.label,
      value: key, // This is important for data access and sorting
      key: key, // Also use key for slot naming
      sortable: !!col.sortable,
      align: col.align || "start",
      // Vuetify v-data-table doesn't have a direct 'field' prop in headers
      // We can add it to meta if needed for custom slot logic, but 'value' is primary
      field: col.field, // Keep for displayValue function
      emptyText: col.emptyText, // Keep for displayValue function
      class: col.headerClass, // Apply custom classes to header cells
      cellClass: col.bodyClass, // Apply custom classes to data cells (might need custom slot)
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

// Global filter value from props.filters
const globalFilterValue = computed(() => props.filters?.global?.value ?? "");

// Custom getValue function, similar to the original UiDataTable
function getValue(obj, path, emptyText) {
  if (!path) return "";
  const parts = path.split(".");
  let v = obj;
  for (const p of parts) {
    if (v == null) return emptyText ?? "";
    v = v[p];
  }
  return v == null ? emptyText ?? "" : v;
}

// Custom pagination info calculation (now driven by v-data-table's items-per-page and filtered/sorted items)
const totalFilteredItems = computed(() => {
  // This is a simplified approach. In a real scenario, you might need to
  // capture `v-data-table`'s `@update:current-items` or similar events
  // to get the exact count of filtered items. For now, we'll estimate
  // by applying the global filter to the original value.
  if (!globalFilterValue.value) return props.value.length;

  const q = String(globalFilterValue.value).toLowerCase();
  const fields = props.globalFilterFields.length
    ? props.globalFilterFields
    : props.columns.map((c) => c.field).filter(Boolean);

  return props.value.filter((item) =>
    fields.some((f) => {
      const v = getValue(item, f);
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

// Show paginator if explicitly requested or when the dataset is larger than one page
const showPaginator = computed(() => {
  try {
    const totalItems = totalFilteredItems.value;
    return props.paginator || totalItems > internalRowsPerPage.value;
  } catch (e) {
    return !!props.paginator;
  }
});

// Vuetify 4: sortBy is [{key, order: 'asc'|'desc'}]
function colSortOrder(key) {
  if (!key) return null;
  const entry = Array.isArray(sortBy.value)
    ? sortBy.value.find((s) => s.key === key || s === key)
    : null;
  if (!entry) return null;
  // entry may be a string (Vuetify 3 compat) or object
  return typeof entry === "object" ? entry.order ?? "asc" : "asc";
}
</script>

<style scoped>
.app-vuetify-datatable :deep(.v-data-table__td) {
  padding: 8px 12px; /* Adjust padding to match original UiDataTable px-3 py-2 */
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
.app-vuetify-datatable :deep(.v-data-table__th) :deep(.v-icon),
.app-vuetify-datatable :deep(.v-data-table__th) :deep(.v-data-table__sort-icon),
.app-vuetify-datatable :deep(.v-data-table__th) :deep(svg) {
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

/* Add subtle borders to separate rows when dark theme would remove them */
.app-vuetify-datatable :deep(.v-data-table__td) {
  border-color: rgba(15, 23, 42, 0.04) !important;
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
.app-vuetify-datatable :deep(.v-data-table__tr),
.app-vuetify-datatable :deep(.v-data-table__th),
.app-vuetify-datatable :deep(.v-data-table__td) {
  background-color: #ffffff !important;
  color: #0f172a !important;
  box-shadow: none !important;
  background-image: none !important;
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

.app-vuetify-datatable :deep(.v-icon) :deep(svg),
.app-vuetify-datatable :deep(.v-icon) :deep(path) {
  width: 1em !important;
  height: 1em !important;
  fill: currentColor !important;
}

/* Target pagination icons specifically */
.app-vuetify-datatable :deep(.v-pagination) :deep(.v-btn) :deep(.v-icon),
.app-vuetify-datatable :deep(.v-pagination) :deep(.v-btn) :deep(svg) {
  font-size: 0.95rem !important;
  color: inherit !important;
}
/* Header styling is handled by Tailwind classes in the header slot */
</style>
