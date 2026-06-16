import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";

// ============================================================================
// Mock vue-router
// ============================================================================

const mockPush = vi.fn();

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "42" } }),
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    replace: vi.fn(),
    currentRoute: { value: { params: { id: "42" } } },
  }),
  RouterLink: { template: "<a><slot /></a>" },
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
  }),
);

// ============================================================================
// Imports (after vi.mock hoisting)
// ============================================================================

import PatientDetailPage from "../PatientDetailPage.vue";
import { useAuthStore } from "@/core/store/auth";
import { provideGetPatientUseCase } from "@/modules/patients/application/containers/patientsContainer";
import { provideGetReportsUseCase } from "@/modules/reports/application/containers/reportsContainer";

// ============================================================================
// Helpers
// ============================================================================

function createWrapper() {
  const authStore = useAuthStore();

  authStore.user = {
    id: 1,
    name: "Doctor",
    email: "doctor@test.com",
    permissions: [],
  };
  vi.spyOn(authStore, "fetchUser").mockResolvedValue(authStore.user);

  return mount(PatientDetailPage, {
    global: {
      stubs: {
        AppSidebar: true,
        TopBarLayout: true,
        Breadcrumb: true,
        transition: false,
        "transition-group": false,
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
    const wrapper = createWrapper();
    await flushPromises();

    switchToReportsTab(wrapper);
    await flushPromises();

    expect(wrapper.text()).toContain("+ Nuevo informe");
  });

  it('"Nuevo informe" button calls router.push with correct route', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    switchToReportsTab(wrapper);
    await flushPromises();

    const allBtns = wrapper.findAll("button");
    const newReportBtn = allBtns.filter((b: any) =>
      b.text().includes("Nuevo informe"),
    );
    expect(newReportBtn.length).toBeGreaterThanOrEqual(1);

    await newReportBtn[0].trigger("click");

    expect(mockPush).toHaveBeenCalledWith({
      name: "ReportCreate",
      params: { id: "42" },
    });
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
