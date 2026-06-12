import type { ReportTemplateRepository } from "@/modules/admin/report-template/domain/repositories/ReportTemplateRepository";

export default class GetReportTemplatesUseCase {
  constructor(private readonly repository: ReportTemplateRepository) {}

  async execute(): Promise<any> {
    return this.repository.getAll();
  }
}
