<script setup>
import { onMounted, ref } from "vue";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBar from "@/shared/components/TopBar.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import HeroCard from "@/modules/dashboard/presentation/components/HeroCard.vue";
import PatientList from "@/modules/dashboard/presentation/components/PatientList.vue";
import ConsultationPanel from "@/modules/dashboard/presentation/components/ConsultationPanel.vue";
import RightPanel from "@/modules/dashboard/presentation/components/RightPanel.vue";
import EditUserModal from "@/modules/admin/users/presentation/components/EditUserModal.vue";
import ChangePasswordModal from "@/modules/admin/users/presentation/components/ChangePasswordModal.vue";
import AddressesModal from "@/modules/admin/users/presentation/components/AddressesModal.vue";

import { useAuthStore } from "@/core/store/auth";
const authStore = useAuthStore();

const showEditModal = ref(false);
const showChangePasswordModal = ref(false);
const showAddressesModal = ref(false);
const addresses = ref([]);

function loadAddresses() {
  try {
    const stored = localStorage.getItem("addresses");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
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

const onSaveEdited = (edited) => {
  authStore.user = { ...authStore.user, ...edited };
  try {
    localStorage.setItem("user", JSON.stringify(authStore.user));
  } catch (e) {}
};

const onSavePassword = ({ password, oldPassword }) => {
  console.log("[DashboardPage] password change requested (frontend-only)");
  try {
    localStorage.setItem("passwordChangedAt", new Date().toISOString());
  } catch (e) {}
};

const onSaveAddresses = (newAddresses) => {
  addresses.value = newAddresses;
  try {
    localStorage.setItem("addresses", JSON.stringify(addresses.value));
  } catch (e) {}
};

const breadcrumb = [{ text: "Dashboard", icon: "pi pi-objects-column", to: "/" }];

onMounted(() => {
  authStore.fetchUser();
});
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#EEF2FF]">
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
