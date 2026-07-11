/**
 * useReportAI — Composable that orchestrates the AI dictation pipeline.
 *
 * State machine:
 *   idle → recording/uploading → transcribing → analyzing → reviewing → done
 *   any state → error (on failure) → idle (on reset)
 *
 * Two input modes:
 *   1. Microphone recording  (start/stop → chunk concatenation → transcribe)
 *   2. File upload           (uploadAudioFile → transcribe)
 *   3. Paste text            (processTranscription(text) → skip transcribe)
 *
 * @module reports/presentation/composables/useReportAI
 */

import { ref, type Ref } from "vue";
import {
  provideTranscribeAudioUseCase,
  provideExtractReportDataUseCase,
} from "@/modules/reports/application/containers/reportsContainer";
import type {
  AIPipelineState,
  TranscriptionResult,
  LLMExtractionResult,
  RecordingChunk,
} from "@/modules/reports/domain/entities/AIProcessing";

export interface UseReportAIReturn {
  /** Current step in the AI pipeline */
  state: Ref<AIPipelineState>;
  /** Accumulated audio chunks from MediaRecorder */
  audioChunks: Ref<RecordingChunk[]>;
  /** Current MediaRecorder state (inactive | recording | paused) */
  recordingState: Ref<"inactive" | "recording" | "paused">;
  /** Result from the transcription API (null until transcribe completes) */
  transcriptionResult: Ref<TranscriptionResult | null>;
  /** Result from the LLM extraction API (null until analyze completes) */
  llmResult: Ref<LLMExtractionResult | null>;
  /** Error message when state === "error" */
  errorMessage: Ref<string | null>;
  /** Blob URL for the last recorded audio (for preview playback) */
  lastBlobUrl: Ref<string | null>;

  /** Start microphone recording. Requires MediaRecorder support. */
  startRecording(): Promise<void>;
  /** Pause an active recording. */
  pauseRecording(): void;
  /** Resume a paused recording. */
  resumeRecording(): void;
  /** Stop recording, concatenate chunks into blob, and begin transcription. */
  stopRecording(): Promise<void>;
  /**
   * Upload an audio file directly (alternative to recording).
   * Transitions: uploading → transcribing.
   */
  uploadAudioFile(file: File): Promise<void>;
  /**
   * Manually send the last recorded/uploaded blob to the transcription API.
   * Use when auto-transcribe was skipped or failed and user retries.
   * Transitions: idle/error → transcribing.
   */
  sendToTranscription(): Promise<void>;
  /**
   * Process a transcript for LLM extraction.
   * If no transcript argument is provided, uses the result from the
   * transcription step. Supports paste mode (skip transcribe).
   * Transitions: analyzing → reviewing | error.
   */
  processTranscription(transcript?: string): Promise<void>;
  /**
   * Apply LLM-extracted data to the report form via form.applyLLMResult.
   * Transitions: reviewing → done.
   *
   * @deprecated Use AIReviewPanel + per-field setValue instead.
   *             Kept for backward compatibility. Will be removed in next major.
   */
  applyToForm(form: { applyLLMResult: (data: Record<string, any>) => void }): void;
  /** Reset all state back to idle. */
  reset(): void;
}

/**
 * Create a useReportAI instance tied to a report and template.
 *
 * @param reportId  Reactive ref to the current report ID.
 * @param templateId  Reactive ref to the current template ID.
 */
