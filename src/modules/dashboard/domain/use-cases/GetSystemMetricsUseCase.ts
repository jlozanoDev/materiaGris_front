import type { DashboardRepository } from '@/modules/dashboard/domain/repositories/DashboardRepository';

export interface SystemMetrics {
  totalUsers: number;
}

export default class GetSystemMetricsUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(): Promise<SystemMetrics> {
    const metrics = await this.dashboardRepository.getSystemMetrics();
    return { totalUsers: metrics.total };
  }
}
