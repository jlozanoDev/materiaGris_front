<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Step {
  number: number
  title: string
  desc: string
  icon: string
  morphIcon: string
}

const steps: Step[] = [
  { number: 1, title: 'Buscar Paciente', desc: 'Localiza pacientes al instante con búsqueda por nombre, documento o historial clínico.', icon: 'search', morphIcon: 'user' },
  { number: 2, title: 'Elegir Plantilla', desc: 'Selecciona entre plantillas personalizadas para cada especialidad médica.', icon: 'file-plus', morphIcon: 'file-text' },
  { number: 3, title: 'Grabar Consulta', desc: 'Graba la conversación de forma segura. La IA transcribe en tiempo real.', icon: 'microphone', morphIcon: 'activity' },
  { number: 4, title: 'IA Rellena Informe', desc: 'El motor de IA estructura hallazgos, diagnósticos y recomendaciones automáticamente.', icon: 'sparkles', morphIcon: 'file-text' },
  { number: 5, title: 'Revisar', desc: 'Verifica cada campo del informe generado antes de la emisión definitiva.', icon: 'eye', morphIcon: 'check-circle' },
  { number: 6, title: 'Firmar y Compartir', desc: 'Firma electrónicamente y comparte el informe con el paciente o el centro de salud.', icon: 'pen', morphIcon: 'check' },
]

const visibleSteps = ref<Set<number>>(new Set())
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = Number((entry.target as HTMLElement).dataset.step)
        if (entry.isIntersecting) {
          visibleSteps.value = new Set([...visibleSteps.value, idx])
        }
      })
    },
    { threshold: 0.2, rootMargin: '0px 0px -80px 0px' },
  )
  if (!observer) return
  document.querySelectorAll('.wf-step').forEach((el) => observer!.observe(el))
})

onBeforeUnmount(() => observer?.disconnect())

function isVisible(n: number): boolean {
  return visibleSteps.value.has(n)
}
</script>

<template>
  <section id="workflow" aria-labelledby="workflow-heading" style="padding-block: clamp(48px, 8vw, 96px);">
    <div class="px-7 mx-auto" style="max-width: 960px;">
      <!-- Header -->
      <div class="text-center" style="max-width: 48ch; margin-inline: auto; margin-bottom: 80px;">
        <p class="font-mono font-medium uppercase tracking-wide" style="font-size: 12px; letter-spacing: 0.08em; color: #7c3aed; margin-bottom: 12px;">
          Cómo funciona
        </p>
        <h2 id="workflow-heading" class="font-sans font-bold tracking-tight" style="font-size: clamp(30px, 3.6vw, 44px); line-height: 1.12; letter-spacing: -0.02em; color: #0b0817;">
          De la consulta al informe en seis pasos
        </h2>
        <p style="font-size: 18px; line-height: 1.6; color: #6b6b7b; max-width: 60ch; margin-top: 12px; margin-inline: auto;">
          Sin complicaciones. Graba, la IA redacta, tú revisas y firmas.
        </p>
      </div>

      <!-- Timeline container -->
      <div class="wf-timeline" role="list">
        <div class="wf-line" aria-hidden="true"><div class="wf-line-fill" /></div>

        <div
          v-for="(step, i) in steps"
          :key="step.number"
          :data-step="step.number"
          class="wf-step"
          :class="[i % 2 === 0 ? 'wf-step--left' : 'wf-step--right', { 'wf-step--visible': isVisible(step.number) }]"
          role="listitem"
          :aria-label="'Paso ' + step.number + ' de 6'"
        >
          <!-- Dot column -->
          <div class="wf-dot-col" aria-hidden="true">
            <div class="wf-connector" />
            <div class="wf-dot-outer">
              <div class="wf-dot" :class="{ 'wf-dot--active': isVisible(step.number) }" />
              <!-- Horizontal connector: from dot toward card -->
              <div class="wf-h-line" :class="[i % 2 === 0 ? 'wf-h-line--left' : 'wf-h-line--right', { 'wf-h-line--visible': isVisible(step.number) }]" aria-hidden="true" />
            </div>
          </div>

          <!-- Card -->
          <div class="wf-card">

            <!-- Giant watermark number -->
            <span class="wf-watermark" aria-hidden="true">{{ String(step.number).padStart(2, '0') }}</span>

            <!-- Morphing icon pair -->
            <div class="wf-icon-wrap">
              <div class="wf-morph-stage">
                <!-- Icon A: primary -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="wf-icon wf-icon-a">
                  <template v-if="step.icon === 'search'">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </template>
                  <template v-else-if="step.icon === 'file-plus'">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                  </template>
                  <template v-else-if="step.icon === 'microphone'">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                  </template>
                  <template v-else-if="step.icon === 'sparkles'">
                    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /><path d="M20 16l-1 2.5L16.5 20l2.5 1 1 2.5 1-2.5L23.5 20 21 18.5 20 16z" /><path d="M4 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
                  </template>
                  <template v-else-if="step.icon === 'eye'">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </template>
                  <template v-else-if="step.icon === 'pen'">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </template>
                </svg>
                <!-- Icon B: morph target -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="wf-icon wf-icon-b">
                  <template v-if="step.morphIcon === 'user'">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6.7 8-6.7s8 2.7 8 6.7" />
                  </template>
                  <template v-else-if="step.morphIcon === 'file-text'">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                  </template>
                  <template v-else-if="step.morphIcon === 'activity'">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </template>
                  <template v-else-if="step.morphIcon === 'check-circle'">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </template>
                  <template v-else-if="step.morphIcon === 'check'">
                    <polyline points="20 6 9 17 4 12" />
                  </template>
                </svg>
              </div>
            </div>

            <div class="wf-card-body">
              <span class="wf-badge" aria-hidden="true">{{ String(step.number).padStart(2, '0') }}</span>
              <h3 class="wf-title">{{ step.title }}</h3>
              <p class="wf-desc">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ============================================
   Timeline container & central line
   ============================================ */
