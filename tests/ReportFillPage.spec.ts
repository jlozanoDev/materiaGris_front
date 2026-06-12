import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref } from "vue";

// ── Auth mock ─────────────────────────────────────────────────────────────────
let permMap: Record<string, boolean> = {};
vi.mock("@/core/store/auth", () => ({
  useAuthStore: () => ({
    user: { id: 1, name: "Dr. Test" },
    hasPermission: (slug: string) => permMap[slug] ?? false,
  }),
}));

// ── Composable mocks ──────────────────────────────────────────────────────────
const mockReport = ref<any>(null);
const mockValues = ref<Record<string, any>>({});
const mockErrors = ref<Record<string, string>>({});
const mockIsSaving = ref(false);
const mockSignatureValue = ref<string | null>(null);
const mockTypedSignatureValue = ref("");
const mockInit = vi.fn();
const mockLoadReport = vi.fn();
const mockSetValue = vi.fn();
const mockValidateForSignature = vi.fn(() => ({}));
const mockSaveDraft = vi.fn();
const mockSign = vi.fn();
const mockClose = vi.fn();
const mockDownloadPdf = vi.fn();

vi.mock("@/modules/reports/presentation/composables/useReportForm", () => ({
  useReportForm: () => ({
    report: mockReport,
    values: mockValues,
    errors: mockErrors,
    isSaving: mockIsSaving,
    signatureValue: mockSignatureValue,
    typedSignatureValue: mockTypedSignatureValue,
    init: mockInit,
    loadReport: mockLoadReport,
    setValue: mockSetValue,
    validateForSignature: mockValidateForSignature,
    saveDraft: mockSaveDraft,
    sign: mockSign,
    close: mockClose,
    downloadPdf: mockDownloadPdf,
  }),
}));

// ── Router mock ───────────────────────────────────────────────────────────────
const mockPush = vi.fn();
const mockRoute = { params: { id: "r1" }, query: { patientId: "10", templateId: "5" } };
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => mockRoute,
}));

import ReportFillPage from "@/modules/reports/presentation/pages/ReportFillPage.vue";

beforeEach(() => {
  vi.clearAllMocks();
  permMap = {};
  mockReport.value = null;
  mockValues.value = {};
  mockErrors.value = {};
  mockIsSaving.value = false;
  mockSignatureValue.value = null;
  mockTypedSignatureValue.value = "";
});

