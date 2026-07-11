import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ClinicLogoUpload from "@/modules/admin/clinic/presentation/components/ClinicLogoUpload.vue";

describe("ClinicLogoUpload", () => {
  // --- Rendering ---

  it("renders drop zone when no logo and no file selected", () => {
    const wrapper = mount(ClinicLogoUpload, {
      props: { logoUrl: null },
    });

    expect(wrapper.text()).toContain("Logo de la Clínica");
    expect(wrapper.find('[data-testid="drop-zone"]').exists()).toBe(true);
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("renders existing logo image when logoUrl is provided", () => {
    const url = "https://example.com/storage/logos/logo.png";
    const wrapper = mount(ClinicLogoUpload, {
      props: { logoUrl: url },
    });

    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe(url);
    expect(img.attributes("alt")).toBe("Logo de la clínica");
  });

  it("renders hidden file input", () => {
    const wrapper = mount(ClinicLogoUpload, {
      props: { logoUrl: null },
    });

    const input = wrapper.find('input[type="file"]');
    expect(input.exists()).toBe(true);
    expect(input.attributes("accept")).toBe(
      "image/png,image/jpeg,image/svg+xml,image/webp",
    );
  });

  // --- Drag-drop zone click opens file dialog ---

  it("clicking drop zone triggers file input click", async () => {
    const wrapper = mount(ClinicLogoUpload, {
      props: { logoUrl: null },
    });

    const input = wrapper.find('input[type="file"]');
    const clickSpy = vi.spyOn(input.element as HTMLInputElement, "click");

    await wrapper.find('[data-testid="drop-zone"]').trigger("click");

    expect(clickSpy).toHaveBeenCalled();
  });

  // --- File selection emits upload ---

  it("emits upload event when valid file is selected", async () => {
    const wrapper = mount(ClinicLogoUpload, {
      props: { logoUrl: null },
    });

    const file = new File(["fake-png"], "logo.png", { type: "image/png" });
    const input = wrapper.find('input[type="file"]');

    // Simulate file selection via the input
    Object.defineProperty(input.element, "files", {
      value: [file],
      writable: false,
    });
    await input.trigger("change");

    expect(wrapper.emitted("upload")).toBeTruthy();
    expect(wrapper.emitted("upload")![0]).toEqual([file]);
  });

  it("does not emit upload for unsupported file type", async () => {
    const wrapper = mount(ClinicLogoUpload, {
      props: { logoUrl: null },
    });

    const file = new File(["fake-gif"], "logo.gif", { type: "image/gif" });
    const input = wrapper.find('input[type="file"]');

    Object.defineProperty(input.element, "files", {
      value: [file],
      writable: false,
    });
    await input.trigger("change");

    expect(wrapper.emitted("upload")).toBeFalsy();

    // Should show validation error
    expect(wrapper.text()).toContain("Tipo de archivo no válido");
  });

  // --- Loading state ---

  it("shows uploading indicator when uploading prop is true", () => {
    const wrapper = mount(ClinicLogoUpload, {
      props: { logoUrl: null, uploading: true },
    });

    expect(wrapper.text()).toContain("Subiendo...");
  });

  it("prevents file dialog opening when disabled prop is true", async () => {
    const wrapper = mount(ClinicLogoUpload, {
      props: { logoUrl: null, disabled: true },
    });

    const input = wrapper.find('input[type="file"]');
    const clickSpy = vi.spyOn(input.element as HTMLInputElement, "click");

    await wrapper.find('[data-testid="drop-zone"]').trigger("click");

    // Disabled drop zone should NOT trigger file input
    expect(clickSpy).not.toHaveBeenCalled();
  });

  // --- Error display ---

  it("displays upload error message", () => {
    const wrapper = mount(ClinicLogoUpload, {
      props: { logoUrl: null, uploadError: "Error de conexión" },
    });

    expect(wrapper.text()).toContain("Error de conexión");
  });

  // --- Remove button ---

  it("shows remove button when logoUrl is provided", () => {
    const wrapper = mount(ClinicLogoUpload, {
      props: { logoUrl: "https://example.com/logo.png" },
    });

    const removeBtn = wrapper.find('[data-testid="remove-logo"]');
    expect(removeBtn.exists()).toBe(true);
    expect(removeBtn.text()).toContain("Eliminar");
  });

  it("does not show remove button when no logo", () => {
    const wrapper = mount(ClinicLogoUpload, {
      props: { logoUrl: null },
    });

    expect(wrapper.find('[data-testid="remove-logo"]').exists()).toBe(false);
  });

  it("emits remove event when remove button is clicked", async () => {
    const wrapper = mount(ClinicLogoUpload, {
      props: { logoUrl: "https://example.com/logo.png" },
    });

    await wrapper.find('[data-testid="remove-logo"]').trigger("click");

    expect(wrapper.emitted("remove")).toBeTruthy();
  });
});
