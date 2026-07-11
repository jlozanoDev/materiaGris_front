<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useLogout } from "@/shared/composables/useLogout";
import { useAuthStore } from "@/core/store/auth";

type SidebarIcon = "grid" | "patients" | "reports" | "settings";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const active = ref<number>(0);
const items: SidebarIcon[] = ["grid", "patients", "reports", "settings"];
const { logout, loading } = useLogout();

const hasAnySettingsPermission = computed(() =>
  authStore.hasPermissions(
    [
      "admin.clinic.update",
      "admin.user.view",
      "admin.users.view",
      "admin.role.view",
      "admin.roles.view",
      "admin.permission.view",
      "admin.permissions.view",
      "admin.reporttemplate.view",
    ],
    "any"
  )
);

const menuOpen = ref<boolean>(false);
const settingsWrapRef = ref<HTMLElement | null>(null);
const settingsMenuRef = ref<HTMLElement | null>(null);

function handleItemClick(i: number, icon: SidebarIcon, _event?: Event): void {
  active.value = i;
  if (icon === "settings") {
    menuOpen.value = !menuOpen.value;
    return;
  } else {
    menuOpen.value = false;
  }

  const routes: Record<string, { name: string }> = {
    grid: { name: "Dashboard" },
    patients: { name: "Patients" },
    reports: { name: "ReportList" },
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

function getIconForPath(p: string): SidebarIcon | null {
  if (!p) return null;
  if (p === "/" || p === "") return "grid";
  if (p.startsWith("/patients")) return "patients";
  if (p.startsWith("/reports")) return "reports";
  if (p.startsWith("/admin")) return "settings";
  return null;
}

const titlesMap: Record<SidebarIcon, string> = {
  grid: "Inicio",
  patients: "Pacientes",
  reports: "Informes",
  settings: "Ajustes",
};

function getTitle(icon: SidebarIcon): string {
  return titlesMap[icon] || "";
}

function openAdminRoute(path: { name: string }): void {
  menuOpen.value = false;
  router.push(path);
}

function onClickOutside(e: MouseEvent): void {
  if (!menuOpen.value) return;
  const target = e.target as Node | null;
  if (!target) return;
  if (settingsWrapRef.value?.contains(target)) return;
  if (settingsMenuRef.value?.contains(target)) return;
  menuOpen.value = false;
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  const activeIcon = getIconForPath(route.path);
  if (activeIcon) active.value = items.indexOf(activeIcon);
});
onUnmounted(() => document.removeEventListener("click", onClickOutside));

watch(
  () => route.path,
  (p) => {
    const icon = getIconForPath(p);
    if (icon) active.value = items.indexOf(icon);
  }
);
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
        v-has-permission="icon === 'patients' ? 'patient.view' : icon === 'reports' ? 'report.view' : null"
        :title="getTitle(icon)"
        :aria-label="getTitle(icon)"
        :class="[
          'sidebar-item',
          active === items.indexOf(icon) ? 'sidebar-item--active' : 'sidebar-item--inactive',
        ]"
        @click="handleItemClick(items.indexOf(icon), icon, $event)"
      >
        <i v-if="icon === 'grid'" class="pi pi-th-large text-current text-lg"></i>
        <i v-else-if="icon === 'patients'" class="pi pi-users text-current text-lg"></i>
        <i v-else-if="icon === 'reports'" class="pi pi-file text-current text-lg"></i>
      </button>

      <!-- Settings: fuera del v-for para que settingsWrapRef sea un solo nodo DOM -->
      <div v-if="hasAnySettingsPermission" ref="settingsWrapRef" class="relative">
        <button
          :title="getTitle('settings')"
          :aria-label="getTitle('settings')"
          :class="[
            'sidebar-item',
            active === items.indexOf('settings')
              ? 'sidebar-item--active'
              : 'sidebar-item--inactive',
          ]"
          @click.stop="handleItemClick(items.indexOf('settings'), 'settings', $event)"
        >
          <i class="pi pi-cog text-current text-lg"></i>
        </button>

        <div
          v-if="menuOpen"
          ref="settingsMenuRef"
          class="absolute left-full top-0 w-64 bg-white rounded-2xl z-50 ml-2"
          style="border: 1px solid rgba(124, 58, 237, 0.12); box-shadow: 0 8px 32px rgba(30, 35, 80, 0.12);"
        >
          <!-- Cabecera del dropdown -->
          <div class="px-4 pt-3 pb-2" style="border-bottom: 1px solid rgba(124, 58, 237, 0.06);">
            <p class="text-xs font-semibold uppercase tracking-wider" style="color: #7c3aed;">Ajustes</p>
          </div>
          <ul class="py-2">
            <!-- Gestión de Clínica -->
            <li v-if="authStore.hasPermission('admin.clinic.update')">
              <button
                title="Clínica"
                aria-label="Clínica"
                class="sidebar-dropdown-item w-full text-left px-4 py-2 text-sm flex items-center gap-3 justify-start whitespace-nowrap transition"
                style="color: #0b0817;"
                @click.prevent="openAdminRoute({ name: 'AdminClinic' })"
              >
                <i
                  class="pi pi-building text-base transition-transform duration-150 group-hover:scale-110"
                  style="color: #9690a8; width: 20px; text-align: center;"
                ></i>
                <span>Clínica</span>
              </button>
            </li>
            <li v-if="authStore.hasPermission('admin.clinic.update')" aria-hidden="true">
              <div class="mx-4 my-1" style="border-top: 1px solid rgba(124, 58, 237, 0.06);"></div>
            </li>

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
                class="sidebar-dropdown-item w-full text-left px-4 py-2 text-sm flex items-center gap-3 justify-start whitespace-nowrap transition"
                style="color: #0b0817;"
                @click.prevent="openAdminRoute({ name: 'AdminUsers' })"
              >
                <i
                  class="pi pi-user text-base transition-transform duration-150 group-hover:scale-110"
                  style="color: #9690a8; width: 20px; text-align: center;"
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
              <div class="mx-4 my-1" style="border-top: 1px solid rgba(124, 58, 237, 0.06);"></div>
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
                class="sidebar-dropdown-item w-full text-left px-4 py-2 text-sm flex items-center gap-3 justify-start whitespace-nowrap transition"
                style="color: #0b0817;"
                @click.prevent="openAdminRoute({ name: 'AdminRoles' })"
              >
                <i
                  class="pi pi-users text-base transition-transform duration-150 group-hover:scale-110"
                  style="color: #9690a8; width: 20px; text-align: center;"
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
              <div class="mx-4 my-1" style="border-top: 1px solid rgba(124, 58, 237, 0.06);"></div>
            </li>

            <!-- Gestión de Permisos -->
            <li
              v-if="
                authStore.hasPermission('admin.permission.view') ||
                authStore.hasPermission('admin.permissions.view')
              "
            >
              <button
                title="Permisos"
                aria-label="Permisos"
                class="sidebar-dropdown-item w-full text-left px-4 py-2 text-sm flex items-center gap-3 justify-start whitespace-nowrap transition"
                style="color: #0b0817;"
                @click.prevent="openAdminRoute({ name: 'AdminPermissions' })"
              >
                <i
                  class="pi pi-shield text-base transition-transform duration-150 group-hover:scale-110"
                  style="color: #9690a8; width: 20px; text-align: center;"
                ></i>
                <span>Permisos</span>
              </button>
            </li>
            <li
              v-if="authStore.hasPermission('admin.reporttemplate.view')"
              aria-hidden="true"
            >
              <div class="mx-4 my-1" style="border-top: 1px solid rgba(124, 58, 237, 0.06);"></div>
            </li>

            <!-- Gestión de Plantillas de Informes -->
            <li
              v-if="authStore.hasPermission('admin.reporttemplate.view')"
            >
              <button
                title="Plantillas de informes"
                aria-label="Plantillas de informes"
                class="sidebar-dropdown-item w-full text-left px-4 py-2 text-sm flex items-center gap-3 justify-start whitespace-nowrap transition"
                style="color: #0b0817;"
                @click.prevent="openAdminRoute({ name: 'AdminReportTemplate' })"
              >
                <i
                  class="pi pi-file text-base transition-transform duration-150 group-hover:scale-110"
                  style="color: #9690a8; width: 20px; text-align: center;"
                ></i>
                <span>Plantillas de informes</span>
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
      :disabled="loading"
      class="sidebar-item sidebar-item--inactive disabled:opacity-60"
      @click="logout"
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
    <!-- Toast handled globally in App.vue -->
  </aside>
</template>
