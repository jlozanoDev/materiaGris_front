import { ref, computed, type Ref } from "vue";
import { useAuthStore } from "@/core/store/auth";
import {
  provideGetDashboardStatsUseCase,
  provideGetRecentPatientsUseCase,
  provideGetPendingReportsUseCase,
  provideGetSystemMetricsUseCase,
  provideGetWeatherUseCase,
} from "@/modules/dashboard/application/containers/dashboardContainer";
import { BrowserGeolocationProvider } from "@/shared/providers/GeolocationProvider";
import type { DashboardStats } from "@/modules/dashboard/domain/entities/DashboardStats";
import type { PatientSummary } from "@/modules/dashboard/domain/entities/PatientSummary";
import type { PendingReport } from "@/modules/dashboard/domain/entities/PendingReport";
import type { WeatherData } from "@/modules/dashboard/domain/entities/WeatherData";
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
  isEmptyState: ReturnType<typeof computed<boolean>>;
  isNewProfessional: ReturnType<typeof computed<boolean>>;
  fetchDashboard: () => Promise<void>;
  // Weather
  weather: Ref<WeatherData | null>;
  weatherLoading: Ref<boolean>;
  weatherError: Ref<string | null>;
  showCitySelector: Ref<boolean>;
  fetchWeather: () => Promise<void>;
  selectCity: (lat: number, lon: number) => Promise<void>;
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

  // Weather state
  const weather: Ref<WeatherData | null> = ref(null);
  const weatherLoading: Ref<boolean> = ref(false);
  const weatherError: Ref<string | null> = ref(null);
  const showCitySelector: Ref<boolean> = ref(false);

  const role = computed<DashboardRole>(() => {
    if (authStore.hasPermission("report.edit")) return "doctor";
    if (authStore.hasPermission("admin.user.view")) return "admin";
    return "none";
  });

  const isEmptyState = computed(() => {
    if (!stats.value) return false;
    return stats.value.visits === 0
      && stats.value.newPatients === 0
      && stats.value.returningPatients === 0;
  });

  const isNewProfessional = computed(() => {
    return isEmptyState.value && stats.value !== null && stats.value.totalPatients === 0;
  });

  async function fetchWeather(): Promise<void> {
    weatherLoading.value = true;
    weatherError.value = null;
    showCitySelector.value = false;

    try {
      const geoProvider = new BrowserGeolocationProvider();
      let lat: number;
      let lon: number;

      try {
        const pos = await geoProvider.getCurrentPosition();
        lat = pos.lat;
        lon = pos.lon;
      } catch {
        // Geolocation denied or unavailable — fall back to env defaults
        lat = parseFloat(import.meta.env.VITE_WEATHER_DEFAULT_LAT ?? "40.4168");
        lon = parseFloat(import.meta.env.VITE_WEATHER_DEFAULT_LON ?? "-3.7038");
        showCitySelector.value = true;
      }

      const useCase = provideGetWeatherUseCase();
      weather.value = await useCase.execute(lat, lon);
    } catch (e) {
      weatherError.value = "No disponible";
    } finally {
      weatherLoading.value = false;
    }
  }

  async function selectCity(lat: number, lon: number): Promise<void> {
    weatherLoading.value = true;
    weatherError.value = null;
    showCitySelector.value = false;

    try {
      const useCase = provideGetWeatherUseCase();
      weather.value = await useCase.execute(lat, lon);
    } catch {
      weatherError.value = "No disponible";
    } finally {
      weatherLoading.value = false;
    }
  }

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
      } else {
        throw new Error("No tienes permisos para ver el dashboard");
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
    isEmptyState,
    isNewProfessional,
    fetchDashboard,
    weather,
    weatherLoading,
    weatherError,
    showCitySelector,
    fetchWeather,
    selectCity,
  };
}
