import type { DashboardRepository } from '@/modules/dashboard/domain/repositories/DashboardRepository';

export interface SystemMetrics {
  totalUsers: number;
  totalPatients: number | null;
  totalPendingReports: number | null;
  totalSignedReports: number | null;
  totalArchivedReports: number | null;
  totalTemplates: number | null;
}

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export default class GetSystemMetricsUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(): Promise<SystemMetrics> {
    const repo = this.dashboardRepository;

    const [totalUsers, totalPatients, totalPendingReports, totalSignedReports, totalArchivedReports, totalTemplates] =
      await Promise.all([
        safe(() => repo.getSystemMetrics()).then((m) => m?.totalUsers ?? 0),
        safe(() => repo.getPatientsCount()),
        safe(() => repo.getReportsByStatus('draft')),
        safe(() => repo.getReportsByStatus('signed')),
        safe(() => repo.getReportsByStatus('archived')),
        safe(() => repo.getTemplatesCount()),
      ]);

    return {
      totalUsers,
      totalPatients,
      totalPendingReports,
      totalSignedReports,
      totalArchivedReports,
      totalTemplates,
    };
  }
}
