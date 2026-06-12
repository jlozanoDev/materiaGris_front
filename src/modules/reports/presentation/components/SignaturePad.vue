<template>
  <div class="signature-pad">
    <!-- Read-only: display existing signature as image -->
    <div v-if="disabled && modelValue" class="signature-pad__readonly">
      <img :src="modelValue" alt="Firma guardada" class="signature-pad__image" />
    </div>

    <!-- Editable canvas -->
    <div v-else class="signature-pad__canvas-wrapper">
      <canvas
        ref="canvasRef"
        role="img"
        :aria-label="'Campo de firma. Dibuje dentro del recuadro o use la firma mecanografiada.'"
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
      <span
        v-if="!hasDrawn"
        class="signature-pad__watermark"
      >
        Firme dentro del recuadro
      </span>
    </div>

    <!-- Clear button (only when editable and signature exists) -->
    <button
      v-if="!disabled && (hasDrawn || modelValue)"
      type="button"
      class="signature-pad__clear-btn"
      aria-label="Limpiar firma"
      @click="clearSignature"
    >
      Limpiar firma
    </button>

    <!-- Typed signature alternative -->
    <div class="signature-pad__typed">
      <label class="signature-pad__typed-label">
        Firma mecanografiada (nombre completo)
      </label>
      <input
        type="text"
        :value="typedValue"
        :disabled="disabled"
        class="dynamic-field__input"
        :aria-label="'Firma mecanografiada'"
        placeholder="Escriba su nombre completo"
        @input="onTypedInput"
      />
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
const canvasWidth = 400
const canvasHeight = 160
const hasDrawn = ref(false)
const isDrawing = ref(false)

// Typed signature is stored separately as modelValue + "_typed"
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
  ctx.strokeStyle = '#1a1a2e'
  ctx.lineWidth = 2
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
  // Export canvas to base64 and emit
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
  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  // Border
  ctx.strokeStyle = '#d1d5db'
  ctx.lineWidth = 1
  ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2)
}

onMounted(() => {
  nextTick(() => {
    initCanvas()
  })
})
</script>

<style scoped>
.signature-pad {
  @apply space-y-2;
}
.signature-pad__canvas-wrapper {
  @apply relative inline-block;
}
.signature-pad__canvas {
  @apply block rounded-md border border-gray-300 bg-white;
  touch-action: none;
  cursor: crosshair;
}
.signature-pad__canvas--disabled {
  @apply cursor-not-allowed opacity-60;
}
.signature-pad__watermark {
  @apply pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
    text-sm text-gray-400 select-none;
}
.signature-pad__readonly {
  @apply rounded-md border border-gray-300 bg-gray-50 p-2;
}
.signature-pad__image {
  @apply block max-h-40 w-auto;
}
.signature-pad__clear-btn {
  @apply inline-flex items-center gap-1 rounded-md border border-red-300 bg-red-50 px-3 py-1 text-sm font-medium text-red-700
    hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500;
}
.signature-pad__typed {
  @apply mt-2;
}
.signature-pad__typed-label {
  @apply block text-xs text-gray-500 mb-1;
}
.dynamic-field__input {
  @apply block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm
    focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
    disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500;
}
</style>
