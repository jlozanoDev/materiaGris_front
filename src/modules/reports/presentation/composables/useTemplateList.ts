import { ref, type Ref } from "vue";
import { provideGetActiveTemplatesUseCase } from "@/modules/reports/application/containers/reportsContainer";
import type { ReportTemplate } from "@/shared/types";

export interface UseTemplateListReturn {
  templates: Ref<ReportTemplate[]>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
  fetchActive: () => Promise<void>;
}

export function useTemplateList(): UseTemplateListReturn {
  const templates: Ref<ReportTemplate[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<unknown> = ref(null);

  async function fetchActive(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const useCase = provideGetActiveTemplatesUseCase();
      const response = await useCase.execute();
      templates.value = Array.isArray(response) ? response : (response.data ?? []);
    } catch (e) {
      console.error("[useTemplateList] fetchActive error:", e);
      error.value = e;
      templates.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { templates, loading, error, fetchActive };
}
