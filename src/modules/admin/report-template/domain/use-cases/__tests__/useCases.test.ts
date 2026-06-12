import { describe, it, expect, vi } from "vitest";
import GetReportTemplatesUseCase from "../GetReportTemplatesUseCase";
import GetReportTemplateUseCase from "../GetReportTemplateUseCase";
import CreateReportTemplateUseCase from "../CreateReportTemplateUseCase";
import UpdateReportTemplateUseCase from "../UpdateReportTemplateUseCase";
import DeleteReportTemplateUseCase from "../DeleteReportTemplateUseCase";
import type { ReportTemplateRepository } from "@/modules/admin/report-template/domain/repositories/ReportTemplateRepository";

// ============================================================================
// Mock Repository Factory
// ============================================================================

function createMockRepo(): ReportTemplateRepository {
  return {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

// ============================================================================
// GetReportTemplatesUseCase
// ============================================================================

describe("GetReportTemplatesUseCase", () => {
  it("calls repository.getAll() and returns result", async () => {
    const repo = createMockRepo();
    const expected = [{ id: "1", name: "Template A" }];
    (repo.getAll as any).mockResolvedValue(expected);

    const useCase = new GetReportTemplatesUseCase(repo);
    const result = await useCase.execute();

    expect(repo.getAll).toHaveBeenCalledOnce();
    expect(result).toEqual(expected);
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.getAll as any).mockRejectedValue(new Error("Network error"));

    const useCase = new GetReportTemplatesUseCase(repo);
    await expect(useCase.execute()).rejects.toThrow("Network error");
  });
});

// ============================================================================
// GetReportTemplateUseCase
// ============================================================================

describe("GetReportTemplateUseCase", () => {
  it("calls repository.getById() with the given id", async () => {
    const repo = createMockRepo();
    const expected = { id: "1", name: "Template A" };
    (repo.getById as any).mockResolvedValue(expected);

    const useCase = new GetReportTemplateUseCase(repo);
    const result = await useCase.execute("1");

    expect(repo.getById).toHaveBeenCalledWith("1");
    expect(result).toEqual(expected);
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.getById as any).mockRejectedValue(new Error("Not found"));

    const useCase = new GetReportTemplateUseCase(repo);
    await expect(useCase.execute("99")).rejects.toThrow("Not found");
  });
});

// ============================================================================
// CreateReportTemplateUseCase
// ============================================================================

describe("CreateReportTemplateUseCase", () => {
  it("calls repository.create() with the payload", async () => {
    const repo = createMockRepo();
    const payload = { name: "New Template", description: "Test" };
    const expected = { id: "1", ...payload };
    (repo.create as any).mockResolvedValue(expected);

    const useCase = new CreateReportTemplateUseCase(repo);
    const result = await useCase.execute(payload);

    expect(repo.create).toHaveBeenCalledWith(payload);
    expect(result).toEqual(expected);
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.create as any).mockRejectedValue(new Error("Validation failed"));

    const useCase = new CreateReportTemplateUseCase(repo);
    await expect(useCase.execute({})).rejects.toThrow("Validation failed");
  });
});

// ============================================================================
// UpdateReportTemplateUseCase
// ============================================================================

describe("UpdateReportTemplateUseCase", () => {
  it("calls repository.update() with id and payload", async () => {
    const repo = createMockRepo();
    const payload = { name: "Updated" };
    const expected = { id: "1", name: "Updated" };
    (repo.update as any).mockResolvedValue(expected);

    const useCase = new UpdateReportTemplateUseCase(repo);
    const result = await useCase.execute("1", payload);

    expect(repo.update).toHaveBeenCalledWith("1", payload);
    expect(result).toEqual(expected);
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.update as any).mockRejectedValue(new Error("Not found"));

    const useCase = new UpdateReportTemplateUseCase(repo);
    await expect(useCase.execute("99", {})).rejects.toThrow("Not found");
  });
});

// ============================================================================
// DeleteReportTemplateUseCase
// ============================================================================

describe("DeleteReportTemplateUseCase", () => {
  it("calls repository.delete() with the given id", async () => {
    const repo = createMockRepo();
    (repo.delete as any).mockResolvedValue(undefined);

    const useCase = new DeleteReportTemplateUseCase(repo);
    await useCase.execute("1");

    expect(repo.delete).toHaveBeenCalledWith("1");
  });

  it("throws friendly message when backend returns 409 (reports exist)", async () => {
    const repo = createMockRepo();
    (repo.delete as any).mockRejectedValue({ status: 409, body: { message: "Reports exist" } });

    const useCase = new DeleteReportTemplateUseCase(repo);
    await expect(useCase.execute("1")).rejects.toThrow(
      "No se puede eliminar: existen informes asociados"
    );
  });

  it("propagates non-409 errors unchanged", async () => {
    const repo = createMockRepo();
    (repo.delete as any).mockRejectedValue(new Error("Server error"));

    const useCase = new DeleteReportTemplateUseCase(repo);
    await expect(useCase.execute("1")).rejects.toThrow("Server error");
  });
});
