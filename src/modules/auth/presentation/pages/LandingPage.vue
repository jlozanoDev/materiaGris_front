<script setup>
import { useRouter } from 'vue-router'
import logo from '@/assets/materiagris.svg'
import doctor from '@/assets/doctor.png'

const router = useRouter()

const stats = [
  { value: '+2.400', label: 'Informes generados' },
  { value: '98%',    label: 'Precisión clínica' },
  { value: '< 60s',  label: 'Por informe' },
  { value: '150+',   label: 'Profesionales activos' },
]

const features = [
  {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Informes automáticos con IA',
    desc: 'Genera informes médicos completos en segundos. La inteligencia artificial analiza los datos clínicos y redacta el documento por ti.',
  },
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    title: 'Gestión de pacientes',
    desc: 'Accede al historial, citas y evoluciones de cada paciente desde un único panel ordenado y accesible.',
  },
  {
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    title: 'Panel analítico clínico',
    desc: 'Visualiza métricas de productividad, tiempos de consulta y tendencias diagnósticas en tiempo real.',
  },
]
</script>

<template>
  <!-- ─── Fondo y formas decorativas (estilo Dashboard) ─── -->
  <div class="min-h-screen h-screen flex flex-col relative overflow-x-hidden overflow-y-auto font-sans bg-[#EEF2FF]">

    <!-- Blob superior izquierdo (más sutil) -->
    <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#E9E7FF] opacity-80 blur-3xl pointer-events-none"></div>
    <!-- Blob inferior derecho (más sutil) -->
    <div class="absolute -bottom-48 -right-48 w-[28rem] h-[28rem] rounded-full bg-[#F0F7FF] opacity-90 blur-2xl pointer-events-none"></div>
    <!-- Blob mid -->
    <div class="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#DFF7FB] opacity-90 blur-3xl pointer-events-none"></div>

    <!-- Líneas diagonales SVG sutiles -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-4" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="lg-land" x1="0" x2="1">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.02" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.005" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#lg-land)" stroke-width="1">
        <path d="M0 50 L800 0" /><path d="M0 150 L800 100" /><path d="M0 250 L800 200" />
        <path d="M0 350 L800 300" /><path d="M0 450 L800 400" /><path d="M0 550 L800 500" />
      </g>
    </svg>

    <!-- imagen principal integrada dentro de la card (evita duplicados que provocan overflow) -->

    <!-- ═══════════════════════════════ NAVBAR ═══════════════════════════════ -->
    <header class="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-3 bg-white/90 px-3 py-1 rounded-lg shadow-sm">
          <div class="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 rounded-full bg-white flex items-center justify-center shadow-soft overflow-hidden">
            <img :src="logo" alt="MaterIA Gris" class="h-10 md:h-14 lg:h-16 w-auto object-contain" draggable="false" />
          </div>
          <div class="ml-3">
            <span class="hidden sm:inline text-slate-800 font-semibold text-xl">MaterIA Gris</span>
            <p class="hidden sm:block text-sm text-slate-500 -mt-0.5">Plataforma clínica</p>
          </div>
        </div>
      </div>
      <nav class="flex items-center gap-3">
        <a
          href="mailto:soporte@materiagris.com"
          class="text-sm text-slate-600 hover:text-slate-800 transition hidden sm:inline"
        >
          Soporte
        </a>
        <button
          @click="router.push('/login')"
          class="h-9 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
        >
          Iniciar sesión
        </button>
      </nav>
    </header>

    <!-- ═══════════════════════════════ HERO ════════════════════════════════ -->
    <!-- HERO: convertido a card blanca similar al Dashboard -->
    <section class="relative z-10 px-6 md:px-12 py-10">
      <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative overflow-visible">

        <div class="order-2 md:order-1 text-left">
          <span class="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Plataforma clínica impulsada por IA
          </span>

          <h1 class="text-3xl md:text-4xl font-bold text-slate-900 leading-tight max-w-xl">
            Más tiempo para
            <span class="text-indigo-600">tus pacientes,</span>
            menos tiempo en papeleo
          </h1>

          <p class="mt-4 text-sm md:text-base text-slate-600 max-w-md leading-relaxed">
            MaterIA Gris automatiza los informes médicos con inteligencia artificial para que
            <strong class="text-slate-800 font-semibold">profesionales sanitarios</strong>
            recuperen horas de su jornada clínica.
          </p>

          <div class="mt-6 flex items-center gap-3">
            <button @click="router.push('/login')" class="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition">Acceder a mi cuenta</button>
            <a href="mailto:soporte@materiagris.com" class="h-12 px-5 rounded-2xl bg-white border border-slate-100 text-slate-700 text-sm hover:shadow-sm flex items-center">Solicitar demo</a>
          </div>

          <div class="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
            <span class="bg-slate-50 px-3 py-1 rounded-full">Datos cifrados</span>
            <span class="bg-slate-50 px-3 py-1 rounded-full">Conforme RGPD</span>
            <span class="bg-slate-50 px-3 py-1 rounded-full">100% en la nube</span>
          </div>
        </div>

        <!-- placeholder: espacio reservado (imagen ahora posicionada absolute dentro de la card) -->

        <!-- Imagen del médico posicionada dentro de la card en su esquina inferior derecha -->
        <img :src="doctor" alt="Doctor MaterIA Gris" class="absolute bottom-0 right-6 z-10 hidden md:block w-40 md:w-56 lg:w-156 object-contain drop-shadow-2xl pointer-events-none" draggable="false" />
      </div>
    </section>

    <!-- ═══════════════════════════════ STATS ════════════════════════════════ -->
    <section class="relative z-10 px-6 md:px-12 pb-10">
      <div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white rounded-2xl border border-slate-100 px-5 py-4 text-center shadow-sm"
        >
          <p class="text-2xl md:text-3xl font-bold text-slate-900">{{ stat.value }}</p>
          <p class="mt-1 text-xs text-slate-500 font-medium">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════ FEATURES ═════════════════════════════ -->
    <section class="relative z-10 px-6 md:px-12 py-10">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-center text-xl md:text-2xl font-semibold text-slate-800 mb-8">
          Todo lo que necesitas dentro de la plataforma
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            v-for="feat in features"
            :key="feat.title"
            class="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-card p-6 flex flex-col gap-3 hover:bg-white transition-colors"
          >
            <!-- Icono -->
            <div class="h-11 w-11 rounded-xl bg-[#e6f6f9] flex items-center justify-center flex-shrink-0">
              <svg class="h-5 w-5 text-[#0f677a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" :d="feat.icon" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-slate-800 leading-snug">{{ feat.title }}</h3>
            <p class="text-xs text-slate-500 leading-relaxed">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════ AYUDA ════════════════════════════════ -->
    <section class="relative z-10 px-6 md:px-12 py-8">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl border border-slate-100 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <svg class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800">¿Problemas para acceder?</p>
              <p class="text-xs text-slate-600 mt-0.5">Si olvidaste tus credenciales podemos ayudarte de inmediato.</p>
            </div>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <button
              @click="router.push('/forgot-password')"
              class="h-9 px-4 rounded-xl bg-white border border-slate-100 text-slate-700 text-sm font-medium transition"
            >
              Recuperar contraseña
            </button>
            <a
              href="mailto:soporte@materiagris.com"
              class="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition flex items-center gap-1.5"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contactar soporte
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════ FOOTER ═══════════════════════════════ -->
    <footer class="relative z-10 px-6 md:px-12 py-6 border-t border-slate-100">
      <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

        <!-- Marca -->
        <div class="flex items-center gap-2">
          <img :src="logo" alt="MaterIA Gris" class="h-7 w-auto opacity-80" draggable="false" />
          <span class="text-xs text-slate-500">© {{ new Date().getFullYear() }} MaterIA Gris</span>
        </div>

        <!-- Links legales -->
        <div class="flex items-center gap-5 text-xs text-slate-500">
          <a href="#" class="hover:text-slate-700 transition">Privacidad</a>
          <a href="#" class="hover:text-slate-700 transition">Términos de uso</a>
          <a href="#" class="hover:text-slate-700 transition">Cookies</a>
          <a href="mailto:soporte@materiagris.com" class="hover:text-slate-700 transition">Contacto</a>
        </div>

        <!-- Redes sociales -->
        <div class="flex items-center gap-3">
          <!-- LinkedIn -->
          <a href="#" aria-label="LinkedIn" class="h-8 w-8 rounded-xl bg-slate-50 hover:bg-white/50 flex items-center justify-center transition">
            <svg class="h-4 w-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <!-- Twitter/X -->
          <a href="#" aria-label="Twitter" class="h-8 w-8 rounded-xl bg-slate-50 hover:bg-white/50 flex items-center justify-center transition">
            <svg class="h-4 w-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>

  </div>
</template>
