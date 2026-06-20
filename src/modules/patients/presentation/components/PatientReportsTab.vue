<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useReportList } from "@/modules/reports/presentation/composables/useReportList";
import { useTemplateList } from "@/modules/reports/presentation/composables/useTemplateList";
import { useAuthStore } from "@/core/store/auth";
import TemplatePickerModal from "@/modules/reports/presentation/components/TemplatePickerModal.vue";
import CustomSelect from "@/shared/components/CustomSelect.vue";
import Modal from "@/shared/components/Modal.vue";
import type { ReportStatus, ReportTemplate } from "@/shared/types";

const props = defineProps<{
  patientId: string | number;
}>();

const router = useRouter();
const authStore = useAuthStore();
const { reports, loading, error, fetchReports, deleteReport } = useReportList();
const { templates, fetchActive: fetchTemplates } = useTemplateList();

const showModal = ref(false);
const canCreate = computed(() => authStore.hasPermission("report.create"));
const canEdit = computed(() => authStore.hasPermission("report.edit"));
const templatesAvailable = computed(() => templates.value.length > 0);

const filterSearch = ref("");
const filterStatus = ref("");
const currentPage = ref(1);
const perPage = 20;
const showDeleteModal = ref(false);
const reportToDelete = ref<string | number | null>(null);

onMounted(() => {
  fetchReports({ patient_id: props.patientId });
  fetchTemplates();
});

function statusBadgeClass(status: ReportStatus): string {
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

function statusLabel(status: ReportStatus): string {
  switch (status) {
    case "draft":
      return "Borrador";
    case "signed":
      return "Firmado";
    case "closed":
      return "Cerrado";
    default:
      return status;
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "-";
  }
}

function goToNewReport(): void {
  showModal.value = true;
}

function handleSelectTemplate(template: ReportTemplate): void {
  showModal.value = false;
  router.push({
    name: "ReportCreate",
    params: { id: props.patientId },
    query: { templateId: template.id },
  });
}

function handleCloseModal(): void {
  showModal.value = false;
}

function viewReport(reportId: string): void {
  router.push({
    name: "ReportView",
    params: { id: reportId },
    query: { from: "patient", patientId: String(props.patientId) },
  });
}

function editReport(reportId: string): void {
  router.push({ name: "ReportEdit", params: { id: reportId } });
}

function openDeleteModal(id: string | number): void {
  reportToDelete.value = id;
  showDeleteModal.value = true;
}

function cancelDelete(): void {
  showDeleteModal.value = false;
  reportToDelete.value = null;
}

async function confirmDelete(): Promise<void> {
  if (reportToDelete.value == null) return;
  await deleteReport(reportToDelete.value);
  cancelDelete();
}

// Client-side search filter
const filteredReports = computed(() => {
  const search = filterSearch.value.toLowerCase().trim();
  const status = filterStatus.value;
  return reports.value.filter((r) => {
    if (status && r.status !== status) return false;
    if (search) {
      const author = (r.author_name ?? "").toLowerCase();
      const template = (r.template_name ?? "").toLowerCase();
      if (!author.includes(search) && !template.includes(search)) return false;
    }
    return true;
  });
});

const totalPages = computed(() => Math.ceil(filteredReports.value.length / perPage));

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredReports.value.slice(start, start + perPage);
});
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-3 py-4">
      <div
        v-for="i in 3"
        :key="i"
        class="h-16 bg-slate-200 rounded-xl animate-pulse"
      ></div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center py-8 text-center"
    >
      <i class="pi pi-exclamation-triangle text-red-400 text-3xl mb-3"></i>
      <p class="text-slate-600 text-sm mb-2">
        Error al cargar los informes clínicos
      </p>
      <button
        class="text-indigo-600 text-sm underline hover:text-indigo-800"
        @click="fetchReports({ patient_id: props.patientId })"
      >
        Reintentar
      </button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="reports.length === 0"
      class="flex flex-col items-center justify-center py-8 text-center"
    >
      <i class="pi pi-file text-slate-300 text-3xl mb-3"></i>
      <p class="text-slate-500 text-sm mb-4">
        No hay informes clínicos para este paciente
      </p>
      <button
        v-if="canCreate"
        :disabled="!templatesAvailable"
        class="px-4 py-2 rounded-2xl text-sm font-medium text-white"
        :class="templatesAvailable ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'"
        @click="goToNewReport"
      >
        + Nuevo informe
      </button>
    </div>

    <!-- Reports table -->
    <div v-else class="flex flex-col">
      <!-- Top bar -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3 flex-1 mr-4">
          <input
            v-model="filterSearch"
            type="text"
            placeholder="Buscar por autor o plantilla..."
            class="flex-1 rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            @input="currentPage = 1"
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
            @change="currentPage = 1"
          />
        </div>
        <button
          v-if="canCreate"
          :disabled="!templatesAvailable"
          class="px-4 py-2 rounded-2xl text-sm font-medium text-white whitespace-nowrap"
          :class="templatesAvailable ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'"
          @click="goToNewReport"
        >
          + Nuevo informe
        </button>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50">
            <tr>
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
                  <button
                    v-if="canEdit && report.status === 'draft'"
                    type="button"
                    class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#fef2f2] border border-[#fee2e2] text-[#dc2626] hover:bg-[#dc2626] hover:text-white hover:border-[#dc2626] hover:shadow-sm transition-all duration-150"
                    title="Eliminar"
                          @click="openDeleteModal(report.id)"
                  >
                    <i class="pi pi-trash text-xs" />
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
    </div>

    <!-- Delete confirmation modal -->
    <Modal
      :show="showDeleteModal"
      title="Eliminar informe"
      size="sm"
      :close-on-backdrop="false"
      @close="cancelDelete"
    >
      <p class="text-[#6b6b7b] text-sm">
        ¿Estás seguro de eliminar este informe? Esta acción no se puede deshacer.
      </p>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            class="btn btn-outline btn-sm"
            @click="cancelDelete"
          >
            Cancelar
          </button>
          <button
            class="btn bg-red-500 hover:bg-red-600 text-white btn-sm"
            @click="confirmDelete"
          >
            Eliminar
          </button>
        </div>
      </template>
    </Modal>

    <!-- Template picker modal -->
    <TemplatePickerModal
      :show="showModal"
      :patient-id="props.patientId"
      @select="handleSelectTemplate"
      @close="handleCloseModal"
    />
  </div>
</template>
