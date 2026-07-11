import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import { fetchClient } from "@/core/api/httpClient";
import type { Clinic } from "@/shared/types";

export const useClinicStore = defineStore("clinic", () => {
  const clinic: Ref<Clinic | null> = ref(null);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  async function fetchClinic(): Promise<Clinic | null> {
    loading.value = true;
    error.value = null;

    try {
      const data = await fetchClient("/admin/clinic", { method: "GET" });
      clinic.value = data as Clinic;
      return clinic.value;
    } catch (err: any) {
      clinic.value = null;

      if (err?.status === 401) {
        // 401 is handled by httpClient's unauthorized handler globally
        throw err;
      }

      if (err?.status === 404) {
        // Clinic doesn't exist yet — expected state, not an error
        clinic.value = null;
        error.value = null;
      } else if (err?.status) {
        error.value = "Error al cargar los datos de la clínica";
      } else {
        error.value = "Error de conexión";
      }

      return null;
    } finally {
      loading.value = false;
    }
  }

  function updateLogo(url: string | null): void {
    if (clinic.value) {
      clinic.value.logo = url;
    }
  }

  return { clinic, loading, error, fetchClinic, updateLogo };
});
