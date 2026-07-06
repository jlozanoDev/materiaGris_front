import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import AIReviewPanel from "../AIReviewPanel.vue";
import type { LLMExtractionResult } from "@/modules/reports/domain/entities/AIProcessing";
import type { FieldConfig } from "@/shared/types";

// ── Mock useAIReview ───────────────────────────────────────────────────────────

const mockReviews = ref<any[]>([]);
const mockWarnings = ref<string[]>([]);
const mockPendingCount = ref(0);
const mockHasWarnings = ref(false);
const mockAcceptField = vi.fn();
const mockRejectField = vi.fn();
const mockEditField = vi.fn();
const mockApplyAll = vi.fn().mockReturnValue(true);

vi.mock("@/modules/reports/presentation/composables/useAIReview", () => ({
  useAIReview: vi.fn(() => ({
    reviews: mockReviews,
    warnings: mockWarnings,
    pendingCount: mockPendingCount,
    hasWarnings: mockHasWarnings,
    acceptField: mockAcceptField,
    rejectField: mockRejectField,
    editField: mockEditField,
    applyAll: mockApplyAll,
  })),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

const defaultLlmResult = ref<LLMExtractionResult | null>({
  extracted_data: { diagnostico: "HTA", alergias: "Ninguna" },
  confidence_scores: { diagnostico: 0.85, alergias: 0.3 },
  warnings: [],
  processing_time_ms: 500,
});

const defaultFieldConfigs = ref<FieldConfig[]>([
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
]);

const defaultValues = ref<Record<string, unknown>>({
  diagnostico: "",
  alergias: "",
});

const defaultSetValue = vi.fn();

function createWrapper() {
  return mount(AIReviewPanel, {
    props: {
      llmResult: defaultLlmResult.value,
      fieldConfigs: defaultFieldConfigs.value,
      currentValues: defaultValues.value,
      setValue: defaultSetValue,
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockReviews.value = [];
  mockWarnings.value = [];
  mockPendingCount.value = 0;
  mockHasWarnings.value = false;
  mockApplyAll.mockReturnValue(true);
});

describe("AIReviewPanel", () => {
  it("renders AIReviewField components for each review entry", () => {
    mockReviews.value = [
      {
        fieldKey: "diagnostico",
        fieldLabel: "Diagnóstico",
        fieldType: "text",
        currentValue: "",
        proposedValue: "HTA",
        confidence: 0.85,
        confidenceLevel: "high",
        action: "pending",
      },
      {
        fieldKey: "alergias",
        fieldLabel: "Alergias",
        fieldType: "text",
        currentValue: "",
        proposedValue: "Ninguna",
        confidence: 0.3,
        confidenceLevel: "low",
        action: "pending",
      },
    ];
    mockPendingCount.value = 2;

    const wrapper = createWrapper();
    const fields = wrapper.findAllComponents({ name: "AIReviewField" });
    expect(fields).toHaveLength(2);
  });

  describe("warnings", () => {
    it("shows warning section when hasWarnings is true", () => {
      mockWarnings.value = ["Campo 'medicacion' no encontrado en plantilla"];
      mockHasWarnings.value = true;

      const wrapper = createWrapper();
      expect(wrapper.text()).toContain("Advertencias");
      expect(wrapper.text()).toContain(
        "Campo 'medicacion' no encontrado en plantilla",
      );
    });

    it("does not show warning section when hasWarnings is false", () => {
      mockWarnings.value = [];
      mockHasWarnings.value = false;

      const wrapper = createWrapper();
      expect(wrapper.text()).not.toContain("Advertencias");
    });
  });

  describe("Apply All button", () => {
    it("renders Apply All button", () => {
      mockReviews.value = [
        {
          fieldKey: "diagnostico",
          fieldLabel: "Diagnóstico",
          fieldType: "text",
          currentValue: "",
          proposedValue: "HTA",
          confidence: 0.85,
          confidenceLevel: "high",
          action: "pending",
        },
      ];
      mockPendingCount.value = 1;

      const wrapper = createWrapper();
      const applyBtn = wrapper.findAll("button").find((b) =>
        b.text().includes("Aplicar todo"),
      );
      expect(applyBtn).toBeDefined();
    });

    it("calls applyAll and emits done when Apply All is clicked", async () => {
      mockReviews.value = [
        {
          fieldKey: "diagnostico",
          fieldLabel: "Diagnóstico",
          fieldType: "text",
          currentValue: "",
          proposedValue: "HTA",
          confidence: 0.85,
          confidenceLevel: "high",
          action: "accepted",
        },
      ];
      mockWarnings.value = [];
      mockHasWarnings.value = false;
      mockPendingCount.value = 0;

      const wrapper = createWrapper();
      const applyBtn = wrapper.findAll("button").find((b) =>
        b.text().includes("Aplicar todo"),
      );
      expect(applyBtn).toBeDefined();
      await applyBtn!.trigger("click");

      expect(mockApplyAll).toHaveBeenCalled();
      expect(wrapper.emitted("done")).toHaveLength(1);
    });

    it("does not render Apply All when reviews is empty", () => {
      mockReviews.value = [];
      mockPendingCount.value = 0;

      const wrapper = createWrapper();
      const applyBtn = wrapper.findAll("button").find((b) =>
        b.text().includes("Aplicar todo"),
      );
      expect(applyBtn).toBeUndefined();
    });
  });

  describe("empty state", () => {
    it("shows empty state message when reviews is empty", () => {
      mockReviews.value = [];

      const wrapper = createWrapper();
      expect(wrapper.text()).toContain(
        "No se encontraron campos para revisar",
      );
    });

    it("does not show empty state when there are reviews", () => {
      mockReviews.value = [
        {
          fieldKey: "diagnostico",
          fieldLabel: "Diagnóstico",
          fieldType: "text",
          currentValue: "",
          proposedValue: "HTA",
          confidence: 0.85,
          confidenceLevel: "high",
          action: "pending",
        },
      ];
      mockPendingCount.value = 1;

      const wrapper = createWrapper();
      expect(wrapper.text()).not.toContain(
        "No se encontraron campos para revisar",
      );
    });
  });
});
