export type DashboardRole = 'admin' | 'doctor' | 'none';

export interface DateRange {
  from: string; // ISO 8601
  to: string;   // ISO 8601
}
