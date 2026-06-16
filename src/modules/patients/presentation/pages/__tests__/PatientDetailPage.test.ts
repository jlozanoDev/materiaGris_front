import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { ref } from "vue";

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
// Mock reports container — intercept PatientReportsTab's useReportList
// ============================================================================

vi.mock(
  "@/modules/reports/application/containers/reportsContainer",
  () => ({
    provideGetReportsUseCase: vi.fn(),
  }),
);

// ============================================================================
// Vuetify stubs — behave enough to test tab switching via v-model
// ============================================================================

const VTabsStub = {
  name: "VTabs",
  props: { modelValue: [String, Number] },
  emits: ["update:modelValue"],
  template: '<div class="v-tabs-stub"><slot /></div>',
};

const VTabStub = {
  name: "VTab",
  props: { value: [String, Number] },
  template: '<span class="v-tab-stub"><slot /></span>',
};

const VTabsWindowStub = {
  name: "VTabsWindow",
  props: { modelValue: [String, Number] },
  template: '<div class="v-tabs-window-stub"><slot /></div>',
};

const VTabsWindowItemStub = {
  name: "VTabsWindowItem",
  props: { value: [String, Number] },
  template: '<div class="v-tabs-window-item-stub"><slot /></div>',
};

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

  // Hydrate auth before mount so fetchUser resolves immediately
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
        "v-tabs": VTabsStub,
        "v-tab": VTabStub,
        "v-tabs-window": VTabsWindowStub,
        "v-tabs-window-item": VTabsWindowItemStub,
        transition: false,
        "transition-group": false,
      },
    },
  });
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

    // Access the component's internal activeTab ref
    expect((wrapper.vm as any).activeTab).toBe(0);
  });

  it("switches active tab when update:modelValue is emitted", async () => {
    const wrapper = createWrapper();
    await flushPromises();

    expect((wrapper.vm as any).activeTab).toBe(0);

    // Simulate clicking second tab by emitting on v-tabs
    const vTabs = wrapper.findComponent({ name: "VTabs" });
    await vTabs.vm.$emit("update:modelValue", "1");

    expect((wrapper.vm as any).activeTab).toBe("1");
  });

  // --- Nuevo informe link ---

  it('renders "Nuevo informe" button in the reports area', async () => {
    const wrapper = createWrapper();
    await flushPromises();

    // Patient is loaded, so the full content renders
    expect(wrapper.text()).toContain("+ Nuevo informe");
  });

  it('"Nuevo informe" button calls router.push with correct route', async () => {
    // Provide a resolved reports mock so the empty state renders "Nuevo informe"
    const wrapper = createWrapper();
    await flushPromises();

    // Find the "Nuevo informe" button and click it
    const newReportBtn = wrapper.findAll("button").filter((b) =>
      b.text().includes("Nuevo informe"),
    );
    // PatientReportsTab has one "Nuevo informe" button
    expect(newReportBtn.length).toBeGreaterThanOrEqual(1);

    await newReportBtn[0].trigger("click");

    expect(mockPush).toHaveBeenCalledWith({
      name: "ReportCreate",
      params: { id: "42" },
    });
  });

  // --- Loading state ---

  it("shows loading skeleton when patientLoading is true", async () => {
    // Keep the fetch pending so patientLoading stays true
    let resolveFetch: any;
    const pendingPromise = new Promise((r) => {
      resolveFetch = r;
    });
    const execute = vi.fn().mockReturnValue(pendingPromise);
    (provideGetPatientUseCase as any).mockReturnValue({ execute });

    const wrapper = createWrapper();
    // Flush promises so authStore.fetchUser resolves but fetchPatientById stays pending
    await flushPromises();

    // The skeleton uses animate-pulse class
    expect(wrapper.html()).toContain("animate-pulse");
    // Should NOT show patient content
    expect(wrapper.text()).not.toContain("Ana García");

    // Resolve the pending promise
    resolveFetch({ id: "42", first_name: "Ana", last_name: "García" });
    await flushPromises();

    // Now patient content should show
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