.wf-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
}
.wf-line {
  position: absolute;
  top: 0; bottom: 0;
  left: 50%; transform: translateX(-50%);
  width: 2px;
  z-index: 0;
  pointer-events: none;
}
.wf-line-fill {
  width: 100%; height: 100%;
  background: linear-gradient(to bottom, #e2e0e8 0%, #c4b5fd 45%, #06b6d4 100%);
  border-radius: 1px;
}

/* ============================================
   Step row
   ============================================ */
.wf-step {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: start;
  z-index: 1;
  padding-bottom: 56px;
}
.wf-step:last-child { padding-bottom: 0; }
.wf-step--left .wf-card  { grid-column: 1; grid-row: 1; }
.wf-step--right .wf-card { grid-column: 3; grid-row: 1; }

/* ============================================
   Dot column
   ============================================ */
.wf-dot-col {
  grid-column: 2; grid-row: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32px;
}
.wf-connector {
  width: 2px; height: 56px;
  background: #e2e0e8;
  transition: background 0.4s ease;
  margin-bottom: 8px;
}
.wf-step:first-child .wf-connector { visibility: hidden; }
.wf-step--visible .wf-connector { background: #c4b5fd; }

/* ============================================
   Dot + pulse ring
   ============================================ */
.wf-dot-outer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  flex-shrink: 0;
}
.wf-dot {
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #e2e0e8;
  z-index: 3;
  transition: border-color 0.4s ease, background 0.4s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
.wf-dot--active {
  border-color: #7c3aed;
  background: #7c3aed;
  transform: scale(1.15);
}

/* Pulse ring 1 */
.wf-dot--active::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(124, 58, 237, 0.4);
  animation: wf-pulse-1 2.4s cubic-bezier(0.16,1,0.3,1) infinite;
}
/* Pulse ring 2 — offset delay */
.wf-dot--active::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(124, 58, 237, 0.4);
  animation: wf-pulse-1 2.4s cubic-bezier(0.16,1,0.3,1) infinite;
  animation-delay: 0.8s;
}
@keyframes wf-pulse-1 {
  0%   { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
}

/* ============================================
   Horizontal connector (dot → card)
   ============================================ */
.wf-h-line {
  position: absolute;
  top: 50%;
  height: 1.5px;
  background: #c4b5fd;
  transition: width 0.7s cubic-bezier(0.16,1,0.3,1);
}
/* Left steps: extend left from dot toward card in column 1 */
.wf-h-line--left {
  right: 50%;
  width: 0;
  transform-origin: right center;
}
.wf-h-line--left.wf-h-line--visible { width: 64px; }

/* Right steps: extend right from dot toward card in column 3 */
.wf-h-line--right {
  left: 50%;
  width: 0;
  transform-origin: left center;
}
.wf-h-line--right.wf-h-line--visible { width: 64px; }

/* ============================================
   Card
   ============================================ */
.wf-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 32px;
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(226,224,232,0.5);
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.16,1,0.3,1),
              box-shadow 0.35s cubic-bezier(0.16,1,0.3,1),
              border-color 0.3s ease;
}
.wf-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(124,58,237,0.08), 0 0 0 1px rgba(124,58,237,0.1);
  border-color: rgba(124,58,237,0.18);
}
.wf-card-body {
  display: flex; flex-direction: column; gap: 10px; flex: 1;
  position: relative;
  z-index: 1;
}

