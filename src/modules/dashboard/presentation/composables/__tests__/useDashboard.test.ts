import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// ============================================================================
// Mock DI container — intercept use case creation
// ============================================================================

vi.mock("@/modules/dashboard/application/containers/dashboardContainer", () => ({
  provideGetDashboardStatsUseCase: vi.fn(),
  provideGetRecentPatientsUseCase: vi.fn(),
  provideGetPendingReportsUseCase: vi.fn(),
  provideGetSystemMetricsUseCase: vi.fn(),
  provideGetWeatherUseCase: vi.fn(),
}));

// ============================================================================
// Imports (after vi.mock hoisting)
// ============================================================================

import { useDashboard } from "../useDashboard";
import {
  provideGetDashboardStatsUseCase,
  provideGetRecentPatientsUseCase,
  provideGetPendingReportsUseCase,
  provideGetSystemMetricsUseCase,
  provideGetWeatherUseCase,
} from "@/modules/dashboard/application/containers/dashboardContainer";
import { useAuthStore } from "@/core/store/auth";

// ============================================================================
// Tests
// ============================================================================

describe("useDashboard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("doctor role path", () => {
    function setupDoctor() {
      const authStore = useAuthStore();
      authStore.user = {
        id: 1,
        name: "Dr. Test",
        email: "dr@test.com",
        permissions: { "report.edit": 1 },
      };
    }

    it("loads stats, patients, and pending reports for doctor role", async () => {
      setupDoctor();

      const mockStats = { visits: 10, newPatients: 5, returningPatients: 5, totalPatients: 100 };
      const mockPatients = [
        { id: 1, name: "Ana García", visitTime: "10:30", initials: "AG" },
      ];
      const mockReports = [
        { id: 1, patientName: "Patient", templateName: "Template", createdAt: "2026-06-30T10:00:00" },
      ];

      (provideGetDashboardStatsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockStats),
      });
      (provideGetRecentPatientsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockPatients),
      });
      (provideGetPendingReportsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockReports),
      });

      const dashboard = useDashboard();
      await dashboard.fetchDashboard();

      expect(dashboard.stats.value).toEqual(mockStats);
      expect(dashboard.patients.value).toEqual(mockPatients);
      expect(dashboard.pendingReports.value).toEqual(mockReports);
      expect(dashboard.loading.value).toBe(false);
      expect(dashboard.error.value).toBeNull();
    });

    it("sets loading true during fetch and false after", async () => {
      setupDoctor();

      let resolveStats: any;
      const statsPromise = new Promise((r) => { resolveStats = r; });
      (provideGetDashboardStatsUseCase as any).mockReturnValue({
        execute: vi.fn().mockReturnValue(statsPromise),
      });
      (provideGetRecentPatientsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });
      (provideGetPendingReportsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });

      const dashboard = useDashboard();
      const fetchP = dashboard.fetchDashboard();

      expect(dashboard.loading.value).toBe(true);

      resolveStats({ visits: 0, newPatients: 0, returningPatients: 0, totalPatients: 0 });
      await fetchP;

      expect(dashboard.loading.value).toBe(false);
    });
  });

  describe("empty-state computed refs", () => {
    function setupDoctor() {
      const authStore = useAuthStore();
      authStore.user = {
        id: 1,
        name: "Dr. Test",
        email: "dr@test.com",
        permissions: { "report.edit": 1 },
      };
    }

    it("isEmptyState is true when stats are all-zero", async () => {
      setupDoctor();

      const mockStats = { visits: 0, newPatients: 0, returningPatients: 0, totalPatients: 0 };
      (provideGetDashboardStatsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockStats),
      });
      (provideGetRecentPatientsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });
      (provideGetPendingReportsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });

      const dashboard = useDashboard();
      await dashboard.fetchDashboard();

      expect(dashboard.isEmptyState.value).toBe(true);
    });

    it("isEmptyState is false when stats is null (loading)", async () => {
      setupDoctor();

      const dashboard = useDashboard();

      // stats is null initially — before fetchDashboard resolves
      expect(dashboard.stats.value).toBeNull();
      expect(dashboard.isEmptyState.value).toBe(false);
    });

    it("isEmptyState is false when stats have non-zero values", async () => {
      setupDoctor();

      const mockStats = { visits: 5, newPatients: 0, returningPatients: 0, totalPatients: 10 };
      (provideGetDashboardStatsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockStats),
      });
      (provideGetRecentPatientsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });
      (provideGetPendingReportsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });

      const dashboard = useDashboard();
      await dashboard.fetchDashboard();

      expect(dashboard.isEmptyState.value).toBe(false);
    });

    it("isNewProfessional is true when isEmptyState and totalPatients === 0", async () => {
      setupDoctor();

      const mockStats = { visits: 0, newPatients: 0, returningPatients: 0, totalPatients: 0 };
      (provideGetDashboardStatsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockStats),
      });
      (provideGetRecentPatientsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });
      (provideGetPendingReportsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });

      const dashboard = useDashboard();
      await dashboard.fetchDashboard();

      expect(dashboard.isNewProfessional.value).toBe(true);
    });

    it("isNewProfessional is false when isEmptyState and totalPatients > 0", async () => {
      setupDoctor();

      const mockStats = { visits: 0, newPatients: 0, returningPatients: 0, totalPatients: 5 };
      (provideGetDashboardStatsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockStats),
      });
      (provideGetRecentPatientsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });
      (provideGetPendingReportsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });

      const dashboard = useDashboard();
      await dashboard.fetchDashboard();

      expect(dashboard.isEmptyState.value).toBe(true);
      expect(dashboard.isNewProfessional.value).toBe(false);
    });
  });

  describe("admin role path", () => {
    function setupAdmin() {
      const authStore = useAuthStore();
      authStore.user = {
        id: 2,
        name: "Admin User",
        email: "admin@test.com",
        permissions: { "admin.user.view": 1 },
      };
    }

    it("loads system metrics for admin role", async () => {
      setupAdmin();

      const mockMetrics = { totalUsers: 25 };
      (provideGetSystemMetricsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockMetrics),
      });

      const dashboard = useDashboard();
      await dashboard.fetchDashboard();

      expect(dashboard.systemMetrics.value).toEqual(mockMetrics);
      expect(dashboard.loading.value).toBe(false);
      expect(dashboard.error.value).toBeNull();
    });

    it("does not load doctor use cases for admin", async () => {
      setupAdmin();

      const mockMetrics = { totalUsers: 10 };
      (provideGetSystemMetricsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockMetrics),
      });

      const dashboard = useDashboard();
      await dashboard.fetchDashboard();

      expect(dashboard.stats.value).toBeNull();
      expect(dashboard.patients.value).toEqual([]);
      expect(dashboard.pendingReports.value).toEqual([]);
      expect(dashboard.systemMetrics.value).toEqual(mockMetrics);
    });

    it("treats user with both admin and doctor permissions as admin", async () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: 2,
        name: "Admin Doctor",
        email: "admindoc@test.com",
        permissions: { "admin.user.view": 1, "report.edit": 1 },
      };

      const mockMetrics = { totalUsers: 30 };
      (provideGetSystemMetricsUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockMetrics),
      });

      const dashboard = useDashboard();
      await dashboard.fetchDashboard();

      expect(dashboard.role.value).toBe("admin");
      expect(dashboard.systemMetrics.value).toEqual(mockMetrics);
      expect(dashboard.stats.value).toBeNull();
      expect(dashboard.patients.value).toEqual([]);
      expect(dashboard.pendingReports.value).toEqual([]);
    });
  });

  describe("no-permission state", () => {
    function setupNoPermission() {
      const authStore = useAuthStore();
      authStore.user = {
        id: 3,
        name: "Limited User",
        email: "limited@test.com",
        permissions: { "some.other.permission": 1 },
      };
    }

    it("sets error when user has no relevant permissions", async () => {
      setupNoPermission();

      const dashboard = useDashboard();
      await dashboard.fetchDashboard();

      expect(dashboard.error.value).toBeTruthy();
      if (dashboard.error.value instanceof Error) {
        expect(dashboard.error.value.message).toContain("No tienes permisos");
      }
      expect(dashboard.loading.value).toBe(false);
      expect(dashboard.stats.value).toBeNull();
      expect(dashboard.systemMetrics.value).toBeNull();
    });
  });

  describe("weather scenarios", () => {
    function setupDoctor() {
      const authStore = useAuthStore();
      authStore.user = {
        id: 1,
        name: "Dr. Test",
        email: "dr@test.com",
        permissions: { "report.edit": 1 },
      };
    }

    it("sets weatherLoading during fetch and clears it after", async () => {
      setupDoctor();

      let resolveWeather: any;
      const weatherPromise = new Promise((r) => { resolveWeather = r; });
      (provideGetWeatherUseCase as any).mockReturnValue({
        execute: vi.fn().mockReturnValue(weatherPromise),
      });

      const dashboard = useDashboard();
      const fetchP = dashboard.fetchWeather();

      expect(dashboard.weatherLoading.value).toBe(true);

      resolveWeather({ temperature: 22, description: "Soleado", wmoCode: 0, iconName: "sunny" });
      await fetchP;

      expect(dashboard.weatherLoading.value).toBe(false);
    });

    it("falls back to env defaults on geolocation failure and fetches weather", async () => {
      setupDoctor();

      const mockWeather = { temperature: 18, description: "Nublado", wmoCode: 2, iconName: "cloudy-sun" };
      (provideGetWeatherUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockWeather),
      });

      // In jsdom, navigator.geolocation is undefined so it falls back to env defaults
      const dashboard = useDashboard();
      await dashboard.fetchWeather();

      expect(dashboard.weather.value).toEqual(mockWeather);
      expect(dashboard.weatherLoading.value).toBe(false);
      expect(dashboard.weatherError.value).toBeNull();
      // showCitySelector should be true because geolocation fails in jsdom
      expect(dashboard.showCitySelector.value).toBe(true);
    });

    it("sets weatherError when API call fails", async () => {
      setupDoctor();

      (provideGetWeatherUseCase as any).mockReturnValue({
        execute: vi.fn().mockRejectedValue(new Error("API error")),
      });

      const dashboard = useDashboard();
      await dashboard.fetchWeather();

      expect(dashboard.weatherError.value).toBe("No disponible");
      expect(dashboard.weatherLoading.value).toBe(false);
      expect(dashboard.weather.value).toBeNull();
    });

    it("selectCity fetches weather for given coordinates", async () => {
      setupDoctor();

      const mockWeather = { temperature: 30, description: "Despejado", wmoCode: 0, iconName: "sunny" };
      (provideGetWeatherUseCase as any).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockWeather),
      });

      const dashboard = useDashboard();
      await dashboard.selectCity(40.4168, -3.7038);

      expect(dashboard.weather.value).toEqual(mockWeather);
      expect(dashboard.weatherLoading.value).toBe(false);
      expect(dashboard.weatherError.value).toBeNull();
      expect(dashboard.showCitySelector.value).toBe(false);
    });

    it("selectCity sets error on failure", async () => {
      setupDoctor();

      (provideGetWeatherUseCase as any).mockReturnValue({
        execute: vi.fn().mockRejectedValue(new Error("fail")),
      });

      const dashboard = useDashboard();
      await dashboard.selectCity(40.4168, -3.7038);

      expect(dashboard.weatherError.value).toBe("No disponible");
      expect(dashboard.weatherLoading.value).toBe(false);
    });
  });
});
