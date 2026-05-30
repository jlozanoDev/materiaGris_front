import type { PermissionRepository } from "@/modules/admin/permissions/domain/repositories/PermissionRepository";
import { fetchClient } from "@/core/api/httpClient";

export default class ApiPermissionRepository implements PermissionRepository {
  async all(): Promise<any> {
    try {
      return await fetchClient("/admin/permissions", { method: "GET" });
    } catch (err) {
      throw new Error("Error al obtener los permisos");
    }
  }
}
