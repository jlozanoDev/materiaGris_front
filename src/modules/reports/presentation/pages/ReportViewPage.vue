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
              { text: 'Informes', icon: 'pi pi-file', to: '/reports' },
              { text: breadcrumbText, icon: 'pi pi-file' },
            ]"
          />
        </div>

        <!-- Loading -->
        <div
          v-if="!report"
          class="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4"
        >
          <div class="h-8 w-48 bg-slate-200 rounded-md animate-pulse" />
          <div class="space-y-3 mt-2">
            <div
              v-for="i in 4"
              :key="i"
              class="h-24 bg-slate-200 rounded-2xl animate-pulse"
            />
          </div>
        </div>

        <template v-else>
          <div class="bg-white rounded-2xl shadow-sm p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-xl font-bold text-slate-800">
                Informe #{{ report.id }}
              </h1>

              <div class="flex gap-3">
                <!-- Editar (solo si draft + permiso) -->
                <button
                  v-if="canEdit && report.status === 'draft'"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  @click="editReport"
                >
                  <i class="pi pi-pencil text-xs"></i>
                  Editar
                </button>

                <!-- Imprimir (deshabilitado temporalmente) -->
                <button
                  v-if="false"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  @click="handlePrint"
                >
                  <i class="pi pi-print text-xs"></i>
                  Imprimir
                </button>

                <!-- Volver -->
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  @click="goBack"
                >
                  <i class="pi pi-arrow-left text-xs"></i>
                  Volver
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
          </div>
        </template>
      </main>
    </div>
  </div>

  <!-- Printing skeleton overlay -->
  <div
    v-if="isPrinting"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
  >
    <div class="h-12 w-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
    <p class="mt-4 text-sm font-medium text-slate-700">Preparando impresión...</p>
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

const { report, loadReport, printReport, isPrinting } = useReportForm();

const canPrint = computed(() => authStore.hasPermission("report.download-pdf"));
const canEdit = computed(() => authStore.hasPermission("report.edit"));

async function handlePrint(): Promise<void> {
  try {
    await printReport();
  } catch (e: any) {
    alert(e.message || "Error al preparar la impresión");
  }
}

function formatDateShort(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const breadcrumbText = computed(() => {
  if (!report.value) return "Ver";
  const template = report.value.template_name ?? "";
  const name = report.value.patient_name ?? "";
  const date = formatDateShort(report.value.createdAt);
  const patientStr = name && date ? `${name} - ${date}` : (name || date || "");
  if (template && patientStr) return `${template} (${patientStr})`;
  if (template) return template;
  if (patientStr) return patientStr;
  return "Ver";
});

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

function editReport(): void {
  router.push({ name: "ReportEdit", params: { id: route.params.id } });
}

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    await loadReport(id);
  }
});
</script>
