import { ref, type Ref } from "vue";
import { provideGetReportsUseCase } from "@/modules/reports/application/containers/reportsContainer";
import type { PatientReport } from "@/shared/types";

export interface UseReportListReturn {
  reports: Ref<PatientReport[]>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
  fetchReports: (filters?: Record<string, unknown>) => Promise<void>;
}

export function useReportList(): UseReportListReturn {
  const reports: Ref<PatientReport[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<unknown> = ref(null);

  async function fetchReports(filters?: Record<string, unknown>): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const useCase = provideGetReportsUseCase();
      const response = await useCase.execute(filters);
      reports.value = Array.isArray(response) ? response : (response.data ?? []);
    } catch (e) {
      console.error("[useReportList] fetchReports error:", e);
      error.value = e;
      reports.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { reports, loading, error, fetchReports };
}
