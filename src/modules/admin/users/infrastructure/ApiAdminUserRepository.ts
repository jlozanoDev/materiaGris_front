import type { UserRepository } from "@/modules/admin/users/domain/repositories/UserRepository";
import { fetchClient } from "@/core/api/httpClient";

export default class ApiAdminUserRepository implements UserRepository {
  async all(): Promise<any> {
    try {
      return await fetchClient("/admin/users", { method: "GET" });
    } catch (err) {
      throw new Error("Error al obtener usuarios");
    }
  }

  async getById(id: number | string): Promise<any> {
    try {
      return await fetchClient(`/admin/users/${id}`, { method: "GET" });
    } catch (err) {
      throw new Error("Error al obtener usuario");
    }
  }

  async create(payload: Record<string, unknown>): Promise<any> {
    try {
      return await fetchClient("/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al crear usuario");
    }
  }

  async update(id: number | string, payload: Record<string, unknown>): Promise<any> {
    try {
      return await fetchClient(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al actualizar usuario");
    }
  }

  async delete(id: number | string): Promise<any> {
    try {
      return await fetchClient(`/admin/users/${id}`, { method: "DELETE" });
    } catch (err) {
      throw new Error("Error al eliminar usuario");
    }
  }
}
