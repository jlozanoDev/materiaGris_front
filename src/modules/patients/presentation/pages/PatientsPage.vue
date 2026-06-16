<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBarLayout from "@/shared/components/TopBarLayout.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import UiVuetifyDataTable from "@/shared/components/UiVuetifyDataTable.vue";
import Modal from "@/shared/components/Modal.vue";
import CustomSelect from "@/shared/components/CustomSelect.vue";
import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";
import { useToast } from "@/shared/composables/useToast";
import { usePatients } from "@/modules/patients/presentation/composables/usePatients";
import type { Patient } from "@/shared/types";

// --- Local interfaces ---

interface DataTableColumn {
  key: string;
  field?: string;
  label: string;
  sortable: boolean;
}

interface DataTableFilters {
  global: { value: string | null; matchMode: string };
}

interface PatientSearchFilters {
  gender: string;
  city: string;
  registered_from: string;
  registered_to: string;
  last_visit_from: string;
  last_visit_to: string;
  is_active: string;
}

interface ActiveFilterItem {
  key: string;
  label: string;
  value?: string;
}

interface PatientFormData {
  id?: number | string;
  medical_record_number: string;
  national_id: string;
  first_name: string;
  last_name: string;
  second_last_name: string;
  gender: string;
  date_of_birth: string;
  last_visit_at: string;
  city: string;
  is_active: boolean;
  insurance_id: string;
  email: string;
  phone: string;
  mobile: string;
  contact_name: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string;
  neighborhood: string;
  postal_code: string;
  state: string;
  country: string;
}

interface PatientFiltersPayload {
  q?: string;
  gender?: string;
  city?: string;
  registered_from?: string;
  registered_to?: string;
  last_visit_from?: string;
  last_visit_to?: string;
  is_active?: string;
}

// --- Composables ---

const authStore = useAuthStore();
const { logout } = useLogout();
const {
  patients: _patients,
  loading,
  error,
  fetchPatients: fetchPatientsUseCase,
  createPatient,
  updatePatient,
} = usePatients();

// Type-bridge: DataTable expects Record<string, unknown>[] but composable returns Patient[]
const patients = computed(() => _patients.value as unknown as Record<string, unknown>[]);

// --- Filters and table state ---

const globalFilter = ref<string>("");
const filters = ref<DataTableFilters>({ global: { value: null, matchMode: "contains" } });
watch(globalFilter, (val: string) => {
  filters.value = { global: { value: val, matchMode: "contains" } };
});

const rows = ref<number>(10);

const { show } = useToast();
const router = useRouter();

const columns: DataTableColumn[] = [
  { key: "medical_record_number", field: "medical_record_number", label: "NHC", sortable: true },
  { key: "national_id", field: "national_id", label: "DNI", sortable: true },
  { key: "first_name", field: "first_name", label: "Nombre", sortable: true },
  { key: "last_name", field: "last_name", label: "Apellidos", sortable: true },
  { key: "email", field: "email", label: "Email", sortable: true },
  { key: "phone", field: "phone", label: "Teléfono", sortable: true },
  { key: "city", field: "city", label: "Ciudad", sortable: true },
  { key: "is_active", field: "is_active", label: "Activo", sortable: true },
  { key: "actions", label: "", sortable: false },
];

// --- Advanced search state ---

const advancedOpen = ref<boolean>(false);

const defaultSearchFilters = (): PatientSearchFilters => ({
  gender: "",
  city: "",
  registered_from: "",
  registered_to: "",
  last_visit_from: "",
  last_visit_to: "",
  is_active: "all",
});

const searchFilters = ref<PatientSearchFilters>(defaultSearchFilters());

function toggleAdvanced(): void {
  advancedOpen.value = !advancedOpen.value;
}

function resetFilters(): void {
  globalFilter.value = "";
  searchFilters.value = defaultSearchFilters();
  fetchPatients();
}

// --- Active filters display ---

