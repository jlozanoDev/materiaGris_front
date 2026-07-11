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
                <!-- Asistente IA -->
                <button
                  v-if="canEdit && report.status === 'draft' && report.id && report.templateId"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-2xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                  :disabled="isSaving"
                  @click="showAIPanel = !showAIPanel"
                >
                  <i class="pi pi-sparkles text-xs text-indigo-500"></i>
                  {{ showAIPanel ? "Cerrar asistente" : "Asistente de dictado IA" }}
                </button>

                <!-- Guardar borrador (solo draft) -->
                <button
                  v-if="canEdit && report.status === 'draft'"
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

                <!-- Archivar -->
                <button
                  v-if="canArchive && report.status === 'signed'"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-2xl bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  @click="handleArchive"
                >
                  <i class="pi pi-archive text-xs"></i>
                  Archivar informe
                </button>

                <!-- Descargar PDF -->
                <button
                  v-if="canDownloadPdf && (report.status === 'signed' || report.status === 'archived')"
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

            <!-- AI Assistant Dropdown -->
            <div
              v-if="showAIPanel && canEdit && report.status === 'draft' && report.id && report.templateId"
              class="relative mb-6"
            >
              <div class="absolute right-0 top-0 z-50 w-full max-w-2xl">
                <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                  <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
                    <h3 class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <i class="pi pi-sparkles text-indigo-500"></i>
                      Asistente de dictado IA
                    </h3>
                    <button
                      type="button"
                      class="text-slate-400 hover:text-slate-600 transition-colors"
                      @click="showAIPanel = false"
                    >
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                  <div class="p-4 bg-white">
                    <AIAssistantPanel
                      :report-id="report.id"
                      :template-id="report.templateId"
                      :field-configs="fieldConfigs"
                      :form-values="values"
                      :form-set-value="setValue"
                      @llm-result="handleLLMResult"
                      @done="handleAIDone"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Dynamic form -->
            <DynamicFormRenderer
              v-if="report.templateStructureSnapshot"
              :sections="report.templateStructureSnapshot.sections"
              :header-sections="report.templateStructureSnapshot.header?.enabled ? report.templateStructureSnapshot.header.sections : undefined"
              :footer-sections="report.templateStructureSnapshot.footer?.enabled ? report.templateStructureSnapshot.footer.sections : undefined"
              :model-value="values"
              :is-editable="canEdit && report.status === 'draft'"
              :variable-resolver="variableResolver"
              :ai-reviews="aiReviews"
              :ai-warnings="aiWarnings"
              :ai-has-warnings="aiHasWarnings"
              :ai-accept-field="aiAcceptField"
              :ai-reject-field="aiRejectField"
              :ai-edit-field="aiEditField"
              :ai-apply-all="aiApplyAll"
              @update:model-value="handleUpdate"
              @auto-save="handleSave"
            />

            <!-- Signature display (read-only) -->
            <div
              v-if="report.status !== 'draft' && (signatureValue || typedSignatureValue)"
              class="mt-8 border-t border-slate-200 pt-8"
            >
              <h3 class="text-base font-semibold text-slate-800 mb-4">Firma del profesional</h3>
              <SignaturePad
                :model-value="signatureValue"
                :disabled="true"
              />
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>

  <!-- Sign confirmation modal -->
  <Modal
    :show="showSignModal"
    title="Firma digital del informe"
    size="lg"
    :close-on-backdrop="false"
    icon-class="h-6 w-6 text-[#7c3aed]"
    @close="cancelSign"
  >
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        <path d="M2 2l7.586 7.586"/>
        <circle cx="11" cy="11" r="2"/>
      </svg>
    </template>

    <!-- Document Context -->
    <div class="mb-6 rounded-xl border border-[rgba(124,58,237,0.08)] bg-[#fafaff] p-4">
      <p class="text-xs font-semibold uppercase tracking-wider text-[#9690a8] mb-2">Documento a firmar</p>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-[#0b0817] truncate">{{ templateName || 'Informe clínico' }}</p>
          <p class="text-xs text-[#6b6b7b] truncate">{{ fullPatientName }} • {{ formatDateShort(report?.createdAt) }}</p>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="mb-4 flex items-center gap-2">
      <div class="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(124,58,237,0.1)]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <p class="text-sm text-[#6b6b7b]">
        Dibuje su firma en el recuadro o escriba su nombre completo
      </p>
    </div>

    <!-- Signature Pad -->
    <div class="rounded-xl border border-[rgba(124,58,237,0.08)] bg-white p-4 shadow-sm">
      <SignaturePad
        :model-value="signatureValue"
        :disabled="false"
        @update:model-value="onSignatureUpdate"
        @update:typed-signature="onTypedSignatureUpdate"
      />
    </div>

    <!-- Status & Error -->
    <div class="mt-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          class="h-2 w-2 rounded-full transition-colors duration-200"
          :class="hasSignature ? 'bg-green-500' : 'bg-gray-300'"
        />
        <span class="text-xs text-[#9690a8]">
          {{ hasSignature ? 'Firma lista' : 'Firma pendiente' }}
        </span>
      </div>
    </div>

    <div
      v-if="signError"
      class="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 border border-red-100"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p class="text-sm text-red-700">{{ signError }}</p>
    </div>

    <!-- Legal disclaimer -->
    <p class="mt-4 text-xs text-[#9690a8] leading-relaxed">
      Al firmar, confirma que la información contenida en este informe es veraz y ha sido revisada por usted. 
      Esta firma tiene validez legal conforme a la normativa vigente.
    </p>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <button
          class="btn btn-outline btn-sm"
          :disabled="isSigning"
          @click="cancelSign"
        >
          Cancelar
        </button>
          <button
            class="btn btn-primary btn-sm"
            :disabled="isSigning || !hasSignature"
            @click="confirmSign"
          >
          <svg v-if="!isSigning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
          </svg>
          {{ isSigning ? "Firmando..." : "Confirmar firma" }}
        </button>
      </div>
    </template>
  </Modal>

  <!-- Archive confirmation modal -->
  <Modal
    :show="showArchiveModal"
    title="Archivar informe"
    size="sm"
    :close-on-backdrop="false"
    @close="cancelArchive"
  >
    <p class="text-[#6b6b7b] text-sm">
      ¿Confirmar archivado del informe?
    </p>

    <div
      v-if="archiveError"
      class="mt-3 rounded-xl bg-red-50 p-3"
    >
      <p class="text-sm text-red-700">{{ archiveError }}</p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          class="btn btn-outline btn-sm"
          :disabled="isArchiving"
          @click="cancelArchive"
        >
          Cancelar
        </button>
        <button
          class="btn bg-slate-600 hover:bg-slate-700 text-white btn-sm"
          :disabled="isArchiving"
          @click="confirmArchive"
        >
          {{ isArchiving ? "Archivando..." : "Archivar" }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBarLayout from "@/shared/components/TopBarLayout.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import DynamicFormRenderer from "@/modules/reports/presentation/components/DynamicFormRenderer.vue";
import SignaturePad from "@/modules/reports/presentation/components/SignaturePad.vue";
import AIAssistantPanel from "@/modules/reports/presentation/components/AIAssistantPanel.vue";
import Modal from "@/shared/components/Modal.vue";
import { useReportForm } from "@/modules/reports/presentation/composables/useReportForm";
import { useTemplateList } from "@/modules/reports/presentation/composables/useTemplateList";
import { useAIReview } from "@/modules/reports/presentation/composables/useAIReview";
import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";
import { provideGetPatientUseCase } from "@/modules/patients/application/containers/patientsContainer";
import { useClinicStore } from "@/core/store/clinic";
import { useReportVariableResolver } from "@/shared/composables/useReportVariableResolver";
import type { Patient, FieldConfig, Section } from "@/shared/types";
import type { LLMExtractionResult } from "@/modules/reports/domain/entities/AIProcessing";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const clinicStore = useClinicStore();
const { logout } = useLogout();

const patientData = ref<Patient | null>(null);

// Modals
const showSignModal = ref(false);
const showArchiveModal = ref(false);
const showAIPanel = ref(false);
const signError = ref("");
const archiveError = ref("");
const isSigning = ref(false);
const isArchiving = ref(false);

// Computed property to check if signature is provided
const hasSignature = computed(() => {
  return !!signatureValue.value || !!typedSignatureValue.value;
});

const {
  report,
  values,
  errors,
  isSaving,
  isLoading,
  errorMessage,
  signatureValue,
  typedSignatureValue,
  init,
  loadReport,
  setValue,
  validateFormFields,
  saveDraft,
  sign,
  archive,
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

// Variable resolver — composable for medico.*/usuario.*/clinica.* + local fallbacks
const { resolve: composableResolve } = useReportVariableResolver(
  computed(() => authStore.user),
  computed(() => clinicStore.clinic),
);

const variableResolver = computed<((text: string) => string) | undefined>(() => {
  if (!report.value) return undefined;

  const today = new Date();
  const todayStr = today.toLocaleDateString("es-ES");
  const longDateStr = today.toLocaleDateString("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const p = patientData.value;
  const fullName = p
    ? `${p.first_name || ""} ${p.last_name || ""} ${p.second_last_name || ""}`.trim()
    : (report.value.patient_name ?? "");

  const localVars: Record<string, string> = {
    "fecha.hoy": todayStr,
    "fecha.actual": todayStr,
    "fecha.formato_largo": longDateStr,
    patient_name: report.value.patient_name ?? fullName,
    author_name: report.value.author_name ?? "",
    date: todayStr,
    fecha: todayStr,
  };
  if (fullName) localVars["paciente.nombre"] = fullName;
  if (p?.medical_record_number) localVars["paciente.nro_historia"] = String(p.medical_record_number);
  if (p?.national_id) localVars["paciente.identificacion"] = String(p.national_id);
  if (p?.gender) localVars["paciente.sexo"] = String(p.gender);
  if (p?.date_of_birth) localVars["paciente.edad"] = calcAge(p.date_of_birth);
  if (p?.date_of_birth) localVars["paciente.fecha_nacimiento"] = String(p.date_of_birth);
  if (p?.city) localVars["paciente.ciudad"] = String(p.city);
  if (p?.phone) localVars["paciente.telefono"] = String(p.phone);
  if (p?.email) localVars["paciente.email"] = String(p.email);
  if (p?.address_line1) localVars["paciente.direccion"] = String(p.address_line1);

  return (text: string): string => {
    const resolved = composableResolve(text);
    return resolved.replace(/\{([^}]+)\}/g, (_match, key: string) => {
      return localVars[key.trim()] ?? _match;
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

/** Flattened field configs from the report template structure */
const fieldConfigs = computed<FieldConfig[]>(() => {
  if (!report.value?.templateStructureSnapshot?.sections) return [];
  return report.value.templateStructureSnapshot.sections.flatMap(
    (s: Section) =>
      s.rows.flatMap((r: any) =>
        r.columns.flatMap((c: any) => c.fields as FieldConfig[]),
      ),
  );
});

// AI Review — inline field-by-field review
const llmResultForReview = ref<LLMExtractionResult | null>(null);
const {
  reviews: aiReviews,
  warnings: aiWarnings,
  hasWarnings: aiHasWarnings,
  acceptField: aiAcceptField,
  rejectField: aiRejectField,
  editField: aiEditField,
  applyAll: aiApplyAll,
} = useAIReview(llmResultForReview, fieldConfigs, values, setValue);

function handleLLMResult(result: any): void {
  const inner = result?.data?.extracted_data !== undefined ? result.data : result;
  llmResultForReview.value = inner;
  showAIPanel.value = false;
}

function handleAIDone(): void {
  aiApplyAll();
  llmResultForReview.value = null;
  showAIPanel.value = false;
}

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
const canArchive = computed(() => authStore.hasPermission("report.archive"));
const canDownloadPdf = computed(() => authStore.hasPermission("report.download-pdf"));

// Handlers
function handleUpdate(newValues: Record<string, any>): void {
  Object.entries(newValues).forEach(([key, val]) => {
    setValue(key, val);
  });
}

function onSignatureUpdate(val: string | null): void {
  setValue("_signature", val);
}

function onTypedSignatureUpdate(val: string): void {
  setValue("_typed", val);
}

async function handleSave(): Promise<void> {
  try {
    await saveDraft();
  } catch (e: any) {
    console.error("[ReportFillPage] save error:", e);
  }
}

async function handleSign(): Promise<void> {
  signError.value = "";
  // Validate form fields before opening signature modal
  const fieldErrors = validateFormFields();
  if (Object.keys(fieldErrors).length > 0) {
    return; // Errors are already set in `errors` ref; stay on page
  }
  showSignModal.value = true;
}

async function confirmSign(): Promise<void> {
  isSigning.value = true;
  signError.value = "";
  try {
    await sign();
    showSignModal.value = false;
  } catch (e: any) {
    signError.value = e.message || "Error al firmar el informe";
  } finally {
    isSigning.value = false;
  }
}

function cancelSign(): void {
  if (isSigning.value) return;
  showSignModal.value = false;
  signError.value = "";
}

async function handleArchive(): Promise<void> {
  archiveError.value = "";
  showArchiveModal.value = true;
}

async function confirmArchive(): Promise<void> {
  isArchiving.value = true;
  archiveError.value = "";
  try {
    await archive();
    showArchiveModal.value = false;
  } catch (e: any) {
    archiveError.value = e.message || "Error al archivar el informe";
  } finally {
    isArchiving.value = false;
  }
}

function cancelArchive(): void {
  if (isArchiving.value) return;
  showArchiveModal.value = false;
  archiveError.value = "";
}

async function handleDownloadPdf(): Promise<void> {
  try {
    await downloadPdf();
  } catch (e: any) {
    console.error("[ReportFillPage] download error:", e);
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
