<script setup lang="ts">
import { ref, onMounted } from "vue";
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
const saving = ref(false);

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
          <TopBarLayout :user="authStore.user" @logout="logout" />
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
          <div class="mb-6">
            <h1 class="text-xl font-bold text-slate-800">
              {{ patient.first_name }} {{ patient.last_name }}
            </h1>
            <p class="text-sm text-slate-400 mt-1">
              {{ patient.medical_record_number }}
              <span v-if="patient.national_id">
                — {{ patient.national_id }}
              </span>
            </p>
          </div>

          <!-- Vuetify Tabs -->
          <v-tabs v-model="activeTab" color="indigo">
            <v-tab value="0">Datos generales</v-tab>
            <v-tab value="1">Informes clínicos</v-tab>
          </v-tabs>

          <v-tabs-window v-model="activeTab" class="mt-4">
            <v-tabs-window-item value="0">
              <PatientGeneralDataTab
                :patient="patient as any"
                :saving="saving"
                @save="handleSave"
                @cancel="handleCancel"
              />
            </v-tabs-window-item>

            <v-tabs-window-item value="1">
              <PatientReportsTab :patient-id="route.params.id as string" />
            </v-tabs-window-item>
          </v-tabs-window>
        </div>
      </main>
    </div>
  </div>
</template>
