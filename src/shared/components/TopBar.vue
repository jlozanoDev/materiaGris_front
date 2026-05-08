<template>
  <header class="card flex items-center gap-4 px-5 py-3">
    <!-- Search -->
    <div class="relative flex-1 max-w-sm">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
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
        class="h-5 w-5 text-current transform transition duration-150 group-hover:scale-110 group-hover:rotate-6 group-hover:text-indigo-600"
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
        class="h-5 w-5 text-current transform transition duration-150 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-indigo-600"
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
        @click="toggleMenu"
        :aria-expanded="menuOpen"
        class="group flex items-center gap-2.5 ml-2 cursor-pointer select-none"
      >
        <div
          class="h-9 w-9 rounded-full avatar-gradient flex items-center justify-center text-white text-sm font-semibold transition-transform transform duration-150 group-hover:scale-105"
        >
          {{ initials }}
        </div>
        <span class="text-sm font-medium text-slate-700">{{ displayName }}</span>
        <svg
          :class="[
            'h-4 w-4 text-slate-400 transition-transform duration-150',
            menuOpen ? 'rotate-180' : '',
            'group-hover:text-slate-600',
          ]"
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
          class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-md border border-slate-100 z-50"
        >
          <ul class="py-1">
            <li>
              <button
                @click="onEdit"
                class="group w-full text-right px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 justify-end whitespace-nowrap"
              >
                <span>Editar</span>
                <svg
                  class="h-5 w-5 transition-transform transform duration-150 group-hover:scale-110 text-slate-500"
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
              </button>
            </li>
            <li aria-hidden="true">
              <div class="mx-3 my-1 border-t border-slate-100"></div>
            </li>
            <li>
              <button
                @click="onChangePassword"
                class="group w-full text-right px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 justify-end whitespace-nowrap"
              >
                <span>Cambiar contraseña</span>
                <svg
                  class="h-5 w-5 transition-transform transform duration-150 group-hover:scale-110 text-slate-500"
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
              </button>
            </li>
            <li aria-hidden="true">
              <div class="mx-3 my-1 border-t border-slate-100"></div>
            </li>
            <li>
              <button
                @click="onManageAddresses"
                class="group w-full text-right px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 justify-end whitespace-nowrap"
              >
                <span>Direcciones</span>
                <svg
                  class="h-5 w-5 transition-transform transform duration-150 group-hover:scale-110 text-slate-500"
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
              </button>
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <slot name="modals" />
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";

const props = defineProps({ user: { type: Object, default: null } });
const emit = defineEmits([
  "open-edit",
  "open-change-password",
  "manage-addresses",
  "admin.user.updated",
  "password-changed",
  "addresses-saved",
]);

const menuOpen = ref(false);
const userRef = ref(null);
const menuRef = ref(null);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};
const onEdit = () => {
  menuOpen.value = false;
  emit("open-edit");
};
const onChangePassword = () => {
  menuOpen.value = false;
  emit("open-change-password");
};
const onManageAddresses = (e) => {
  if (e && e.preventDefault) e.preventDefault();
  menuOpen.value = false;
  emit("manage-addresses");
};

const displayName = computed(() => props.user?.name || props.user?.email || "Usuario");

const initials = computed(() => {
  const name = props.user?.name;
  if (!name) return (props.user?.email?.charAt(0) || "U").toUpperCase();
  const parts = name?.trim().split(/\s+/) || [];
  if (parts.length === 0) return (props.user?.email?.charAt(0) || "U").toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
});

function onClickOutside(e) {
  if (!menuOpen.value) return;
  if (userRef.value && userRef.value.contains(e.target)) return;
  if (menuRef.value && menuRef.value.contains(e.target)) return;
  menuOpen.value = false;
}

onMounted(() => document.addEventListener("click", onClickOutside));
onUnmounted(() => document.removeEventListener("click", onClickOutside));
</script>
