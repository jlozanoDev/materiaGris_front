import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";
import type { ReportTemplate } from "@/shared/types";

export default class GetActiveTemplatesUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(): Promise<ReportTemplate[]> {
    return this.reportRepository.getActiveTemplates();
  }
}
