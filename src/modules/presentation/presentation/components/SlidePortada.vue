<script setup lang="ts">
import { ref } from 'vue'
import logoSvg from '@/assets/logo-materiagris.svg'
import { useParticleNetwork } from '@/modules/auth/presentation/composables/useParticleNetwork'

const canvasRef = ref<HTMLCanvasElement | null>(null)
useParticleNetwork(canvasRef)
</script>

<template>
  <section class="slide">
    <!-- Particle network -->
    <div class="particle-layer">
      <canvas ref="canvasRef" class="particle-canvas" />
    </div>

    <div class="slide-content">
      <div class="hero-block">
        <!-- Logo + Brand -->
        <div class="brand-row" data-stagger>
          <img :src="logoSvg" alt="MaterIA Gris" class="brand-logo" />
          <span class="brand-name">MaterIA Gris</span>
        </div>

        <!-- Eyebrow -->
        <p class="eyebrow" data-stagger>
          Plataforma clínica con inteligencia artificial
        </p>

        <!-- Tagline -->
        <h1 class="tagline" data-stagger>
          Tu socio de IA para una<br>
          <span class="tagline-highlight">clínica inteligente y humana</span>
        </h1>

        <!-- Description -->
        <p class="lead" data-stagger>
          Diagnóstico asistido, informes inteligentes y gestión integral del paciente en una sola plataforma.
        </p>

        <!-- Hint -->
        <p class="hint" data-stagger>
          Usa las flechas ← → para navegar
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.slide {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.particle-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.particle-canvas {
  width: 100%;
  height: 100%;
}

.slide-content {
  position: relative;
  z-index: 1;
  padding: 40px;
  max-width: 680px;
}

.hero-block {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.brand-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
}
.brand-name {
  font-size: 48px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.025em;
  line-height: 1;
}

.eyebrow {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #06b6d4;
}

.tagline {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 800;
  color: #fff;
  line-height: 1.08;
  letter-spacing: -0.025em;
}
.tagline-highlight {
  background: linear-gradient(135deg, #a78bfa, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.lead {
  font-size: 18px;
  line-height: 1.6;
  color: #9690a8;
  max-width: 52ch;
}

.hint {
  font-size: 13px;
  color: rgba(255,255,255,0.25);
  margin-top: 8px;
}
</style>
