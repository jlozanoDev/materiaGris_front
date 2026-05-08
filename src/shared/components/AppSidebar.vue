<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useToast } from "@/shared/composables/useToast";
import { useRouter, useRoute } from "vue-router";
import { provideAuthService } from "@/modules/auth/application/containers/authContainer";
import { useAuthStore } from "@/core/store/auth";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const active = ref(0);
const items = ["grid", "patients", "calendar", "chat", "clock", "settings"];
const loading = ref(false);
const toast = ref("");
const showToast = ref(false);

// Sidebar settings menu state
const menuOpen = ref(false);
const settingsWrapRef = ref(null);

function handleItemClick(i, icon, e) {
  active.value = i;
  if (icon === "settings") {
    // toggle settings menu
    menuOpen.value = !menuOpen.value;
    return;
  } else {
    menuOpen.value = false;
  }

  const routes = {
    grid: { name: "Dashboard" },
    patients: { name: "Patients" },
    calendar: { name: "Calendar" },
    chat: { name: "Chat" },
    clock: { name: "Clock" },
  };

  const path = routes[icon];
  if (path) {
    try {
      router.push(path);
    } catch (err) {
      console.warn("Navigation error", err);
    }
  }
}

function getIconForPath(p) {
  if (!p) return null;
  if (p === "/" || p === "") return "grid";
  if (p.startsWith("/calendar")) return "calendar";
  if (p.startsWith("/chat")) return "chat";
  if (p.startsWith("/clock")) return "clock";
  if (p.startsWith("/patients")) return "patients";
  if (p.startsWith("/admin")) return "settings";
  return null;
}

const titlesMap = {
  grid: "Inicio",
  patients: "Pacientes",
  calendar: "Calendario",
  chat: "Chat",
  clock: "Reloj",
  settings: "Ajustes",
};

function getTitle(icon) {
  return titlesMap[icon] || "";
}

function openAdminRoute(path) {
  menuOpen.value = false;
  router.push(path);
}

function onClickOutside(e) {
  if (!menuOpen.value) return;
  const target = e.target;
  if (!target) return;
  if (settingsWrapRef.value && settingsWrapRef.value.contains(target)) return;
  menuOpen.value = false;
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  // Set initial active icon based on current route
  const activeIcon = getIconForPath(route.path);
  if (activeIcon) active.value = items.indexOf(activeIcon);
});
onUnmounted(() => document.removeEventListener("click", onClickOutside));

// Keep active in sync when the route changes
watch(
  () => route.path,
  (p) => {
    const icon = getIconForPath(p);
    if (icon) active.value = items.indexOf(icon);
  }
);

