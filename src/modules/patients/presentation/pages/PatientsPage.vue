<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import AppSidebar from '@/shared/components/AppSidebar.vue'
import TopBar from '@/shared/components/TopBar.vue'
import Breadcrumb from '@/shared/components/Breadcrumb.vue'
import UiVuetifyDataTable from '@/shared/components/UiVuetifyDataTable.vue'
import Modal from '@/shared/components/Modal.vue'
import Slider from 'primevue/slider'
import Chips from 'primevue/chips'
import { useAuthStore } from '@/core/store/auth'
import { useToast } from '@/shared/composables/useToast'
import { usePatients } from '@/modules/patients/presentation/composables/usePatients'

const authStore = useAuthStore()
const { user } = authStore
const { patients, loading, fetchPatients: fetchPatientsUseCase, createPatient, updatePatient } = usePatients()
const globalFilter = ref('')
const filters = ref({ global: { value: null, matchMode: 'contains' } })
// Filas por página (paginador del DataTable)
const rows = ref(10)
watch(globalFilter, (val) => { filters.value = { global: { value: val, matchMode: 'contains' } } })

const { show } = useToast()

const columns = [
  { key: 'medical_record_number', field: 'medical_record_number', label: 'NHC', sortable: true },
  { key: 'national_id', field: 'national_id', label: 'DNI', sortable: true },
  { key: 'email', field: 'email', label: 'Email', sortable: true },
  { key: 'phone', field: 'phone', label: 'Teléfono', sortable: true },
  { key: 'first_name', field: 'first_name', label: 'Nombre', sortable: true },
  { key: 'last_name', field: 'last_name', label: 'Apellidos', sortable: true },
  { key: 'city', field: 'city', label: 'Ciudad', sortable: true },
  { key: 'is_active', field: 'is_active', label: 'Activo', sortable: true },
  { key: 'actions', label: '', sortable: false }
]

onMounted(async () => {
  await authStore.fetchUser()
  fetchPatients()
})

// Advanced search state
const advancedOpen = ref(false)
const searchFilters = ref({
  age_min: '',
  age_max: '',
  gender: '',
  city: '',
  insurance: [],
  registered_from: '',
  registered_to: '',
  last_visit_from: '',
  last_visit_to: '',
  is_active: 'all', // 'all' | 'true' | 'false'
})

function toggleAdvanced() {
  advancedOpen.value = !advancedOpen.value
  if (advancedOpen.value) {
    const ins = searchFilters.value.insurance
    insuranceChips.value = Array.isArray(ins) ? ins.map(i => String(i)) : []
    // sync slider with applied filters when opening
    const min = Number(searchFilters.value.age_min) || 0
    const max = Number(searchFilters.value.age_max) || 120
    ageRange.value = [min, max]
  }
}

function resetFilters() {
  globalFilter.value = ''
  searchFilters.value = {
    age_min: '', age_max: '', gender: '', city: '', insurance: [], registered_from: '', registered_to: '', last_visit_from: '', last_visit_to: '', is_active: 'all'
  }
  ageRange.value = [0, 120]
  insuranceChips.value = []
  fetchPatients()
}

// insurance chips input for UI (IDs entered as tokens)
const insuranceChips = ref([])

const activeFiltersList = computed(() => {
  const f = searchFilters.value || {}
  const list = []
  if (f.age_min || f.age_max) {
    const min = f.age_min || '0'
    const max = f.age_max || '120'
    list.push({ key: 'age', label: `Edad: ${min}–${max}` })
  }
  if (f.gender) list.push({ key: 'gender', label: `Género: ${f.gender}` })
  if (f.city) list.push({ key: 'city', label: `Ciudad: ${f.city}` })
  if (Array.isArray(f.insurance) && f.insurance.length) f.insurance.forEach(i => list.push({ key: 'insurance', label: `Aseg: ${i}`, value: i }))
  if (f.registered_from || f.registered_to) list.push({ key: 'registered', label: `Registrado: ${f.registered_from || '-'} → ${f.registered_to || '-'}` })
  if (f.last_visit_from || f.last_visit_to) list.push({ key: 'last_visit', label: `Últ. visita: ${f.last_visit_from || '-'} → ${f.last_visit_to || '-'}` })
  if (f.is_active && f.is_active !== 'all') list.push({ key: 'is_active', label: f.is_active === 'true' ? 'Activos' : 'Inactivos' })
  return list
})

