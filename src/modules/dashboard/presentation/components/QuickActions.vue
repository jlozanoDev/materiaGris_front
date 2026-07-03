<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";

const router = useRouter();

const actions = [
  {
    id: "new-patient",
    icon: "pi pi-user-plus",
    label: "Nuevo paciente",
    desc: "Registrar paciente",
    route: { name: "Patients" },
    color: "#7c3aed",
    bgLight: "rgba(124, 58, 237, 0.10)",
  },
  {
    id: "new-report",
    icon: "pi pi-file-edit",
    label: "Nuevo informe",
    desc: "Crear informe clínico",
    route: { name: "ReportList" },
    color: "#60a5fa",
    bgLight: "rgba(96, 165, 250, 0.12)",
  },
  {
    id: "search-patient",
    icon: "pi pi-search",
    label: "Buscar paciente",
    desc: "Encontrar rápido",
    route: { name: "Patients" },
    color: "#7867d2",
    bgLight: "rgba(120, 103, 210, 0.10)",
  },
  {
    id: "view-reports",
    icon: "pi pi-folder-open",
    label: "Ver informes",
    desc: "Listado completo",
    route: { name: "ReportList" },
    color: "#b75395",
    bgLight: "rgba(183, 83, 149, 0.10)",
  },
];

function go(route: { name: string }): void {
  router.push(route);
}

const visible = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    visible.value = true;
  });
});
</script>

<template>
  <div class="card p-5 overflow-hidden">
    <h3 class="mb-4 text-base font-semibold text-slate-800">Acciones rápidas</h3>
    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="(a, i) in actions"
        :key="a.id"
        :style="{
          transitionDelay: visible ? `${i * 60}ms` : '0ms',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
        }"
        class="quick-action-btn group relative flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-300 ease-out"
        :class="{ 'pointer-events-auto': visible }"
        @click="go(a.route)"
      >
        <!-- Icon circle -->
        <div
          class="flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
          :style="{ background: a.bgLight, color: a.color }"
        >
          <i :class="['pi text-lg', a.icon]" />
        </div>

        <!-- Label -->
        <span class="text-sm font-semibold text-slate-800 text-center leading-tight">
          {{ a.label }}
        </span>

        <!-- Description -->
        <span class="text-[11px] text-slate-400 text-center leading-tight -mt-1">
          {{ a.desc }}
        </span>

        <!-- Hover ring -->
        <div
          class="pointer-events-none absolute inset-0 rounded-2xl transition-all duration-300"
          :style="{
            border: '1px solid transparent',
          }"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.quick-action-btn {
  border: 1px solid rgba(124, 58, 237, 0.06);
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(30, 35, 80, 0.04);
}

.quick-action-btn:hover {
  border-color: transparent;
  transform: translateY(-3px) !important;
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.12);
}

.quick-action-btn:active {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.08);
}
</style>
