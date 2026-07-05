<template>
  <Modal :show="show" size="lg" icon-class="h-6 w-6 text-[#7c3aed]" @close="close">
    <template #icon>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-3-3.87" />
        <path d="M4 21v-2a4 4 0 013-3.87" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </template>
    <template #header>
      <h3 class="text-lg font-semibold text-[#0b0817]">
        {{ isNewUser ? "Crear usuario" : "Editar usuario" }}
      </h3>
    </template>

    <form id="edit-user-form" class="space-y-6" @submit.prevent="onSave">
      <!-- Información general -->
      <div>
        <h4 class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed] mb-3">
          Información general
        </h4>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Nombre</label>
            <input v-model="name" type="text" placeholder="Nombre completo" class="form-input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Email</label>
            <template v-if="isNewUser">
              <input v-model="email" type="email" placeholder="correo@ejemplo.com" class="form-input" required />
            </template>
            <template v-else>
              <input
                :value="email"
                readonly
                aria-readonly="true"
                type="email"
                class="form-input readonly-input"
              />
              <p class="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <svg class="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                No es posible cambiar el email
              </p>
            </template>
          </div>
        </div>
      </div>

      <hr class="border-[rgba(124,58,237,0.08)]" />

      <!-- Roles (solo-lectura: requiere que /auth/me incluya campo "roles") -->
      <div v-if="isProfileReadonly && selectedRoleIds.length > 0">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed] mb-3">
          Roles
        </h4>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="roleId in selectedRoleIds"
            :key="'badge-' + roleId"
            class="badge badge--primary"
          >
            {{ getRoleName(roleId) }}
          </span>
        </div>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed]">
            Roles
          </h4>
          <div v-if="selectedRoleIds.length > 0" class="flex flex-wrap gap-1">
            <span
              v-for="roleId in selectedRoleIds"
              :key="'badge-' + roleId"
              class="badge badge--primary"
            >
              {{ getRoleName(roleId) }}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div
            v-for="role in availableRoles"
            :key="role.id"
            class="border border-[rgba(124,58,237,0.10)] rounded-lg overflow-hidden"
            :class="selectedRoleIds.includes(role.id) ? 'bg-[#ede9fe]' : 'bg-white'"
          >
            <div class="flex items-center gap-2 px-3 py-2.5">
              <label
                :class="[
                  'flex items-center gap-3 flex-1 min-w-0 cursor-pointer',
                ]"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded flex items-center justify-center border-2 transition-all duration-150 shrink-0',
                    selectedRoleIds.includes(role.id)
                      ? 'bg-[#7c3aed] border-[#7c3aed]'
                      : 'border-[#c4b5e3] bg-white',
                  ]"
                >
                  <svg v-if="selectedRoleIds.includes(role.id)" class="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <input
                  type="checkbox"
                  :value="role.id"
                  :checked="selectedRoleIds.includes(role.id)"
                  class="sr-only"
                  @change="toggleRole(role.id)"
                />
                <span class="text-sm font-medium text-[#0b0817] truncate">{{ role.name }}</span>
              </label>
              <span v-if="role.is_system" class="badge badge--secondary text-xs shrink-0">Sistema</span>
              <button
                type="button"
                :class="[
                  'inline-flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150 shrink-0',
                  roleExpanded[role.id] ? 'bg-[#ede9fe] text-[#7c3aed]' : 'text-[#9690a8] hover:text-[#7c3aed] hover:bg-[#f5f3ff]',
                ]"
                :title="roleExpanded[role.id] ? 'Ocultar permisos' : 'Ver permisos'"
                @click.stop="toggleRoleExpanded(role.id)"
              >
                <svg
                  :class="['h-3.5 w-3.5 transition-transform duration-200', roleExpanded[role.id] ? 'rotate-180' : '']"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
            <transition name="collapse">
              <div v-if="roleExpanded[role.id]" class="px-3 pb-2.5">
                <div v-if="(rolePermissionsTree[role.id] || []).length === 0" class="text-xs text-[#9690a8] italic">
                  Sin permisos
                </div>
                <div
                  v-for="cat in (rolePermissionsTree[role.id] || [])"
                  :key="cat.name"
                  class="mb-2 last:mb-0"
                >
                  <button
                    type="button"
                    class="flex items-center gap-1.5 w-full text-left text-[11px] font-semibold text-[#7c3aed] uppercase tracking-wider mb-1 hover:text-[#6d28d9] transition-colors"
                    @click="toggleCategoryExpanded(role.id, cat.name)"
                  >
                    <svg
                      :class="['h-3 w-3 transition-transform duration-200', categoryExpanded[`${role.id}-${cat.name}`] ? 'rotate-90' : '']"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    {{ cat.name }}
                    <span class="text-[10px] text-[#9690a8] font-normal normal-case ml-1">({{ cat.permissions.length }})</span>
                  </button>
                  <transition name="collapse">
                    <div v-if="categoryExpanded[`${role.id}-${cat.name}`]" class="space-y-0.5">
                      <div
                        v-for="perm in cat.permissions"
                        :key="perm.slug"
                        class="text-xs text-[#6b6b7b] flex items-center gap-1.5"
                      >
                        <svg class="h-3 w-3 text-[#7c3aed] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {{ perm.name || perm.slug }}
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <hr class="border-[rgba(124,58,237,0.08)]" />

      <!-- Permisos (colapsable) -->
      <div class="border border-[rgba(124,58,237,0.10)] rounded-lg overflow-hidden">
        <button
          type="button"
          class="flex items-center justify-between w-full px-3 py-2.5 bg-[#faf9ff] hover:bg-[#f5f3ff] transition-colors text-left"
          @click="showPermissions = !showPermissions"
        >
          <span class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed]">
            Permisos avanzados
          </span>
          <svg
            :class="['h-4 w-4 text-[#7c3aed] transition-transform duration-200', showPermissions ? 'rotate-180' : '']"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <transition name="collapse">
          <div v-if="showPermissions" class="divide-y divide-[rgba(124,58,237,0.06)]">
            <!-- Permisos Individuales -->
            <div class="p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-xs font-semibold text-[#0b0817]">
                  Permisos individuales
                </h4>
                <button v-if="!isProfileReadonly" type="button" class="btn btn-ghost btn-sm" @click="resetPermissions">
                  Restaurar
                </button>
              </div>

              <div v-if="loadingPermissions" class="text-sm text-[#9690a8] py-4 text-center">
                Cargando permisos...
              </div>

              <div v-else class="space-y-3 max-h-60 overflow-y-auto pr-1 permissions-scroll">
                <div
                  v-for="category in permissionsByCategory"
                  :key="category.id"
                  class="border border-[rgba(124,58,237,0.10)] rounded-lg overflow-hidden"
                >
                  <div class="text-sm font-semibold text-[#0b0817] px-3 py-2 bg-[#faf9ff] border-b border-[rgba(124,58,237,0.06)]">
                    {{ category.name }}
                  </div>
                  <div class="divide-y divide-[rgba(124,58,237,0.04)]">
                    <div
                      v-for="perm in category.permissions"
                      :key="perm.id"
                      class="flex items-center gap-3 px-3 py-2 text-sm"
                    >
                      <span class="flex-1 min-w-0 truncate text-[#0b0817]" :title="perm.slug">
                        {{ perm.name || perm.slug }}
                      </span>

                      <!-- Desde rol -->
                      <template v-if="isPermissionFromRole(perm.id)">
                        <span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#6b6b7b] whitespace-nowrap">
                          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          de rol
                        </span>
                        <span
                          :class="getEffectiveGrant(perm.id) === 1 ? 'text-green-600' : 'text-red-500'"
                          class="text-xs font-mono whitespace-nowrap"
                        >
                          {{ getEffectiveGrant(perm.id) === 1 ? "(+)" : "(-)" }}
                        </span>
                      </template>

                      <!-- Override individual -->
                      <template v-else-if="!isProfileReadonly">
                        <div class="flex items-center gap-1.5">
                          <button
                            type="button"
                            :class="[
                              'inline-flex items-center justify-center h-7 w-7 rounded-md text-xs font-semibold border transition-all duration-150',
                              selectedPermissions[perm.id] === 1
                                ? 'bg-green-50 border-green-300 text-green-700'
                                : 'border-[rgba(124,58,237,0.10)] text-[#9690a8] hover:border-green-300 hover:text-green-600',
                            ]"
                            @click="setPermission(perm.id, selectedPermissions[perm.id] === 1 ? 0 : 1)"
                          >
                            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            :class="[
                              'inline-flex items-center justify-center h-7 w-7 rounded-md text-xs font-semibold border transition-all duration-150',
                              selectedPermissions[perm.id] === -1
                                ? 'bg-red-50 border-red-300 text-red-600'
                                : 'border-[rgba(124,58,237,0.10)] text-[#9690a8] hover:border-red-300 hover:text-red-500',
                            ]"
                            @click="setPermission(perm.id, selectedPermissions[perm.id] === -1 ? 0 : -1)"
                          >
                            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </template>
                      <!-- Read-only: inherited directly (no role source) -->
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Permisos Efectivos -->
            <div class="px-4 pb-4">
              <div class="card p-3">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="h-4 w-4 text-[#7c3aed]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                  <h4 class="text-xs font-semibold text-[#0b0817]">
                    Permisos efectivos
                  </h4>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="perm in effectivePermissionsDisplay"
                    :key="perm.slug"
                    class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium"
                    :class="perm.grant === 1 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'"
                  >
                    <svg v-if="perm.grant === 1" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <svg v-else class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    {{ perm.name }}
                  </span>
                  <span v-if="effectivePermissionsDisplay.length === 0" class="text-sm text-[#9690a8]">
                    Sin permisos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Warning al cambiar roles -->
      <div
        v-if="overridesToRemove.length > 0"
        class="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
      >
        <svg class="h-5 w-5 text-amber-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div>
          <p class="text-sm font-medium text-amber-800">
            Se eliminarán {{ overridesToRemove.length }} permisos individuales
          </p>
          <p class="text-xs text-amber-600 mt-0.5">
            Al asignar los roles seleccionados, estos permisos dejarán de aplicarse:
          </p>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="item in overridesToRemove"
              :key="'override-' + String(item)"
              class="badge badge--danger text-xs"
            >
              {{ formatOverrideItem(item) }}
            </span>
          </div>
        </div>
      </div>

    </form>

    <template #footer>
      <button type="button" class="btn btn-ghost" @click="close">Cancelar</button>
      <button type="submit" form="edit-user-form" :disabled="!canSave" class="btn btn-primary disabled:opacity-50">
        Guardar cambios
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import Modal from "@/shared/components/Modal.vue";
import { fetchClient } from "@/core/api/httpClient";
import { useAuthStore } from "@/core/store/auth";

interface UserRole {
  id: number;
  name?: string;
  is_system?: boolean;
  permissions?: Array<{ id?: number; permission_id?: number; slug?: string; name?: string } | string>;
}

interface UserPermission {
  permission_id: number;
  slug?: string;
  grant: number;
  origin: "user" | "role";
}

interface PermissionItem {
  id: number;
  slug: string;
  name: string;
  category?: string;
}

interface UserData {
  id?: number | string;
  name?: string;
  email?: string;
  roles?: UserRole[];
  user_permissions?: UserPermission[];
  permissions_override?: string[];
  permissionsOverride?: string[];
  all_roles?: UserRole[];
}

interface Props {
  show?: boolean;
  user?: UserData | null;
  roles?: UserRole[];
  permissions?: PermissionItem[];
  loadingPermissions?: boolean;
  isNew?: boolean;
}

interface Payload {
  name: string;
  email?: string;
  roles?: number[];
  roles_remove?: number[];
  permissions?: Array<{ permission_id: number; grant: number }>;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  user: null,
  roles: () => [],
  permissions: () => [],
  loadingPermissions: false,
  isNew: false,
});
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", payload: Payload): void;
}>();

