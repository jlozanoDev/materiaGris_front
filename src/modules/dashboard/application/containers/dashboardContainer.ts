import ApiDashboardRepository from "@/modules/dashboard/infrastructure/ApiDashboardRepository";
import GetDashboardStatsUseCase from "@/modules/dashboard/domain/use-cases/GetDashboardStatsUseCase";
import GetRecentPatientsUseCase from "@/modules/dashboard/domain/use-cases/GetRecentPatientsUseCase";
import GetPendingReportsUseCase from "@/modules/dashboard/domain/use-cases/GetPendingReportsUseCase";
import GetSystemMetricsUseCase from "@/modules/dashboard/domain/use-cases/GetSystemMetricsUseCase";
import GetWeatherUseCase from "@/modules/dashboard/domain/use-cases/GetWeatherUseCase";
import { BrowserGeolocationProvider } from "@/shared/providers/GeolocationProvider";

export function provideDashboardRepository(): ApiDashboardRepository {
  return new ApiDashboardRepository();
}

export function provideGetDashboardStatsUseCase(): GetDashboardStatsUseCase {
  return new GetDashboardStatsUseCase(new ApiDashboardRepository());
}

export function provideGetRecentPatientsUseCase(): GetRecentPatientsUseCase {
  return new GetRecentPatientsUseCase(new ApiDashboardRepository());
}

export function provideGetPendingReportsUseCase(): GetPendingReportsUseCase {
  return new GetPendingReportsUseCase(new ApiDashboardRepository());
}

export function provideGetSystemMetricsUseCase(): GetSystemMetricsUseCase {
  return new GetSystemMetricsUseCase(new ApiDashboardRepository());
}

export function provideGetWeatherUseCase(): GetWeatherUseCase {
  return new GetWeatherUseCase(new ApiDashboardRepository(), new BrowserGeolocationProvider());
}
