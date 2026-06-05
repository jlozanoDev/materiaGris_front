<script setup lang="ts">
import logoSvg from '@/assets/logo-materiagris.svg'
</script>

<template>
  <section
    class="border-y border-transparent"
    style="padding-block: clamp(24px, 3.5vw, 44px); background: linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.04)); border-image: linear-gradient(90deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2), rgba(124,58,237,0.2)) 1;"
  >
    <div class="tagline-container px-7 mx-auto flex flex-col sm:flex-row items-center" style="max-width: 1140px; gap: 32px;">
      <!-- Brand -->
      <div class="tagline-brand flex items-center shrink-0" style="gap: 12px; padding-right: 32px; border-right: 1px solid rgba(0,0,0,0.08);">
        <div>
          <p class="font-mono uppercase font-medium" style="font-size: 10px; letter-spacing: 0.08em; color: #7c3aed; margin-bottom: 2px;">
            Plataforma clínica IA
          </p>
          <span class="font-sans font-extrabold tracking-tight whitespace-nowrap" style="font-size: clamp(18px, 2.2vw, 28px); letter-spacing: -0.025em; color: #0b0817;">
            MaterIA Gris
          </span>
        </div>
        <img :src="logoSvg" alt="MaterIA Gris" class="tagline-logo shrink-0" style="width: clamp(100px, 12vw, 160px); height: auto;" />
      </div>

      <!-- Text -->
      <p class="tagline-text m-0" style="font-size: clamp(14px, 1.6vw, 18px); font-weight: 400; line-height: 1.5; letter-spacing: -0.005em; color: #6b6b7b; text-align: left;">
        Diagnóstico asistido, informes inteligentes y gestión integral del paciente en una sola plataforma.
        <span style="color: #7c3aed; font-weight: 600;">Procesamiento en menos de 60 segundos.</span>
      </p>
    </div>
  </section>
</template>

<style scoped>
@media (max-width: 920px) {
  .tagline-container {
    flex-direction: column;
    text-align: center;
  }
  .tagline-text {
    text-align: center !important;
  }
  .tagline-logo {
    width: 80px !important;
  }
  .tagline-brand {
    justify-content: center;
    border-right: none !important;
    padding-right: 0 !important;
  }
}
@media (max-width: 580px) {
  .tagline-container {
    gap: 12px;
  }
  .tagline-brand span {
    font-size: 18px !important;
  }
}
</style>
