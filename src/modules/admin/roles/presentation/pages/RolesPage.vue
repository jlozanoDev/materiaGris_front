<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBar from "@/shared/components/TopBar.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import Modal from "@/shared/components/Modal.vue";
import EditUserModal from "@/modules/admin/users/presentation/components/EditUserModal.vue";
import ChangePasswordModal from "@/shared/components/ChangePasswordModal.vue";
import AddressesModal from "@/shared/components/AddressesModal.vue";
import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";
import { useRoles } from "@/modules/admin/roles/presentation/composables/useRoles";
import { usePermissions } from "@/modules/admin/permissions/presentation/composables/usePermissions";
import UiVuetifyDataTable from "@/shared/components/UiVuetifyDataTable.vue";
import RolePermissionsEditor from "@/modules/admin/roles/presentation/components/RolePermissionsEditor.vue";
import { useToast } from "@/shared/composables/useToast";
import type { Role, PermissionShape } from "@/shared/types";

// --- Local interfaces ---

interface PermissionGrant {
  id: number;
  grant: number;
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

interface RoleFormData {
  id?: number | string;
  name: string;
  description: string;
  permissions: PermissionGrant[];
  is_system?: boolean;
  users_count?: number;
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
const { fetchPermissions: fetchAllPermissions } = usePermissions();
const {
  roles,
  loading,
  fetchRoles,
  fetchRole,
  createRole,
  updateRole,
  deleteRole,
  availablePermissions,
  fetchAvailablePermissions,
} = useRoles(fetchAllPermissions);
const { show: showToast } = useToast();

// --- Filters and global search ---

const globalFilter = ref<string>("");
const filters = ref<DataTableFilters>({ global: { value: null, matchMode: "contains" } });
watch(globalFilter, (val: string) => {
  filters.value = { global: { value: val, matchMode: "contains" } };
});

const columns: DataTableColumn[] = [
  { key: "name", field: "name", label: "Nombre del Rol", sortable: true },
  { key: "description", field: "description", label: "Descripción", sortable: true },
  { key: "users_count", field: "users_count", label: "Usuarios", sortable: true },
  { key: "actions", label: "", sortable: false },
];

// --- Local state ---

const localRoles = ref<Role[]>([]);
const editing = ref<boolean>(false);
const isNewRole = ref<boolean>(false);
const form = ref<RoleFormData>({ name: "", description: "", permissions: [] });
const loadingRole = ref<boolean>(false);
const editorRef = ref<InstanceType<typeof RolePermissionsEditor> | null>(null);

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
  roles,
  (v: Role[]) => {
    localRoles.value = (v || []).map((r: Role) => ({ ...r }));
  },
  { immediate: true }
);

// --- CRUD actions ---

async function startNewRole(): Promise<void> {
  editing.value = true;
  isNewRole.value = true;
  form.value = { name: "", description: "", permissions: [] };
  if (availablePermissions.value.length === 0) {
    await fetchAvailablePermissions();
  }
}

async function startEditRole(r: any): Promise<void> {
  const role = r as Role;
  editing.value = true;
  isNewRole.value = false;
  loadingRole.value = true;

  try {
    if (availablePermissions.value.length === 0) {
      await fetchAvailablePermissions();
    }
    const fullRole = await fetchRole(role.id);
    form.value = { ...(fullRole as RoleFormData) };
  } catch (err: unknown) {
    showToast("Error al cargar el rol", "error");
    editing.value = false;
  } finally {
    loadingRole.value = false;
  }
}

function cancelEdit(): void {
  editing.value = false;
  isNewRole.value = false;
  form.value = { name: "", description: "", permissions: [] };
}

async function saveRole(): Promise<void> {
  try {
    if (isNewRole.value) {
      await createRole(form.value as unknown as Record<string, unknown>);
      showToast("Rol creado exitosamente", "success");
    } else {
      await updateRole(form.value.id!, form.value as unknown as Record<string, unknown>);
      showToast("Rol actualizado exitosamente", "success");
    }
    editing.value = false;
  } catch (err: unknown) {
    showToast((err as { message?: string }).message || "Error al guardar el rol", "error");
  }
}

async function confirmDelete(r: any): Promise<void> {
  const role = r as Role & { is_system?: boolean };
  if (role.is_system) {
    showToast("No se pueden eliminar roles del sistema", "warning");
    return;
  }

  if (
    !confirm(
      `¿Estás seguro de eliminar el rol "${role.name}"? Los usuarios vinculados podrían perder acceso.`
    )
  )
    return;

  try {
    await deleteRole(role.id);
    showToast("Rol eliminado exitosamente", "success");
  } catch (err: unknown) {
    showToast((err as { message?: string }).message || "Error al eliminar el rol", "error");
  }
}

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
  { text: "Seguridad", icon: "pi pi-shield" },
  { text: "Roles", icon: "pi pi-users" },
];

