import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";

export default class GetReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(id: string | number): Promise<any> {
    return this.reportRepository.getById(id);
  }
}
