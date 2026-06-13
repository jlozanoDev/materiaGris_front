<script setup lang="ts">
const emit = defineEmits<{
  demo: []
  sales: []
}>()
</script>

<template>
  <section style="background: #0f0a1e; padding-block: clamp(48px, 8vw, 96px); text-align: center;">
    <div class="px-7 mx-auto" style="max-width: 600px;">
      <p class="font-mono font-medium uppercase tracking-wide" style="font-size: 12px; letter-spacing: 0.08em; color: #06b6d4; margin-bottom: 20px;">
        Comienza hoy
      </p>
      <h2 class="font-sans font-bold tracking-tight text-white" style="font-size: clamp(30px, 3.6vw, 44px); line-height: 1.12; letter-spacing: -0.02em;">
        Transforma tu práctica clínica con inteligencia artificial
      </h2>
      <p class="leading-[1.625]" style="font-size: 18px; line-height: 1.6; color: #9690a8; margin: 12px auto 32px; max-width: 60ch;">
        Únete a más de 300 profesionales que ya confían en MaterIA Gris. Sin contrato, sin compromiso.
      </p>
      <div class="flex flex-wrap gap-3 justify-center">
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
          @click="emit('sales')"
        >
          Hablar con ventas
        </button>
      </div>
    </div>
  </section>
</template>
