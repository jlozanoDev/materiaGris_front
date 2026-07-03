import { describe, it, expect, vi } from "vitest";
import InitReportUseCase from "@/modules/reports/domain/use-cases/InitReportUseCase";
import GetReportsUseCase from "@/modules/reports/domain/use-cases/GetReportsUseCase";
import GetReportUseCase from "@/modules/reports/domain/use-cases/GetReportUseCase";
import SaveReportDraftUseCase from "@/modules/reports/domain/use-cases/SaveReportDraftUseCase";
import SignReportUseCase from "@/modules/reports/domain/use-cases/SignReportUseCase";
import CloseReportUseCase from "@/modules/reports/domain/use-cases/CloseReportUseCase";
import DownloadReportPdfUseCase from "@/modules/reports/domain/use-cases/DownloadReportPdfUseCase";
import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";

// ============================================================================
// Mock Repository Factory
// ============================================================================

function createMockRepo(): ReportRepository {
  return {
    initReport: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
    saveDraft: vi.fn(),
    sign: vi.fn(),
    close: vi.fn(),
    delete: vi.fn(),
    downloadPdf: vi.fn(),
    getActiveTemplates: vi.fn(),
  };
}

// ============================================================================
// InitReportUseCase
// ============================================================================

describe("InitReportUseCase", () => {
  it("calls repository.initReport() with patientId and templateId", async () => {
    const repo = createMockRepo();
    const expected = { id: "1", status: "draft" };
    (repo.initReport as any).mockResolvedValue(expected);

    const useCase = new InitReportUseCase(repo);
    const result = await useCase.execute(42, 3);

    expect(repo.initReport).toHaveBeenCalledWith(42, 3);
    expect(result).toEqual(expected);
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.initReport as any).mockRejectedValue(new Error("Init failed"));

    const useCase = new InitReportUseCase(repo);
    await expect(useCase.execute(42, 3)).rejects.toThrow("Init failed");
  });
});

// ============================================================================
// GetReportsUseCase
// ============================================================================

describe("GetReportsUseCase", () => {
  it("calls repository.getAll() without filters", async () => {
    const repo = createMockRepo();
    const expected = [{ id: "1", status: "draft" }];
    (repo.getAll as any).mockResolvedValue(expected);

    const useCase = new GetReportsUseCase(repo);
    const result = await useCase.execute();

    expect(repo.getAll).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(expected);
  });

  it("calls repository.getAll() with filters", async () => {
    const repo = createMockRepo();
    const filters = { status: "signed" };
    (repo.getAll as any).mockResolvedValue([]);

    const useCase = new GetReportsUseCase(repo);
    await useCase.execute(filters);

    expect(repo.getAll).toHaveBeenCalledWith(filters);
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.getAll as any).mockRejectedValue(new Error("Network error"));

    const useCase = new GetReportsUseCase(repo);
    await expect(useCase.execute()).rejects.toThrow("Network error");
  });
});

// ============================================================================
// GetReportUseCase
// ============================================================================

describe("GetReportUseCase", () => {
  it("calls repository.getById() with the given id", async () => {
    const repo = createMockRepo();
    const expected = { id: "1", status: "draft" };
    (repo.getById as any).mockResolvedValue(expected);

    const useCase = new GetReportUseCase(repo);
    const result = await useCase.execute("1");

    expect(repo.getById).toHaveBeenCalledWith("1");
    expect(result).toEqual(expected);
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.getById as any).mockRejectedValue(new Error("Not found"));

    const useCase = new GetReportUseCase(repo);
    await expect(useCase.execute("99")).rejects.toThrow("Not found");
  });
});

// ============================================================================
// SaveReportDraftUseCase
// ============================================================================

