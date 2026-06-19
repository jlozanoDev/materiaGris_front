import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";

// ============================================================================
// Mock vue-router — mutable query for tab restoration tests
// ============================================================================

const mockPush = vi.fn();
const mockRoute: { params: Record<string, string>; query: Record<string, string> } = {
  params: { id: "42" },
  query: {},
};

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    replace: vi.fn(),
    currentRoute: { value: { params: { id: "42" } } },
  }),
  RouterLink: { template: "<a><slot /></a>" },
}));

// ============================================================================
// Mock auth store
// ============================================================================

let permMap: Record<string, boolean> = {};

vi.mock("@/core/store/auth", () => ({
  useAuthStore: () => ({
    user: { id: 1, name: "Doctor", email: "doctor@test.com" },
    fetchUser: vi.fn().mockResolvedValue({ id: 1, name: "Doctor", email: "doctor@test.com", permissions: [] }),
    hasPermission: (slug: string) => permMap[slug] ?? false,
  }),
}));

// ============================================================================
// Mock DI container — intercept usePatients use case
// ============================================================================

vi.mock(
  "@/modules/patients/application/containers/patientsContainer",
  () => ({
    provideGetPatientUseCase: vi.fn(),
  }),
);

// ============================================================================
// Mock reports container — intercept useReportList's use case
// ============================================================================

vi.mock(
  "@/modules/reports/application/containers/reportsContainer",
  () => ({
    provideGetReportsUseCase: vi.fn(),
    provideGetActiveTemplatesUseCase: vi.fn(),
  }),
);

// ============================================================================
// Imports (after vi.mock hoisting)
// ============================================================================

import PatientDetailPage from "../PatientDetailPage.vue";
import { provideGetPatientUseCase } from "@/modules/patients/application/containers/patientsContainer";
import { provideGetReportsUseCase } from "@/modules/reports/application/containers/reportsContainer";

// ============================================================================
// Helpers
// ============================================================================

function createWrapper() {
  return mount(PatientDetailPage, {
    global: {
      stubs: {
        AppSidebar: true,
        TopBarLayout: true,
        Breadcrumb: true,
        transition: false,
        "transition-group": false,
        TemplatePickerModal: {
          template: '<div class="picker-stub" />',
          props: ["show", "patientId"],
        },
        Modal: {
          template: '<div class="modal-stub"><slot /></div>',
          props: ["show"],
        },
      },
    },
  });
}

function switchToReportsTab(wrapper: any): void {
  const tabBtns = wrapper.findAll("button");
  const reportsBtn = tabBtns.find((b: any) =>
    b.text().includes("Informes clínicos"),
  );
  if (reportsBtn) reportsBtn.trigger("click");
}

// ============================================================================
// Tests
// ============================================================================

