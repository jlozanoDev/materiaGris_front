import { fetchClient } from "@/core/api/httpClient";
import type { DashboardRepository } from "@/modules/dashboard/domain/repositories/DashboardRepository";
import type { DateRange } from "@/modules/dashboard/domain/entities/types";
import type { WeatherData } from "@/modules/dashboard/domain/entities/WeatherData";
import type { PendingReport } from "@/modules/dashboard/domain/entities/PendingReport";
import { wmoCodeMapper } from "@/shared/utils/wmoCodeMapper";

export default class ApiDashboardRepository implements DashboardRepository {
  async getStats(range: DateRange): Promise<{ data: any[] }> {
    const patients = await this.fetchPatients(range);
    return { data: patients };
  }

  async getRecentPatients(_range: DateRange): Promise<any[]> {
    const res = await fetchClient("/patients/find", { ignoreForbidden: true });
    const patients = Array.isArray(res) ? res : res?.data ?? [];
    return patients
      .filter((p: any) => p.created_at)
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);
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

  async getSystemMetrics(): Promise<{ totalUsers: number }> {
    const res = await fetchClient("/admin/users");
    const users = Array.isArray(res) ? res : res?.data ?? [];
    return { totalUsers: users.length };
  }

  async getPatientsCount(): Promise<number> {
    const res = await fetchClient("/patients/find", { ignoreForbidden: true });
    const patients = Array.isArray(res) ? res : res?.data ?? [];
    return patients.length;
  }

  async getTemplatesCount(): Promise<number> {
    const res = await fetchClient("/templates/active", { ignoreForbidden: true });
    const templates = Array.isArray(res) ? res : res?.data ?? [];
    return templates.length;
  }

  async getReportsByStatus(status: string): Promise<number> {
    const res = await fetchClient(`/reports?status=${status}`, { ignoreForbidden: true });
    const reports = Array.isArray(res) ? res : res?.data ?? [];
    return reports.length;
  }

  async getWeather(lat: number, lon: number): Promise<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`Open-Meteo responded with status ${response.status}`);
      }

      const data = await response.json();
      const current = data.current;
      const temperature = Math.round(current.temperature_2m);
      const wmoCode = current.weather_code;
      const mapped = wmoCodeMapper(wmoCode);

      return {
        temperature,
        description: mapped.description,
        wmoCode,
        iconName: mapped.iconName,
      };
    } finally {
      clearTimeout(timeoutId);
    }
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
