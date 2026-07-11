import { ref, type Ref } from "vue";
import { provideUploadClinicLogoUseCase } from "@/modules/admin/clinic/application/containers/clinicContainer";
import { useClinicStore } from "@/core/store/clinic";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useClinicLogo() {
  const selectedFile: Ref<File | null> = ref(null);
  const previewUrl: Ref<string | null> = ref(null);
  const uploading = ref(false);
  const uploadError = ref<string | null>(null);
  const typeError = ref<string | null>(null);
  const sizeError = ref<string | null>(null);

  const uploadClinicLogoUseCase = provideUploadClinicLogoUseCase();
  const clinicStore = useClinicStore();

  /**
   * Validate file type and size against allowed MIME types and max 5MB limit.
   * Returns true if valid, false otherwise and sets the corresponding error ref.
   */
  function validate(file: File): boolean {
    typeError.value = null;
    sizeError.value = null;

    if (!ALLOWED_TYPES.includes(file.type)) {
      typeError.value =
        "Tipo de archivo no válido. Solo se aceptan PNG, JPG, SVG y WebP.";
      return false;
    }

    if (file.size > MAX_SIZE) {
      sizeError.value = "El archivo excede el tamaño máximo de 5MB.";
      return false;
    }

    return true;
  }

  /**
   * Upload a logo file. Validates first, then delegates to the use case.
   * On success, updates the store and replaces the blob preview with the server URL.
   * Returns true if upload succeeded, false otherwise.
   */
  async function upload(file: File): Promise<boolean> {
    uploadError.value = null;

    if (!validate(file)) return false;

    uploading.value = true;
    selectedFile.value = file;

    // Create a local object URL for immediate preview
    previewUrl.value = URL.createObjectURL(file);

    try {
      const updated = await uploadClinicLogoUseCase.execute(file);
      clinicStore.updateLogo(updated.logo ?? null);

      // Replace object URL with the server URL for persistence
      if (updated.logo) {
        previewUrl.value = updated.logo;
      }

      // Revoke the temporary object URL now that we have the real one
      if (previewUrl.value !== updated.logo) {
        URL.revokeObjectURL(previewUrl.value);
      }

      return true;
    } catch (err: any) {
      // Revoke the object URL on error too
      if (previewUrl.value?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl.value);
      }

      if (err?.status === 413) {
        uploadError.value = "El archivo es demasiado grande (máx. 5MB)";
      } else if (err?.status === 415) {
        uploadError.value = "Tipo de archivo no soportado";
      } else if (err?.status === 422) {
        uploadError.value = err?.body?.message || "Error de validación";
      } else if (err?.status === 0) {
        uploadError.value = "Error de conexión";
      } else if (err instanceof Error) {
        uploadError.value = err.message;
      } else {
        uploadError.value = "Error al subir el logo";
      }

      return false;
    } finally {
      uploading.value = false;
    }
  }

  /**
   * Reset all reactive state.
   */
  function clear(): void {
    selectedFile.value = null;
    if (previewUrl.value?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = null;
    uploadError.value = null;
    typeError.value = null;
    sizeError.value = null;
  }

  /**
   * Set an existing logo URL for edit mode.
   */
  function setExistingLogo(url: string | null | undefined): void {
    clear();
    if (url) {
      previewUrl.value = url;
    }
  }

  return {
    selectedFile,
    previewUrl,
    uploading,
    uploadError,
    typeError,
    sizeError,
    validate,
    upload,
    clear,
    setExistingLogo,
  };
}
