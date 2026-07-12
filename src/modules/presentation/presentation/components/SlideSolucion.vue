<script setup lang="ts">
import sangreBg from '@/assets/sangre-bg.png'

const pillars = [
  {
    icon: 'file',
    title: 'Informes Inteligentes',
    desc: 'La IA redacta informes clínicos estructurados a partir de notas de voz, dictados o texto libre. Cada campo incluye un indicador de confianza (alto/medio/bajo) para que el profesional acepte, rechace o edite antes de emitir.',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.1)'
  },
  {
    icon: 'activity',
    title: 'Diagnóstico Asistido',
    desc: 'El motor de IA analiza síntomas, historial y estudios de laboratorio para sugerir diagnósticos diferenciales con nivel de confianza y bibliografía asociada. Reduce omisiones y acelera la toma de decisiones.',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)'
  },
  {
    icon: 'mic',
    title: 'Consultas Grabadas con IA',
    desc: 'Graba la consulta de forma segura. La IA transcribe en tiempo real con diarización de hablantes (médico/paciente), extrae datos clínicos estructurados y sugiere acciones de seguimiento automáticamente.',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.1)'
  }
]
</script>

<template>
  <section class="slide">
    <!-- Blood cells background -->
    <div class="bg-overlay" :style="{ backgroundImage: `url(${sangreBg})` }" />

    <div class="slide-content">
      <span class="slide-label" data-stagger>La solución</span>

      <h2 class="slide-title" data-stagger>
        Tres pilares para una práctica<br>
        <span class="title-highlight">clínica sin fricción</span>
      </h2>

      <p class="slide-subtitle" data-stagger>
        Cada módulo está potenciado por modelos de IA entrenados con literatura médica actualizada y datos clínicos anonimizados.
      </p>

      <div class="pillars-grid">
        <div
          v-for="(p, i) in pillars"
          :key="p.title"
          class="pillar-card"
          :style="{ '--accent': p.color, '--accent-bg': p.bg }"
          data-stagger
        >
          <div class="pillar-icon" :style="{ background: p.bg, color: p.color }">
            <svg v-if="p.icon === 'file'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <svg v-else-if="p.icon === 'activity'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <svg v-else-if="p.icon === 'mic'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>

          <h3 class="pillar-title">{{ p.title }}</h3>
          <p class="pillar-desc">{{ p.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.slide {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.08;
  pointer-events: none;
  z-index: 0;
}

.slide-content {
  max-width: 1060px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: relative;
  z-index: 1;
}

.slide-label {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #7c3aed;
}

.slide-title {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 700;
  color: #fff;
  line-height: 1.12;
  letter-spacing: -0.02em;
}
.title-highlight {
  background: linear-gradient(135deg, #a78bfa, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.slide-subtitle {
  font-size: 16px;
  line-height: 1.6;
  color: #9690a8;
  max-width: 64ch;
}

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.pillar-card {
  padding: 32px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.pillar-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(124,58,237,0.1);
}

.pillar-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.pillar-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.01em;
}

.pillar-desc {
  font-size: 14px;
  line-height: 1.65;
  color: #9690a8;
}

@media (max-width: 900px) {
  .pillars-grid { grid-template-columns: 1fr; }
  .slide { padding: 40px 24px; }
}
</style>
