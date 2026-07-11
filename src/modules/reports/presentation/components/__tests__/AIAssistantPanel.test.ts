import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import AIAssistantPanel from "../AIAssistantPanel.vue";

// Mock useReportAI
const mockState = ref("idle");
const mockRecordingState = ref("inactive");
const mockTranscriptionResult = ref<any>(null);
const mockLlmResult = ref<any>(null);
const mockErrorMessage = ref<string | null>(null);
const mockStartRecording = vi.fn();
const mockPauseRecording = vi.fn();
const mockResumeRecording = vi.fn();
const mockStopRecording = vi.fn();
const mockUploadAudioFile = vi.fn().mockResolvedValue(undefined);
const mockSendToTranscription = vi.fn().mockResolvedValue(undefined);
const mockProcessTranscription = vi.fn().mockResolvedValue(undefined);
const mockReset = vi.fn();

const mockLastBlobUrl = ref<string | null>(null);

const mockAudioChunks = ref<any[]>([]);

vi.mock("@/modules/reports/presentation/composables/useReportAI", () => ({
  useReportAI: vi.fn(() => ({
    state: mockState,
    audioChunks: mockAudioChunks,
    recordingState: mockRecordingState,
    transcriptionResult: mockTranscriptionResult,
    llmResult: mockLlmResult,
    errorMessage: mockErrorMessage,
    lastBlobUrl: mockLastBlobUrl,
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

// Mock AIReviewPanel to isolate tests
vi.mock("@/modules/reports/presentation/components/AIReviewPanel.vue", () => ({
  default: {
    name: "AIReviewPanel",
    template: '<div data-testid="ai-review-panel"><slot /></div>',
    props: ["llmResult", "fieldConfigs", "currentValues", "setValue"],
    emits: ["done"],
  },
}));

function createWrapper(reviewPanelProps?: {
  fieldConfigs?: any[];
  formValues?: Record<string, unknown>;
  formSetValue?: (key: string, value: unknown) => void;
}) {
  return mount(AIAssistantPanel, {
    props: {
      reportId: "r1",
      templateId: "t1",
      ...(reviewPanelProps ?? {}),
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockState.value = "idle";
  mockRecordingState.value = "inactive";
  mockTranscriptionResult.value = null;
  mockLlmResult.value = null;
  mockErrorMessage.value = null;
});

describe("AIAssistantPanel", () => {
  it("renders mode selector", () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent({ name: "AIInputSelector" }).exists()).toBe(true);
  });

  it("shows AudioRecorder when mode is record", () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent({ name: "AudioRecorder" }).exists()).toBe(true);
  });

  it("shows file upload when mode is upload", async () => {
    const wrapper = createWrapper();
    const selector = wrapper.findComponent({ name: "AIInputSelector" });
    await selector.vm.$emit("update:modelValue", "upload");
    await flushPromises();
    expect(wrapper.text()).toContain("Seleccionar archivo de audio");
  });

  it("shows AITextInput when mode is paste", async () => {
    const wrapper = createWrapper();
    const selector = wrapper.findComponent({ name: "AIInputSelector" });
    await selector.vm.$emit("update:modelValue", "paste");
    await flushPromises();
    expect(wrapper.findComponent({ name: "AITextInput" }).exists()).toBe(true);
  });

  it("calls startRecording when AudioRecorder emits start", () => {
    const wrapper = createWrapper();
    const recorder = wrapper.findComponent({ name: "AudioRecorder" });
    recorder.vm.$emit("start");
    expect(mockStartRecording).toHaveBeenCalled();
  });

  it("calls stopRecording when AudioRecorder emits stop", async () => {
    const wrapper = createWrapper();
    const recorder = wrapper.findComponent({ name: "AudioRecorder" });
    await recorder.vm.$emit("stop");
    await flushPromises();
    expect(mockStopRecording).toHaveBeenCalled();
  });

  it("shows transcription preview when in done state", async () => {
    mockState.value = "done";
    mockTranscriptionResult.value = {
      transcript: "Speakers...",
      segments: [
        { speaker: "Speaker 1", text: "Test", start: 0, end: 2 },
      ],
      language: "es",
      duration_seconds: 5,
    };
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.findComponent({ name: "AITranscriptionPreview" }).exists()).toBe(true);
  });

  it("shows apply button when in reviewing state without panel props", async () => {
    mockState.value = "reviewing";
    const wrapper = createWrapper();
    await flushPromises();
    const applyBtn = wrapper.findAll("button").find((b) => b.text().includes("Aplicar al informe"));
    expect(applyBtn).toBeDefined();
    expect(applyBtn?.exists()).toBe(true);
  });

  it("emits apply with LLM data when fallback apply button clicked", async () => {
    mockState.value = "reviewing";
    mockLlmResult.value = {
      extracted_data: { nombre: "Juan", edad: 30 },
      confidence_scores: {},
      warnings: [],
      processing_time_ms: 500,
    };
    const wrapper = createWrapper();
    await flushPromises();
    const applyBtn = wrapper.findAll("button").find((b) => b.text().includes("Aplicar al informe"));
    expect(applyBtn).toBeDefined();
    await applyBtn?.trigger("click");
    expect(wrapper.emitted("apply")).toHaveLength(1);
    expect(wrapper.emitted("apply")?.[0]).toEqual([{ nombre: "Juan", edad: 30 }]);
  });

  describe("reviewing state with AIReviewPanel props", () => {
    it("emits llm-result when entering reviewing state with panel props", async () => {
      mockState.value = "analyzing";
      mockLlmResult.value = {
        extracted_data: { diagnostico: "HTA" },
        confidence_scores: { diagnostico: 0.9 },
        warnings: [],
        processing_time_ms: 500,
      };
      const wrapper = createWrapper({
        fieldConfigs: [
          {
            id: "f1",
            key: "diagnostico",
            label: "Diagnóstico",
            type: "text",
            required: true,
            ai_help_description: "Diagnóstico principal",
          },
        ],
        formValues: { diagnostico: "" },
        formSetValue: vi.fn(),
      });
      await flushPromises();
      // Transition to reviewing to trigger the watch
      mockState.value = "reviewing";
      await flushPromises();
      expect(wrapper.emitted("llm-result")).toBeDefined();
      expect(wrapper.emitted("llm-result")?.[0]?.[0]).toEqual(mockLlmResult.value);
    });

    it("does NOT show the old apply button when panel props are present", async () => {
      mockState.value = "reviewing";
      mockLlmResult.value = {
        extracted_data: { diagnostico: "HTA" },
        confidence_scores: { diagnostico: 0.9 },
        warnings: [],
        processing_time_ms: 500,
      };
      const wrapper = createWrapper({
        fieldConfigs: [
          {
            id: "f1",
            key: "diagnostico",
            label: "Diagnóstico",
            type: "text",
            required: true,
            ai_help_description: "Diagnóstico principal",
          },
        ],
        formValues: { diagnostico: "" },
        formSetValue: vi.fn(),
      });
      await flushPromises();
      const applyBtn = wrapper.findAll("button").find((b) => b.text().includes("Aplicar al informe"));
      expect(applyBtn).toBeUndefined();
    });

    it("does not fire the 'apply' emit when AIReviewPanel is rendered", async () => {
      mockState.value = "reviewing";
      mockLlmResult.value = {
        extracted_data: { diagnostico: "HTA" },
        confidence_scores: { diagnostico: 0.9 },
        warnings: [],
        processing_time_ms: 500,
      };
      const wrapper = createWrapper({
        fieldConfigs: [],
        formValues: {},
        formSetValue: vi.fn(),
      });
      await flushPromises();
      expect(wrapper.emitted("apply")).toBeUndefined();
    });
  });

  it("shows reset button when not idle", () => {
    mockState.value = "recording";
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("Reiniciar");
  });

  it("calls reset when reset button clicked", async () => {
    mockState.value = "recording";
    const wrapper = createWrapper();
    const resetBtn = wrapper.findAll("button").find((b) => b.text().includes("Reiniciar"));
    if (resetBtn) {
      await resetBtn.trigger("click");
      expect(mockReset).toHaveBeenCalled();
    }
  });
});