const authStore = useAuthStore();

// Modo solo-lectura: usuario sin admin.role.view (ej. perfil propio)
const isProfileReadonly = computed<boolean>(() => !authStore.hasPermission("admin.role.view"));

const apiRoles = ref<UserRole[]>([]);
const apiPermissions = ref<PermissionItem[]>([]);
const apiLoadingPermissions = ref(false);

const allRoles = computed<UserRole[]>(() => {
  return apiRoles.value.length > 0 ? apiRoles.value : props.roles;
});
const allPermissionsList = computed<PermissionItem[]>(() => {
  return apiPermissions.value.length > 0 ? apiPermissions.value : props.permissions;
});

const rolesPermissionsCache = ref<Record<number, Array<{ id?: number; slug?: string; name?: string } | string>>>({});

async function fetchRoles(): Promise<void> {
  try {
    const data = await fetchClient("/admin/roles", { method: "GET" });
    apiRoles.value = Array.isArray(data) ? data : [];
    if (Array.isArray(data)) {
      for (const role of data) {
        if (role.id && (!role.permissions || role.permissions.length === 0)) {
          fetchRolePermissions(role.id);
        } else if (role.id && role.permissions) {
          rolesPermissionsCache.value[role.id] = role.permissions;
        }
      }
    }
  } catch {
    apiRoles.value = [];
  }
}

