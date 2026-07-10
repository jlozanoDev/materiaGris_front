<script setup lang="ts">
import { RouterLink } from 'vue-router'

const emit = defineEmits<{
  login: []
  demo: []
}>()
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-100"
    style="background: #0f0a1e; border-bottom: 1px solid rgba(255, 255, 255, 0.06);"
  >
    <div class="flex items-center justify-between h-16 px-7 mx-auto" style="max-width: 1140px;">
      <!-- Logo -->
      <RouterLink to="/welcome" class="flex items-center gap-2.5 font-sans text-xl font-bold text-white tracking-tight no-underline">
        <img src="@/assets/logo-materiagris.svg" alt="MaterIA Gris" width="28" height="28" class="object-contain" />
        MaterIA Gris
      </RouterLink>

      <!-- Nav links -->
      <nav class="hidden md:flex gap-8">
        <RouterLink to="/welcome#modulos" class="text-sm font-medium transition-colors duration-150" style="color: #9690a8;">Plataforma</RouterLink>
        <RouterLink to="/welcome#workflow" class="text-sm font-medium transition-colors duration-150" style="color: #9690a8;">Cómo funciona</RouterLink>
        <RouterLink to="/welcome" class="text-sm font-medium transition-colors duration-150" style="color: #9690a8;">Blog</RouterLink>
        <RouterLink to="/welcome" class="text-sm font-medium transition-colors duration-150" style="color: #9690a8;">Documentación</RouterLink>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button
          class="font-semibold text-white transition"
          style="padding: 8px 18px; border-radius: 10px; font-size: 13px; background: #7c3aed; box-shadow: 0 1px 12px rgba(124, 58, 237, 0.30);"
          @click="emit('login')"
        >
          Acceder
        </button>
       
      </div>
    </div>
  </header>
</template>
