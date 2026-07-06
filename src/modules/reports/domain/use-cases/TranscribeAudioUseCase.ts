import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";
import type { TranscriptionResult } from "@/modules/reports/domain/entities/AIProcessing";

export interface TranscribeInput {
  diarization?: boolean;
  language?: string;
}

export default class TranscribeAudioUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(
    reportId: string | number,
    audioBlob: Blob,
    options?: TranscribeInput,
  ): Promise<TranscriptionResult> {
    if (audioBlob.size === 0 || audioBlob.size === undefined) {
      throw new Error("El archivo de audio está vacío");
    }

    const formData = new FormData();
    formData.append("audio", audioBlob);

    if (options?.diarization) {
      formData.append("diarization", String(options.diarization));
    }
    if (options?.language) {
      formData.append("language", options.language);
    }

    return this.reportRepository.transcribe(reportId, formData, options);
  }
}
