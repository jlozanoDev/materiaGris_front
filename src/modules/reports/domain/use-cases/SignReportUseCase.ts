import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";

export default class SignReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(id: string | number, signature: string): Promise<any> {
    if (!signature || signature.trim().length === 0) {
      throw new Error("La firma es obligatoria para firmar el informe");
    }
    return this.reportRepository.sign(id, signature);
  }
}
