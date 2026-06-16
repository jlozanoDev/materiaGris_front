<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBarLayout from "@/shared/components/TopBarLayout.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import UiVuetifyDataTable from "@/shared/components/UiVuetifyDataTable.vue";
import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";
import { useReportTemplate } from "@/modules/admin/report-template/presentation/composables/useReportTemplate";
import type { ReportTemplate } from "@/shared/types";

interface DataTableColumn {
  key: string;
  field?: string;
  label: string;
  sortable: boolean;
}

interface DataTableFilters {
  global: { value: string | null; matchMode: string };
}

interface BreadcrumbItem {
  text: string;
  icon?: string;
  to?: string;
}

const authStore = useAuthStore();
const router = useRouter();
const { logout } = useLogout();
const { templates, loading, error, fetchTemplates, deleteTemplate } = useReportTemplate();

const globalFilter = ref<string>("");
const filters = ref<DataTableFilters>({
  global: { value: null, matchMode: "contains" },
});
watch(globalFilter, (val: string) => {
  filters.value = { global: { value: val, matchMode: "contains" } };
});

const columns: DataTableColumn[] = [
  { key: "name", field: "name", label: "Nombre", sortable: true },
  { key: "description", field: "description", label: "Descripción", sortable: false },
  { key: "isActive", field: "isActive", label: "Activo", sortable: true },
  { key: "updatedAt", field: "updatedAt", label: "Última modificación", sortable: true },
  { key: "actions", label: "", sortable: false },
];

const localTemplates = ref<ReportTemplate[]>([]);

watch(
  templates,
  (v: ReportTemplate[]) => {
    localTemplates.value = (v || []).map((t: ReportTemplate) => ({ ...t }));
  },
  { immediate: true }
);

function navigateToCreate(): void {
  router.push({ name: "AdminReportTemplateCreate" });
}

function navigateToEdit(id: string | number): void {
  router.push({ name: "AdminReportTemplateEdit", params: { id: String(id) } });
}

