<script setup lang="ts">
import { ref } from "vue";

interface Patient {
  initials: string;
  color: string;
  name: string;
  info: string;
  symptoms: string[];
  lastChecked: string;
  observation: string;
  prescription: string;
}

const patient = ref<Patient>({
  initials: "DW",
  color: "bg-teal-500",
  name: "Denzel White",
  info: "Masculino · 28 años 3 meses",
  symptoms: [],
  lastChecked: "Dr Everly el 21 de abril de 2021 · Prescripción #ZJ953K10",
  observation: "Fiebre alta y tos con niveles normales de hemoglobina.",
  prescription: "Paracetamol · 2×/día\nDiazepam · Día y noche antes de comer\nWikoryl",
});
</script>

<template>
  <div class="card p-5">
    <h3 class="mb-4 text-base font-semibold text-slate-800">Consulta</h3>

    <!-- Patient card -->
    <div
      class="flex items-center gap-3 rounded-2xl p-3 mb-4"
      style="border: 1px solid rgba(124, 58, 237, 0.10);"
    >
      <div
        :class="[
          'h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold select-none',
          patient.color,
        ]"
      >
        {{ patient.initials }}
      </div>
      <div>
        <p class="font-semibold text-sm text-slate-800">{{ patient.name }}</p>
        <p class="text-xs" style="color: #9690a8;">{{ patient.info }}</p>
      </div>
      <button class="ml-auto transition" style="color: #9690a8;">
        <svg
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </button>
    </div>

    <!-- Symptoms removed -->

    <!-- Detail rows -->
    <dl class="space-y-3 text-sm">
      <div class="grid grid-cols-[7rem_1fr] gap-2">
        <dt class="font-medium" style="color: #7c3aed;">Última revisión</dt>
        <dd class="leading-snug text-xs" style="color: #6b6b7b;">{{ patient.lastChecked }}</dd>
      </div>
      <div class="grid grid-cols-[7rem_1fr] gap-2">
        <dt class="font-medium" style="color: #7c3aed;">Observación</dt>
        <dd class="leading-snug text-xs" style="color: #6b6b7b;">{{ patient.observation }}</dd>
      </div>
      <div class="grid grid-cols-[7rem_1fr] gap-2">
        <dt class="font-medium" style="color: #7c3aed;">Prescripción</dt>
        <dd class="leading-snug text-xs whitespace-pre-line" style="color: #6b6b7b;">
          {{ patient.prescription }}
        </dd>
      </div>
    </dl>
  </div>
</template>