export function useReportAI(
  reportId: Ref<string | number | null | undefined>,
  templateId: Ref<string | number | null | undefined>,
): UseReportAIReturn {
  const transcribeUseCase = provideTranscribeAudioUseCase();
  const extractUseCase = provideExtractReportDataUseCase();

  // ── State ────────────────────────────────────────────────────────────────────

  const state = ref<AIPipelineState>("idle");
  const audioChunks = ref<RecordingChunk[]>([]);
  const recordingState = ref<"inactive" | "recording" | "paused">("inactive");
  const transcriptionResult = ref<TranscriptionResult | null>(null);
  const llmResult = ref<LLMExtractionResult | null>(null);
  const errorMessage = ref<string | null>(null);
  const lastBlobUrl = ref<string | null>(null);

  let mediaRecorder: MediaRecorder | null = null;
  let lastStream: MediaStream | null = null;
  let lastBlob: Blob | null = null;

  // ── Internal helpers ─────────────────────────────────────────────────────────

  /**
   * Concatenate all recorded chunks into a single Blob for upload.
   */
  function concatenateChunks(): Blob {
    const blobs = audioChunks.value.map((chunk) => chunk.blob);
    return new Blob(blobs, { type: "audio/webm" });
  }

  /**
   * Process audio through the transcription pipeline.
   * Shared by recording and upload flows.
   */
  async function processAudio(blob: Blob): Promise<void> {
    state.value = "transcribing";
    try {
      const id = reportId.value;
      if (id === null || id === undefined) {
        throw new Error("ID del informe no disponible");
      }
      transcriptionResult.value = await transcribeUseCase.execute(id, blob);
      // Stay in 'transcribing' — caller invokes processTranscription() next
    } catch (e: any) {
      errorMessage.value = e.message || "Error al transcribir el audio";
      state.value = "error";
    }
  }

  // ── Recording methods ────────────────────────────────────────────────────────

  async function startRecording(): Promise<void> {
    if (state.value === "recording") {
      throw new Error("Ya está grabando");
    }
    if (typeof MediaRecorder === "undefined" || !MediaRecorder) {
      throw new Error("El navegador no soporta grabación de audio");
    }

    audioChunks.value = [];
    transcriptionResult.value = null;
    llmResult.value = null;
    errorMessage.value = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      lastStream = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : undefined;

      mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunks.value = [
            ...audioChunks.value,
            { blob: event.data, timestamp: Date.now() },
          ];
        }
      };

      mediaRecorder.onstop = () => {
        recordingState.value = "inactive";
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onerror = () => {
        errorMessage.value = "Error durante la grabación de audio";
        state.value = "error";
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      state.value = "recording";
      recordingState.value = "recording";
    } catch (e: any) {
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        errorMessage.value = "Permiso de micrófono denegado. Actívalo en la configuración del navegador.";
      } else {
        errorMessage.value = e.message || "Error al iniciar la grabación";
      }
      state.value = "error";
    }
  }

  function pauseRecording(): void {
    if (!mediaRecorder || state.value !== "recording") {
      throw new Error("No está grabando");
    }
    mediaRecorder.pause();
    recordingState.value = "paused";
  }

  function resumeRecording(): void {
    if (!mediaRecorder || recordingState.value !== "paused") {
      throw new Error("La grabación no está pausada");
    }
    mediaRecorder.resume();
    recordingState.value = "recording";
  }

  async function stopRecording(): Promise<void> {
    if (!mediaRecorder || state.value !== "recording") {
      throw new Error("No está grabando");
    }

    const stream = lastStream;

    // Call stop — triggers final dataavailable + onstop asynchronously
    try {
      mediaRecorder.stop();
    } catch {
      // Already stopped or invalid state
    }

    // Wait one tick for the browser to flush ondataavailable with the final chunk
    await new Promise((r) => setTimeout(r, 50));

    recordingState.value = "inactive";
    if (stream) stream.getTracks().forEach((t) => t.stop());

    const blob = concatenateChunks();
    if (blob.size === 0) {
      errorMessage.value = "El archivo de audio está vacío";
      state.value = "error";
      return;
    }

    lastBlob = blob;
    if (lastBlobUrl.value) URL.revokeObjectURL(lastBlobUrl.value);
    lastBlobUrl.value = URL.createObjectURL(blob);

    // No auto-send: user clicks "Enviar a transcripción" to trigger processAudio
  }

  // ── File upload ──────────────────────────────────────────────────────────────

  async function uploadAudioFile(file: File): Promise<void> {
    errorMessage.value = null;
    transcriptionResult.value = null;
    llmResult.value = null;

    lastBlob = file;
    if (lastBlobUrl.value) URL.revokeObjectURL(lastBlobUrl.value);
    lastBlobUrl.value = URL.createObjectURL(file);
  }

  async function sendToTranscription(): Promise<void> {
    if (!lastBlob || lastBlob.size === 0) {
      errorMessage.value = "No hay audio para transcribir";
      state.value = "error";
      return;
    }

    errorMessage.value = null;
    transcriptionResult.value = null;
    llmResult.value = null;

    await processAudio(lastBlob);
  }

  // ── Transcription processing ─────────────────────────────────────────────────

  async function processTranscription(transcript?: string): Promise<void> {
    const text = transcript ?? transcriptionResult.value?.transcript;

    if (!text || text.trim().length === 0) {
      errorMessage.value = "No hay transcripción para procesar";
      state.value = "error";
      return;
    }

    state.value = "analyzing";
    try {
      const id = reportId.value;
      const tplId = templateId.value;
      if (id === null || id === undefined || tplId === null || tplId === undefined) {
        throw new Error("Informe o plantilla no disponible");
      }
      llmResult.value = await extractUseCase.execute(id, text, tplId);
      state.value = "reviewing";
    } catch (e: any) {
      errorMessage.value = e.message || "Error al extraer datos del informe";
      state.value = "error";
    }
  }

  // ── Apply to form ────────────────────────────────────────────────────────────

  /** @deprecated Use AIReviewPanel + per-field setValue instead. */
  function applyToForm(form: { applyLLMResult: (data: Record<string, any>) => void }): void {
    if (!llmResult.value) return;

    form.applyLLMResult(llmResult.value.extracted_data);
    state.value = "done";
  }

  // ── Reset ─────────────────────────────────────────────────────────────────────

  function reset(): void {
    state.value = "idle";
    audioChunks.value = [];
    recordingState.value = "inactive";
    transcriptionResult.value = null;
    llmResult.value = null;
    errorMessage.value = null;
    if (lastBlobUrl.value) URL.revokeObjectURL(lastBlobUrl.value);
    lastBlobUrl.value = null;
    lastBlob = null;
    mediaRecorder = null;
    lastStream = null;
  }

  // ── Return ────────────────────────────────────────────────────────────────────

  return {
    state,
    audioChunks,
    recordingState,
    transcriptionResult,
    llmResult,
    errorMessage,
    lastBlobUrl,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    uploadAudioFile,
    sendToTranscription,
    processTranscription,
    applyToForm,
    reset,
  };
}
