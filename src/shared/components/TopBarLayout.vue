<script setup lang="ts">
import { ref } from "vue";
import TopBar from "@/shared/components/TopBar.vue";
import EditUserModal from "@/modules/admin/users/presentation/components/EditUserModal.vue";
import ChangePasswordModal from "@/shared/components/ChangePasswordModal.vue";
import AddressesModal from "@/shared/components/AddressesModal.vue";
import { useAuthStore } from "@/core/store/auth";
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

interface Props {
  user?: { name?: string; email?: string } | null;
}

withDefaults(defineProps<Props>(), { user: null });

const emit = defineEmits<{ logout: [] }>();

const authStore = useAuthStore();
const storage = new LocalStorageGateway();

const showEditModal = ref<boolean>(false);
const showChangePasswordModal = ref<boolean>(false);
const showAddressesModal = ref<boolean>(false);
const addresses = ref<Address[]>(loadAddresses());

function loadAddresses(): Address[] {
  try {
    const stored = storage.get("addresses");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed as Address[];
    }
  } catch { /* noop */ }
  return [
    { id: 1, alias: "Casa", street: "C. Falsa", number: "123", postal_code: "28001", mobile_phone: "600123456", is_primary: true },
    { id: 2, alias: "Oficina", street: "Av. Siempre Viva", number: "742", postal_code: "28002", mobile_phone: "600654321", is_primary: false },
  ];
}

function onSaveEdited(_edited: unknown): void {
  const edited = _edited as { name?: string };
  if (authStore.user) {
    (authStore.user as unknown as Record<string, unknown>).name = edited.name ?? authStore.user.name;
  }
  try {
    storage.set("user", JSON.stringify(authStore.user));
  } catch { /* noop */ }
}

function onSavePassword(): void {
  try {
    storage.set("passwordChangedAt", new Date().toISOString());
  } catch { /* noop */ }
}

function onSaveAddresses(newAddresses: Address[]): void {
  addresses.value = newAddresses;
  try {
    storage.set("addresses", JSON.stringify(addresses.value));
  } catch { /* noop */ }
}
</script>

<template>
  <TopBar
    :user="user"
    @open-edit="showEditModal = true"
    @open-change-password="showChangePasswordModal = true"
    @manage-addresses="showAddressesModal = true"
    @logout="emit('logout')"
  />

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
