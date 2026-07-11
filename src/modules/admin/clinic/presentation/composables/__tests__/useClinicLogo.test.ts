import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────────

// Mock URL.createObjectURL and revokeObjectURL for jsdom
URL.createObjectURL = vi.fn(() => "blob:http://localhost/mock-blob");
URL.revokeObjectURL = vi.fn();

const mockExecute = vi.fn();
vi.mock("@/modules/admin/clinic/application/containers/clinicContainer", () => ({
  provideUploadClinicLogoUseCase: () => ({ execute: mockExecute }),
}));

vi.mock("@/core/store/clinic", () => ({
  useClinicStore: vi.fn(() => ({
    clinic: { value: null },
    updateLogo: vi.fn(),
  })),
}));

// ============================================================================
// Tests
// ============================================================================

describe("useClinicLogo", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockExecute.mockReset();
  });

  // --- Initial state ---

  it("initializes all reactive refs with default values", async () => {
    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();

    expect(logo.selectedFile.value).toBeNull();
    expect(logo.previewUrl.value).toBeNull();
    expect(logo.uploading.value).toBe(false);
    expect(logo.uploadError.value).toBeNull();
    expect(logo.typeError.value).toBeNull();
    expect(logo.sizeError.value).toBeNull();
  });

  // --- Validation ---

  it("validate returns true for PNG file under 5MB", async () => {
    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();
    const file = new File(["fake-png"], "logo.png", { type: "image/png" });

    expect(logo.validate(file)).toBe(true);
    expect(logo.typeError.value).toBeNull();
    expect(logo.sizeError.value).toBeNull();
  });

  it("validate returns true for JPG, SVG, WebP files", async () => {
    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();

    const types = [
      { name: "logo.jpg", type: "image/jpeg" },
      { name: "logo.svg", type: "image/svg+xml" },
      { name: "logo.webp", type: "image/webp" },
    ];

    for (const { name, type } of types) {
      const file = new File(["fake"], name, { type });
      expect(logo.validate(file)).toBe(true);
    }
  });

  it("validate returns false and sets typeError for unsupported MIME", async () => {
    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();
    const file = new File(["fake-gif"], "logo.gif", { type: "image/gif" });

    expect(logo.validate(file)).toBe(false);
    expect(logo.typeError.value).toBe(
      "Tipo de archivo no válido. Solo se aceptan PNG, JPG, SVG y WebP.",
    );
    expect(logo.sizeError.value).toBeNull();
  });

  it("validate returns false and sets sizeError for oversized file", async () => {
    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();
    const oversized = new ArrayBuffer(5 * 1024 * 1024 + 1);
    const file = new File([oversized], "large.png", { type: "image/png" });

    expect(logo.validate(file)).toBe(false);
    expect(logo.sizeError.value).toBe(
      "El archivo excede el tamaño máximo de 5MB.",
    );
    expect(logo.typeError.value).toBeNull();
  });

  it("validate clears previous errors when called with valid file", async () => {
    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();
    const gif = new File(["x"], "bad.gif", { type: "image/gif" });
    logo.validate(gif);
    expect(logo.typeError.value).not.toBeNull();

    const png = new File(["x"], "ok.png", { type: "image/png" });
    expect(logo.validate(png)).toBe(true);
    expect(logo.typeError.value).toBeNull();
  });

  // --- Upload ---

  it("upload calls use case execute with valid file", async () => {
    mockExecute.mockResolvedValue({
      id: 1,
      logo: "https://example.com/storage/logos/1_abc.png",
    });

    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();
    const file = new File(["fake"], "logo.png", { type: "image/png" });

    const ok = await logo.upload(file);

    expect(ok).toBe(true);
    expect(mockExecute).toHaveBeenCalledWith(file);
  });

  it("upload sets uploading to true during execution", async () => {
    mockExecute.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ id: 1, logo: "url" }), 50),
        ),
    );

    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();
    const file = new File(["fake"], "logo.png", { type: "image/png" });

    const promise = logo.upload(file);
    expect(logo.uploading.value).toBe(true);
    await promise;
    expect(logo.uploading.value).toBe(false);
  });

  it("upload returns false and sets error on use case failure", async () => {
    mockExecute.mockRejectedValue({ status: 422, body: { message: "Invalid" } });

    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();
    const file = new File(["fake"], "logo.png", { type: "image/png" });

    const ok = await logo.upload(file);
    expect(ok).toBe(false);
    expect(logo.uploadError.value).toBe("Invalid");
  });

  it("upload returns false on validation rejection before calling use case", async () => {
    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();
    const file = new File(["x"], "bad.gif", { type: "image/gif" });

    const ok = await logo.upload(file);
    expect(ok).toBe(false);
    expect(mockExecute).not.toHaveBeenCalled();
    expect(logo.typeError.value).not.toBeNull();
  });

  it("upload sets preview to object URL for selected file", async () => {
    mockExecute.mockResolvedValue({
      id: 1,
      logo: "https://example.com/storage/logos/1_abc.png",
    });

    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();
    const file = new File(["fake"], "logo.png", { type: "image/png" });

    await logo.upload(file);
    // After upload, preview should be the server URL, not object URL
    expect(logo.previewUrl.value).toBe(
      "https://example.com/storage/logos/1_abc.png",
    );
  });

  // --- Clear ---

  it("clear resets all reactive state", async () => {
    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();
    const file = new File(["fake"], "logo.png", { type: "image/png" });

    logo.selectedFile.value = file;
    logo.previewUrl.value = "blob:http://localhost/abc";
    logo.uploadError.value = "Error";

    logo.clear();

    expect(logo.selectedFile.value).toBeNull();
    expect(logo.previewUrl.value).toBeNull();
    expect(logo.uploadError.value).toBeNull();
    expect(logo.typeError.value).toBeNull();
    expect(logo.sizeError.value).toBeNull();
  });

  // --- Set existing ---

  it("setExistingLogo sets previewUrl and clears other state", async () => {
    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();
    logo.uploadError.value = "Old error";

    logo.setExistingLogo("https://example.com/storage/logos/existing.png");

    expect(logo.previewUrl.value).toBe(
      "https://example.com/storage/logos/existing.png",
    );
    expect(logo.selectedFile.value).toBeNull();
    expect(logo.uploadError.value).toBeNull();
  });

  it("setExistingLogo with null clears previewUrl", async () => {
    const { useClinicLogo } = await import("../useClinicLogo");
    const logo = useClinicLogo();
    logo.previewUrl.value = "https://example.com/storage/logos/old.png";

    logo.setExistingLogo(null);

    expect(logo.previewUrl.value).toBeNull();
  });
});
