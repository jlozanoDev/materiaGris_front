import type { ReportTemplateRepository } from "@/modules/admin/report-template/domain/repositories/ReportTemplateRepository";

export default class CreateReportTemplateUseCase {
  constructor(private readonly repository: ReportTemplateRepository) {}

  async execute(data: Record<string, unknown>): Promise<any> {
    return this.repository.create(data);
  }
}
