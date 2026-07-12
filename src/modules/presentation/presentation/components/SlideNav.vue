<script setup lang="ts">
defineProps<{
  current: number
  total: number
  progress: number
  label: string
  isFirst: boolean
  isLast: boolean
  isAnimating: boolean
}>()

const emit = defineEmits<{
  prev: []
  next: []
}>()
</script>

<template>
  <div class="slide-nav">
    <!-- Progress bar -->
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: `${progress * 100}%` }" />
    </div>

    <div class="nav-controls">
      <button
        class="nav-btn"
        :disabled="isFirst || isAnimating"
        @click.stop="emit('prev')"
        aria-label="Slide anterior"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <span class="slide-counter">{{ label }}</span>

      <button
        class="nav-btn"
        :disabled="isLast || isAnimating"
        @click.stop="emit('next')"
        aria-label="Siguiente slide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.slide-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(to top, rgba(15,10,30,0.6) 0%, transparent 100%);
  pointer-events: none;
}

.progress-track {
  width: 100%;
  height: 2px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%);
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.16,1,0.3,1);
}

.nav-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  pointer-events: auto;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}
.nav-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.1);
  color: #fff;
  border-color: rgba(255,255,255,0.2);
}
.nav-btn:disabled {
  opacity: 0.2;
  cursor: default;
}
.nav-btn:focus-visible {
  outline: 2px solid #7c3aed;
  outline-offset: 2px;
}

.slide-counter {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  letter-spacing: 0.04em;
  min-width: 60px;
  text-align: center;
}

@media (max-width: 768px) {
  .slide-nav { padding: 16px 20px; }
}
</style>
