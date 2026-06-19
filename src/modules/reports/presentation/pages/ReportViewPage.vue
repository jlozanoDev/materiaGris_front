<template>
  <div class="flex min-h-screen bg-gray-50">
    <AppSidebar />
    <div class="flex-1 p-6">
      <TopBarLayout :user="authStore.user" @logout="logout" />
      <Breadcrumb :items="breadcrumbItems" />

      <div class="mt-6">
        <!-- Loading -->
        <div v-if="!report" class="text-center py-12 text-gray-500">
          Cargando informe...
        </div>

        <template v-else>
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-gray-900">Informe — Vista</h1>

            <div class="flex gap-3">
              <!-- Descargar PDF (solo si signed/closed + permiso) -->
              <button
                v-if="canDownloadPdf && (report.status === 'signed' || report.status === 'closed')"
                type="button"
                class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="handleDownloadPdf"
              >
                Descargar PDF
              </button>

              <!-- Volver -->
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="goBack"
              >
                Volver al listado
              </button>
            </div>
          </div>

          <!-- Read-only form -->
          <DynamicFormRenderer
            v-if="report.templateStructureSnapshot"
            :sections="report.templateStructureSnapshot.sections"
            :header-sections="report.templateStructureSnapshot.header?.enabled ? report.templateStructureSnapshot.header.sections : undefined"
            :footer-sections="report.templateStructureSnapshot.footer?.enabled ? report.templateStructureSnapshot.footer.sections : undefined"
            :model-value="report.values || {}"
            :is-editable="false"
            @update:model-value="() => {}"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBarLayout from "@/shared/components/TopBarLayout.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import DynamicFormRenderer from "@/modules/reports/presentation/components/DynamicFormRenderer.vue";
import { useReportForm } from "@/modules/reports/presentation/composables/useReportForm";
import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { logout } = useLogout();

const { report, loadReport, downloadPdf } = useReportForm();

const breadcrumbItems = computed(() => [
  { text: "Informes", to: "/informes" },
  { text: report.value ? `Informe #${report.value.id}` : "Ver" },
]);

const canDownloadPdf = computed(() => authStore.hasPermission("report.download-pdf"));

async function handleDownloadPdf(): Promise<void> {
  try {
    await downloadPdf();
  } catch (e: any) {
    alert(e.message || "Error al generar el PDF");
  }
}

function goBack(): void {
  if (route.query.from === "patient") {
    const patientId = route.query.patientId as string;
    if (patientId) {
      router.push(`/patients/${patientId}?tab=reports`);
      return;
    }
  }
  router.push({ name: "ReportList" });
}

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    await loadReport(id);
  }
});
</script>
