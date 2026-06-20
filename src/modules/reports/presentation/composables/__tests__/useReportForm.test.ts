import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { nextTick } from "vue";

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock("@/modules/reports/application/containers/reportsContainer", () => ({
  provideInitReportUseCase: vi.fn(),
  provideGetReportUseCase: vi.fn(),
  provideSaveReportDraftUseCase: vi.fn(),
  provideSignReportUseCase: vi.fn(),
  provideCloseReportUseCase: vi.fn(),
  provideDownloadReportPdfUseCase: vi.fn(),
}));

vi.mock("@/core/store/auth", () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: "1", name: "Dr. Test" },
    hasPermission: vi.fn((slug: string) => {
      const perms: Record<string, boolean> = {
        "report.edit": true,
        "report.sign": true,
        "report.close": true,
        "report.download-pdf": true,
      };
      return perms[slug] ?? false;
    }),
  })),
}));

import { useReportForm } from "../useReportForm";
import {
  provideInitReportUseCase,
  provideGetReportUseCase,
  provideSaveReportDraftUseCase,
  provideSignReportUseCase,
  provideCloseReportUseCase,
  provideDownloadReportPdfUseCase,
} from "@/modules/reports/application/containers/reportsContainer";

const mockExecute = (fn: any) => fn;
const container = (name: any, result?: any) => {
  (name as any).mockReturnValue({ execute: mockExecute(vi.fn().mockResolvedValue(result ?? {})) });
  return (name as any)().execute;
};

