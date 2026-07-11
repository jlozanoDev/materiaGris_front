<script setup lang="ts">
import { useRouter } from "vue-router";
import type { PendingReport } from "@/modules/dashboard/domain/entities/PendingReport";
import type { DashboardRole } from "@/modules/dashboard/domain/entities/types";

interface Props {
  reports?: PendingReport[];
  loading?: boolean;
  role?: DashboardRole;
}

withDefaults(defineProps<Props>(), {
  reports: () => [],
  loading: false,
  role: "none",
});

const router = useRouter();

function goToReport(id: string | number): void {
  router.push({ name: "ReportView", params: { id: String(id) } });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
</script>

<template>
  <div v-if="role === 'doctor'" class="card p-5">
    <!-- Header with badge -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <h3 class="text-base font-semibold text-slate-800">Informes pendientes</h3>
        <span
          v-if="!loading && reports.length > 0"
          class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700"
        >
          {{ reports.length }} pendientes
        </span>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="n in 3"
        :key="n"
        class="flex items-center gap-3 py-2"
      >
        <div class="h-3 w-36 bg-slate-200 rounded animate-pulse" />
        <div class="h-3 w-24 bg-slate-100 rounded animate-pulse" />
        <div class="h-3 w-16 bg-slate-100 rounded animate-pulse ml-auto" />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="reports.length === 0"
      class="py-8 text-center text-sm text-slate-400"
    >
      Sin Informes pendientes
    </div>

    <!-- Report list -->
    <ul v-else class="divide-y divide-slate-100">
      <li
        v-for="report in reports.slice(0, 5)"
        :key="report.id"
        class="flex items-center justify-between py-2.5 cursor-pointer hover:bg-slate-50 rounded px-1 -mx-1 transition"
        @click="goToReport(report.id)"
      >
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-slate-800 truncate">
            {{ report.patientName }}
          </p>
          <p class="text-xs text-slate-500 truncate">
            {{ report.templateName }}
          </p>
        </div>
        <span class="text-xs text-slate-400 whitespace-nowrap ml-3">
          {{ formatDate(report.createdAt) }}
        </span>
      </li>
    </ul>

    <!-- Footer link -->
    <div
      v-if="!loading && reports.length > 0"
      class="mt-3 pt-3 border-t border-slate-100 text-center"
    >
      <router-link
        to="/reports"
        class="text-sm font-medium text-violet-600 hover:text-violet-700 transition"
      >
        Ver todos ({{ reports.length }})
      </router-link>
    </div>
  </div>
</template>
