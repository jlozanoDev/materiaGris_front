<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useReportList } from "@/modules/reports/presentation/composables/useReportList";
import type { ReportStatus } from "@/shared/types";

const props = defineProps<{
  patientId: string | number;
}>();

const router = useRouter();
const { reports, loading, error, fetchReports } = useReportList();

onMounted(() => {
  fetchReports({ patient_id: props.patientId });
});

function statusBadgeClass(status: ReportStatus): string {
  switch (status) {
    case "draft":
      return "bg-amber-100 text-amber-800";
    case "signed":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-600";
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

function goToNewReport(): void {
  router.push({ name: "ReportCreate", params: { id: props.patientId } });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="flex flex-col gap-3 py-4">
      <div
        v-for="i in 3"
        :key="i"
        class="h-16 bg-slate-200 rounded-xl animate-pulse"
      ></div>
    </div>

    <!-- Error state -->
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

    <!-- Empty state -->
    <div
      v-else-if="reports.length === 0"
      class="flex flex-col items-center justify-center py-8 text-center"
    >
      <i class="pi pi-file text-slate-300 text-3xl mb-3"></i>
      <p class="text-slate-500 text-sm mb-4">
        No hay informes clínicos para este paciente
      </p>
      <button
        class="px-4 py-2 rounded-2xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        @click="goToNewReport"
      >
        + Nuevo informe
      </button>
    </div>

    <!-- Reports list -->
    <div v-else class="space-y-2">
      <div class="flex justify-end mb-3">
        <button
          class="px-4 py-2 rounded-2xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          @click="goToNewReport"
        >
          + Nuevo informe
        </button>
      </div>

      <div
        v-for="report in reports"
        :key="report.id"
        class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-100 transition"
      >
        <div class="flex flex-col gap-1">
          <span class="text-sm font-medium text-slate-800">
            {{ report.template_name || "Informe clínico" }}
          </span>
          <span class="text-xs text-slate-400">
            {{ formatDate(report.createdAt) }}
          </span>
        </div>
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="statusBadgeClass(report.status)"
        >
          {{ statusLabel(report.status) }}
        </span>
      </div>
    </div>
  </div>
</template>
