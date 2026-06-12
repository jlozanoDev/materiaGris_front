import type { ReportTemplate } from "@/shared/types";

export interface ReportTemplateRepository {
  getAll(): Promise<ReportTemplate[]>;
  getById(id: number | string): Promise<ReportTemplate>;
  create(data: Record<string, unknown>): Promise<ReportTemplate>;
  update(id: number | string, data: Record<string, unknown>): Promise<ReportTemplate>;
  delete(id: number | string): Promise<any>;
}
