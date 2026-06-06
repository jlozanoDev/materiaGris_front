<script setup lang="ts">
import { ref } from "vue";

interface Patient {
  initials: string;
  color: string;
  name: string;
  type: string;
  typeColor: string;
  time: string;
}

const patients: Patient[] = [
  {
    initials: "DW",
    color: "bg-teal-500",
    name: "Denzel White",
    type: "Informe",
    typeColor: "text-teal-600",
    time: "9:00",
  },
  {
    initials: "SM",
    color: "bg-pink-500",
    name: "Stacy Mitchell",
    type: "Visita semanal",
    typeColor: "text-violet-600",
    time: "9:15",
  },
  {
    initials: "AD",
    color: "bg-orange-400",
    name: "Amy Dunham",
    type: "Chequeo rutinario",
    typeColor: "text-blue-600",
    time: "9:30",
  },
  {
    initials: "DJ",
    color: "bg-slate-500",
    name: "Demi Joan",
    type: "Informe",
    typeColor: "text-teal-600",
    time: "9:50",
  },
  {
    initials: "SM",
    color: "bg-fuchsia-400",
    name: "Susan Myers",
    type: "Visita semanal",
    typeColor: "text-violet-600",
    time: "10:15",
  },
];

const selected = ref<number>(0);
const emit = defineEmits<{
  select: [patient: Patient];
}>();

function select(i: number): void {
  selected.value = i;
  emit("select", patients[i]);
}
</script>

<template>
  <div class="card p-5">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-slate-800">Lista de pacientes</h3>
      <button
        class="flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition"
        style="border-color: rgba(124, 58, 237, 0.15); color: #7c3aed;"
      >
        Hoy
        <svg
          class="h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>

    <!-- List -->
    <ul class="space-y-1">
      <li
        v-for="(p, i) in patients"
        :key="i"
        :class="[
          'flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 transition',
          selected === i ? 'bg-[#7c3aed]/10' : 'hover:bg-[#7c3aed]/5',
        ]"
        :style="selected === i ? { borderLeft: '3px solid #7c3aed', paddingLeft: '9px' } : {}"
        @click="select(i)"
      >
        <!-- Avatar -->
        <div
          :class="[
            'h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold select-none',
            p.color,
          ]"
        >
          {{ p.initials }}
        </div>

        <!-- Name + type -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-800 truncate">{{ p.name }}</p>
          <p :class="['text-xs', p.typeColor]">{{ p.type }}</p>
        </div>

        <!-- Time badge -->
        <span
          class="rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
          style="background: rgba(124, 58, 237, 0.10); color: #7c3aed;"
        >
          {{ p.time }}
        </span>
      </li>
    </ul>

    <!-- Pagination dots -->
    <div class="mt-4 flex justify-center gap-1.5">
      <span
        v-for="n in 3"
        :key="n"
        :class="[
          'h-1.5 rounded-full transition',
          n === 1 ? 'w-4' : 'w-1.5',
        ]"
        :style="n === 1 ? { background: '#7c3aed' } : { background: 'rgba(124,58,237,0.20)' }"
      />
    </div>
  </div>
</template>
