import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";

export default class InitReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(patientId: string | number, templateId: string | number): Promise<any> {
    return this.reportRepository.initReport(patientId, templateId);
  }
}
