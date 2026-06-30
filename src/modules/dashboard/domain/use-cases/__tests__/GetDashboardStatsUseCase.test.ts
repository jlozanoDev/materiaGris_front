import { describe, it, expect, vi, beforeEach } from 'vitest';
import GetDashboardStatsUseCase from '@/modules/dashboard/domain/use-cases/GetDashboardStatsUseCase';
import type { DashboardRepository } from '@/modules/dashboard/domain/repositories/DashboardRepository';
import type { DateRange } from '@/modules/dashboard/domain/entities/types';

function createMockRepo(): DashboardRepository {
  return {
    getStats: vi.fn(),
    getRecentPatients: vi.fn(),
    getPendingReports: vi.fn(),
    getSystemMetrics: vi.fn(),
  };
}

function todayRange(): DateRange {
  return { from: '2026-06-30T00:00:00', to: '2026-06-30T23:59:59' };
}

describe('GetDashboardStatsUseCase', () => {
  let repo: DashboardRepository;
  let useCase: GetDashboardStatsUseCase;

  beforeEach(() => {
    repo = createMockRepo();
    useCase = new GetDashboardStatsUseCase(repo);
  });

  it('classifies patients as new (created today) vs returning (created before today)', async () => {
    const range = todayRange();
    const patients = [
      { id: 1, created_at: '2026-06-30T10:00:00', last_visit_at: '2026-06-30T10:00:00' },
      { id: 2, created_at: '2026-06-30T11:00:00', last_visit_at: '2026-06-30T11:00:00' },
      { id: 3, created_at: '2026-06-30T12:00:00', last_visit_at: '2026-06-30T12:00:00' },
      { id: 4, created_at: '2026-06-30T13:00:00', last_visit_at: '2026-06-30T13:00:00' },
      { id: 5, created_at: '2026-06-29T10:00:00', last_visit_at: '2026-06-30T10:00:00' },
      { id: 6, created_at: '2026-06-28T10:00:00', last_visit_at: '2026-06-30T10:00:00' },
      { id: 7, created_at: '2026-06-01T10:00:00', last_visit_at: '2026-06-30T10:00:00' },
      { id: 8, created_at: '2026-06-01T10:00:00', last_visit_at: '2026-06-30T10:00:00' },
      { id: 9, created_at: '2026-06-29T10:00:00', last_visit_at: '2026-06-30T10:00:00' },
      { id: 10, created_at: '2026-06-30T14:00:00', last_visit_at: '2026-06-30T14:00:00' },
    ];
    (repo.getStats as any).mockResolvedValue({ data: patients });

    const result = await useCase.execute(range);

    expect(result.visits).toBe(10);
    expect(result.newPatients).toBe(5);
    expect(result.returningPatients).toBe(5);
  });

  it('returns zeros when no patients visited today', async () => {
    const range = todayRange();
    (repo.getStats as any).mockResolvedValue({ data: [] });

    const result = await useCase.execute(range);

    expect(result.visits).toBe(0);
    expect(result.newPatients).toBe(0);
    expect(result.returningPatients).toBe(0);
  });

  it('counts patients without created_at as returning (defensive fallback)', async () => {
    const range = todayRange();
    const patients = [
      { id: 1, last_visit_at: '2026-06-30T10:00:00' },
      { id: 2, created_at: '2026-06-30T11:00:00', last_visit_at: '2026-06-30T11:00:00' },
    ];
    (repo.getStats as any).mockResolvedValue({ data: patients });

    const result = await useCase.execute(range);

    expect(result.visits).toBe(2);
    expect(result.newPatients).toBe(1);
    expect(result.returningPatients).toBe(1);
  });
});