/* ============================================
   Giant watermark number
   ============================================ */
.wf-watermark {
  position: absolute;
  right: -12px;
  bottom: -18px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 88px;
  font-weight: 800;
  line-height: 1;
  color: #7c3aed;
  opacity: 0.035;
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1);
  transform: translateY(8px);
}
.wf-card:hover .wf-watermark {
  opacity: 0.06;
  transform: translateY(0);
}

/* ============================================
   Icon
   ============================================ */
.wf-icon-wrap {
  width: 72px; height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.08) 100%);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  position: relative; z-index: 1;
  animation: wf-float 3.2s ease-in-out infinite;
  transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
}
.wf-step:nth-child(1) .wf-icon-wrap { animation-delay: 0.0s; }
.wf-step:nth-child(2) .wf-icon-wrap { animation-delay: 0.5s; }
.wf-step:nth-child(3) .wf-icon-wrap { animation-delay: 1.1s; }
.wf-step:nth-child(4) .wf-icon-wrap { animation-delay: 1.6s; }
.wf-step:nth-child(5) .wf-icon-wrap { animation-delay: 2.2s; }
.wf-step:nth-child(6) .wf-icon-wrap { animation-delay: 2.7s; }

@keyframes wf-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}

/* Pause float on hover, spring rotation */
.wf-card:hover .wf-icon-wrap {
  animation-play-state: paused;
  transform: rotate(8deg) scale(1.08);
  box-shadow: 0 0 0 10px rgba(124,58,237,0.08),
              0 0 30px rgba(124,58,237,0.12);
}

/* Pop-in when card becomes visible — big bounce */
.wf-step--visible .wf-icon-wrap {
  animation: wf-float 3.2s ease-in-out infinite, wf-bounce 0.9s cubic-bezier(0.22,1,0.36,1) both;
}
/* Staggered bounce delays */
.wf-step:nth-child(1).wf-step--visible .wf-icon-wrap { animation-delay: 0s, 0.05s; }
.wf-step:nth-child(2).wf-step--visible .wf-icon-wrap { animation-delay: 0s, 0.15s; }
.wf-step:nth-child(3).wf-step--visible .wf-icon-wrap { animation-delay: 0s, 0.25s; }
.wf-step:nth-child(4).wf-step--visible .wf-icon-wrap { animation-delay: 0s, 0.35s; }
.wf-step:nth-child(5).wf-step--visible .wf-icon-wrap { animation-delay: 0s, 0.45s; }
.wf-step:nth-child(6).wf-step--visible .wf-icon-wrap { animation-delay: 0s, 0.55s; }

@keyframes wf-bounce {
  0%   { transform: scale(0) translateY(-40px); opacity: 0; }
  30%  { transform: scale(1.25) translateY(6px); opacity: 1; }
  50%  { transform: scale(0.88) translateY(-6px); }
  65%  { transform: scale(1.04) translateY(2px); }
  80%  { transform: scale(0.97) translateY(-1px); }
  100% { transform: scale(1) translateY(0); }
}

