import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref } from "vue";

let permMap: Record<string, boolean> = {};
vi.mock("@/core/store/auth", () => ({
  useAuthStore: () => ({
    user: { id: 1, name: "Dr. Test" },
    hasPermission: (slug: string) => permMap[slug] ?? false,
    fetchUser: vi.fn(),
  }),
}));

const mockReports = ref<any[]>([]);
const mockLoading = ref(false);
const mockError = ref<unknown>(null);
const mockFetchReports = vi.fn();

vi.mock("@/modules/reports/presentation/composables/useReportList", () => ({
  useReportList: () => ({
    reports: mockReports,
    loading: mockLoading,
    error: mockError,
    fetchReports: mockFetchReports,
  }),
}));

const mockPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {}, query: {} }),
}));

import ReportListPage from "@/modules/reports/presentation/pages/ReportListPage.vue";

beforeEach(() => {
  vi.clearAllMocks();
  permMap = {};
  mockReports.value = [];
  mockLoading.value = false;
  mockError.value = null;
});

describe("ReportListPage", () => {
  it("fetches reports on mount", async () => {
    permMap = { "report.view": true };

    mount(ReportListPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb"] },
    });
    await flushPromises();

    expect(mockFetchReports).toHaveBeenCalled();
  });

  it("renders report rows in table", async () => {
    permMap = { "report.view": true };
    mockReports.value = [
      { id: "r1", patient_name: "Juan García", author_name: "Dr. A", template_name: "Cardiología", status: "draft", created_at: "2026-06-01", updated_at: "2026-06-02" },
      { id: "r2", patient_name: "Ana López", author_name: "Dr. B", template_name: "General", status: "signed", created_at: "2026-06-03", updated_at: "2026-06-04" },
    ];

    const wrapper = mount(ReportListPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Juan García");
    expect(wrapper.text()).toContain("Ana López");
  });

  it("shows empty state when no reports", async () => {
    permMap = { "report.view": true };
    mockReports.value = [];

    const wrapper = mount(ReportListPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("No hay informes");
  });

  it("shows error state with retry button", async () => {
    permMap = { "report.view": true };
    mockError.value = new Error("Network error");
    mockReports.value = [];

    const wrapper = mount(ReportListPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Error");
    expect(wrapper.text()).toContain("Reintentar");
  });

  it("navigates to report view on Ver click", async () => {
    permMap = { "report.view": true };
    mockReports.value = [
      { id: "r1", patient_name: "Juan", author_name: "Dr. A", template_name: "T1", status: "draft", created_at: "2026-06-01", updated_at: "2026-06-02" },
    ];

    const wrapper = mount(ReportListPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb"] },
    });
    await flushPromises();

    const buttons = wrapper.findAll("button");
    const viewBtn = buttons.find((b) => b.text().includes("Ver"));
    if (viewBtn) {
      await viewBtn.trigger("click");
      expect(mockPush).toHaveBeenCalledWith({ name: "ReportView", params: { id: "r1" } });
    }
  });

  it("renders status badges", async () => {
    permMap = { "report.view": true };
    mockReports.value = [
      { id: "r1", patient_name: "P1", author_name: "A1", template_name: "T1", status: "draft", created_at: "", updated_at: "" },
      { id: "r2", patient_name: "P2", author_name: "A2", template_name: "T2", status: "signed", created_at: "", updated_at: "" },
      { id: "r3", patient_name: "P3", author_name: "A3", template_name: "T3", status: "closed", created_at: "", updated_at: "" },
    ];

    const wrapper = mount(ReportListPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb"] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Borrador");
    expect(wrapper.text()).toContain("Firmado");
    expect(wrapper.text()).toContain("Cerrado");
  });

  it("renders loading state", async () => {
    permMap = { "report.view": true };
    mockLoading.value = true;

    const wrapper = mount(ReportListPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb"] },
    });

    expect(wrapper.text()).toContain("Cargando");
  });

  // ── Edit button ─────────────────────────────────────────────
  it("shows Editar button for draft reports when user has report.edit", async () => {
    permMap = { "report.view": true, "report.edit": true };
    mockReports.value = [
      { id: "r1", patient_name: "Juan", author_name: "Dr. A", template_name: "T1", status: "draft", createdAt: "2026-06-01", updatedAt: "2026-06-02" },
    ];

    const wrapper = mount(ReportListPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb"] },
    });
    await flushPromises();

    const editBtn = wrapper.findAll("button").find((b) => b.attributes("title") === "Editar");
    expect(editBtn).toBeDefined();
  });

  it("hides Editar button for signed reports even with report.edit", async () => {
    permMap = { "report.view": true, "report.edit": true };
    mockReports.value = [
      { id: "r1", patient_name: "Juan", author_name: "Dr. A", template_name: "T1", status: "signed", createdAt: "2026-06-01", updatedAt: "2026-06-02" },
    ];

    const wrapper = mount(ReportListPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb"] },
    });
    await flushPromises();

    const editBtn = wrapper.findAll("button").find((b) => b.attributes("title") === "Editar");
    expect(editBtn).toBeUndefined();
  });

  it("navigates to ReportEdit when Editar is clicked", async () => {
    permMap = { "report.view": true, "report.edit": true };
    mockReports.value = [
      { id: "r1", patient_name: "Juan", author_name: "Dr. A", template_name: "T1", status: "draft", createdAt: "2026-06-01", updatedAt: "2026-06-02" },
    ];

    const wrapper = mount(ReportListPage, {
      global: { stubs: ["AppSidebar", "TopBarLayout", "Breadcrumb"] },
    });
    await flushPromises();

    const editBtn = wrapper.findAll("button").find((b) => b.attributes("title") === "Editar");
    expect(editBtn).toBeDefined();
    await editBtn!.trigger("click");

    expect(mockPush).toHaveBeenCalledWith({ name: "ReportEdit", params: { id: "r1" } });
  });
});
