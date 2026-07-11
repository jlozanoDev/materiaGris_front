<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
  disabled?: boolean;
  /** External recording state driven by parent composable */
  recordingState?: "inactive" | "recording" | "paused";
  /** Blob URL for audio preview after recording stops */
  audioUrl?: string | null;
  /** Whether transcription is in progress */
  loading?: boolean;
}>();

const emit = defineEmits<{
  start: [];
  pause: [];
  resume: [];
  stop: [];
  retry: [];
}>();

const elapsed = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;

const isRecording = computed(() => props.recordingState === "recording");
const isPaused = computed(() => props.recordingState === "paused");
const isInactive = computed(() => !props.recordingState || props.recordingState === "inactive");

function startTimer(): void {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsed.value++;
  }, 1000);
}

function stopTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer(): void {
  stopTimer();
  elapsed.value = 0;
}

watch(
  () => props.recordingState,
  (state) => {
    if (state === "recording") startTimer();
    else if (state === "paused") stopTimer();
    else if (state === "inactive") resetTimer();
  },
);

const formattedTime = computed(() => {
  const m = Math.floor(elapsed.value / 60)
    .toString()
    .padStart(2, "0");
  const s = (elapsed.value % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
});

function handleStart(): void {
  if (props.disabled) return;
  emit("start");
}

function handlePause(): void {
  if (props.disabled) return;
  emit("pause");
}

function handleResume(): void {
  if (props.disabled) return;
  emit("resume");
}

function handleStop(): void {
  if (props.disabled) return;
  emit("stop");
}

function handleRetry(): void {
  emit("retry");
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border border-slate-200">
    <!-- Timer & indicator -->
    <div class="flex items-center gap-3">
      <span
        v-if="isRecording"
        class="relative flex h-3 w-3"
      >
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
      <span
        class="text-3xl font-mono font-semibold tabular-nums"
        :class="isRecording ? 'text-red-500' : 'text-slate-400'"
      >
        {{ formattedTime }}
      </span>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-3">
      <!-- Start -->
      <button
        v-if="isInactive"
        class="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        :disabled="disabled"
        @click="handleStart"
      >
        <i class="pi pi-microphone"></i>
        <span>Iniciar grabación</span>
      </button>

      <!-- Pause -->
      <button
        v-if="isRecording"
        class="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        :disabled="disabled"
        @click="handlePause"
      >
        <i class="pi pi-pause"></i>
        <span>Pausar</span>
      </button>

      <!-- Resume -->
      <button
        v-if="isPaused"
        class="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        :disabled="disabled"
        @click="handleResume"
      >
        <i class="pi pi-play"></i>
        <span>Continuar</span>
      </button>

      <!-- Stop -->
      <button
        v-if="!isInactive"
        class="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        :disabled="disabled"
        @click="handleStop"
      >
        <i class="pi pi-stop"></i>
        <span>Finalizar</span>
      </button>
    </div>

    <!-- Audio preview after recording stops -->
    <div v-if="isInactive && audioUrl" class="flex flex-col items-center gap-3 w-full">
      <audio controls :src="audioUrl" class="w-full max-w-xs"></audio>
      <p class="text-xs text-slate-400">Escucha tu grabación antes de enviar</p>
      <button
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :disabled="disabled || loading"
        @click="handleRetry"
      >
        <i class="pi" :class="loading ? 'pi-spin pi-spinner' : 'pi-send'"></i>
        <span>{{ loading ? 'Enviando...' : 'Enviar a transcripción' }}</span>
      </button>
    </div>
  </div>
</template>
