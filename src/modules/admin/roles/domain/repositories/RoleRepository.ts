import type { Role } from "@/shared/types";

export interface RoleRepository {
  all(): Promise<Role[]>;
  getById(id: number | string): Promise<Role>;
  create(payload: Record<string, unknown>): Promise<Role>;
  update(id: number | string, payload: Record<string, unknown>): Promise<Role>;
  delete(id: number | string): Promise<any>;
}
