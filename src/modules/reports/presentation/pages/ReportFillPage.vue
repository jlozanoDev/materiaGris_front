<template>
  <div class="flex min-h-screen bg-gray-50">
    <AppSidebar />
    <div class="flex-1 p-6">
      <TopBar />
      <Breadcrumb :items="breadcrumbItems" />

      <div class="mt-6">
        <!-- Loading -->
        <div v-if="!report" class="text-center py-12 text-gray-500">
          Cargando informe...
        </div>

        <template v-else>
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ report.status === "draft" ? "Completar Informe" : "Informe" }}
            </h1>

            <div class="flex gap-3">
              <!-- Guardar borrador -->
              <button
                v-if="canEdit"
                type="button"
                class="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                :disabled="isSaving"
                @click="handleSave"
              >
                {{ isSaving ? "Guardando..." : "Guardar borrador" }}
              </button>

              <!-- Firmar -->
              <button
                v-if="canSign && report.status === 'draft'"
                type="button"
                class="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                @click="handleSign"
              >
                Firmar informe
              </button>

              <!-- Cerrar -->
              <button
                v-if="canClose && report.status === 'signed'"
                type="button"
                class="inline-flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                @click="handleClose"
              >
                Cerrar informe
              </button>

              <!-- Descargar PDF -->
              <button
                v-if="canDownloadPdf && (report.status === 'signed' || report.status === 'closed')"
                type="button"
                class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="handleDownloadPdf"
              >
                Descargar PDF
              </button>
            </div>
          </div>

          <!-- Validation errors -->
          <div
            v-if="Object.keys(errors).length > 0"
            class="mb-6 rounded-md bg-red-50 p-4"
          >
            <p class="text-sm font-medium text-red-800 mb-2">Complete los campos obligatorios:</p>
            <ul class="list-disc list-inside text-sm text-red-700">
              <li v-for="(msg, key) in errors" :key="key">{{ msg }}</li>
            </ul>
          </div>

          <!-- Dynamic form -->
          <DynamicFormRenderer
            v-if="report.template_structure_snapshot"
            :sections="report.template_structure_snapshot.sections"
            :model-value="values"
            :is-editable="canEdit"
            @update:model-value="handleUpdate"
            @auto-save="handleSave"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBar from "@/shared/components/TopBar.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import DynamicFormRenderer from "@/modules/reports/presentation/components/DynamicFormRenderer.vue";
import { useReportForm } from "@/modules/reports/presentation/composables/useReportForm";
import { useAuthStore } from "@/core/store/auth";

const route = useRoute();
const authStore = useAuthStore();

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

const breadcrumbItems = computed(() => [
  { text: "Informes", to: "/informes" },
  { text: report.value ? `Informe #${report.value.id}` : "Nuevo" },
]);

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
  const id = route.params.id as string;
  const patientId = route.query.patientId as string;
  const templateId = route.query.templateId as string;

  if (id) {
    await loadReport(id);
  } else if (patientId && templateId) {
    await init(patientId, templateId);
  }
});
</script>
