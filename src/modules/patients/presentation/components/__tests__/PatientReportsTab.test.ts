import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";

// ── Auth mock ─────────────────────────────────────────────────────────────────
let permMap: Record<string, boolean> = {};
vi.mock("@/core/store/auth", () => ({
  useAuthStore: () => ({
    user: { id: 1, name: "Dr. Test" },
    hasPermission: (slug: string) => permMap[slug] ?? false,
  }),
}));

// ── Router mock ───────────────────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: { id: "42" } }),
}));

// ── useReportList mock ────────────────────────────────────────────────────────
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

// ── useTemplateList mock ──────────────────────────────────────────────────────
const mockTemplates = ref<any[]>([]);
const mockFetchActive = vi.fn();

vi.mock("@/modules/reports/presentation/composables/useTemplateList", () => ({
  useTemplateList: () => ({
    templates: mockTemplates,
    loading: ref(false),
    error: ref(null),
    fetchActive: mockFetchActive,
  }),
}));

import PatientReportsTab from "../PatientReportsTab.vue";

beforeEach(() => {
  vi.clearAllMocks();
  permMap = {};
  mockReports.value = [];
  mockTemplates.value = [];
  mockLoading.value = false;
  mockError.value = null;
});

function createWrapper() {
  return mount(PatientReportsTab, {
    props: {
      patientId: "42",
    },
    global: {
      stubs: {
        Teleport: true,
        Modal: {
          template: '<div class="modal-stub"><slot /></div>',
          props: ["show"],
        },
        TemplatePickerModal: {
          template:
            '<div class="picker-stub" :data-show="show"><button class="fake-select" @click="$emit(\'select\', { id: \'1\', name: \'T1\' })">Select</button></div>',
          props: ["show", "patientId"],
          inheritAttrs: false,
        },
      },
    },
  });
}

describe("PatientReportsTab", () => {
  // ── Permission guard ────────────────────────────────────────────────────
  it('shows "+ Nuevo" button when user has report.create', async () => {
    permMap = { "report.create": true };
    mockReports.value = [];
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain("+ Nuevo informe");
  });

  it('hides "+ Nuevo" button when user lacks report.create', async () => {
    permMap = {};
    mockReports.value = [];
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.text()).not.toContain("+ Nuevo informe");
  });

  // ── Modal interaction ───────────────────────────────────────────────────
  it('opens TemplatePickerModal when "+ Nuevo" is clicked', async () => {
    permMap = { "report.create": true };
    mockReports.value = [];
    mockTemplates.value = [{ id: "1", name: "T1", isActive: true }];
    const wrapper = createWrapper();
    await flushPromises();

    const newBtn = wrapper.find("button");
    await newBtn.trigger("click");
    await flushPromises();

    const pickerStub = wrapper.find(".picker-stub");
    expect(pickerStub.attributes("data-show")).toBe("true");
  });

  // ── Disabled button when no templates ────────────────────────────────────
  it('shows "+ Nuevo" button disabled when user has permission but no templates', async () => {
    permMap = { "report.create": true };
    mockReports.value = [];
    mockTemplates.value = [];
    const wrapper = createWrapper();
    await flushPromises();

    const newBtn = wrapper.find("button");
    expect(newBtn.exists()).toBe(true);
    expect(newBtn.attributes("disabled")).toBeDefined();
  });

  // ── Click navigation ────────────────────────────────────────────────────
  it("navigates to ReportView when a report item is clicked", async () => {
    permMap = { "report.create": true };
    mockReports.value = [
      { id: "r1", status: "draft", template_name: "T1", createdAt: "2026-01-01" },
    ];
    const wrapper = createWrapper();
    await flushPromises();

    // The reports list renders items with cursor-pointer
    const reportItem = wrapper.find(".cursor-pointer");
    expect(reportItem.exists()).toBe(true);

    await reportItem.trigger("click");
    expect(mockPush).toHaveBeenCalledWith({
      name: "ReportView",
      params: { id: "r1" },
      query: { from: "patient", patientId: "42" },
    });
  });

  // ── Empty state ─────────────────────────────────────────────────────────
  it("shows empty message when no reports", async () => {
    permMap = { "report.create": true };
    mockReports.value = [];
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain("No hay informes clínicos para este paciente");
  });

  // ── Edit button ─────────────────────────────────────────────────
  it('shows Editar button for draft reports when user has report.edit', async () => {
    permMap = { "report.create": true, "report.edit": true };
    mockReports.value = [
      { id: "r1", status: "draft", template_name: "T1", createdAt: "2026-01-01" },
    ];
    const wrapper = createWrapper();
    await flushPromises();

    const editBtn = wrapper.findAll("button").find((b) => b.text() === "Editar");
    expect(editBtn).toBeDefined();
  });

  it('hides Editar button for signed reports even with report.edit', async () => {
    permMap = { "report.create": true, "report.edit": true };
    mockReports.value = [
      { id: "r1", status: "signed", template_name: "T1", createdAt: "2026-01-01" },
    ];
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.text()).not.toContain("Editar");
  });

  it('navigates to ReportEdit when Editar is clicked, not ReportView', async () => {
    permMap = { "report.create": true, "report.edit": true };
    mockReports.value = [
      { id: "r1", status: "draft", template_name: "T1", createdAt: "2026-01-01" },
    ];
    const wrapper = createWrapper();
    await flushPromises();

    const editBtn = wrapper.findAll("button").find((b) => b.text() === "Editar");
    expect(editBtn).toBeDefined();
    await editBtn!.trigger("click");

    expect(mockPush).toHaveBeenCalledWith({
      name: "ReportEdit",
      params: { id: "r1" },
    });
    expect(mockPush).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: "ReportView" }),
    );
  });
});
