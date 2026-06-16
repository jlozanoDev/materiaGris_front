import { describe, it, expect, vi } from "vitest";
import GetPatientUseCase from "@/modules/patients/domain/use-cases/GetPatientUseCase";
import type { PatientRepository } from "@/modules/patients/domain/repositories/PatientRepository";

// ============================================================================
// Mock Repository Factory
// ============================================================================

function createMockRepo(): PatientRepository {
  return {
    search: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
}

// ============================================================================
// GetPatientUseCase
// ============================================================================

describe("GetPatientUseCase", () => {
  it("calls repository.getById() with the given numeric id", async () => {
    const repo = createMockRepo();
    const expected = { id: 42, first_name: "Ana", last_name: "García" };
    (repo.getById as any).mockResolvedValue(expected);

    const useCase = new GetPatientUseCase(repo);
    const result = await useCase.execute(42);

    expect(repo.getById).toHaveBeenCalledWith(42);
    expect(result).toEqual(expected);
  });

  it("calls repository.getById() with the given string id", async () => {
    const repo = createMockRepo();
    (repo.getById as any).mockResolvedValue({ id: "abc" });

    const useCase = new GetPatientUseCase(repo);
    const result = await useCase.execute("abc");

    expect(repo.getById).toHaveBeenCalledWith("abc");
    expect(result).toEqual({ id: "abc" });
  });

  it("returns the value from repository.getById()", async () => {
    const repo = createMockRepo();
    const patient = {
      id: 7,
      first_name: "Carlos",
      last_name: "López",
      medical_record_number: "NHC-007",
    };
    (repo.getById as any).mockResolvedValue(patient);

    const useCase = new GetPatientUseCase(repo);
    const result = await useCase.execute(7);

    expect(result).toBe(patient);
  });

  it("propagates repository errors", async () => {
    const repo = createMockRepo();
    (repo.getById as any).mockRejectedValue(new Error("Not found"));

    const useCase = new GetPatientUseCase(repo);
    await expect(useCase.execute(99)).rejects.toThrow("Not found");
  });
});