const activeFiltersList = computed<ActiveFilterItem[]>(() => {
  const f = searchFilters.value || {};
  const list: ActiveFilterItem[] = [];
  if (f.gender) list.push({ key: "gender", label: `Género: ${f.gender}` });
  if (f.city) list.push({ key: "city", label: `Ciudad: ${f.city}` });
  if (f.registered_from || f.registered_to)
    list.push({
      key: "registered",
      label: `Registrado: ${f.registered_from || "-"} → ${f.registered_to || "-"}`,
    });
  if (f.last_visit_from || f.last_visit_to)
    list.push({
      key: "last_visit",
      label: `Últ. visita: ${f.last_visit_from || "-"} → ${f.last_visit_to || "-"}`,
    });
  if (f.is_active && f.is_active !== "all")
    list.push({ key: "is_active", label: f.is_active === "true" ? "Activos" : "Inactivos" });
  return list;
});

const activeAdvancedCount = computed<number>(() => activeFiltersList.value.length);

// --- Filter actions ---

function applyFilters(): void {
  fetchPatients();
}

function removeFilter(item: ActiveFilterItem): void {
  if (!item || !item.key) return;
  const key = item.key;
  if (key === "gender") {
    searchFilters.value.gender = "";
  } else if (key === "city") {
    searchFilters.value.city = "";
  } else if (key === "registered") {
    searchFilters.value.registered_from = "";
    searchFilters.value.registered_to = "";
  } else if (key === "last_visit") {
    searchFilters.value.last_visit_from = "";
    searchFilters.value.last_visit_to = "";
  } else if (key === "is_active") {
    searchFilters.value.is_active = "all";
  }
  fetchPatients();
}

// --- Modal / CRUD state ---

const editing = ref<boolean>(false);
const creating = ref<boolean>(false);

const emptyFormData = (): PatientFormData => ({
  medical_record_number: "",
  national_id: "",
  first_name: "",
  last_name: "",
  second_last_name: "",
  gender: "",
  date_of_birth: "",
  last_visit_at: "",
  city: "",
  is_active: true,
  insurance_id: "",
  email: "",
  phone: "",
  mobile: "",
  contact_name: "",
  contact_phone: "",
  address_line1: "",
  address_line2: "",
  neighborhood: "",
  postal_code: "",
  state: "",
  country: "",
});

const form = ref<PatientFormData>(emptyFormData());

const contactOpen = ref<boolean>(false);
const addressOpen = ref<boolean>(false);

// --- Patient CRUD ---

function startNewPatient(): void {
  editing.value = true;
  contactOpen.value = false;
  addressOpen.value = false;
  form.value = emptyFormData();
}

function cancelNewPatient(): void {
  editing.value = false;
  creating.value = false;
}

async function savePatient(): Promise<void> {
  if (creating.value) return;
  creating.value = true;
  try {
    if (form.value?.id) {
      await updatePatient(form.value.id, { ...form.value } as unknown as Record<string, unknown>);
      show("Paciente actualizado correctamente", "success", 2500);
    } else {
      await createPatient({ ...form.value } as unknown as Record<string, unknown>);
      show("Paciente creado correctamente", "success", 2500);
    }
    editing.value = false;
    fetchPatients();
  } catch (err: unknown) {
    const msg = (err as { body?: { message?: string } })?.body?.message || "Error creando/actualizando paciente";
    show(msg, "error", 5000);
  } finally {
    creating.value = false;
  }
}

function fetchPatients(): void {
  const f = searchFilters.value;
  const payload: PatientFiltersPayload = {
    q: globalFilter.value || undefined,
    gender: f.gender || undefined,
    city: f.city || undefined,
    registered_from: f.registered_from || undefined,
    registered_to: f.registered_to || undefined,
    last_visit_from: f.last_visit_from || undefined,
    last_visit_to: f.last_visit_to || undefined,
    is_active: f.is_active !== "all" ? f.is_active : undefined,
  };
  fetchPatientsUseCase(payload as Record<string, unknown>);
}

function editPatient(p: any): void {
  const patient = p as Patient;
  router.push({ name: "PatientDetail", params: { id: patient.id } });
}

// --- Lifecycle ---

