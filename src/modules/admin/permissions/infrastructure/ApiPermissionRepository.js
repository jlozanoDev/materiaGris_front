import PermissionRepository from "@/shared/repositories/PermissionRepository";
import { fetchClient } from "@/core/api/httpClient";

export default class ApiPermissionRepository extends PermissionRepository {
  async all() {
    try {
      return await fetchClient("/admin/permissions", { method: "GET" });
    } catch (err) {
      throw new Error("Error al obtener los permisos");
    }
  }
}
