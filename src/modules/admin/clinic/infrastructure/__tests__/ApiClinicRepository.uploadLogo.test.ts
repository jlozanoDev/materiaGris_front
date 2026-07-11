import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock("@/core/api/httpClient", () => ({
  fetchClient: vi.fn(),
}));

import { fetchClient } from "@/core/api/httpClient";
import ApiClinicRepository from "@/modules/admin/clinic/infrastructure/ApiClinicRepository";

const mockClinic = {
  id: 1,
  nombre: "Test Clinic",
  direccion: "Calle 123",
  telefono: "123456789",
  email: "test@clinica.com",
  ciudad: "Buenos Aires",
  provincia: "CABA",
  codigo_postal: "C1000",
};

function createRepo(): ApiClinicRepository {
  return new ApiClinicRepository();
}

describe("ApiClinicRepository.uploadLogo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends POST with FormData containing the file", async () => {
    (fetchClient as any).mockResolvedValue({
      ...mockClinic,
      logo: "https://example.com/storage/logos/1_new.png",
    });

    const repo = createRepo();
    const file = new File(["fake-png"], "logo.png", { type: "image/png" });
    const result = await repo.uploadLogo(file);

    // Verify fetchClient was called with the correct endpoint and options
    expect(fetchClient).toHaveBeenCalledTimes(1);
    const callArgs = (fetchClient as any).mock.calls[0];
    expect(callArgs[0]).toBe("/admin/clinic/logo");
    expect(callArgs[1]).toMatchObject({ method: "POST" });

    // Verify body is FormData with the file under 'logo' key
    const body = callArgs[1].body;
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("logo")).toBe(file);

    // Verify returned Clinic includes the logo URL
    expect(result.logo).toBe("https://example.com/storage/logos/1_new.png");
  });

  it("returns updated Clinic on success", async () => {
    const expectedClinic = {
      ...mockClinic,
      logo: "https://example.com/storage/logos/1_abc.png",
    };
    (fetchClient as any).mockResolvedValue(expectedClinic);

    const repo = createRepo();
    const file = new File(["fake"], "logo.png", { type: "image/png" });
    const result = await repo.uploadLogo(file);

    expect(result).toEqual(expectedClinic);
    expect(result.logo).toBe(expectedClinic.logo);
  });

  // --- Error handling ---

  it("propagates 413 (Payload Too Large) error", async () => {
    (fetchClient as any).mockRejectedValue({
      status: 413,
      body: { message: "File too large" },
    });

    const repo = createRepo();
    const file = new File(["x"], "big.png", { type: "image/png" });

    await expect(repo.uploadLogo(file)).rejects.toEqual({
      status: 413,
      body: { message: "File too large" },
    });
  });

  it("propagates 415 (Unsupported Media Type) error", async () => {
    (fetchClient as any).mockRejectedValue({
      status: 415,
      body: { message: "Unsupported type" },
    });

    const repo = createRepo();
    const file = new File(["x"], "bad.gif", { type: "image/gif" });

    await expect(repo.uploadLogo(file)).rejects.toEqual({
      status: 415,
      body: { message: "Unsupported type" },
    });
  });

  it("propagates 422 (Validation) error", async () => {
    (fetchClient as any).mockRejectedValue({
      status: 422,
      body: { message: "Logo already exists" },
    });

    const repo = createRepo();
    const file = new File(["x"], "logo.png", { type: "image/png" });

    await expect(repo.uploadLogo(file)).rejects.toEqual({
      status: 422,
      body: { message: "Logo already exists" },
    });
  });

  it("propagates 401/403 auth errors", async () => {
    for (const status of [401, 403]) {
      (fetchClient as any).mockRejectedValue({ status, body: {} });

      const repo = createRepo();
      const file = new File(["x"], "logo.png", { type: "image/png" });

      await expect(repo.uploadLogo(file)).rejects.toEqual({
        status,
        body: {},
      });
    }
  });

  it("wraps unknown errors in a generic message", async () => {
    (fetchClient as any).mockRejectedValue({
      status: 500,
      body: { message: "Server error" },
    });

    const repo = createRepo();
    const file = new File(["x"], "logo.png", { type: "image/png" });

    await expect(repo.uploadLogo(file)).rejects.toThrow(
      "Error al subir el logo",
    );
  });

  it("wraps network errors (status 0) in a generic message", async () => {
    (fetchClient as any).mockRejectedValue({
      status: 0,
      body: { message: "Error de conexión" },
    });

    const repo = createRepo();
    const file = new File(["x"], "logo.png", { type: "image/png" });

    await expect(repo.uploadLogo(file)).rejects.toThrow(
      "Error al subir el logo",
    );
  });
});
