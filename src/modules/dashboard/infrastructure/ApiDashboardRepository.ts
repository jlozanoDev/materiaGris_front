import { fetchClient } from "@/core/api/httpClient";
import type { DashboardRepository } from "@/modules/dashboard/domain/repositories/DashboardRepository";
import type { DateRange } from "@/modules/dashboard/domain/entities/types";
import type { PendingReport } from "@/modules/dashboard/domain/entities/PendingReport";

export default class ApiDashboardRepository implements DashboardRepository {
  async getStats(range: DateRange): Promise<{ data: any[] }> {
    const patients = await this.fetchPatients(range);
    return { data: patients };
  }

  async getRecentPatients(range: DateRange): Promise<any[]> {
    return this.fetchPatients(range);
  }

  async getPendingReports(limit: number): Promise<PendingReport[]> {
    const res = await fetchClient("/reports?status=draft");
    const raw = Array.isArray(res) ? res : res?.data ?? [];
    return raw.map(this.toPendingReport);
  }

  private toPendingReport(raw: any): PendingReport {
    return {
      id: raw.id,
      patientName: raw.patient_name ?? raw.patientName ?? "",
      templateName: raw.template_name ?? raw.templateName ?? "",
      createdAt: raw.created_at ?? raw.createdAt ?? "",
    };
  }

  async getSystemMetrics(): Promise<{ total: number }> {
    const res = await fetchClient("/admin/users");
    const users = Array.isArray(res) ? res : res?.data ?? [];
    return { total: users.length };
  }

  private async fetchPatients(range: DateRange): Promise<any[]> {
    const params = new URLSearchParams({
      last_visit_from: range.from,
      last_visit_to: range.to,
    });
    const res = await fetchClient(`/patients/find?${params.toString()}`);
    return Array.isArray(res) ? res : res?.data ?? [];
  }
}
