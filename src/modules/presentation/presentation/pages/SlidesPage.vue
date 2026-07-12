<script setup lang="ts">
import { useSlideShow } from '@/modules/presentation/presentation/composables/useSlideShow'
import SlideNav from '@/modules/presentation/presentation/components/SlideNav.vue'
import SlidePortada from '@/modules/presentation/presentation/components/SlidePortada.vue'
import SlideProblema from '@/modules/presentation/presentation/components/SlideProblema.vue'
import SlideSolucion from '@/modules/presentation/presentation/components/SlideSolucion.vue'
import SlidePacientes from '@/modules/presentation/presentation/components/SlidePacientes.vue'
import SlideInformes from '@/modules/presentation/presentation/components/SlideInformes.vue'
import SlideWorkflow from '@/modules/presentation/presentation/components/SlideWorkflow.vue'
import SlidePlantillas from '@/modules/presentation/presentation/components/SlidePlantillas.vue'
import SlideAdmin from '@/modules/presentation/presentation/components/SlideAdmin.vue'
import SlideStack from '@/modules/presentation/presentation/components/SlideStack.vue'

const slides = [SlidePortada, SlideProblema, SlideSolucion, SlidePacientes, SlideInformes, SlidePlantillas, SlideWorkflow, SlideAdmin, SlideStack]

const { currentSlide, totalSlides, progress, slideLabel, isFirst, isLast, isAnimating, goNext, goPrev, goTo } = useSlideShow({ totalSlides: 9 })
</script>

<template>
  <div class="slides-container">
    <!-- Glow orbs background -->
    <div class="glow-orb glow-orb--1" />
    <div class="glow-orb glow-orb--2" />

    <!-- Slides -->
    <div class="slides-stage">
      <div
        v-for="(component, index) in slides"
        :key="index"
        :data-slide-index="index"
        class="slide-panel"
        :class="{ 'slide-panel--active': currentSlide === index }"
      >
        <component :is="component" />
      </div>
    </div>

    <!-- Logo watermark -->
    <div class="watermark">
      <svg width="24" height="24" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M247.4 111.7c-14.6 2.85-28.16 9.67-38.76 20.09-24.94-4.33-50.1 5.03-67.68 23.24-6.26 7.68-10.3 16.94-11.59 26.76-31.12 1.36-55.36 26.69-57.33 57.78-.377 9.78 1.816 19.47 6.184 28.23 3.785 4.31 10.8 2.67 12.19-2.89-6.537-13.76-5.594-29.82.019-43.98 11.84-17.05 31.59-26.94 52.32-25.64-1.504-18.66 8.95-36.16 25.9-44.12 12.2-5.22 25.6-7.03 38.7-4.97 9.44 1.44 15.48-8.91 22.95-13.22 29.3-16.84 66.41-6.77 83.5 22.38 8.84 15.77.695 34.65 8.79 50.6 17.84 28.61 55.75 33.7 78.48 57.33 17.9 13.34 19.03 39.49 3.01 55.04-28.65 28-72.13 9.05-105.41 25.55-41.83 23.53-77.34 57.54-98.92 100.41.23-20.5 8.1-40.69 24.03-53.6-12.52 6.1-22.89 16.1-28.22 28.97-5.09 10.37-12.33 29.9 2.03 36.23 8.9 1.93 11.67-10.23 16.63-15.12 25.26-53.3 79.07-86.29 137.82-91.59 24.05 2.63 47.78-6.22 65.32-22.87 7.36-10.15 21.73-7.03 31.52-13.44 33.05-21.3 44.18-64.63 23.68-98.19-7.51-17.66-23.3-30.35-42.06-34.39-6.56-1.37-6.03-10.59-8.82-15.5-19.15-26.85-52.84-39.61-84.42-30.1l-6.82 2.77c1.17 3.53 2.8 6.92 5.1 9.83 27.45-8.44 56.8 2.52 74.57 25.07 2.78 7.45 3.29 15.64.67 23.15 13.14-4.6 27.69-.9 37.42 9.05 28.04 27.39 27.23 86.09-12.94 101.66-1.62.27-6.44 3.77-6.73 1.11 3.26-18.6-3.27-37.58-17.39-50.11-21.33-20.85-52.24-27.29-74.99-46.11-16.1-14.15-7.41-36.38-11.14-54.72-11.32-32.15-44.18-51.39-77.6-44.69z" fill="rgba(255,255,255,0.12)" />
      </svg>
      <span class="watermark-text">MaterIA Gris</span>
    </div>

    <!-- Navigation -->
    <SlideNav
      :current="currentSlide"
      :total="totalSlides"
      :progress="progress"
      :label="slideLabel"
      :is-first="isFirst"
      :is-last="isLast"
      :is-animating="isAnimating"
      @prev="goPrev"
      @next="goNext"
    />
  </div>
</template>

<style scoped>
.slides-container {
  position: fixed;
  inset: 0;
  background: #0f0a1e;
  overflow: hidden;
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  z-index: 9999;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
  z-index: 0;
  animation: orb-drift 20s ease-in-out infinite;
}
.glow-orb--1 {
  width: 500px; height: 500px;
  background: rgba(124,58,237,0.08);
  top: -200px; left: -100px;
}
.glow-orb--2 {
  width: 400px; height: 400px;
  background: rgba(6,182,212,0.05);
  bottom: -100px; right: -80px;
  animation-delay: -10s;
}

@keyframes orb-drift {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(40px, -30px); }
  50% { transform: translate(-20px, 40px); }
  75% { transform: translate(30px, 20px); }
}

.slides-stage {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
  perspective: 1200px;
}

.slide-panel {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow-y: auto;
}
.slide-panel--active {
  display: flex;
}

.watermark {
  position: fixed;
  bottom: 56px;
  left: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  pointer-events: none;
  opacity: 0.5;
}
.watermark-text {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.02em;
}

@media (max-width: 768px) {
  .watermark { display: none; }
}
</style>
