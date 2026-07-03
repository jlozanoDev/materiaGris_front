import type { DashboardRepository } from '@/modules/dashboard/domain/repositories/DashboardRepository';
import type { DateRange } from '@/modules/dashboard/domain/entities/types';
import type { PatientSummary } from '@/modules/dashboard/domain/entities/PatientSummary';

export default class GetRecentPatientsUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(range: DateRange): Promise<PatientSummary[]> {
    const patients = await this.dashboardRepository.getRecentPatients(range);
    return patients.map(this.toPatientSummary);
  }

  private toPatientSummary(apiPatient: any): PatientSummary {
    const firstName = apiPatient.first_name ?? '';
    const lastName = apiPatient.last_name ?? '';

    let timeLabel = '';
    if (apiPatient.created_at) {
      const date = new Date(apiPatient.created_at);
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      if (isToday) {
        timeLabel = date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      } else {
        timeLabel = date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
        });
      }
    }

    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

    return {
      id: apiPatient.id,
      name: `${firstName} ${lastName}`.trim(),
      timeLabel,
      initials,
    };
  }
}
