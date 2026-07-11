<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')

function handleSubmit() {
  console.log('early access:', email.value)
}
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
        Únete a MaterIA Gris. Sin contrato, sin compromiso. Solicita acceso anticipado y descubre cómo nuestra plataforma puede ayudarte a optimizar tu práctica clínica con herramientas de inteligencia artificial diseñadas específicamente para profesionales de la salud.
      </p>
      <form @submit.prevent="handleSubmit" class="flex flex-wrap gap-3 justify-center">
        <input
          v-model="email"
          type="email"
          required
          placeholder="tu@email.com"
          class="font-sans"
          style="padding: 12px 20px; border-radius: 10px; font-size: 15px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color: #fff; min-width: 220px; outline: none;"
        />
        <button
          type="submit"
          class="font-semibold text-white transition flex items-center gap-2"
          style="padding: 12px 24px; border-radius: 10px; font-size: 15px; background: #7c3aed; box-shadow: 0 1px 12px rgba(124,58,237,0.30); cursor: pointer;"
        >
          Solicitar acceso
        </button>
      </form>
    </div>
  </section>
</template>
