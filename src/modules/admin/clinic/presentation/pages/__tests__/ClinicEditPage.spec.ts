import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Clinic } from "@/shared/types";

// ============================================================================
// Mock the DI container
// ============================================================================

const mockUpdateUseCase = { execute: vi.fn() };

vi.mock("@/modules/admin/clinic/application/containers/clinicContainer", () => ({
  provideUpdateClinicUseCase: () => mockUpdateUseCase,
  provideUploadClinicLogoUseCase: () => ({ execute: vi.fn() }),
}));

// ============================================================================
// Mock auth store
// ============================================================================

vi.mock("@/core/store/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/core/store/auth")>();
  const original = actual.useAuthStore;
  return {
    ...actual,
    useAuthStore: () => {
      const store = original();
      store.fetchUser = vi.fn().mockResolvedValue(null);
      store.hasPermission = vi.fn().mockReturnValue(true);
      store.user = { id: 1, name: "Admin", email: "admin@test.com", permissions: [] };
      return store;
    },
  };
});

// ============================================================================
// Mock vue-router
// ============================================================================

const mockRouterPush = vi.fn();

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRoute: () => ({ name: "AdminClinic" }),
    useRouter: () => ({
      push: mockRouterPush,
      replace: vi.fn(),
      currentRoute: { value: { name: "AdminClinic" } },
    }),
  };
});

// ============================================================================
// Fixtures
// ============================================================================

const mockClinic: Clinic = {
  id: 1,
  nombre: "Clínica Test",
  direccion: "Calle Falsa 123",
  telefono: "123456789",
  email: "test@clinica.com",
  ciudad: "Buenos Aires",
  provincia: "CABA",
  codigo_postal: "1000",
  web: "https://clinica.test.com",
  cuit: "30-12345678-9",
};

// Helper to create wrapper
async function createWrapper(clinicData: Clinic | null = mockClinic, loading = false, error: string | null = null) {
  const { mount, flushPromises } = await import("@vue/test-utils");
  const { setActivePinia, createPinia } = await import("pinia");
  const { useClinicStore } = await import("@/core/store/clinic");
  const ClinicEditPage = (await import("../ClinicEditPage.vue")).default;

  const pinia = createPinia();
  setActivePinia(pinia);

  const clinicStore = useClinicStore();
  clinicStore.clinic = clinicData;
  clinicStore.loading = loading;
  clinicStore.error = error;
  clinicStore.fetchClinic = vi.fn().mockResolvedValue(clinicData);

  const wrapper = mount(ClinicEditPage, {
    global: {
      plugins: [pinia],
      stubs: {
        AppSidebar: true,
        TopBar: true,
        Breadcrumb: {
          props: ["items"],
          template: '<div class="breadcrumb-stub"><slot /></div>',
        },
      },
    },
  });

  await flushPromises();
  return wrapper;
}

// ============================================================================
// Tests
// ============================================================================

