import { describe, it, expect, vi } from "vitest";
import { ref, computed } from "vue";
import type { LLMExtractionResult } from "@/modules/reports/domain/entities/AIProcessing";
import type { FieldConfig } from "@/shared/types";
import { useAIReview } from "../useAIReview";

// ── Helpers ────────────────────────────────────────────────────────────────────

function createLlmResult(overrides?: Partial<LLMExtractionResult>) {
  return ref<LLMExtractionResult | null>({
    extracted_data: { diagnostico: "HTA", alergias: "Ninguna", peso: 70 },
    confidence_scores: { diagnostico: 0.85, alergias: 0.3, peso: 0.72 },
    warnings: [],
    processing_time_ms: 500,
    ...overrides,
  });
}

function createFieldConfigs(
  overrides?: Partial<FieldConfig>[],
): FieldConfig[] {
  const defaults: FieldConfig[] = [
    {
      id: "f1",
      key: "diagnostico",
      label: "Diagnóstico",
      type: "text",
      required: true,
      ai_help_description: "Diagnóstico principal del paciente",
    },
    {
      id: "f2",
      key: "alergias",
      label: "Alergias",
      type: "text",
      required: false,
      ai_help_description: "Alergias del paciente",
    },
    {
      id: "f3",
      key: "peso",
      label: "Peso",
      type: "number",
      required: false,
      ai_help_description: "Peso del paciente en kg",
    },
  ];
  if (overrides) {
    return defaults.map((f, i) => ({ ...f, ...overrides[i] })) as FieldConfig[];
  }
  return defaults;
}

function createCurrentValues() {
  return ref<Record<string, unknown>>({
    diagnostico: "",
    alergias: "",
    peso: "",
  });
}

