<template>
  <div class="report-pdf-export" ref="exportRef">
    <ReportDocumentRenderer
      :sections="templateStructureSnapshot.sections"
      :header-sections="headerSections"
      :footer-sections="footerSections"
      :header-enabled="headerEnabled"
      :footer-enabled="footerEnabled"
      :values="values"
      :variable-resolver="variableResolver"
      :signature-url="signatureUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { PatientReport } from '@/shared/types'
import { useClinicStore } from '@/core/store/clinic'
import { useReportVariableResolver } from '@/shared/composables/useReportVariableResolver'
import ReportDocumentRenderer from '@/modules/admin/report-template/presentation/components/ReportDocumentRenderer.vue'
import { generateReportPdf } from '@/modules/reports/presentation/composables/useReportPdf'

interface Props {
  report: PatientReport
  patient?: {
    first_name?: string
    last_name?: string
    second_last_name?: string
    medical_record_number?: string | number
    national_id?: string | number
    gender?: string
    date_of_birth?: string
    city?: string
    phone?: string
    email?: string
    address_line1?: string
  } | null
  user?: {
    name?: string
    email?: string
  } | null
  signatureUrl?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  patient: null,
  user: null,
  signatureUrl: null,
})

const exportRef = ref<HTMLDivElement | null>(null)

const clinicStore = useClinicStore()

// ── Template structure snapshot ───────────────────────────────────────
const templateStructureSnapshot = computed(() => props.report.templateStructureSnapshot)

const headerSections = computed(() => templateStructureSnapshot.value.header?.sections ?? [])
const footerSections = computed(() => templateStructureSnapshot.value.footer?.sections ?? [])
const headerEnabled = computed(() => templateStructureSnapshot.value.header?.enabled ?? false)
const footerEnabled = computed(() => templateStructureSnapshot.value.footer?.enabled ?? false)

const values = computed(() => props.report.values || {})

// ── Variable resolver ─────────────────────────────────────────────────
function calcAge(dob?: string): string {
  if (!dob) return ''
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return String(age)
}

const { resolve: composableResolve } = useReportVariableResolver(
  computed(() => props.user as any),
  computed(() => clinicStore.clinic),
)

const variableResolver = computed<(text: string) => string>(() => {
  const today = new Date()
  const todayStr = today.toLocaleDateString('es-ES')
  const longDateStr = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const p = props.patient
  const fullName = p
    ? `${p.first_name || ''} ${p.last_name || ''} ${p.second_last_name || ''}`.trim()
    : (props.report.patient_name ?? '')

  const localVars: Record<string, string> = {
    'fecha.hoy': todayStr,
    'fecha.actual': todayStr,
    'fecha.formato_largo': longDateStr,
    patient_name: props.report.patient_name ?? fullName,
    author_name: props.report.author_name ?? '',
    date: todayStr,
    fecha: todayStr,
  }
  if (fullName) localVars['paciente.nombre'] = fullName
  if (p?.medical_record_number) localVars['paciente.nro_historia'] = String(p.medical_record_number)
  if (p?.national_id) localVars['paciente.identificacion'] = String(p.national_id)
  if (p?.gender) localVars['paciente.sexo'] = String(p.gender)
  if (p?.date_of_birth) localVars['paciente.edad'] = calcAge(p.date_of_birth)
  if (p?.date_of_birth) localVars['paciente.fecha_nacimiento'] = String(p.date_of_birth)
  if (p?.city) localVars['paciente.ciudad'] = String(p.city)
  if (p?.phone) localVars['paciente.telefono'] = String(p.phone)
  if (p?.email) localVars['paciente.email'] = String(p.email)
  if (p?.address_line1) localVars['paciente.direccion'] = String(p.address_line1)

  return (text: string): string => {
    const resolved = composableResolve(text)
    return resolved.replace(/\{([^}]+)\}/g, (_match, key: string) => {
      return localVars[key.trim()] ?? _match
    })
  }
})

// ── Generate PDF ──────────────────────────────────────────────────────
async function generatePdf(): Promise<Blob> {
  await nextTick()
  await nextTick()

  const element = exportRef.value
  if (!element) {
    throw new Error('Export element not found')
  }

  return await generateReportPdf(element)
}

defineExpose({ generatePdf })
</script>

<style scoped>
.report-pdf-export {
  position: fixed;
  left: -9999px;
  top: 0;
  z-index: -1;
  width: 210mm;
  background: white;
}
</style>
