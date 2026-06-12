import type { ReportTemplateRepository } from "@/modules/admin/report-template/domain/repositories/ReportTemplateRepository";

export default class UpdateReportTemplateUseCase {
  constructor(private readonly repository: ReportTemplateRepository) {}

  async execute(id: number | string, data: Record<string, unknown>): Promise<any> {
    return this.repository.update(id, data);
  }
}
