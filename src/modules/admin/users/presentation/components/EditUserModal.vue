<template>
  <Modal :show="show" size="lg" icon-class="h-6 w-6 text-indigo-600" @close="close">
    <template #icon>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-3-3.87"></path>
        <path d="M4 21v-2a4 4 0 013-3.87"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </template>
    <template #header>
      <h3 class="text-lg font-semibold text-slate-800 mb-4">
        {{ isNewUser ? "Crear usuario" : "Editar usuario" }}
      </h3>
    </template>

    <form class="space-y-4" @submit.prevent="onSave">
      <!-- Nombre -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
        <input v-model="name" type="text" placeholder="Nombre" class="form-input" />
      </div>

      <!-- Email -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-600 mb-1">Email</label>
        <template v-if="isNewUser">
          <input v-model="email" type="email" placeholder="Email" class="form-input" required />
        </template>
        <template v-else>
          <input
            :value="email"
            readonly
            aria-readonly="true"
            type="email"
            class="form-input readonly-input"
          />
          <p class="text-xs text-red-400 mt-1">No es posible cambiar el email</p>
        </template>
      </div>

      <!-- Roles -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-600 mb-2">Roles</label>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <label
            v-for="role in availableRoles"
            :key="role.id"
            :class="[
              'flex items-center gap-2 p-2 rounded border border-slate-200',
              role.is_system
                ? 'opacity-60 cursor-not-allowed bg-slate-50'
                : 'cursor-pointer hover:bg-slate-50',
              selectedRoleIds.includes(role.id) ? 'bg-slate-100' : '',
            ]"
            :title="role.is_system ? 'Rol del sistema: no editable' : ''"
          >
            <input
              type="checkbox"
              :value="role.id"
              :checked="selectedRoleIds.includes(role.id)"
              :disabled="role.is_system"
              class="form-checkbox"
              @change="toggleRole(role.id)"
            />
            <span class="text-sm text-slate-700">{{ role.name }}</span>
            <span v-if="role.is_system" class="badge badge--secondary text-xs">Sistema</span>
          </label>
        </div>
        <div v-if="selectedRoleIds.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="roleId in selectedRoleIds"
            :key="'badge-' + roleId"
            class="badge badge--primary"
          >
            {{ getRoleName(roleId) }}
          </span>
        </div>
      </div>

      <!-- Permisos Individuales Editables -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-slate-600">Permisos Individuales</label>
          <button type="button" class="btn btn-ghost btn-sm" @click="resetPermissions">
            Restaurar permisos
          </button>
        </div>

        <div v-if="loadingPermissions" class="text-sm text-slate-500">Cargando permisos...</div>

        <div v-else class="space-y-3 max-h-60 overflow-y-auto">
          <div
            v-for="category in permissionsByCategory"
            :key="category.id"
            class="border rounded p-2"
          >
            <div class="text-sm font-medium text-slate-700 mb-1">{{ category.name }}</div>
            <div class="space-y-1">
              <div
                v-for="perm in category.permissions"
                :key="perm.id"
                class="flex items-center gap-2 text-sm"
              >
                <span class="w-32 truncate text-slate-600" :title="perm.slug">{{ perm.slug }}</span>

                <!-- Si viene de rol, mostrar solo lectura -->
                <template v-if="isPermissionFromRole(perm.id)">
                  <span class="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    de rol
                  </span>
                  <span
                    :class="getEffectiveGrant(perm.id) === 1 ? 'text-green-600' : 'text-red-500'"
                  >
                    {{ getEffectiveGrant(perm.id) === 1 ? "(+)" : "(-)" }}
                  </span>
                </template>

                <!-- Si es override individual, permitir editar -->
                <template v-else>
                  <label class="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      :name="'perm-' + perm.id"
                      :checked="selectedPermissions[perm.id] === 1"
                      class="form-radio"
                      @change="setPermission(perm.id, 1)"
                    />
                    <span class="text-green-600 text-xs">+</span>
                  </label>
                  <label class="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      :name="'perm-' + perm.id"
                      :checked="selectedPermissions[perm.id] === -1"
                      class="form-radio"
                      @change="setPermission(perm.id, -1)"
                    />
                    <span class="text-red-500 text-xs">-</span>
                  </label>
                  <label class="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      :name="'perm-' + perm.id"
                      :checked="selectedPermissions[perm.id] === 0 || !selectedPermissions[perm.id]"
                      class="form-radio"
                      @change="setPermission(perm.id, 0)"
                    />
                    <span class="text-slate-400 text-xs">ninguno</span>
                  </label>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Permisos Efectivos (resultado) -->
      <div class="mb-4 p-3 bg-slate-50 rounded">
        <label class="block text-sm font-medium text-slate-600 mb-2"
          >Permisos Efectivos (resultado)</label
        >
        <div class="flex flex-wrap gap-1">
          <span
            v-for="(grant, slug) in effectivePermissionsMap"
            :key="slug"
            class="text-xs px-2 py-1 rounded"
            :class="grant === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          >
            {{ grant === 1 ? "+" : "-" }} {{ slug }}
          </span>
          <span
            v-if="Object.keys(effectivePermissionsMap).length === 0"
            class="text-sm text-slate-400"
          >
            Sin permisos
          </span>
        </div>
      </div>

      <!-- Warning al cambiar roles -->
      <div
        v-if="overridesToRemove.length > 0"
        class="p-3 bg-amber-50 border border-amber-200 rounded"
      >
        <p class="text-sm text-amber-700">
          Se eliminarán {{ overridesToRemove.length }} permisos individuales al asignar los roles
          seleccionados.
        </p>
        <div class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="item in overridesToRemove"
            :key="'override-' + String(item)"
            class="badge badge--danger text-xs"
          >
            {{ formatOverrideItem(item) }}
          </span>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn btn-ghost" @click="close">Cancelar</button>
        <button type="submit" :disabled="!canSave" class="btn btn-primary disabled:opacity-50">
          Guardar
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import Modal from "@/shared/components/Modal.vue";

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
  category_id?: number;
  category?: { id: number; name: string };
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

const allRoles = computed<UserRole[]>(() => props.roles);
const allPermissionsList = computed<PermissionItem[]>(() => props.permissions);

const name = ref<string>(props.user?.name || "");
const email = ref<string>(props.user?.email || "");
const selectedRoleIds = ref<number[]>([]);
const originalRoleIds = ref<number[]>([]);
const selectedPermissions = ref<Record<number, number>>({}); // { permission_id: grant }
const originalPermissions = ref<Record<number, number>>({});
const originalPermissionsSlug = ref<Record<string, number>>({}); // Overrides expresados por slug

const availableRoles = computed<UserRole[]>(() => {
  if (props.user?.all_roles) return props.user.all_roles;
  return allRoles.value || [];
});

const isNewUser = computed<boolean>(() => props.isNew);

interface CategoryGroup {
  id: number | undefined;
  name: string;
  permissions: PermissionItem[];
}

const permissionsByCategory = computed<CategoryGroup[]>(() => {
  const categories: Record<string, CategoryGroup> = {};
  const perms = allPermissionsList.value || [];

  perms.forEach((perm) => {
    const catName = perm.category?.name || "Sin categoría";
    if (!categories[catName]) {
      categories[catName] = {
        id: perm.category_id,
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
