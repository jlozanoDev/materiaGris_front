import { ref, type Ref } from "vue";
import { provideGetReportsUseCase, provideDeleteReportUseCase } from "@/modules/reports/application/containers/reportsContainer";
import type { PatientReport } from "@/shared/types";

export interface UseReportListReturn {
  reports: Ref<PatientReport[]>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
  fetchReports: (filters?: Record<string, unknown>) => Promise<void>;
  deleteReport: (id: string | number) => Promise<void>;
}

export function useReportList(): UseReportListReturn {
  const reports: Ref<PatientReport[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<unknown> = ref(null);
  const lastFilters: Ref<Record<string, unknown> | undefined> = ref(undefined);

  async function fetchReports(filters?: Record<string, unknown>): Promise<void> {
    loading.value = true;
    error.value = null;
    lastFilters.value = filters;
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

  async function deleteReport(id: string | number): Promise<void> {
    try {
      const useCase = provideDeleteReportUseCase();
      await useCase.execute(id);
      await fetchReports(lastFilters.value);
    } catch (e) {
      console.error("[useReportList] deleteReport error:", e);
      error.value = e;
    }
  }

  return { reports, loading, error, fetchReports, deleteReport };
}
