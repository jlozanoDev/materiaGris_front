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

      const mockStats = { visits: 10, newPatients: 5, returningPatients: 5 };
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

      resolveStats({ visits: 0, newPatients: 0, returningPatients: 0 });
      await fetchP;

      expect(dashboard.loading.value).toBe(false);
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
});
