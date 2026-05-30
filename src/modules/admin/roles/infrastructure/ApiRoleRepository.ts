import type { RoleRepository } from "@/modules/admin/roles/domain/repositories/RoleRepository";
import { fetchClient } from "@/core/api/httpClient";

export default class ApiRoleRepository implements RoleRepository {
  async all(): Promise<any> {
    try {
      return await fetchClient("/admin/roles", { method: "GET" });
    } catch (err) {
      throw new Error("Error al obtener roles");
    }
  }

  async getById(id: number | string): Promise<any> {
    try {
      return await fetchClient(`/admin/roles/${id}`, { method: "GET" });
    } catch (err) {
      throw new Error("Error al obtener rol");
    }
  }

  async create(payload: Record<string, unknown>): Promise<any> {
    try {
      return await fetchClient("/admin/roles", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al crear rol");
    }
  }

  async update(id: number | string, payload: Record<string, unknown>): Promise<any> {
    try {
      return await fetchClient(`/admin/roles/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al actualizar rol");
    }
  }

  async delete(id: number | string): Promise<any> {
    try {
      return await fetchClient(`/admin/roles/${id}`, { method: "DELETE" });
    } catch (err) {
      throw new Error("Error al eliminar rol");
    }
  }
}