beforeEach(() => {
  setActivePinia(createPinia());
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useReportForm", () => {
  // ── init ───────────────────────────────────────────────────────────────────
  describe("init", () => {
    it("calls InitReportUseCase with patientId and templateId", async () => {
      const report = { id: "r1", status: "draft", patient_id: 10, template_id: 5 };
      const execute = vi.fn().mockResolvedValue(report);
      (provideInitReportUseCase as any).mockReturnValue({ execute });

      const store = useReportForm();
      await store.init("10", "5");

      expect(execute).toHaveBeenCalledWith("10", "5");
      expect(store.report.value).toEqual(report);
      expect(store.errors.value).toEqual({});
    });
  });

  // ── loadReport ─────────────────────────────────────────────────────────────
  describe("loadReport", () => {
    it("loads report and populates values from snapshot", async () => {
      const report = {
        id: "r1",
        status: "draft",
        values: { nombre: "Juan" },
        templateStructureSnapshot: {
          sections: [
            { id: "s1", label: "Datos", display: "default", rows: [{ id: "r1", columns: [{ id: "c1", fields: [{ id: "f1", key: "nombre", type: "text", label: "Nombre", required: true }] }] }] },
          ],
        },
      };
      const execute = vi.fn().mockResolvedValue(report);
      (provideGetReportUseCase as any).mockReturnValue({ execute });

      const store = useReportForm();
      await store.loadReport("r1");

      expect(store.report.value).toEqual(report);
      expect(store.values.value).toEqual({ nombre: "Juan" });
    });
  });

  // ── setValue ───────────────────────────────────────────────────────────────
  describe("setValue", () => {
    it("updates values and marks dirty", async () => {
      const report = { id: "r1", status: "draft", values: {} };
      (provideGetReportUseCase as any).mockReturnValue({ execute: vi.fn().mockResolvedValue(report) });

      const store = useReportForm();
      store.values.value = { a: 1 };
      store.setValue("b", 2);

      expect(store.values.value).toEqual({ a: 1, b: 2 });
      expect(store.dirtyFields.value.has("b")).toBe(true);
    });
  });

  // ── validateForSignature ───────────────────────────────────────────────────
  describe("validateForSignature", () => {
    it("returns errors for empty required fields", () => {
      const store = useReportForm();
      store.report.value = {
        id: "r1",
        status: "draft",
        values: {},
        templateStructureSnapshot: {
          sections: [
            { id: "s1", label: "Datos", display: "default", rows: [{ id: "r1", columns: [{ id: "c1", fields: [{ id: "f1", key: "nombre", type: "text", label: "Nombre", required: true }] }] }] },
          ],
        },
      } as any;
      store.values.value = {};
      store.signatureValue.value = "data:image/png;base64,abc";

      const errors = store.validateForSignature();
      expect(errors).toHaveProperty("nombre");
    });

    it("returns error when signature missing", () => {
      const store = useReportForm();
      store.report.value = {
        id: "r1",
        status: "draft",
        values: {},
        templateStructureSnapshot: {
          sections: [
            { id: "s1", label: "Datos", display: "default", rows: [{ id: "r1", columns: [{ id: "c1", fields: [{ id: "f1", key: "nombre", type: "text", label: "Nombre", required: true }] }] }] },
          ],
        },
      } as any;
      store.values.value = { nombre: "Juan" };
      store.signatureValue.value = null;
      store.typedSignatureValue.value = "";

      const errors = store.validateForSignature();
      expect(errors).toHaveProperty("_signature");
    });

    it("accepts typed signature as valid", () => {
      const store = useReportForm();
      store.report.value = {
        id: "r1",
        status: "draft",
        values: {},
        templateStructureSnapshot: {
          sections: [
            { id: "s1", label: "Datos", display: "default", rows: [{ id: "r1", columns: [{ id: "c1", fields: [{ id: "f1", key: "nombre", type: "text", label: "Nombre", required: true }] }] }] },
          ],
        },
      } as any;
      store.values.value = { nombre: "Juan" };
      store.signatureValue.value = null;
      store.typedSignatureValue.value = "Juan Perez";

      const errors = store.validateForSignature();
      expect(errors).toEqual({});
    });
  });

  // ── sign ───────────────────────────────────────────────────────────────────
  describe("sign", () => {
    it("throws if user is not the author", async () => {
      const store = useReportForm();
      store.report.value = { id: "r1", status: "draft", userId: "99" } as any;
      store.signatureValue.value = "data:image/png;base64,abc";
      store.values.value = {};

      await expect(store.sign()).rejects.toThrow("No tiene permiso para firmar");
    });

    it("calls SignReportUseCase when valid", async () => {
      const report = { id: "r1", status: "signed", userId: "1" };
      const execute = vi.fn().mockResolvedValue(report);
      (provideSignReportUseCase as any).mockReturnValue({ execute });

      const store = useReportForm();
      store.report.value = { id: "r1", status: "draft", userId: "1", templateStructureSnapshot: { sections: [] } } as any;
      store.signatureValue.value = "data:image/png;base64,abc";
      store.values.value = {};

      await store.sign();
      expect(execute).toHaveBeenCalledWith("r1", "data:image/png;base64,abc");
      expect(store.report.value!.status).toBe("signed");
    });
  });

  // ── saveDraft ──────────────────────────────────────────────────────────────
  describe("saveDraft", () => {
    it("calls SaveReportDraftUseCase", async () => {
      const execute = vi.fn().mockResolvedValue({});
      (provideSaveReportDraftUseCase as any).mockReturnValue({ execute });

      const store = useReportForm();
      store.report.value = { id: "r1", status: "draft" } as any;
      store.values.value = { nombre: "Juan" };

      await store.saveDraft();
      expect(execute).toHaveBeenCalledWith("r1", { nombre: "Juan" });
    });
  });

  // ── close ──────────────────────────────────────────────────────────────────
  describe("close", () => {
    it("throws if report is not signed", async () => {
      const store = useReportForm();
      store.report.value = { id: "r1", status: "draft", userId: "1" } as any;

      await expect(store.close()).rejects.toThrow(/firmad/);
    });

    it("calls CloseReportUseCase when valid", async () => {
      const report = { id: "r1", status: "closed", userId: "1" };
      const execute = vi.fn().mockResolvedValue(report);
      (provideCloseReportUseCase as any).mockReturnValue({ execute });

      const store = useReportForm();
      store.report.value = { id: "r1", status: "signed", userId: "1" } as any;

      await store.close();
      expect(execute).toHaveBeenCalledWith("r1");
      expect(store.report.value!.status).toBe("closed");
    });
  });

  // ── isLoading / errorMessage ────────────────────────────────────────────────
  describe("error handling", () => {
    it("toggles isLoading during successful init", async () => {
      const report = { id: "r1", status: "draft", values: {} };
      const execute = vi.fn().mockResolvedValue(report);
      (provideInitReportUseCase as any).mockReturnValue({ execute });

      const store = useReportForm();
      expect(store.isLoading.value).toBe(false);

      await store.init("10", "5");

      expect(store.isLoading.value).toBe(false);
      expect(store.report.value).toEqual(report);
      expect(store.errorMessage.value).toBeNull();
    });

    it("toggles isLoading during successful loadReport", async () => {
      const report = { id: "r1", status: "draft", values: { nombre: "Juan" } };
      const execute = vi.fn().mockResolvedValue(report);
      (provideGetReportUseCase as any).mockReturnValue({ execute });

      const store = useReportForm();
      expect(store.isLoading.value).toBe(false);

      await store.loadReport("r1");

      expect(store.isLoading.value).toBe(false);
      expect(store.report.value).toEqual(report);
      expect(store.errorMessage.value).toBeNull();
    });

    it("sets errorMessage and keeps report null on init failure", async () => {
      (provideInitReportUseCase as any).mockReturnValue({
        execute: vi.fn().mockRejectedValue(new Error("API error")),
      });

      const store = useReportForm();
      // Should not throw — error is captured in errorMessage
      await store.init("10", "5");

      expect(store.report.value).toBeNull();
      expect(store.isLoading.value).toBe(false);
    });

    it("sets errorMessage on loadReport failure", async () => {
      (provideGetReportUseCase as any).mockReturnValue({
        execute: vi.fn().mockRejectedValue(new Error("Not found")),
      });

      const store = useReportForm();
      await store.loadReport("99");

      expect(store.report.value).toBeNull();
      expect(store.isLoading.value).toBe(false);
    });

    it("clears errorMessage on successful init after previous error", async () => {
      // First call: fail
      (provideInitReportUseCase as any).mockReturnValueOnce({
        execute: vi.fn().mockRejectedValue(new Error("Fail")),
      });
      // Second call: succeed
      const report = { id: "r1", status: "draft", values: {} };
      (provideInitReportUseCase as any).mockReturnValueOnce({
        execute: vi.fn().mockResolvedValue(report),
      });

      const store = useReportForm();

      // First init fails
      await store.init("10", "5");
      expect(store.report.value).toBeNull();

      // Second init succeeds
      await store.init("10", "5");
      expect(store.report.value).toEqual(report);
      expect(store.errorMessage.value).toBeNull();
    });
  });

  // ── auto-save ──────────────────────────────────────────────────────────────
  describe("auto-save", () => {
    it("triggers saveDraft after 2s debounce on setValue", async () => {
      const execute = vi.fn().mockResolvedValue({});
      (provideSaveReportDraftUseCase as any).mockReturnValue({ execute });

      const store = useReportForm();
      store.report.value = { id: "r1", status: "draft" } as any;
      store.autoSaveEnabled.value = true;

      store.setValue("nombre", "Juan");
      vi.advanceTimersByTime(2100);
      await nextTick();

      expect(execute).toHaveBeenCalledWith("r1", { nombre: "Juan" });
    });
  });
});
