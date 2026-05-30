import type { AdminUser } from "@/shared/types";

export interface UserRepository {
  all(): Promise<AdminUser[]>;
  getById(id: number | string): Promise<AdminUser>;
  create(payload: Record<string, unknown>): Promise<AdminUser>;
  update(id: number | string, payload: Record<string, unknown>): Promise<AdminUser>;
  delete(id: number | string): Promise<any>;
}
