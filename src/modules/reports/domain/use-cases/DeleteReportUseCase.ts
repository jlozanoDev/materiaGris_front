import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";

export default class DeleteReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(id: string | number): Promise<void> {
    return this.reportRepository.delete(id);
  }
}
