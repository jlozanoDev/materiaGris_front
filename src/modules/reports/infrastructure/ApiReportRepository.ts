import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";
import type { ReportTemplate } from "@/shared/types";
import { fetchClient } from "@/core/api/httpClient";

export default class ApiReportRepository implements ReportRepository {
  /**
   * Normalize snake_case API response keys to camelCase (PatientReport shape).
   * Unknown keys pass through unchanged.
   */
  private normalizeReport(raw: Record<string, unknown>): Record<string, unknown> {
    const KEY_MAP: Record<string, string> = {
      template_structure_snapshot: "templateStructureSnapshot",
      patient_id: "patientId",
      template_id: "templateId",
      user_id: "userId",
      created_at: "createdAt",
      updated_at: "updatedAt",
    };
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
      result[KEY_MAP[k] ?? k] = v;
    }
    return result;
  }

  async initReport(patientId: string | number, templateId: string | number): Promise<any> {
    try {
      const raw = await fetchClient("/reports", {
        method: "POST",
        body: JSON.stringify({
          patient_id: patientId,
          template_id: templateId,
        }),
      });
      return this.normalizeReport(raw);
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
      const raw = await fetchClient(url, { method: "GET" });
      if (Array.isArray(raw)) {
        return raw.map((item) => this.normalizeReport(item));
      }
      return raw;
    } catch (err) {
      throw new Error("Error al obtener informes");
    }
  }

  async getById(id: string | number): Promise<any> {
    try {
      const raw = await fetchClient(`/reports/${id}`, { method: "GET" });
      return this.normalizeReport(raw);
    } catch (err) {
      throw new Error("Error al obtener el informe");
    }
  }

  async saveDraft(id: string | number, values: Record<string, unknown>): Promise<any> {
    try {
      const raw = await fetchClient(`/reports/${id}`, {
        method: "PUT",
        body: JSON.stringify({ values }),
      });
      return this.normalizeReport(raw);
    } catch (err: any) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al guardar el borrador");
    }
  }

  async sign(id: string | number, signature: string): Promise<any> {
    try {
      const raw = await fetchClient(`/reports/${id}/sign`, {
        method: "POST",
        body: JSON.stringify({ signature }),
      });
      return this.normalizeReport(raw);
    } catch (err: any) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al firmar el informe");
    }
  }

  async close(id: string | number): Promise<any> {
    try {
      const raw = await fetchClient(`/reports/${id}/close`, {
        method: "POST",
      });
      return this.normalizeReport(raw);
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

  async delete(id: string | number): Promise<void> {
    try {
      await fetchClient(`/reports/${id}`, { method: "DELETE" });
    } catch (err) {
      throw new Error("Error al eliminar el informe");
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
