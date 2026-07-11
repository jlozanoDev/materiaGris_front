<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { Ref } from "vue";
import type { FieldConfig } from "@/shared/types";
import { useReportAI } from "@/modules/reports/presentation/composables/useReportAI";
import AIInputSelector from "./AIInputSelector.vue";
import AudioRecorder from "./AudioRecorder.vue";
import AITextInput from "./AITextInput.vue";
import AITranscriptionPreview from "./AITranscriptionPreview.vue";
import AIProcessingPipeline from "./AIProcessingPipeline.vue";

type InputMode = "record" | "upload" | "paste";

const props = defineProps<{
  reportId: string | number;
  templateId: string | number;
  fieldConfigs?: FieldConfig[];
  formValues?: Record<string, unknown>;
  formSetValue?: (key: string, value: unknown) => void;
}>();

const emit = defineEmits<{
  apply: [data: Record<string, any>];
  error: [message: string];
  done: [];
  "llm-result": [result: import("@/modules/reports/domain/entities/AIProcessing").LLMExtractionResult];
}>();

const mode = ref<InputMode>("record");
const pastedText = ref("");
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

function handleDragOver(e: DragEvent): void {
  e.preventDefault();
  isDragOver.value = true;
}

function handleDragLeave(): void {
  isDragOver.value = false;
}

function handleDrop(e: DragEvent): void {
  e.preventDefault();
  isDragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) ai.uploadAudioFile(file);
}

const reportIdRef: Ref<string | number> = ref(props.reportId);
const templateIdRef: Ref<string | number> = ref(props.templateId);

watch(() => props.reportId, (v) => { reportIdRef.value = v; });
watch(() => props.templateId, (v) => { templateIdRef.value = v; });

// Stop recording automatically when user switches away from record mode
watch(mode, async (newMode) => {
  if (newMode !== "record" && ai.recordingState.value === "recording") {
    await ai.stopRecording();
  }
});

const ai = useReportAI(reportIdRef, templateIdRef);

// Emit LLM result up to parent when entering reviewing state
watch(() => ai.state.value, (newState) => {
  if (newState === "reviewing" && ai.llmResult.value) {
    emit("llm-result", ai.llmResult.value);
  }
});

const isBusy = computed(() => {
  const busyStates = ["uploading", "transcribing", "analyzing"];
  return busyStates.includes(ai.state.value);
});

/** El recorder NO debe estar disabled durante grabación — pausar/detener deben funcionar */
const isRecorderDisabled = computed(() => {
  const disabledStates = ["uploading", "transcribing", "analyzing"];
  return disabledStates.includes(ai.state.value);
});

const showTranscription = computed(() => {
  return ai.state.value === "done";
});

const showReviewPanel = computed(() => ai.state.value === "reviewing");

const isTranscribing = computed(() => ai.state.value === "transcribing");

async function handleStartRecording(): Promise<void> {
  try {
    await ai.startRecording();
  } catch (e: any) {
    // Error already handled in useReportAI (sets state to error)
    console.error("[AIAssistantPanel] startRecording error:", e);
  }
}

function handlePauseRecording(): void {
  ai.pauseRecording();
}

function handleResumeRecording(): void {
  ai.resumeRecording();
}

async function handleStopRecording(): Promise<void> {
  await ai.stopRecording();
}

async function handleRetryTranscription(): Promise<void> {
  await ai.sendToTranscription();
  if (ai.state.value === "error") return;
  await ai.processTranscription();
}

async function handleFileSelect(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  await ai.uploadAudioFile(file);
  input.value = "";
}

function handleProcessText(): void {
  ai.processTranscription(pastedText.value);
}

/** @deprecated Use handleReviewDone instead — kept for backward compatibility */
function handleApply(): void {
  if (!ai.llmResult.value) return;
  emit("apply", ai.llmResult.value.extracted_data);
  ai.state.value = "done";
}