async function fetchRolePermissions(roleId: number): Promise<void> {
  try {
    const detail = await fetchClient(`/admin/roles/${roleId}`, { method: "GET" });
    if (detail && detail.permissions) {
      rolesPermissionsCache.value[roleId] = detail.permissions;
      const idx = apiRoles.value.findIndex((r) => r.id === roleId);
      if (idx !== -1) {
        apiRoles.value[idx] = { ...apiRoles.value[idx], permissions: detail.permissions };
      }
    }
  } catch {
    // silencio
  }
}

async function fetchPermissions(): Promise<void> {
  apiLoadingPermissions.value = true;
  try {
    const data = await fetchClient("/admin/permissions", { method: "GET" });
    apiPermissions.value = Array.isArray(data) ? data : [];
  } catch {
    apiPermissions.value = [];
  } finally {
    apiLoadingPermissions.value = false;
  }
}

const loadingPermissions = computed<boolean>(() => {
  return apiLoadingPermissions.value || props.loadingPermissions;
});

const name = ref<string>(props.user?.name || "");
const email = ref<string>(props.user?.email || "");
const selectedRoleIds = ref<number[]>([]);
const originalRoleIds = ref<number[]>([]);
const selectedPermissions = ref<Record<number, number>>({});
const originalPermissions = ref<Record<number, number>>({});
const originalPermissionsSlug = ref<Record<string, number>>({});

