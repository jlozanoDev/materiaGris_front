<template>
  <div class="signature-pad">
    <!-- Read-only: display existing signature -->
    <div v-if="disabled && modelValue" class="signature-pad__readonly">
      <img :src="modelValue" alt="Firma guardada" class="signature-pad__image" />
    </div>

    <!-- Editable -->
    <div v-else class="signature-pad__editor">
      <div class="signature-pad__methods">
        <!-- Canvas signature -->
        <div class="signature-pad__method">
          <div
            ref="canvasWrapperRef"
            class="signature-pad__canvas-wrapper"
            :class="{
              'signature-pad__canvas-wrapper--active': isDrawing,
              'signature-pad__canvas-wrapper--disabled': disabled,
            }"
          >
            <canvas
              ref="canvasRef"
              role="img"
              aria-label="Campo de firma. Dibuje dentro del recuadro."
              class="signature-pad__canvas"
              :class="{ 'signature-pad__canvas--disabled': disabled }"
              :width="canvasWidth"
              :height="canvasHeight"
              @pointerdown.prevent="onPointerDown"
              @pointermove.prevent="onPointerMove"
              @pointerup.prevent="onPointerUp"
              @pointerleave.prevent="onPointerUp"
            ></canvas>

            <!-- Watermark -->
            <span v-if="!hasDrawn" class="signature-pad__watermark">
              <svg class="signature-pad__watermark-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
              Firme aquí
            </span>
          </div>

          <button
            v-if="hasDrawn || modelValue"
            type="button"
            class="signature-pad__clear-btn"
            aria-label="Limpiar firma"
            @click="clearSignature"
          >
            <svg class="signature-pad__clear-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/>
              <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
              <path d="M19 6v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            </svg>
            Limpiar
          </button>
        </div>

        <!-- Divider -->
        <div class="signature-pad__divider">
          <span class="signature-pad__divider-line"></span>
          <span class="signature-pad__divider-text">o</span>
          <span class="signature-pad__divider-line"></span>
        </div>

        <!-- Typed signature -->
        <div class="signature-pad__typed">
          <label class="signature-pad__typed-label">
            Firma mecanografiada
          </label>
          <div class="signature-pad__typed-input-wrapper">
            <svg class="signature-pad__typed-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
            </svg>
            <input
              type="text"
              :value="typedValue"
              :disabled="disabled"
              class="form-input signature-pad__typed-input"
              aria-label="Firma mecanografiada"
              placeholder="Escriba su nombre completo"
              @input="onTypedInput"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

interface Props {
  modelValue: string | null
  disabled: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'update:typedSignature': [value: string]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasWrapperRef = ref<HTMLDivElement | null>(null)
const canvasWidth = 600
const canvasHeight = 220
const hasDrawn = ref(false)
const isDrawing = ref(false)

// Typed signature
const typedValue = ref('')

let lastX = 0
let lastY = 0

function getCtx(): CanvasRenderingContext2D | null {
  return canvasRef.value?.getContext('2d') ?? null
}

function onPointerDown(e: PointerEvent): void {
  if (props.disabled) return
  isDrawing.value = true
  const rect = canvasRef.value!.getBoundingClientRect()
  lastX = e.clientX - rect.left
  lastY = e.clientY - rect.top
  const ctx = getCtx()
  if (!ctx) return
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
}

function onPointerMove(e: PointerEvent): void {
  if (!isDrawing.value || props.disabled) return
  const rect = canvasRef.value!.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const ctx = getCtx()
  if (!ctx) return
  ctx.strokeStyle = '#7c3aed'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
  hasDrawn.value = true
}

function onPointerUp(): void {
  if (!isDrawing.value) return
  isDrawing.value = false
  const canvas = canvasRef.value
  if (!canvas) return
  const dataUrl = canvas.toDataURL('image/png')
  emit('update:modelValue', dataUrl)
}

function clearSignature(): void {
  const ctx = getCtx()
  if (!ctx) return
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  hasDrawn.value = false
  emit('update:modelValue', null)
  // Redraw background
  initCanvas()
}

function onTypedInput(e: Event): void {
  typedValue.value = (e.target as HTMLInputElement).value
  emit('update:typedSignature', typedValue.value)
}

// Initialize canvas background
function initCanvas(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx || typeof ctx.fillRect !== 'function') return
  ctx.fillStyle = '#fafaff'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  // Subtle bottom line guide
  ctx.beginPath()
  ctx.strokeStyle = 'rgba(124, 58, 237, 0.08)'
  ctx.lineWidth = 2
  ctx.moveTo(20, canvasHeight - 30)
  ctx.lineTo(canvasWidth - 20, canvasHeight - 30)
  ctx.stroke()
}