/* Sonar ring pulse */
.wf-icon-wrap::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 22px;
  border: 2px solid rgba(124,58,237,0.25);
  animation: wf-sonar 3s ease-out infinite;
  pointer-events: none;
  opacity: 0;
}
.wf-step:nth-child(1) .wf-icon-wrap::before { animation-delay: 0.0s; }
.wf-step:nth-child(2) .wf-icon-wrap::before { animation-delay: 0.6s; }
.wf-step:nth-child(3) .wf-icon-wrap::before { animation-delay: 1.2s; }
.wf-step:nth-child(4) .wf-icon-wrap::before { animation-delay: 1.8s; }
.wf-step:nth-child(5) .wf-icon-wrap::before { animation-delay: 2.4s; }
.wf-step:nth-child(6) .wf-icon-wrap::before { animation-delay: 3.0s; }

@keyframes wf-sonar {
  0%   { transform: scale(0.9); opacity: 0.7; }
  100% { transform: scale(1.7); opacity: 0; }
}

.wf-card:hover .wf-icon-wrap::before {
  animation-play-state: paused;
  opacity: 0;
}

/* SVG icon scale pulse */
.wf-icon {
  width: 34px; height: 34px;
  color: #7c3aed;
  transition: color 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  animation: wf-icon-breath 2.8s ease-in-out infinite;
}
@keyframes wf-icon-breath {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.1); }
}

.wf-card:hover .wf-icon {
  color: #5b21b6;
  transform: scale(1.12);
}

/* ============================================
   Icon morph — scale+rotate swap (step 1 only)
   ============================================ */
.wf-morph-stage {
  position: relative;
  width: 100%;
  height: 100%;
}
.wf-morph-stage .wf-icon {
  position: absolute;
  inset: 0;
  margin: auto;
  color: #7c3aed;
}

/* Both icons use the same keyframes, 180° out of phase */
.wf-morph-stage .wf-icon-a {
  animation: wf-swap-cycle 5s ease-in-out infinite;
}
.wf-morph-stage .wf-icon-b {
  animation: wf-swap-cycle 5s ease-in-out infinite;
  animation-delay: -2.5s; /* half cycle offset */
}

/* Stagger each step so they don't all morph in sync */
.wf-step:nth-child(1) .wf-morph-stage .wf-icon-a { animation-delay: 0s; }
.wf-step:nth-child(2) .wf-morph-stage .wf-icon-a { animation-delay: 0.8s; }
.wf-step:nth-child(3) .wf-morph-stage .wf-icon-a { animation-delay: 1.6s; }
.wf-step:nth-child(4) .wf-morph-stage .wf-icon-a { animation-delay: 2.4s; }
.wf-step:nth-child(5) .wf-morph-stage .wf-icon-a { animation-delay: 3.2s; }
.wf-step:nth-child(6) .wf-morph-stage .wf-icon-a { animation-delay: 4.0s; }

.wf-step:nth-child(1) .wf-morph-stage .wf-icon-b { animation-delay: -2.5s; }
.wf-step:nth-child(2) .wf-morph-stage .wf-icon-b { animation-delay: -1.7s; }
.wf-step:nth-child(3) .wf-morph-stage .wf-icon-b { animation-delay: -0.9s; }
.wf-step:nth-child(4) .wf-morph-stage .wf-icon-b { animation-delay: -0.1s; }
.wf-step:nth-child(5) .wf-morph-stage .wf-icon-b { animation-delay: 0.7s; }
.wf-step:nth-child(6) .wf-morph-stage .wf-icon-b { animation-delay: 1.5s; }

/* Full cycle: visible → shrink+rotate out → hidden → grow+rotate in → visible */
@keyframes wf-swap-cycle {
  /* search/user at rest (40% of cycle = 2s) */
  0%, 20%   { opacity: 1; transform: scale(1) rotate(0deg); }
  /* transition out (15% = 0.75s) */
  35%       { opacity: 0; transform: scale(0.15) rotate(110deg); }
  /* hidden (30% = 1.5s) */
  50%, 70%  { opacity: 0; transform: scale(0.15) rotate(110deg); }
  /* transition in (15% = 0.75s) */
  85%       { opacity: 1; transform: scale(1) rotate(0deg); }
  /* back at rest */
  100%      { opacity: 1; transform: scale(1) rotate(0deg); }
}