describe("ClinicEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateUseCase.execute.mockReset();
    mockRouterPush.mockClear();
  });

  // --- Rendering ---

  it("renders the page title", async () => {
    const wrapper = await createWrapper();
    expect(wrapper.text()).toContain("Datos de la Clínica");
  }, 15000);

  it("renders breadcrumb", async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find(".breadcrumb-stub").exists()).toBe(true);
  });

  it("renders form fields with labels", async () => {
    const wrapper = await createWrapper();

    const labels = wrapper.findAll("label");
    const labelTexts = labels.map((l) => l.text()).filter((t) => t !== "");

    expect(labelTexts.some((t) => t.includes("Nombre"))).toBe(true);
    expect(labelTexts.some((t) => t.includes("Dirección"))).toBe(true);
    expect(labelTexts.some((t) => t.includes("Teléfono"))).toBe(true);
    expect(labelTexts.some((t) => t.includes("Email"))).toBe(true);
    expect(labelTexts.some((t) => t.includes("Ciudad"))).toBe(true);
    expect(labelTexts.some((t) => t.includes("Provincia"))).toBe(true);
    expect(labelTexts.some((t) => t.includes("Postal"))).toBe(true);
    expect(labelTexts.some((t) => t.includes("Sitio Web"))).toBe(true);
    expect(labelTexts.some((t) => t.includes("CUIT"))).toBe(true);
  });

  it("populates form inputs with clinic values", async () => {
    const wrapper = await createWrapper();

    const inputs = wrapper.findAll("input.form-input");
    const inputValues = inputs.map((i) => (i.element as HTMLInputElement).value);

    expect(inputValues).toContain("Clínica Test");
    expect(inputValues).toContain("Calle Falsa 123");
    expect(inputValues).toContain("test@clinica.com");
  });

  it("shows section header", async () => {
    const wrapper = await createWrapper();
    expect(wrapper.text()).toContain("Información institucional");
  });

  // --- Loading state ---

  it("shows loading skeleton when clinic is loading", async () => {
    const wrapper = await createWrapper(null, true);
    const skeleton = wrapper.findAll(".animate-pulse");
    expect(skeleton.length).toBeGreaterThanOrEqual(1);
  });

  // --- Error state ---

  it("shows error message when clinic fetch fails", async () => {
    const wrapper = await createWrapper(null, false, "Error al cargar los datos de la clínica");
    expect(wrapper.text()).toContain("Error al cargar los datos de la clínica");
  });

  // --- Empty state (no clinic yet) ---

  it("shows form even when no clinic data exists (empty form for creation)", async () => {
    const wrapper = await createWrapper(null);

    const labels = wrapper.findAll("label");
    const labelTexts = labels.map((l) => l.text()).filter((t) => t !== "");
    expect(labelTexts.some((t) => t.includes("Nombre"))).toBe(true);

    const inputs = wrapper.findAll("input.form-input");
    const values = inputs.map((i) => (i.element as HTMLInputElement).value);
    expect(values.every((v) => v === "")).toBe(true);

    expect(wrapper.text()).toContain("Guardar");
  });

  // --- Validation ---

  it("shows field-level validation errors on submit with empty required fields", async () => {
    const wrapper = await createWrapper(null);

    const form = wrapper.find("form");
    await form.trigger("submit");
    await (await import("@vue/test-utils")).flushPromises();

    expect(wrapper.text()).toContain("Nombre es requerido");
    expect(wrapper.text()).toContain("Dirección es requerido");
  });

  it("clears field error on input", async () => {
    const { flushPromises } = await import("@vue/test-utils");
    const wrapper = await createWrapper(null);

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(wrapper.text()).toContain("Nombre es requerido");

    const nombreInput = wrapper.find("#field-nombre");
    await nombreInput.setValue("Nueva Clínica");
    await flushPromises();

    expect(wrapper.text()).not.toContain("Nombre es requerido");
  });

  // --- Submit ---

  it("shows save and cancel buttons", async () => {
    const wrapper = await createWrapper();
    expect(wrapper.text()).toContain("Guardar");
    expect(wrapper.text()).toContain("Cancelar");
  });

  it("calls update use case on save", async () => {
    mockUpdateUseCase.execute.mockResolvedValue({ ...mockClinic });
    const wrapper = await createWrapper();

    await wrapper.find("form").trigger("submit");
    await (await import("@vue/test-utils")).flushPromises();

    expect(mockUpdateUseCase.execute).toHaveBeenCalled();
  });

  it("shows success message after save", async () => {
    mockUpdateUseCase.execute.mockResolvedValue({ ...mockClinic });
    const wrapper = await createWrapper();

    await wrapper.find("form").trigger("submit");
    await (await import("@vue/test-utils")).flushPromises();

    expect(wrapper.text()).toContain("Datos guardados correctamente");
  });

  it("shows error message when save fails with 422", async () => {
    mockUpdateUseCase.execute.mockRejectedValue({
      status: 422,
      body: { message: "Email inválido" },
    });
    const wrapper = await createWrapper();

    await wrapper.find("form").trigger("submit");
    await (await import("@vue/test-utils")).flushPromises();

    expect(wrapper.text()).toContain("Email inválido");
  });

  it("cancel button navigates to dashboard", async () => {
    const wrapper = await createWrapper();

    const buttons = wrapper.findAll("button");
    const cancelBtn = buttons.find((b) => b.text().includes("Cancelar"));
    await cancelBtn!.trigger("click");

    expect(mockRouterPush).toHaveBeenCalledWith({ name: "Dashboard" });
  });
});
