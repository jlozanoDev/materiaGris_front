<script setup lang="ts">
import { RouterLink } from 'vue-router'
import logoSvg from '@/assets/logo-materiagris.svg'

import doctorImg from '@/assets/doctor.png'
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="min-h-screen flex flex-col relative overflow-hidden"
    style="background: linear-gradient(180deg, #d0d7e2 0%, #e8ecf1 100%);"
  >
    <div
      class="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style="z-index: 1;"
    >
      <img
        :src="doctorImg"
        alt=""
        class="absolute -right-10 bottom-0 h-[110%] w-auto object-contain"
      />
    </div>
    <div class="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <RouterLink to="/welcome" class="inline-flex items-center gap-2.5 no-underline">
            <img :src="logoSvg" alt="MaterIA Gris" width="64" height="64" class="object-contain" />
            <span class="font-sans text-3xl font-extrabold tracking-tight" style="color: #0b0817;">
              MaterIA Gris
            </span>
          </RouterLink>
        </div>

        <div
          class="bg-white rounded-2xl p-8 md:p-10"
          style="box-shadow: 0 8px 32px rgba(30, 35, 80, 0.1);"
        >
          <div class="mb-6 text-center">
            <h1 class="text-xl font-bold text-gray-900">{{ title }}</h1>
            <p v-if="subtitle" class="text-sm mt-1" style="color: #6b6b7b;">{{ subtitle }}</p>
          </div>

          <slot />
        </div>
      </div>
    </div>

    <footer
      class="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-7 py-8 text-xs"
      style="background: #0f0a1e; color: #9690a8;"
    >
      <span>&copy; 2026 MaterIA Gris</span>
      <RouterLink to="/legal-notice" class="transition-colors duration-150 hover:text-white" style="color: #9690a8;">
        Aviso legal
      </RouterLink>
      <RouterLink to="/privacy" class="transition-colors duration-150 hover:text-white" style="color: #9690a8;">
        Privacidad
      </RouterLink>
      <RouterLink to="/terms" class="transition-colors duration-150 hover:text-white" style="color: #9690a8;">
        T&eacute;rminos
      </RouterLink>
    </footer>
  </div>
</template>
