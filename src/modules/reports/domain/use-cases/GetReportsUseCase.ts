import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";

export default class GetReportsUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(filters?: Record<string, unknown>): Promise<any> {
    return this.reportRepository.getAll(filters);
  }
}
