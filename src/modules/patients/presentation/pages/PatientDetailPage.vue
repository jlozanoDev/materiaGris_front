<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBarLayout from "@/shared/components/TopBarLayout.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import PatientGeneralDataTab from "@/modules/patients/presentation/components/PatientGeneralDataTab.vue";
import PatientReportsTab from "@/modules/patients/presentation/components/PatientReportsTab.vue";
import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";
import { usePatients } from "@/modules/patients/presentation/composables/usePatients";
import { useToast } from "@/shared/composables/useToast";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { logout } = useLogout();
const { patient, patientLoading, error, fetchPatientById, updatePatient } =
  usePatients();
const { show } = useToast();

const activeTab = ref(0);
const tabs = [
  { value: 0, label: "Datos generales", icon: "pi pi-address-book" },
  { value: 1, label: "Informes clínicos", icon: "pi pi-file" },
];
const saving = ref(false);

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getUTCFullYear()}`;
}

function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const age = computed(() =>
  patient.value ? calculateAge(patient.value.date_of_birth) : 0,
);

onMounted(async () => {
  await authStore.fetchUser();
  const id = route.params.id as string;
  await fetchPatientById(id);
});

async function handleSave(payload: Record<string, unknown>): Promise<void> {
  saving.value = true;
  try {
    const id = route.params.id as string;
    await updatePatient(id, payload);
    await fetchPatientById(id);
    show("Paciente actualizado correctamente", "success", 2500);
  } catch (err: unknown) {
    const msg =
      (err as { body?: { message?: string } })?.body?.message ||
      "Error actualizando paciente";
    show(msg, "error", 5000);
  } finally {
    saving.value = false;
  }
}

function handleCancel(): void {
  router.push({ name: "Patients" });
}
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
              {
                text: 'Dashboard',
                icon: 'pi pi-objects-column',
                to: '/',
              },
              {
                text: 'Pacientes',
                icon: 'pi pi-users',
                to: '/patients',
              },
              {
                text: 'Detalle del paciente',
                icon: 'pi pi-user',
              },
            ]"
          />
        </div>

        <!-- Loading state -->
        <div
          v-if="patientLoading"
          class="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4"
        >
          <div class="h-8 w-48 bg-slate-200 rounded-md animate-pulse" />
          <div class="h-6 w-64 bg-slate-200 rounded-md animate-pulse" />
          <div class="flex gap-4 mt-4">
            <div
              v-for="i in 2"
              :key="i"
              class="h-10 w-32 bg-slate-200 rounded-xl animate-pulse"
            />
          </div>
          <div class="space-y-3 mt-2">
            <div
              v-for="i in 4"
              :key="i"
              class="h-24 bg-slate-200 rounded-2xl animate-pulse"
            />
          </div>
        </div>

        <!-- Error state -->
        <div
          v-else-if="error"
          class="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center py-12 text-center"
        >
          <i class="pi pi-exclamation-circle text-red-400 text-4xl mb-3"></i>
          <h2 class="text-lg font-semibold text-slate-700 mb-2">
            Paciente no encontrado
          </h2>
          <p class="text-sm text-slate-500 mb-4">
            El paciente que buscas no existe o ha sido eliminado.
          </p>
          <button
            class="px-4 py-2 rounded-2xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            @click="router.push({ name: 'Patients' })"
          >
            Volver a pacientes
          </button>
        </div>

        <!-- Patient detail content -->
        <div v-else-if="patient" class="bg-white rounded-2xl shadow-sm p-6">
          <!-- Patient header -->
          <div class="flex items-start justify-between mb-6">
            <div>
              <h1 class="text-xl font-bold text-slate-800">
                {{ patient.first_name }} {{ patient.last_name }} <span v-if="patient.second_last_name"> {{ patient.second_last_name }}</span>
              </h1>
              <div class="flex flex-wrap gap-x-6 gap-y-1.5 mt-2 text-sm text-slate-500">
              <span class="flex items-center gap-1.5">
                <i class="pi pi-hashtag text-indigo-400 text-xs"></i>
                {{ patient.medical_record_number }}
              </span>
              <span v-if="patient.national_id" class="flex items-center gap-1.5">
                <i class="pi pi-id-card text-indigo-400 text-xs"></i>
                {{ patient.national_id }}
              </span>
              <span v-if="patient.date_of_birth" class="flex items-center gap-1.5">
                <i class="pi pi-calendar text-indigo-400 text-xs"></i>
                {{ formatDate(patient.date_of_birth) }} ({{ age }} años)
              </span>
              <span v-if="patient.gender" class="flex items-center gap-1.5">
                <i class="pi pi-user text-indigo-400 text-xs"></i>
                {{ { M: 'Masculino', F: 'Femenino', other: 'Otro' }[patient.gender] || patient.gender }}
              </span>
              <span v-if="patient.phone" class="flex items-center gap-1.5">
                <i class="pi pi-phone text-indigo-400 text-xs"></i>
                {{ patient.phone }}
              </span>
              <span v-if="patient.email" class="flex items-center gap-1.5">
                <i class="pi pi-envelope text-indigo-400 text-xs"></i>
                {{ patient.email }}
              </span>
              <span v-if="patient.city" class="flex items-center gap-1.5">
                <i class="pi pi-map-marker text-indigo-400 text-xs"></i>
                {{ patient.city }}
              </span>
            </div>
          </div>

          <!-- Active toggle -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              :aria-pressed="patient.is_active"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              :class="patient.is_active ? 'bg-indigo-600' : 'bg-slate-200'"
              @click="patient.is_active = !patient.is_active"
            >
              <span class="sr-only">Activo</span>
              <span
                class="transform rounded-full bg-white h-5 w-5 shadow transition-transform"
                :class="patient.is_active ? 'translate-x-5' : 'translate-x-0'"
              ></span>
            </button>
            <label class="text-sm text-slate-600 select-none">Activo</label>
          </div>
        </div>

        <!-- Custom Tabs -->
          <div class="border-b border-slate-200">
            <div class="flex gap-0">
              <button
                v-for="t in tabs"
                :key="t.value"
                class="px-5 py-3 text-sm font-medium transition-colors relative"
                :class="activeTab === t.value ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'"
                @click="activeTab = t.value"
              >
                <i :class="t.icon" class="mr-1.5 text-xs" />
                {{ t.label }}
                <span
                  v-if="activeTab === t.value"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                />
              </button>
            </div>
          </div>

          <div class="mt-4">
            <PatientGeneralDataTab
              v-if="activeTab === 0"
              :key="0"
              :patient="patient as any"
              :saving="saving"
              @save="handleSave"
              @cancel="handleCancel"
            />
            <PatientReportsTab
              v-if="activeTab === 1"
              :key="1"
              :patient-id="route.params.id as string"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