async function logout() {
  if (loading.value) return;
  loading.value = true;
  try {
    const authService = provideAuthService();
    await authService.logout();
    const { show } = useToast();
    show("Sesión cerrada", "success", 900);
    setTimeout(() => router.replace({ name: "Login" }), 900);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <aside class="sidebar flex h-screen w-18 flex-none flex-col items-center py-5 text-white">
    <!-- Marca -->
    <div class="brand-avatar bg-white/10">
      <img src="/logo.svg" alt="MaterIA Gris" title="MaterIA Gris" class="h-8 w-8 object-contain" />
    </div>

    <!-- Navegación -->
    <nav class="flex flex-1 flex-col items-center gap-3">
      <!-- Botones no-settings -->
      <button
        v-for="icon in items.filter((ic) => ic !== 'settings')"
        :key="icon"
        v-has-permission="icon === 'patients' ? 'patient.view' : null"
        @click="handleItemClick(items.indexOf(icon), icon, $event)"
        :title="getTitle(icon)"
        :aria-label="getTitle(icon)"
        :class="[
          'sidebar-item',
          active === items.indexOf(icon) ? 'sidebar-item--active' : 'sidebar-item--inactive',
        ]"
      >
        <i v-if="icon === 'grid'" class="pi pi-th-large text-current text-lg"></i>
        <i v-else-if="icon === 'patients'" class="pi pi-users text-current text-lg"></i>
        <i v-else-if="icon === 'calendar'" class="pi pi-calendar text-current text-lg"></i>
        <i v-else-if="icon === 'chat'" class="pi pi-comments text-current text-lg"></i>
        <i v-else-if="icon === 'clock'" class="pi pi-clock text-current text-lg"></i>
      </button>

      <!-- Settings: fuera del v-for para que settingsWrapRef sea un solo nodo DOM -->
      <div ref="settingsWrapRef" class="relative">
        <button
          @click="handleItemClick(items.indexOf('settings'), 'settings', $event)"
          :title="getTitle('settings')"
          :aria-label="getTitle('settings')"
          :class="[
            'sidebar-item',
            active === items.indexOf('settings')
              ? 'sidebar-item--active'
              : 'sidebar-item--inactive',
          ]"
        >
          <i class="pi pi-cog text-current text-lg"></i>
        </button>

        <div
          v-if="menuOpen"
          class="absolute left-full top-0 w-64 bg-white rounded-2xl shadow-md border border-slate-100 z-50 ml-1"
        >
          <ul class="py-1">
            <!-- Gestión de Usuarios: plural y singular -->
            <li
              v-if="
                authStore.hasPermission('admin.user.view') ||
                authStore.hasPermission('admin.users.view')
              "
            >
              <button
                title="Usuarios"
                aria-label="Usuarios"
                @click.prevent="openAdminRoute({ name: 'AdminUsers' })"
                class="group w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 justify-start whitespace-nowrap"
              >
                <i
                  class="pi pi-user h-5 w-5 transition-transform transform duration-150 group-hover:scale-110 text-slate-500"
                ></i>
                <span>Usuarios</span>
              </button>
            </li>
            <li
              v-if="
                authStore.hasPermission('admin.user.view') ||
                authStore.hasPermission('admin.users.view')
              "
              aria-hidden="true"
            >
              <div class="mx-3 my-1 border-t border-slate-100"></div>
            </li>

            <!-- Gestión de Roles: plural y singular -->
            <li
              v-if="
                authStore.hasPermission('admin.role.view') ||
                authStore.hasPermission('admin.roles.view')
              "
            >
              <button
                title="Roles"
                aria-label="Roles"
                @click.prevent="openAdminRoute({ name: 'AdminRoles' })"
                class="group w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 justify-start whitespace-nowrap"
              >
                <i
                  class="pi pi-users h-5 w-5 transition-transform transform duration-150 group-hover:scale-110 text-slate-500"
                ></i>
                <span>Roles</span>
              </button>
            </li>
            <li
              v-if="
                authStore.hasPermission('admin.role.view') ||
                authStore.hasPermission('admin.roles.view')
              "
              aria-hidden="true"
            >
              <div class="mx-3 my-1 border-t border-slate-100"></div>
            </li>

            <!-- Gestión de Permisos -->
            <li>
              <button
                title="Permisos"
                aria-label="Permisos"
                @click.prevent="openAdminRoute({ name: 'AdminPermissions' })"
                class="group w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 justify-start whitespace-nowrap"
              >
                <i
                  class="pi pi-shield h-5 w-5 transition-transform transform duration-150 group-hover:scale-110 text-slate-500"
                ></i>
                <span>Permisos</span>
              </button>
            </li>
            <li aria-hidden="true"><div class="mx-3 my-1 border-t border-slate-100"></div></li>

            <li>
              <button
                title="Tipos de informes"
                aria-label="Tipos de informes"
                @click.prevent="openAdminRoute({ name: 'AdminReportTypes' })"
                class="group w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 justify-start whitespace-nowrap"
              >
                <i
                  class="pi pi-file h-5 w-5 transition-transform transform duration-150 group-hover:scale-110 text-slate-500"
                ></i>
                <span>Tipos de informes</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Cerrar sesión -->
    <button
      title="Cerrar sesión"
      aria-label="Cerrar sesión"
      @click="logout"
      :disabled="loading"
      class="sidebar-item sidebar-item--inactive disabled:opacity-60"
    >
      <svg
        v-if="!loading"
        class="h-5 w-5"
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
      <svg
        v-else
        class="h-5 w-5 animate-spin text-white/70"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
    </button>
    <!-- Toast -->
    <div v-if="showToast" class="toast toast--success" role="status" aria-live="polite">
      {{ toast }}
    </div>
  </aside>
</template>
