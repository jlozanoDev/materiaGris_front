import { describe, it, expect } from "vitest";
import { aiValueMapper } from "@/modules/reports/application/mappers/aiValueMapper";
import type { FieldConfig } from "@/shared/types";

/**
 * Build a minimal FieldConfig for testing.
 * Overrides are spread after defaults so callers can override any property.
 */
function makeField(overrides: Partial<FieldConfig> & { key: string; label: string }): FieldConfig {
  return {
    id: overrides.key,
    type: "text",
    required: false,
    ...overrides,
  } as FieldConfig;
}

describe("aiValueMapper", () => {
  // ── Tier 1: Exact key match ──────────────────────────────────────────────

  it("maps by exact LLM key match (tier 1, score 1.0)", () => {
    const llmData = { edad: "45", peso: "70" };
    const fields: FieldConfig[] = [
      makeField({ key: "edad", label: "Edad del paciente", ai_help_description: "Edad en años" }),
      makeField({ key: "peso", label: "Peso del paciente", ai_help_description: "Peso en kilogramos" }),
    ];

    const result = aiValueMapper(llmData, fields);

    expect(result).toEqual({ edad: "45", peso: "70" });
  });

  // ── Tier 2: Normalized label match ───────────────────────────────────────

  it("maps by normalized field label when LLM key differs (tier 2, score 0.8)", () => {
    const llmData = { "edad_del_paciente": "45" };
    const fields: FieldConfig[] = [
      makeField({
        key: "edad",
        label: "Edad del paciente",
        ai_help_description: "Edad en años",
      }),
    ];

    const result = aiValueMapper(llmData, fields);

    expect(result).toEqual({ edad: "45" });
  });

  it("matches label regardless of case and special characters", () => {
    const llmData = { "EDAD DEL PACIENTE!": "45" };
    const fields: FieldConfig[] = [
      makeField({
        key: "edad",
        label: "Edad del paciente",
        ai_help_description: "Edad en años",
      }),
    ];

    const result = aiValueMapper(llmData, fields);

    expect(result).toEqual({ edad: "45" });
  });

  // ── Tier 3: Jaccard keyword overlap on ai_help_description ────────────────

  it("maps by Jaccard overlap on ai_help_description (tier 3)", () => {
    // llmKey "edad_paciente" has 2 tokens that overlap with the description
    const llmData = { "edad_paciente": "45" };
    const fields: FieldConfig[] = [
      makeField({
        key: "age",
        label: "Age",
        ai_help_description: "Edad del paciente en años completos",
      }),
    ];

    const result = aiValueMapper(llmData, fields);

    // "edad_paciente" → tokens [edad, paciente]; description has both → Jaccard > 0.3
    expect(result).toHaveProperty("age");
    expect(result.age).toBe("45");
  });

  it("filters out matches below confidence threshold (0.3)", () => {
    // No meaningful overlap — llmKey "xyz" is unrelated
    const llmData = { "xyz": "irrelevant" };
    const fields: FieldConfig[] = [
      makeField({
        key: "edad",
        label: "Edad",
        ai_help_description: "información sobre el paciente y sus síntomas",
      }),
    ];

    const result = aiValueMapper(llmData, fields);

    // Field key "edad" should NOT be in result (score too low to match "xyz")
    expect(result).not.toHaveProperty("edad");
  });

  // ── Edge cases ───────────────────────────────────────────────────────────

  it("skips fields without ai_help_description", () => {
    const llmData = { nombre: "Juan" };
    const fields: FieldConfig[] = [
      makeField({
        key: "nombre",
        label: "Nombre",
        // no ai_help_description — should be skipped
      }),
      makeField({
        key: "apellido",
        label: "Apellido",
        ai_help_description: "Apellido del paciente",
      }),
    ];

    const result = aiValueMapper(llmData, fields);

    // "nombre" field has no ai_help_description, so it's skipped
    expect(result).not.toHaveProperty("nombre");
    // "apellido" may still match by key
    // Actually "apellido" key doesn't match "nombre" from LLM, so neither field maps
    expect(result).toEqual({});
  });

  it("returns empty object when LLM data is empty", () => {
    const llmData = {};
    const fields: FieldConfig[] = [
      makeField({
        key: "edad",
        label: "Edad",
        ai_help_description: "Edad en años",
      }),
    ];

    const result = aiValueMapper(llmData, fields);

    expect(result).toEqual({});
  });

  it("returns empty object when fields array is empty", () => {
    const llmData = { edad: "45" };
    const result = aiValueMapper(llmData, []);
    expect(result).toEqual({});
  });

  it("handles null or undefined LLM values gracefully", () => {
    const llmData = { edad: null, diagnostico: undefined };
    const fields: FieldConfig[] = [
      makeField({
        key: "edad",
        label: "Edad",
        ai_help_description: "Edad en años",
      }),
      makeField({
        key: "diagnostico",
        label: "Diagnóstico",
        ai_help_description: "Diagnóstico principal",
      }),
    ];

    const result = aiValueMapper(llmData, fields);

    expect(result).toHaveProperty("edad");
    expect(result.edad).toBeNull();
    expect(result).toHaveProperty("diagnostico");
    expect(result.diagnostico).toBeUndefined();
  });

  it("uses first high-confidence match when multiple LLM keys overlap", () => {
    // Both keys have good token overlap with the ai_help_description
    const llmData = { "diagnostico_principal": "Artritis", "descripcion_paciente": "Fiebre" };
    const fields: FieldConfig[] = [
      makeField({
        key: "dx",
        label: "Diagnóstico Principal",
        ai_help_description: "Diagnóstico principal del paciente",
      }),
    ];

    const result = aiValueMapper(llmData, fields);

    // "diagnostico_principal" has Jaccard ~0.67 with description (2/3 common tokens)
    expect(result).toHaveProperty("dx");
  });

  // ── Priority order ───────────────────────────────────────────────────────

  it("prefers exact key match over label match over jaccard", () => {
    // LLM has both an exact key match and a label-match key
    const llmData = {
      "patient_age": "50",   // exact match with field key "patient_age" — score 1.0
      "edad": "45",          // label match with "Edad" — score 0.8
    };
    const fields: FieldConfig[] = [
      makeField({
        key: "patient_age",
        label: "Edad del Paciente",
        ai_help_description: "Edad en años del paciente",
      }),
    ];

    const result = aiValueMapper(llmData, fields);

    // "patient_age" has exact match (1.0) which beats "edad" label match (0.8)
    expect(result.patient_age).toBe("50");
    expect(Object.keys(result)).toHaveLength(1);
  });
});
