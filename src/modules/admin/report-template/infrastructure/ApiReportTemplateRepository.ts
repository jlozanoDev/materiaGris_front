import type { ReportTemplateRepository } from "@/modules/admin/report-template/domain/repositories/ReportTemplateRepository";
import { fetchClient } from "@/core/api/httpClient";

export default class ApiReportTemplateRepository implements ReportTemplateRepository {
  async getAll(): Promise<any> {
    try {
      const res = await fetchClient("/admin/report-templates", { method: "GET" });
      const items = Array.isArray(res) ? res : res?.data ?? [];
      return items.map((item: any) => ({
        ...item,
        isActive: !!(item.isActive ?? item.is_active),
      }));
    } catch (err) {
      throw new Error("Error al obtener plantillas de informe");
    }
  }

  async getById(id: number | string): Promise<any> {
    try {
      return await fetchClient(`/admin/report-templates/${id}`, { method: "GET" });
    } catch (err) {
      throw new Error("Error al obtener plantilla de informe");
    }
  }

  async create(data: Record<string, unknown>): Promise<any> {
    try {
      return await fetchClient("/admin/report-templates", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al crear plantilla de informe");
    }
  }

  async update(id: number | string, data: Record<string, unknown>): Promise<any> {
    try {
      return await fetchClient(`/admin/report-templates/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al actualizar plantilla de informe");
    }
  }

  async delete(id: number | string): Promise<any> {
    try {
      return await fetchClient(`/admin/report-templates/${id}`, { method: "DELETE" });
    } catch (err) {
      if ((err as any)?.status === 409) throw err;
      throw new Error("Error al eliminar plantilla de informe");
    }
  }
}