const activeAdvancedCount = computed(() => activeFiltersList.value.length)

// age range for UI (0..120) — applied on 'Aplicar filtros'
const ageRange = ref([Number(searchFilters.value.age_min) || 0, Number(searchFilters.value.age_max) || 120])

const ageMin = computed({
  get: () => ageRange.value[0],
  set: (v) => { ageRange.value = [Number(v) || 0, ageRange.value[1]] }
})

const ageMax = computed({
  get: () => ageRange.value[1],
  set: (v) => { ageRange.value = [ageRange.value[0], Number(v) || 120] }
})

function applyFilters() {
  // map chips (tokens) to insurance filter values
  if (!insuranceChips.value || insuranceChips.value.length === 0) {
    searchFilters.value.insurance = []
  } else {
    searchFilters.value.insurance = insuranceChips.value.map(s => String(s).trim()).filter(s => s !== '')
  }
  // apply slider values to searchFilters (omit defaults)
  const [min, max] = Array.isArray(ageRange.value) ? ageRange.value : [0, 120]
  searchFilters.value.age_min = (min && Number(min) > 0) ? Number(min) : ''
  searchFilters.value.age_max = (max && Number(max) < 120) ? Number(max) : ''
  fetchPatients()
}

function removeFilter(item) {
  if (!item || !item.key) return
  const key = item.key
  if (key === 'insurance') {
    searchFilters.value.insurance = (searchFilters.value.insurance || []).filter(i => String(i) !== String(item.value))
  } else if (key === 'age') {
    searchFilters.value.age_min = ''
    searchFilters.value.age_max = ''
    ageRange.value = [0, 120]
  } else if (key === 'gender') {
    searchFilters.value.gender = ''
  } else if (key === 'city') {
    searchFilters.value.city = ''
  } else if (key === 'registered') {
    searchFilters.value.registered_from = ''
    searchFilters.value.registered_to = ''
  } else if (key === 'last_visit') {
    searchFilters.value.last_visit_from = ''
    searchFilters.value.last_visit_to = ''
  } else if (key === 'is_active') {
    searchFilters.value.is_active = 'all'
  }
  insuranceChips.value = Array.isArray(searchFilters.value.insurance) ? searchFilters.value.insurance.map(i => String(i)) : []
  fetchPatients()
}

// Modal / create patient state
const editing = ref(false)
const creating = ref(false)
const form = ref({
  medical_record_number: '',
  national_id: '',
  first_name: '',
  last_name: '',
  second_last_name: '',
  gender: '',
  date_of_birth: '',
  last_visit_at: '',
  city: '',
  is_active: true,
  insurance_id: '',
  // Contact
  email: '',
  phone: '',
  mobile: '',
  contact_name: '',
  contact_phone: '',
  // Address
  address_line1: '',
  address_line2: '',
  neighborhood: '',
  postal_code: '',
  state: '',
  country: ''
})

// UI state for collapsible panels (collapsed by default)
const contactOpen = ref(false)
const addressOpen = ref(false)

function startNewPatient() {
  editing.value = true
  // ensure panels start folded when opening
  contactOpen.value = false
  addressOpen.value = false

  form.value = {
    medical_record_number: '',
    national_id: '',
    first_name: '',
    last_name: '',
    second_last_name: '',
    gender: '',
    date_of_birth: '',
    last_visit_at: '',
    city: '',
    is_active: true,
    insurance_id: '',
    email: '',
    phone: '',
    mobile: '',
    contact_name: '',
    contact_phone: '',
    address_line1: '',
    address_line2: '',
    neighborhood: '',
    postal_code: '',
    state: '',
    country: ''
  }
}

function cancelNewPatient() {
  editing.value = false
  creating.value = false
}

async function savePatient() {
  if (creating.value) return
  creating.value = true
  try {
    if (form.value && form.value.id) {
      await updatePatient(form.value.id, { ...form.value })
      show('Paciente actualizado correctamente', 'success', 2500)
    } else {
      await createPatient({ ...form.value })
      show('Paciente creado correctamente', 'success', 2500)
    }
    editing.value = false
    fetchPatients()
  } catch (err) {
    const msg = err?.body?.message || 'Error creando/actualizando paciente'
    show(msg, 'error', 5000)
  } finally {
    creating.value = false
  }
}

