<script setup lang="ts">
import type { WeatherData } from "@/modules/dashboard/domain/entities/WeatherData";

interface Props {
  weatherData?: WeatherData | null;
  loading?: boolean;
  error?: string | null;
}

withDefaults(defineProps<Props>(), {
  weatherData: null,
  loading: false,
  error: null,
});
</script>

<template>
  <div class="flex flex-shrink-0 items-center justify-center relative">
    <!-- Empty skeleton -->
    <div
      v-if="!weatherData && !loading && !error"
      class="flex items-center gap-3"
    >
      <div class="h-16 w-16 bg-white/10 rounded-full animate-pulse" />
      <div class="flex flex-col gap-1.5">
        <div class="h-6 w-14 bg-white/10 rounded animate-pulse" />
        <div class="h-3 w-20 bg-white/10 rounded animate-pulse" />
      </div>
    </div>

    <!-- Loading spinner -->
    <div
      v-else-if="loading"
      class="flex items-center gap-3"
    >
      <div class="h-16 w-16 flex items-center justify-center">
        <svg
          class="animate-spin h-8 w-8 text-white/60"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
      <div class="flex flex-col gap-1.5">
        <div class="h-6 w-14 bg-white/10 rounded animate-pulse" />
        <div class="h-3 w-20 bg-white/10 rounded animate-pulse" />
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="flex items-center gap-3"
    >
      <div class="h-16 w-16 flex items-center justify-center text-white/40">
        <svg
          viewBox="0 0 24 24"
          class="h-10 w-10"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div class="flex flex-col">
        <div class="text-xs text-white/50">No disponible</div>
      </div>
    </div>

    <!-- Weather data -->
    <div
      v-else-if="weatherData"
      class="flex items-center gap-4"
    >
      <!-- sunny -->
      <svg
        v-if="weatherData.iconName === 'sunny'"
        viewBox="0 0 64 64"
        class="h-16 w-16 text-yellow-300"
        fill="currentColor"
        stroke="none"
      >
        <circle cx="32" cy="32" r="10" />
        <g stroke="currentColor" stroke-width="2" fill="none">
          <line x1="32" y1="8" x2="32" y2="16" />
          <line x1="32" y1="48" x2="32" y2="56" />
          <line x1="8" y1="32" x2="16" y2="32" />
          <line x1="48" y1="32" x2="56" y2="32" />
          <line x1="14.3" y1="14.3" x2="19.8" y2="19.8" />
          <line x1="44.2" y1="44.2" x2="49.7" y2="49.7" />
          <line x1="14.3" y1="49.7" x2="19.8" y2="44.2" />
          <line x1="44.2" y1="19.8" x2="49.7" y2="14.3" />
        </g>
      </svg>

      <!-- cloudy-sun -->
      <svg
        v-else-if="weatherData.iconName === 'cloudy-sun'"
        viewBox="0 0 64 64"
        class="h-16 w-16"
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

      <!-- foggy -->
      <svg
        v-else-if="weatherData.iconName === 'foggy'"
        viewBox="0 0 64 64"
        class="h-16 w-16 text-white/70"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <line x1="16" y1="24" x2="48" y2="24" />
        <line x1="12" y1="32" x2="52" y2="32" />
        <line x1="16" y1="40" x2="48" y2="40" />
        <line x1="20" y1="48" x2="44" y2="48" />
      </svg>

      <!-- drizzle -->
      <svg
        v-else-if="weatherData.iconName === 'drizzle'"
        viewBox="0 0 64 64"
        class="h-16 w-16 text-white/80"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M44 28a10 10 0 00-9.5-10A8 8 0 1030 36h14a6 6 0 000-8z" />
        <line x1="24" y1="40" x2="22" y2="46" />
        <line x1="32" y1="40" x2="30" y2="46" />
        <line x1="40" y1="40" x2="38" y2="46" />
      </svg>

      <!-- rainy -->
      <svg
        v-else-if="weatherData.iconName === 'rainy'"
        viewBox="0 0 64 64"
        class="h-16 w-16 text-white/80"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M44 24a10 10 0 00-9.5-10A8 8 0 1030 32h14a6 6 0 000-8z" />
        <line x1="20" y1="38" x2="16" y2="50" />
        <line x1="30" y1="38" x2="26" y2="50" />
        <line x1="40" y1="38" x2="36" y2="50" />
        <line x1="50" y1="38" x2="46" y2="50" />
      </svg>

      <!-- snowy -->
      <svg
        v-else-if="weatherData.iconName === 'snowy'"
        viewBox="0 0 64 64"
        class="h-16 w-16 text-white/80"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M44 24a10 10 0 00-9.5-10A8 8 0 1030 32h14a6 6 0 000-8z" />
        <circle cx="20" cy="42" r="2" fill="white" />
        <circle cx="32" cy="46" r="2" fill="white" />
        <circle cx="44" cy="42" r="2" fill="white" />
        <circle cx="26" cy="52" r="2" fill="white" />
        <circle cx="38" cy="52" r="2" fill="white" />
      </svg>

      <!-- shower -->
      <svg
        v-else-if="weatherData.iconName === 'shower'"
        viewBox="0 0 64 64"
        class="h-16 w-16 text-white/80"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M44 24a10 10 0 00-9.5-10A8 8 0 1030 32h14a6 6 0 000-8z" />
        <line x1="18" y1="40" x2="14" y2="50" />
        <line x1="28" y1="40" x2="24" y2="50" />
        <line x1="38" y1="40" x2="34" y2="50" />
        <line x1="48" y1="40" x2="44" y2="50" />
      </svg>

      <!-- thunder -->
      <svg
        v-else-if="weatherData.iconName === 'thunder'"
        viewBox="0 0 64 64"
        class="h-16 w-16 text-yellow-300"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M44 24a10 10 0 00-9.5-10A8 8 0 1030 32h14a6 6 0 000-8z" />
        <polygon
          points="28,34 24,46 30,46 26,58 40,42 34,42 38,34"
          fill="currentColor"
          stroke="none"
        />
      </svg>

      <!-- unknown / default -->
      <svg
        v-else
        viewBox="0 0 64 64"
        class="h-16 w-16 text-white/50"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="32" cy="32" r="14" />
        <line x1="32" y1="26" x2="32" y2="34" />
        <line x1="32" y1="38" x2="32.01" y2="38" />
      </svg>

      <div class="text-right">
        <div class="text-4xl font-bold">{{ Math.round(weatherData.temperature) }}°C</div>
        <div class="text-sm text-white/80">{{ weatherData.description }}</div>
      </div>
    </div>
  </div>
</template>