describe("useAIReview", () => {
  // ── Confidence thresholds ──────────────────────────────────────────────────

  describe("confidence level computation", () => {
    it('returns "high" (green) for scores >= 0.8', () => {
      const llmResult = createLlmResult({
        confidence_scores: { diagnostico: 0.8, alergias: 0.92, peso: 0.85 },
      });
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { reviews } = useAIReview(llmResult, configs, values, setValue);

      expect(reviews.value.find((r) => r.fieldKey === "diagnostico")?.confidenceLevel).toBe("high");
      expect(reviews.value.find((r) => r.fieldKey === "alergias")?.confidenceLevel).toBe("high");
      expect(reviews.value.find((r) => r.fieldKey === "peso")?.confidenceLevel).toBe("high");
    });

    it('returns "medium" (amber) for scores >= 0.5 and < 0.8', () => {
      const llmResult = createLlmResult({
        confidence_scores: { diagnostico: 0.5, alergias: 0.67, peso: 0.79 },
      });
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { reviews } = useAIReview(llmResult, configs, values, setValue);

      expect(reviews.value.find((r) => r.fieldKey === "diagnostico")?.confidenceLevel).toBe("medium");
      expect(reviews.value.find((r) => r.fieldKey === "alergias")?.confidenceLevel).toBe("medium");
      expect(reviews.value.find((r) => r.fieldKey === "peso")?.confidenceLevel).toBe("medium");
    });

    it('returns "low" (red) for scores < 0.5', () => {
      const llmResult = createLlmResult({
        confidence_scores: { diagnostico: 0.0, alergias: 0.49, peso: 0.01 },
      });
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { reviews } = useAIReview(llmResult, configs, values, setValue);

      expect(reviews.value.find((r) => r.fieldKey === "diagnostico")?.confidenceLevel).toBe("low");
      expect(reviews.value.find((r) => r.fieldKey === "alergias")?.confidenceLevel).toBe("low");
      expect(reviews.value.find((r) => r.fieldKey === "peso")?.confidenceLevel).toBe("low");
    });

    it("defaults to 0.5 (medium) when confidence_scores key is missing", () => {
      const llmResult = createLlmResult({
        confidence_scores: { diagnostico: 0.92 },
      });
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { reviews } = useAIReview(llmResult, configs, values, setValue);

      // motivo_consulta doesn't exist in confidence_scores → defaults to 0.5 → medium
      const alergias = reviews.value.find((r) => r.fieldKey === "alergias");
      expect(alergias?.confidence).toBe(0.5);
      expect(alergias?.confidenceLevel).toBe("medium");
    });
  });

  // ── acceptField / rejectField / editField ──────────────────────────────────

  describe("acceptField", () => {
    it("sets action to accepted and calls setValue with proposed value", () => {
      const llmResult = createLlmResult();
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { reviews, acceptField } = useAIReview(llmResult, configs, values, setValue);

      acceptField("diagnostico");

      const field = reviews.value.find((r) => r.fieldKey === "diagnostico");
      expect(field?.action).toBe("accepted");
      expect(setValue).toHaveBeenCalledWith("diagnostico", "HTA");
    });
  });

  describe("rejectField", () => {
    it("sets action to rejected and does NOT call setValue", () => {
      const llmResult = createLlmResult();
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { reviews, rejectField } = useAIReview(llmResult, configs, values, setValue);

      rejectField("diagnostico");

      const field = reviews.value.find((r) => r.fieldKey === "diagnostico");
      expect(field?.action).toBe("rejected");
      expect(setValue).not.toHaveBeenCalled();
    });
  });

  describe("editField", () => {
    it("sets action to edited, stores editedValue, and calls setValue", () => {
      const llmResult = createLlmResult();
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { reviews, editField } = useAIReview(llmResult, configs, values, setValue);

      editField("peso", 70.5);

      const field = reviews.value.find((r) => r.fieldKey === "peso");
      expect(field?.action).toBe("edited");
      expect(field?.editedValue).toBe(70.5);
      expect(setValue).toHaveBeenCalledWith("peso", 70.5);
    });
  });

  // ── applyAll ───────────────────────────────────────────────────────────────

  describe("applyAll", () => {
    it("applies pending and accepted fields, calls setValue, returns true", () => {
      const llmResult = createLlmResult();
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { reviews, acceptField, rejectField, applyAll } = useAIReview(
        llmResult,
        configs,
        values,
        setValue,
      );

      // Accept diagnostico, reject alergias, keep peso pending
      acceptField("diagnostico");
      rejectField("alergias");

      const result = applyAll();

      // applyAll should call setValue for accepted (diagnostico) and pending (peso)
      expect(result).toBe(true);
      expect(setValue).toHaveBeenCalledWith("diagnostico", "HTA");
      expect(setValue).toHaveBeenCalledWith("peso", 70);
      // Should NOT call for rejected
      expect(setValue).not.toHaveBeenCalledWith("alergias", "Ninguna");
    });

    it("does nothing when all fields are rejected, still returns true", () => {
      const llmResult = createLlmResult();
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { reviews, rejectField, applyAll } = useAIReview(
        llmResult,
        configs,
        values,
        setValue,
      );

      rejectField("diagnostico");
      rejectField("alergias");
      rejectField("peso");

      const result = applyAll();

      expect(result).toBe(true);
      expect(setValue).not.toHaveBeenCalled();
    });

    it("preserves edited fields without overwriting them with proposedValue", () => {
      const llmResult = createLlmResult();
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { editField, applyAll } = useAIReview(
        llmResult,
        configs,
        values,
        setValue,
      );

      // User edits "peso" to 72.5 before applyAll
      editField("peso", 72.5);
      // Clear setValue calls so we only track applyAll writes
      setValue.mockClear();

      const result = applyAll();

      expect(result).toBe(true);
      // Edited field must NOT be overwritten
      expect(setValue).not.toHaveBeenCalledWith("peso", 70); // proposedValue
      expect(setValue).not.toHaveBeenCalledWith("peso", 72.5); // editedValue
      // Pending fields (diagnostico, alergias) should still be applied
      expect(setValue).toHaveBeenCalledWith("diagnostico", "HTA");
      expect(setValue).toHaveBeenCalledWith("alergias", "Ninguna");
    });
  });

  // ── Pending count ──────────────────────────────────────────────────────────

  describe("pendingCount", () => {
    it("starts with count equal to number of fields", () => {
      const llmResult = createLlmResult();
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { pendingCount, reviews } = useAIReview(llmResult, configs, values, setValue);

      expect(pendingCount.value).toBe(reviews.value.length);
    });

    it("decrements when a field is accepted or rejected", () => {
      const llmResult = createLlmResult();
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { pendingCount, acceptField, rejectField } = useAIReview(
        llmResult,
        configs,
        values,
        setValue,
      );

      acceptField("diagnostico");
      expect(pendingCount.value).toBe(2);

      rejectField("alergias");
      expect(pendingCount.value).toBe(1);
    });
  });

  // ── Empty extracted_data ───────────────────────────────────────────────────

  describe("empty extracted_data", () => {
    it("returns empty reviews array when extracted_data is empty", () => {
      const llmResult = createLlmResult({
        extracted_data: {},
        confidence_scores: {},
      });
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { reviews } = useAIReview(llmResult, configs, values, setValue);

      expect(reviews.value).toEqual([]);
    });
  });

  // ── Filter by ai_help_description ──────────────────────────────────────────

  describe("field filtering", () => {
    it("only includes fields with ai_help_description", () => {
      const llmResult = ref<LLMExtractionResult | null>({
        extracted_data: { nombre: "Juan Perez" },
        confidence_scores: { nombre: 0.95 },
        warnings: [],
        processing_time_ms: 500,
      });
      const configs = ref<FieldConfig[]>([
        {
          id: "f1",
          key: "nombre",
          label: "Nombre",
          type: "text",
          required: true,
          ai_help_description: "Nombre del paciente",
        },
        {
          id: "f2",
          key: "separator",
          label: "---",
          type: "horizontal_separator",
          required: false,
          // No ai_help_description — should be excluded
        },
      ]);
      const values = ref<Record<string, unknown>>({ nombre: "" });
      const setValue = vi.fn();

      const { reviews } = useAIReview(llmResult, configs, values, setValue);

      expect(reviews.value).toHaveLength(1);
      expect(reviews.value[0].fieldKey).toBe("nombre");
    });
  });

  // ── Current values ─────────────────────────────────────────────────────────

  describe("current values in reviews", () => {
    it("uses currentValues from the ref for each field", () => {
      const llmResult = createLlmResult();
      const configs = ref(createFieldConfigs());
      const values = ref<Record<string, unknown>>({
        diagnostico: "Paciente existente",
        alergias: "Penicilina",
        peso: 80,
      });
      const setValue = vi.fn();

      const { reviews } = useAIReview(llmResult, configs, values, setValue);

      expect(reviews.value.find((r) => r.fieldKey === "diagnostico")?.currentValue).toBe(
        "Paciente existente",
      );
      expect(reviews.value.find((r) => r.fieldKey === "alergias")?.currentValue).toBe("Penicilina");
      expect(reviews.value.find((r) => r.fieldKey === "peso")?.currentValue).toBe(80);
    });
  });

  // ── Warnings ───────────────────────────────────────────────────────────────

  describe("warnings", () => {
    it("returns warnings from llmResult", () => {
      const llmResult = createLlmResult({
        warnings: ["Campo 'medicacion' no encontrado en plantilla"],
      });
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { warnings, hasWarnings } = useAIReview(llmResult, configs, values, setValue);

      expect(warnings.value).toEqual(["Campo 'medicacion' no encontrado en plantilla"]);
      expect(hasWarnings.value).toBe(true);
    });

    it("hasWarnings is false when warnings array is empty", () => {
      const llmResult = createLlmResult({ warnings: [] });
      const configs = ref(createFieldConfigs());
      const values = createCurrentValues();
      const setValue = vi.fn();

      const { warnings, hasWarnings } = useAIReview(llmResult, configs, values, setValue);

      expect(warnings.value).toEqual([]);
      expect(hasWarnings.value).toBe(false);
    });
  });
});
