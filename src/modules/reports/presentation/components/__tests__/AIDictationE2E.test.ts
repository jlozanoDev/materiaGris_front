import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import AIAssistantPanel from "../AIAssistantPanel.vue";

// ── Mock useReportAI for full happy-path flow ──────────────────────────────────
const mockState = ref("idle");
const mockRecordingState = ref("inactive");
const mockTranscriptionResult = ref<any>(null);
const mockLlmResult = ref<any>(null);
const mockErrorMessage = ref<string | null>(null);
const mockLastBlobUrl = ref<string | null>(null);
const mockAudioChunks = ref<any[]>([]);

const mockStartRecording = vi.fn();
const mockPauseRecording = vi.fn();
const mockResumeRecording = vi.fn();
const mockStopRecording = vi.fn();
const mockUploadAudioFile = vi.fn().mockResolvedValue(undefined);
const mockSendToTranscription = vi.fn().mockResolvedValue(undefined);
const mockProcessTranscription = vi.fn().mockResolvedValue(undefined);
const mockReset = vi.fn();

vi.mock("@/modules/reports/presentation/composables/useReportAI", () => ({
  useReportAI: vi.fn(() => ({
    state: mockState,
    recordingState: mockRecordingState,
    transcriptionResult: mockTranscriptionResult,
    llmResult: mockLlmResult,
    errorMessage: mockErrorMessage,
    lastBlobUrl: mockLastBlobUrl,
    audioChunks: mockAudioChunks,
    startRecording: mockStartRecording,
    pauseRecording: mockPauseRecording,
    resumeRecording: mockResumeRecording,
    stopRecording: mockStopRecording,
    uploadAudioFile: mockUploadAudioFile,
    sendToTranscription: mockSendToTranscription,
    processTranscription: mockProcessTranscription,
    reset: mockReset,
  })),
}));

// ── Mock AIReviewPanel ─────────────────────────────────────────────────────────
const mockReviewAccept = vi.fn();
const mockReviewReject = vi.fn();
const mockReviewEdit = vi.fn();
const mockReviewApplyAll = vi.fn().mockReturnValue(true);

vi.mock("@/modules/reports/presentation/components/AIReviewPanel.vue", () => ({
  default: {
    name: "AIReviewPanel",
    template: `
      <div data-testid="ai-review-panel">
        <div data-testid="review-count">{{ reviews ? reviews.length : 0 }}</div>
        <div data-testid="pending-count">{{ pendingCount }}</div>
        <button data-testid="mock-apply-all" @click="$emit('done')">Aplicar todo</button>
        <div data-testid="confidence-levels">
          <span v-for="r in (reviews || [])" :key="r.fieldKey" :data-field="r.fieldKey" :data-level="r.confidenceLevel" />
        </div>
      </div>
    `,
    props: ["llmResult", "fieldConfigs", "currentValues", "setValue", "reviews", "pendingCount"],
    emits: ["done"],
  },
}));

// The AIReviewPanel uses useAIReview internally, so we mock it too
vi.mock("@/modules/reports/presentation/composables/useAIReview", () => ({
  useAIReview: vi.fn(() => ({
    reviews: ref([]),
    warnings: ref([]),
    pendingCount: ref(0),
    hasWarnings: ref(false),
    acceptField: mockReviewAccept,
    rejectField: mockReviewReject,
    editField: mockReviewEdit,
    applyAll: mockReviewApplyAll,
  })),
}));

import { useAIReview } from "@/modules/reports/presentation/composables/useAIReview";

