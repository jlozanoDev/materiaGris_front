<script setup lang="ts">
const pains = [
  {
    icon: 'clipboard',
    title: 'Registros en papel',
    desc: 'Expedientes físicos que se pierden, se dañan o simplemente se extravían. Horas buscando historiales entre archivos muertos.'
  },
  {
    icon: 'clock',
    title: 'Tiempo perdido',
    desc: 'Cada consulta genera minutos de escritura manual. Al final del día, horas de tipeo que podrían dedicarse al paciente.'
  },
  {
    icon: 'alert',
    title: 'Errores de tipeo',
    desc: 'Letra ilegible, datos mal copiados, omisiones en diagnósticos. Errores humanos que comprometen la calidad de la atención.'
  },
  {
    icon: 'folder',
    title: 'Sin interoperabilidad',
    desc: 'El historial del paciente queda atrapado en un consultorio. Derivaciones, segundas opiniones, todo se reinicia desde cero.'
  }
]
</script>

<template>
  <section class="slide">
    <div class="slide-content">
      <!-- Label -->
      <span class="slide-label" data-stagger>El desafío</span>

      <!-- Title -->
      <h2 class="slide-title" data-stagger>
        La gestión clínica tradicional<br>
        <span class="title-highlight">todavía duele</span>
      </h2>

      <!-- Pain point cards -->
      <div class="cards-grid">
        <div
          v-for="(pain, i) in pains"
          :key="pain.title"
          class="pain-card glass-card"
          data-stagger
        >
          <!-- Icon -->
          <div class="card-icon">
            <svg v-if="pain.icon === 'clipboard'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <svg v-else-if="pain.icon === 'clock'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <svg v-else-if="pain.icon === 'alert'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <svg v-else-if="pain.icon === 'folder'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>

          <h3 class="card-title">{{ pain.title }}</h3>
          <p class="card-desc">{{ pain.desc }}</p>
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
  max-width: 1000px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.slide-label {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #ef4444;
}

.slide-title {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 700;
  color: #fff;
  line-height: 1.12;
  letter-spacing: -0.02em;
}
.title-highlight {
  color: #fb7185;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.pain-card {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  color: #fb7185;
  margin-bottom: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.01em;
}

.card-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #9690a8;
}

@media (max-width: 768px) {
  .slide { padding: 40px 24px; }
  .cards-grid { grid-template-columns: 1fr; }
}
</style>