/* Hover: pause + show both at half blend */
.wf-card:hover .wf-morph-stage .wf-icon-a,
.wf-card:hover .wf-morph-stage .wf-icon-b {
  animation-play-state: paused;
  opacity: 0.5;
  transform: scale(1) rotate(0deg);
}

/* ============================================
   Badge, title, description
   ============================================ */
.wf-badge {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
  color: #7c3aed; opacity: 0.55; text-transform: uppercase;
}
.wf-title {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 18px; font-weight: 600; line-height: 1.3;
  letter-spacing: -0.01em; color: #0b0817;
}
.wf-desc {
  font-size: 14px; line-height: 1.65; color: #6b6b7b;
}

/* ============================================
   Scroll animations
   ============================================ */
.wf-step--left .wf-card {
  opacity: 0; transform: translateX(-32px);
  transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1),
              transform 0.6s cubic-bezier(0.16,1,0.3,1),
              box-shadow 0.35s cubic-bezier(0.16,1,0.3,1),
              border-color 0.3s ease;
}
.wf-step--right .wf-card {
  opacity: 0; transform: translateX(32px);
  transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1),
              transform 0.6s cubic-bezier(0.16,1,0.3,1),
              box-shadow 0.35s cubic-bezier(0.16,1,0.3,1),
              border-color 0.3s ease;
}
.wf-step--left.wf-step--visible .wf-card  { opacity: 1; transform: translateX(0); }
.wf-step--right.wf-step--visible .wf-card { opacity: 1; transform: translateX(0); }

/* Stagger */
.wf-step:nth-child(1).wf-step--visible .wf-card { transition-delay: 0.04s; }
.wf-step:nth-child(2).wf-step--visible .wf-card { transition-delay: 0.08s; }
.wf-step:nth-child(3).wf-step--visible .wf-card { transition-delay: 0.12s; }
.wf-step:nth-child(4).wf-step--visible .wf-card { transition-delay: 0.16s; }
.wf-step:nth-child(5).wf-step--visible .wf-card { transition-delay: 0.20s; }
.wf-step:nth-child(6).wf-step--visible .wf-card { transition-delay: 0.24s; }

/* ============================================
   Tablet
   ============================================ */
@media (max-width: 1023px) {
  .wf-card { padding: 24px; gap: 20px; }
  .wf-icon-wrap { width: 60px; height: 60px; border-radius: 16px; }
  .wf-icon { width: 28px; height: 28px; }
  .wf-title { font-size: 17px; }
  .wf-step { padding-bottom: 48px; }
  .wf-watermark { font-size: 72px; right: -8px; bottom: -14px; }
  .wf-h-line--left.wf-h-line--visible,
  .wf-h-line--right.wf-h-line--visible { width: 44px; }
}

/* ============================================
   Mobile
   ============================================ */
@media (max-width: 767px) {
  .wf-line { left: 36px; transform: none; }
  .wf-step { grid-template-columns: 1fr; padding-left: 72px; padding-bottom: 48px; }
  .wf-step--left .wf-card,
  .wf-step--right .wf-card { grid-column: 1; }
  .wf-card { padding: 20px; gap: 16px; flex-direction: column; align-items: flex-start; }
  .wf-icon-wrap { width: 56px; height: 56px; border-radius: 14px; }
  .wf-icon { width: 26px; height: 26px; }
  .wf-watermark { font-size: 64px; right: -6px; bottom: -12px; }
  .wf-dot-col { position: absolute; left: -36px; top: 0; }
  .wf-connector { height: 48px; }
  .wf-h-line { display: none; }
  .wf-step--left .wf-card,
  .wf-step--right .wf-card {
    opacity: 0; transform: translateX(-20px);
  }
  .wf-step--left.wf-step--visible .wf-card,
  .wf-step--right.wf-step--visible .wf-card {
    opacity: 1; transform: translateX(0);
  }
}
</style>
