<template>
  <div class="flex min-h-screen bg-gray-50">
    <AppSidebar />
    <div class="flex-1 p-6">
      <TopBar />
      <Breadcrumb :items="breadcrumbItems" />

      <div class="mt-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Informes</h1>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-12 text-gray-500">
          Cargando informes...
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-600 mb-4">Error al cargar los informes</p>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            @click="applyFilters()"
          >
            Reintentar
          </button>
        </div>

        <!-- Empty -->
        <div v-else-if="reports.length === 0" class="text-center py-12">
          <p class="text-gray-500 mb-2">No hay informes registrados</p>
          <p class="text-sm text-gray-400">Los médicos pueden iniciar informes desde la ficha del paciente</p>
        </div>

        <!-- Table -->
        <div v-else class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Filters -->
          <div class="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
            <select
              v-model="filterStatus"
              class="rounded-md border border-gray-300 px-3 py-2 text-sm"
              @change="applyFilters"
            >
              <option value="">Todos</option>
              <option value="draft">Borrador</option>
              <option value="signed">Firmado</option>
              <option value="closed">Cerrado</option>
            </select>

            <input
              v-model="filterPatient"
              type="text"
              placeholder="Buscar paciente..."
              class="rounded-md border border-gray-300 px-3 py-2 text-sm w-60"
              @input="debouncedSearch"
            />
          </div>

          <!-- Table -->
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-gray-700">Paciente</th>
                <th class="px-4 py-3 text-left font-medium text-gray-700">Autor</th>
                <th class="px-4 py-3 text-left font-medium text-gray-700">Plantilla</th>
                <th class="px-4 py-3 text-left font-medium text-gray-700">Estado</th>
                <th class="px-4 py-3 text-left font-medium text-gray-700">Creado</th>
                <th class="px-4 py-3 text-left font-medium text-gray-700">Última mod.</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="report in paginatedReports"
                :key="report.id"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-3">{{ report.patient_name }}</td>
                <td class="px-4 py-3">{{ report.author_name }}</td>
                <td class="px-4 py-3">{{ report.template_name }}</td>
                <td class="px-4 py-3">
                  <span :class="statusBadgeClass(report.status)">
                    {{ statusLabel(report.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ formatDate(report.createdAt) }}</td>
                <td class="px-4 py-3 text-gray-500">{{ formatDate(report.updatedAt) }}</td>
                <td class="px-4 py-3">
                  <button
                    type="button"
                    class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    @click="viewReport(report.id)"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div
            v-if="totalPages > 1"
            class="flex items-center justify-between border-t border-gray-200 px-4 py-3"
          >
            <span class="text-sm text-gray-500">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
            <div class="flex gap-2">
              <button
                :disabled="currentPage <= 1"
                class="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                @click="currentPage--"
              >
                Anterior
              </button>
              <button
                :disabled="currentPage >= totalPages"
                class="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                @click="currentPage++"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBar from "@/shared/components/TopBar.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import { useReportList } from "@/modules/reports/presentation/composables/useReportList";

const router = useRouter();
const { reports, loading, error, fetchReports } = useReportList();

const breadcrumbItems = [{ text: "Informes" }];

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
      return `${base} bg-gray-100 text-gray-800`;
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

onMounted(() => {
  fetchReports();
});
</script>
