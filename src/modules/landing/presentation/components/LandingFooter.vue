<script setup lang="ts">
import logoSvg from '@/assets/logo-materiagris.svg'
</script>

<template>
  <footer style="background: #0f0a1e; color: #9690a8; padding-block: 56px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 13px;">
    <div class="px-7 mx-auto" style="max-width: 1140px;">
      <div class="flex flex-wrap items-center justify-between" style="gap: 20px;">
        <div class="flex flex-col" style="gap: 4px;">
          <span class="flex items-center gap-2 font-sans font-bold text-white" style="font-size: 18px;">
            <img :src="logoSvg" alt="MaterIA Gris" width="22" height="22" style="object-fit: contain;" />
            MaterIA Gris
          </span>
          <span style="font-size: 13px; color: #9690a8;">Tu socio de IA para una práctica clínica optimizada y humana.</span>
        </div>
        <div class="flex gap-8" style="font-size: 13px;">
          <span>© 2026</span>
          <a href="#" style="color: #9690a8; transition: color 0.15s;">Aviso legal</a>
          <a href="#" style="color: #9690a8; transition: color 0.15s;">Privacidad</a>
          <a href="#" style="color: #9690a8; transition: color 0.15s;">Términos</a>
        </div>
      </div>
    </div>
  </footer>
</template>
