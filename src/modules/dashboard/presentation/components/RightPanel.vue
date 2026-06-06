<script setup lang="ts">
import { ref, computed } from "vue";

/* ── Calendar ─────────────────────────────────────── */
const now = new Date();
const today = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };

const viewDate = ref<Date>(new Date(today.year, today.month, 1));

const monthName = computed<string>(() => viewDate.value.toLocaleString("en-US", { month: "long" }));
const yearNum = computed<number>(() => viewDate.value.getFullYear());

const calDays = computed<(number | null)[]>(() => {
  const y = viewDate.value.getFullYear();
  const m = viewDate.value.getMonth();
  const firstDow = new Date(y, m, 1).getDay();
  const total = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
});

// Days with appointment dots
const dotDays = new Set<number>([1, 8, 14, 21]);

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
          v-for="d in ['D', 'L', 'M', 'X', 'J', 'V', 'S']"
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
            <!-- dot -->
            <span
              v-if="dotDays.has(day) && !isToday(day)"
              class="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
              style="background: #06b6d4;"
            ></span>
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

    <!-- ── Daily Read ─────────────────────────── -->
    <div class="card overflow-hidden" style="border: 1px solid rgba(124, 58, 237, 0.08);">
      <!-- Image placeholder -->
      <div class="hero-card relative h-28 flex items-end p-3">
        <div class="absolute inset-0 flex items-center justify-end pr-4 opacity-40">
          <!-- medical cross SVG decoration -->
          <svg class="h-16 w-16 text-white/30" viewBox="0 0 48 48" fill="currentColor">
            <path d="M20 0h8v20h20v8H28v20h-8V28H0v-8h20z" />
          </svg>
        </div>
        <span
          class="relative rounded px-1.5 py-0.5 text-[10px] uppercase tracking-widest font-semibold"
          style="background: rgba(124,58,237,0.50); color: #ffffff;"
        >
          Lectura diaria
        </span>
      </div>
      <div class="p-3">
        <p class="text-xs font-semibold leading-snug" style="color: #0b0817;">
          Educación médica equitativa con esfuerzos hacia un cambio real
        </p>
        <p class="mt-1 text-[11px]" style="color: #9690a8;">medscape.com · 4 min lectura</p>
      </div>
    </div>
  </aside>
</template>
