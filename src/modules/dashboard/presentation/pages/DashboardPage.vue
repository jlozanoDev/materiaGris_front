<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBar from "@/shared/components/TopBar.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import HeroCard from "@/modules/dashboard/presentation/components/HeroCard.vue";
import PatientList from "@/modules/dashboard/presentation/components/PatientList.vue";
import ConsultationPanel from "@/modules/dashboard/presentation/components/ConsultationPanel.vue";
import RightPanel from "@/modules/dashboard/presentation/components/RightPanel.vue";
import EditUserModal from "@/modules/admin/users/presentation/components/EditUserModal.vue";
import ChangePasswordModal from "@/shared/components/ChangePasswordModal.vue";
import AddressesModal from "@/shared/components/AddressesModal.vue";

import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";
import LocalStorageGateway from "@/modules/auth/infrastructure/LocalStorageGateway";

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
  } catch (e) { /* noop */ }
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
  } catch (e) { /* noop */ }
};

const onSavePassword = (): void => {
  console.log("[DashboardPage] password change requested (frontend-only)");
  try {
    storage.set("passwordChangedAt", new Date().toISOString());
  } catch (e) { /* noop */ }
};

const onSaveAddresses = (newAddresses: Address[]): void => {
  addresses.value = newAddresses;
  try {
    storage.set("addresses", JSON.stringify(addresses.value));
  } catch (e) { /* noop */ }
};

const breadcrumb = [{ text: "Dashboard", icon: "pi pi-objects-column", to: "/" }];

onMounted(() => {
  authStore.fetchUser();
});
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#f5f3ff]">
    <AppSidebar />

    <div class="flex flex-1 min-w-0 overflow-hidden">
      <main class="flex flex-1 min-w-0 flex-col overflow-y-auto p-5 gap-5">
        <div class="flex flex-col gap-1">
          <Breadcrumb :items="breadcrumb" />
          <TopBar
            :user="authStore.user"
            @open-edit="showEditModal = true"
            @open-change-password="showChangePasswordModal = true"
              @manage-addresses="showAddressesModal = true"
              @logout="logout"
          />
        </div>
        <div class="flex gap-5">
          <HeroCard :user="authStore.user" class="flex-1" />
          <div class="w-160">
            <PatientList />
          </div>
        </div>
        <div class="mt-5">
          <ConsultationPanel />
        </div>
      </main>

      <RightPanel />
    </div>
  </div>

  <EditUserModal
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
