import type { PatientReport, ReportTemplate } from "@/shared/types";
import type { TranscriptionResult, LLMExtractionResult } from "@/modules/reports/domain/entities/AIProcessing";

export interface TranscribeOptions {
  diarization?: boolean;
  language?: string;
}

export interface ReportRepository {
  initReport(patientId: string | number, templateId: string | number): Promise<PatientReport>;
  getAll(filters?: Record<string, unknown>): Promise<PatientReport[]>;
  getById(id: string | number): Promise<PatientReport>;
  saveDraft(id: string | number, values: Record<string, unknown>): Promise<PatientReport>;
  sign(id: string | number, signature: string): Promise<PatientReport>;
  archive(id: string | number): Promise<PatientReport>;
  delete(id: string | number): Promise<void>;
  downloadPdf(id: string | number): Promise<Blob>;
  getActiveTemplates(): Promise<ReportTemplate[]>;

  /** Send audio blob for transcription via POST /reports/{id}/transcribe */
  transcribe(
    reportId: string | number,
    formData: FormData,
    options?: TranscribeOptions,
  ): Promise<TranscriptionResult>;

  /** Extract structured data from transcription via POST /reports/{id}/extract-data */
  extractData(
    reportId: string | number,
    transcript: string,
    templateId: string | number,
  ): Promise<LLMExtractionResult>;
}
