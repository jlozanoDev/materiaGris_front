<script setup lang="ts">
import { ref, computed } from "vue";

/* ── Calendar ─────────────────────────────────────── */
const now = new Date();
const today = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };

const viewDate = ref<Date>(new Date(today.year, today.month, 1));

const monthName = computed<string>(() => viewDate.value.toLocaleString("es-ES", { month: "long" }));
const yearNum = computed<number>(() => viewDate.value.getFullYear());

const calDays = computed<(number | null)[]>(() => {
  const y = viewDate.value.getFullYear();
  const m = viewDate.value.getMonth();
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const total = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
});

function prevMonth(): void {
  const d = new Date(viewDate.value);
  d.setMonth(d.getMonth() - 1);
  viewDate.value = d;
}
function nextMonth(): void {
  const d = new Date(viewDate.value);
  d.setMonth(d.getMonth() + 1);
  viewDate.value = d;
}

const isToday = (day: number | null): boolean =>
  day !== null &&
  day !== undefined &&
  viewDate.value.getFullYear() === today.year &&
  viewDate.value.getMonth() === today.month &&
  day === today.day;

/* ── Daily reads ──────────────────────────────────── */
const readings = ref([
  {
    title: "Educación médica equitativa con esfuerzos hacia un cambio real",
    source: "medscape.com",
    readTime: "4 min",
    tag: "Medicina social",
    bg: "#7c3aed",
    icon: "pi-heart",
  },
  {
    title: "Nuevos biomarcadores en la detección temprana del cáncer",
    source: "thelancet.com",
    readTime: "6 min",
    tag: "Oncología",
    bg: "#0891b2",
    icon: "pi-search-plus",
  },
  {
    title: "Protocolos actualizados para el manejo de la diabetes tipo 2",
    source: "nih.gov",
    readTime: "5 min",
    tag: "Endocrinología",
    bg: "#059669",
    icon: "pi-chart-line",
  },
]);
</script>

<template>
  <aside
    class="flex w-[288px] flex-none flex-col gap-5 overflow-y-auto bg-white px-5 py-5"
    style="border-left: 1px solid rgba(124, 58, 237, 0.06);"
  >
    <!-- ── Calendar ─────────────────────────────── -->
    <div>
      <!-- encabezado -->
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold" style="color: #0b0817;">Calendario</h3>
        <div class="flex gap-1">
          <button
            class="flex h-6 w-6 items-center justify-center rounded-full transition"
            style="color: #9690a8;"
            @click="prevMonth"
          >
            <svg
              class="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            class="flex h-6 w-6 items-center justify-center rounded-full transition"
            style="color: #9690a8;"
            @click="nextMonth"
          >
            <svg
              class="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
      <p class="mb-3 text-xs" style="color: #9690a8;">{{ monthName }} {{ yearNum }}</p>

      <!-- days of week -->
      <div class="mb-1 grid grid-cols-7 text-center">
        <span
          v-for="d in ['L', 'M', 'X', 'J', 'V', 'S', 'D']"
          :key="d"
          class="text-[10px] font-semibold py-1"
          style="color: #9690a8;"
          >{{ d }}</span
        >
      </div>

      <!-- date cells -->
      <div class="grid grid-cols-7 text-center gap-y-0.5">
        <div
          v-for="(day, i) in calDays"
          :key="i"
          class="flex flex-col items-center justify-center h-7 w-full"
        >
          <span
            v-if="day"
            :class="[
              'relative flex h-6 w-6 items-center justify-center rounded-full text-xs transition',
            ]"
            :style="isToday(day)
              ? { background: '#7c3aed', color: '#ffffff', fontWeight: 700 }
              : { color: '#0b0817' }"
            @mouseenter="(e) => { if (!isToday(day)) { (e.target as HTMLElement).style.background = 'rgba(124,58,237,0.08)' } }"
            @mouseleave="(e) => { if (!isToday(day)) { (e.target as HTMLElement).style.background = 'transparent' } }"
          >
            {{ day }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Próximos ───────────────────────────── -->
    <div>
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold" style="color: #0b0817;">Próximos</h3>
        <button class="text-xs font-medium transition" style="color: #7c3aed;">
          Ver todo
        </button>
      </div>
      <div
        class="flex items-start gap-3 p-3 rounded-2xl"
        style="background: rgba(124, 58, 237, 0.06); border: 1px solid rgba(124, 58, 237, 0.10);"
      >
        <div
          class="h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style="background: #7c3aed;"
        >
          M
        </div>
        <div>
          <p class="text-xs font-semibold" style="color: #0b0817;">Reunión mensual de doctores</p>
          <p class="mt-0.5 text-[11px]" style="color: #9690a8;">8 abril, 2026 · 16:00</p>
        </div>
      </div>
    </div>

    <!-- ── Daily Reads ────────────────────────── -->
    <div>
      <h3 class="mb-3 text-sm font-semibold" style="color: #0b0817;">Lecturas diarias</h3>
      <div class="flex flex-col gap-2">
        <div
          v-for="(r, i) in readings"
          :key="i"
          class="overflow-hidden rounded-2xl border"
          style="border-color: rgba(124, 58, 237, 0.08);"
        >
          <div class="hero-card relative h-24 flex items-end p-3" :style="{ background: r.bg }">
            <div class="absolute inset-0 flex items-center justify-end pr-4 opacity-40">
              <i :class="['pi', r.icon, 'text-4xl text-white/30']"></i>
            </div>
            <span
              class="relative rounded px-1.5 py-0.5 text-[10px] uppercase tracking-widest font-semibold"
              style="background: rgba(124,58,237,0.50); color: #ffffff;"
            >
              {{ r.tag }}
            </span>
          </div>
          <div class="p-3">
            <p class="text-xs font-semibold leading-snug" style="color: #0b0817;">{{ r.title }}</p>
            <p class="mt-1 text-[11px]" style="color: #9690a8;">{{ r.source }} · {{ r.readTime }} lectura</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
