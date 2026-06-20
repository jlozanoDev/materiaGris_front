import { describe, it, expect, vi, beforeEach } from "vitest";
import GetActiveTemplatesUseCase from "../GetActiveTemplatesUseCase";
import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";
import type { ReportTemplate } from "@/shared/types";

describe("GetActiveTemplatesUseCase", () => {
  let repo: ReportRepository;
  let useCase: GetActiveTemplatesUseCase;

  beforeEach(() => {
    repo = { getActiveTemplates: vi.fn() } as any;
    useCase = new GetActiveTemplatesUseCase(repo);
  });

  it("calls repository.getActiveTemplates and returns templates", async () => {
    const expected: ReportTemplate[] = [
      { id: "1", name: "Informe Radiológico", description: "", isActive: true, structure: { sections: [] } },
      { id: "2", name: "Informe de Laboratorio", description: "", isActive: true, structure: { sections: [] } },
    ];
    (repo.getActiveTemplates as any).mockResolvedValue(expected);

    const result = await useCase.execute();

    expect(repo.getActiveTemplates).toHaveBeenCalledOnce();
    expect(result).toEqual(expected);
  });

  it("returns empty array when no active templates", async () => {
    (repo.getActiveTemplates as any).mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it("forwards errors from repository", async () => {
    const error = new Error("API Error");
    (repo.getActiveTemplates as any).mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow("API Error");
  });
});
