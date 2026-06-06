<script setup lang="ts">
import { computed } from "vue";
import logoSvg from '@/assets/logo-materiagris.svg'

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

const displayName = computed<string>(() => props.user?.name || props.user?.email || "Usuario");
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
        <h2 class="mt-0.5 text-3xl font-bold tracking-tight">{{ displayName }}!</h2>

        <div class="mt-5">
          <p class="text-sm text-white/70 uppercase tracking-widest">Visitas hoy</p>
          <p class="mt-1 text-7xl font-bold leading-none">104</p>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <!-- New Patients -->
          <div
            class="rounded-2xl px-4 py-3 backdrop-blur-xl"
            style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.20);"
          >
            <p class="text-xs text-white/80">Nuevos pacientes</p>
            <div class="mt-1 flex items-center gap-2.5">
              <span class="text-2xl font-bold">40</span>
              <span
                class="rounded-full bg-emerald-400/25 px-2 py-0.5 text-xs font-semibold text-emerald-200"
              >
                +51% ↑
              </span>
            </div>
          </div>
          <!-- Old Patients -->
          <div
            class="rounded-2xl px-4 py-3 backdrop-blur-xl"
            style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.20);"
          >
            <p class="text-xs text-white/80">Pacientes antiguos</p>
            <div class="mt-1 flex items-center gap-2.5">
              <span class="text-2xl font-bold">64</span>
              <span
                class="rounded-full bg-red-400/25 px-2 py-0.5 text-xs font-semibold text-red-200"
              >
                -20% ↓
              </span>
            </div>
          </div>
        </div>
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
