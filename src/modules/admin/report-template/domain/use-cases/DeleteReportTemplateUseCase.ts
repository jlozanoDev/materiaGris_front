import type { ReportTemplateRepository } from "@/modules/admin/report-template/domain/repositories/ReportTemplateRepository";

export default class DeleteReportTemplateUseCase {
  constructor(private readonly repository: ReportTemplateRepository) {}

  async execute(id: number | string): Promise<any> {
    try {
      return await this.repository.delete(id);
    } catch (err: any) {
      if (err && err.status === 409) {
        throw new Error("No se puede eliminar: existen informes asociados");
      }
      throw err;
    }
  }
}
