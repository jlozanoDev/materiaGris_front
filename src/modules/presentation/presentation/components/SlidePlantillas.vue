<script setup lang="ts">
const features = [
  {
    icon: 'grid',
    title: 'Constructor visual',
    desc: 'Arrastra y suelta campos en un lienzo. Sin código, sin complicaciones. El diseño se adapta a cualquier especialidad médica.'
  },
  {
    icon: 'settings',
    title: 'Campos dinámicos',
    desc: 'Texto, número, fecha, selección, tabla, firma electrónica, checkboxes. Cada campo con validación y formato propios.'
  },
  {
    icon: 'layout',
    title: 'Diseño flexible',
    desc: 'Organiza columnas, secciones y grupos. Ajusta anchos, define campos obligatorios y personaliza etiquetas al detalle.'
  },
  {
    icon: 'eye',
    title: 'Vista previa en vivo',
    desc: 'Cada cambio se refleja al instante. Lo que ves en el constructor es exactamente lo que obtienes en el informe final.'
  },
  {
    icon: 'file',
    title: 'Multi-formato',
    desc: 'Exporta a PDF, HTML.'
  },
]
</script>

<template>
  <section class="slide">
    <div class="slide-content">
      <span class="slide-label" data-stagger>Plantillas personalizadas</span>

      <h2 class="slide-title" data-stagger>
        Informes a tu medida,<br>
        <span class="title-highlight">sin límites</span>
      </h2>

      <p class="slide-subtitle" data-stagger>
        Olvídate de informes rígidos. Crea plantillas adaptadas a cada especialidad con
        un constructor visual de arrastrar y soltar. Tú decides qué campos incluir y cómo se ven.
      </p>

      <div class="features-grid" data-stagger>
        <div
          v-for="ft in features"
          :key="ft.title"
          class="ft-card"
        >
          <div class="ft-icon">
            <svg v-if="ft.icon === 'grid'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <svg v-else-if="ft.icon === 'settings'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <svg v-else-if="ft.icon === 'layout'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <svg v-else-if="ft.icon === 'eye'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else-if="ft.icon === 'users'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <svg v-else-if="ft.icon === 'file'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h3 class="ft-title">{{ ft.title }}</h3>
          <p class="ft-desc">{{ ft.desc }}</p>
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
  max-width: 960px;
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
  max-width: 72ch;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.ft-card {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.ft-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(124,58,237,0.1);
}

.ft-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(124,58,237,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a78bfa;
}

.ft-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.ft-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #9690a8;
}

@media (max-width: 900px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .slide { padding: 40px 24px; }
}
@media (max-width: 600px) {
  .features-grid { grid-template-columns: 1fr; }
}
</style>
