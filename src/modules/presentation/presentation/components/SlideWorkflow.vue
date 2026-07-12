<script setup lang="ts">
const steps = [
  { num: '01', title: 'Buscar paciente', desc: 'Localiza al instante por nombre, documento o historial clínico.' },
  { num: '02', title: 'Elegir plantilla', desc: 'Selecciona entre plantillas personalizadas para cada especialidad médica.' },
  { num: '03', title: 'Grabar consulta', desc: 'Graba la conversación. La IA transcribe en tiempo real con diarización.' },
  { num: '04', title: 'IA rellena informe', desc: 'El motor de IA estructura hallazgos, diagnósticos y recomendaciones automáticamente.' },
  { num: '05', title: 'Revisar y editar', desc: 'Verifica cada campo. Acepta, rechaza o edita cada sugerencia de la IA.' },
  { num: '06', title: 'Firmar y compartir', desc: 'Firma electrónicamente y comparte con el paciente o el centro.' },
]
</script>

<template>
  <section class="slide">
    <div class="slide-content">
      <span class="slide-label" data-stagger>Cómo funciona</span>

      <h2 class="slide-title" data-stagger>
        De la consulta al informe<br>
        <span class="title-highlight">en seis pasos</span>
      </h2>

      <p class="slide-subtitle" data-stagger>
        Sin complicaciones. Graba, la IA redacta, tú revisas y firmas.
      </p>

      <div class="workflow-grid" data-stagger>
        <div
          v-for="(step, i) in steps"
          :key="step.num"
          class="wf-card"
        >
          <div class="wf-num">{{ step.num }}</div>
          <div class="wf-body">
            <h3 class="wf-title">{{ step.title }}</h3>
            <p class="wf-desc">{{ step.desc }}</p>
          </div>
          <!-- Arrow (except last) -->
          <div v-if="i < steps.length - 1" class="wf-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
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
}

.workflow-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.wf-card {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.wf-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(124,58,237,0.1);
}

.wf-num {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 28px;
  font-weight: 700;
  color: rgba(124,58,237,0.25);
  line-height: 1;
}

.wf-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.wf-desc {
  font-size: 13px;
  line-height: 1.55;
  color: #9690a8;
}

.wf-arrow {
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

@media (max-width: 900px) {
  .workflow-grid { grid-template-columns: repeat(2, 1fr); }
  .wf-arrow { display: none; }
  .slide { padding: 40px 24px; }
}
@media (max-width: 600px) {
  .workflow-grid { grid-template-columns: 1fr; }
}
</style>
