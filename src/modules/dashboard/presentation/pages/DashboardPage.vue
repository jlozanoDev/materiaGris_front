<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBar from "@/shared/components/TopBar.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import HeroCard from "@/modules/dashboard/presentation/components/HeroCard.vue";
import PatientList from "@/modules/dashboard/presentation/components/PatientList.vue";
import PendingReportsWidget from "@/modules/dashboard/presentation/components/PendingReportsWidget.vue";
import QuickActions from "@/modules/dashboard/presentation/components/QuickActions.vue";
import RightPanel from "@/modules/dashboard/presentation/components/RightPanel.vue";
import UiSkeleton from "@/shared/components/UiSkeleton.vue";
import ProfileEditModal from "@/modules/admin/users/presentation/components/ProfileEditModal.vue";
import ChangePasswordModal from "@/shared/components/ChangePasswordModal.vue";
import AddressesModal from "@/shared/components/AddressesModal.vue";

import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";
import LocalStorageGateway from "@/modules/auth/infrastructure/LocalStorageGateway";
import { useDashboard } from "@/modules/dashboard/presentation/composables/useDashboard";

interface Address {
  id: number;
  alias: string;
  street: string;
  number: string;
  postal_code: string;
  mobile_phone: string;
  is_primary: boolean;
}

const authStore = useAuthStore();
const { logout } = useLogout();
const storage = new LocalStorageGateway();
const dashboard = useDashboard();

const showEditModal = ref<boolean>(false);
const showChangePasswordModal = ref<boolean>(false);
const showAddressesModal = ref<boolean>(false);
const addresses = ref<Address[]>([]);

function loadAddresses(): Address[] {
  try {
    const stored = storage.get("addresses");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed as Address[];
    }
  } catch { /* noop */ }
  return [
    {
      id: 1, alias: "Casa", street: "C. Falsa", number: "123",
      postal_code: "28001", mobile_phone: "600123456", is_primary: true,
    },
    {
      id: 2, alias: "Oficina", street: "Av. Siempre Viva", number: "742",
      postal_code: "28002", mobile_phone: "600654321", is_primary: false,
    },
  ];
}

addresses.value = loadAddresses();

const onSaveEdited = (_edited: unknown): void => {
  const edited = _edited as { name?: string };
  if (authStore.user) {
    (authStore.user as unknown as Record<string, unknown>).name = edited.name ?? authStore.user.name;
  }
  try {
    storage.set("user", JSON.stringify(authStore.user));
  } catch { /* noop */ }
};

const onSavePassword = (): void => {
  console.log("[DashboardPage] password change requested (frontend-only)");
  try {
    storage.set("passwordChangedAt", new Date().toISOString());
  } catch { /* noop */ }
};

const onSaveAddresses = (newAddresses: Address[]): void => {
  addresses.value = newAddresses;
  try {
    storage.set("addresses", JSON.stringify(addresses.value));
  } catch { /* noop */ }
};

const breadcrumb = [{ text: "Dashboard", icon: "pi pi-objects-column", to: "/" }];

