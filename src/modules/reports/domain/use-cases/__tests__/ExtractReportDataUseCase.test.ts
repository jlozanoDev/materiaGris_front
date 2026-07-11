import { describe, it, expect, vi } from "vitest";
import ExtractReportDataUseCase from "@/modules/reports/domain/use-cases/ExtractReportDataUseCase";
import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";

function createMockRepo(): ReportRepository {
  return {
    initReport: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
    saveDraft: vi.fn(),
    sign: vi.fn(),
    close: vi.fn(),
    downloadPdf: vi.fn(),
    getActiveTemplates: vi.fn(),
    delete: vi.fn(),
    transcribe: vi.fn(),
    extractData: vi.fn(),
  };
}

describe("ExtractReportDataUseCase", () => {
  it("calls repository.extractData() with reportId, transcript, and templateId", async () => {
    const repo = createMockRepo();
    const expected = {
      extracted_data: { edad: "45", diagnostico: "Artritis" },
      confidence_scores: { edad: 0.95, diagnostico: 0.87 },
      warnings: [],
      processing_time_ms: 1500,
    };
    (repo.extractData as any).mockResolvedValue(expected);

    const useCase = new ExtractReportDataUseCase(repo);
    const result = await useCase.execute(42, "El paciente tiene 45 años", 7);

    expect(repo.extractData).toHaveBeenCalledWith(
      42,
      "El paciente tiene 45 años",
      7,
    );
    expect(result).toEqual(expected);
  });

  it("throws when transcript is empty string", async () => {
    const repo = createMockRepo();
    const useCase = new ExtractReportDataUseCase(repo);

    await expect(useCase.execute(1, "", 7)).rejects.toThrow(
      "La transcripción no puede estar vacía",
    );
    expect(repo.extractData).not.toHaveBeenCalled();
  });

  it("throws when transcript is only whitespace", async () => {
    const repo = createMockRepo();
    const useCase = new ExtractReportDataUseCase(repo);

    await expect(useCase.execute(1, "   ", 7)).rejects.toThrow(
      "La transcripción no puede estar vacía",
    );
    expect(repo.extractData).not.toHaveBeenCalled();
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.extractData as any).mockRejectedValue(
      new Error("LLM extraction failed"),
    );

    const useCase = new ExtractReportDataUseCase(repo);
    await expect(useCase.execute(1, "patient transcript", 7)).rejects.toThrow(
      "LLM extraction failed",
    );
  });
});