describe("SaveReportDraftUseCase", () => {
  it("calls repository.saveDraft() with id and values", async () => {
    const repo = createMockRepo();
    const values = { field1: "value1", field2: "value2" };
    const expected = { id: "1", status: "draft", values };
    (repo.saveDraft as any).mockResolvedValue(expected);

    const useCase = new SaveReportDraftUseCase(repo);
    const result = await useCase.execute("1", values);

    expect(repo.saveDraft).toHaveBeenCalledWith("1", values);
    expect(result).toEqual(expected);
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.saveDraft as any).mockRejectedValue(new Error("Update failed"));

    const useCase = new SaveReportDraftUseCase(repo);
    await expect(useCase.execute("1", {})).rejects.toThrow("Update failed");
  });
});

// ============================================================================
// SignReportUseCase — validates signature non-empty
// ============================================================================

describe("SignReportUseCase", () => {
  it("calls repository.sign() with id and signature when signature is valid", async () => {
    const repo = createMockRepo();
    const expected = { id: "1", status: "signed" };
    (repo.sign as any).mockResolvedValue(expected);

    const useCase = new SignReportUseCase(repo);
    const result = await useCase.execute("1", "data:image/png;base64,abc123");

    expect(repo.sign).toHaveBeenCalledWith("1", "data:image/png;base64,abc123");
    expect(result).toEqual(expected);
  });

  it("throws when signature is empty string", async () => {
    const repo = createMockRepo();

    const useCase = new SignReportUseCase(repo);
    await expect(useCase.execute("1", "")).rejects.toThrow(
      "La firma es obligatoria para firmar el informe"
    );
    expect(repo.sign).not.toHaveBeenCalled();
  });

  it("throws when signature is only whitespace", async () => {
    const repo = createMockRepo();

    const useCase = new SignReportUseCase(repo);
    await expect(useCase.execute("1", "   ")).rejects.toThrow(
      "La firma es obligatoria para firmar el informe"
    );
    expect(repo.sign).not.toHaveBeenCalled();
  });

  it("throws when signature is undefined", async () => {
    const repo = createMockRepo();

    const useCase = new SignReportUseCase(repo);
    await expect(useCase.execute("1", undefined as any)).rejects.toThrow(
      "La firma es obligatoria para firmar el informe"
    );
    expect(repo.sign).not.toHaveBeenCalled();
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.sign as any).mockRejectedValue(new Error("Sign failed"));

    const useCase = new SignReportUseCase(repo);
    await expect(useCase.execute("1", "signature")).rejects.toThrow("Sign failed");
  });
});

// ============================================================================
// CloseReportUseCase
// ============================================================================

describe("CloseReportUseCase", () => {
  it("calls repository.close() with the given id", async () => {
    const repo = createMockRepo();
    const expected = { id: "1", status: "closed" };
    (repo.close as any).mockResolvedValue(expected);

    const useCase = new CloseReportUseCase(repo);
    const result = await useCase.execute("1");

    expect(repo.close).toHaveBeenCalledWith("1");
    expect(result).toEqual(expected);
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.close as any).mockRejectedValue(new Error("Close failed"));

    const useCase = new CloseReportUseCase(repo);
    await expect(useCase.execute("1")).rejects.toThrow("Close failed");
  });
});

// ============================================================================
// DownloadReportPdfUseCase
// ============================================================================

describe("DownloadReportPdfUseCase", () => {
  it("calls repository.downloadPdf() with the given id and returns Blob", async () => {
    const repo = createMockRepo();
    const expectedBlob = new Blob(["%PDF-1.4"], { type: "application/pdf" });
    (repo.downloadPdf as any).mockResolvedValue(expectedBlob);

    const useCase = new DownloadReportPdfUseCase(repo);
    const result = await useCase.execute("1");

    expect(repo.downloadPdf).toHaveBeenCalledWith("1");
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe("application/pdf");
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.downloadPdf as any).mockRejectedValue(new Error("PDF generation failed"));

    const useCase = new DownloadReportPdfUseCase(repo);
    await expect(useCase.execute("1")).rejects.toThrow("PDF generation failed");
  });
});