const availableRoles = computed<UserRole[]>(() => {
  if (props.user?.all_roles) return props.user.all_roles;
  return allRoles.value || [];
});

const isNewUser = computed<boolean>(() => props.isNew);
const showPermissions = ref(false);

watch(() => props.show, (val) => {
  if (val) {
    if (!isProfileReadonly.value) {
      fetchRoles();
      fetchPermissions();
    }
  }
});
const roleExpanded = ref<Record<number, boolean>>({});
const categoryExpanded = ref<Record<string, boolean>>({});

function toggleCategoryExpanded(roleId: number, catName: string): void {
  const key = `${roleId}-${catName}`;
  categoryExpanded.value[key] = !categoryExpanded.value[key];
}

function toggleRoleExpanded(roleId: number): void {
  const willExpand = !roleExpanded.value[roleId];
  roleExpanded.value[roleId] = willExpand;
  if (willExpand) {
    const role = apiRoles.value.find((r) => r.id === roleId);
    if (role && (!role.permissions || role.permissions.length === 0)) {
      fetchRolePermissions(roleId);
    }
  }
}

const rolePermissionsMap = computed<Record<number, Array<{ id?: number; slug?: string; name?: string } | string>>>(() => {
  const map: Record<number, Array<{ id?: number; slug?: string; name?: string } | string>> = {};
  for (const role of apiRoles.value) {
    const rid = typeof role.id === "number" ? role.id : Number(role.id);
    if (role.permissions && role.permissions.length > 0) {
      map[rid] = role.permissions as Array<{ id?: number; slug?: string; name?: string } | string>;
    } else if (rolesPermissionsCache.value[rid]) {
      map[rid] = rolesPermissionsCache.value[rid];
    } else {
      map[rid] = [];
    }
  }
  return map;
});

