<script setup lang="ts">
const steps = [
  { icon: 'mic', title: 'Grabación segura', desc: 'Graba la consulta con el paciente. Soporta micrófono, subida de archivo de audio o pegado directo de texto.' },
  { icon: 'cpu', title: 'Transcripción con IA', desc: 'Reconocimiento de voz con diarización de hablantes. Diferencia automáticamente entre médico y paciente.' },
  { icon: 'brain', title: 'Extracción estructurada', desc: 'Un LLM extrae datos clínicos: síntomas, diagnósticos, medicación, recomendaciones. Cada campo con su nivel de confianza.' },
  { icon: 'eye', title: 'Revisión campo por campo', desc: 'El profesional revisa cada sugerencia: acepta, rechaza o edita. Indicadores visuales de confianza (alto/medio/bajo).' },
  { icon: 'check', title: 'Firma y emisión', desc: 'Firma electrónicamente el informe. Comparte con el paciente o el centro de salud en formato digital.' },
]
</script>

<template>
  <section class="slide">
    <div class="slide-content">
      <span class="slide-label" data-stagger>Informes con IA</span>

      <h2 class="slide-title" data-stagger>
        Del audio al informe firmado<br>
        <span class="title-highlight">en segundos</span>
      </h2>

      <p class="slide-subtitle" data-stagger>
        Un pipeline completo de IA que transforma la consulta médica en un informe estructurado, 
        revisado y listo para firmar. Sin tipeo manual, sin errores de transcripción.
      </p>

      <div class="pipeline" data-stagger>
        <div
          v-for="(step, i) in steps"
          :key="step.title"
          class="pipeline-step"
        >
          <!-- Connector (except last) -->
          <div v-if="i < steps.length - 1" class="step-connector" />

          <div class="step-card">
            <div class="step-icon">
              <svg v-if="step.icon === 'mic'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <svg v-else-if="step.icon === 'cpu'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                <rect x="9" y="9" width="6" height="6" />
                <line x1="9" y1="1" x2="9" y2="4" />
                <line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" />
                <line x1="15" y1="20" x2="15" y2="23" />
                <line x1="20" y1="9" x2="23" y2="9" />
                <line x1="20" y1="14" x2="23" y2="14" />
                <line x1="1" y1="9" x2="4" y2="9" />
                <line x1="1" y1="14" x2="4" y2="14" />
              </svg>
              <svg v-else-if="step.icon === 'brain'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 2a4 4 0 0 0-4 4c0 1.1.35 2.14 1 3 0 1.5-1 3-3 4s-2 3.5-2 5c0 1.5 1 3 3 3h10c2 0 3-1.5 3-3 0-1.5-1-3.5-3-5s-3-2.5-3-4c.65-.86 1-1.9 1-3a4 4 0 0 0-4-4z" />
              </svg>
              <svg v-else-if="step.icon === 'eye'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else-if="step.icon === 'check'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div class="step-text">
              <h4 class="step-title">{{ step.title }}</h4>
              <p class="step-desc">{{ step.desc }}</p>
            </div>
          </div>
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
}

.slide-content {
  max-width: 860px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 28px;
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
  font-size: clamp(30px, 3.6vw, 44px);
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
  font-size: 15px;
  line-height: 1.65;
  color: #9690a8;
  max-width: 64ch;
}

.pipeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.pipeline-step {
  display: flex;
  align-items: stretch;
  position: relative;
}

.step-connector {
  position: absolute;
  left: 32px;
  top: 60px;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, rgba(124,58,237,0.3), rgba(6,182,212,0.15));
  z-index: 0;
}

.step-card {
  display: flex;
  gap: 20px;
  padding: 16px 0;
  position: relative;
  z-index: 1;
}

.step-icon {
  width: 64px;
  height: 64px;
  min-width: 64px;
  border-radius: 16px;
  background: rgba(124,58,237,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a78bfa;
}

.step-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.step-desc {
  font-size: 14px;
  line-height: 1.55;
  color: #9690a8;
}

@media (max-width: 768px) {
  .slide { padding: 40px 24px; }
  .step-card { flex-direction: column; gap: 12px; }
  .step-connector { left: 32px; }
}
</style>
