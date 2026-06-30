import type { DateRange } from '@/modules/dashboard/domain/entities/types';

export interface DashboardRepository {
  getStats(range: DateRange): Promise<{ data: any[] }>;
  getRecentPatients(range: DateRange): Promise<any[]>;
  getPendingReports(limit: number): Promise<any[]>;
  getSystemMetrics(): Promise<{ total: number }>;
}
