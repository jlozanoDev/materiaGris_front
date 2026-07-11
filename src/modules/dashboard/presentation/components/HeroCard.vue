<script setup lang="ts">
import logoSvg from '@/assets/logo-materiagris.svg'
import type { DashboardStats } from "@/modules/dashboard/domain/entities/DashboardStats";
import type { WeatherData } from "@/modules/dashboard/domain/entities/WeatherData";
import WeatherDisplay from "@/modules/dashboard/presentation/components/WeatherDisplay.vue";
import CitySelector from "@/modules/dashboard/presentation/components/CitySelector.vue";

interface Props {
  stats?: DashboardStats | null;
  loading?: boolean;
  error?: string | null;
  userName?: string;
  isEmptyState?: boolean;
  isNewProfessional?: boolean;
  weatherData?: WeatherData | null;
  weatherLoading?: boolean;
  weatherError?: string | null;
  showCitySelector?: boolean;
}

withDefaults(defineProps<Props>(), {
  stats: null,
  loading: false,
  error: null,
  userName: "Usuario",
  isEmptyState: false,
  isNewProfessional: false,
  weatherData: null,
  weatherLoading: false,
  weatherError: null,
  showCitySelector: false,
});

const emit = defineEmits<{
  (e: "select-city", payload: { lat: number; lon: number; name: string }): void;
}>();
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

        <!-- Empty state (new professional variant) -->
        <div v-else-if="stats && isEmptyState && isNewProfessional" class="mt-5 max-w-md">
          <p class="text-xl font-semibold text-white/95">Comienza a construir tu consulta</p>
          <ul class="mt-3 space-y-2 text-sm text-white/80">
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-white/60">•</span>
              <span>Registra tu primer paciente — añade sus datos clínicos y antecedentes</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-white/60">•</span>
              <span>Crea una plantilla de informe para agilizar tu práctica diaria</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-white/60">•</span>
              <span>Explora el panel de administración para configurar tu consulta</span>
            </li>
          </ul>
          <p class="mt-4 text-xs text-white/60">Cuando tengas actividad, aquí verás tus visitas y pacientes del día.</p>
        </div>

        <!-- Empty state (slow day variant) -->
        <div v-else-if="stats && isEmptyState" class="mt-5 max-w-md">
          <p class="text-xl font-semibold text-white/95">Hoy no hay actividad registrada</p>
          <p class="mt-2 text-sm text-white/75">
            Tienes <strong>{{ stats.totalPatients }}</strong> paciente{{ stats.totalPatients !== 1 ? 's' : '' }} registrado{{ stats.totalPatients !== 1 ? 's' : '' }}.
            Vuelve más tarde para ver las estadísticas del día.
          </p>
          <p class="mt-3 text-xs text-white/60">
            Los datos de visitas, nuevos pacientes y retornos aparecerán aquí cuando haya movimiento.
          </p>
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

      <!-- Right: weather -->
      <div class="flex flex-col items-end gap-2 flex-shrink-0">
        <WeatherDisplay
          :weather-data="weatherData"
          :loading="weatherLoading"
          :error="weatherError"
        />
        <CitySelector
          v-if="showCitySelector"
          class="w-72"
          @city-selected="(payload) => emit('select-city', payload)"
        />
      </div>
    </div>
  </div>
</template>