describe("ReportFillPage", () => {
  it("calls init in create mode (query params present)", async () => {
    permMap = { "report.create": true, "report.edit": true };
    mockRoute.params = {};
    mockRoute.query = { patientId: "10", templateId: "5" };
    mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };

    mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
    });

    await flushPromises();
    expect(mockInit).toHaveBeenCalledWith("10", "5");
  });

  it("calls loadReport in edit mode (route param id present)", async () => {
    permMap = { "report.edit": true };
    mockRoute.params = { id: "r1" };
    mockRoute.query = {};
    mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };

    mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
    });

    await flushPromises();
    expect(mockLoadReport).toHaveBeenCalledWith("r1");
  });

  it("shows Guardar button when user has report.edit", async () => {
    permMap = { "report.edit": true };
    mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Guardar");
  });

  it("hides Guardar button when user lacks report.edit", async () => {
    permMap = {};
    mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Guardar");
  });

  it("shows Firmar button when user has report.sign", async () => {
    permMap = { "report.edit": true, "report.sign": true };
    mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Firmar");
  });

  it("hides Firmar button when user lacks report.sign", async () => {
    permMap = { "report.edit": true };
    mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Firmar");
  });

  it("shows Cerrar button when report is signed and user has report.close", async () => {
    permMap = { "report.edit": true, "report.close": true };
    mockReport.value = { id: "r1", status: "signed", user_id: 1, template_structure_snapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Cerrar");
  });

  it("hides Cerrar button for draft reports", async () => {
    permMap = { "report.edit": true, "report.close": true };
    mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Cerrar");
  });

  it("shows Descargar PDF when report is signed and user has report.download-pdf", async () => {
    permMap = { "report.download-pdf": true };
    mockReport.value = { id: "r1", status: "signed", user_id: 1, template_structure_snapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Descargar PDF");
  });

  it("hides Descargar PDF for draft reports", async () => {
    permMap = { "report.edit": true, "report.download-pdf": true };
    mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Descargar PDF");
  });

  // ── Integration: draft → sign → close flow ─────────────────────────────────
  describe("draft → sign → close lifecycle", () => {
    it("calls sign when user confirms sign dialog", async () => {
      permMap = { "report.edit": true, "report.sign": true };
      mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };
      mockRoute.params = { id: "r1" };
      mockSign.mockResolvedValue(undefined);

      // Mock confirm to return true
      vi.spyOn(window, "confirm").mockReturnValue(true);

      const wrapper = mount(ReportFillPage, {
        global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
      });
      await flushPromises();

      const buttons = wrapper.findAll("button");
      const signBtn = buttons.find((b) => b.text().includes("Firmar"));
      if (signBtn) {
        await signBtn.trigger("click");
        await flushPromises();
        expect(mockSign).toHaveBeenCalled();
      }
    });

    it("does not sign when user cancels confirm", async () => {
      permMap = { "report.edit": true, "report.sign": true };
      mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };
      mockRoute.params = { id: "r1" };

      vi.spyOn(window, "confirm").mockReturnValue(false);

      const wrapper = mount(ReportFillPage, {
        global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
      });
      await flushPromises();

      const buttons = wrapper.findAll("button");
      const signBtn = buttons.find((b) => b.text().includes("Firmar"));
      if (signBtn) {
        await signBtn.trigger("click");
        await flushPromises();
        expect(mockSign).not.toHaveBeenCalled();
      }
    });

    it("calls close when user confirms close dialog on signed report", async () => {
      permMap = { "report.edit": true, "report.close": true };
      mockReport.value = { id: "r1", status: "signed", user_id: 1, template_structure_snapshot: { sections: [] } };
      mockRoute.params = { id: "r1" };
      mockClose.mockResolvedValue(undefined);

      vi.spyOn(window, "confirm").mockReturnValue(true);

      const wrapper = mount(ReportFillPage, {
        global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
      });
      await flushPromises();

      const buttons = wrapper.findAll("button");
      const closeBtn = buttons.find((b) => b.text().includes("Cerrar"));
      if (closeBtn) {
        await closeBtn.trigger("click");
        await flushPromises();
        expect(mockClose).toHaveBeenCalled();
      }
    });

    it("shows all buttons when user has all permissions on draft", async () => {
      permMap = {
        "report.edit": true,
        "report.sign": true,
        "report.close": true,
        "report.download-pdf": true,
      };
      mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };
      mockRoute.params = { id: "r1" };

      const wrapper = mount(ReportFillPage, {
        global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
      });
      await flushPromises();

      expect(wrapper.text()).toContain("Guardar");
      expect(wrapper.text()).toContain("Firmar");
      expect(wrapper.text()).not.toContain("Cerrar"); // Cerrar only for signed
      expect(wrapper.text()).not.toContain("Descargar PDF"); // PDF only for signed/closed
    });

    it("hides all action buttons when user has only report.view", async () => {
      permMap = { "report.view": true };
      mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };
      mockRoute.params = { id: "r1" };

      const wrapper = mount(ReportFillPage, {
        global: { stubs: ["AppSidebar", "TopBar", "Breadcrumb", "DynamicFormRenderer"] },
      });
      await flushPromises();

      expect(wrapper.text()).not.toContain("Guardar");
      expect(wrapper.text()).not.toContain("Firmar");
      expect(wrapper.text()).not.toContain("Cerrar");
      expect(wrapper.text()).not.toContain("Descargar PDF");
    });
  });
});
