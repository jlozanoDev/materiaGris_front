<script setup lang="ts">
import sangreBg from '@/assets/sangre-bg.png'
</script>

<template>
  <section class="section relative overflow-hidden" style="padding-bottom: 0;">
    <!-- Blood cells background -->
    <div
      class="absolute inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: `url(${sangreBg})`, opacity: 0.15 }"
    ></div>

    <div class="relative z-10 flex flex-col px-7 mx-auto" style="max-width: 1140px; gap: 56px;">
      <!-- Header -->
      <div class="text-center" style="max-width: 52ch; margin-inline: auto;">
        <p class="font-mono font-medium uppercase tracking-wide" style="font-size: 12px; letter-spacing: 0.08em; color: #7c3aed; margin-bottom: 12px;">
          Módulos de análisis
        </p>
        <h2 class="font-sans font-bold tracking-tight" style="font-size: clamp(30px, 3.6vw, 44px); line-height: 1.12; letter-spacing: -0.02em; color: #0b0817;">
          Tres pilares para una práctica clínica sin fricción
        </h2>
        <p class="leading-relaxed mx-auto" style="font-size: 18px; line-height: 1.6; color: #6b6b7b; max-width: 60ch; margin-top: 12px;">
          Cada módulo está potenciado por modelos de IA entrenados con literatura médica actualizada y datos clínicos anonimizados.
        </p>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8" style="margin-top: 20px;">
        <!-- Card 1: Informes -->
        <div class="glass-card flex flex-col" style="gap: 12px;">
          <div class="feature-icon" style="width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; margin-bottom: 20px; color: #7c3aed; background: rgba(124,58,237,0.10);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width: 22px; height: 22px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3 class="font-sans font-semibold tracking-tight" style="font-size: 22px; line-height: 1.3; letter-spacing: -0.01em;">Generación de Informes Inteligentes</h3>
          <p style="color: #6b6b7b; font-size: 15px; line-height: 1.6;">La IA redacta informes clínicos estructurados a partir de notas de voz, dictados o texto libre. Compatible con formatos HL7 FHIR y CDA.</p>
          <div class="ph-img" style="margin-top: 12px; aspect-ratio: 16/9; border-radius: 16px; background: rgba(124,58,237,0.10); display: flex; flex-direction: column; gap: 8px; align-items: center; justify-content: center;">
            <span style="font-size: 11px; color: #7c3aed; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;">Previsualización de informe</span>
            <div class="grid grid-cols-2 gap-1.5" style="width: 80%; opacity: 0.6;">
              <div style="height: 6px; background: #7c3aed; border-radius: 3px; opacity: 0.4;"></div>
              <div style="height: 6px; background: #7c3aed; border-radius: 3px; opacity: 0.2;"></div>
              <div style="height: 6px; background: #7c3aed; border-radius: 3px; opacity: 0.5;"></div>
              <div style="height: 6px; background: #7c3aed; border-radius: 3px; opacity: 0.3;"></div>
              <div style="height: 6px; background: #7c3aed; border-radius: 3px; opacity: 0.35;"></div>
              <div style="height: 6px; background: #7c3aed; border-radius: 3px; opacity: 0.15;"></div>
            </div>
          </div>
        </div>

        <!-- Card 2: Diagnóstico -->
        <div class="glass-card flex flex-col" style="gap: 12px;">
          <div class="feature-icon" style="width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; margin-bottom: 20px; color: #06b6d4; background: rgba(6,182,212,0.08);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width: 22px; height: 22px;">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <h3 class="font-sans font-semibold tracking-tight" style="font-size: 22px; line-height: 1.3; letter-spacing: -0.01em;">Diagnóstico Asistido</h3>
          <p style="color: #6b6b7b; font-size: 15px; line-height: 1.6;">El motor de IA analiza síntomas, historial y estudios de laboratorio para sugerir diagnósticos diferenciales con nivel de confianza y bibliografía asociada.</p>
          <div class="ph-img" style="margin-top: 12px; aspect-ratio: 16/9; border-radius: 16px; background: rgba(6,182,212,0.08); display: flex; flex-direction: column; gap: 6px; align-items: center; justify-content: center;">
            <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #06b6d4;">Análisis en curso</span>
            <div class="flex gap-1 justify-center" style="width: 60%;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #06b6d4; opacity: 0.9;"></span>
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #06b6d4; opacity: 0.5;"></span>
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #06b6d4; opacity: 0.3;"></span>
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #06b6d4; opacity: 0.6;"></span>
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #06b6d4; opacity: 0.2;"></span>
            </div>
          </div>
        </div>

        <!-- Card 3: Gestión -->
        <div class="glass-card flex flex-col" style="gap: 12px;">
          <div class="feature-icon" style="width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; margin-bottom: 20px; color: #7c3aed; background: rgba(124,58,237,0.10);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width: 22px; height: 22px;">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3 class="font-sans font-semibold tracking-tight" style="font-size: 22px; line-height: 1.3; letter-spacing: -0.01em;">Gestión Integral del Paciente</h3>
          <p style="color: #6b6b7b; font-size: 15px; line-height: 1.6;">Historial clínico unificado, programación de citas, recordatorios automáticos y un timeline inteligente que destaca eventos relevantes.</p>
          <div class="ph-img" style="margin-top: 12px; aspect-ratio: 16/9; border-radius: 16px; background: rgba(124,58,237,0.10); display: flex; flex-direction: column; gap: 6px; align-items: center; justify-content: center;">
            <span style="font-size: 11px; color: #7c3aed; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;">Línea de tiempo del paciente</span>
            <div class="flex flex-col gap-1" style="width: 80%;">
              <div style="height: 4px; background: #7c3aed; border-radius: 2px; opacity: 0.5; width: 90%;"></div>
              <div style="height: 4px; background: #7c3aed; border-radius: 2px; opacity: 0.3; width: 70%;"></div>
              <div style="height: 4px; background: #7c3aed; border-radius: 2px; opacity: 0.4; width: 85%;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: clamp(48px, 8vw, 96px);
}
</style>
