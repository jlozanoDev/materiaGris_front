<script setup lang="ts">
import { useRouter } from "vue-router";
import type { PatientSummary } from "@/modules/dashboard/domain/entities/PatientSummary";

interface Props {
  patients?: PatientSummary[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  patients: () => [],
  loading: false,
});

const router = useRouter();

function goToPatient(id: string | number): void {
  router.push(`/patients/${id}`);
}
</script>

<template>
  <div class="card p-5">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-slate-800">Últimos pacientes registrados</h3>
    </div>

    <!-- Loading skeleton -->
    <ul v-if="loading" class="space-y-1">
      <li
        v-for="n in 5"
        :key="n"
        class="flex items-center gap-3 rounded-2xl px-3 py-2.5"
      >
        <div class="h-9 w-9 flex-shrink-0 rounded-full bg-slate-200 animate-pulse" />
        <div class="flex-1 space-y-1.5">
          <div class="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          <div class="h-3 w-20 bg-slate-100 rounded animate-pulse" />
        </div>
        <div class="h-5 w-12 bg-slate-200 rounded-full animate-pulse" />
      </li>
    </ul>

    <!-- Empty state -->
    <div
      v-else-if="patients.length === 0"
      class="py-8 text-center text-sm text-slate-400"
    >
      No hay pacientes registrados
    </div>

    <!-- Data list -->
    <ul v-else class="space-y-1">
      <li
        v-for="p in patients"
        :key="p.id"
        class="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-[#7c3aed]/5"
        @click="goToPatient(p.id)"
      >
        <!-- Avatar -->
        <div
          class="h-9 w-9 flex-shrink-0 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold select-none"
        >
          {{ p.initials }}
        </div>

        <!-- Name -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-800 truncate">{{ p.name }}</p>
        </div>

        <!-- Date badge -->
        <span
          v-if="p.timeLabel"
          class="rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
          style="background: rgba(124, 58, 237, 0.10); color: #7c3aed;"
        >
          {{ p.timeLabel }}
        </span>
      </li>
    </ul>
  </div>
</template>
