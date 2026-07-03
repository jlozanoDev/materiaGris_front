import { describe, it, expect, vi, beforeEach } from 'vitest';
import GetPendingReportsUseCase from '@/modules/dashboard/domain/use-cases/GetPendingReportsUseCase';
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
  };
}

describe('GetPendingReportsUseCase', () => {
  let repo: DashboardRepository;
  let useCase: GetPendingReportsUseCase;

  beforeEach(() => {
    repo = createMockRepo();
    useCase = new GetPendingReportsUseCase(repo);
  });

  it('returns all reports when count is under the limit', async () => {
    const reports = [
      { id: 1, patientName: 'Ana García', templateName: 'Informe General', createdAt: '2026-06-30T10:00:00' },
      { id: 2, patientName: 'Carlos López', templateName: 'Perfil Lipidico', createdAt: '2026-06-30T11:00:00' },
    ];
    (repo.getPendingReports as any).mockResolvedValue(reports);

    const result = await useCase.execute(5);

    expect(result).toHaveLength(2);
    expect(result).toEqual(reports);
    expect(repo.getPendingReports).toHaveBeenCalledWith(5);
  });

  it('caps at limit when more reports than limit exist', async () => {
    const reports = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      patientName: `Paciente ${i + 1}`,
      templateName: 'Plantilla A',
      createdAt: '2026-06-30T10:00:00',
    }));
    (repo.getPendingReports as any).mockResolvedValue(reports);

    const result = await useCase.execute(5);

    expect(result).toHaveLength(5);
  });

  it('returns empty array when no pending reports', async () => {
    (repo.getPendingReports as any).mockResolvedValue([]);

    const result = await useCase.execute(5);

    expect(result).toEqual([]);
  });
});
