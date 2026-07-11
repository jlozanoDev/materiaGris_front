import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref, defineComponent, h } from "vue";

/**
 * Stub for Modal — renders both default and footer slots inline
 * so tests can interact with modal buttons without teleport shenanigans.
 */
const ModalStub = defineComponent({
  props: ["show", "title", "size", "closeOnBackdrop"],
  emits: ["close"],
  setup(props, { slots, emit }) {
    return () => {
      if (!props.show) return null;
      return h("div", { class: "modal-stub" }, [
        h("div", { class: "modal-stub-body" }, slots.default?.()),
        h("div", { class: "modal-stub-footer" }, slots.footer?.()),
      ]);
    };
  },
});

// ── Auth mock ─────────────────────────────────────────────────────────────────
let permMap: Record<string, boolean> = {};
vi.mock("@/core/store/auth", () => ({
  useAuthStore: () => ({
    user: { id: 1, name: "Dr. Test" },
    hasPermission: (slug: string) => permMap[slug] ?? false,
  }),
}));

// ── Clinic store mock ─────────────────────────────────────────────────────────
vi.mock("@/core/store/clinic", () => ({
  useClinicStore: () => ({
    clinic: ref(null),
    loading: ref(false),
    error: ref(null),
    fetchClinic: vi.fn(),
  }),
}));

// ── ReportVariableResolver mock ───────────────────────────────────────────────
vi.mock("@/shared/composables/useReportVariableResolver", () => ({
  useReportVariableResolver: () => ({
    resolve: (text: string) => text,
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
const mockValidateFormFields = vi.fn(() => ({}));
const mockValidateForSignature = vi.fn(() => ({}));
const mockSaveDraft = vi.fn();
const mockSign = vi.fn();
const mockArchive = vi.fn();
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
    validateFormFields: mockValidateFormFields,
    validateForSignature: mockValidateForSignature,
    saveDraft: mockSaveDraft,
    sign: mockSign,
    archive: mockArchive,
    downloadPdf: mockDownloadPdf,
  }),
}));

// ── Router mock ───────────────────────────────────────────────────────────────
const mockPush = vi.fn();
const mockRoute: Record<string, any> = { params: { id: "r1" }, query: { patientId: "10", templateId: "5" }, name: "" };
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
  mockRoute.params = { id: "r1" };
  mockRoute.query = {};
  mockRoute.name = "";
});