// --- Lifecycle ---

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser();
  fetchRoles();
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
          v-if="authStore.hasPermission('admin.role.view')"
          class="card p-6 flex flex-col flex-1 min-h-0"
        >
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl text-indigo-600 font-bold flex items-center gap-2">
              <i class="pi pi-users text-indigo-600" style="font-size: 1.5rem"></i>
              Gestión de Roles
            </h1>
          </div>

          <div v-if="loading && !editing" class="text-sm text-slate-500">Cargando roles...</div>

          <div v-else>
            <div class="flex items-center justify-between mb-3">
              <input
                v-model="globalFilter"
                placeholder="Buscar roles..."
                aria-label="Buscar roles"
                class="form-input md:w-1/3"
              />
              <div class="ml-4">
                <button
                  v-has-permission="'admin.role.create'"
                  class="btn btn-primary flex items-center gap-2"
                  @click="startNewRole"
                >
                  <i class="pi pi-plus"></i>
                  Agregar Rol
                </button>
              </div>
            </div>

            <div class="flex-1 min-h-0">
              <UiVuetifyDataTable
                class="roles-table"
                :value="localRoles"
                data-key="id"
                :filters="filters"
                :global-filter-fields="['name', 'description']"
                :columns="columns"
              >
                <template #body-name="{ data }">
                  <div class="px-3 py-2">
                    <span class="font-semibold text-slate-800">{{ data.name }}</span>
                    <span
                      v-if="data.is_system"
                      class="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded uppercase"
                      >Sistema</span
                    >
                  </div>
                </template>

                <template #body-description="{ data }">
                  <div class="px-3 py-2 text-sm text-slate-600">{{ data.description || "-" }}</div>
                </template>

                <template #body-users_count="{ data }">
                  <div class="px-3 py-2 text-sm text-center">
                    <span class="px-2 py-1 bg-slate-100 rounded-full text-slate-600 font-medium">{{
                      data.users_count
                    }}</span>
                  </div>
                </template>

                <template #body-actions="{ data }">
                  <div class="px-3 py-2 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        v-has-permission="'admin.role.update'"
                        aria-label="Editar"
                        class="icon-action group"
                        @click="startEditRole(data)"
                      >
                        <i
                          class="pi pi-pencil h-4 w-4 transition-colors duration-150 text-current group-hover:text-indigo-600"
                        ></i>
                      </button>
                      <button
                        v-if="!data.is_system"
                        v-has-permission="'admin.role.delete'"
                        aria-label="Eliminar"
                        class="icon-action group hover:bg-red-50"
                        @click="confirmDelete(data)"
                      >
                        <i
                          class="pi pi-trash h-4 w-4 transition-colors duration-150 text-current group-hover:text-red-600"
                        ></i>
                      </button>
                    </div>
                  </div>
                </template>

                <template #empty>
                  <div class="px-3 py-4 text-slate-500">No hay roles configurados.</div>
                </template>
              </UiVuetifyDataTable>
            </div>

            <!-- Rol Modal -->
            <Modal :show="editing" size="xl" @close="cancelEdit">
              <template #header>
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-xl font-bold text-slate-800">
                    {{ isNewRole ? "Crear Nuevo Perfil" : "Configurar Perfil: " + form.name }}
                  </h3>
                </div>
              </template>

              <div
                v-if="loadingRole"
                class="py-20 flex flex-col items-center justify-center text-slate-500"
              >
                <i class="pi pi-spin pi-spinner text-4xl mb-4"></i>
                Cargando configuración...
              </div>

              <div v-else class="space-y-6">
                <form class="space-y-6" @submit.prevent="saveRole">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-1"
                        >Nombre del Perfil</label
                      >
                      <input
                        v-model="form.name"
                        placeholder="Ej: Administrador Clínico"
                        class="form-input"
                        required
                        :disabled="form.is_system"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-1"
                        >Descripción Funcional</label
                      >
                      <input
                        v-model="form.description"
                        placeholder="Breve descripción de responsabilidades"
                        class="form-input"
                        :disabled="form.is_system"
                      />
                    </div>
                  </div>

                  <div class="border-t border-slate-200 pt-4">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-sm font-bold text-indigo-600 uppercase tracking-widest">
                        Matriz de Control de Permisos
                      </h4>
                      <div class="flex gap-2">
                        <button
                          type="button"
                          class="text-[10px] font-bold uppercase tracking-tight text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                          @click="editorRef?.expandAll()"
                        >
                          <i class="pi pi-plus-circle"></i> Desplegar todo
                        </button>
                        <span class="text-slate-300">|</span>
                        <button
                          type="button"
                          class="text-[10px] font-bold uppercase tracking-tight text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
                          @click="editorRef?.collapseAll()"
                        >
                          <i class="pi pi-minus-circle"></i> Plegar todo
                        </button>
                      </div>
                    </div>
                    <RolePermissionsEditor
                      ref="editorRef"
                      v-model="form.permissions"
                      :available-permissions="availablePermissions"
                    />
                  </div>

                  <div class="border-t border-slate-200 pt-4">
                    <p class="text-xs text-slate-500 mb-3">
                      <span class="font-semibold text-green-600">Permitir</span>: concede el permiso
                      al rol.
                      <br />
                      <span class="font-semibold text-red-600">Denegar</span>: deniega
                      explícitamente el permiso en el rol; aunque otro rol lo conceda, este
                      prevalece y no lo permitirá.
                      <br />
                      <span class="font-semibold text-slate-400">Neutral</span>: ni concedido ni
                      denegado.
                    </p>
                    <div class="flex justify-end gap-3">
                      <button type="button" class="btn btn-ghost" @click="cancelEdit">
                        Cancelar
                      </button>
                      <button type="submit" class="btn btn-primary px-8">Guardar Cambios</button>
                    </div>
                  </div>
                </form>
              </div>
            </Modal>
          </div>
        </div>
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center p-10 bg-white rounded-xl shadow-sm border border-slate-200">
            <i class="pi pi-lock text-slate-300 text-6xl mb-4"></i>
            <h2 class="text-xl font-bold text-slate-700">Acceso Denegado</h2>
            <p class="text-slate-500">No tienes permisos para gestionar roles.</p>
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
.roles-table :deep(.v-data-table__wrapper) {
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