onMounted(async () => {
  await authStore.fetchUser();
  fetchPatients();
});
</script>

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
              { text: 'Pacientes', icon: 'pi pi-users' },
            ]"
          />
        </div>

        <div class="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl text-indigo-600 font-bold">
              <i
                class="pi pi-users text-indigo-600"
                style="font-size: 1.1rem"
                aria-hidden="true"
              ></i>
              Pacientes
            </h1>
            <button
              class="px-4 py-2 rounded-2xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              @click="startNewPatient"
            >
              + Nuevo Paciente
            </button>
          </div>

          <div v-if="loading" class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="h-8 w-32 bg-slate-200 rounded-md animate-pulse" />
              <div class="h-10 w-40 bg-slate-200 rounded-md animate-pulse" />
            </div>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3 w-full md:w-1/3">
                <div class="h-10 bg-slate-200 rounded-xl flex-1 animate-pulse" />
                <div class="h-10 w-24 bg-slate-200 rounded-xl animate-pulse" />
              </div>
              <div class="h-10 w-20 bg-slate-200 rounded-xl animate-pulse" />
            </div>
            <div class="space-y-0">
              <div
                v-for="i in 8"
                :key="i"
                class="flex items-center gap-4 py-3 border-b border-slate-100 last:border-b-0"
              >
                <div class="h-4 bg-slate-200 rounded w-16 animate-pulse" />
                <div class="h-4 bg-slate-200 rounded w-20 animate-pulse" />
                <div class="h-4 bg-slate-200 rounded w-32 animate-pulse" />
                <div class="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                <div class="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                <div class="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                <div class="h-4 bg-slate-200 rounded w-20 animate-pulse" />
                <div class="h-4 bg-slate-200 rounded w-12 animate-pulse" />
                <div class="h-8 w-8 bg-slate-200 rounded-2xl ml-auto animate-pulse" />
              </div>
            </div>
          </div>

          <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
            <i class="pi pi-exclamation-triangle text-slate-300 text-5xl mb-4"></i>
            <p class="text-slate-500 text-center">
              {{ (error as Record<string, Record<string, string>>)?.body?.message || "No se pudieron cargar los pacientes. No tienes permiso para ver esta sección." }}
            </p>
            <button
              class="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              @click="fetchPatients()"
            >
              Reintentar
            </button>
          </div>

          <div v-else>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3 w-full md:w-1/3">
                <input
                  v-model="globalFilter"
                  placeholder="Buscar..."
                  aria-label="Buscar pacientes"
                  class="flex-1 rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />

                <button
                  aria-label="Filtros avanzados"
                  :aria-pressed="advancedOpen"
                  :class="[
                    'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition',
                    advancedOpen
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-100 text-slate-700',
                  ]"
                  @click.prevent="toggleAdvanced"
                >
                  <i class="pi pi-filter"></i>
                  <span class="hidden sm:inline">Filtros</span>
                  <span
                    v-if="activeAdvancedCount"
                    class="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-indigo-600 text-white rounded-full"
                    >{{ activeAdvancedCount }}</span
                  >
                </button>
              </div>
              <div class="ml-4 flex items-center gap-2">
                <label class="hidden sm:inline text-sm text-slate-600">Filas</label>
                <CustomSelect
                  v-model="rows"
                  :options="[10, 25, 50, 100]"
                  class="w-auto"
                  aria-label="Filas por página"
                />
              </div>
            </div>

            <div v-if="activeFiltersList.length" class="flex flex-wrap gap-2 items-center mb-3">
              <div
                v-for="(f, idx) in activeFiltersList"
                :key="idx"
                class="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-sm"
              >
                <span>{{ f.label }}</span>
                <button
                  class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                  @click="removeFilter(f)"
                >
                  ×
                </button>
              </div>
            </div>

            <div
              v-if="advancedOpen"
              class="mb-3 mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-100"
            >
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Género</label>
                  <CustomSelect
                    v-model="searchFilters.gender"
                    :options="[
                      { value: '', label: 'Todos' },
                      { value: 'M', label: 'M' },
                      { value: 'F', label: 'F' },
                      { value: 'other', label: 'Otro' },
                    ]"
                  />
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Ciudad</label>
                  <input
                    v-model="searchFilters.city"
                    placeholder="Ciudad"
                    class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100"
                  />
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Activo</label>
                  <CustomSelect
                    v-model="searchFilters.is_active"
                    :options="[
                      { value: 'all', label: 'Todos' },
                      { value: 'true', label: 'Activos' },
                      { value: 'false', label: 'Inactivos' },
                    ]"
                  />
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Registrado desde</label>
                  <input
                    v-model="searchFilters.registered_from"
                    type="date"
                    class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100"
                  />
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Registrado hasta</label>
                  <input
                    v-model="searchFilters.registered_to"
                    type="date"
                    class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100"
                  />
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Última visita desde</label>
                  <input
                    v-model="searchFilters.last_visit_from"
                    type="date"
                    class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100"
                  />
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Última visita hasta</label>
                  <input
                    v-model="searchFilters.last_visit_to"
                    type="date"
                    class="w-full rounded-xl bg-white pl-3 pr-3 py-2 text-sm border border-slate-100"
                  />
                </div>
              </div>

              <div class="flex items-center gap-3 mt-4 justify-end">
                <button
                  aria-label="Aplicar filtros"
                  class="px-3 py-2 rounded bg-indigo-600 text-white text-sm"
                  @click.prevent="applyFilters"
                >
                  Aplicar
                </button>
                <button
                  aria-label="Limpiar filtros"
                  class="px-3 py-2 rounded bg-white border border-slate-200 text-sm"
                  @click.prevent="resetFilters"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            <div class="overflow-x-auto">
              <div>
                <UiVuetifyDataTable
                  class="patients-table"
                  :value="patients"
                  data-key="id"
                  :filters="filters"
                  :global-filter-fields="[
                    'first_name',
                    'last_name',
                    'national_id',
                    'medical_record_number',
                  ]"
                  :columns="columns"
                  :paginator="true"
                  :rows="rows"
                  :rows-per-page-options="[10, 25, 50, 100]"
                >
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
                      <span
                        v-if="data.is_active"
                        class="inline-flex items-center gap-2 text-green-600"
                        ><i class="pi pi-check"></i> Sí</span
                      >
                      <span v-else class="inline-flex items-center gap-2 text-red-500"
                        ><i class="pi pi-times"></i> No</span
                      >
                    </div>
                  </template>

                  <template #body-actions="{ data }">
                    <div class="px-3 py-2 flex items-center justify-end">
                      <button
                        data-action-btn
                        aria-label="Editar"
                        class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#f5f3ff] border border-[#ede9fe] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed] hover:shadow-sm transition-all duration-150 relative group"
                        @click="editPatient(data)"
                      >
                        <i class="pi pi-pencil text-xs" />
                        <span class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0b0817] text-white text-[11px] leading-none py-1.5 px-2.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-10 shadow-sm">Editar</span>
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
              <h3 class="text-lg font-semibold text-slate-800">
                {{ form.id ? "Editar paciente" : "Nuevo paciente" }}
              </h3>
              <div class="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  :aria-pressed="form.is_active"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  :class="form.is_active ? 'bg-indigo-600' : 'bg-slate-200'"
                  @click="form.is_active = !form.is_active"
                >
                  <span class="sr-only">Activo</span>
                  <span
                    class="transform rounded-full bg-white h-5 w-5 shadow transition-transform"
                    :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
                  ></span>
                </button>
                <label class="text-sm text-slate-600 select-none">Activo</label>
              </div>
            </div>
          </template>

          <div class="space-y-4">
            <form id="patient-form" class="space-y-4" @submit.prevent="savePatient">
              <!-- Identificación -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 class="text-sm font-semibold text-slate-700 mb-3">Identificación</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">NHC</label>
                    <input
                      v-model="form.medical_record_number"
                      placeholder="NHC"
                      class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">DNI</label>
                    <input
                      v-model="form.national_id"
                      placeholder="DNI"
                      class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1"
                      >Aseguradora (ID)</label
                    >
                    <input
                      v-model="form.insurance_id"
                      type="number"
                      placeholder="ID"
                      class="w-full rounded-xl bg-slate-50 pl-3 pr-3 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                </div>
              </div>

              <!-- Personal -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 class="text-sm font-semibold text-slate-700 mb-3">Personal</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
                    <input
                      v-model="form.first_name"
                      required
                      placeholder="Nombre"
                      class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1"
                      >Primer apellido</label
                    >
                    <input
                      v-model="form.last_name"
                      required
                      placeholder="Primer apellido"
                      class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1"
                      >Segundo apellido</label
                    >
                    <input
                      v-model="form.second_last_name"
                      placeholder="Segundo apellido"
                      class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1">Género</label>
                    <CustomSelect
                      v-model="form.gender"
                      :options="[
                        { value: '', label: 'Todos' },
                        { value: 'M', label: 'M' },
                        { value: 'F', label: 'F' },
                        { value: 'other', label: 'Otro' },
                      ]"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1"
                      >Fecha de nacimiento</label
                    >
                    <input
                      v-model="form.date_of_birth"
                      type="date"
                      class="w-full rounded-xl bg-slate-50 pl-3 pr-3 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-1"
                      >Última visita</label
                    >
                    <input
                      v-model="form.last_visit_at"
                      type="date"
                      class="w-full rounded-xl bg-slate-50 pl-3 pr-3 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                </div>
              </div>

              <!-- Contacto (collapsible) -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-semibold text-slate-700">Contacto</h4>
                  <button
                    type="button"
                    :aria-expanded="contactOpen"
                    class="flex items-center gap-2 text-slate-600 hover:text-slate-800"
                    @click="contactOpen = !contactOpen"
                  >
                    <i
                      :class="[
                        'pi',
                        contactOpen ? 'pi-chevron-down' : 'pi-chevron-right',
                        'text-slate-600',
                      ]"
                    ></i>
                  </button>
                </div>
                <transition name="fade">
                  <div v-show="contactOpen" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Email</label>
                      <input
                        v-model="form.email"
                        type="email"
                        placeholder="email@ejemplo.test"
                        class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                      <input
                        v-model="form.phone"
                        placeholder="Teléfono"
                        class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Móvil</label>
                      <input
                        v-model="form.mobile"
                        placeholder="Móvil"
                        class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1"
                        >Contacto de emergencia</label
                      >
                      <input
                        v-model="form.contact_name"
                        placeholder="Nombre contacto"
                        class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1"
                        >Teléfono contacto</label
                      >
                      <input
                        v-model="form.contact_phone"
                        placeholder="Teléfono contacto"
                        class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Dirección (collapsible) -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-semibold text-slate-700">Dirección</h4>
                  <button
                    type="button"
                    :aria-expanded="addressOpen"
                    class="flex items-center gap-2 text-slate-600 hover:text-slate-800"
                    @click="addressOpen = !addressOpen"
                  >
                    <i
                      :class="[
                        'pi',
                        addressOpen ? 'pi-chevron-down' : 'pi-chevron-right',
                        'text-slate-600',
                      ]"
                    ></i>
                  </button>
                </div>
                <transition name="fade">
                  <div v-show="addressOpen" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-slate-600 mb-1"
                        >Dirección (línea 1)</label
                      >
                      <input
                        v-model="form.address_line1"
                        placeholder="Calle, número"
                        class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1"
                        >Dirección (línea 2)</label
                      >
                      <input
                        v-model="form.address_line2"
                        placeholder="Piso, puerta, etc."
                        class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Ciudad</label>
                      <input
                        v-model="form.city"
                        placeholder="Ciudad"
                        class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1"
                        >Provincia/Estado</label
                      >
                      <input
                        v-model="form.state"
                        placeholder="Provincia/Estado"
                        class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1"
                        >Código postal</label
                      >
                      <input
                        v-model="form.postal_code"
                        placeholder="Código postal"
                        class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">Barrio</label>
                      <input
                        v-model="form.neighborhood"
                        placeholder="Barrio"
                        class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1">País</label>
                      <input
                        v-model="form.country"
                        placeholder="País"
                        class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                  </div>
                </transition>
              </div>
            </form>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="px-4 py-2 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                @click="cancelNewPatient"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="patient-form"
                :disabled="creating"
                class="px-4 py-2 rounded-2xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Guardar
              </button>
            </div>
          </template>
        </Modal>
      </main>
    </div>
  </div>
</template>
