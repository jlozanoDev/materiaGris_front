import { describe, it, expect, vi, beforeEach } from 'vitest';
import GetSystemMetricsUseCase from '@/modules/dashboard/domain/use-cases/GetSystemMetricsUseCase';
import type { DashboardRepository } from '@/modules/dashboard/domain/repositories/DashboardRepository';

function createMockRepo(): DashboardRepository {
  return {
    getStats: vi.fn(),
    getRecentPatients: vi.fn(),
    getPendingReports: vi.fn(),
    getSystemMetrics: vi.fn(),
    getPatientsCount: vi.fn(),
    getTemplatesCount: vi.fn(),
    getReportsByStatus: vi.fn(),
    getWeather: vi.fn(),
  };
}

describe('GetSystemMetricsUseCase', () => {
  let repo: DashboardRepository;
  let useCase: GetSystemMetricsUseCase;

  beforeEach(() => {
    repo = createMockRepo();
    useCase = new GetSystemMetricsUseCase(repo);
  });

  it('returns all system metrics from repository', async () => {
    (repo.getSystemMetrics as any).mockResolvedValue({ totalUsers: 25 });
    (repo.getPatientsCount as any).mockResolvedValue(120);
    (repo.getTemplatesCount as any).mockResolvedValue(5);
    (repo.getReportsByStatus as any).mockImplementation(async (status: string) => {
      if (status === 'draft') return 3;
      if (status === 'signed') return 12;
      if (status === 'archived') return 8;
      return 0;
    });

    const result = await useCase.execute();

    expect(result).toEqual({
      totalUsers: 25,
      totalPatients: 120,
      totalPendingReports: 3,
      totalSignedReports: 12,
      totalArchivedReports: 8,
      totalTemplates: 5,
    });
  });

  it('returns null for endpoints that fail (e.g. missing permissions)', async () => {
    (repo.getSystemMetrics as any).mockResolvedValue({ totalUsers: 10 });
    (repo.getPatientsCount as any).mockRejectedValue(new Error('Forbidden'));
    (repo.getTemplatesCount as any).mockRejectedValue(new Error('Forbidden'));
    (repo.getReportsByStatus as any).mockRejectedValue(new Error('Forbidden'));

    const result = await useCase.execute();

    expect(result).toEqual({
      totalUsers: 10,
      totalPatients: null,
      totalPendingReports: null,
      totalSignedReports: null,
      totalArchivedReports: null,
      totalTemplates: null,
    });
  });
});
