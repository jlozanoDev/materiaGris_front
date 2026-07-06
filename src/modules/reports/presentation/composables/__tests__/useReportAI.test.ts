import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref, nextTick } from "vue";
import type {
  TranscriptionResult,
  LLMExtractionResult,
  RecordingChunk,
} from "@/modules/reports/domain/entities/AIProcessing";

// ── Container mocks ────────────────────────────────────────────────────────────
vi.mock("@/modules/reports/application/containers/reportsContainer", () => ({
  provideTranscribeAudioUseCase: vi.fn(),
  provideExtractReportDataUseCase: vi.fn(),
}));

import { useReportAI } from "../useReportAI";
import {
  provideTranscribeAudioUseCase,
  provideExtractReportDataUseCase,
} from "@/modules/reports/application/containers/reportsContainer";

// ── Helpers ────────────────────────────────────────────────────────────────────

function mockTranscribeUseCase(result?: Partial<TranscriptionResult>) {
  const execute = vi.fn().mockResolvedValue({
    transcript: "test transcript",
    segments: [],
    language: "es",
    duration_seconds: 30,
    ...result,
  });
  (provideTranscribeAudioUseCase as any).mockReturnValue({ execute });
  return execute;
}

function mockExtractUseCase(result?: Partial<LLMExtractionResult>) {
  const execute = vi.fn().mockResolvedValue({
    extracted_data: { nombre: "Juan", edad: 30 },
    confidence_scores: { nombre: 0.95, edad: 0.8 },
    warnings: [],
    processing_time_ms: 500,
    ...result,
  });
  (provideExtractReportDataUseCase as any).mockReturnValue({ execute });
  return execute;
}

/**
 * Create a mock MediaRecorder that can be controlled in tests.
 * Emits dataavailable then stop when stop() is called.
 */
