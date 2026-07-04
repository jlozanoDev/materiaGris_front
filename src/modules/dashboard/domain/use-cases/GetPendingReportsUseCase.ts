import type { DashboardRepository } from '@/modules/dashboard/domain/repositories/DashboardRepository';
import type { PendingReport } from '@/modules/dashboard/domain/entities/PendingReport';

export default class GetPendingReportsUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(limit: number): Promise<PendingReport[]> {
    const reports = await this.dashboardRepository.getPendingReports(limit);
    return reports.slice(0, limit);
  }
}
