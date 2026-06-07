<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBar from "@/shared/components/TopBar.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import EditUserModal from "@/modules/admin/users/presentation/components/EditUserModal.vue";
import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";
import { useUsers } from "@/modules/admin/users/presentation/composables/useUsers";
import { useRoles } from "@/modules/admin/roles/presentation/composables/useRoles";
import { usePermissions } from "@/modules/admin/permissions/presentation/composables/usePermissions";
import ChangePasswordModal from "@/shared/components/ChangePasswordModal.vue";
import AddressesModal from "@/shared/components/AddressesModal.vue";
import UiVuetifyDataTable from "@/shared/components/UiVuetifyDataTable.vue";
import type { AdminUser } from "@/shared/types";

// Type bridge for EditUserModal (has stricter local types than shared)
const userForModal = computed(() => form.value as unknown as Record<string, unknown>);
const rolesForModal = computed(() => allRoles.value as any);
const permsForModal = computed(() => allPermissionsList.value as any);

// --- Local interfaces ---

interface UserPermission {
  id: number | string;
  slug: string;
  grant: number;
  origin: string;
}

interface DataTableColumn {
  key: string;
  field?: string;
  label: string;
  sortable: boolean;
}

interface DataTableFilters {
  global: { value: string | null; matchMode: string };
}

interface UserFormData {
  id?: number | string;
  name: string;
  email: string;
  active?: boolean;
  role?: string | Record<string, unknown>;
  [key: string]: unknown;
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
const { users, loading, fetchUsers, createUser, updateUser, deleteUser } = useUsers();
const { roles: allRoles, fetchRoles: loadRoles } = useRoles();
const { permissions: allPermissionsList, fetchPermissions: loadPerms, loading: loadingPerms } = usePermissions();

// --- Filters and global search ---

const globalFilter = ref<string>("");
const filters = ref<DataTableFilters>({ global: { value: null, matchMode: "contains" } });
watch(globalFilter, (val: string) => {
  filters.value = { global: { value: val, matchMode: "contains" } };
});

const columns: DataTableColumn[] = [
  { key: "name", field: "name", label: "Nombre", sortable: true },
  { key: "email", field: "email", label: "Email", sortable: true },
  { key: "roles", field: "roles", label: "Roles", sortable: false },
  { key: "override", field: "user_permissions", label: "Permisos Individuales", sortable: false },
  { key: "actions", label: "", sortable: false },
];

// --- Local state ---

const localUsers = ref<AdminUser[]>([]);
const editing = ref<boolean>(false);
const isNewUser = ref<boolean>(false);
const form = ref<UserFormData>({ name: "", email: "" });

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
  users,
  (v: AdminUser[]) => {
    localUsers.value = (v || []).map((u: AdminUser) => ({ ...u }));
  },
  { immediate: true }
);

// --- Utility functions ---

function getUserPermissions(user: any): UserPermission[] {
  return ((user?.user_permissions as UserPermission[] | undefined) || []).filter(
    (p: UserPermission) => p.origin === "user"
  );
}

// --- CRUD actions ---

function startNewUser(): void {
  editing.value = true;
  isNewUser.value = true;
  form.value = { id: Date.now(), name: "", email: "", active: true };
}

function startEditUser(u: any): void {
  const user = u as AdminUser;
  editing.value = true;
  isNewUser.value = false;
  form.value = { ...user } as UserFormData;
  if (form.value.role) delete form.value.role;
}

function confirmDeactivate(u: any): void {
  const isActive = u.active !== false;
  if (!confirm(isActive ? "Desactivar usuario?" : "Reactivar usuario?")) return;
  deleteUser(u.id as number | string).catch((err: unknown) => console.warn("UsersPage: deleteUser failed", err));
}

function cancelEditUser(): void {
  editing.value = false;
  isNewUser.value = false;
  form.value = { name: "", email: "" };
}

async function handleSaveUser(payload: Record<string, unknown>): Promise<void> {
  if (isNewUser.value) {
    await createUser(payload);
    editing.value = false;
    isNewUser.value = false;
    form.value = { name: "", email: "" };
  } else {
    const payloadToSend: Record<string, unknown> = { ...(payload || {}) };
    if (payloadToSend.id) delete payloadToSend.id;
    await updateUser(form.value.id!, payloadToSend);
    editing.value = false;
    isNewUser.value = false;
    form.value = { name: "", email: "" };
  }
}

const handleSaveUserBridge = (payload: any) => handleSaveUser(payload);

function saveUser(payload?: Record<string, unknown>): Promise<void> {
  const p = payload ?? (form.value as unknown as Record<string, unknown>);
  return handleSaveUser(p).catch((_err: unknown) => {
    // Rejection handled upstream by modal/caller
  });
}

defineExpose({ saveUser });

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
  { text: "Usuarios", icon: "pi pi-user" },
];

// --- Lifecycle ---

