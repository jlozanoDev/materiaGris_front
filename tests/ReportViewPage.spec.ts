import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref } from "vue";

let permMap: Record<string, boolean> = {};
vi.mock("@/core/store/auth", () => ({
  useAuthStore: () => ({
    user: { id: 1, name: "Dr. Test" },
    hasPermission: (slug: string) => permMap[slug] ?? false,
  }),
}));

const mockReport = ref<any>(null);
const mockLoadReport = vi.fn();
const mockDownloadPdf = vi.fn();

vi.mock("@/modules/reports/presentation/composables/useReportForm", () => ({
  useReportForm: () => ({
    report: mockReport,
    loadReport: mockLoadReport,
    downloadPdf: mockDownloadPdf,
  }),
}));

const mockPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: { id: "r1" } }),
}));

import ReportViewPage from "@/modules/reports/presentation/pages/ReportViewPage.vue";

beforeEach(() => {
  vi.clearAllMocks();
  permMap = {};
  mockReport.value = null;
});

describe("ReportViewPage", () => {
  it("loads report on mount", async () => {
    permMap = { "report.view": true };
    mockReport.value = { id: "r1", status: "signed", user_id: 1, template_structure_snapshot: { sections: [] } };

    mount(ReportViewPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(mockLoadReport).toHaveBeenCalledWith("r1");
  });

  it("shows Descargar PDF for signed report when user has report.download-pdf", async () => {
    permMap = { "report.view": true, "report.download-pdf": true };
    mockReport.value = { id: "r1", status: "signed", user_id: 1, template_structure_snapshot: { sections: [] } };

    const wrapper = mount(ReportViewPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Descargar PDF");
  });

  it("hides Descargar PDF for draft report", async () => {
    permMap = { "report.view": true, "report.download-pdf": true };
    mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };

    const wrapper = mount(ReportViewPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Descargar PDF");
  });

  it("hides Descargar PDF when user lacks report.download-pdf", async () => {
    permMap = { "report.view": true };
    mockReport.value = { id: "r1", status: "signed", user_id: 1, template_structure_snapshot: { sections: [] } };

    const wrapper = mount(ReportViewPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Descargar PDF");
  });

  it("renders Volver button", async () => {
    permMap = { "report.view": true };
    mockReport.value = { id: "r1", status: "draft", user_id: 1, template_structure_snapshot: { sections: [] } };

    const wrapper = mount(ReportViewPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Volver");
  });

  // ── Edit button ─────────────────────────────────────────────
  it("shows Editar button for draft reports when user has report.edit", async () => {
    permMap = { "report.view": true, "report.edit": true };
    mockReport.value = { id: "r1", status: "draft", user_id: 1, templateStructureSnapshot: { sections: [] } };

    const wrapper = mount(ReportViewPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Editar");
  });

  it("hides Editar button for signed reports even with report.edit", async () => {
    permMap = { "report.view": true, "report.edit": true };
    mockReport.value = { id: "r1", status: "signed", user_id: 1, templateStructureSnapshot: { sections: [] } };

    const wrapper = mount(ReportViewPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Editar");
  });

  it("navigates to ReportEdit when Editar is clicked", async () => {
    permMap = { "report.view": true, "report.edit": true };
    mockReport.value = { id: "r1", status: "draft", user_id: 1, templateStructureSnapshot: { sections: [] } };

    const wrapper = mount(ReportViewPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb", "DynamicFormRenderer"] },
    });
    await flushPromises();

    const editBtn = wrapper.findAll("button").find((b) => b.text().includes("Editar"));
    expect(editBtn).toBeDefined();
    await editBtn!.trigger("click");

    expect(mockPush).toHaveBeenCalledWith({ name: "ReportEdit", params: { id: "r1" } });
  });
});
