<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";

const emit = defineEmits<{
  (e: "city-selected", payload: { lat: number; lon: number; name: string }): void;
}>();

const query = ref("");
const searching = ref(false);
const error = ref("");
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedSearch(value: string): void {
  error.value = "";
  if (debounceTimer) clearTimeout(debounceTimer);

  if (!value.trim()) {
    return;
  }

  searching.value = true;
  debounceTimer = setTimeout(async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value.trim())}&format=json&limit=1`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Nominatim error");

      const data = await response.json();

      if (!data || data.length === 0) {
        error.value = "Ciudad no encontrada";
        searching.value = false;
        return;
      }

      const result = data[0];
      emit("city-selected", {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        name: result.display_name,
      });
      query.value = result.display_name.split(",")[0];
      error.value = "";
    } catch {
      error.value = "Ciudad no encontrada";
    } finally {
      searching.value = false;
    }
  }, 300);
}

function onInput(value: string): void {
  query.value = value;
  debouncedSearch(value);
}

function onSubmit(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!query.value.trim()) return;

  searching.value = true;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.value.trim())}&format=json&limit=1`;
  fetch(url)
    .then((r) => r.json())
    .then((data) => {
      if (!data || data.length === 0) {
        error.value = "Ciudad no encontrada";
        return;
      }
      const result = data[0];
      emit("city-selected", {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        name: result.display_name,
      });
      query.value = result.display_name.split(",")[0];
      error.value = "";
    })
    .catch(() => {
      error.value = "Ciudad no encontrada";
    })
    .finally(() => {
      searching.value = false;
    });
}

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <p class="text-xs text-white/60">
      Permite ubicación para clima real o escribe una ciudad:
    </p>
    <form
      class="flex gap-2"
      @submit.prevent="onSubmit"
    >
      <input
        v-model="query"
        type="text"
        placeholder="Ej: Bogotá, Madrid..."
        class="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 transition-colors"
        :disabled="searching"
        @input="onInput(($event.target as HTMLInputElement).value)"
      />
      <button
        type="submit"
        class="rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-2 text-xs text-white/80 transition-colors disabled:opacity-50"
        :disabled="searching || !query.trim()"
      >
        <svg
          v-if="searching"
          class="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span v-else>Buscar</span>
      </button>
    </form>
    <p
      v-if="error"
      class="text-xs text-red-300"
    >
      {{ error }}
    </p>
  </div>
</template>