onMounted(async () => {
  await authStore.fetchUser();
  await dashboard.fetchDashboard();
  if (dashboard.role.value === "doctor") {
    await dashboard.fetchWeather();
  }
});
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#f5f3ff]">
    <AppSidebar />

    <div class="flex flex-1 min-w-0 overflow-hidden">
      <main class="flex flex-1 min-w-0 flex-col p-5 gap-5 min-h-0">
        <div class="flex flex-col gap-1 shrink-0 relative z-10">

          <TopBar
            :user="authStore.user"
            @open-edit="showEditModal = true"
            @open-change-password="showChangePasswordModal = true"
              @manage-addresses="showAddressesModal = true"
              @logout="logout"
          />
          <Breadcrumb :items="breadcrumb" />
        </div>
        <div class="flex-1 overflow-y-auto min-h-0">

        <!-- Error state -->
        <div
          v-if="dashboard.error.value"
          class="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {{ dashboard.error.value instanceof Error ? dashboard.error.value.message : 'Error al cargar el dashboard' }}
        </div>

        <!-- Admin layout -->
        <template v-if="dashboard.role.value === 'admin'">
          <div v-if="dashboard.loading.value" class="flex flex-wrap gap-4">
            <div
              v-for="n in 6"
              :key="n"
              class="card flex flex-1 items-center gap-4 p-5 min-w-[180px]"
            >
              <UiSkeleton variant="circle" width="48px" height="48px" />
              <div class="min-w-0 flex-1 space-y-2">
                <UiSkeleton width="40px" height="28px" />
                <UiSkeleton width="80px" height="14px" />
              </div>
            </div>
          </div>
          <div v-else class="flex flex-wrap gap-4">
            <template
              v-for="m in [
                { label: 'Usuarios', value: dashboard.systemMetrics.value?.totalUsers, icon: 'pi pi-users', color: '#7c3aed' },
                { label: 'Pacientes', value: dashboard.systemMetrics.value?.totalPatients, icon: 'pi pi-user', color: '#60a5fa' },
                { label: 'Pendientes', value: dashboard.systemMetrics.value?.totalPendingReports, icon: 'pi pi-file', color: '#f59e0b' },
                { label: 'Firmados', value: dashboard.systemMetrics.value?.totalSignedReports, icon: 'pi pi-check-circle', color: '#10b981' },
                { label: 'Archivados', value: dashboard.systemMetrics.value?.totalArchivedReports, icon: 'pi pi-archive', color: '#ef4444' },
                { label: 'Plantillas', value: dashboard.systemMetrics.value?.totalTemplates, icon: 'pi pi-palette', color: '#06b6d4' },
              ]"
              :key="m.label"
            >
              <div
                v-if="m.value != null"
                class="card flex flex-1 items-center gap-4 p-5 min-w-[180px]"
              >
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
                  :style="{ background: `${m.color}14`, color: m.color }"
                >
                  <i :class="['text-xl', m.icon]" />
                </div>
                <div class="min-w-0">
                  <p class="text-2xl font-bold text-slate-800 leading-none">
                    {{ m.value }}
                  </p>
                  <p class="mt-1 text-sm text-slate-500 truncate">{{ m.label }}</p>
                </div>
              </div>
            </template>
          </div>
        </template>

        <!-- Doctor layout -->
        <template v-if="dashboard.role.value === 'doctor'">
          <template v-if="dashboard.isEmptyState.value">
            <!-- Empty-state layout: HeroCard + QuickActions side by side -->
            <div class="flex gap-5">
              <HeroCard
                :stats="dashboard.stats.value"
                :loading="dashboard.loading.value"
                :error="dashboard.error.value instanceof Error ? dashboard.error.value.message : null"
                :user-name="authStore.user?.name || 'Usuario'"
                :is-empty-state="dashboard.isEmptyState.value"
                :is-new-professional="dashboard.isNewProfessional.value"
                :weather-data="dashboard.weather.value"
                :weather-loading="dashboard.weatherLoading.value"
                :weather-error="dashboard.weatherError.value"
                :show-city-selector="dashboard.showCitySelector.value"
                class="flex-1"
                @select-city="(payload) => dashboard.selectCity(payload.lat, payload.lon)"
              />
              <QuickActions class="w-80" />
            </div>
            <div class="mt-5 flex gap-5">
              <div class="flex-1">
                <PendingReportsWidget
                  :reports="dashboard.pendingReports.value"
                  :loading="dashboard.loading.value"
                  :role="dashboard.role.value"
                />
              </div>
              <div class="flex-1">
                <PatientList
                  :patients="dashboard.patients.value"
                  :loading="dashboard.loading.value"
                />
              </div>
            </div>
          </template>
          <template v-else>
            <!-- Normal layout: HeroCard + PendingReports side by side -->
            <div class="flex gap-5">
              <HeroCard
                :stats="dashboard.stats.value"
                :loading="dashboard.loading.value"
                :error="dashboard.error.value instanceof Error ? dashboard.error.value.message : null"
                :user-name="authStore.user?.name || 'Usuario'"
                :is-empty-state="false"
                :is-new-professional="false"
                :weather-data="dashboard.weather.value"
                :weather-loading="dashboard.weatherLoading.value"
                :weather-error="dashboard.weatherError.value"
                :show-city-selector="dashboard.showCitySelector.value"
                class="flex-1"
                @select-city="(payload) => dashboard.selectCity(payload.lat, payload.lon)"
              />
              <div class="w-80">
                <PendingReportsWidget
                  :reports="dashboard.pendingReports.value"
                  :loading="dashboard.loading.value"
                  :role="dashboard.role.value"
                />
              </div>
            </div>
            <div class="mt-5 flex gap-5">
              <QuickActions class="flex-1" />
              <div class="w-160">
                <PatientList
                  :patients="dashboard.patients.value"
                  :loading="dashboard.loading.value"
                />
              </div>
            </div>
          </template>
        </template>

        </div>
      </main>

      <RightPanel />
    </div>
  </div>

  <ProfileEditModal
    :show="showEditModal"
    :user="authStore.user"
    @close="showEditModal = false"
    @save="onSaveEdited"
  />
  <ChangePasswordModal
    :show="showChangePasswordModal"
    @close="showChangePasswordModal = false"
    @save="onSavePassword"
  />
  <AddressesModal
    :show="showAddressesModal"
    :addresses="addresses"
    @close="showAddressesModal = false"
    @save="onSaveAddresses"
  />
</template>
