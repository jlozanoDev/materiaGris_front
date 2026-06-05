<script setup lang="ts">
</script>

<template>
  <section style="background: #0f0a1e; padding-block: clamp(48px, 8vw, 96px); margin-top: clamp(32px, 5vw, 80px);">
    <div class="px-7 mx-auto" style="max-width: 1140px;">
      <p class="font-mono font-medium uppercase tracking-wide text-center" style="font-size: 12px; letter-spacing: 0.08em; color: #06b6d4; margin-bottom: 56px;">
        Resultados comprobados · 2026
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <!-- Stat 1 -->
        <div>
          <div class="font-sans font-extrabold leading-none tracking-tight text-white" style="font-size: clamp(48px, 6vw, 72px); letter-spacing: -0.04em;">
            <span style="color: #06b6d4;">+</span>2.400
          </div>
          <p style="color: #9690a8; font-size: 15px; margin-top: 8px; max-width: 26ch; line-height: 1.5; margin-inline: auto;">
            Informes clínicos generados con IA en el último trimestre
          </p>
        </div>

        <!-- Stat 2 -->
        <div>
          <div class="font-sans font-extrabold leading-none tracking-tight text-white" style="font-size: clamp(48px, 6vw, 72px); letter-spacing: -0.04em;">
            80<span style="font-size: 0.45em; opacity: 0.7; margin-left: 2px; font-weight: 600; color: #06b6d4;">%</span>
          </div>
          <p style="color: #9690a8; font-size: 15px; margin-top: 8px; max-width: 26ch; line-height: 1.5; margin-inline: auto;">
            Reducción de errores de tipeo y omisiones en diagnósticos
          </p>
        </div>

        <!-- Stat 3 -->
        <div>
          <div class="font-sans font-extrabold leading-none tracking-tight text-white" style="font-size: clamp(48px, 6vw, 72px); letter-spacing: -0.04em;">
            &lt;60<span style="font-size: 0.45em; opacity: 0.7; margin-left: 2px; font-weight: 600; color: #06b6d4;">s</span>
          </div>
          <p style="color: #9690a8; font-size: 15px; margin-top: 8px; max-width: 26ch; line-height: 1.5; margin-inline: auto;">
            Tiempo promedio de generación de informe completo
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
