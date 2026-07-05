import { describe, it, expect, vi, beforeEach } from 'vitest';
import GetRecentPatientsUseCase from '@/modules/dashboard/domain/use-cases/GetRecentPatientsUseCase';
import type { DashboardRepository } from '@/modules/dashboard/domain/repositories/DashboardRepository';
import type { DateRange } from '@/modules/dashboard/domain/entities/types';
import type { PatientSummary } from '@/modules/dashboard/domain/entities/PatientSummary';

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

function todayRange(): DateRange {
  return { from: '2026-06-30T00:00:00', to: '2026-06-30T23:59:59' };
}

describe('GetRecentPatientsUseCase', () => {
  let repo: DashboardRepository;
  let useCase: GetRecentPatientsUseCase;

  beforeEach(() => {
    repo = createMockRepo();
    useCase = new GetRecentPatientsUseCase(repo);
  });

  it('maps API patient objects to PatientSummary[]', async () => {
    const range = todayRange();
    const apiPatients = [
      {
        id: 1,
        first_name: 'Ana',
        last_name: 'García',
        created_at: '2026-07-03T10:30:00',
      },
      {
        id: 2,
        first_name: 'Carlos',
        last_name: 'López',
        created_at: '2026-06-29T11:45:00',
      },
    ];
    (repo.getRecentPatients as any).mockResolvedValue(apiPatients);

    const result: PatientSummary[] = await useCase.execute(range);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 1,
      name: 'Ana García',
      timeLabel: '10:30',
      initials: 'AG',
    });
    expect(result[1]).toEqual({
      id: 2,
      name: 'Carlos López',
      timeLabel: expect.stringContaining('29'),
      initials: 'CL',
    });
  });

  it('returns empty array when no recent patients', async () => {
    const range = todayRange();
    (repo.getRecentPatients as any).mockResolvedValue([]);

    const result = await useCase.execute(range);

    expect(result).toEqual([]);
  });

  it('handles patients with missing created_at', async () => {
    const range = todayRange();
    const apiPatients = [
      {
        id: 3,
        first_name: 'María',
        last_name: 'Ruiz',
      },
    ];
    (repo.getRecentPatients as any).mockResolvedValue(apiPatients);

    const result = await useCase.execute(range);

    expect(result[0].timeLabel).toBe('');
    expect(result[0].initials).toBe('MR');
  });
});
