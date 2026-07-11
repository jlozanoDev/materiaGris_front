import { ref, reactive, computed, type Ref } from "vue";
import type { Clinic } from "@/shared/types";
import { provideUpdateClinicUseCase } from "@/modules/admin/clinic/application/containers/clinicContainer";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+.*$/;

function required(value: unknown, label: string): string | null {
  if (value === null || value === undefined || String(value).trim() === "") {
    return `${label} es requerido`;
  }
  return null;
}

function maxLength(value: unknown, max: number, label: string): string | null {
  if (typeof value === "string" && value.length > max) {
    return `${label} no puede exceder ${max} caracteres`;
  }
  return null;
}

function emailFormat(value: string): string | null {
  if (!value || value.trim() === "") return null;
  return EMAIL_RE.test(value) ? null : "Email inválido";
}

function urlFormat(value: string | null | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return URL_RE.test(value) ? null : "URL inválida";
}

// ---------------------------------------------------------------------------
// Form field descriptors
// ---------------------------------------------------------------------------

interface FormField {
  key: keyof Clinic;
  label: string;
  type?: "text" | "email" | "url";
  maxLength?: number;
  required?: boolean;
  format?: "email" | "url";
}

const formFields: FormField[] = [
  { key: "nombre", label: "Nombre", required: true, maxLength: 255 },
  { key: "direccion", label: "Dirección", required: true, maxLength: 255 },
  { key: "telefono", label: "Teléfono", required: true, maxLength: 50 },
  { key: "email", label: "Email", required: true, maxLength: 255, format: "email" },
  { key: "ciudad", label: "Ciudad", required: true, maxLength: 255 },
  { key: "provincia", label: "Provincia", required: true, maxLength: 255 },
  { key: "codigo_postal", label: "Código Postal", required: true, maxLength: 20 },
  { key: "web", label: "Sitio Web", format: "url" },
  { key: "cuit", label: "CUIT", maxLength: 20 },
];

export function useClinicForm(clinicRef: Ref<Clinic | null>) {
  const updateClinicUseCase = provideUpdateClinicUseCase();
  const saving = ref(false);
  const saveError = ref<string | null>(null);
  const saveSuccess = ref(false);
  const fieldErrors = ref<Record<string, string | null>>({});

  // Build a reactive form object from the current clinic value
  const form = reactive<Record<string, any>>({
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
    ciudad: "",
    provincia: "",
    codigo_postal: "",
    web: "",
    cuit: "",
  });

  // Sync form from clinic ref
  function syncForm(): void {
    if (!clinicRef.value) return;
    for (const key of Object.keys(form)) {
      (form as Record<string, any>)[key] = (clinicRef.value as any)[key] ?? "";
    }
  }

  const fieldDescriptors = computed(() => formFields);

  // Validate a single field and return error or null
  function validateField(key: string): string | null {
    const field = formFields.find((f) => f.key === key);
    if (!field) return null;

    const value = (form as Record<string, any>)[key];

    if (field.required) {
      const reqError = required(value, field.label);
      if (reqError) return reqError;
    }

    if (field.maxLength) {
      const lenError = maxLength(value, field.maxLength, field.label);
      if (lenError) return lenError;
    }

    if (field.format === "email") {
      const emailError = emailFormat(value);
      if (emailError) return emailError;
    }

    if (field.format === "url") {
      const urlError = urlFormat(value);
      if (urlError) return urlError;
    }

    return null;
  }

  // Validate all fields, return true if valid
  function validate(): boolean {
    const errors: Record<string, string | null> = {};
    let valid = true;

    for (const field of formFields) {
      const error = validateField(field.key);
      errors[field.key] = error;
      if (error) valid = false;
    }

    fieldErrors.value = errors;
    return valid;
  }

  // Clear error for a specific field on input
  function clearFieldError(key: string): void {
    fieldErrors.value = { ...fieldErrors.value, [key]: null };
  }

  async function submit(): Promise<boolean> {
    saveError.value = null;
    saveSuccess.value = false;

    if (!validate()) return false;

    saving.value = true;

    try {
      const payload: Record<string, any> = {};
      for (const field of formFields) {
        payload[field.key] = (form as Record<string, any>)[field.key];
      }

      const updated = await updateClinicUseCase.execute(payload as Partial<Clinic>);

      // Update the source ref with returned data
      if (clinicRef.value) {
        Object.assign(clinicRef.value, updated);
      } else {
        clinicRef.value = updated;
      }

      saveSuccess.value = true;
      return true;
    } catch (err: any) {
      if (err?.status === 422) {
        saveError.value = err?.body?.message || "Error de validación";
      } else if (err?.status === 403) {
        saveError.value = "No tienes permisos para actualizar la clínica";
      } else if (err?.status === 500) {
        saveError.value = "Error interno del servidor";
      } else if (err instanceof Error) {
        saveError.value = err.message;
      } else {
        saveError.value = "Error al guardar los datos";
      }
      return false;
    } finally {
      saving.value = false;
    }
  }

  return {
    form,
    syncForm,
    saving,
    saveError,
    saveSuccess,
    fieldErrors,
    submit,
    validate,
    clearFieldError,
    fieldDescriptors,
  };
}
