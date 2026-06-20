<template>
  <div class="flex h-screen overflow-hidden bg-[#EEF2FF]">
    <AppSidebar />

    <div class="flex flex-1 min-w-0 overflow-hidden">
      <main class="flex flex-1 min-w-0 flex-col overflow-y-auto p-5 gap-5">
        <div class="flex flex-col gap-0">
          <TopBarLayout :user="authStore.user" @logout="logout" />
          <Breadcrumb
            :items="[
              { text: 'Dashboard', icon: 'pi pi-objects-column', to: '/' },
              { text: 'Informes', icon: 'pi pi-file' },
            ]"
          />
        </div>

        <div class="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl text-indigo-600 font-bold">
              <i
                class="pi pi-file text-indigo-600"
                style="font-size: 1.1rem"
                aria-hidden="true"
              ></i>
              Informes
            </h1>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-12 text-gray-500">
            Cargando informes...
          </div>

          <!-- Error -->
          <div
            v-else-if="error"
            class="flex flex-col items-center justify-center py-12"
          >
            <i class="pi pi-exclamation-triangle text-slate-300 text-5xl mb-4"></i>
            <p class="text-slate-500 text-center">
              Error al cargar los informes
            </p>
            <button
              type="button"
              class="mt-4 px-4 py-2 rounded-2xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              @click="applyFilters()"
            >
              Reintentar
            </button>
          </div>

          <!-- Empty -->
          <div
            v-else-if="reports.length === 0"
            class="flex flex-col items-center justify-center py-12"
          >
            <i class="pi pi-file text-slate-300 text-5xl mb-4"></i>
            <p class="text-slate-500 mb-2">No hay informes registrados</p>
            <p class="text-sm text-slate-400">
              Los médicos pueden iniciar informes desde la ficha del paciente
            </p>
          </div>

          <!-- Content -->
          <template v-else>
            <!-- Filters -->
            <div class="flex items-center gap-3 mb-3">
              <input
                v-model="filterPatient"
                type="text"
                placeholder="Buscar paciente..."
                class="flex-1 rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                @input="debouncedSearch"
              />
              <CustomSelect
                v-model="filterStatus"
                :options="[
                  { value: '', label: 'Todos' },
                  { value: 'draft', label: 'Borrador' },
                  { value: 'signed', label: 'Firmado' },
                  { value: 'closed', label: 'Cerrado' },
                ]"
                class="w-44"
                @change="applyFilters"
              />
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-3 text-left font-medium text-slate-600">Paciente</th>
                    <th class="px-4 py-3 text-left font-medium text-slate-600">Autor</th>
                    <th class="px-4 py-3 text-left font-medium text-slate-600">Plantilla</th>
                    <th class="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
                    <th class="px-4 py-3 text-left font-medium text-slate-600">Creado</th>
                    <th class="px-4 py-3 text-left font-medium text-slate-600">Última mod.</th>
                    <th class="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="report in paginatedReports"
                    :key="report.id"
                    class="hover:bg-slate-50"
                  >
                    <td class="px-4 py-3 text-slate-700">{{ report.patient_name }}</td>
                    <td class="px-4 py-3 text-slate-700">{{ report.author_name }}</td>
                    <td class="px-4 py-3 text-slate-700">{{ report.template_name }}</td>
                    <td class="px-4 py-3">
                      <span :class="statusBadgeClass(report.status)">
                        {{ statusLabel(report.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-slate-500">{{ formatDate(report.createdAt) }}</td>
                    <td class="px-4 py-3 text-slate-500">{{ formatDate(report.updatedAt) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          v-if="canEdit && report.status === 'draft'"
                          type="button"
                          class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#f5f3ff] border border-[#ede9fe] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed] hover:shadow-sm transition-all duration-150"
                          title="Editar"
                          @click="editReport(report.id)"
                        >
                          <i class="pi pi-pencil text-xs" />
                        </button>
                        <button
                          type="button"
                          class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#f5f3ff] border border-[#ede9fe] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed] hover:shadow-sm transition-all duration-150"
                          title="Ver"
                          @click="viewReport(report.id)"
                        >
                          <i class="pi pi-eye text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div
              v-if="totalPages > 1"
              class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100"
            >
              <span class="text-sm text-slate-500">
                Página {{ currentPage }} de {{ totalPages }}
              </span>
              <div class="flex gap-2">
                <button
                  :disabled="currentPage <= 1"
                  class="rounded-2xl border border-slate-200 px-3 py-1 text-sm disabled:opacity-50 hover:bg-slate-50"
                  @click="currentPage--"
                >
                  Anterior
                </button>
                <button
                  :disabled="currentPage >= totalPages"
                  class="rounded-2xl border border-slate-200 px-3 py-1 text-sm disabled:opacity-50 hover:bg-slate-50"
                  @click="currentPage++"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBarLayout from "@/shared/components/TopBarLayout.vue";
import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import CustomSelect from "@/shared/components/CustomSelect.vue";
import { useReportList } from "@/modules/reports/presentation/composables/useReportList";

const router = useRouter();
const authStore = useAuthStore();
const { logout } = useLogout();
const { reports, loading, error, fetchReports } = useReportList();

const filterStatus = ref("");
const filterPatient = ref("");
const currentPage = ref(1);
const perPage = 20;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedSearch(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    applyFilters();
  }, 300);
}

function applyFilters(): void {
  const filters: Record<string, unknown> = {};
  if (filterStatus.value) filters.status = filterStatus.value;
  if (filterPatient.value) filters.patient = filterPatient.value;
  currentPage.value = 1;
  fetchReports(filters);
}

const filteredReports = computed(() => reports.value);

const totalPages = computed(() => Math.ceil(filteredReports.value.length / perPage));

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredReports.value.slice(start, start + perPage);
});

function statusLabel(status: string): string {
  const map: Record<string, string> = { draft: "Borrador", signed: "Firmado", closed: "Cerrado" };
  return map[status] ?? status;
}

function statusBadgeClass(status: string): string {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  switch (status) {
    case "draft":
      return `${base} bg-yellow-100 text-yellow-800`;
    case "signed":
      return `${base} bg-green-100 text-green-800`;
    case "closed":
      return `${base} bg-gray-100 text-[#1f2937]`;
    default:
      return `${base} bg-gray-100 text-gray-600`;
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function viewReport(id: string | number): void {
  router.push({ name: "ReportView", params: { id: String(id) } });
}

const canEdit = computed(() => authStore.hasPermission("report.edit"));

function editReport(id: string | number): void {
  router.push({ name: "ReportEdit", params: { id: String(id) } });
}

onMounted(() => {
  authStore.fetchUser();
  fetchReports();
});
</script>
