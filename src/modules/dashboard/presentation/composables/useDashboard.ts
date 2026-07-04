import { ref, computed, type Ref } from "vue";
import { useAuthStore } from "@/core/store/auth";
import {
  provideGetDashboardStatsUseCase,
  provideGetRecentPatientsUseCase,
  provideGetPendingReportsUseCase,
  provideGetSystemMetricsUseCase,
} from "@/modules/dashboard/application/containers/dashboardContainer";
import type { DashboardStats } from "@/modules/dashboard/domain/entities/DashboardStats";
import type { PatientSummary } from "@/modules/dashboard/domain/entities/PatientSummary";
import type { PendingReport } from "@/modules/dashboard/domain/entities/PendingReport";
import type { DashboardRole, DateRange } from "@/modules/dashboard/domain/entities/types";
import type { SystemMetrics } from "@/modules/dashboard/domain/use-cases/GetSystemMetricsUseCase";

export interface UseDashboardReturn {
  stats: Ref<DashboardStats | null>;
  patients: Ref<PatientSummary[]>;
  pendingReports: Ref<PendingReport[]>;
  systemMetrics: Ref<SystemMetrics | null>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
  role: Ref<DashboardRole>;
  fetchDashboard: () => Promise<void>;
}

function todayRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

export function useDashboard(): UseDashboardReturn {
  const authStore = useAuthStore();

  const stats: Ref<DashboardStats | null> = ref(null);
  const patients: Ref<PatientSummary[]> = ref([]);
  const pendingReports: Ref<PendingReport[]> = ref([]);
  const systemMetrics: Ref<SystemMetrics | null> = ref(null);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<unknown> = ref(null);

  const role = computed<DashboardRole>(() => {
    if (authStore.hasPermission("report.edit")) return "doctor";
    if (authStore.hasPermission("admin.user.view")) return "admin";
    return "none";
  });

  async function fetchDashboard(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      if (role.value === "doctor") {
        const range = todayRange();

        const statsUseCase = provideGetDashboardStatsUseCase();
        const patientsUseCase = provideGetRecentPatientsUseCase();
        const reportsUseCase = provideGetPendingReportsUseCase();

        const [statsResult, patientsResult, reportsResult] = await Promise.all([
          statsUseCase.execute(range),
          patientsUseCase.execute(range),
          reportsUseCase.execute(5),
        ]);

        stats.value = statsResult;
        patients.value = patientsResult;
        pendingReports.value = reportsResult;
      } else if (role.value === "admin") {
        const metricsUseCase = provideGetSystemMetricsUseCase();
        systemMetrics.value = await metricsUseCase.execute();
      }
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  }

  return {
    stats,
    patients,
    pendingReports,
    systemMetrics,
    loading,
    error,
    role,
    fetchDashboard,
  };
}
