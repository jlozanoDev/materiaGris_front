import type { PatientReport, ReportTemplate } from "@/shared/types";

export interface ReportRepository {
  initReport(patientId: string | number, templateId: string | number): Promise<PatientReport>;
  getAll(filters?: Record<string, unknown>): Promise<PatientReport[]>;
  getById(id: string | number): Promise<PatientReport>;
  saveDraft(id: string | number, values: Record<string, unknown>): Promise<PatientReport>;
  sign(id: string | number, signature: string): Promise<PatientReport>;
  close(id: string | number): Promise<PatientReport>;
  downloadPdf(id: string | number): Promise<Blob>;
  getActiveTemplates(): Promise<ReportTemplate[]>;
}
