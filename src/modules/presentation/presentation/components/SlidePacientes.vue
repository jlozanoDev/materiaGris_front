<script setup lang="ts">
import doctorImg from '@/assets/doctor.png'
</script>

<template>
  <section class="slide">
    <div class="slide-content">
      <div class="text-side">
        <span class="slide-label" data-stagger>Gestión de pacientes</span>

        <h2 class="slide-title" data-stagger>
          Todo lo que necesitas saber<br>
          <span class="title-highlight">de cada paciente, al instante</span>
        </h2>

        <p class="slide-desc" data-stagger>
          Desde el registro inicial hasta el seguimiento de consultas, recetas y órdenes médicas. 
          Una ficha clínica completa con datos personales, historial, documentos asociados y 
          trazabilidad completa de la atención.
        </p>

        <div class="features-list" data-stagger>
          <div class="feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Alta, edición y búsqueda instantánea</span>
          </div>
          <div class="feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Ficha clínica con historial completo</span>
          </div>
          <div class="feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Documentos e informes asociados</span>
          </div>
          <div class="feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Búsqueda por nombre, documento o historial</span>
          </div>
        </div>
      </div>

      <div class="visual-side" data-stagger>
        <div class="img-frame">
          <img :src="doctorImg" alt="Doctor" class="doctor-img" />
          <div class="img-glow" />
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
  max-width: 1060px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.text-side {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.slide-label {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #06b6d4;
}

.slide-title {
  font-size: clamp(30px, 3.6vw, 44px);
  font-weight: 700;
  color: #fff;
  line-height: 1.12;
  letter-spacing: -0.02em;
}
.title-highlight {
  background: linear-gradient(135deg, #10b981, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.slide-desc {
  font-size: 15px;
  line-height: 1.65;
  color: #9690a8;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #c4b5fd;
}

.visual-side {
  display: flex;
  justify-content: center;
  align-items: center;
}

.img-frame {
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(16,185,129,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.doctor-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: rotate(3deg);
}

.img-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(16,185,129,0.1), transparent 70%);
  pointer-events: none;
}

@media (max-width: 900px) {
  .slide-content { grid-template-columns: 1fr; gap: 32px; }
  .visual-side { order: -1; }
  .img-frame { width: 180px; height: 180px; }
  .slide { padding: 40px 24px; }
}
</style>
