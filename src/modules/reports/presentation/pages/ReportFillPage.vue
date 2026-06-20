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
              { text: report ? `Informe #${report.id}` : 'Nuevo', icon: 'pi pi-file' },
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
              <div class="flex items-center gap-4">
                <button
                  v-if="isCreateFlow"
                  type="button"
                  class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
                  @click="handleBack"
                >
                  <i class="pi pi-arrow-left text-xs"></i>
                  Volver
                </button>
                <h1 class="text-xl font-bold text-slate-800">
                  {{ report.status === "draft" ? "Completar Informe" : "Informe" }}
                </h1>
              </div>

              <div class="flex gap-3">
                <!-- Guardar borrador -->
                <button
                  v-if="canEdit"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  :disabled="isSaving"
                  @click="handleSave"
                >
                  <i class="pi pi-save text-xs"></i>
                  {{ isSaving ? "Guardando..." : "Guardar borrador" }}
                </button>

                <!-- Firmar -->
                <button
                  v-if="canSign && report.status === 'draft'"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  @click="handleSign"
                >
                  <i class="pi pi-check text-xs"></i>
                  Firmar informe
                </button>

                <!-- Cerrar -->
                <button
                  v-if="canClose && report.status === 'signed'"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-2xl bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  @click="handleClose"
                >
                  <i class="pi pi-lock text-xs"></i>
                  Cerrar informe
                </button>

                <!-- Descargar PDF -->
                <button
                  v-if="canDownloadPdf && (report.status === 'signed' || report.status === 'closed')"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  @click="handleDownloadPdf"
                >
                  <i class="pi pi-download text-xs"></i>
                  Descargar PDF
                </button>
              </div>
            </div>

            <!-- Validation errors -->
            <div
              v-if="Object.keys(errors).length > 0"
              class="mb-6 rounded-2xl bg-red-50 p-4"
            >
              <p class="text-sm font-medium text-red-800 mb-2">Complete los campos obligatorios:</p>
              <ul class="list-disc list-inside text-sm text-red-700">
                <li v-for="(msg, key) in errors" :key="key">{{ msg }}</li>
              </ul>
            </div>

            <!-- Dynamic form -->
            <DynamicFormRenderer
              v-if="report.templateStructureSnapshot"
              :sections="report.templateStructureSnapshot.sections"
              :header-sections="report.templateStructureSnapshot.header?.enabled ? report.templateStructureSnapshot.header.sections : undefined"
              :footer-sections="report.templateStructureSnapshot.footer?.enabled ? report.templateStructureSnapshot.footer.sections : undefined"
              :model-value="values"
              :is-editable="canEdit"
              @update:model-value="handleUpdate"
              @auto-save="handleSave"
            />
          </div>
        </template>
      </main>
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

const {
  report,
  values,
  errors,
  isSaving,
  init,
  loadReport,
  setValue,
  saveDraft,
  sign,
  close,
  downloadPdf,
} = useReportForm();

// Route helpers
const isCreateFlow = computed(() => route.name === "ReportCreate");

function handleBack(): void {
  if (route.name === "ReportCreate") {
    const patientId = route.params.id as string;
    router.push(`/patients/${patientId}?tab=reports`);
  } else {
    const reportId = route.params.id as string;
    router.push({ name: "ReportView", params: { id: reportId } });
  }
}

// Permissions
const canEdit = computed(() => authStore.hasPermission("report.edit"));
const canSign = computed(() => authStore.hasPermission("report.sign"));
const canClose = computed(() => authStore.hasPermission("report.close"));
const canDownloadPdf = computed(() => authStore.hasPermission("report.download-pdf"));

// Handlers
function handleUpdate(newValues: Record<string, any>): void {
  Object.entries(newValues).forEach(([key, val]) => {
    setValue(key, val);
  });
}

async function handleSave(): Promise<void> {
  try {
    await saveDraft();
  } catch (e: any) {
    console.error("[ReportFillPage] save error:", e);
  }
}

async function handleSign(): Promise<void> {
  if (!confirm("¿Confirmar firma? No podrá editar después.")) return;
  try {
    await sign();
  } catch (e: any) {
    alert(e.message || "Error al firmar el informe");
  }
}

async function handleClose(): Promise<void> {
  if (!confirm("¿Confirmar cierre del informe?")) return;
  try {
    await close();
  } catch (e: any) {
    alert(e.message || "Error al cerrar el informe");
  }
}

async function handleDownloadPdf(): Promise<void> {
  try {
    await downloadPdf();
  } catch (e: any) {
    alert(e.message || "Error al generar el PDF");
  }
}

onMounted(async () => {
  if (route.name === "ReportCreate") {
    const patientId = route.params.id as string;
    const templateId = route.query.templateId as string;
    if (patientId && templateId) {
      await init(patientId, templateId);
    }
  } else {
    const id = route.params.id as string;
    if (id) {
      await loadReport(id);
    }
  }
});
</script>
