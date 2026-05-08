<script setup>
import { onMounted, ref, watch } from "vue";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBar from "@/shared/components/TopBar.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
import { useAuthStore } from "@/core/store/auth";
import UiVuetifyDataTable from "@/shared/components/UiVuetifyDataTable.vue"; // Changed import
import { usePermissions } from "@/modules/admin/permissions/presentation/composables/usePermissions";

// Composables
const authStore = useAuthStore();
const { permissions, loading, fetchPermissions } = usePermissions();

// Filters and global search for DataTable
const globalFilter = ref("");
const filters = ref({ global: { value: null, matchMode: "contains" } });
watch(globalFilter, (val) => {
  filters.value = { global: { value: val, matchMode: "contains" } };
});

const columns = [
  { key: "slug", field: "slug", label: "Slug", sortable: true },
  { key: "name", field: "name", label: "Nombre", sortable: true },
  { key: "category", field: "category", label: "Categoría", sortable: true },
  { key: "description", field: "description", label: "Descripción", sortable: false },
];

// local UI-only state to allow display in the frontend
const localPermissions = ref([]);

// keep local copy in sync with fetched permissions
watch(
  permissions,
  (v) => {
    localPermissions.value = (v || []).map((p) => ({ ...p }));
  },
  { immediate: true }
);

function rowClass(row) {
  return "border-b last:border-b-0";
}

const breadcrumb = [
  { text: "Dashboard", icon: "pi pi-objects-column", to: "/" },
  { text: "Permisos", icon: "pi pi-shield" },
];

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser();
  if (authStore.hasPermission("admin.permission.view")) {
    fetchPermissions();
  }
});
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#EEF2FF]">
    <AppSidebar />

    <div class="flex flex-1 min-w-0 overflow-hidden">
      <main class="flex flex-1 min-w-0 flex-col overflow-y-auto p-5 gap-5">
        <div class="flex flex-col gap-0">
          <Breadcrumb :items="breadcrumb" />
          <TopBar :user="authStore.user" />
        </div>

        <div
          v-if="authStore.hasPermission('admin.permission.view')"
          class="card p-6 flex flex-col flex-1 min-h-0"
        >
          <h1 class="text-2xl text-indigo-600 font-bold mb-4">
            <i
              class="pi pi-shield text-indigo-600"
              style="font-size: 1.1rem"
              aria-hidden="true"
            ></i>
            Permisos
          </h1>

          <div v-if="loading" class="text-sm text-slate-500 mb-4 italic">Cargando permisos...</div>

          <div v-else>
            <div class="flex items-center justify-between mb-3">
              <input
                v-model="globalFilter"
                placeholder="Buscar..."
                aria-label="Buscar permisos"
                class="form-input md:w-1/3"
              />
            </div>

            <div class="flex-1 min-h-0">
              <UiVuetifyDataTable
                :key="localPermissions.length"
                class="permissions-table"
                :value="localPermissions"
                dataKey="id"
                :filters="filters"
                :globalFilterFields="['slug', 'name', 'category', 'description']"
                :columns="columns"
              >
                <template #body-slug="{ data }">
                  <div class="px-3 py-2 text-sm font-mono text-indigo-600">{{ data.slug }}</div>
                </template>

                <template #body-name="{ data }">
                  <div class="px-3 py-2 text-sm">{{ data.name }}</div>
                </template>

                <template #body-category="{ data }">
                  <div class="px-3 py-2 text-sm">
                    <span
                      class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs uppercase font-semibold"
                      >{{ data.category }}</span
                    >
                  </div>
                </template>

                <template #body-description="{ data }">
                  <div class="px-3 py-2 text-sm text-slate-500">{{ data.description }}</div>
                </template>

                <template #empty>
                  <div class="px-3 py-4 text-slate-500">
                    No hay permisos para mostrar o no tienes privilegios suficientes.
                  </div>
                </template>
              </UiVuetifyDataTable>
            </div>
          </div>
        </div>
        <div v-else class="card p-6 flex items-center justify-center">
          <p class="text-slate-500">No tienes permiso para ver esta sección.</p>
        </div>
      </main>
    </div>
  </div>
</template>