async function handleDelete(id: string | number): Promise<void> {
  if (!confirm("¿Eliminar plantilla de informe?")) return;
  try {
    await deleteTemplate(id);
  } catch (e: any) {
    alert(e?.message || "Error al eliminar plantilla");
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

const breadcrumb: BreadcrumbItem[] = [
  { text: "Dashboard", icon: "pi pi-objects-column", to: "/" },
  { text: "Tipos de Informe", icon: "pi pi-file" },
];

onMounted(async () => {
  await authStore.fetchUser();
  fetchTemplates();
});
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#f5f3ff]">
    <AppSidebar />

    <div class="flex flex-1 min-w-0 overflow-hidden">
      <main class="flex flex-1 min-w-0 flex-col p-5 gap-5 min-h-0">
        <div class="flex flex-col gap-0 shrink-0 relative z-10">
          <Breadcrumb :items="breadcrumb" />
          <TopBarLayout
            :user="authStore.user"
            @logout="logout"
          />
        </div>

        <div class="flex-1 overflow-y-auto min-h-0">
          <div
            v-if="authStore.hasPermission('admin.reporttemplate.view')"
            class="card p-6 flex flex-col flex-1 min-h-0"
          >
            <h1 class="text-2xl font-bold mb-4 text-primary">
              <i class="pi pi-file text-primary" style="font-size: 1.1rem" aria-hidden="true"></i>
              Tipos de Informe
            </h1>

            <!-- Loading state -->
            <div v-if="loading" class="card p-6">
              <div class="flex items-center justify-between gap-3 mb-4">
                <div class="h-10 bg-slate-200 rounded-md flex-1 max-w-xs animate-pulse" />
                <div class="h-10 w-48 bg-slate-200 rounded-md animate-pulse" />
              </div>
              <div class="space-y-0">
                <div
                  v-for="i in 5"
                  :key="i"
                  class="flex items-center gap-4 py-3 border-b border-slate-100 last:border-b-0"
                >
                  <div class="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
                  <div class="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
                  <div class="h-4 bg-slate-200 rounded w-16 animate-pulse" />
                  <div class="h-4 bg-slate-200 rounded w-1/5 animate-pulse" />
                  <div class="h-8 w-20 bg-slate-200 rounded ml-auto animate-pulse" />
                </div>
              </div>
            </div>

            <!-- Error state -->
            <div
              v-else-if="error"
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <i class="pi pi-exclamation-triangle text-4xl text-red-400 mb-3" />
              <p class="text-lg text-red-600 font-medium mb-1">
                Error al cargar plantillas
              </p>
              <p class="text-sm text-slate-500 mb-4">
                {{ error instanceof Error ? error.message : "Intente nuevamente más tarde" }}
              </p>
              <button
                class="btn btn-primary"
                @click="fetchTemplates"
              >
                Reintentar
              </button>
            </div>

            <!-- Data state -->
            <div v-else>
              <div class="flex items-center justify-between gap-3 mb-3">
                <div class="relative flex-1 md:max-w-xs">
                  <i
                    class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-[#9690a8] text-sm pointer-events-none"
                  />
                  <input
                    v-model="globalFilter"
                    placeholder="Buscar plantillas..."
                    aria-label="Buscar plantillas"
                    class="form-input pl-9 pr-8"
                  />
                  <button
                    v-if="globalFilter"
                    type="button"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-[#9690a8] hover:text-[#6b6b7b] transition-colors"
                    @click="globalFilter = ''"
                  >
                    <i class="pi pi-times text-sm" />
                  </button>
                </div>
                <button
                  v-if="authStore.hasPermission('admin.reporttemplate.create')"
                  class="btn btn-primary whitespace-nowrap"
                  @click="navigateToCreate"
                >
                  + Nueva plantilla de informe
                </button>
              </div>

              <div class="flex-1 min-h-0">
                <UiVuetifyDataTable
                  class="templates-table"
                  :value="localTemplates"
                  data-key="id"
                  :filters="filters"
                  :global-filter-fields="['name', 'description']"
                  :columns="columns"
                  :paginator="true"
                  :rows="10"
                  :rows-per-page-options="[5, 10, 25, 50]"
                >
                  <template #body-name="{ data }">
                    <div class="px-3 py-2 text-sm font-medium">{{ data?.name }}</div>
                  </template>

                  <template #body-description="{ data }">
                    <div class="px-3 py-2 text-sm text-slate-600 truncate max-w-xs">
                      {{ data?.description || "-" }}
                    </div>
                  </template>

                  <template #body-isActive="{ data }">
                    <div class="px-3 py-2">
                      <span
                        class="badge"
                        :class="data?.isActive ? 'badge--success' : 'badge--error'"
                      >
                        {{ data?.isActive ? "Sí" : "No" }}
                      </span>
                    </div>
                  </template>

                  <template #body-updatedAt="{ data }">
                    <div class="px-3 py-2 text-sm text-slate-600">
                      {{ formatDate(data?.updatedAt) }}
                    </div>
                  </template>

                  <template #body-actions="{ data }">
                    <div class="px-3 py-2 flex items-center justify-end gap-1.5">
                      <button
                        v-if="authStore.hasPermission('admin.reporttemplate.update')"
                        data-action-btn
                        aria-label="Editar"
                        class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#f5f3ff] border border-[#ede9fe] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed] hover:shadow-sm transition-all duration-150 relative group"
                        @click="navigateToEdit(data?.id)"
                      >
                        <i class="pi pi-pencil text-xs" />
                        <span class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0b0817] text-white text-[11px] leading-none py-1.5 px-2.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-10 shadow-sm">Editar</span>
                      </button>
                      <button
                        v-if="authStore.hasPermission('admin.reporttemplate.delete')"
                        data-action-btn
                        aria-label="Eliminar"
                        class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-sm transition-all duration-150 relative group"
                        @click="handleDelete(data?.id)"
                      >
                        <i class="pi pi-trash text-xs" />
                        <span class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0b0817] text-white text-[11px] leading-none py-1.5 px-2.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-10 shadow-sm">Eliminar</span>
                      </button>
                    </div>
                  </template>

                  <template #empty>
                    <div class="px-3 py-4 text-center text-[#9690a8]">
                      No hay plantillas de informe para mostrar.
                    </div>
                  </template>
                </UiVuetifyDataTable>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.templates-table :deep(.v-data-table__table > thead > tr > th) {
  padding: 0 !important;
  height: auto !important;
  background-color: #f5f3ff !important;
  border: none !important;
}

.templates-table :deep(.v-data-table__table > thead > tr > th > div) {
  padding: 10px 12px;
  color: #7c3aed !important;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-bottom: 2px solid rgba(124, 58, 237, 0.12);
  width: 100% !important;
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  box-sizing: border-box;
}

.templates-table :deep(.v-data-table__table > thead > tr > th .mdi-swap-vertical) {
  color: #c4b5e3 !important;
}

.templates-table :deep(.v-data-table__table > thead > tr > th .mdi-arrow-up),
.templates-table :deep(.v-data-table__table > thead > tr > th .mdi-arrow-down) {
  color: #7c3aed !important;
}

.templates-table :deep(.v-data-table__table > tbody > tr) {
  background-color: #ffffff !important;
  transition: background-color 0.12s ease;
}

.templates-table :deep(.v-data-table__table > tbody > tr:hover) {
  background-color: #faf9ff !important;
}

.templates-table :deep(.v-data-table__table > tbody > tr:nth-child(even)) {
  background-color: #fcfbff !important;
}

.templates-table :deep(.v-data-table__table > tbody > tr:nth-child(even):hover) {
  background-color: #f6f3ff !important;
}

.templates-table :deep(.v-data-table__table > tbody > tr > td) {
  border-bottom: 1px solid rgba(124, 58, 237, 0.05) !important;
  padding: 10px 12px !important;
}

.templates-table :deep(.v-data-table__table > tbody > tr:last-child > td) {
  border-bottom: none !important;
}
</style>
