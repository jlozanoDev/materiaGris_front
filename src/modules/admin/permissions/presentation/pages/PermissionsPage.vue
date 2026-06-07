<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBar from "@/shared/components/TopBar.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";
import UiVuetifyDataTable from "@/shared/components/UiVuetifyDataTable.vue";
import { usePermissions } from "@/modules/admin/permissions/presentation/composables/usePermissions";
import EditUserModal from "@/modules/admin/users/presentation/components/EditUserModal.vue";
import ChangePasswordModal from "@/shared/components/ChangePasswordModal.vue";
import AddressesModal from "@/shared/components/AddressesModal.vue";
import type { PermissionShape } from "@/shared/types";

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

interface Address {
  id: number;
  alias: string;
  street: string;
  number: string;
  postal_code: string;
  mobile_phone: string;
  is_primary: boolean;
}

interface BreadcrumbItem {
  text: string;
  icon?: string;
  to?: string;
}

// --- Composables ---

const authStore = useAuthStore();
const { logout } = useLogout();
const { permissions, loading, fetchPermissions } = usePermissions();

// --- Filters and global search ---

const globalFilter = ref<string>("");
const filters = ref<DataTableFilters>({ global: { value: null, matchMode: "contains" } });
watch(globalFilter, (val: string) => {
  filters.value = { global: { value: val, matchMode: "contains" } };
});

const columns: DataTableColumn[] = [
  { key: "slug", field: "slug", label: "Slug", sortable: true },
  { key: "name", field: "name", label: "Nombre", sortable: true },
  { key: "category", field: "category", label: "Categoría", sortable: true },
  { key: "description", field: "description", label: "Descripción", sortable: false },
];

// --- Local state ---

const localPermissions = ref<PermissionShape[]>([]);

const showProfileEditModal = ref<boolean>(false);
const showChangePasswordModal = ref<boolean>(false);
const showAddressesModal = ref<boolean>(false);
const addresses = ref<Address[]>([]);

function loadAddresses(): Address[] {
  try {
    const stored = localStorage.getItem("addresses");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed as Address[];
    }
  } catch (e) { /* noop */ }
  return [
    { id: 1, alias: "Casa", street: "C. Falsa", number: "123", postal_code: "28001", mobile_phone: "600123456", is_primary: true },
    { id: 2, alias: "Oficina", street: "Av. Siempre Viva", number: "742", postal_code: "28002", mobile_phone: "600654321", is_primary: false },
  ];
}
addresses.value = loadAddresses();

watch(
  permissions,
  (v: PermissionShape[]) => {
    localPermissions.value = (v || []).map((p: PermissionShape) => ({ ...p }));
  },
  { immediate: true }
);

const onSaveEdited = (_edited: unknown): void => {
  const edited = _edited as { name?: string };
  if (authStore.user) {
    (authStore.user as unknown as Record<string, unknown>).name = edited.name ?? authStore.user.name;
  }
  try {
    localStorage.setItem("user", JSON.stringify(authStore.user));
  } catch (e) { /* noop */ }
};

const onSavePassword = (): void => {
  try {
    localStorage.setItem("passwordChangedAt", new Date().toISOString());
  } catch (e) { /* noop */ }
};

const onSaveAddresses = (newAddresses: Address[]): void => {
  addresses.value = newAddresses;
  try {
    localStorage.setItem("addresses", JSON.stringify(addresses.value));
  } catch (e) { /* noop */ }
};

// --- Breadcrumb ---

const breadcrumb: BreadcrumbItem[] = [
  { text: "Dashboard", icon: "pi pi-objects-column", to: "/" },
  { text: "Permisos", icon: "pi pi-shield" },
];

// --- Lifecycle ---

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser();
  if (authStore.hasPermission("admin.permission.view")) {
    fetchPermissions();
  }
});
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#EEF2FF]">
    <AppSidebar />

    <div class="flex flex-1 min-w-0 overflow-hidden">
      <main class="flex flex-1 min-w-0 flex-col p-5 gap-5 min-h-0">
        <div class="flex flex-col gap-0 shrink-0 relative z-10">
          <Breadcrumb :items="breadcrumb" />
          <TopBar
            :user="authStore.user"
            @open-edit="showProfileEditModal = true"
            @open-change-password="showChangePasswordModal = true"
            @manage-addresses="showAddressesModal = true"
            @logout="logout"
          />
        </div>

        <div class="flex-1 overflow-y-auto min-h-0">
        <div
          v-if="authStore.hasPermission('admin.permission.view')"
          class="card p-6 flex flex-col flex-1 min-h-0"
        >
          <h1 class="text-2xl text-indigo-600 font-bold mb-4">
            <i
              class="pi pi-shield text-indigo-600"
              style="font-size: 1.1rem"
              aria-hidden="true"
            ></i>
            Permisos
          </h1>

          <div v-if="loading" class="card p-6">
            <div class="flex items-center justify-between mb-3">
              <div class="h-10 bg-slate-200 rounded-md w-1/3 animate-pulse" />
            </div>
            <div class="space-y-0">
              <div
                v-for="i in 8"
                :key="i"
                class="flex items-center gap-4 py-3 border-b border-slate-100 last:border-b-0"
              >
                <div class="h-4 bg-slate-200 rounded w-1/5 animate-pulse" />
                <div class="h-4 bg-slate-200 rounded w-1/5 animate-pulse" />
                <div class="h-4 bg-slate-200 rounded w-1/6 animate-pulse" />
                <div class="h-4 bg-slate-200 rounded w-2/5 animate-pulse" />
              </div>
            </div>
          </div>

          <div v-else>
            <div class="flex items-center justify-between mb-3">
              <input
                v-model="globalFilter"
                placeholder="Buscar..."
                aria-label="Buscar permisos"
                class="form-input md:w-1/3"
              />
            </div>

            <div class="flex-1 min-h-0">
              <UiVuetifyDataTable
                class="permissions-table"
                :value="localPermissions"
                data-key="id"
                :filters="filters"
                :global-filter-fields="['slug', 'name', 'category', 'description']"
                :columns="columns"
                :paginator="true"
                :rows="10"
                :rows-per-page-options="[5, 10, 25, 50]"
              >
                <template #body-slug="{ data }">
                  <div class="px-3 py-2 text-sm font-mono text-indigo-600">{{ data.slug }}</div>
                </template>

                <template #body-name="{ data }">
                  <div class="px-3 py-2 text-sm">{{ data.name }}</div>
                </template>

                <template #body-category="{ data }">
                  <div class="px-3 py-2 text-sm">
                    <span
                      class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs uppercase font-semibold"
                      >{{ data.category }}</span
                    >
                  </div>
                </template>

                <template #body-description="{ data }">
                  <div class="px-3 py-2 text-sm text-slate-500">{{ data.description }}</div>
                </template>

                <template #empty>
                  <div class="px-3 py-4 text-slate-500">
                    No hay permisos para mostrar o no tienes privilegios suficientes.
                  </div>
                </template>
              </UiVuetifyDataTable>
            </div>
          </div>
        </div>
        <div v-else class="card p-6 flex items-center justify-center">
          <p class="text-slate-500">No tienes permiso para ver esta sección.</p>
        </div>
        </div>
      </main>
    </div>
  </div>

  <EditUserModal
    :show="showProfileEditModal"
    :user="authStore.user"
    @close="showProfileEditModal = false"
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
