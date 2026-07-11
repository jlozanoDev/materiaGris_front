<template>
  <Modal :show="show" size="sm" icon-class="h-6 w-6 text-[#7c3aed]" @close="close">
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
      <h3 class="text-lg font-semibold text-[#0b0817]">Editar perfil</h3>
    </template>

    <form id="profile-edit-form" class="space-y-6" @submit.prevent="onSave">
      <div>
        <h4 class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed] mb-3">
          Información general
        </h4>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Nombre</label>
            <input
              v-model="name"
              type="text"
              placeholder="Nombre completo"
              class="form-input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Email</label>
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
          </div>
        </div>
      </div>
    </form>

    <!-- Roles (solo-lectura) -->
    <div v-if="userRoles.length > 0" class="pt-2">
      <hr class="border-[rgba(124,58,237,0.08)] mb-4" />
      <h4 class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed] mb-3">
        Roles
      </h4>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="role in userRoles"
          :key="role.id"
          class="badge badge--primary"
        >
          {{ role.name }}
        </span>
      </div>
    </div>

    <!-- Permisos (solo-lectura) -->
    <div v-if="userPermissions.length > 0" class="pt-2">
      <hr class="border-[rgba(124,58,237,0.08)] mb-4" />
      <h4 class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed] mb-3">
        Permisos
      </h4>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="perm in userPermissions"
          :key="perm"
          class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium bg-green-50 text-green-700 border border-green-200"
        >
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ perm }}
        </span>
      </div>
    </div>
    <p v-else class="text-sm text-[#9690a8] italic pt-4">Sin permisos asignados</p>

    <template #footer>
      <button type="button" class="btn btn-ghost" @click="close">Cancelar</button>
      <button
        type="submit"
        form="profile-edit-form"
        :disabled="!canSave"
        class="btn btn-primary disabled:opacity-50"
      >
        Guardar cambios
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import Modal from "@/shared/components/Modal.vue";
import { useAuthStore } from "@/core/store/auth";

interface ProfileUser {
  id?: number | string;
  name?: string;
  email?: string;
}

interface Props {
  show?: boolean;
  user?: ProfileUser | null;
}

interface Payload {
  name: string;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  user: null,
});

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", payload: Payload): void;
}>();

const authStore = useAuthStore();

const userPermissions = computed<string[]>(() => {
  const perms = authStore.user?.permissions;
  if (!perms) return [];

  // Array of strings: ["admin.user.view", ...]
  if (Array.isArray(perms)) {
    return perms.filter((p): p is string => typeof p === "string");
  }

  // Object map: { "admin.user.view": 1 }
  if (typeof perms === "object") {
    const slugs: string[] = [];
    for (const [key, val] of Object.entries(perms as Record<string, unknown>)) {
      if (val === 1 || val === "1" || val === true) slugs.push(key);
    }
    return slugs;
  }

  return [];
});

const userRoles = computed<Array<{ id: number | string; name: string }>>(() => {
  return authStore.user?.roles || [];
});

const name = ref<string>(props.user?.name || "");
const email = ref<string>(props.user?.email || "");

watch(
  () => props.user,
  (val) => {
    name.value = val?.name || "";
    email.value = val?.email || "";
  },
  { immediate: true }
);

const canSave = computed<boolean>(() => name.value.trim().length > 0);

function close(): void {
  emit("close");
}

function onSave(): void {
  emit("save", { name: name.value.trim() });
}
</script>