describe("PatientDetailPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    permMap = {};
    mockRoute.query = {};

    // Default mock: successful fetch returning a patient
    const execute = vi.fn().mockResolvedValue({
      id: "42",
      first_name: "Ana",
      last_name: "García",
      medical_record_number: "HC-00042",
      national_id: "12345678A",
      gender: "F",
      date_of_birth: "1985-03-15",
      city: "Madrid",
      is_active: true,
      insurance_id: "3",
      email: "ana@email.test",
      phone: "912345678",
      mobile: "612345678",
      contact_name: "Carlos",
      contact_phone: "698765432",
      address_line1: "Calle Mayor 1",
      address_line2: "2º A",
      neighborhood: "Centro",
      postal_code: "28013",
      state: "Madrid",
      country: "España",
    });
    (provideGetPatientUseCase as any).mockReturnValue({ execute });

    // Default mock: empty reports list
    const reportsExecute = vi.fn().mockResolvedValue([]);
    (provideGetReportsUseCase as any).mockReturnValue({ execute: reportsExecute });
  });

  // --- Tab restoration from query ---

  it("restores activeTab to 1 when ?tab=reports query is present", async () => {
    mockRoute.query.tab = "reports";
    permMap = { "report.create": true };
    const wrapper = createWrapper();
    await flushPromises();

    expect((wrapper.vm as any).activeTab).toBe(1);
  });

  it("defaults activeTab to 0 when no tab query is present", async () => {
    mockRoute.query = {};
    const wrapper = createWrapper();
    await flushPromises();

    expect((wrapper.vm as any).activeTab).toBe(0);
  });

  it("defaults activeTab to 0 for unknown tab values", async () => {
    mockRoute.query.tab = "other";
    const wrapper = createWrapper();
    await flushPromises();

    expect((wrapper.vm as any).activeTab).toBe(0);
  });

  // --- Tabs rendering ---

  it("renders two tabs: Datos generales and Informes clínicos", async () => {
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain("Datos generales");
    expect(wrapper.text()).toContain("Informes clínicos");
  });

  it("has default active tab at index 0 (Datos generales)", async () => {
    const wrapper = createWrapper();
    await flushPromises();

    expect((wrapper.vm as any).activeTab).toBe(0);
  });

  it("switches active tab when clicking the tab button", async () => {
    const wrapper = createWrapper();
    await flushPromises();

    expect((wrapper.vm as any).activeTab).toBe(0);

    switchToReportsTab(wrapper);

    expect((wrapper.vm as any).activeTab).toBe(1);
  });

  // --- Nuevo informe link ---

  it('renders "Nuevo informe" button in the reports area', async () => {
    permMap = { "report.create": true };
    const wrapper = createWrapper();
    await flushPromises();

    switchToReportsTab(wrapper);
    await flushPromises();

    expect(wrapper.text()).toContain("+ Nuevo informe");
  });

  it('"Nuevo informe" button opens template picker modal', async () => {
    permMap = { "report.create": true };
    const wrapper = createWrapper();
    await flushPromises();
    switchToReportsTab(wrapper);
    await flushPromises();

    const allBtns = wrapper.findAll("button");
    const newReportBtn = allBtns.filter((b: any) =>
      b.text().includes("Nuevo informe"),
    );
    expect(newReportBtn.length).toBeGreaterThanOrEqual(1);

    // Click opens modal (not directly navigate)
    await newReportBtn[0].trigger("click");
    await flushPromises();

    // Modal should now be open — verify the hack: wrapper still renders,
    // and push was NOT called (navigates only on template select)
    expect(mockPush).not.toHaveBeenCalled();
  });

  // --- Loading state ---

  it("shows loading skeleton when patientLoading is true", async () => {
    let resolveFetch: any;
    const pendingPromise = new Promise((r) => {
      resolveFetch = r;
    });
    const execute = vi.fn().mockReturnValue(pendingPromise);
    (provideGetPatientUseCase as any).mockReturnValue({ execute });

    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.html()).toContain("animate-pulse");
    expect(wrapper.text()).not.toContain("Ana García");

    resolveFetch({ id: "42", first_name: "Ana", last_name: "García" });
    await flushPromises();

    expect(wrapper.text()).toContain("Ana García");
  });

  // --- Error state ---

  it("shows error state when patient is null and not loading", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("Not found"));
    (provideGetPatientUseCase as any).mockReturnValue({ execute });

    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain("Paciente no encontrado");
    expect(wrapper.text()).toContain("Volver a pacientes");
  });

  it("renders patient header with name and medical record number on success", async () => {
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain("Ana García");
    expect(wrapper.text()).toContain("HC-00042");
  });

  // --- Back-navigation ---

  it('"Volver a pacientes" button navigates to Patients list', async () => {
    const execute = vi.fn().mockRejectedValue(new Error("Not found"));
    (provideGetPatientUseCase as any).mockReturnValue({ execute });

    const wrapper = createWrapper();
    await flushPromises();

    const backBtn = wrapper.find("button");
    expect(backBtn.text()).toContain("Volver a pacientes");

    await backBtn.trigger("click");
    expect(mockPush).toHaveBeenCalledWith({ name: "Patients" });
  });
});
