<script setup lang="ts">
const emit = defineEmits<{
  login: []
  demo: []
}>()
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-100"
    style="background: rgba(15, 10, 30, 0.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255, 255, 255, 0.06);"
  >
    <div class="flex items-center justify-between h-16 px-7 mx-auto" style="max-width: 1140px;">
      <!-- Logo -->
      <span class="flex items-center gap-2.5 font-sans text-xl font-bold text-white tracking-tight">
        <img src="@/assets/logo-materiagris.svg" alt="MaterIA Gris" width="28" height="28" class="object-contain" />
        MaterIA Gris
      </span>

      <!-- Nav links -->
      <nav class="hidden md:flex gap-8">
        <a href="#modulos" class="text-sm font-medium transition-colors duration-150" style="color: #9690a8;">Plataforma</a>
        <a href="#precios" class="text-sm font-medium transition-colors duration-150" style="color: #9690a8;">Precios</a>
        <a href="#" class="text-sm font-medium transition-colors duration-150" style="color: #9690a8;">Blog</a>
        <a href="#" class="text-sm font-medium transition-colors duration-150" style="color: #9690a8;">Documentación</a>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button
          class="bg-transparent border border-white/10 font-medium transition hover:bg-white/5"
          style="padding: 8px 16px; border-radius: 10px; font-size: 13px; color: #9690a8;"
          @click="emit('login')"
        >
          Acceder
        </button>
        <button
          class="font-semibold text-white transition"
          style="padding: 8px 18px; border-radius: 10px; font-size: 13px; background: #7c3aed; box-shadow: 0 1px 12px rgba(124, 58, 237, 0.30);"
          @click="emit('demo')"
        >
          Solicitar demo
        </button>
      </div>
    </div>
  </header>
</template>