onMounted(async () => {
  await authStore.fetchUser();
  fetchUsers();
  loadRoles();
  loadPerms();
});
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#f5f3ff]">
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
          v-if="authStore.hasPermission('admin.user.view')"
          class="card p-6 flex flex-col flex-1 min-h-0"
        >
          <h1 class="text-2xl font-bold mb-4 text-primary">
            <i class="pi pi-user text-primary" style="font-size: 1.1rem" aria-hidden="true"></i>
            Usuarios
          </h1>

          <div v-if="loading" class="text-sm text-slate-500">Cargando usuarios...</div>

          <div v-else>
            <div class="flex items-center justify-between gap-3 mb-3">
              <div class="relative flex-1 md:max-w-xs">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-[#9690a8] text-sm pointer-events-none" />
                <input
                  v-model="globalFilter"
                  placeholder="Buscar usuarios..."
                  aria-label="Buscar usuarios"
                  class="form-input pl-9 pr-8"
                />
                <button
                  v-if="globalFilter"
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-[#9690a8] hover:text-[#6b6b7b] transition-colors"
                  @click="globalFilter = ''"
                >
                  <i class="pi pi-times text-sm" />
                </button>
              </div>
              <button
                v-has-permission="'admin.user.create'"
                class="btn btn-primary whitespace-nowrap"
                @click="startNewUser"
              >
                + Agregar usuario
              </button>
            </div>

            <div class="flex-1 min-h-0">
              <UiVuetifyDataTable
                class="users-table"
                :value="localUsers"
                data-key="id"
                :filters="filters"
                :global-filter-fields="['name', 'email']"
                :columns="columns"
              >
                <template #body-name="{ data }">
                  <div class="px-3 py-2 text-sm">{{ data?.name }}</div>
                </template>

                <template #body-email="{ data }">
                  <div class="px-3 py-2 text-sm">{{ data?.email }}</div>
                </template>

                <template #body-roles="{ data }">
                  <div class="px-3 py-2 flex flex-wrap gap-1">
                    <span
                      v-for="role in data?.roles || []"
                      :key="role.id"
                      class="badge badge--primary text-xs"
                    >
                      {{ role.name }}
                    </span>
                    <span v-if="!data?.roles?.length" class="text-sm text-slate-400">-</span>
                  </div>
                </template>

                <template #body-override="{ data }">
                  <div class="px-3 py-2 flex flex-wrap gap-1">
                    <template v-for="perm in getUserPermissions(data)" :key="perm.id">
                      <span v-if="perm.grant === 1" class="badge badge--success text-xs"
                        >+ {{ perm.slug }}</span
                      >
                      <span v-else-if="perm.grant === -1" class="badge badge--danger text-xs"
                        >- {{ perm.slug }}</span
                      >
                    </template>
                    <span v-if="!getUserPermissions(data).length" class="text-sm text-slate-400"
                      >-</span
                    >
                  </div>
                </template>

                <template #body-actions="{ data }">
                  <div class="px-3 py-2 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        v-has-permission="'admin.user.update'"
                        aria-label="Editar"
                        class="icon-action group"
                        @click="startEditUser(data)"
                      >
                        <i
                          class="pi pi-pencil h-4 w-4 transition-colors duration-150 text-current group-hover:text-primary"
                        ></i>
                      </button>
                      <button
                        v-has-permission="'admin.user.delete'"
                        :aria-label="data?.active === false ? 'Reactivar' : 'Desactivar'"
                        :class="[
                          'icon-action group',
                          data?.active === false
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-amber-500 text-white hover:bg-amber-600',
                        ]"
                        @click="confirmDeactivate(data)"
                      >
                        <i class="pi pi-ban h-4 w-4 transition-colors duration-150"></i>
                      </button>
                    </div>
                  </div>
                </template>

                <template #empty>
                  <div class="px-3 py-4 text-center text-[#9690a8]">No hay usuarios para mostrar.</div>
                </template>
              </UiVuetifyDataTable>
            </div>

            <!-- Usuario Modal - usando EditUserModal para roles y permisos -->
            <EditUserModal
              :show="editing"
              :user="userForModal"
              :roles="rolesForModal"
              :permissions="permsForModal"
              :loading-permissions="loadingPerms"
              :is-new="isNewUser"
              @close="cancelEditUser"
              @save="handleSaveUserBridge"
            />
          </div>
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

<style scoped>
.users-table :deep(.v-data-table__table > thead > tr > th) {
  padding: 0 !important;
  height: auto !important;
  background-color: #f5f3ff !important;
  border: none !important;
}

.users-table :deep(.v-data-table__table > thead > tr > th > div) {
  padding: 10px 12px;
  color: #7c3aed !important;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-bottom: 2px solid rgba(124, 58, 237, 0.12);
  width: 100% !important;
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  box-sizing: border-box;
}

.users-table :deep(.v-data-table__table > thead > tr > th .mdi-swap-vertical) {
  color: #c4b5e3 !important;
}

.users-table :deep(.v-data-table__table > thead > tr > th .mdi-arrow-up),
.users-table :deep(.v-data-table__table > thead > tr > th .mdi-arrow-down) {
  color: #7c3aed !important;
}

.users-table :deep(.v-data-table__table > tbody > tr) {
  background-color: #ffffff !important;
  transition: background-color 0.12s ease;
}

.users-table :deep(.v-data-table__table > tbody > tr:hover) {
  background-color: #faf9ff !important;
}

.users-table :deep(.v-data-table__table > tbody > tr:nth-child(even)) {
  background-color: #fcfbff !important;
}

.users-table :deep(.v-data-table__table > tbody > tr:nth-child(even):hover) {
  background-color: #f6f3ff !important;
}

.users-table :deep(.v-data-table__table > tbody > tr > td) {
  border-bottom: 1px solid rgba(124, 58, 237, 0.05) !important;
  padding: 10px 12px !important;
}

.users-table :deep(.v-data-table__table > tbody > tr:last-child > td) {
  border-bottom: none !important;
}
</style>
