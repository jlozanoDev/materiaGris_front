import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";

export default class ArchiveReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(id: string | number, pdfBlob?: Blob): Promise<any> {
    return this.reportRepository.archive(id, pdfBlob);
  }
}
