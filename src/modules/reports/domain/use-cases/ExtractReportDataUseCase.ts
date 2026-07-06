import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";
import type { LLMExtractionResult } from "@/modules/reports/domain/entities/AIProcessing";

export default class ExtractReportDataUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(
    reportId: string | number,
    transcript: string,
    templateId: string | number,
  ): Promise<LLMExtractionResult> {
    if (!transcript || transcript.trim().length === 0) {
      throw new Error("La transcripción no puede estar vacía");
    }

    return this.reportRepository.extractData(reportId, transcript, templateId);
  }
}