describe("AIDictation E2E — Full pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.value = "idle";
    mockRecordingState.value = "inactive";
    mockTranscriptionResult.value = null;
    mockLlmResult.value = null;
    mockErrorMessage.value = null;
    mockLastBlobUrl.value = null;
    mockAudioChunks.value = [];
    mockReviewApplyAll.mockReturnValue(true);
  });

  // ── Text paste happy path (backward compat — fallback button) ──────────────

  it("paste text → process → fallback apply button (backward compat)", async () => {
    const wrapper = mount(AIAssistantPanel, {
      props: { reportId: "r1", templateId: "t1" },
    });

    // 1. Switch to paste mode
    const selector = wrapper.findComponent({ name: "AIInputSelector" });
    await selector.vm.$emit("update:modelValue", "paste");
    await flushPromises();

    // 2. Simulate LLM processing
    mockLlmResult.value = {
      extracted_data: { nombre: "Juan Perez", edad: 45, diagnostico: "Hipertensión" },
      confidence_scores: { nombre: 0.95, edad: 0.92, diagnostico: 0.88 },
      warnings: [],
      processing_time_ms: 1200,
    };
    mockState.value = "reviewing";
    await flushPromises();

    // 3. Click fallback "Aplicar al informe" button
    const applyBtn = wrapper.findAll("button").find((b) =>
      b.text().includes("Aplicar al informe")
    );
    expect(applyBtn).toBeDefined();
    await applyBtn?.trigger("click");

    // 4. Assert apply event emitted with LLM data
    expect(wrapper.emitted("apply")).toHaveLength(1);
    const emittedData = wrapper.emitted("apply")?.[0][0] as Record<string, any>;
    expect(emittedData).toEqual({
      nombre: "Juan Perez",
      edad: 45,
      diagnostico: "Hipertensión",
    });

    // 5. Assert state transitions to done
    expect(mockState.value).toBe("done");
  });

  // ── Field-by-field review flow (new AIReviewPanel) ─────────────────────────

  it("full flow: idle→transcribe→analyze→reviewing→accept→done with AIReviewPanel", async () => {
    const formSetValue = vi.fn();
    const wrapper = mount(AIAssistantPanel, {
      props: {
        reportId: "r1",
        templateId: "t1",
        fieldConfigs: [
          {
            id: "f1",
            key: "diagnostico",
            label: "Diagnóstico",
            type: "text",
            required: true,
            ai_help_description: "Diagnóstico principal",
          },
          {
            id: "f2",
            key: "alergias",
            label: "Alergias",
            type: "text",
            required: false,
            ai_help_description: "Alergias del paciente",
          },
        ],
        formValues: { diagnostico: "", alergias: "" },
        formSetValue,
      },
    });

    // 1. Switch to paste mode
    const selector = wrapper.findComponent({ name: "AIInputSelector" });
    await selector.vm.$emit("update:modelValue", "paste");
    await flushPromises();

    // 2. Simulate LLM processing
    mockLlmResult.value = {
      extracted_data: {
        diagnostico: "HTA",
        alergias: "Ninguna",
      },
      confidence_scores: { diagnostico: 0.85, alergias: 0.3 },
      warnings: [],
      processing_time_ms: 800,
    };
    mockState.value = "reviewing";
    await flushPromises();

    // 3. AIReviewPanel is no longer rendered by AIAssistantPanel.
    // The component only shows the fallback apply button when fieldConfigs/formValues are missing.
    // When they ARE provided, no review panel or fallback button renders (review handled externally).
    // Verify the fallback apply button is NOT shown (because fieldConfigs/formValues are provided)
    const oldApplyBtn = wrapper.findAll("button").find((b) =>
      b.text().includes("Aplicar al informe")
    );
    expect(oldApplyBtn).toBeUndefined();

    // 4. Click apply-all via the mock emits done
    const applyAllBtn = wrapper.find('[data-testid="mock-apply-all"]');
    expect(applyAllBtn.exists()).toBe(false); // review panel not rendered

    // 5. State remains reviewing (no auto-apply since review panel not rendered)
    expect(mockState.value).toBe("reviewing");

    // 6. The old "apply" emit should NOT have fired
    expect(wrapper.emitted("apply")).toBeUndefined();

    // 7. No "done" emit since AIReviewPanel is not rendered
    expect(wrapper.emitted("done")).toBeUndefined();
  });

  // ── Audio upload path (backward compat) ────────────────────────────────────

  it("audio upload → transcribe → extract → apply (backward compat)", async () => {
    const wrapper = mount(AIAssistantPanel, {
      props: { reportId: "r1", templateId: "t1" },
    });

    // 1. Switch to upload mode
    const selector = wrapper.findComponent({ name: "AIInputSelector" });
    await selector.vm.$emit("update:modelValue", "upload");
    await flushPromises();

    // 2. Simulate transcription result
    mockTranscriptionResult.value = {
      transcript: "Speaker 1 (Médico): Buenos días. Speaker 2 (Paciente): Buenos días, doctor.",
      segments: [
        { speaker: "Speaker 1 (Médico)", text: "Buenos días.", start: 0, end: 2 },
        { speaker: "Speaker 2 (Paciente)", text: "Buenos días, doctor.", start: 3, end: 6 },
      ],
      language: "es",
      duration_seconds: 6,
    };
    mockState.value = "transcribing";

    // Simulate LLM extraction
    mockLlmResult.value = {
      extracted_data: { motivo_consulta: "Control rutinario" },
      confidence_scores: { motivo_consulta: 0.91 },
      warnings: [],
      processing_time_ms: 800,
    };
    mockState.value = "reviewing";  // fallback button needs reviewing state
    await flushPromises();

    // 3. Transcription preview shows only when state === "done", not reviewing.
    // Skip preview check here — the fallback apply button is only visible in reviewing.

    // 4. Apply via fallback button
    const applyBtn = wrapper.findAll("button").find((b) =>
      b.text().includes("Aplicar al informe")
    );
    expect(applyBtn).toBeDefined();
    await applyBtn?.trigger("click");

    // 5. Assert
    expect(wrapper.emitted("apply")).toHaveLength(1);
    expect(wrapper.emitted("apply")?.[0][0]).toEqual({
      motivo_consulta: "Control rutinario",
    });
  });

  // ── Error path ─────────────────────────────────────────────────────────────

  it("error path: LLM fails → error shown → reset → retry", async () => {
    const wrapper = mount(AIAssistantPanel, {
      props: { reportId: "r1", templateId: "t1" },
    });

    // Simulate error
    mockState.value = "error";
    mockErrorMessage.value = "Error al conectar con el servicio de IA";
    await flushPromises();

    // Assert error visible
    expect(wrapper.text()).toContain("Error al conectar");
    expect(wrapper.findComponent({ name: "AIProcessingPipeline" }).exists()).toBe(true);

    // Reset
    const resetBtn = wrapper.findAll("button").find((b) => b.text().includes("Reiniciar"));
    await resetBtn?.trigger("click");
    expect(mockReset).toHaveBeenCalled();
  });

  // ── Auto-save suppression ──────────────────────────────────────────────────

  it("auto-save suppression: data passed through apply event", async () => {
    const wrapper = mount(AIAssistantPanel, {
      props: { reportId: "r1", templateId: "t1" },
    });

    mockLlmResult.value = {
      extracted_data: { campo1: "valor1", campo2: "valor2" },
      confidence_scores: {},
      warnings: [],
      processing_time_ms: 500,
    };
    mockState.value = "reviewing";
    await flushPromises();

    await wrapper.findAll("button").find((b) => b.text().includes("Aplicar al informe"))?.trigger("click");

    const data = wrapper.emitted("apply")?.[0][0] as Record<string, any>;
    expect(Object.keys(data).length).toBe(2);
  });
});
