import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";

export default class DownloadReportPdfUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(id: string | number): Promise<Blob> {
    return this.reportRepository.downloadPdf(id);
  }
}
