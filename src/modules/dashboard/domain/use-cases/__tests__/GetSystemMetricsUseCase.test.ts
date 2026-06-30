import { describe, it, expect, vi, beforeEach } from 'vitest';
import GetSystemMetricsUseCase from '@/modules/dashboard/domain/use-cases/GetSystemMetricsUseCase';
import type { DashboardRepository } from '@/modules/dashboard/domain/repositories/DashboardRepository';

function createMockRepo(): DashboardRepository {
  return {
    getStats: vi.fn(),
    getRecentPatients: vi.fn(),
    getPendingReports: vi.fn(),
    getSystemMetrics: vi.fn(),
  };
}

describe('GetSystemMetricsUseCase', () => {
  let repo: DashboardRepository;
  let useCase: GetSystemMetricsUseCase;

  beforeEach(() => {
    repo = createMockRepo();
    useCase = new GetSystemMetricsUseCase(repo);
  });

  it('extracts total users from system metrics', async () => {
    (repo.getSystemMetrics as any).mockResolvedValue({ total: 25 });

    const result = await useCase.execute();

    expect(result).toEqual({ totalUsers: 25 });
    expect(repo.getSystemMetrics).toHaveBeenCalledOnce();
  });
});
