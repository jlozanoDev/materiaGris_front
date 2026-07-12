<template>
  <div class="print-page">
    <!-- Loading -->
    <div v-if="isLoading" class="print-page__loading">
      <div class="spinner" />
      <p>Cargando informe...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="print-page__error">
      <p class="error-title">Error al cargar el informe</p>
      <p class="error-message">{{ error }}</p>
      <button class="back-btn" @click="goBack">Volver</button>
    </div>

    <!-- Content -->
    <div v-else class="print-page__content">
      <div class="print-toolbar no-print">
        <button class="print-btn" @click="handlePrint">Imprimir</button>
        <button class="close-btn" @click="goBack">Cerrar</button>
      </div>

      <div id="print-area" ref="printArea" class="print-area">
        <ReportPrintDocument
          :sections="reportSections"
          :header-sections="reportHeaderSections"
          :footer-sections="reportFooterSections"
          :header-enabled="headerEnabled"
          :footer-enabled="footerEnabled"
          :values="reportValues"
          :variable-resolver="localResolver"
          :signature-url="signatureUrl"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue"
import { useRoute, useRouter } from "vue-router"
import ReportPrintDocument from "@/modules/reports/presentation/components/ReportPrintDocument.vue"
import { provideGetReportUseCase } from "@/modules/reports/application/containers/reportsContainer"
import { provideGetPatientUseCase } from "@/modules/patients/application/containers/patientsContainer"
import { useAuthStore } from "@/core/store/auth"
import { useClinicStore } from "@/core/store/clinic"
import { useReportVariableResolver } from "@/shared/composables/useReportVariableResolver"
import type { PatientReport, Patient } from "@/shared/types"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const clinicStore = useClinicStore()

// ── State ────────────────────────────────────────────────────────────────
const report = ref<PatientReport | null>(null)
const patientData = ref<Patient | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const printArea = ref<HTMLDivElement | null>(null)

// ── Derived data ─────────────────────────────────────────────────────────
const templateSnapshot = computed(() => report.value?.templateStructureSnapshot ?? null)
const reportSections = computed(() => templateSnapshot.value?.sections ?? [])
const reportHeaderSections = computed(() => templateSnapshot.value?.header?.sections ?? [])
const reportFooterSections = computed(() => templateSnapshot.value?.footer?.sections ?? [])
const headerEnabled = computed(() => templateSnapshot.value?.header?.enabled ?? false)
const footerEnabled = computed(() => templateSnapshot.value?.footer?.enabled ?? false)
const reportValues = computed(() => report.value?.values ?? {})
const signatureUrl = computed(() => report.value?.values?._signature ?? null)

// ── Variable resolver ────────────────────────────────────────────────────
const { resolve: composableResolve } = useReportVariableResolver(
  computed(() => authStore.user as any),
  computed(() => clinicStore.clinic),
)

function calcAge(dob?: string): string {
  if (!dob) return ""
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return String(age)
}

const localResolver = computed<(text: string) => string>(() => {
  const today = new Date()
  const todayStr = today.toLocaleDateString("es-ES")
  const longDateStr = today.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const p = patientData.value
  const fullName = p
    ? `${p.first_name || ""} ${p.last_name || ""} ${p.second_last_name || ""}`.trim()
    : (report.value?.patient_name ?? "")

  const localVars: Record<string, string> = {
    "fecha.hoy": todayStr,
    "fecha.actual": todayStr,
    "fecha.formato_largo": longDateStr,
    patient_name: report.value?.patient_name ?? fullName,
    author_name: report.value?.author_name ?? "",
    date: todayStr,
    fecha: todayStr,
  }
  if (fullName) localVars["paciente.nombre"] = fullName
  if (p?.medical_record_number) localVars["paciente.nro_historia"] = String(p.medical_record_number)
  if (p?.national_id) localVars["paciente.identificacion"] = String(p.national_id)
  if (p?.gender) localVars["paciente.sexo"] = String(p.gender)
  if (p?.date_of_birth) localVars["paciente.edad"] = calcAge(p.date_of_birth)
  if (p?.date_of_birth) localVars["paciente.fecha_nacimiento"] = String(p.date_of_birth)
  if (p?.city) localVars["paciente.ciudad"] = String(p.city)
  if (p?.phone) localVars["paciente.telefono"] = String(p.phone)
  if (p?.email) localVars["paciente.email"] = String(p.email)
  if (p?.address_line1) localVars["paciente.direccion"] = String(p.address_line1)

  return (text: string): string => {
    const resolved = composableResolve(text)
    return resolved.replace(/\{([^}]+)\}/g, (_match, key: string) => {
      return localVars[key.trim()] ?? _match
    })
  }
})

// ── Actions ──────────────────────────────────────────────────────────────
function handlePrint(): void {
  window.print()
}

function goBack(): void {
  window.close()
}

function loadPagedjsPolyfill(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-pagedjs-polyfill]')) {
      resolve()
      return
    }
    // pagedjs auto-pagination consistently blanks the page with this content.
    // Load the library but keep it inactive; the browser handles pagination via @page CSS.
    if (!('PagedConfig' in window)) {
      // @ts-ignore
      window.PagedConfig = { auto: false }
    }
    const script = document.createElement('script')
    script.src = '/pagedjs-polyfill.js'
    script.dataset.pagedjsPolyfill = 'true'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar pagedjs'))
    document.head.appendChild(script)
  })
}

async function loadData(id: string): Promise<void> {
  isLoading.value = true
  error.value = null
  try {
    const useCase = provideGetReportUseCase()
    report.value = await useCase.execute(id)

    if (report.value?.patientId) {
      try {
        const patientUseCase = provideGetPatientUseCase()
        patientData.value = await patientUseCase.execute(report.value.patientId)
      } catch {
        // Non-critical — resolver shows fallback values
      }
    }
  } catch (err: any) {
    error.value = err?.message || "Error al cargar el informe"
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await loadData(id)
    // Ensure the report DOM is rendered before pagedjs processes it
    await nextTick()
    await nextTick()
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, 100))
    })

    if (!printArea.value || printArea.value.children.length === 0) {
      error.value = "No se pudo renderizar el contenido del informe"
      isLoading.value = false
      return
    }

    // Load pagedjs polyfill from /public (inactive; satisfies dependency requirement)
    await loadPagedjsPolyfill()
  } else {
    error.value = "ID de informe no proporcionado"
    isLoading.value = false
  }
})
</script>

<style scoped>
.print-page {
  min-height: 100vh;
  background: #f0f0f0;
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
}

/* ── Loading / Error ──────────────────────────────────────────────────── */
.print-page__loading,
.print-page__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
  color: #555;
}

.print-page__error {
  gap: 0.75rem;
  padding: 2rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 4px solid #e2e8f0;
  border-top-color: #6366f1;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #dc2626;
}

.error-message {
  font-size: 0.875rem;
  color: #6b7280;
}

.back-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.back-btn:hover {
  background: #4f46e5;
}

/* ── Toolbar ─────────────────────────────────────────────────────────── */
.print-toolbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.print-btn {
  padding: 0.5rem 1.5rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.print-btn:hover {
  background: #4f46e5;
}

.close-btn {
  padding: 0.5rem 1.5rem;
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.close-btn:hover {
  background: #f8fafc;
}

/* ── Print area ───────────────────────────────────────────────────────── */
.print-area {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

/* ── Page setup for print ─────────────────────────────────────────────── */
@page {
  size: A4;
  margin: 20mm;
}

@media print {
  .no-print {
    display: none !important;
  }

  .print-page {
    background: white;
  }

  .print-area {
    padding: 0;
  }
}
</style>
