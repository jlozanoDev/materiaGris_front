<script setup lang="ts">
import { ref } from 'vue'
import logoSvg from '@/assets/logo-materiagris.svg'
import heroBgRight from '@/assets/hero-bg-right.png'
import { useParticleNetwork } from '@/modules/auth/presentation/composables/useParticleNetwork'

const emit = defineEmits<{
  demo: []
  viewPlatform: []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
useParticleNetwork(canvasRef)
</script>

<template>
  <section
    id="hero"
    class="relative min-h-screen flex flex-col justify-center overflow-hidden"
    style="background: #0f0a1e; padding-top: 80px;"
  >
    <!-- Particle network canvas -->
    <div
      class="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style="z-index: 0;"
    >
      <canvas
        ref="canvasRef"
        class="absolute inset-0 w-full h-full"
      />
    </div>

    <!-- Glow orbs -->
    <div class="absolute w-[500px] h-[500px] rounded-full pointer-events-none" style="background: rgba(124,58,237,0.08); filter: blur(80px); top: -200px; left: -100px;"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full pointer-events-none" style="background: rgba(6,182,212,0.05); filter: blur(80px); bottom: -100px; right: -80px;"></div>

    <!-- Background image (55% width, right side) -->
    <div
      class="hidden lg:block absolute top-0 bottom-0 right-0 pointer-events-none z-0 bg-no-repeat bg-right bg-contain"
      style="width: 55%; height: 100%; background-image: url(heroBgRight);"
      :style="{ backgroundImage: `url(${heroBgRight})` }"
    ></div>

    <div class="relative z-10 px-7 mx-auto" style="max-width: 1140px;">
      <div class="flex flex-col items-start" style="gap: 32px;">
        <div class="" style="max-width: 520px; text-align: left;">
          <!-- Brain logo + brand -->
          <div class="flex items-center gap-4 mb-8">
            <img :src="logoSvg" alt="MaterIA Gris" width="72" height="72" style="object-fit: contain;" />
            <span class="font-sans font-extrabold text-white" style="font-size: 58px; line-height: 1; letter-spacing: -0.025em;">MaterIA Gris</span>
          </div>
          <!-- Eyebrow -->
          <p class="font-mono font-medium uppercase" style="font-size: 13px; letter-spacing: 0.12em; margin-bottom: 20px; color: #06b6d4;">
            Plataforma clínica con inteligencia artificial
          </p>

          <!-- H1 -->
          <h1 class="font-sans font-extrabold text-white" style="font-size: clamp(40px, 5.5vw, 68px); line-height: 1.04; letter-spacing: -0.025em; margin-bottom: 20px;">
            Tu socio de IA para una<br>
            <span class="bg-clip-text text-transparent" style="background-image: linear-gradient(135deg, #a78bfa, #06b6d4);">clínica inteligente y humana</span>
          </h1>

          <!-- Lead -->
          <p class="leading-relaxed" style="font-size: 18px; line-height: 1.6; color: #9690a8; max-width: 56ch; margin-bottom: 32px;">
            Diagnóstico asistido, informes inteligentes y gestión integral del paciente en una sola plataforma.
          </p>

          <!-- CTAs -->
          <div class="flex flex-wrap gap-3">
            <button
              class="inline-flex items-center gap-2 font-semibold text-white transition"
              style="padding: 12px 24px; border-radius: 10px; font-size: 15px; letter-spacing: -0.005em; background: #7c3aed; box-shadow: 0 1px 12px rgba(124, 58, 237, 0.30);"
              @click="emit('demo')"
            >
              Solicitar demo gratuita
            </button>
            <button
              class="inline-flex items-center gap-2 font-medium transition hover:bg-white/5"
              style="padding: 12px 24px; border-radius: 10px; font-size: 15px; letter-spacing: -0.005em; background: transparent; color: #e8e4f0; border: 1px solid rgba(255, 255, 255, 0.10);"
              @click="emit('viewPlatform')"
            >
              Ver plataforma
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
