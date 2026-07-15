<script setup lang="ts">
import { useRouter } from 'vue-router'
import LandingHeader from '@/modules/landing/presentation/components/LandingHeader.vue'
import LandingFooter from '@/modules/landing/presentation/components/LandingFooter.vue'

const router = useRouter()

const goLogin = () => router.push('/login')
const goDemo = () => {}
</script>

<template>
  <div class="w-full overflow-x-hidden font-sans" style="background: #0f0a1e; min-height: 100vh;">
    <LandingHeader @login="goLogin" @demo="goDemo" />

    <main class="pt-16">
      <div class="px-7 mx-auto py-16" style="max-width: 1140px;">
        <div class="text-center mb-10">
          <h1 class="font-sans font-bold text-white" style="font-size: 36px; line-height: 1.2; letter-spacing: -0.02em;">
            Presentación de MaterIA Gris
          </h1>
          <p class="mt-4 font-sans" style="font-size: 18px; color: #9690a8; line-height: 1.6;">
            Descubre cómo nuestra plataforma transforma la gestión clínica con inteligencia artificial.
          </p>
        </div>

        <div
          class="mx-auto rounded-2xl overflow-hidden"
          style="max-width: 960px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);"
        >
          <video
            controls
            class="w-full"
            style="display: block;"
            src="/videos/presentacion.mp4"
          >
            Tu navegador no soporta la reproducción de video.
          </video>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