function resolvePermDisplay(perm: string | Record<string, any>): { slug: string; name: string; category?: string } {
  const p = typeof perm === "string" ? { slug: perm, name: perm } : perm;
  const slug = p.slug || p.name || String(p.id || "");
  const matched = allPermissionsList.value.find(
    (item) =>
      item.slug === slug ||
      item.name === slug ||
      (p.id !== undefined && item.id === Number(p.id)) ||
      (p.permission_id !== undefined && item.id === Number(p.permission_id)) ||
      item.slug?.toLowerCase() === slug?.toLowerCase() ||
      item.name?.toLowerCase() === slug?.toLowerCase()
  );
  if (matched) return matched;
  const catName = typeof p.category === "string" ? p.category : "General";
  return { slug: p.name || slug, name: p.name || slug, category: catName };
}

const rolePermissionsTree = computed<Record<number, Array<{ name: string; permissions: Array<{ slug: string; name: string }> }>>>(() => {
  const result: Record<number, Array<{ name: string; permissions: Array<{ slug: string; name: string }> }>> = {};
  for (const [ridStr, perms] of Object.entries(rolePermissionsMap.value)) {
    const rid = Number(ridStr);
    const categories: Record<string, Array<{ slug: string; name: string }>> = {};
    for (const perm of perms) {
      const resolved = resolvePermDisplay(perm);
      const catName = resolved.category || "General";
      if (!categories[catName]) categories[catName] = [];
      categories[catName].push({ slug: resolved.slug, name: resolved.name });
    }
    result[rid] = Object.entries(categories)
      .map(([name, permissions]) => ({ name, permissions }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  return result;
});

interface CategoryGroup {
  id: number | undefined;
  name: string;
  permissions: PermissionItem[];
}

const permissionsByCategory = computed<CategoryGroup[]>(() => {
  const categories: Record<string, CategoryGroup> = {};
  const perms = allPermissionsList.value || [];

  perms.forEach((perm) => {
    const catName = perm.category || "Sin categoría";
    if (!categories[catName]) {
      categories[catName] = {
        id: undefined,
        name: catName,
        permissions: [],
      };
    }
    categories[catName].permissions.push(perm);
  });

  return Object.values(categories);
});

const userPermissionsList = computed<UserPermission[]>(() => {
  return props.user?.user_permissions || [];
});

function isPermissionFromRole(permissionId: number): boolean {
  const permId = permissionId;
  const permSlug = (() => {
    const p = allPermissionsList.value.find((x) => x.id == permId);
    return p?.slug || p?.name;
  })();

  const fromSelectedRoles = selectedRoleIds.value.some((roleId) => {
    const role = availableRoles.value.find((r) => r.id === roleId);
    if (!role || !role.permissions) return false;
    return role.permissions.some((rp) => {
      if (!rp) return false;
      if (typeof rp !== "string" && (rp.id || rp.permission_id)) return (rp.id || rp.permission_id) == permId;
      if (typeof rp !== "string" && rp.slug) return rp.slug === permSlug;
      if (typeof rp !== "string" && rp.name) return rp.name === permSlug;
      if (typeof rp === "string") return rp === permSlug;
      return false;
    });
  });

  const fromUserRole = userPermissionsList.value.some(
    (p) => p.permission_id === permissionId && p.origin === "role"
  );

  return fromSelectedRoles || fromUserRole;
}

function getEffectiveGrant(permissionId: number): number {
  const perm = allPermissionsList.value.find((p) => p.id == permissionId);
  const slug = perm?.slug || perm?.name;
  if (slug && effectivePermissionsMap.value && Object.prototype.hasOwnProperty.call(effectivePermissionsMap.value, slug)) {
    return effectivePermissionsMap.value[slug];
  }

  if (
    selectedPermissions.value[permissionId] !== undefined &&
    selectedPermissions.value[permissionId] !== 0
  ) {
    return selectedPermissions.value[permissionId];
  }

  const userPerm = userPermissionsList.value.find((p) => p.permission_id === permissionId);
  if (userPerm) return userPerm.grant;

  return 0;
}

const effectivePermissionsMap = computed<Record<string, number>>(() => {
  const result: Record<string, number> = {};

  selectedRoleIds.value.forEach((roleId) => {
    const role = availableRoles.value.find((r) => r.id === roleId);
    if (role?.permissions) {
      role.permissions.forEach((p) => {
        if (typeof p !== "string") {
          result[p.slug || p.name || ""] = 1;
        } else {
          result[p] = 1;
        }
      });
    }
  });

  Object.entries(selectedPermissions.value).forEach(([permId, grant]) => {
    if (grant !== 0) {
      const perm = allPermissionsList.value.find((p) => p.id === Number(permId));
      if (perm) {
        result[perm.slug] = grant;
      }
    }
  });

  return result;
});

const effectivePermissionsDisplay = computed<Array<{ slug: string; name: string; grant: number }>>(() => {
  return Object.entries(effectivePermissionsMap.value).map(([slug, grant]) => {
    const perm = allPermissionsList.value.find((p) => p.slug === slug || p.name === slug);
    return { slug, name: perm?.name || slug, grant };
  });
});

const overridesToRemove = computed<(number | string)[]>(() => {
  const toRemove: (number | string)[] = [];

  Object.keys(originalPermissions.value || {}).forEach((key) => {
    const permId = parseInt(key);
    if (!permId) return;
    const willBeProvided = selectedRoleIds.value.some((roleId) => {
      const role = availableRoles.value.find((r) => r.id === roleId);
      if (!role || !role.permissions) return false;
      return role.permissions.some((rp) => {
        if (!rp) return false;
        if (typeof rp !== "string" && (rp.id || rp.permission_id)) return (rp.id || rp.permission_id) == permId;
        if (typeof rp !== "string" && rp.slug) {
          const perm = allPermissionsList.value.find((p) => p.id == permId);
          return perm && perm.slug === rp.slug;
        }
        if (typeof rp !== "string" && rp.name) {
          const perm = allPermissionsList.value.find((p) => p.id == permId);
          return (perm && perm.slug === rp.name) || (perm && perm.name === rp.name);
        }
        if (typeof rp === "string") {
          const perm = allPermissionsList.value.find((p) => p.id == permId);
          return perm && perm.slug === rp;
        }
        return false;
      });
    });
    if (willBeProvided) toRemove.push(permId);
  });

  Object.keys(originalPermissionsSlug.value || {}).forEach((slug) => {
    const willBeProvided = selectedRoleIds.value.some((roleId) => {
      const role = availableRoles.value.find((r) => r.id === roleId);
      if (!role || !role.permissions) return false;
      return role.permissions.some((rp) => {
        if (!rp) return false;
        if (typeof rp !== "string" && rp.slug) return rp.slug === slug;
        if (typeof rp !== "string" && rp.name) return rp.name === slug;
        if (typeof rp === "string") return rp === slug;
        return false;
      });
    });
    if (willBeProvided) toRemove.push(slug);
  });

  return Array.from(new Set(toRemove));
});

watch(
  () => props.user,
  (val) => {
    name.value = val?.name || "";
    email.value = val?.email || "";
    originalRoleIds.value = val?.roles?.map((r: UserRole) => r.id) || [];
    selectedRoleIds.value = val?.roles?.map((r: UserRole) => r.id) || [];

    const overrides: Record<number, number> = {};
    const slugOverrides: Record<string, number> = {};
    const userPerms = val?.user_permissions || [];
    userPerms.forEach((p) => {
      if (p.origin === "user") {
        overrides[p.permission_id] = p.grant;
        if (p.slug) slugOverrides[p.slug] = p.grant;
      }
    });

    const permsOverrideArr = val?.permissions_override || val?.permissionsOverride || [];
    permsOverrideArr.forEach((s) => {
      if (!s || typeof s !== "string") return;
      let grant: number = 0;
      let slug: string = s;
      if (s.startsWith("+") || s.startsWith("-")) {
        grant = s[0] === "+" ? 1 : -1;
        slug = s.slice(1);
      }
      slugOverrides[slug] = grant;
    });

    selectedPermissions.value = { ...overrides };
    originalPermissions.value = { ...overrides };
    originalPermissionsSlug.value = { ...slugOverrides };

    if (allPermissionsList.value && allPermissionsList.value.length > 0) {
      Object.entries(slugOverrides).forEach(([slug, grant]) => {
        const perm = allPermissionsList.value.find((p) => p.slug === slug || p.name === slug);
        if (perm) {
          selectedPermissions.value[perm.id] = grant;
          originalPermissions.value[perm.id] = grant;
        }
      });
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => allPermissionsList.value,
  (perms) => {
    if (!perms || perms.length === 0) return;
    Object.entries(originalPermissionsSlug.value || {}).forEach(([slug, grant]) => {
      const perm = perms.find((p) => p.slug === slug || p.name === slug);
      if (perm) {
        originalPermissions.value[perm.id] = grant;
        selectedPermissions.value[perm.id] = grant;
      }
    });
  },
  { immediate: true }
);

const canSave = computed<boolean>(() => name.value.trim().length > 0);

function getRoleName(roleId: number): string {
  const role = availableRoles.value.find((r) => r.id === roleId);
  return String(role?.name || roleId);
}

function formatOverrideItem(item: number | string | null | undefined): string {
  if (item === null || item === undefined) return "";
  if (typeof item === "number" || String(item).match(/^[0-9]+$/)) {
    const pid = typeof item === "number" ? item : parseInt(item as string);
    const perm = allPermissionsList.value.find((p) => p.id == pid);
    return perm?.slug || perm?.name || String(pid);
  }
  return String(item);
}

function toggleRole(roleId: number): void {
  const idx = selectedRoleIds.value.indexOf(roleId);
  if (idx === -1) {
    selectedRoleIds.value.push(roleId);
  } else {
    selectedRoleIds.value.splice(idx, 1);
  }
}

function setPermission(permId: number, grant: number): void {
  if (grant === 0) {
    delete selectedPermissions.value[permId];
  } else {
    selectedPermissions.value[permId] = grant;
  }
}

function resetPermissions(): void {
  selectedPermissions.value = { ...originalPermissions.value };
}

function close(): void {
  emit("close");
}

function onSave(): void {
  const basePayload: Payload = { name: name.value.trim() };
  if (isNewUser.value) basePayload.email = email.value.trim();

  const rolesToAdd = selectedRoleIds.value.filter((id) => !originalRoleIds.value.includes(id));
  const rolesToRemove = originalRoleIds.value.filter((id) => !selectedRoleIds.value.includes(id));

  const permissionsChanges: Array<{ permission_id: number; grant: number }> = [];
  Object.entries(selectedPermissions.value).forEach(([permId, grant]) => {
    if (originalPermissions.value[Number(permId)] !== grant) {
      permissionsChanges.push({
        permission_id: parseInt(permId),
        grant: grant,
      });
    }
  });

  Object.entries(originalPermissions.value).forEach(([permId, grant]) => {
    if (!Object.prototype.hasOwnProperty.call(selectedPermissions.value, permId) && grant !== 0) {
      permissionsChanges.push({
        permission_id: parseInt(permId),
        grant: 0,
      });
    }
  });

  if (overridesToRemove.value && overridesToRemove.value.length > 0) {
    const msg = `Se eliminarán ${overridesToRemove.value.length} permisos individuales. ¿Continuar?`;
    if (typeof confirm === "function") {
      if (!confirm(msg)) return;
    }
  }

  const payload: Payload = {
    ...basePayload,
    ...(rolesToAdd.length > 0 && { roles: rolesToAdd }),
    ...(rolesToAdd.length > 0 || rolesToRemove.length > 0 ? { roles_remove: rolesToRemove } : {}),
    ...(permissionsChanges.length > 0 && { permissions: permissionsChanges }),
  };

  emit("save", payload);
}
</script>

<style scoped>
.permissions-scroll::-webkit-scrollbar {
  width: 6px;
}
.permissions-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.permissions-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.permissions-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