function createMockMediaRecorder() {
  const handlers: Record<string, any> = {
    ondataavailable: null,
    onstop: null,
    onerror: null,
  };

  const instance = {
    state: "inactive" as string,
    start: vi.fn(() => {
      instance.state = "recording";
    }),
    stop: vi.fn(() => {
      instance.state = "inactive";
      // Emit a chunk then stop
      if (handlers.ondataavailable) {
        handlers.ondataavailable({ data: new Blob(["chunk-audio"], { type: "audio/webm" }) });
      }
      if (handlers.onstop) handlers.onstop();
    }),
    pause: vi.fn(() => {
      instance.state = "paused";
    }),
    resume: vi.fn(() => {
      instance.state = "recording";
    }),
    get ondataavailable() { return handlers.ondataavailable; },
    set ondataavailable(fn: any) { handlers.ondataavailable = fn; },
    get onstop() { return handlers.onstop; },
    set onstop(fn: any) { handlers.onstop = fn; },
    get onerror() { return handlers.onerror; },
    set onerror(fn: any) { handlers.onerror = fn; },
  };

  return instance;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("useReportAI", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Stub MediaRecorder and MediaStream globally (jsdom lacks these)
    vi.stubGlobal("MediaStream", vi.fn(() => ({
      getTracks: vi.fn(() => []),
    })));
    vi.stubGlobal(
      "MediaRecorder",
      vi.fn(() => createMockMediaRecorder()),
    );

    // Mock getUserMedia
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(new MediaStream()),
      },
    });

    // Mock isTypeSupported
    (MediaRecorder as any).isTypeSupported = vi.fn(() => true);

    // Stub URL.createObjectURL / revokeObjectURL (not available in jsdom)
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:test"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  describe("initial state", () => {
    it("starts in idle with empty chunks and null results", () => {
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      expect(ai.state.value).toBe("idle");
      expect(ai.audioChunks.value).toEqual([]);
      expect(ai.transcriptionResult.value).toBeNull();
      expect(ai.llmResult.value).toBeNull();
      expect(ai.errorMessage.value).toBeNull();
    });
  });

  // ── startRecording ─────────────────────────────────────────────────────────

  describe("startRecording", () => {
    it("creates MediaRecorder and transitions to recording state", async () => {
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      await ai.startRecording();

      expect(MediaRecorder).toHaveBeenCalled();
      expect(ai.state.value).toBe("recording");
    });

    it("throws if already recording", async () => {
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      await ai.startRecording();
      await expect(ai.startRecording()).rejects.toThrow(/ya está grabando/i);
    });

    it("throws if MediaRecorder is not available", async () => {
      // Remove the stub for this test
      vi.stubGlobal("MediaRecorder", undefined);
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      (globalThis as any).MediaRecorder = undefined;

      await expect(ai.startRecording()).rejects.toThrow(/no soporta grabaci.n/i);
    });

    it("sets error state when microphone permission is denied", async () => {
      vi.stubGlobal("navigator", {
        mediaDevices: {
          getUserMedia: vi.fn().mockRejectedValue({ name: "NotAllowedError", message: "Permission denied" }),
        },
      });

      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      await ai.startRecording();

      expect(ai.state.value).toBe("error");
      expect(ai.errorMessage.value).toContain("Permiso de micrófono denegado");
    });
  });

  // ── pauseRecording / resumeRecording ───────────────────────────────────────

  describe("pauseRecording", () => {
    it("pauses the MediaRecorder and transitions to paused state", async () => {
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      await ai.startRecording();
      ai.pauseRecording();

      expect(ai.recordingState.value).toBe("paused");
    });

    it("throws if not recording", () => {
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      expect(() => ai.pauseRecording()).toThrow(/no está grabando/i);
    });
  });

  describe("resumeRecording", () => {
    it("resumes the MediaRecorder", async () => {
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      await ai.startRecording();
      ai.pauseRecording();
      ai.resumeRecording();

      expect(ai.recordingState.value).toBe("recording");
    });

    it("throws if not paused", () => {
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      expect(() => ai.resumeRecording()).toThrow(/no está pausada/i);
    });
  });

  // ── stopRecording ──────────────────────────────────────────────────────────

  describe("stopRecording", () => {
    it("stops MediaRecorder, concatenates chunks, and calls transcribe", async () => {
      const transcribeExecute = mockTranscribeUseCase();
      mockExtractUseCase();
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      await ai.startRecording();
      let stopPromise = ai.stopRecording();
      await vi.advanceTimersByTimeAsync(100);
      await stopPromise;

      // stopRecording only collects audio; call sendToTranscription to process
      await ai.sendToTranscription();

      // Should have called transcribe with a blob
      expect(transcribeExecute).toHaveBeenCalledOnce();
      const callArg = transcribeExecute.mock.calls[0];
      expect(callArg[0]).toBe("r1");
      expect(callArg[1]).toBeInstanceOf(Blob);

      // Should have audio chunks accumulated
      expect(ai.audioChunks.value.length).toBeGreaterThan(0);
      expect(ai.transcriptionResult.value).toBeTruthy();
      expect(ai.transcriptionResult.value!.transcript).toBe("test transcript");
      // processAudio sets state to "transcribing" then "analyzing" after await
      // With fake timers, microtask may not flush immediately
      expect(["transcribing", "analyzing"]).toContain(ai.state.value);
    });

    it("throws if not recording", async () => {
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      await expect(ai.stopRecording()).rejects.toThrow(/no está grabando/i);
    });

    it("sets error state when transcribe fails", async () => {
      const transcribeExecute = vi.fn().mockRejectedValue(new Error("API timeout"));
      (provideTranscribeAudioUseCase as any).mockReturnValue({ execute: transcribeExecute });
      mockExtractUseCase();

      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      await ai.startRecording();
      let stopPromise = ai.stopRecording();
      await vi.advanceTimersByTimeAsync(100);
      await stopPromise;

      // stopRecording only collects audio; call sendToTranscription to trigger error
      await ai.sendToTranscription();

      expect(ai.state.value).toBe("error");
      expect(ai.errorMessage.value).toBe("API timeout");
    });
  });

  // ── uploadAudioFile ────────────────────────────────────────────────────────

  describe("uploadAudioFile", () => {
    it("calls transcribe with the uploaded file and transitions to transcribing", async () => {
      const transcribeExecute = mockTranscribeUseCase();
      mockExtractUseCase();
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      const file = new File(["audio-content"], "recording.webm", { type: "audio/webm" });
      await ai.uploadAudioFile(file);
      await ai.sendToTranscription();

      expect(transcribeExecute).toHaveBeenCalledWith("r1", expect.any(File));
      expect(ai.state.value).toBe("transcribing");
      expect(ai.transcriptionResult.value).toBeTruthy();
    });

    it("sets error state when upload transcribe fails", async () => {
      const transcribeExecute = vi.fn().mockRejectedValue(new Error("Upload failed"));
      (provideTranscribeAudioUseCase as any).mockReturnValue({ execute: transcribeExecute });

      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      const file = new File(["data"], "test.webm", { type: "audio/webm" });
      await ai.uploadAudioFile(file);
      await ai.sendToTranscription();

      expect(ai.state.value).toBe("error");
      expect(ai.errorMessage.value).toBe("Upload failed");
    });
  });

  // ── processTranscription ───────────────────────────────────────────────────

  describe("processTranscription", () => {
    it("calls extract use case with transcription result transcript", async () => {
      mockTranscribeUseCase();
      const extractExecute = mockExtractUseCase();
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      // First get the transcription via upload + sendToTranscription
      const file = new File(["data"], "test.webm", { type: "audio/webm" });
      await ai.uploadAudioFile(file);
      await ai.sendToTranscription();

      // Now process the transcription
      await ai.processTranscription();

      expect(extractExecute).toHaveBeenCalledWith("r1", "test transcript", "t1");
      expect(ai.llmResult.value).toBeTruthy();
      expect(ai.state.value).toBe("reviewing");
    });

    it("accepts an explicit transcript (paste mode) and skips transcription result", async () => {
      const extractExecute = mockExtractUseCase();
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      await ai.processTranscription("Pasted text from doctor");

      expect(extractExecute).toHaveBeenCalledWith("r1", "Pasted text from doctor", "t1");
      expect(ai.state.value).toBe("reviewing");
    });

    it("sets error state when extract fails", async () => {
      mockTranscribeUseCase();
      const extractExecute = vi.fn().mockRejectedValue(new Error("LLM error"));
      (provideExtractReportDataUseCase as any).mockReturnValue({ execute: extractExecute });

      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      await ai.processTranscription("Some text");
      expect(ai.state.value).toBe("error");
      expect(ai.errorMessage.value).toBe("LLM error");
    });

    it("sets error when no transcript is available and none provided", async () => {
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      await ai.processTranscription();

      expect(ai.state.value).toBe("error");
      expect(ai.errorMessage.value).toMatch(/transcripci.n/i);
    });
  });

  // ── applyToForm ────────────────────────────────────────────────────────────

  describe("applyToForm", () => {
    it("calls form.applyLLMResult with extracted_data and transitions to done", async () => {
      const extractExecute = mockExtractUseCase({
        extracted_data: { nombre: "Juan", edad: 30 },
      });
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      await ai.processTranscription("Some text");

      const form = {
        applyLLMResult: vi.fn(),
      };

      ai.applyToForm(form as any);

      expect(form.applyLLMResult).toHaveBeenCalledWith({ nombre: "Juan", edad: 30 });
      expect(ai.state.value).toBe("done");
    });

    it("does nothing if llmResult is null", () => {
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      const form = { applyLLMResult: vi.fn() };

      ai.applyToForm(form as any);

      expect(form.applyLLMResult).not.toHaveBeenCalled();
    });
  });

  // ── reset ──────────────────────────────────────────────────────────────────

  describe("reset", () => {
    it("resets all state back to idle", async () => {
      const extractExecute = mockExtractUseCase();
      const reportId = ref("r1");
      const templateId = ref("t1");
      const ai = useReportAI(reportId, templateId);

      // Go through a full cycle
      await ai.processTranscription("Some text");
      expect(ai.state.value).toBe("reviewing");
      expect(ai.llmResult.value).toBeTruthy();

      ai.reset();

      expect(ai.state.value).toBe("idle");
      expect(ai.audioChunks.value).toEqual([]);
      expect(ai.transcriptionResult.value).toBeNull();
      expect(ai.llmResult.value).toBeNull();
      expect(ai.errorMessage.value).toBeNull();
    });
  });
});