function handleReset(): void {
  ai.reset();
  pastedText.value = "";
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4 bg-white">
    <!-- Reset button (only when active) -->
    <div v-if="ai.state.value !== 'idle'" class="flex justify-end">
      <button
        class="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        @click="handleReset"
      >
        Reiniciar
      </button>
    </div>

    <!-- Pipeline indicator -->
    <AIProcessingPipeline
      :state="ai.state.value"
      :error="ai.errorMessage.value"
      :mode="mode"
    />

    <!-- Mode selector -->
    <AIInputSelector v-model="mode" :disabled="isBusy" />

    <!-- Record mode -->
    <div v-if="mode === 'record'">
      <AudioRecorder
        :recording-state="ai.recordingState.value"
        :disabled="isRecorderDisabled"
        :audio-url="ai.lastBlobUrl.value"
        :loading="isTranscribing"
        @start="handleStartRecording"
        @pause="handlePauseRecording"
        @resume="handleResumeRecording"
        @stop="handleStopRecording"
        @retry="handleRetryTranscription"
      />
    </div>

    <!-- Upload mode -->
    <div v-else-if="mode === 'upload'" class="flex flex-col items-center gap-3 py-6">
      <input
        ref="fileInputRef"
        type="file"
        accept="audio/*,.weba,.webm,.mp3,.wav,.m4a,.ogg"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- No file selected yet — drop zone -->
      <div
        v-if="!ai.lastBlobUrl.value"
        class="flex flex-col items-center gap-3 w-full py-8 px-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer"
        :class="isDragOver
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-slate-300 hover:border-slate-400'"
        @dragover="handleDragOver"
        @dragenter="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
        @click="fileInputRef?.click()"
      >
        <i class="pi pi-cloud-upload text-3xl text-slate-400"></i>
        <button
          class="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium pointer-events-none"
          :disabled="isBusy"
        >
          <i class="pi pi-upload"></i>
          <span>Seleccionar archivo de audio</span>
        </button>
        <p class="text-xs text-slate-400">
          o arrastra el archivo aquí
        </p>
        <p class="text-xs text-slate-400">
          Formatos soportados: MP3, WAV, WebM, WebA, M4A, OGG <br>
          <a
            href="/audios/consulta1.mp3"
            download
            class="underline hover:text-slate-600 transition-colors"
            @click.stop
          >Descarga un audio de prueba y súbalo para probar</a>
        </p>
      </div>

      <!-- File selected — preview + send -->
      <div v-if="ai.lastBlobUrl.value" class="flex flex-col items-center gap-3 w-full">
        <p class="text-sm text-slate-600 font-medium">Archivo seleccionado</p>
        <audio controls :src="ai.lastBlobUrl.value" class="w-full max-w-xs"></audio>
        <button
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="isTranscribing"
          @click="handleRetryTranscription"
        >
          <i class="pi" :class="isTranscribing ? 'pi-spin pi-spinner' : 'pi-send'"></i>
          <span>{{ isTranscribing ? 'Enviando...' : 'Enviar a transcripción' }}</span>
        </button>
        <button
          class="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          @click="fileInputRef?.click()"
        >
          Cambiar archivo
        </button>
      </div>
    </div>

    <!-- Paste mode -->
    <div v-else-if="mode === 'paste'">
      <AITextInput
        v-model="pastedText"
        :disabled="isBusy"
        :loading="ai.state.value === 'analyzing'"
        @process="handleProcessText"
      />
    </div>

    <!-- Analyzing animation -->
    <div
      v-if="ai.state.value === 'analyzing'"
      class="flex flex-col items-center justify-center py-8 gap-3"
    >
      <div class="relative">
        <i class="pi pi-sparkles text-4xl text-indigo-500 animate-pulse"></i>
        <span class="absolute -top-1 -right-1 flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </span>
      </div>
      <p class="text-sm text-slate-600 dark:text-slate-300 font-medium">Analizando con IA...</p>
      <p class="text-xs text-slate-400">Esto puede tardar unos segundos</p>
    </div>

    <!-- Transcription preview -->
    <AITranscriptionPreview
      v-if="showTranscription"
      :segments="ai.transcriptionResult.value?.segments ?? []"
      :loading="ai.state.value === 'transcribing'"
    />

    <!-- Fallback apply button (when review panel props are missing) -->
    <div v-if="showReviewPanel && !(props.fieldConfigs && props.formValues)" class="flex justify-end">
      <button
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
        @click="handleApply"
      >
        <i class="pi pi-check"></i>
        <span>Aplicar al informe</span>
      </button>
    </div>
  </div>
</template>
