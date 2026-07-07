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
import { SystemVariableRegistry } from '@/shared/types/SystemVariableRegistry'
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

const variableResolver = computed<(text: string) => string>(() => {
  const registry = new SystemVariableRegistry()
  const today = new Date()
  const todayStr = today.toLocaleDateString('es-ES')
  const longDateStr = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // ── Fecha ───────────────────────────────────────────────────────────
  registry.register('fecha', 'hoy', 'Fecha actual', undefined, () => todayStr)
  registry.register('fecha', 'actual', 'Fecha actual', undefined, () => todayStr)
  registry.register('fecha', 'formato_largo', 'Fecha larga', undefined, () => longDateStr)

  // ── Paciente ────────────────────────────────────────────────────────
  const p = props.patient
  const fullName = p
    ? `${p.first_name || ''} ${p.last_name || ''} ${p.second_last_name || ''}`.trim()
    : (props.report.patient_name ?? '')
  if (fullName) registry.register('paciente', 'nombre', 'Nombre', undefined, () => fullName)
  if (p?.medical_record_number) registry.register('paciente', 'nro_historia', 'Nro Historia', undefined, () => String(p.medical_record_number))
  if (p?.national_id) registry.register('paciente', 'identificacion', 'Identificación', undefined, () => String(p.national_id))
  if (p?.gender) registry.register('paciente', 'sexo', 'Sexo', undefined, () => String(p.gender))
  if (p?.date_of_birth) registry.register('paciente', 'edad', 'Edad', undefined, () => calcAge(p.date_of_birth))
  if (p?.date_of_birth) registry.register('paciente', 'fecha_nacimiento', 'Fecha nacimiento', undefined, () => String(p.date_of_birth))
  if (p?.city) registry.register('paciente', 'ciudad', 'Ciudad', undefined, () => String(p.city))
  if (p?.phone) registry.register('paciente', 'telefono', 'Teléfono', undefined, () => String(p.phone))
  if (p?.email) registry.register('paciente', 'email', 'Email', undefined, () => String(p.email))
  if (p?.address_line1) registry.register('paciente', 'direccion', 'Dirección', undefined, () => String(p.address_line1))

  // ── Clínica ─────────────────────────────────────────────────────────
  registry.register('clinica', 'nombre', 'Clínica', undefined, () => 'Materia Gris')

  // ── Médico / Usuario ────────────────────────────────────────────────
  const u = props.user
  const authorName = props.report.author_name ?? u?.name ?? ''
  if (authorName) {
    registry.register('medico', 'nombre', 'Médico', undefined, () => authorName)
    registry.register('usuario', 'nombre', 'Usuario', undefined, () => authorName)
    registry.register('usuario', 'nombre_completo', 'Usuario', undefined, () => authorName)
  }
  if (u?.email) registry.register('medico', 'matricula', 'Matrícula', undefined, () => String(u.email))

  // ── Legacy flat variable fallback ───────────────────────────────────
  const legacyMap: Record<string, string> = {
    patient_name: props.report.patient_name ?? fullName,
    author_name: props.report.author_name ?? '',
    date: todayStr,
    fecha: todayStr,
  }

  return (text: string): string => {
    const systemResolved = registry.interpolate(text)
    return systemResolved.replace(/\{([^}]+)\}/g, (_match, key: string) => {
      const val = legacyMap[key.trim()]
      return val ?? _match
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
