import UserRepository from "@/shared/repositories/UserRepository";
import { fetchClient } from "@/core/api/httpClient";

export default class ApiUserRepository extends UserRepository {
  async login(credentials) {
    try {
      return await fetchClient("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    } catch (err) {
      if (err && err.status === 401) throw err;
      if (err && err.body) throw new Error(err.body.message || "Error en el login");
      throw err;
    }
  }

  async forgot(email) {
    try {
      const data = await fetchClient("/auth/forgot", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return { status: 200, data };
    } catch (err) {
      if (err && err.status) return { status: err.status, data: err.body };
      throw err;
    }
  }

  async me() {
    return await fetchClient("/auth/me", { method: "GET", ignoreUnauthorized: true });
  }

  async all() {
    try {
      return await fetchClient("/admin/users", { method: "GET" });
    } catch (err) {
      throw new Error("Error al obtener usuarios");
    }
  }

  async getById(id) {
    try {
      return await fetchClient(`/admin/users/${id}`, { method: "GET" });
    } catch (err) {
      throw new Error("Error al obtener usuario");
    }
  }

  async create(payload) {
    try {
      return await fetchClient("/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al crear usuario");
    }
  }

  async update(id, payload) {
    try {
      return await fetchClient(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (err && err.status === 422) throw err;
      throw new Error("Error al actualizar usuario");
    }
  }

  async delete(id) {
    try {
      return await fetchClient(`/admin/users/${id}`, { method: "DELETE" });
    } catch (err) {
      throw new Error("Error al eliminar usuario");
    }
  }

  async logout() {
    return fetchClient("/auth/logout", { method: "POST", ignoreUnauthorized: true });
  }

  async refresh() {
    return await fetchClient("/auth/refresh", { method: "POST", ignoreUnauthorized: true });
  }

  async reset(email, token, password, passwordConfirmation) {
    return fetchClient("/auth/reset", {
      method: "POST",
      ignoreUnauthorized: true,
      body: JSON.stringify({ email, token, password, password_confirmation: passwordConfirmation }),
    });
  }
}
