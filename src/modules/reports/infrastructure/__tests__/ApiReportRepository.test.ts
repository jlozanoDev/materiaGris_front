import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock("@/core/api/httpClient", () => ({
  fetchClient: vi.fn(),
}));

import { fetchClient } from "@/core/api/httpClient";
import ApiReportRepository from "@/modules/reports/infrastructure/ApiReportRepository";

// ============================================================================
// Helpers
// ============================================================================

function createRepo(): ApiReportRepository {
  return new ApiReportRepository();
}

/** Access private normalizeReport via type cast for direct testing */
function callNormalize(raw: Record<string, unknown>): Record<string, unknown> {
  const repo = createRepo() as any;
  return repo.normalizeReport(raw);
}

// ============================================================================
// normalizeReport
// ============================================================================

describe("ApiReportRepository.normalizeReport", () => {
  it("maps template_structure_snapshot → templateStructureSnapshot", () => {
    const raw = { template_structure_snapshot: { sections: [] } };
    const result = callNormalize(raw);
    expect(result).toHaveProperty("templateStructureSnapshot");
    expect(result).not.toHaveProperty("template_structure_snapshot");
  });

  it("maps patient_id → patientId", () => {
    const raw = { patient_id: 42 };
    const result = callNormalize(raw);
    expect(result.patientId).toBe(42);
  });

  it("maps template_id → templateId", () => {
    const raw = { template_id: 7 };
    const result = callNormalize(raw);
    expect(result.templateId).toBe(7);
  });

  it("maps user_id → userId", () => {
    const raw = { user_id: "u1" };
    const result = callNormalize(raw);
    expect(result.userId).toBe("u1");
  });

  it("maps created_at → createdAt", () => {
    const raw = { created_at: "2026-06-20T10:00:00Z" };
    const result = callNormalize(raw);
    expect(result.createdAt).toBe("2026-06-20T10:00:00Z");
  });

  it("maps updated_at → updatedAt", () => {
    const raw = { updated_at: "2026-06-20T11:00:00Z" };
    const result = callNormalize(raw);
    expect(result.updatedAt).toBe("2026-06-20T11:00:00Z");
  });

  it("passes through unknown keys unchanged", () => {
    const raw = { status: "draft", values: { a: 1 }, random_key: "hello" };
    const result = callNormalize(raw);
    expect(result.status).toBe("draft");
    expect(result.values).toEqual({ a: 1 });
    expect(result.random_key).toBe("hello");
  });

  it("handles null values gracefully", () => {
    const raw = { patient_id: null, template_structure_snapshot: null };
    const result = callNormalize(raw);
    expect(result.patientId).toBeNull();
    expect(result.templateStructureSnapshot).toBeNull();
  });

  it("handles missing / undefined values", () => {
    const raw: Record<string, unknown> = { id: "r1" };
    const result = callNormalize(raw);
    expect(result.id).toBe("r1");
    expect(result.patientId).toBeUndefined();
  });

  it("preserves nested object structure", () => {
    const raw = {
      template_structure_snapshot: {
        sections: [
          {
            id: "s1",
            label: "Section",
            display: "default",
            rows: [{ id: "r1", columns: [{ id: "c1", fields: [{ id: "f1", type: "text", key: "name" }] }] }],
          },
        ],
      },
    };
    const result = callNormalize(raw) as any;
    expect(result.templateStructureSnapshot.sections).toHaveLength(1);
    expect(result.templateStructureSnapshot.sections[0].rows[0].columns[0].fields[0].key).toBe("name");
  });
});

// ============================================================================
// Public methods — verify normalization via fetchClient mock
// ============================================================================

describe("ApiReportRepository — integration with fetchClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const snakeCaseReport = {
    id: "r1",
    patient_id: 42,
    template_id: 7,
    user_id: "u1",
    status: "draft",
    template_structure_snapshot: { sections: [] },
    values: {},
    created_at: "2026-06-20T10:00:00Z",
  };

  const snakeCaseReports = [
    snakeCaseReport,
    { ...snakeCaseReport, id: "r2", patient_id: 43 },
  ];

  describe("getById", () => {
    it("returns normalized report (camelCase keys)", async () => {
      (fetchClient as any).mockResolvedValue(snakeCaseReport);

      const repo = createRepo();
      const result = await repo.getById("r1");

      expect(fetchClient).toHaveBeenCalledWith("/reports/r1", { method: "GET" });
      expect(result).toHaveProperty("templateStructureSnapshot");
      expect(result).toHaveProperty("patientId", 42);
      expect(result).toHaveProperty("userId", "u1");
      expect(result).toHaveProperty("createdAt");
      expect(result).not.toHaveProperty("template_structure_snapshot");
    });
  });

  describe("initReport", () => {
    it("returns normalized report", async () => {
      (fetchClient as any).mockResolvedValue(snakeCaseReport);

      const repo = createRepo();
      const result = await repo.initReport(10, 5);

      expect(fetchClient).toHaveBeenCalledWith("/reports", expect.objectContaining({ method: "POST" }));
      expect(result).toHaveProperty("templateStructureSnapshot");
      expect(result).toHaveProperty("patientId", 42);
    });
  });

  describe("saveDraft", () => {
    it("returns normalized report", async () => {
      (fetchClient as any).mockResolvedValue(snakeCaseReport);

      const repo = createRepo();
      const result = await repo.saveDraft("r1", { field1: "val" });

      expect(fetchClient).toHaveBeenCalledWith("/reports/r1", expect.objectContaining({ method: "PUT" }));
      expect(result).toHaveProperty("templateStructureSnapshot");
      expect(result).toHaveProperty("patientId", 42);
    });
  });

  describe("sign", () => {
    it("returns normalized report", async () => {
      (fetchClient as any).mockResolvedValue(snakeCaseReport);

      const repo = createRepo();
      const result = await repo.sign("r1", "sig-data");

      expect(fetchClient).toHaveBeenCalledWith("/reports/r1/sign", expect.objectContaining({ method: "POST" }));
      expect(result).toHaveProperty("templateStructureSnapshot");
      expect(result).toHaveProperty("patientId", 42);
    });
  });

  describe("archive", () => {
    it("returns normalized report", async () => {
      (fetchClient as any).mockResolvedValue(snakeCaseReport);

      const repo = createRepo();
      const result = await repo.archive("r1");

      expect(fetchClient).toHaveBeenCalledWith("/reports/r1/archive", expect.objectContaining({ method: "POST" }));
      expect(result).toHaveProperty("templateStructureSnapshot");
      expect(result).toHaveProperty("patientId", 42);
    });
  });
});
