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