function fetchPatients() {
  const f = searchFilters.value
  fetchPatientsUseCase({
    q: globalFilter.value || undefined,
    age_min: f.age_min || undefined,
    age_max: f.age_max || undefined,
    gender: f.gender || undefined,
    city: f.city || undefined,
    registered_from: f.registered_from || undefined,
    registered_to: f.registered_to || undefined,
    last_visit_from: f.last_visit_from || undefined,
    last_visit_to: f.last_visit_to || undefined,
    is_active: f.is_active !== 'all' ? f.is_active : undefined,
    insurance: Array.isArray(f.insurance) && f.insurance.length > 0 ? f.insurance : undefined,
  })
}

function rowClass(row) {
  const base = 'border-b last:border-b-0'
  const data = row?.data ?? row
  if (!data) return base
  if (data.is_active === false || data.disabled === true || data.deleted_at) return base + ' opacity-60'
  return base
}

function viewPatient(p) {
  console.log('View patient', p)
}

function editPatient(p) {
  editing.value = true
  // collapse panels when opening edit modal
  contactOpen.value = false
  addressOpen.value = false
  // map fields from patient to form, fallback to empty strings
  form.value = {
    id: p.id,
    medical_record_number: p.medical_record_number || '',
    national_id: p.national_id || '',
    first_name: p.first_name || '',
    last_name: p.last_name || '',
    second_last_name: p.second_last_name || '',
    gender: p.gender || '',
    date_of_birth: p.date_of_birth || '',
    last_visit_at: p.last_visit_at || '',
    city: p.city || '',
    is_active: !!p.is_active,
    insurance_id: p.insurance_id ?? '',
    email: p.email || '',
    phone: p.phone || '',
    mobile: p.mobile || '',
    contact_name: p.contact_name || '',
    contact_phone: p.contact_phone || '',
    address_line1: p.address_line1 || '',
    address_line2: p.address_line2 || '',
    neighborhood: p.neighborhood || '',
    postal_code: p.postal_code || '',
    state: p.state || '',
    country: p.country || ''
  }
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#EEF2FF]">
    <AppSidebar />

    <div class="flex flex-1 min-w-0 overflow-hidden">
      <main class="flex flex-1 min-w-0 flex-col overflow-y-auto p-5 gap-5">
        <div class="flex flex-col gap-0">
          <Breadcrumb :items="[{ text: 'Dashboard', icon: 'pi pi-objects-column', to: '/' }, { text: 'Pacientes', icon: 'pi pi-users' }]" />
          <TopBar :user="authStore.user" />
        </div>

        <div class="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl text-indigo-600 font-bold">
              <i class="pi pi-users text-indigo-600" style="font-size: 1.1rem" aria-hidden="true"></i> Pacientes
            </h1>
            <button @click="startNewPatient" class="px-4 py-2 rounded-2xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">+ Nuevo Paciente</button>
          </div>

          <div v-if="loading" class="text-sm text-slate-500">Cargando pacientes...</div>

          <div v-else>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3 w-full md:w-1/3">
                <input v-model="globalFilter" placeholder="Buscar..." aria-label="Buscar pacientes"
                  class="flex-1 rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />

                <button @click.prevent="toggleAdvanced" aria-label="Filtros avanzados" :aria-pressed="advancedOpen" :class="['inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition', advancedOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-700']">
                  <i class="pi pi-filter"></i>
                  <span class="hidden sm:inline">Filtros</span>
                  <span v-if="activeAdvancedCount" class="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-indigo-600 text-white rounded-full">{{ activeAdvancedCount }}</span>
                </button>
              </div>
              <div class="ml-4 flex items-center gap-2">
                <label class="hidden sm:inline text-sm text-slate-600">Filas</label>
                <select v-model.number="rows" aria-label="Filas por página" class="rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100">
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              
              </div>
            </div>

            <div v-if="activeFiltersList.length" class="flex flex-wrap gap-2 items-center mb-3">
              <div v-for="(f, idx) in activeFiltersList" :key="idx" class="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-sm">
                <span>{{ f.label }}</span>
                <button @click="removeFilter(f)" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50">×</button>
              </div>
            </div>

            <div v-if="advancedOpen" class="mb-3 mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="md:col-span-1">
                  <label class="block text-sm text-slate-600 mb-1">Edad</label>
                  <div class="flex items-center gap-2">
                    <input v-model.number="ageMin" type="number" min="0" max="120" aria-label="Edad mínima" class="w-20 text-sm rounded-xl bg-white pl-2 pr-2 py-1 border border-slate-100" />
                    <span class="text-sm text-slate-500">—</span>
                    <input v-model.number="ageMax" type="number" min="0" max="120" aria-label="Edad máxima" class="w-20 text-sm rounded-xl bg-white pl-2 pr-2 py-1 border border-slate-100" />
                  </div>
                  <div class="mt-2">
                    <Slider v-model="ageRange" :range="true" :min="0" :max="120" class="h-3" />
                  </div>
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Género</label>
                  <select v-model="searchFilters.gender" class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100">
                    <option value="">Todos</option>
                    <option value="M">M</option>
                    <option value="F">F</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Ciudad</label>
                  <input v-model="searchFilters.city" placeholder="Ciudad" class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100" />
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Aseguradoras (IDs)</label>
                  <div class="w-full rounded-xl bg-white pl-2 pr-2 py-2 border border-slate-100">
                    <Chips v-model="insuranceChips" placeholder="Añade ID y presiona Enter" class="w-full" />
                  </div>
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Activo</label>
                  <select v-model="searchFilters.is_active" class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100">
                    <option value="all">Todos</option>
                    <option value="true">Activos</option>
                    <option value="false">Inactivos</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Registrado desde</label>
                  <input v-model="searchFilters.registered_from" type="date" class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100" />
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Registrado hasta</label>
                  <input v-model="searchFilters.registered_to" type="date" class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100" />
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Última visita desde</label>
                  <input v-model="searchFilters.last_visit_from" type="date" class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100" />
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Última visita hasta</label>
                  <input v-model="searchFilters.last_visit_to" type="date" class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100" />
                </div>
              </div>

              <div class="flex items-center gap-3 mt-4 justify-end">
                <button @click.prevent="applyFilters" aria-label="Aplicar filtros" class="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Aplicar</button>
                <button @click.prevent="resetFilters" aria-label="Limpiar filtros" class="px-3 py-2 rounded bg-white border border-slate-200 text-sm">Limpiar filtros</button>
              </div>
            </div>

            <div class="overflow-x-auto">
              <div>
                <UiVuetifyDataTable class="patients-table" :value="patients" dataKey="id" :filters="filters" :globalFilterFields="['first_name','last_name','national_id','medical_record_number']" :columns="columns" :paginator="true" :rows="rows" :rowsPerPageOptions="[10,25,50,100]">
              <template #body-medical_record_number="{ data }">
                <div class="px-3 py-2 text-sm">{{ data.medical_record_number }}</div>
              </template>

              <template #body-national_id="{ data }">
                <div class="px-3 py-2 text-sm">{{ data.national_id }}</div>
              </template>

              <template #body-email="{ data }">
                <div class="px-3 py-2 text-sm">{{ data.email }}</div>
              </template>

              <template #body-phone="{ data }">
                <div class="px-3 py-2 text-sm">{{ data.phone }}</div>
              </template>

              <template #body-first_name="{ data }">
                <div class="px-3 py-2 text-sm">{{ data.first_name }}</div>
              </template>

              <template #body-last_name="{ data }">
                <div class="px-3 py-2 text-sm">{{ data.last_name }}</div>
              </template>

              <template #body-is_active="{ data }">
                <div class="px-3 py-2 text-sm">
                  <span v-if="data.is_active" class="inline-flex items-center gap-2 text-green-600"><i class="pi pi-check"></i> Sí</span>
                  <span v-else class="inline-flex items-center gap-2 text-red-500"><i class="pi pi-times"></i> No</span>
                </div>
              </template>

              <template #body-actions="{ data }">
                <div class="px-3 py-2 text-right">
                  <button @click="editPatient(data)" aria-label="Editar" class="group inline-flex items-center justify-center h-8 w-8 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 mr-2">
                    <i class="pi pi-pencil h-4 w-4 transition-colors duration-150 text-current group-hover:text-indigo-600"></i>
                  </button>
                </div>
              </template>

              <template #empty>
                <div class="px-3 py-4 text-slate-500">No hay pacientes para mostrar.</div>
              </template>
                </UiVuetifyDataTable>
              </div>
            </div>
          </div>
        </div>

        <Modal :show="editing" size="max-w-6xl" @close="cancelNewPatient">
          <template #header>
            <div class="flex items-center justify-between mb-0 w-full">
              <h3 class="text-lg font-semibold text-slate-800">{{ form.id ? 'Editar paciente' : 'Nuevo paciente' }}</h3>
              <div class="flex items-center gap-3 ml-auto">
                <button type="button" @click="form.is_active = !form.is_active" :aria-pressed="form.is_active" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none" :class="form.is_active ? 'bg-indigo-600' : 'bg-slate-200'">
                  <span class="sr-only">Activo</span>
                  <span class="transform rounded-full bg-white h-5 w-5 shadow transition-transform" :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"></span>
                </button>
                <label class="text-sm text-slate-600 select-none">Activo</label>
              </div>
            </div>
          </template>

          <div class="space-y-4">
            <form id="patient-form" @submit.prevent="savePatient" class="space-y-4">
              <!-- Identificación -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 class="text-sm font-semibold text-slate-700 mb-3">Identificación</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">NHC</label>
                    <input v-model="form.medical_record_number" placeholder="NHC" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">DNI</label>
                    <input v-model="form.national_id" placeholder="DNI" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">Aseguradora (ID)</label>
                    <input v-model="form.insurance_id" type="number" placeholder="ID" class="w-full rounded-xl bg-slate-50 pl-3 pr-3 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                  </div>
                </div>
              </div>

              <!-- Personal -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 class="text-sm font-semibold text-slate-700 mb-3">Personal</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
                    <input v-model="form.first_name" required placeholder="Nombre" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">Primer apellido</label>
                    <input v-model="form.last_name" required placeholder="Primer apellido" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">Segundo apellido</label>
                    <input v-model="form.second_last_name" placeholder="Segundo apellido" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">Género</label>
                    <select v-model="form.gender" class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100">
                      <option value="">Todos</option>
                      <option value="M">M</option>
                      <option value="F">F</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">Fecha de nacimiento</label>
                    <input v-model="form.date_of_birth" type="date" class="w-full rounded-xl bg-slate-50 pl-3 pr-3 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">Última visita</label>
                    <input v-model="form.last_visit_at" type="date" class="w-full rounded-xl bg-slate-50 pl-3 pr-3 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                  </div>
                </div>
              </div>

              <!-- Contacto (collapsible) -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-semibold text-slate-700">Contacto</h4>
                  <button type="button" @click="contactOpen = !contactOpen" :aria-expanded="contactOpen" class="flex items-center gap-2 text-slate-600 hover:text-slate-800">
                    <i :class="['pi', contactOpen ? 'pi-chevron-down' : 'pi-chevron-right', 'text-slate-600']"></i>
                  </button>
                </div>
                <transition name="fade">
                  <div v-show="contactOpen" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Email</label>
                      <input v-model="form.email" type="email" placeholder="email@ejemplo.test" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                      <input v-model="form.phone" placeholder="Teléfono" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Móvil</label>
                      <input v-model="form.mobile" placeholder="Móvil" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Contacto de emergencia</label>
                      <input v-model="form.contact_name" placeholder="Nombre contacto" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Teléfono contacto</label>
                      <input v-model="form.contact_phone" placeholder="Teléfono contacto" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Dirección (collapsible) -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-semibold text-slate-700">Dirección</h4>
                  <button type="button" @click="addressOpen = !addressOpen" :aria-expanded="addressOpen" class="flex items-center gap-2 text-slate-600 hover:text-slate-800">
                    <i :class="['pi', addressOpen ? 'pi-chevron-down' : 'pi-chevron-right', 'text-slate-600']"></i>
                  </button>
                </div>
                <transition name="fade">
                  <div v-show="addressOpen" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-slate-600 mb-1">Dirección (línea 1)</label>
                      <input v-model="form.address_line1" placeholder="Calle, número" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Dirección (línea 2)</label>
                      <input v-model="form.address_line2" placeholder="Piso, puerta, etc." class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Ciudad</label>
                      <input v-model="form.city" placeholder="Ciudad" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Provincia/Estado</label>
                      <input v-model="form.state" placeholder="Provincia/Estado" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Código postal</label>
                      <input v-model="form.postal_code" placeholder="Código postal" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Barrio</label>
                      <input v-model="form.neighborhood" placeholder="Barrio" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">País</label>
                      <input v-model="form.country" placeholder="País" class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                  </div>
                </transition>
              </div>

            </form>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <button type="button" @click="cancelNewPatient" class="px-4 py-2 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-100">Cancelar</button>
              <button type="submit" form="patient-form" :disabled="creating" class="px-4 py-2 rounded-2xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Guardar</button>
            </div>
          </template>
        </Modal>
      </main>
    </div>
  </div>
</template>
