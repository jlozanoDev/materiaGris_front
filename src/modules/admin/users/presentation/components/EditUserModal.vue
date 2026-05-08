<template>
  <Modal :show="show" size="lg" iconClass="h-6 w-6 text-indigo-600" @close="close">
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

    <form @submit.prevent="onSave" class="space-y-4">
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
              @change="toggleRole(role.id)"
              class="form-checkbox"
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
          <button type="button" @click="resetPermissions" class="btn btn-ghost btn-sm">
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
                      @change="setPermission(perm.id, 1)"
                      class="form-radio"
                    />
                    <span class="text-green-600 text-xs">+</span>
                  </label>
                  <label class="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      :name="'perm-' + perm.id"
                      :checked="selectedPermissions[perm.id] === -1"
                      @change="setPermission(perm.id, -1)"
                      class="form-radio"
                    />
                    <span class="text-red-500 text-xs">-</span>
                  </label>
                  <label class="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      :name="'perm-' + perm.id"
                      :checked="selectedPermissions[perm.id] === 0 || !selectedPermissions[perm.id]"
                      @change="setPermission(perm.id, 0)"
                      class="form-radio"
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
        <button type="button" @click="close" class="btn btn-ghost">Cancelar</button>
        <button type="submit" :disabled="!canSave" class="btn btn-primary disabled:opacity-50">
          Guardar
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import Modal from "@/shared/components/Modal.vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  user: { type: Object, default: null },
  roles: { type: Array, default: () => [] },
  permissions: { type: Array, default: () => [] },
  loadingPermissions: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "save"]);

const allRoles = computed(() => props.roles);
const allPermissionsList = computed(() => props.permissions);

const name = ref(props.user?.name || "");
const email = ref(props.user?.email || "");
const selectedRoleIds = ref([]);
const originalRoleIds = ref([]);
const selectedPermissions = ref({}); // { permission_id: grant }
const originalPermissions = ref({}); // Permissions override originales
const originalPermissionsSlug = ref({}); // Overrides expresados por slug (p.e. '-patients.view')

const availableRoles = computed(() => {
  if (props.user?.all_roles) return props.user.all_roles;
  return allRoles.value || [];
});

const isNewUser = computed(() => !props.user?.id || props.user?.id > Date.now() - 10000); // Simple heuristic: new if no id or recently generated local id

// Permissions agrupados por categoría
const permissionsByCategory = computed(() => {
  const categories = {};
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

// Permisos del usuario (tanto de roles como overrides)
const userPermissionsList = computed(() => {
  return props.user?.user_permissions || [];
});

// Permisos que vienen de roles (no editables)
function isPermissionFromRole(permissionId) {
  // Primero verificar si alguna de las roles seleccionadas entrega este permiso
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
      if (rp.id || rp.permission_id) return (rp.id || rp.permission_id) == permId;
      if (rp.slug) return rp.slug === permSlug;
      if (rp.name) return rp.name === permSlug;
      if (typeof rp === "string") return rp === permSlug;
      return false;
    });
  });

  // También considerar permisos que ya venían de roles en el servidor
  const fromUserRole = userPermissionsList.value.some(
    (p) => p.permission_id === permissionId && p.origin === "role"
  );

  return fromSelectedRoles || fromUserRole;
}

