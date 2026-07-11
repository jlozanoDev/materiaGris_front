import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Clinic } from "@/shared/types";

// ============================================================================
// Mock the DI container
// ============================================================================

const mockUpdateUseCase = { execute: vi.fn() };

vi.mock("@/modules/admin/clinic/application/containers/clinicContainer", () => ({
  provideUpdateClinicUseCase: () => mockUpdateUseCase,
}));

// ============================================================================
// Fixture
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

// ============================================================================
// Helper
// ============================================================================

async function setup(clinicData: Clinic | null = null) {
  const { ref } = await import("vue");
  const { setActivePinia, createPinia } = await import("pinia");
  const { useClinicForm } = await import("../useClinicForm");

  setActivePinia(createPinia());
  const clinicRef = ref<Clinic | null>(clinicData);
  return useClinicForm(clinicRef);
}

// ============================================================================
// Tests
// ============================================================================

describe("useClinicForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateUseCase.execute.mockReset();
  });

  // --- Initial state ---

  it("initializes form with empty values", async () => {
    const { form } = await setup();
    expect(form.nombre).toBe("");
    expect(form.direccion).toBe("");
    expect(form.email).toBe("");
    expect(form.cuit).toBe("");
  });

  // --- Sync ---

  it("syncForm populates fields from clinic ref", async () => {
    const { ref } = await import("vue");
    const { setActivePinia, createPinia } = await import("pinia");
    const { useClinicForm } = await import("../useClinicForm");

    setActivePinia(createPinia());
    const clinicRef = ref<Clinic | null>(mockClinic);
    const { form, syncForm } = useClinicForm(clinicRef);

    expect(form.nombre).toBe("");
    syncForm();
    expect(form.nombre).toBe("Clínica Test");
    expect(form.email).toBe("test@clinica.com");
    expect(form.cuit).toBe("30-12345678-9");
  });

  it("syncForm does nothing when clinic ref is null", async () => {
    const { form, syncForm } = await setup(null);
    syncForm();
    expect(form.nombre).toBe("");
  });

  // --- Validation ---

  it("validate returns true when all required fields are filled", async () => {
    const { form, validate } = await setup();
    form.nombre = "Clínica";
    form.direccion = "Calle 123";
    form.telefono = "123";
    form.email = "a@b.com";
    form.ciudad = "CABA";
    form.provincia = "CABA";
    form.codigo_postal = "1000";

    expect(validate()).toBe(true);
  });

  it("validate returns false and sets errors for empty required fields", async () => {
    const { validate, fieldErrors } = await setup();
    expect(validate()).toBe(false);
    expect(fieldErrors.value.nombre).toBe("Nombre es requerido");
    expect(fieldErrors.value.direccion).toBe("Dirección es requerido");
  });

  it("validate catches invalid email", async () => {
    const { form, validate, fieldErrors } = await setup();
    form.nombre = "C";
    form.direccion = "D";
    form.telefono = "T";
    form.email = "not-an-email";
    form.ciudad = "C";
    form.provincia = "P";
    form.codigo_postal = "CP";

    expect(validate()).toBe(false);
    expect(fieldErrors.value.email).toBe("Email inválido");
  });

  it("validate catches invalid URL in web field", async () => {
    const { form, validate, fieldErrors } = await setup();
    form.nombre = "C";
    form.direccion = "D";
    form.telefono = "T";
    form.email = "a@b.com";
    form.ciudad = "C";
    form.provincia = "P";
    form.codigo_postal = "CP";
    form.web = "not-a-url";

    expect(validate()).toBe(false);
    expect(fieldErrors.value.web).toBe("URL inválida");
  });

  it("clearFieldError removes error for a field", async () => {
    const { validate, clearFieldError, fieldErrors } = await setup();
    validate();
    expect(fieldErrors.value.nombre).not.toBeNull();

    clearFieldError("nombre");
    expect(fieldErrors.value.nombre).toBeNull();
  });

  // --- Submit ---

  it("submit returns false when validation fails", async () => {
    const { submit } = await setup();
    const ok = await submit();
    expect(ok).toBe(false);
    expect(mockUpdateUseCase.execute).not.toHaveBeenCalled();
  });

  it("submit calls use case and returns true on success", async () => {
    const { ref } = await import("vue");
    const { setActivePinia, createPinia } = await import("pinia");
    const { useClinicForm } = await import("../useClinicForm");

    setActivePinia(createPinia());
    const clinicRef = ref<Clinic | null>(mockClinic);
    const { form, syncForm, submit } = useClinicForm(clinicRef);
    syncForm();
    mockUpdateUseCase.execute.mockResolvedValue({ ...mockClinic, nombre: "Updated" });

    const ok = await submit();
    expect(ok).toBe(true);
    expect(mockUpdateUseCase.execute).toHaveBeenCalled();
  });

  it("submit sets saveError on 422 validation error", async () => {
    const { ref } = await import("vue");
    const { setActivePinia, createPinia } = await import("pinia");
    const { useClinicForm } = await import("../useClinicForm");

    setActivePinia(createPinia());
    const clinicRef = ref<Clinic | null>(mockClinic);
    const { form, syncForm, submit, saveError } = useClinicForm(clinicRef);
    syncForm();
    mockUpdateUseCase.execute.mockRejectedValue({
      status: 422,
      body: { message: "Email inválido" },
    });

    const ok = await submit();
    expect(ok).toBe(false);
    expect(saveError.value).toBe("Email inválido");
  });

  it("submit sets saveError on 403 forbidden", async () => {
    const { ref } = await import("vue");
    const { setActivePinia, createPinia } = await import("pinia");
    const { useClinicForm } = await import("../useClinicForm");

    setActivePinia(createPinia());
    const clinicRef = ref<Clinic | null>(mockClinic);
    const { form, syncForm, submit, saveError } = useClinicForm(clinicRef);
    syncForm();
    mockUpdateUseCase.execute.mockRejectedValue({ status: 403 });

    await submit();
    expect(saveError.value).toBe("No tienes permisos para actualizar la clínica");
  });

  it("submit sets saveError on 500 server error", async () => {
    const { ref } = await import("vue");
    const { setActivePinia, createPinia } = await import("pinia");
    const { useClinicForm } = await import("../useClinicForm");

    setActivePinia(createPinia());
    const clinicRef = ref<Clinic | null>(mockClinic);
    const { form, syncForm, submit, saveError } = useClinicForm(clinicRef);
    syncForm();
    mockUpdateUseCase.execute.mockRejectedValue({ status: 500 });

    await submit();
    expect(saveError.value).toBe("Error interno del servidor");
  });

  it("sets saving to true during submit and false after", async () => {
    const { ref } = await import("vue");
    const { setActivePinia, createPinia } = await import("pinia");
    const { useClinicForm } = await import("../useClinicForm");

    setActivePinia(createPinia());
    const clinicRef = ref<Clinic | null>(mockClinic);
    const { form, syncForm, submit, saving } = useClinicForm(clinicRef);
    syncForm();
    mockUpdateUseCase.execute.mockResolvedValue({ ...mockClinic });

    const promise = submit();
    expect(saving.value).toBe(true);
    await promise;
    expect(saving.value).toBe(false);
  });
});
