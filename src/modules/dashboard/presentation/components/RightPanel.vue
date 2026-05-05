<script setup>
import { ref, computed } from 'vue'

/* ── Calendar ─────────────────────────────────────── */
const today = { year: 2026, month: 2, day: 28 } // March 28, 2026

const viewDate = ref(new Date(today.year, today.month, 1))

const monthName = computed(() =>
  viewDate.value.toLocaleString('en-US', { month: 'long' })
)
const yearNum = computed(() => viewDate.value.getFullYear())

const calDays = computed(() => {
  const y = viewDate.value.getFullYear()
  const m = viewDate.value.getMonth()
  const firstDow = new Date(y, m, 1).getDay()
  const total    = new Date(y, m + 1, 0).getDate()
  const cells = Array(firstDow).fill(null)
  for (let d = 1; d <= total; d++) cells.push(d)
  return cells
})

// Days with appointment dots
const dotDays = new Set([1, 8, 14, 21])

function prevMonth() {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() - 1)
  viewDate.value = d
}
function nextMonth() {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() + 1)
  viewDate.value = d
}

const isToday = (day) =>
  day &&
  viewDate.value.getFullYear() === today.year &&
  viewDate.value.getMonth() === today.month &&
  day === today.day
</script>

<template>
  <aside class="flex w-[288px] flex-none flex-col gap-5 overflow-y-auto border-l border-slate-100 bg-white px-5 py-5">

    <!-- ── Calendar ─────────────────────────────── -->
    <div>
      <!-- encabezado -->
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-800">Calendario</h3>
        <div class="flex gap-1">
          <button @click="prevMonth"
            class="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button @click="nextMonth"
            class="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <p class="mb-3 text-xs text-slate-500">{{ monthName }} {{ yearNum }}</p>

      <!-- days of week -->
      <div class="mb-1 grid grid-cols-7 text-center">
        <span v-for="d in ['D','L','M','X','J','V','S']" :key="d"
          class="text-[10px] font-semibold text-slate-400 py-1">{{ d }}</span>
      </div>

      <!-- date cells -->
      <div class="grid grid-cols-7 text-center gap-y-0.5">
        <div v-for="(day, i) in calDays" :key="i"
          class="flex flex-col items-center justify-center h-7 w-full">
          <span v-if="day"
            :class="[
              'relative flex h-6 w-6 items-center justify-center rounded-full text-xs transition',
              isToday(day)
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-700 hover:bg-indigo-50 cursor-pointer'
            ]">
            {{ day }}
            <!-- dot -->
            <span v-if="dotDays.has(day) && !isToday(day)"
              class="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-red-500"></span>
          </span>
        </div>
      </div>
    </div>

    <!-- ── Próximos ───────────────────────────── -->
    <div>
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-800">Próximos</h3>
        <button class="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition">Ver todo</button>
      </div>
      <div class="card p-3 bg-indigo-50 border-indigo-100 flex items-start gap-3">
        <div class="h-8 w-8 flex-shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">M</div>
        <div>
          <p class="text-xs font-semibold text-slate-800">Reunión mensual de doctores</p>
          <p class="mt-0.5 text-[11px] text-slate-500">8 abril, 2026 · 16:00</p>
        </div>
      </div>
    </div>

    <!-- ── Daily Read ─────────────────────────── -->
    <div class="card overflow-hidden border border-slate-200 shadow-sm">
      <!-- Image placeholder -->
      <div class="hero-card relative h-28 flex items-end p-3">
        <div class="absolute inset-0 flex items-center justify-end pr-4 opacity-60">
          <!-- medical cross SVG decoration -->
          <svg class="h-16 w-16 text-white/40" viewBox="0 0 48 48" fill="currentColor">
            <path d="M20 0h8v20h20v8H28v20h-8V28H0v-8h20z"/>
          </svg>
        </div>
        <span class="relative rounded px-1.5 py-0.5 bg-cyan-700/60 text-[10px] uppercase tracking-widest text-cyan-100 font-semibold">
          Lectura diaria
        </span>
      </div>
      <div class="p-3">
        <p class="text-xs font-semibold text-slate-800 leading-snug">
          Educación médica equitativa con esfuerzos hacia un cambio real
        </p>
        <p class="mt-1 text-[11px] text-slate-400">medscape.com · 4 min lectura</p>
      </div>
    </div>

  </aside>
</template>
