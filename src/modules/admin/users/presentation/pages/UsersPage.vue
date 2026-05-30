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
  <div class="flex h-screen overflow-hidden bg-[#EEF2FF]">
    <AppSidebar />

    <div class="flex flex-1 min-w-0 overflow-hidden">
      <main class="flex flex-1 min-w-0 flex-col overflow-y-auto p-5 gap-5">
        <div class="flex flex-col gap-0">
          <Breadcrumb :items="breadcrumb" />
          <TopBar :user="authStore.user" @logout="logout" />
        </div>

        <div
          v-if="authStore.hasPermission('admin.user.view')"
          class="card p-6 flex flex-col flex-1 min-h-0"
        >
          <h1 class="text-2xl text-indigo-600 font-bold mb-4">
            <i class="pi pi-user text-indigo-600" style="font-size: 1.1rem" aria-hidden="true"></i>
            Usuarios
          </h1>

          <div v-if="loading" class="text-sm text-slate-500">Cargando usuarios...</div>

          <div v-else>
            <div class="flex items-center justify-between mb-3">
              <input
                v-model="globalFilter"
                placeholder="Buscar..."
                aria-label="Buscar usuarios"
                class="form-input md:w-1/3"
              />
              <div class="ml-4">
                <button
                  v-has-permission="'admin.user.create'"
                  class="btn btn-primary"
                  @click="startNewUser"
                >
                  Agregar usuario
                </button>
              </div>
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
                          class="pi pi-pencil h-4 w-4 transition-colors duration-150 text-current group-hover:text-indigo-600"
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
                  <div class="px-3 py-4 text-slate-500">No hay usuarios para mostrar.</div>
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
      </main>
    </div>
  </div>
</template>
