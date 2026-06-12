import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";

export default class SaveReportDraftUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(id: string | number, values: Record<string, unknown>): Promise<any> {
    return this.reportRepository.saveDraft(id, values);
  }
}
