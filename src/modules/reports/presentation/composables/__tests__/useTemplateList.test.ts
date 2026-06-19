import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

vi.mock("@/modules/reports/application/containers/reportsContainer", () => ({
  provideGetActiveTemplatesUseCase: vi.fn(),
}));

import { useTemplateList } from "../useTemplateList";
import { provideGetActiveTemplatesUseCase } from "@/modules/reports/application/containers/reportsContainer";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("useTemplateList", () => {
  it("fetches templates via GetActiveTemplatesUseCase on success", async () => {
    const templates = [
      { id: "1", name: "Informe Radiológico", description: "", isActive: true },
      { id: "2", name: "Informe de Laboratorio", description: "", isActive: true },
    ];
    const execute = vi.fn().mockResolvedValue(templates);
    (provideGetActiveTemplatesUseCase as any).mockReturnValue({ execute });

    const list = useTemplateList();
    await list.fetchActive();

    expect(list.templates.value).toEqual(templates);
    expect(list.loading.value).toBe(false);
    expect(list.error.value).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("Network error"));
    (provideGetActiveTemplatesUseCase as any).mockReturnValue({ execute });

    const list = useTemplateList();
    await list.fetchActive();

    expect(list.error.value).toBeTruthy();
    expect(list.templates.value).toEqual([]);
    expect(list.loading.value).toBe(false);
  });

  it("sets loading state during fetch", async () => {
    let resolve: any;
    const promise = new Promise((r) => { resolve = r; });
    const execute = vi.fn().mockReturnValue(promise);
    (provideGetActiveTemplatesUseCase as any).mockReturnValue({ execute });

    const list = useTemplateList();
    const fetchP = list.fetchActive();
    expect(list.loading.value).toBe(true);

    resolve([]);
    await fetchP;
    expect(list.loading.value).toBe(false);
  });

  it("returns empty array when no templates", async () => {
    const execute = vi.fn().mockResolvedValue([]);
    (provideGetActiveTemplatesUseCase as any).mockReturnValue({ execute });

    const list = useTemplateList();
    await list.fetchActive();

    expect(list.templates.value).toEqual([]);
    expect(list.loading.value).toBe(false);
  });
});
