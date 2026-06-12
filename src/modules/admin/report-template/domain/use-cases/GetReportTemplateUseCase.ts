import type { ReportTemplateRepository } from "@/modules/admin/report-template/domain/repositories/ReportTemplateRepository";

export default class GetReportTemplateUseCase {
  constructor(private readonly repository: ReportTemplateRepository) {}

  async execute(id: number | string): Promise<any> {
    return this.repository.getById(id);
  }
}
