<template>
  <header
    class="flex items-center gap-4 px-5 py-3 bg-white/80 backdrop-blur-md rounded-2xl"
    style="box-shadow: 0 8px 32px rgba(30, 35, 80, 0.06); border: 1px solid rgba(124, 58, 237, 0.06);"
  >
    <!-- Search -->
    <div class="relative flex-1 max-w-sm">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
        style="color: #9690a8;"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input type="text" placeholder="Buscar..." aria-label="Buscar" class="form-input pl-9 pr-4" />
    </div>

    <div class="flex-1" />

    <!-- Icons -->
    <button class="icon-btn group">
      <svg
        class="h-5 w-5 transform transition duration-150 group-hover:scale-110 group-hover:rotate-6"
        style="color: #9690a8;"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    </button>
    <button class="icon-btn group">
      <svg
        class="h-5 w-5 transform transition duration-150 group-hover:scale-110 group-hover:-rotate-6"
        style="color: #9690a8;"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      <span
        class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
        style="background-color: var(--color-danger)"
      ></span>
    </button>

    <!-- User -->
    <div class="relative">
      <div
        ref="userRef"
        :aria-expanded="menuOpen"
        class="group flex items-center gap-2.5 ml-2 cursor-pointer select-none"
        @click="toggleMenu"
      >
        <div
          class="h-9 w-9 rounded-full avatar-gradient flex items-center justify-center text-white text-sm font-semibold transition-transform transform duration-150 group-hover:scale-105"
        >
          {{ initials }}
        </div>
        <span class="text-sm font-medium" style="color: #0b0817;">{{ displayName }}</span>
        <svg
          :class="[
            'h-4 w-4 transition-transform duration-150',
            menuOpen ? 'rotate-180' : '',
          ]"
          style="color: #9690a8;"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <transition name="fade">
        <div
          v-if="menuOpen"
          ref="menuRef"
          class="absolute right-0 mt-2 w-64 bg-white rounded-2xl z-50"
          style="border: 1px solid rgba(124, 58, 237, 0.12); box-shadow: 0 8px 32px rgba(30, 35, 80, 0.12);"
        >
          <!-- Cabecera -->
          <div class="px-4 pt-3 pb-2" style="border-bottom: 1px solid rgba(124, 58, 237, 0.06);">
            <p class="text-xs font-semibold uppercase tracking-wider" style="color: #7c3aed;">Mi cuenta</p>
          </div>
          <ul class="py-2">
            <li>
              <button
                class="sidebar-dropdown-item w-full text-left px-4 py-2 text-sm flex items-center gap-3 justify-start whitespace-nowrap transition"
                style="color: #0b0817;"
                @click="onEdit"
              >
                <svg
                  class="h-5 w-5 transition-transform duration-150 group-hover:scale-110"
                  style="color: #9690a8; flex-shrink: 0;"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
                <span>Editar perfil</span>
              </button>
            </li>
            <li aria-hidden="true">
              <div class="mx-4 my-1" style="border-top: 1px solid rgba(124, 58, 237, 0.06);"></div>
            </li>
            <li>
              <button
                class="sidebar-dropdown-item w-full text-left px-4 py-2 text-sm flex items-center gap-3 justify-start whitespace-nowrap transition"
                style="color: #0b0817;"
                @click="onChangePassword"
              >
                <svg
                  class="h-5 w-5 transition-transform duration-150 group-hover:scale-110"
                  style="color: #9690a8; flex-shrink: 0;"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
                <span>Cambiar contraseña</span>
              </button>
            </li>
            <li aria-hidden="true">
              <div class="mx-4 my-1" style="border-top: 1px solid rgba(124, 58, 237, 0.06);"></div>
            </li>
            <li>
              <button
                class="sidebar-dropdown-item w-full text-left px-4 py-2 text-sm flex items-center gap-3 justify-start whitespace-nowrap transition"
                style="color: #0b0817;"
                @click="onManageAddresses"
              >
                <svg
                  class="h-5 w-5 transition-transform duration-150 group-hover:scale-110"
                  style="color: #9690a8; flex-shrink: 0;"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Direcciones</span>
              </button>
            </li>
            <li aria-hidden="true">
              <div class="mx-4 my-1" style="border-top: 1px solid rgba(124, 58, 237, 0.06);"></div>
            </li>
            <li>
              <button
                class="sidebar-dropdown-item w-full text-left px-4 py-2 text-sm flex items-center gap-3 justify-start whitespace-nowrap transition"
                style="color: #ef4444;"
                @click="onLogout"
              >
                <svg
                  class="h-5 w-5 transition-transform duration-150 group-hover:scale-110"
                  style="color: #ef4444; flex-shrink: 0;"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Cerrar sesión</span>
              </button>
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <slot name="modals" />
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";

interface User {
  name?: string;
  email?: string;
}

interface Props {
  user?: User | null;
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
});

const emit = defineEmits<{
  "open-edit": [];
  "open-change-password": [];
  "manage-addresses": [];
  "admin.user.updated": [];
  "password-changed": [];
  "addresses-saved": [];
  logout: [];
}>();

const menuOpen = ref<boolean>(false);
const userRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);

const toggleMenu = (): void => {
  menuOpen.value = !menuOpen.value;
};
const onEdit = (): void => {
  menuOpen.value = false;
  emit("open-edit");
};
const onChangePassword = (): void => {
  menuOpen.value = false;
  emit("open-change-password");
};
const onManageAddresses = (e?: Event): void => {
  if (e && e.preventDefault) e.preventDefault();
  menuOpen.value = false;
  emit("manage-addresses");
};

function onLogout(): void {
  menuOpen.value = false;
  emit("logout");
}

const displayName = computed<string>(() => props.user?.name || props.user?.email || "Usuario");

const initials = computed<string>(() => {
  const name = props.user?.name;
  if (!name) return (props.user?.email?.charAt(0) || "U").toUpperCase();
  const parts = name?.trim().split(/\s+/) || [];
  if (parts.length === 0) return (props.user?.email?.charAt(0) || "U").toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
});

function onClickOutside(e: MouseEvent): void {
  if (!menuOpen.value) return;
  if (userRef.value && userRef.value.contains(e.target as Node)) return;
  if (menuRef.value && menuRef.value.contains(e.target as Node)) return;
  menuOpen.value = false;
}

onMounted(() => document.addEventListener("click", onClickOutside));
onUnmounted(() => document.removeEventListener("click", onClickOutside));
</script>
