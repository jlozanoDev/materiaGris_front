import { ref, type Ref } from "vue";
import {
  provideGetReportTemplatesUseCase,
  provideDeleteReportTemplateUseCase,
} from "@/modules/admin/report-template/application/containers/reportTemplateContainer";
import type { ReportTemplate } from "@/shared/types";

export interface UseReportTemplateReturn {
  templates: Ref<ReportTemplate[]>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
  fetchTemplates: () => Promise<ReportTemplate[] | null>;
  deleteTemplate: (id: number | string) => Promise<any>;
}

export function useReportTemplate(): UseReportTemplateReturn {
  const templates: Ref<ReportTemplate[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<unknown> = ref(null);

  const fetchTemplates = async (): Promise<ReportTemplate[] | null> => {
    loading.value = true;
    error.value = null;
    try {
      const useCase = provideGetReportTemplatesUseCase();
      const data = await useCase.execute();
      templates.value = data;
      return data;
    } catch (e) {
      console.error("[useReportTemplate] fetchTemplates error:", e);
      error.value = e;
      templates.value = [];
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteTemplate = async (id: number | string): Promise<any> => {
    loading.value = true;
    try {
      const useCase = provideDeleteReportTemplateUseCase();
      const res = await useCase.execute(id);
      await fetchTemplates();
      return res;
    } catch (e) {
      console.error("[useReportTemplate] deleteTemplate error:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return { templates, loading, error, fetchTemplates, deleteTemplate };
}
