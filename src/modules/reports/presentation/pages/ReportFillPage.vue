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
          v-if="isLoading"
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

        <!-- Error -->
        <div
          v-else-if="errorMessage"
          class="bg-white rounded-2xl shadow-sm p-6"
        >
          <div class="rounded-2xl bg-red-50 p-4">
            <p class="text-sm font-medium text-red-800 mb-2">Error al cargar el informe</p>
            <p class="text-sm text-red-700 mb-4">{{ errorMessage }}</p>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              @click="retry"
            >
              Reintentar
            </button>
          </div>
        </div>

        <template v-else-if="report">
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
              :variable-resolver="variableResolver"
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
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBarLayout from "@/shared/components/TopBarLayout.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import DynamicFormRenderer from "@/modules/reports/presentation/components/DynamicFormRenderer.vue";
import { useReportForm } from "@/modules/reports/presentation/composables/useReportForm";
import { useTemplateList } from "@/modules/reports/presentation/composables/useTemplateList";
import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";
import { provideGetPatientUseCase } from "@/modules/patients/application/containers/patientsContainer";
import { SystemVariableRegistry } from "@/shared/types/SystemVariableRegistry";
import type { Patient } from "@/shared/types";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { logout } = useLogout();

const patientData = ref<Patient | null>(null);

const {
  report,
  values,
  errors,
  isSaving,
  isLoading,
  errorMessage,
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

function calcAge(dob?: string): string {
  if (!dob) return "";
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return String(age);
}

// Variable resolver — chains SystemVariableRegistry + legacy flat keys
const variableResolver = computed<((text: string) => string) | undefined>(() => {
  if (!report.value) return undefined;

  const registry = new SystemVariableRegistry();
  const today = new Date();
  const todayStr = today.toLocaleDateString("es-ES");
  const longDateStr = today.toLocaleDateString("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  // ── Fecha ───────────────────────────────────────────────────────────
  registry.register("fecha", "hoy", "Fecha actual", undefined, () => todayStr);
  registry.register("fecha", "actual", "Fecha actual", undefined, () => todayStr);
  registry.register("fecha", "formato_largo", "Fecha larga", undefined, () => longDateStr);

  // ── Paciente ────────────────────────────────────────────────────────
  const p = patientData.value;
  const fullName = p
    ? `${p.first_name || ""} ${p.last_name || ""} ${p.second_last_name || ""}`.trim()
    : (report.value.patient_name ?? "");
  if (fullName) registry.register("paciente", "nombre", "Nombre", undefined, () => fullName);
  if (p?.medical_record_number) registry.register("paciente", "nro_historia", "Nro Historia", undefined, () => String(p.medical_record_number));
  if (p?.national_id) registry.register("paciente", "identificacion", "Identificación", undefined, () => String(p.national_id));
  if (p?.gender) registry.register("paciente", "sexo", "Sexo", undefined, () => String(p.gender));
  if (p?.date_of_birth) registry.register("paciente", "edad", "Edad", undefined, () => calcAge(p.date_of_birth));
  if (p?.date_of_birth) registry.register("paciente", "fecha_nacimiento", "Fecha nacimiento", undefined, () => String(p.date_of_birth));
  if (p?.city) registry.register("paciente", "ciudad", "Ciudad", undefined, () => String(p.city));
  if (p?.phone) registry.register("paciente", "telefono", "Teléfono", undefined, () => String(p.phone));
  if (p?.email) registry.register("paciente", "email", "Email", undefined, () => String(p.email));
  if (p?.address_line1) registry.register("paciente", "direccion", "Dirección", undefined, () => String(p.address_line1));

  // ── Clínica ─────────────────────────────────────────────────────────
  registry.register("clinica", "nombre", "Clínica", undefined, () => "Materia Gris"); // TODO: backend

  // ── Médico / Usuario ────────────────────────────────────────────────
  const u = authStore.user;
  const authorName = report.value.author_name ?? u?.name ?? "";
  if (authorName) {
    registry.register("medico", "nombre", "Médico", undefined, () => String(authorName));
    registry.register("usuario", "nombre", "Usuario", undefined, () => String(authorName));
    registry.register("usuario", "nombre_completo", "Usuario", undefined, () => String(authorName));
  }
  if (u?.email) registry.register("medico", "matricula", "Matrícula", undefined, () => String(u.email));

  // ── Legacy flat variable fallback ───────────────────────────────────
  const legacyMap: Record<string, string> = {
    patient_name: report.value.patient_name ?? fullName,
    author_name: report.value.author_name ?? "",
    date: todayStr,
    fecha: todayStr,
  };

  return (text: string): string => {
    const systemResolved = registry.interpolate(text);
    return systemResolved.replace(/\{([^}]+)\}/g, (_match, key: string) => {
      const val = legacyMap[key.trim()];
      return val ?? _match;
    });
  };
});

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

const fullPatientName = computed(() => {
  if (patientData.value) {
    return `${patientData.value.first_name || ""} ${patientData.value.last_name || ""} ${patientData.value.second_last_name || ""}`.trim();
  }
  return report.value?.patient_name ?? "";
});

const { templates, fetchActive: fetchTemplates } = useTemplateList();

const templateName = computed(() => {
  if (report.value?.template_name) return report.value.template_name;
  const tid = report.value?.templateId;
  if (tid) {
    const found = templates.value.find((t) => String(t.id) === String(tid));
    if (found?.name) return found.name;
  }
  return "";
});

const breadcrumbText = computed(() => {
  if (!report.value) return "Nuevo";
  const template = templateName.value;
  const name = fullPatientName.value;
  const date = formatDateShort(report.value.createdAt);
  const patientStr = name && date ? `${name} - ${date}` : (name || date || "");
  if (template && patientStr) return `${template} (${patientStr})`;
  if (template) return template;
  if (patientStr) return patientStr;
  return "Nuevo";
});

// Retry after error
function retry(): void {
  if (route.name === "ReportCreate") {
    const patientId = route.params.id as string;
    const templateId = route.query.templateId as string;
    if (patientId && templateId) {
      init(patientId, templateId);
    }
  } else {
    const id = route.params.id as string;
    if (id) {
      loadReport(id);
    }
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

async function loadPatientData(patientId: string | number): Promise<void> {
  try {
    const useCase = provideGetPatientUseCase();
    const patient = await useCase.execute(patientId);
    patientData.value = patient;
  } catch (e: any) {
    console.error("[ReportFillPage] loadPatientData error:", e);
  }
}

onMounted(async () => {
  fetchTemplates();
  if (route.name === "ReportCreate") {
    const patientId = route.params.id as string;
    const templateId = route.query.templateId as string;
    if (patientId && templateId) {
      await init(patientId, templateId);
      await loadPatientData(patientId);
    }
  } else {
    const id = route.params.id as string;
    if (id) {
      await loadReport(id);
      if (report.value?.patientId) {
        await loadPatientData(report.value.patientId);
      }
    }
  }
});
</script>