onMounted(() => {
  nextTick(() => {
    initCanvas()
  })
})
</script>

<style scoped>
@reference "tailwindcss";
.signature-pad {
  @apply w-full;
}

/* ── Read-only ─────────────────────────────── */
.signature-pad__readonly {
  @apply rounded-xl border border-gray-200 bg-gray-50 p-4 inline-block;
}
.signature-pad__image {
  @apply block max-h-32 w-auto;
}

/* ── Editor ─────────────────────────────────── */
.signature-pad__editor {
  @apply w-full;
}
.signature-pad__methods {
  @apply flex flex-col gap-4 sm:flex-row sm:items-start;
}

/* ── Canvas section ─────────────────────────── */
.signature-pad__method {
  @apply flex-1 flex flex-col items-start gap-2;
}
.signature-pad__canvas-wrapper {
  @apply relative rounded-xl overflow-hidden w-full;
  border: 2px dashed rgba(124, 58, 237, 0.15);
  background: #fafaff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  max-width: 620px;
}
.signature-pad__canvas-wrapper:hover {
  border-color: rgba(124, 58, 237, 0.3);
}
.signature-pad__canvas-wrapper--active {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
.signature-pad__canvas-wrapper--disabled {
  @apply opacity-60 cursor-not-allowed;
  border-style: solid;
  border-color: rgba(124, 58, 237, 0.1);
}
.signature-pad__canvas {
  @apply block w-full h-auto;
  touch-action: none;
  cursor: crosshair;
}
.signature-pad__canvas--disabled {
  @apply cursor-not-allowed;
}
.signature-pad__watermark {
  @apply pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-sm select-none;
  color: #aca4c0;
}
.signature-pad__watermark-icon {
  @apply w-6 h-6 opacity-50;
}

/* ── Clear button ───────────────────────────── */
.signature-pad__clear-btn {
  @apply inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 
    text-xs font-medium text-gray-500 shadow-sm
    hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300
    focus:outline-none focus:ring-2 focus:ring-[rgba(124,58,237,0.15)]
    transition-all duration-150;
}
.signature-pad__clear-icon {
  @apply w-3.5 h-3.5;
}

/* ── Divider ────────────────────────────────── */
.signature-pad__divider {
  @apply flex items-center gap-2 sm:flex-col sm:self-stretch sm:justify-center sm:w-auto sm:px-2 shrink-0;
}
.signature-pad__divider-line {
  @apply flex-1 h-px sm:w-px sm:h-8;
  background: rgba(124, 58, 237, 0.1);
}
.signature-pad__divider-text {
  @apply text-xs font-medium;
  color: #9690a8;
}

/* ── Typed signature ────────────────────────── */
.signature-pad__typed {
  @apply flex-1 flex flex-col gap-1.5 min-w-0;
}
.signature-pad__typed-label {
  @apply block text-xs font-medium;
  color: #6b6b7b;
}
.signature-pad__typed-input-wrapper {
  @apply relative;
}
.signature-pad__typed-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none;
  color: #aca4c0;
}
.signature-pad__typed-input {
  @apply !pl-9;
}
</style>
