import type { DashboardRepository } from '@/modules/dashboard/domain/repositories/DashboardRepository';
import type { DateRange } from '@/modules/dashboard/domain/entities/types';
import type { DashboardStats } from '@/modules/dashboard/domain/entities/DashboardStats';

export default class GetDashboardStatsUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(range: DateRange): Promise<DashboardStats> {
    const response = await this.dashboardRepository.getStats(range);
    const patients = response.data ?? [];

    const rangeStart = new Date(range.from);
    const rangeEnd = new Date(range.to);

    let newPatients = 0;
    let returningPatients = 0;

    for (const patient of patients) {
      if (!patient.created_at) {
        returningPatients++;
      } else {
        const createdAt = new Date(patient.created_at);
        if (createdAt >= rangeStart && createdAt <= rangeEnd) {
          newPatients++;
        } else {
          returningPatients++;
        }
      }
    }

    return {
      visits: patients.length,
      newPatients,
      returningPatients,
    };
  }
}