// Obtener el grant efectivo de un permiso
function getEffectiveGrant(permissionId) {
  // Intentar resolver vía slug en el mapa efectivo (derivado de roles + overrides)
  const perm = allPermissionsList.value.find((p) => p.id == permissionId);
  const slug = perm?.slug || perm?.name;
  if (slug && effectivePermissionsMap.value && effectivePermissionsMap.value.hasOwnProperty(slug)) {
    return effectivePermissionsMap.value[slug];
  }

  // Si no está en el mapa, caer de nuevo a overrides numéricos y permisos de usuario
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

// Mapa de permisos efectivos (resultado final)
const effectivePermissionsMap = computed(() => {
  const result = {};

  // Añadir permisos de roles seleccionados
  selectedRoleIds.value.forEach((roleId) => {
    const role = availableRoles.value.find((r) => r.id === roleId);
    if (role?.permissions) {
      role.permissions.forEach((p) => {
        const permId = p.id || p.permission_id;
        result[p.slug || p.name] = 1; // Los roles siempre dan grant +1
      });
    }
  });

  // Aplicar overrides individuales
  Object.entries(selectedPermissions.value).forEach(([permId, grant]) => {
    if (grant !== 0) {
      const perm = allPermissionsList.value.find((p) => p.id == permId);
      if (perm) {
        result[perm.slug] = grant;
      }
    }
  });

  return result;
});

// Overrides que se eliminarán al cambiar roles seleccionadas
const overridesToRemove = computed(() => {
  const toRemove = [];

  // 1) Overrides expresados por id (originalPermissions)
  Object.keys(originalPermissions.value || {}).forEach((key) => {
    const permId = parseInt(key);
    if (!permId) return;
    // Si alguna de las roles seleccionadas contiene este permiso, se eliminará el override
    const willBeProvided = selectedRoleIds.value.some((roleId) => {
      const role = availableRoles.value.find((r) => r.id === roleId);
      if (!role || !role.permissions) return false;
      return role.permissions.some((rp) => {
        if (!rp) return false;
        if (rp.id || rp.permission_id) return (rp.id || rp.permission_id) == permId;
        if (rp.slug) {
          const perm = allPermissionsList.value.find((p) => p.id == permId);
          return perm && perm.slug === rp.slug;
        }
        if (rp.name) {
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

  // 2) Overrides expresados por slug (originalPermissionsSlug)
  Object.keys(originalPermissionsSlug.value || {}).forEach((slug) => {
    const willBeProvided = selectedRoleIds.value.some((roleId) => {
      const role = availableRoles.value.find((r) => r.id === roleId);
      if (!role || !role.permissions) return false;
      return role.permissions.some((rp) => {
        if (!rp) return false;
        if (rp.slug) return rp.slug === slug;
        if (rp.name) return rp.name === slug;
        if (typeof rp === "string") return rp === slug;
        return false;
      });
    });
    if (willBeProvided) toRemove.push(slug);
  });

  // devolver lista única
  return Array.from(new Set(toRemove));
});

watch(
  () => props.user,
  (val) => {
    name.value = val?.name || "";
    email.value = val?.email || "";
    originalRoleIds.value = val?.roles?.map((r) => r.id) || [];
    selectedRoleIds.value = val?.roles?.map((r) => r.id) || [];

    // Cargar permisos override actuales (origin = 'user') y también soportar formato legacy por slug
    const overrides = {};
    const slugOverrides = {};
    const userPerms = val?.user_permissions || [];
    userPerms.forEach((p) => {
      if (p.origin === "user") {
        overrides[p.permission_id] = p.grant;
        if (p.slug) slugOverrides[p.slug] = p.grant;
      }
    });

    // Formato legacy: permissions_override: ['-patients.view']
    const permsOverrideArr = val?.permissions_override || val?.permissionsOverride || [];
    permsOverrideArr.forEach((s) => {
      if (!s || typeof s !== "string") return;
      let grant = 0;
      let slug = s;
      if (s.startsWith("+") || s.startsWith("-")) {
        grant = s[0] === "+" ? 1 : -1;
        slug = s.slice(1);
      }
      slugOverrides[slug] = grant;
    });

    selectedPermissions.value = { ...overrides };
    originalPermissions.value = { ...overrides };
    originalPermissionsSlug.value = { ...slugOverrides };

    // Si ya tenemos la lista de permisos, mapear overrides por slug a ids
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

// Sincronizar overrides expresados por slug cuando se carguen los permisos globales
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



const canSave = computed(() => name.value.trim().length > 0);

function getRoleName(roleId) {
  const role = availableRoles.value.find((r) => r.id === roleId);
  return role?.name || roleId;
}

function formatOverrideItem(item) {
  if (item === null || item === undefined) return "";
  // si es numérico, buscar slug por id
  if (typeof item === "number" || String(item).match(/^[0-9]+$/)) {
    const pid = parseInt(item);
    const perm = allPermissionsList.value.find((p) => p.id == pid);
    return perm?.slug || perm?.name || pid;
  }
  return String(item);
}

function toggleRole(roleId) {
  const idx = selectedRoleIds.value.indexOf(roleId);
  if (idx === -1) {
    selectedRoleIds.value.push(roleId);
  } else {
    selectedRoleIds.value.splice(idx, 1);
  }
}

function setPermission(permId, grant) {
  if (grant === 0) {
    delete selectedPermissions.value[permId];
  } else {
    selectedPermissions.value[permId] = grant;
  }
}

function resetPermissions() {
  selectedPermissions.value = { ...originalPermissions.value };
}

function close() {
  emit("close");
}

function onSave() {
  const basePayload = { name: name.value.trim() };
  if (isNewUser.value) basePayload.email = email.value.trim();

  // Calcular cambios de roles
  const rolesToAdd = selectedRoleIds.value.filter((id) => !originalRoleIds.value.includes(id));
  const rolesToRemove = originalRoleIds.value.filter((id) => !selectedRoleIds.value.includes(id));

  // Calcular cambios de permisos override
  const permissionsChanges = [];
  Object.entries(selectedPermissions.value).forEach(([permId, grant]) => {
    if (originalPermissions.value[permId] !== grant) {
      permissionsChanges.push({
        permission_id: parseInt(permId),
        grant: grant,
      });
    }
  });

  // Añadir permisos que se eliminaron (grant = 0 para quitar)
  Object.entries(originalPermissions.value).forEach(([permId, grant]) => {
    if (!selectedPermissions.value.hasOwnProperty(permId) && grant !== 0) {
      permissionsChanges.push({
        permission_id: parseInt(permId),
        grant: 0, // Eliminar
      });
    }
  });

  // Si la selección de roles provocará eliminación de overrides, pedir confirmación al usuario
  if (overridesToRemove.value && overridesToRemove.value.length > 0) {
    const msg = `Se eliminarán ${overridesToRemove.value.length} permisos individuales. ¿Continuar?`;
    if (typeof confirm === "function") {
      if (!confirm(msg)) return;
    }
  }

  const payload = {
    ...basePayload,
    ...(rolesToAdd.length > 0 && { roles: rolesToAdd }),
    // siempre incluir roles_remove si hubo algún cambio en roles (incluso vacío)
    ...(rolesToAdd.length > 0 || rolesToRemove.length > 0 ? { roles_remove: rolesToRemove } : {}),
    ...(permissionsChanges.length > 0 && { permissions: permissionsChanges }),
  };

  emit("save", payload);
}
</script>
