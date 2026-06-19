import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";
import type { ReportTemplate } from "@/shared/types";
import { fetchClient } from "@/core/api/httpClient";

export default class ApiReportRepository implements ReportRepository {
  async initReport(patientId: string | number, templateId: string | number): Promise<any> {
    try {
      return await fetchClient("/reports", {
        method: "POST",
        body: JSON.stringify({
          patient_id: patientId,
          template_id: templateId,
        }),
      });
    } catch (err: any) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al iniciar el informe");
    }
  }

  async getAll(filters?: Record<string, unknown>): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });
      }
      const query = params.toString();
      const url = query ? `/reports?${query}` : "/reports";
      return await fetchClient(url, { method: "GET" });
    } catch (err) {
      throw new Error("Error al obtener informes");
    }
  }

  async getById(id: string | number): Promise<any> {
    try {
      return await fetchClient(`/reports/${id}`, { method: "GET" });
    } catch (err) {
      throw new Error("Error al obtener el informe");
    }
  }

  async saveDraft(id: string | number, values: Record<string, unknown>): Promise<any> {
    try {
      return await fetchClient(`/reports/${id}`, {
        method: "PUT",
        body: JSON.stringify({ values }),
      });
    } catch (err: any) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al guardar el borrador");
    }
  }

  async sign(id: string | number, signature: string): Promise<any> {
    try {
      return await fetchClient(`/reports/${id}/sign`, {
        method: "POST",
        body: JSON.stringify({ signature }),
      });
    } catch (err: any) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al firmar el informe");
    }
  }

  async close(id: string | number): Promise<any> {
    try {
      return await fetchClient(`/reports/${id}/close`, {
        method: "POST",
      });
    } catch (err) {
      throw new Error("Error al cerrar el informe");
    }
  }

  async getActiveTemplates(): Promise<ReportTemplate[]> {
    try {
      return await fetchClient("/templates/active", { method: "GET" });
    } catch {
      throw new Error("Error al obtener las plantillas activas");
    }
  }

  async downloadPdf(id: string | number): Promise<Blob> {
    try {
      return await fetchClient(`/reports/${id}/pdf`, {
        method: "GET",
        headers: { Accept: "application/pdf" },
      });
    } catch (err) {
      throw new Error("Error al generar el PDF. Intente nuevamente.");
    }
  }
}
