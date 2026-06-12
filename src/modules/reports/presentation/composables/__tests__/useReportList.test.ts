import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

vi.mock("@/modules/reports/application/containers/reportsContainer", () => ({
  provideGetReportsUseCase: vi.fn(),
}));

import { useReportList } from "../useReportList";
import { provideGetReportsUseCase } from "@/modules/reports/application/containers/reportsContainer";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("useReportList", () => {
  it("fetches reports via GetReportsUseCase", async () => {
    const reports = [
      { id: "r1", status: "draft", patient_name: "Juan", template_name: "T1", author_name: "Dr. A", created_at: "2026-01-01", updated_at: "2026-01-02" },
      { id: "r2", status: "signed", patient_name: "Ana", template_name: "T2", author_name: "Dr. B", created_at: "2026-01-03", updated_at: "2026-01-04" },
    ];
    const execute = vi.fn().mockResolvedValue(reports);
    (provideGetReportsUseCase as any).mockReturnValue({ execute });

    const list = useReportList();
    await list.fetchReports();

    expect(list.reports.value).toEqual(reports);
    expect(list.loading.value).toBe(false);
    expect(list.error.value).toBeNull();
  });

  it("passes filters to GetReportsUseCase", async () => {
    const execute = vi.fn().mockResolvedValue([]);
    (provideGetReportsUseCase as any).mockReturnValue({ execute });

    const list = useReportList();
    await list.fetchReports({ status: "signed", patient: "García" });

    expect(execute).toHaveBeenCalledWith({ status: "signed", patient: "García" });
  });

  it("sets error on failure", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("Network error"));
    (provideGetReportsUseCase as any).mockReturnValue({ execute });

    const list = useReportList();
    await list.fetchReports();

    expect(list.error.value).toBeTruthy();
    expect(list.reports.value).toEqual([]);
    expect(list.loading.value).toBe(false);
  });

  it("sets loading during fetch", async () => {
    let resolve: any;
    const promise = new Promise((r) => { resolve = r; });
    const execute = vi.fn().mockReturnValue(promise);
    (provideGetReportsUseCase as any).mockReturnValue({ execute });

    const list = useReportList();
    const fetchP = list.fetchReports();
    expect(list.loading.value).toBe(true);

    resolve([]);
    await fetchP;
    expect(list.loading.value).toBe(false);
  });
});
