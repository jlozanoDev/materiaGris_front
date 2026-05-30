import type { PermissionShape } from "@/shared/types";

export interface PermissionRepository {
  all(): Promise<PermissionShape[]>;
}
