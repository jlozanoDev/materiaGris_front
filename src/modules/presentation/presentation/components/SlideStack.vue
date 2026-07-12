<script setup lang="ts">
const techStack = [
  { name: 'Vue 3', desc: 'Composition API + SFC', color: '#4FC08D' },
  { name: 'Vite 8', desc: 'Build instantáneo', color: '#646CFF' },
  { name: 'Pinia 3', desc: 'Estado reactivo', color: '#ffd859' },
  { name: 'Vue Router 4', desc: 'Navegación SPA', color: '#b0b0b0' },
  { name: 'Vuetify 4', desc: 'Componentes Material', color: '#1867C0' },
  { name: 'Tailwind 4', desc: 'Utility CSS', color: '#06B6D4' },
  { name: 'TypeScript', desc: 'Tipado seguro', color: '#3178C6' },
  { name: 'Anime.js', desc: 'Animaciones 3D', color: '#e83e8c' },
  { name: 'Vitest', desc: 'Tests unitarios', color: '#729B1B' },
  { name: 'Playwright', desc: 'E2E testing', color: '#45ba4b' },
  { name: 'TipTap', desc: 'Editor rich text', color: '#ff6b35' },
  { name: 'Lucide', desc: 'Iconos SVG', color: '#a78bfa' },
]
</script>

<template>
  <section class="slide">
    <div class="slide-content">
      <span class="slide-label" data-stagger>Stack tecnológico</span>

      <h2 class="slide-title" data-stagger>
        Construido con tecnología<br>
        <span class="title-highlight">moderna y robusta</span>
      </h2>

      <div class="tech-cloud" data-stagger>
        <div
          v-for="tech in techStack"
          :key="tech.name"
          class="tech-badge"
          :style="{ '--tech-color': tech.color }"
        >
          <span class="tech-name">{{ tech.name }}</span>
          <span class="tech-desc">{{ tech.desc }}</span>
        </div>
      </div>

      <div class="divider" data-stagger />

      <div class="cta-section" data-stagger>
        <p class="cta-text">
          Desarrollado con Clean Architecture hexagonal · 22 rutas · 3 perfiles · IA integrada
        </p>
        <div class="cta-links">
          <a
            href="https://materiagrisfront-production.up.railway.app/welcome"
            target="_blank"
            rel="noopener noreferrer"
            class="cta-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Producción
          </a>
          <a
            href="https://github.com/jlozanoDev/materiaGris_front.git"
            target="_blank"
            rel="noopener noreferrer"
            class="cta-btn cta-btn--outline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            GitHub
          </a>
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

.tech-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  transition: all 0.25s ease;
}
.tech-badge:hover {
  background: rgba(255,255,255,0.08);
  border-color: var(--tech-color);
  box-shadow: 0 0 24px color-mix(in srgb, var(--tech-color) 15%, transparent);
  transform: translateY(-2px);
}

.tech-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.tech-desc {
  font-size: 12px;
  color: #9690a8;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
}

.cta-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  text-align: center;
}

.cta-text {
  font-size: 14px;
  color: #9690a8;
  line-height: 1.5;
}

.cta-links {
  display: flex;
  gap: 12px;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 50px;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(124,58,237,0.3);
}

.cta-btn--outline {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.7);
}
.cta-btn--outline:hover {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.3);
  color: #fff;
}

@media (max-width: 768px) {
  .slide { padding: 40px 24px; }
  .tech-cloud { justify-content: center; }
  .cta-links { flex-direction: column; }
}
</style>
