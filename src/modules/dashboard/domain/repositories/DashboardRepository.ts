import type { DateRange } from '@/modules/dashboard/domain/entities/types';
import type { WeatherData } from '@/modules/dashboard/domain/entities/WeatherData';

export interface DashboardRepository {
  getStats(range: DateRange): Promise<{ data: any[] }>;
  getRecentPatients(range: DateRange): Promise<any[]>;
  getPendingReports(limit: number): Promise<any[]>;
  getSystemMetrics(): Promise<{ totalUsers: number }>;
  getPatientsCount(): Promise<number>;
  getTemplatesCount(): Promise<number>;
  getReportsByStatus(status: string): Promise<number>;
  getWeather(lat: number, lon: number): Promise<WeatherData>;
}