describe("ReportFillPage", () => {
  // ── Route disambiguation ──────────────────────────────────────────────────
  it("calls init when route.name === 'ReportCreate'", async () => {
    permMap = { "report.create": true };
    mockRoute.params = { id: "42" };
    mockRoute.query = { templateId: "7" };
    mockRoute.name = "ReportCreate";
    mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };

    mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });

    await flushPromises();
    expect(mockInit).toHaveBeenCalledWith("42", "7");
    expect(mockLoadReport).not.toHaveBeenCalled();
  });

  it("calls loadReport when route.name is not ReportCreate", async () => {
    permMap = { "report.edit": true };
    mockRoute.params = { id: "15" };
    mockRoute.name = "ReportEdit";
    mockReport.value = { id: "15", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };

    mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });

    await flushPromises();
    expect(mockLoadReport).toHaveBeenCalledWith("15");
    expect(mockInit).not.toHaveBeenCalled();
  });

  it("calls init in create mode with params.id and query.templateId", async () => {
    permMap = { "report.create": true, "report.edit": true };
    mockRoute.params = { id: "10" };
    mockRoute.query = { templateId: "5" };
    mockRoute.name = "ReportCreate";
    mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };

    mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });

    await flushPromises();
    expect(mockInit).toHaveBeenCalledWith("10", "5");
  });

  it("calls loadReport in edit mode (route param id present)", async () => {
    permMap = { "report.edit": true };
    mockRoute.params = { id: "r1" };
    mockRoute.query = {};
    mockRoute.name = "ReportEdit";
    mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };

    mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });

    await flushPromises();
    expect(mockLoadReport).toHaveBeenCalledWith("r1");
  });

  // ── Back navigation ───────────────────────────────────────────────────────
  it("shows Volver button in create flow", async () => {
    permMap = { "report.create": true };
    mockRoute.params = { id: "42" };
    mockRoute.query = { templateId: "7" };
    mockRoute.name = "ReportCreate";
    mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Volver");
  });

  it("navigates to patient detail with tab=reports on Volver click", async () => {
    permMap = { "report.create": true };
    mockRoute.params = { id: "42" };
    mockRoute.query = { templateId: "7" };
    mockRoute.name = "ReportCreate";
    mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    const volverBtn = wrapper.find("button");
    await volverBtn.trigger("click");

    expect(mockPush).toHaveBeenCalledWith("/patients/42?tab=reports");
  });

  it("does not show Volver button in edit flow", async () => {
    permMap = { "report.edit": true };
    mockRoute.params = { id: "15" };
    mockRoute.name = "ReportEdit";
    mockReport.value = { id: "15", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Volver");
  });

  it("shows Guardar button when user has report.edit", async () => {
    permMap = { "report.edit": true };
    mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };
    mockRoute.name = "ReportEdit";

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Guardar");
  });

  it("hides Guardar button when user lacks report.edit", async () => {
    permMap = {};
    mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };
    mockRoute.name = "ReportEdit";

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Guardar");
  });

  it("shows Firmar button when user has report.sign", async () => {
    permMap = { "report.edit": true, "report.sign": true };
    mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };
    mockRoute.name = "ReportEdit";

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Firmar");
  });

  it("hides Firmar button when user lacks report.sign", async () => {
    permMap = { "report.edit": true };
    mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };
    mockRoute.name = "ReportEdit";

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Firmar");
  });

  it("shows Archivar button when report is signed and user has report.archive", async () => {
    permMap = { "report.edit": true, "report.archive": true };
    mockReport.value = { id: "r1", status: "signed", userId: 1, templateStructureSnapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };
    mockRoute.name = "ReportEdit";

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Archivar");
  });

  it("hides Archivar button for draft reports", async () => {
    permMap = { "report.edit": true, "report.archive": true };
    mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };
    mockRoute.name = "ReportEdit";

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Archivar");
  });

  it("shows Descargar PDF when report is signed and user has report.download-pdf", async () => {
    permMap = { "report.download-pdf": true };
    mockReport.value = { id: "r1", status: "signed", userId: 1, templateStructureSnapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };
    mockRoute.name = "ReportEdit";

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Descargar PDF");
  });

  it("hides Descargar PDF for draft reports", async () => {
    permMap = { "report.edit": true, "report.download-pdf": true };
    mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };
    mockRoute.params = { id: "r1" };
    mockRoute.name = "ReportEdit";

    const wrapper = mount(ReportFillPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Descargar PDF");
  });

  // ── Integration: draft → sign → archive flow ──────────────────────────────
  describe("draft → sign → archive lifecycle", () => {
    function mountWithModalStub() {
      return mount(ReportFillPage, {
        global: {
          stubs: {
            AppSidebar: true,
            TopBarLayout: true,
            Breadcrumb: true,
            DynamicFormRenderer: true,
            Modal: ModalStub,
          },
        },
      });
    }

    it("calls sign when user confirms sign modal", async () => {
      permMap = { "report.edit": true, "report.sign": true };
      mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };
      mockRoute.params = { id: "r1" };
      mockRoute.name = "ReportEdit";
      mockSign.mockResolvedValue(undefined);

      // Set signature so confirm button is not disabled
      mockSignatureValue.value = "data:image/png;base64,sig";

      const wrapper = mountWithModalStub();
      await flushPromises();

      // Open sign modal
      const firmarInformeBtn = wrapper.findAll("button").find((b) => b.text().includes("Firmar informe"));
      if (firmarInformeBtn) {
        await firmarInformeBtn.trigger("click");
        await flushPromises();
      }

      // Click "Confirmar firma" inside the modal
      const confirmBtn = wrapper.findAll("button").find((b) => b.text() === "Confirmar firma");
      if (confirmBtn) {
        await confirmBtn.trigger("click");
        await flushPromises();
      }

      expect(mockSign).toHaveBeenCalled();
    });

    it("does not sign when user cancels sign modal", async () => {
      permMap = { "report.edit": true, "report.sign": true };
      mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };
      mockRoute.params = { id: "r1" };
      mockRoute.name = "ReportEdit";

      const wrapper = mountWithModalStub();
      await flushPromises();

      // Open sign modal
      const firmarInformeBtn = wrapper.findAll("button").find((b) => b.text().includes("Firmar informe"));
      if (firmarInformeBtn) {
        await firmarInformeBtn.trigger("click");
        await flushPromises();
      }

      // Click "Cancelar" inside the modal
      const cancelBtn = wrapper.findAll("button").find((b) => b.text() === "Cancelar");
      if (cancelBtn) {
        await cancelBtn.trigger("click");
        await flushPromises();
      }

      expect(mockSign).not.toHaveBeenCalled();
    });

    it("calls archive when user confirms archive modal on signed report", async () => {
      permMap = { "report.edit": true, "report.archive": true };
      mockReport.value = { id: "r1", status: "signed", userId: 1, templateStructureSnapshot: { sections: [] } };
      mockRoute.params = { id: "r1" };
      mockRoute.name = "ReportEdit";
      mockArchive.mockResolvedValue(undefined);

      const wrapper = mountWithModalStub();
      await flushPromises();

      // Open archive modal
      const archivarBtn = wrapper.findAll("button").find((b) => b.text().includes("Archivar informe"));
      if (archivarBtn) {
        await archivarBtn.trigger("click");
        await flushPromises();
      }

      // Click "Archivar" inside the modal
      const confirmBtn = wrapper.findAll("button").find((b) => b.text() === "Archivar");
      if (confirmBtn) {
        await confirmBtn.trigger("click");
        await flushPromises();
      }

      expect(mockArchive).toHaveBeenCalled();
    });

    it("shows all buttons when user has all permissions on draft", async () => {
      permMap = {
        "report.edit": true,
        "report.sign": true,
        "report.archive": true,
        "report.download-pdf": true,
      };
      mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };
      mockRoute.params = { id: "r1" };
      mockRoute.name = "ReportEdit";

      const wrapper = mount(ReportFillPage, {
        global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
      });
      await flushPromises();

      expect(wrapper.text()).toContain("Guardar");
      expect(wrapper.text()).toContain("Firmar");
      expect(wrapper.text()).not.toContain("Archivar");
      expect(wrapper.text()).not.toContain("Descargar PDF");
    });

    it("hides all action buttons when user has only report.view", async () => {
      permMap = { "report.view": true };
      mockReport.value = { id: "r1", status: "draft", userId: 1, templateStructureSnapshot: { sections: [] } };
      mockRoute.params = { id: "r1" };
      mockRoute.name = "ReportEdit";

      const wrapper = mount(ReportFillPage, {
        global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
      });
      await flushPromises();

      expect(wrapper.text()).not.toContain("Guardar");
      expect(wrapper.text()).not.toContain("Firmar");
      expect(wrapper.text()).not.toContain("Archivar");
      expect(wrapper.text()).not.toContain("Descargar PDF");
    });
  });
});
