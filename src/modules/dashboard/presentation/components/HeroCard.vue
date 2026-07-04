<script setup lang="ts">
import logoSvg from '@/assets/logo-materiagris.svg'
import type { DashboardStats } from "@/modules/dashboard/domain/entities/DashboardStats";

interface Props {
  stats?: DashboardStats | null;
  loading?: boolean;
  error?: string | null;
  userName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  stats: null,
  loading: false,
  error: null,
  userName: "Usuario",
});
</script>

<template>
  <div class="hero-card relative overflow-hidden p-6 text-white min-h-[200px] md:w-1/2">
    <!-- Brand watermark -->
    <img
      :src="logoSvg"
      alt=""
      class="pointer-events-none absolute select-none opacity-[0.08]"
      style="width: 180px; height: auto; bottom: -20px; right: 80px;"
    />

    <div class="relative z-10 flex items-end justify-between gap-6">
      <!-- Left: text + stats -->
      <div>
        <p class="text-lg text-white/90">Buenos días</p>
        <h2 class="mt-0.5 text-3xl font-bold tracking-tight">{{ userName }}!</h2>

        <!-- Error badge -->
        <div
          v-if="error"
          class="mt-4 rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-100 border border-red-400/30"
        >
          {{ error }}
        </div>

        <!-- Loading skeleton -->
        <div v-else-if="loading" class="mt-5 space-y-4">
          <div class="h-4 w-24 bg-white/20 rounded animate-pulse" />
          <div class="h-16 w-32 bg-white/20 rounded animate-pulse" />
          <div class="flex gap-3">
            <div class="h-20 w-36 bg-white/20 rounded-2xl animate-pulse" />
            <div class="h-20 w-36 bg-white/20 rounded-2xl animate-pulse" />
          </div>
        </div>

        <!-- Stats data -->
        <template v-else-if="stats">
          <div class="mt-5">
            <p class="text-sm text-white/70 uppercase tracking-widest">Visitas hoy</p>
            <p class="mt-1 text-7xl font-bold leading-none">{{ stats.visits }}</p>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <!-- New Patients -->
            <div
              class="rounded-2xl px-4 py-3 backdrop-blur-xl"
              style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.20);"
            >
              <p class="text-xs text-white/80">Nuevos pacientes</p>
              <div class="mt-1 flex items-center gap-2.5">
                <span class="text-2xl font-bold">{{ stats.newPatients }}</span>
              </div>
            </div>
            <!-- Returning Patients -->
            <div
              class="rounded-2xl px-4 py-3 backdrop-blur-xl"
              style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.20);"
            >
              <p class="text-xs text-white/80">Pacientes antiguos</p>
              <div class="mt-1 flex items-center gap-2.5">
                <span class="text-2xl font-bold">{{ stats.returningPatients }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Right: weather icon -->
      <div class="flex flex-shrink-0 items-center justify-center h-20 w-36 relative">
        <div class="flex items-center gap-3">
          <!-- Sun+Cloud SVG -->
          <svg
            viewBox="0 0 64 64"
            class="h-12 w-12 text-white/90"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <g fill="currentColor" class="text-yellow-300">
              <circle cx="20" cy="20" r="8" />
            </g>
            <g fill="currentColor" class="text-white/90">
              <path d="M44 32a10 10 0 00-9.5-9.995A8 8 0 1030 40h14a6 6 0 000-8z" />
            </g>
          </svg>
          <div class="text-right">
            <div class="text-2xl font-bold">22°C</div>
            <div class="text-xs text-white/70">Soleado</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
